package com.mnemo.memoryengine.extraction;

import com.mnemo.memoryengine.meeting.Meeting;
import com.mnemo.memoryengine.transcript.Transcript;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "extracted_entities")
@Getter
@Setter
@NoArgsConstructor
public class ExtractedEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transcript_id", nullable = false)
    private Transcript transcript;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type", nullable = false)
    private EntityType entityType;

    @Column(name = "entity_value", nullable = false)
    private String entityValue;

    @Column(name = "mention_count", nullable = false)
    private int mentionCount = 1;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public ExtractedEntity(Transcript transcript, Meeting meeting, EntityType type, String value, int count) {
        this.transcript = transcript;
        this.meeting = meeting;
        this.entityType = type;
        this.entityValue = value;
        this.mentionCount = count;
    }
}
