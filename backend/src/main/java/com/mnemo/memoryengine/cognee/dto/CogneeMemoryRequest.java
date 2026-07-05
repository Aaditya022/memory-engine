package com.mnemo.memoryengine.cognee.dto;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

public record CogneeMemoryRequest(
        UUID id,
        String content,
        String memoryType,
        String ownerName,
        BigDecimal confidence,
        BigDecimal importanceScore,
        UUID organizationId,
        UUID meetingId,
        Map<String, Object> metadata
) {}
