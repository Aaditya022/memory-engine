package com.mnemo.memoryengine.notification.dto;

import java.time.Instant;
import java.util.UUID;

public record NotificationEvent(
    String type,
    String title,
    String description,
    UUID resourceId,
    String resourceType,
    Instant timestamp
) {

    public static NotificationEvent transcriptProcessing(UUID transcriptId) {
        return new NotificationEvent("transcript.processing", "Processing transcript",
                "Transcript ingestion has started", transcriptId, "TRANSCRIPT", Instant.now());
    }

    public static NotificationEvent transcriptProcessed(UUID transcriptId) {
        return new NotificationEvent("transcript.processed", "Transcript processed",
                "Transcript has been fully processed and memories extracted", transcriptId, "TRANSCRIPT", Instant.now());
    }

    public static NotificationEvent transcriptFailed(UUID transcriptId) {
        return new NotificationEvent("transcript.failed", "Transcript processing failed",
                "An error occurred while processing the transcript", transcriptId, "TRANSCRIPT", Instant.now());
    }

    public static NotificationEvent memoriesExtracted(UUID meetingId, int count) {
        return new NotificationEvent("memories.extracted", "New memories extracted",
                count + " memories extracted from meeting", meetingId, "MEETING", Instant.now());
    }

    public static NotificationEvent actionItemUpdated(UUID actionItemId) {
        return new NotificationEvent("action-item.updated", "Action item updated",
                "An action item has been updated", actionItemId, "ACTION_ITEM", Instant.now());
    }
}
