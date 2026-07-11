package com.mnemo.memoryengine.chat.dto;

import java.time.Instant;
import java.util.UUID;

public record Citation(
    UUID memoryId,
    UUID meetingId,
    String meetingTitle,
    String content,
    String memoryType,
    String ownerName,
    double score,
    Instant createdAt
) {}
