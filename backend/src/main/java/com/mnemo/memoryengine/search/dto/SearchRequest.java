package com.mnemo.memoryengine.search.dto;

import jakarta.validation.constraints.NotBlank;

public record SearchRequest(
        @NotBlank String query,
        Integer topK,
        String memoryType,   // optional filter: DECISION, ACTION_ITEM, FACT, COMMITMENT, DISCUSSION
        String ownerName     // optional filter: e.g. "Sarah"
) {}
