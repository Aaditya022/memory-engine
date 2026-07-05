package com.mnemo.memoryengine.search;

import java.time.Instant;
import java.util.UUID;

public record SearchResultItem(
        UUID memoryId,
        UUID meetingId,
        String meetingTitle,
        String memoryType,
        String content,
        String ownerName,
        double bm25Score,
        double vectorScore,
        double finalScore,
        Instant createdAt
) {}
