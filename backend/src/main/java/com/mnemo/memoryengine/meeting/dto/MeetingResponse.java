package com.mnemo.memoryengine.meeting.dto;

import com.mnemo.memoryengine.meeting.Meeting;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record MeetingResponse(
        UUID id,
        String title,
        String source,
        Instant startedAt,
        Integer durationSeconds,
        List<String> participants,
        Instant createdAt
) {
    public static MeetingResponse from(Meeting m) {
        return new MeetingResponse(
                m.getId(),
                m.getTitle(),
                m.getSource(),
                m.getStartedAt(),
                m.getDurationSeconds(),
                m.getParticipants().stream().map(p -> p.getName()).toList(),
                m.getCreatedAt()
        );
    }
}
