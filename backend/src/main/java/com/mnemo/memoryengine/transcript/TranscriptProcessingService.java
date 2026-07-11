package com.mnemo.memoryengine.transcript;

import com.mnemo.memoryengine.cognee.kafka.CogneeEventProducer;
import com.mnemo.memoryengine.cognee.kafka.event.CogneeImproveEvent;
import com.mnemo.memoryengine.extraction.EntityRelationship;
import com.mnemo.memoryengine.extraction.EntityRelationshipRepository;
import com.mnemo.memoryengine.extraction.ExtractedEntity;
import com.mnemo.memoryengine.extraction.ExtractedEntityRepository;
import com.mnemo.memoryengine.extraction.ExtractionService;
import com.mnemo.memoryengine.meeting.Meeting;
import com.mnemo.memoryengine.memory.MemoryBuilderService;
import com.mnemo.memoryengine.notification.NotificationService;
import com.mnemo.memoryengine.notification.dto.NotificationEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

/**
 * Orchestrates the full ingestion pipeline described in the PRD:
 *   transcript -> entity extraction -> knowledge graph -> memory builder -> embeddings
 *
 * Runs @Async so the ingest API responds immediately (202-style UX) while
 * processing happens in the background. In a Kafka-backed deployment this
 * method body becomes the consumer for a "transcript.uploaded" topic instead —
 * the pipeline logic itself does not change, only the trigger mechanism.
 */
@Service
public class TranscriptProcessingService {

    private static final Logger log = LoggerFactory.getLogger(TranscriptProcessingService.class);

    private final TranscriptRepository transcriptRepository;
    private final ExtractionService extractionService;
    private final ExtractedEntityRepository extractedEntityRepository;
    private final EntityRelationshipRepository entityRelationshipRepository;
    private final MemoryBuilderService memoryBuilderService;
    private final CogneeEventProducer eventProducer;
    private final NotificationService notificationService;

    public TranscriptProcessingService(TranscriptRepository transcriptRepository,
                                        ExtractionService extractionService,
                                        ExtractedEntityRepository extractedEntityRepository,
                                        EntityRelationshipRepository entityRelationshipRepository,
                                        MemoryBuilderService memoryBuilderService,
                                        CogneeEventProducer eventProducer,
                                        NotificationService notificationService) {
        this.transcriptRepository = transcriptRepository;
        this.extractionService = extractionService;
        this.extractedEntityRepository = extractedEntityRepository;
        this.entityRelationshipRepository = entityRelationshipRepository;
        this.memoryBuilderService = memoryBuilderService;
        this.eventProducer = eventProducer;
        this.notificationService = notificationService;
    }

    @Async
    @Transactional
    public void process(Transcript transcript) {
        UUID orgId = transcript.getMeeting().getOrganization().getId();
        UUID meetingId = transcript.getMeeting().getId();

        try {
            notificationService.broadcast(orgId, NotificationEvent.transcriptProcessing(transcript.getId()));

            Meeting meeting = transcript.getMeeting();
            var result = extractionService.extract(transcript.getRawText());

            result.entities().forEach(candidate ->
                    extractedEntityRepository.save(new ExtractedEntity(
                            transcript, meeting, candidate.type(), candidate.value(), candidate.mentionCount())));

            result.relationships().forEach(rel -> {
                EntityRelationship er = new EntityRelationship();
                er.setOrganization(meeting.getOrganization());
                er.setSourceEntity(rel.source());
                er.setRelationship(rel.relationship());
                er.setTargetEntity(rel.target());
                er.setMeeting(meeting);
                entityRelationshipRepository.save(er);
            });

            memoryBuilderService.buildFromAssignments(meeting.getOrganization(), meeting, result.relationships());
            memoryBuilderService.buildDecisions(meeting.getOrganization(), meeting, transcript.getRawText());

            eventProducer.publishImproveEvent(new CogneeImproveEvent(
                    null, transcript.getRawText(), "DISCUSSION", null, null, null, orgId, meetingId));

            transcript.setProcessed(true);
            transcript.setProcessedAt(Instant.now());
            transcriptRepository.save(transcript);

            notificationService.broadcast(orgId, NotificationEvent.memoriesExtracted(meetingId,
                    result.entities().size() + result.relationships().size()));
            notificationService.broadcast(orgId, NotificationEvent.transcriptProcessed(transcript.getId()));
        } catch (Exception ex) {
            log.error("Failed to process transcript {}: {}", transcript.getId(), ex.getMessage(), ex);
            notificationService.broadcast(orgId, NotificationEvent.transcriptFailed(transcript.getId()));
        }
    }
}
