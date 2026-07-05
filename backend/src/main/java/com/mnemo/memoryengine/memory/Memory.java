package com.mnemo.memoryengine.memory;

import com.mnemo.memoryengine.meeting.Meeting;
import com.mnemo.memoryengine.organization.Organization;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * The `embedding` (pgvector) and `search_vector` (tsvector, DB-generated trigger)
 * columns are intentionally NOT mapped here — they're managed via raw SQL in
 * EmbeddingService / migration triggers respectively, since Hibernate has no
 * native mapping for either Postgres type without extra dependencies.
 */
@Entity
@Table(name = "memories")
@Getter
@Setter
@NoArgsConstructor
public class Memory {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

    @Enumerated(EnumType.STRING)
    @Column(name = "memory_type", nullable = false)
    private MemoryType memoryType;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "owner_name")
    private String ownerName;

    @Column(name = "event_date")
    private LocalDate eventDate;

    private BigDecimal confidence = new BigDecimal("0.800");

    @Column(name = "importance_score")
    private BigDecimal importanceScore = new BigDecimal("0.500");

    @Column(name = "freshness_score")
    private BigDecimal freshnessScore = new BigDecimal("1.000");

    @Column(name = "frequency_score")
    private BigDecimal frequencyScore = BigDecimal.ZERO;

    @Column(name = "final_rank_score")
    private BigDecimal finalRankScore = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
