package com.mnemo.memoryengine.cognee.dto;

import java.util.UUID;

public record CogneeMemoryResponse(
        String status,
        String message,
        UUID memoryId
) {}
