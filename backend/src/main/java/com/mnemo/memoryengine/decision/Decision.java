package com.mnemo.memoryengine.decision;

import com.mnemo.memoryengine.meeting.Meeting;
import com.mnemo.memoryengine.memory.Memory;
import com.mnemo.memoryengine.organization.Organization;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "decisions")
@Getter
@Setter
@NoArgsConstructor
public class Decision {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "memory_id")
    private Memory memory;

    @Column(name = "decision_text", nullable = false, columnDefinition = "TEXT")
    private String decisionText;

    @Column(name = "decision_maker")
    private String decisionMaker;

    @Column(name = "alternatives_discussed", columnDefinition = "TEXT")
    private String alternativesDiscussed;

    @Column(name = "final_outcome", columnDefinition = "TEXT")
    private String finalOutcome;

    @Column(name = "decided_at")
    private Instant decidedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
