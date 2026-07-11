package com.mnemo.memoryengine.graph.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record GraphEdge(
    String id,
    String source,
    String target,
    String relationship,
    BigDecimal confidence,
    UUID meetingId
) {}
