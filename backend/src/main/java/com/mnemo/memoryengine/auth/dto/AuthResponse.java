package com.mnemo.memoryengine.auth.dto;

import java.util.UUID;

public record AuthResponse(String accessToken, String refreshToken, String tokenType,
                            UUID userId, String role, UUID organizationId) {
    public AuthResponse(String accessToken, String refreshToken, UUID userId, String role, UUID organizationId) {
        this(accessToken, refreshToken, "Bearer", userId, role, organizationId);
    }
}
