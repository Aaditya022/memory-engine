package com.mnemo.memoryengine.memory;

import com.mnemo.memoryengine.actionitem.ActionItem;
import com.mnemo.memoryengine.actionitem.ActionItemRepository;
import com.mnemo.memoryengine.cognee.kafka.CogneeEventProducer;
import com.mnemo.memoryengine.cognee.kafka.event.CogneeImproveEvent;
import com.mnemo.memoryengine.cognee.kafka.event.CogneeRememberEvent;
import com.mnemo.memoryengine.decision.Decision;
import com.mnemo.memoryengine.decision.DecisionRepository;
import com.mnemo.memoryengine.embedding.EmbeddingService;
import com.mnemo.memoryengine.extraction.ExtractionService;
import com.mnemo.memoryengine.meeting.Meeting;
import com.mnemo.memoryengine.organization.Organization;
import com.mnemo.memoryengine.transcript.Transcript;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Converts extraction output (entities + relationships) plus raw transcript text
 * into structured Memory rows, and specialised ActionItem / Decision rows.
 * Every persisted memory is embedded immediately so it's searchable right away.
 */
@Service
public class MemoryBuilderService {

    private static final Pattern DECISION_PATTERN = Pattern.compile(
            "(?im)^.*\\b(approved|decided|we will go with|agreed to|finalized|signed off)\\b.*$");

    private final MemoryRepository memoryRepository;
    private final ActionItemRepository actionItemRepository;
    private final DecisionRepository decisionRepository;
    private final EmbeddingService embeddingService;
    private final CogneeEventProducer eventProducer;

    public MemoryBuilderService(MemoryRepository memoryRepository,
                                 ActionItemRepository actionItemRepository,
                                 DecisionRepository decisionRepository,
                                 EmbeddingService embeddingService,
                                 CogneeEventProducer eventProducer) {
        this.memoryRepository = memoryRepository;
        this.actionItemRepository = actionItemRepository;
        this.decisionRepository = decisionRepository;
        this.embeddingService = embeddingService;
        this.eventProducer = eventProducer;
    }

    public void buildFromAssignments(Organization org, Meeting meeting,
                                      List<ExtractionService.CandidateRelationship> relationships) {
        for (ExtractionService.CandidateRelationship rel : relationships) {
            if ("assigned".equals(rel.relationship())) {
                String content = rel.source() + " committed to: " + rel.target();
                Memory memory = persistMemory(org, meeting, MemoryType.COMMITMENT, content, rel.source(), new BigDecimal("0.70"));

                ActionItem item = new ActionItem();
                item.setOrganization(org);
                item.setMeeting(meeting);
                item.setMemory(memory);
                item.setOwnerName(rel.source());
                item.setTask(rel.target());
                actionItemRepository.save(item);

                eventProducer.publishImproveEvent(new CogneeImproveEvent(
                        memory.getId(), memory.getContent(), memory.getMemoryType().name(),
                        memory.getOwnerName(), memory.getConfidence(), memory.getImportanceScore(),
                        memory.getOrganization().getId(), memory.getMeeting().getId()));
            } else if ("owns".equals(rel.relationship())) {
                String content = rel.source() + " owns: " + rel.target();
                persistMemory(org, meeting, MemoryType.FACT, content, rel.source(), new BigDecimal("0.75"));
            }
        }
    }

    public void buildDecisions(Organization org, Meeting meeting, String rawText) {
        Matcher matcher = DECISION_PATTERN.matcher(rawText);
        while (matcher.find()) {
            String line = matcher.group().trim();
            String owner = guessSpeakerForLine(rawText, matcher.start());

            Memory memory = persistMemory(org, meeting, MemoryType.DECISION, line, owner, new BigDecimal("0.85"));

            Decision decision = new Decision();
            decision.setOrganization(org);
            decision.setMeeting(meeting);
            decision.setMemory(memory);
            decision.setDecisionText(line);
            decision.setDecisionMaker(owner);
            decision.setDecidedAt(Instant.now());
            decisionRepository.save(decision);

            eventProducer.publishImproveEvent(new CogneeImproveEvent(
                    memory.getId(), memory.getContent(), memory.getMemoryType().name(),
                    memory.getOwnerName(), memory.getConfidence(), memory.getImportanceScore(),
                    memory.getOrganization().getId(), memory.getMeeting().getId()));
        }
    }

    /** Persists one memory row and immediately embeds it for semantic search. */
    private Memory persistMemory(Organization org, Meeting meeting, MemoryType type,
                                  String content, String owner, BigDecimal confidence) {
        Memory memory = new Memory();
        memory.setOrganization(org);
        memory.setMeeting(meeting);
        memory.setMemoryType(type);
        memory.setContent(content);
        memory.setOwnerName(owner);
        memory.setConfidence(confidence);
        memory.setImportanceScore(computeImportance(type, confidence));
        memory = memoryRepository.save(memory);

        embeddingService.embedAndStoreMemory(memory.getId(), content);

        eventProducer.publishRememberEvent(new CogneeRememberEvent(
                memory.getId(), memory.getContent(), memory.getMemoryType().name(),
                memory.getOwnerName(), memory.getConfidence(), memory.getImportanceScore(),
                memory.getOrganization().getId(), memory.getMeeting().getId()));

        return memory;
    }

    private BigDecimal computeImportance(MemoryType type, BigDecimal confidence) {
        // Decisions and commitments are weighted higher than passive facts/discussion.
        BigDecimal base = switch (type) {
            case DECISION -> new BigDecimal("0.9");
            case ACTION_ITEM, COMMITMENT -> new BigDecimal("0.75");
            case FACT -> new BigDecimal("0.5");
            case DISCUSSION -> new BigDecimal("0.3");
        };
        return base.multiply(confidence).setScale(3, java.math.RoundingMode.HALF_UP);
    }

    /** Walks backwards from a match to find the nearest "Name:" speaker label. */
    private String guessSpeakerForLine(String text, int matchIndex) {
        String before = text.substring(0, matchIndex);
        Matcher m = Pattern.compile("(?m)^\\s*([A-Z][a-zA-Z]+(?:\\s[A-Z][a-zA-Z]+)?)\\s*:\\s*$").matcher(before);
        String last = null;
        while (m.find()) {
            last = m.group(1);
        }
        return last;
    }
}
