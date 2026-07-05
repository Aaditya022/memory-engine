package com.mnemo.memoryengine.cognee.kafka.event;

import java.math.BigDecimal;
import java.util.UUID;

public record CogneeRememberEvent(
        UUID memoryId,
        String content,
        String memoryType,
        String ownerName,
        BigDecimal confidence,
        BigDecimal importanceScore,
        UUID organizationId,
        UUID meetingId
) {}
