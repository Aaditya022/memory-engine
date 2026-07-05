package com.mnemo.memoryengine.meeting.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.Instant;
import java.util.List;

public record CreateMeetingRequest(
        @NotBlank String title,
        String source,
        Instant startedAt,
        Integer durationSeconds,
        List<String> participantNames
) {
}
