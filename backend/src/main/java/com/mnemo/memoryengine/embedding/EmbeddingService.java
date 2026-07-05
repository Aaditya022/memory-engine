package com.mnemo.memoryengine.embedding;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Handles the pgvector column directly via JDBC. Spring Data JPA has no first-class
 * mapping for the Postgres `vector` type, so embeddings are written/read with plain
 * SQL using pgvector's text literal syntax: '[0.1,0.2,...]'::vector
 */
@Service
public class EmbeddingService {

    private final GeminiClient geminiClient;
    private final JdbcTemplate jdbcTemplate;

    public EmbeddingService(GeminiClient geminiClient, JdbcTemplate jdbcTemplate) {
        this.geminiClient = geminiClient;
        this.jdbcTemplate = jdbcTemplate;
    }

    public void embedAndStoreMemory(UUID memoryId, String content) {
        float[] vector = geminiClient.embed(content);
        String literal = toVectorLiteral(vector);
        jdbcTemplate.update("UPDATE memories SET embedding = ?::vector WHERE id = ?", literal, memoryId);
    }

    public float[] embed(String text) {
        return geminiClient.embed(text);
    }

    public String toVectorLiteral(float[] vector) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < vector.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(vector[i]);
        }
        sb.append("]");
        return sb.toString();
    }
}
