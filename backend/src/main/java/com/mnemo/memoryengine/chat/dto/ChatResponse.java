package com.mnemo.memoryengine.chat.dto;

import java.util.List;

public record ChatResponse(
    String answer,
    List<ChatMessage> history,
    List<Citation> citations,
    List<String> followUpQuestions
) {}
