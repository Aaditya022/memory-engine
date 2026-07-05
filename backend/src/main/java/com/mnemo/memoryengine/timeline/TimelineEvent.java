package com.mnemo.memoryengine.timeline;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record TimelineEvent(
        UUID memoryId,
        UUID meetingId,
        String meetingTitle,
        String memoryType,
        String content,
        String ownerName,
        LocalDate eventDate,
        Instant createdAt
) {}
