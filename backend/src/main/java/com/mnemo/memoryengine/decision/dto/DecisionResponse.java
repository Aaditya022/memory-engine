package com.mnemo.memoryengine.decision.dto;

import com.mnemo.memoryengine.decision.Decision;

import java.time.Instant;
import java.util.UUID;

public record DecisionResponse(
        UUID id,
        UUID meetingId,
        String decisionText,
        String decisionMaker,
        String alternativesDiscussed,
        String finalOutcome,
        Instant decidedAt,
        Instant createdAt
) {
    public static DecisionResponse from(Decision d) {
        return new DecisionResponse(
                d.getId(),
                d.getMeeting().getId(),
                d.getDecisionText(),
                d.getDecisionMaker(),
                d.getAlternativesDiscussed(),
                d.getFinalOutcome(),
                d.getDecidedAt(),
                d.getCreatedAt()
        );
    }
}
