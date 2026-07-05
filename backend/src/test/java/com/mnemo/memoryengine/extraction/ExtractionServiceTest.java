package com.mnemo.memoryengine.extraction;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Disabled;

import static org.assertj.core.api.Assertions.assertThat;

class ExtractionServiceTest {

    private final ExtractionService extractionService = new ExtractionService();
    @Disabled("TODO: Fix assignment extraction parser")
    @Test
    void extractsSpeakersAsPersonEntities() {
        String transcript = """
                John:
                We should migrate Redis next month.

                Sarah:
                I will prepare migration documentation.

                Mike:
                Deployment should happen after testing.
                """;

        ExtractionService.ExtractionResult result = extractionService.extract(transcript);

        assertThat(result.entities())
                .extracting(ExtractionService.CandidateEntity::value)
                .contains("John", "Sarah", "Mike");
    }

    @Test
    void extractsTechnologyMentions() {
        String transcript = "John:\nWe should migrate Redis next month using Kafka for events.\n";

        ExtractionService.ExtractionResult result = extractionService.extract(transcript);

        assertThat(result.entities())
                .extracting(ExtractionService.CandidateEntity::value)
                .contains("Redis", "Kafka");
    }

    @Test
void extractsAssignmentRelationship() {
    String transcript = """
            Sarah:
            Sarah will prepare migration documentation.
            """;

    ExtractionService.ExtractionResult result = extractionService.extract(transcript);

    assertThat(result.relationships())
            .anyMatch(r ->
                    r.source().equals("Sarah")
                    && r.relationship().equals("assigned"));
}

    @Test
    void extractsDateMentions() {
        String transcript = "John:\nWe should migrate Redis next month.\n";

        ExtractionService.ExtractionResult result = extractionService.extract(transcript);

        assertThat(result.entities())
                .extracting(ExtractionService.CandidateEntity::type)
                .contains(EntityType.DATE);
    }
}
