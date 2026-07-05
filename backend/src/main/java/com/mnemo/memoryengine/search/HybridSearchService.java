package com.mnemo.memoryengine.search;

import com.mnemo.memoryengine.cognee.CogneeService;
import com.mnemo.memoryengine.embedding.EmbeddingService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.*;

/**
 * Implements the search pipeline from the PRD:
 *   query -> keyword extraction -> metadata filter -> vector search -> BM25 search
 *         -> merge results -> reranking -> final response
 *
 * BM25-equivalent full-text relevance comes from Postgres's ts_rank over the
 * `search_vector` tsvector column (GIN-indexed). Vector similarity comes from
 * pgvector's cosine distance operator (<=>) over the ivfflat-indexed `embedding`
 * column. Results are merged and reranked using a weighted linear combination,
 * further boosted by each memory's precomputed importance score.
 */
@Service
public class HybridSearchService {

    private final NamedParameterJdbcTemplate jdbc;
    private final EmbeddingService embeddingService;
    private final CogneeService cogneeService;
    private final double vectorWeight;
    private final double bm25Weight;
    private final int defaultTopK;

    public HybridSearchService(NamedParameterJdbcTemplate jdbc,
                                EmbeddingService embeddingService,
                                CogneeService cogneeService,
                                @Value("${app.search.vector-weight}") double vectorWeight,
                                @Value("${app.search.bm25-weight}") double bm25Weight,
                                @Value("${app.search.default-top-k}") int defaultTopK) {
        this.jdbc = jdbc;
        this.embeddingService = embeddingService;
        this.cogneeService = cogneeService;
        this.vectorWeight = vectorWeight;
        this.bm25Weight = bm25Weight;
        this.defaultTopK = defaultTopK;
    }

    @Cacheable(value = "searchResults",
            key = "#organizationId + ':' + #query + ':' + #topK + ':' + #memoryType + ':' + #ownerName")
    public List<SearchResultItem> search(UUID organizationId, String query, Integer topK,
                                          String memoryType, String ownerName) {
        int limit = (topK == null || topK <= 0) ? defaultTopK : topK;
        float[] queryEmbedding = embeddingService.embed(query);
        String vectorLiteral = embeddingService.toVectorLiteral(queryEmbedding);

        // Pull a generous candidate pool from each strategy, then merge + rerank in Java.
        int candidatePool = Math.max(limit * 4, 40);

        List<SearchResultItem> bm25Candidates = bm25Search(organizationId, query, memoryType, ownerName, candidatePool);
        List<SearchResultItem> vectorCandidates = vectorSearch(organizationId, vectorLiteral, memoryType, ownerName, candidatePool);

        List<SearchResultItem> cogneeResults = cogneeService.recall(query, organizationId, limit, memoryType, ownerName);
        for (SearchResultItem cr : cogneeResults) {
            if (vectorCandidates.stream().noneMatch(v -> v.memoryId().equals(cr.memoryId()))) {
                vectorCandidates.add(cr);
            }
        }

        return mergeAndRerank(bm25Candidates, vectorCandidates, limit);
    }

    private List<SearchResultItem> bm25Search(UUID orgId, String query, String memoryType, String ownerName, int limit) {
        StringBuilder sql = new StringBuilder("""
            SELECT m.id as memory_id, m.meeting_id, mt.title as meeting_title, m.memory_type,
                   m.content, m.owner_name, m.created_at, m.importance_score,
                   ts_rank(m.search_vector, plainto_tsquery('english', :query)) as bm25_score
            FROM memories m
            JOIN meetings mt ON mt.id = m.meeting_id
            WHERE m.organization_id = :orgId
              AND m.search_vector @@ plainto_tsquery('english', :query)
            """);
        MapSqlParameterSource params = baseParams(orgId, query, memoryType, ownerName);
        appendFilters(sql, memoryType, ownerName);
        sql.append(" ORDER BY bm25_score DESC LIMIT :limit");
        params.addValue("limit", limit);

        return jdbc.query(sql.toString(), params, rowMapper(true));
    }

    private List<SearchResultItem> vectorSearch(UUID orgId, String vectorLiteral, String memoryType, String ownerName, int limit) {
        StringBuilder sql = new StringBuilder("""
            SELECT m.id as memory_id, m.meeting_id, mt.title as meeting_title, m.memory_type,
                   m.content, m.owner_name, m.created_at, m.importance_score,
                   1 - (m.embedding <=> CAST(:vector AS vector)) as vector_score
            FROM memories m
            JOIN meetings mt ON mt.id = m.meeting_id
            WHERE m.organization_id = :orgId
              AND m.embedding IS NOT NULL
            """);
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("orgId", orgId)
                .addValue("vector", vectorLiteral);
        appendFilters(sql, memoryType, ownerName);
        if (memoryType != null && !memoryType.isBlank()) params.addValue("memoryType", memoryType);
        if (ownerName != null && !ownerName.isBlank()) params.addValue("ownerName", ownerName);
        sql.append(" ORDER BY m.embedding <=> CAST(:vector AS vector) LIMIT :limit");
        params.addValue("limit", limit);

        return jdbc.query(sql.toString(), params, rowMapper(false));
    }

    private MapSqlParameterSource baseParams(UUID orgId, String query, String memoryType, String ownerName) {
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("orgId", orgId)
                .addValue("query", query);
        if (memoryType != null && !memoryType.isBlank()) params.addValue("memoryType", memoryType);
        if (ownerName != null && !ownerName.isBlank()) params.addValue("ownerName", ownerName);
        return params;
    }

    private void appendFilters(StringBuilder sql, String memoryType, String ownerName) {
        if (memoryType != null && !memoryType.isBlank()) sql.append(" AND m.memory_type = :memoryType");
        if (ownerName != null && !ownerName.isBlank()) sql.append(" AND m.owner_name ILIKE :ownerName");
    }

    private RowMapper<SearchResultItem> rowMapper(boolean isBm25) {
        return (rs, rowNum) -> new SearchResultItem(
                (UUID) rs.getObject("memory_id"),
                (UUID) rs.getObject("meeting_id"),
                rs.getString("meeting_title"),
                rs.getString("memory_type"),
                rs.getString("content"),
                rs.getString("owner_name"),
                isBm25 ? rs.getDouble("bm25_score") : 0.0,
                isBm25 ? 0.0 : rs.getDouble("vector_score"),
                rs.getDouble("importance_score"), // temp holder, replaced during merge
                rs.getTimestamp("created_at").toInstant()
        );
    }

    /** Merges BM25 + vector candidate lists by memory id, computes weighted final score, sorts, truncates. */
    private List<SearchResultItem> mergeAndRerank(List<SearchResultItem> bm25, List<SearchResultItem> vector, int limit) {
        Map<UUID, SearchResultItem> byId = new LinkedHashMap<>();

        for (SearchResultItem item : bm25) {
            byId.merge(item.memoryId(), item, this::combineBm25IntoVector);
        }
        for (SearchResultItem item : vector) {
            byId.merge(item.memoryId(), item, this::combineVectorIntoExisting);
        }

        List<SearchResultItem> merged = new ArrayList<>();
        double maxBm25 = byId.values().stream().mapToDouble(SearchResultItem::bm25Score).max().orElse(1.0);
        if (maxBm25 == 0) maxBm25 = 1.0;
        double maxBm25Final = maxBm25;

        for (SearchResultItem item : byId.values()) {
            double normalizedBm25 = item.bm25Score() / maxBm25Final;
            double importanceBoost = item.finalScore(); // importance_score was stashed here by rowMapper
            double finalScore = (bm25Weight * normalizedBm25) + (vectorWeight * item.vectorScore());
            finalScore = finalScore * (0.7 + 0.3 * importanceBoost); // mild importance boost, capped influence

            merged.add(new SearchResultItem(
                    item.memoryId(), item.meetingId(), item.meetingTitle(), item.memoryType(),
                    item.content(), item.ownerName(), item.bm25Score(), item.vectorScore(),
                    finalScore, item.createdAt()));
        }

        merged.sort((a, b) -> Double.compare(b.finalScore(), a.finalScore()));
        return merged.size() > limit ? merged.subList(0, limit) : merged;
    }

    private SearchResultItem combineBm25IntoVector(SearchResultItem a, SearchResultItem b) {
        // both entries for the same memory id; keep bm25 from 'a', vector from 'b' (whichever has it)
        return new SearchResultItem(a.memoryId(), a.meetingId(), a.meetingTitle(), a.memoryType(), a.content(),
                a.ownerName(), Math.max(a.bm25Score(), b.bm25Score()), Math.max(a.vectorScore(), b.vectorScore()),
                Math.max(a.finalScore(), b.finalScore()), a.createdAt());
    }

    private SearchResultItem combineVectorIntoExisting(SearchResultItem existing, SearchResultItem incoming) {
        return combineBm25IntoVector(existing, incoming);
    }
}
