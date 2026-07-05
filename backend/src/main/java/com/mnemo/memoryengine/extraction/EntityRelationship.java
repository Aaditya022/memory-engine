package com.mnemo.memoryengine.extraction;

import com.mnemo.memoryengine.meeting.Meeting;
import com.mnemo.memoryengine.organization.Organization;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "entity_relationships")
@Getter
@Setter
@NoArgsConstructor
public class EntityRelationship {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(name = "source_entity", nullable = false)
    private String sourceEntity;

    @Column(nullable = false)
    private String relationship; // owns, assigned, replaced_by, works_on ...

    @Column(name = "target_entity", nullable = false)
    private String targetEntity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id")
    private Meeting meeting;

    private BigDecimal confidence = new BigDecimal("0.800");

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
