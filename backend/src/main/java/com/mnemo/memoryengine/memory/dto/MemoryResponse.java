package com.mnemo.memoryengine.memory.dto;

import com.mnemo.memoryengine.memory.Memory;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * DTO wrapper around Memory. Required because the entity has lazy @ManyToOne
 * associations (organization, meeting) and open-in-view is disabled — Jackson
 * would throw LazyInitializationException trying to serialize the entity
 * directly outside the originating transaction.
 */
public record MemoryResponse(
        UUID id,
        UUID meetingId,
        String memoryType,
        String content,
        String ownerName,
        LocalDate eventDate,
        BigDecimal confidence,
        BigDecimal importanceScore,
        Instant createdAt
) {
    public static MemoryResponse from(Memory m) {
        return new MemoryResponse(
                m.getId(),
                m.getMeeting().getId(),
                m.getMemoryType().name(),
                m.getContent(),
                m.getOwnerName(),
                m.getEventDate(),
                m.getConfidence(),
                m.getImportanceScore(),
                m.getCreatedAt()
        );
    }
}
