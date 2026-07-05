package com.mnemo.memoryengine.actionitem;

import com.mnemo.memoryengine.meeting.Meeting;
import com.mnemo.memoryengine.memory.Memory;
import com.mnemo.memoryengine.organization.Organization;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "action_items")
@Getter
@Setter
@NoArgsConstructor
public class ActionItem {

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

    @Column(name = "owner_name")
    private String ownerName;

    @Column(columnDefinition = "TEXT", nullable = false)
private String task;
    private LocalDate deadline;

    @Enumerated(EnumType.STRING)
    private ActionItemStatus status = ActionItemStatus.PENDING;

    @Enumerated(EnumType.STRING)
    private ActionItemPriority priority = ActionItemPriority.MEDIUM;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
