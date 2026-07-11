package com.mnemo.memoryengine.integration.dto;

import com.mnemo.memoryengine.integration.Integration;

import java.time.Instant;
import java.util.UUID;

public record IntegrationResponse(
    UUID id,
    String name,
    boolean enabled,
    String status,
    String configJson,
    Instant createdAt,
    Instant updatedAt
) {
    public static IntegrationResponse from(Integration integration) {
        String config = integration.getConfigJson();
        // Mask sensitive fields in the response
        if (config != null && !config.isBlank()) {
            config = maskSensitive(config);
        }
        return new IntegrationResponse(
            integration.getId(),
            integration.getName(),
            integration.isEnabled(),
            integration.getStatus(),
            config,
            integration.getCreatedAt(),
            integration.getUpdatedAt()
        );
    }

    private static String maskSensitive(String config) {
        // Mask common sensitive fields
        for (String key : new String[]{"apiKey", "api_key", "token", "secret", "webhookSecret", "clientSecret"}) {
            config = config.replaceAll(
                "\"" + key + "\"\\s*:\\s*\"[^\"]+\"",
                "\"" + key + "\":\"••••••••\""
            );
        }
        return config;
    }
}
