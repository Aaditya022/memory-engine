package com.mnemo.memoryengine.chat;

import com.mnemo.memoryengine.chat.dto.ChatMessage;
import com.mnemo.memoryengine.chat.dto.ChatRequest;
import com.mnemo.memoryengine.chat.dto.ChatResponse;
import com.mnemo.memoryengine.chat.dto.Citation;
import com.mnemo.memoryengine.embedding.GeminiClient;
import com.mnemo.memoryengine.search.HybridSearchService;
import com.mnemo.memoryengine.search.SearchResultItem;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final HybridSearchService hybridSearchService;
    private final GeminiClient geminiClient;

    private static final String SYSTEM_PROMPT = """
        You are an AI assistant for organizational memory. Your role is to answer questions
        based on the provided context from meeting transcripts and extracted knowledge.

        Guidelines:
        - Answer using only the provided context. If the context doesn't contain enough
          information, say so clearly.
        - Cite specific memories, decisions, and action items when relevant.
        - Be concise and factual.
        - If the user asks about something not in the context, suggest they search
          for related terms or check their meetings.

        Context from organizational memory:
        %s
        """;

    private static final List<String> FOLLOW_UP_TEMPLATES = List.of(
        "Can you tell me more about that?",
        "Who was involved in that discussion?",
        "When did this happen?",
        "What decisions were made related to this?",
        "Are there any action items from this?"
    );

    public ChatService(HybridSearchService hybridSearchService, GeminiClient geminiClient) {
        this.hybridSearchService = hybridSearchService;
        this.geminiClient = geminiClient;
    }

    public ChatResponse chat(UUID organizationId, ChatRequest request) {
        int topK = request.topK() != null && request.topK() > 0 ? request.topK() : 5;
        List<SearchResultItem> results = hybridSearchService.search(
                organizationId, request.query(), topK, null, null);

        String context = buildContext(results);
        String systemPrompt = String.format(SYSTEM_PROMPT, context.isBlank() ? "No relevant context found." : context);

        List<Map<String, Object>> contents = new ArrayList<>();
        if (request.history() != null) {
            for (ChatMessage msg : request.history()) {
                String role = "user".equals(msg.role()) ? "user" : "model";
                contents.add(Map.of("role", role, "parts", List.of(Map.of("text", msg.content()))));
            }
        }
        contents.add(Map.of("role", "user", "parts", List.of(Map.of("text", request.query()))));

        String answer = geminiClient.complete(systemPrompt, contents);

        List<Citation> citations = results.stream()
                .map(r -> new Citation(
                        r.memoryId(), r.meetingId(), r.meetingTitle(), r.content(),
                        r.memoryType(), r.ownerName(), r.finalScore(), r.createdAt()))
                .collect(Collectors.toList());

        List<ChatMessage> updatedHistory = new ArrayList<>();
        if (request.history() != null) updatedHistory.addAll(request.history());
        updatedHistory.add(new ChatMessage("user", request.query()));
        updatedHistory.add(new ChatMessage("assistant", answer));

        List<String> followUps = generateFollowUps(request.query(), results);

        return new ChatResponse(answer, updatedHistory, citations, followUps);
    }

    private String buildContext(List<SearchResultItem> results) {
        if (results.isEmpty()) return "";

        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < results.size(); i++) {
            SearchResultItem r = results.get(i);
            sb.append("[").append(i + 1).append("] ");
            sb.append("Type: ").append(r.memoryType()).append(" | ");
            sb.append("Meeting: ").append(r.meetingTitle()).append(" | ");
            sb.append("Owner: ").append(r.ownerName()).append(" | ");
            sb.append("Relevance: ").append(String.format("%.2f", r.finalScore())).append("\n");
            sb.append("Content: ").append(r.content()).append("\n\n");
        }
        return sb.toString();
    }

    private List<String> generateFollowUps(String query, List<SearchResultItem> results) {
        List<String> followUps = new ArrayList<>();
        followUps.add("What do we know about \"" + extractTopic(query, results) + "\"?");

        if (results.stream().anyMatch(r -> "DECISION".equals(r.memoryType()))) {
            followUps.add("What decisions were made about this?");
        }
        if (results.stream().anyMatch(r -> r.ownerName() != null && !r.ownerName().isBlank())) {
            Set<String> people = results.stream()
                    .map(SearchResultItem::ownerName)
                    .filter(n -> n != null && !n.isBlank())
                    .limit(3)
                    .collect(Collectors.toSet());
            people.forEach(p -> followUps.add("What did " + p + " say about this?"));
        }

        while (followUps.size() < 3) {
            followUps.add(FOLLOW_UP_TEMPLATES.get(followUps.size() % FOLLOW_UP_TEMPLATES.size()));
        }

        return followUps.size() > 5 ? followUps.subList(0, 5) : followUps;
    }

    private String extractTopic(String query, List<SearchResultItem> results) {
        if (!results.isEmpty()) {
            String content = results.get(0).content();
            String[] words = content.split("\\s+");
            if (words.length > 5) {
                return String.join(" ", Arrays.copyOfRange(words, 0, 5)) + "...";
            }
            return content;
        }
        return query;
    }
}
