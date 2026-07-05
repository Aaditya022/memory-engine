package com.mnemo.memoryengine.cognee.dto;

import java.util.UUID;

public record CogneeRecallRequest(
        String query,
        UUID organizationId,
        int topK,
        String memoryType,
        String ownerName
) {}
