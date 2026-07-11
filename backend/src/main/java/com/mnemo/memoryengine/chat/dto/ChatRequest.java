package com.mnemo.memoryengine.chat.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record ChatRequest(
    @NotBlank String query,
    List<ChatMessage> history,
    Integer topK
) {}
