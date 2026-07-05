package com.mnemo.memoryengine.security;

import java.util.UUID;

/**
 * Lightweight principal placed into the SecurityContext after JWT validation.
 * Avoids a DB round-trip per request just to resolve "who is calling".
 */
public record AuthenticatedPrincipal(UUID userId, String email, UUID organizationId, String role) {
}
