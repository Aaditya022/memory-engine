package com.mnemo.memoryengine.cognee.dto;

import java.time.Instant;
import java.util.UUID;

public record CogneeSearchResult(
        UUID memoryId,
        UUID meetingId,
        String meetingTitle,
        String memoryType,
        String content,
        String ownerName,
        double score,
        Instant createdAt
) {}
