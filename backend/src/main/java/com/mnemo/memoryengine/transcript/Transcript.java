package com.mnemo.memoryengine.transcript;

import com.mnemo.memoryengine.meeting.Meeting;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "transcripts")
@Getter
@Setter
@NoArgsConstructor
public class Transcript {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;

    @Column(name = "raw_text", nullable = false, columnDefinition = "TEXT")
    private String rawText;

    @Column(nullable = false)
    private boolean processed = false;

    @Column(name = "processed_at")
    private Instant processedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
