package com.mnemo.memoryengine.audit.dto;

import com.mnemo.memoryengine.audit.AuditLog;

import java.time.Instant;
import java.util.UUID;

public record AuditLogResponse(
        UUID id,
        UUID actorUserId,
        String action,
        String resourceType,
        UUID resourceId,
        String details,
        Instant createdAt
) {
    public static AuditLogResponse from(AuditLog log) {
        return new AuditLogResponse(
                log.getId(),
                // .getId() on a lazy proxy does not trigger a DB fetch, so this is safe
                // even with open-in-view disabled.
                log.getActor() != null ? log.getActor().getId() : null,
                log.getAction(),
                log.getResourceType(),
                log.getResourceId(),
                log.getDetails(),
                log.getCreatedAt()
        );
    }
}
