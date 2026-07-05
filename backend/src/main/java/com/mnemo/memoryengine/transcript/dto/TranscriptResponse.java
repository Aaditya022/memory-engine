package com.mnemo.memoryengine.transcript.dto;

import com.mnemo.memoryengine.transcript.Transcript;

import java.time.Instant;
import java.util.UUID;

public record TranscriptResponse(UUID id, UUID meetingId, boolean processed, Instant processedAt, Instant createdAt) {
    public static TranscriptResponse from(Transcript t) {
        return new TranscriptResponse(t.getId(), t.getMeeting().getId(), t.isProcessed(), t.getProcessedAt(), t.getCreatedAt());
    }
}
