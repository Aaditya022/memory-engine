package com.mnemo.memoryengine.actionitem.dto;

import com.mnemo.memoryengine.actionitem.ActionItem;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record ActionItemResponse(
        UUID id,
        UUID meetingId,
        String ownerName,
        String task,
        LocalDate deadline,
        String status,
        String priority,
        Instant createdAt
) {
    public static ActionItemResponse from(ActionItem a) {
        return new ActionItemResponse(
                a.getId(),
                a.getMeeting().getId(),
                a.getOwnerName(),
                a.getTask(),
                a.getDeadline(),
                a.getStatus().name(),
                a.getPriority().name(),
                a.getCreatedAt()
        );
    }
}
