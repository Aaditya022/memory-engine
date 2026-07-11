package com.mnemo.memoryengine.graph.dto;

import java.util.UUID;

public record GraphNode(
    String id,
    String label,
    String type,
    int mentionCount,
    UUID meetingId,
    String meetingTitle,
    String meetingSource
) {}
