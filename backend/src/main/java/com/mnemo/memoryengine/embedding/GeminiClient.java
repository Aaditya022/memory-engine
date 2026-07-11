package com.mnemo.memoryengine.embedding;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

/**
 * Thin wrapper around Google's Gemini API for:
 *  - text embeddings (used by the semantic memory / vector search engine)
 *  - short generative completions (used for structured extraction fallback)
 *
 * If app.gemini.api-key is not configured, embedding() falls back to a
 * deterministic local hash-based vector so the rest of the pipeline (storage,
 * search, ranking) remains fully testable without any external API key.
 */
@Component
public class GeminiClient {

    private final WebClient webClient;
    private final String apiKey;
    private final String embeddingModel;
    private final String generationModel;
    private static final int EMBEDDING_DIM = 768;

    public GeminiClient(WebClient.Builder builder,
                         @Value("${app.gemini.base-url}") String baseUrl,
                         @Value("${app.gemini.api-key}") String apiKey,
                         @Value("${app.gemini.embedding-model}") String embeddingModel,
                         @Value("${app.gemini.generation-model}") String generationModel) {
        this.webClient = builder.baseUrl(baseUrl).build();
        this.apiKey = apiKey;
        this.embeddingModel = embeddingModel;
        this.generationModel = generationModel;
    }

    @SuppressWarnings("unchecked")
    public float[] embed(String text) {
        if (apiKey == null || apiKey.isBlank()) {
            return localFallbackEmbedding(text);
        }

        try {
            Map<String, Object> body = Map.of(
                    "model", "models/" + embeddingModel,
                    "content", Map.of("parts", List.of(Map.of("text", text)))
            );

            Map<String, Object> response = webClient.post()
                    .uri("/models/{model}:embedContent?key={key}", embeddingModel, apiKey)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response == null) return localFallbackEmbedding(text);

            Map<String, Object> embedding = (Map<String, Object>) response.get("embedding");
            List<Double> values = (List<Double>) embedding.get("values");
            float[] result = new float[values.size()];
            for (int i = 0; i < values.size(); i++) result[i] = values.get(i).floatValue();
            return result;
        } catch (Exception ex) {
            // Network/API failure should never break ingestion; degrade gracefully.
            return localFallbackEmbedding(text);
        }
    }

    /**
     * Deterministic pseudo-embedding derived from token hashing. Not semantically
     * meaningful, but stable and dimensionally correct — keeps hybrid search,
     * ranking, and storage code paths fully exercisable offline / in CI.
     */
    private float[] localFallbackEmbedding(String text) {
        float[] vector = new float[EMBEDDING_DIM];
        String[] tokens = text.toLowerCase().split("\\W+");
        for (String token : tokens) {
            if (token.isBlank()) continue;
            int hash = token.hashCode();
            int idx = Math.floorMod(hash, EMBEDDING_DIM);
            vector[idx] += 1.0f;
        }
        normalize(vector);
        return vector;
    }

    private void normalize(float[] vector) {
        double norm = 0;
        for (float v : vector) norm += v * v;
        norm = Math.sqrt(norm);
        if (norm == 0) return;
        for (int i = 0; i < vector.length; i++) vector[i] /= norm;
    }

    public String generationModel() {
        return generationModel;
    }

    @SuppressWarnings("unchecked")
    public String complete(String systemInstruction, List<Map<String, Object>> contents) {
        if (apiKey == null || apiKey.isBlank()) {
            return "AI assistant is not configured. Set GEMINI_API_KEY to enable AI features.";
        }

        try {
            Map<String, Object> body = new java.util.LinkedHashMap<>();
            if (systemInstruction != null && !systemInstruction.isBlank()) {
                body.put("systemInstruction", Map.of("parts", List.of(Map.of("text", systemInstruction))));
            }
            body.put("contents", contents);

            Map<String, Object> response = webClient.post()
                    .uri("/models/{model}:generateContent?key={key}", generationModel, apiKey)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response == null) return "No response from AI model.";

            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            if (candidates == null || candidates.isEmpty()) return "No response from AI model.";

            Map<String, Object> candidate = candidates.get(0);
            Map<String, Object> content = (Map<String, Object>) candidate.get("content");
            if (content == null) return "No response from AI model.";

            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            if (parts == null || parts.isEmpty()) return "No response from AI model.";

            StringBuilder result = new StringBuilder();
            for (Map<String, Object> part : parts) {
                result.append(part.getOrDefault("text", ""));
            }
            return result.toString();
        } catch (Exception ex) {
            return "Sorry, I encountered an error: " + ex.getMessage();
        }
    }

}
