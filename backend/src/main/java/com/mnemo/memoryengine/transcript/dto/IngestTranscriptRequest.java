package com.mnemo.memoryengine.transcript.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record IngestTranscriptRequest(
        @NotNull UUID meetingId,
        @NotBlank String rawText
) {
}
