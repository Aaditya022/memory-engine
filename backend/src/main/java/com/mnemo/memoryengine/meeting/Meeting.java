package com.mnemo.memoryengine.meeting;

import com.mnemo.memoryengine.organization.Organization;
import com.mnemo.memoryengine.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "meetings")
@Getter
@Setter
@NoArgsConstructor
public class Meeting {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(nullable = false)
    private String title;

    private String source;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @OneToMany(mappedBy = "meeting", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MeetingParticipant> participants = new ArrayList<>();
}
