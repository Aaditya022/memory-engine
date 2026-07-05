package com.mnemo.memoryengine.extraction;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;

/**
 * Rule-based entity + relationship extraction.
 *
 * This is intentionally dependency-light (no external NER model) so the service
 * runs anywhere without a GPU or a hosted NLP API. It is designed as a pluggable
 * strategy: swap this out for a spaCy microservice, a Gemini-powered extractor,
 * or AWS Comprehend later without touching callers (they only depend on
 * ExtractionResult).
 */
@Service
public class ExtractionService {

    // Speaker line pattern: "John:" or "Sarah Lee:" at the start of a line.
    private static final Pattern SPEAKER_PATTERN = Pattern.compile("(?m)^\\s*([A-Z][a-zA-Z]+(?:\\s[A-Z][a-zA-Z]+)?)\\s*:\\s*$");

    // A curated technology/product vocabulary. Extend freely.
    private static final Set<String> TECH_VOCAB = new HashSet<>(Arrays.asList(
            "Redis", "Valkey", "Kafka", "RabbitMQ", "Spring Boot", "Spring", "PostgreSQL", "Postgres",
            "MongoDB", "MySQL", "Docker", "Kubernetes", "React", "Next.js", "Node.js", "Java", "Python",
            "TypeScript", "AWS", "GCP", "Azure", "Microservices", "REST API", "GraphQL", "OAuth", "JWT",
            "Authentication Service", "Payment Gateway", "Qdrant", "pgvector", "Elasticsearch", "Gemini",
            "OpenAI", "CI/CD", "Terraform", "gRPC", "WebSocket"
    ));

    private static final Pattern DATE_PATTERN = Pattern.compile(
            "(?i)\\b(next month|last month|next week|last week|today|tomorrow|yesterday|" +
            "monday|tuesday|wednesday|thursday|friday|saturday|sunday|" +
            "january|february|march|april|may|june|july|august|september|october|november|december)\\b");

    private static final Pattern ASSIGNMENT_PATTERN = Pattern.compile(
            "(?i)\\b([A-Z][a-z]+)\\b[^.\\n]{0,15}\\b(will|shall|is going to|to)\\b\\s+([a-z][^.\\n]{3,120})");

    private static final Pattern OWNERSHIP_PATTERN = Pattern.compile(
            "(?i)\\b([A-Z][a-z]+)\\b[^.\\n]{0,10}\\b(responsible for|owns|leading|leads)\\b\\s+([A-Za-z0-9 .\\-]{3,80})");

    public record ExtractionResult(
            List<CandidateEntity> entities,
            List<CandidateRelationship> relationships
    ) {}

    public record CandidateEntity(EntityType type, String value, int mentionCount) {}

    public record CandidateRelationship(String source, String relationship, String target) {}

    public ExtractionResult extract(String rawText) {
        Map<String, CandidateEntity> entityMap = new LinkedHashMap<>();
        List<CandidateRelationship> relationships = new ArrayList<>();

        // 1. Speakers -> PERSON entities
        Matcher speakerMatcher = SPEAKER_PATTERN.matcher(rawText);
        while (speakerMatcher.find()) {
            addOrBump(entityMap, EntityType.PERSON, speakerMatcher.group(1).trim());
        }

        // 2. Technology vocabulary matches -> TECHNOLOGY entities
        for (String term : TECH_VOCAB) {
            int count = countOccurrences(rawText, term);
            if (count > 0) {
                addOrBump(entityMap, EntityType.TECHNOLOGY, term, count);
            }
        }

        // 3. Date-ish mentions -> DATE entities
        Matcher dateMatcher = DATE_PATTERN.matcher(rawText);
        while (dateMatcher.find()) {
            addOrBump(entityMap, EntityType.DATE, capitalize(dateMatcher.group(1)));
        }

        // 4. Assignment relationships: "Sarah will prepare migration documentation"
        Matcher assignMatcher = ASSIGNMENT_PATTERN.matcher(rawText);
        while (assignMatcher.find()) {
            String person = assignMatcher.group(1).trim();
            String task = assignMatcher.group(3).trim();
            if (entityMap.containsKey(key(EntityType.PERSON, person))) {
                relationships.add(new CandidateRelationship(person, "assigned", truncate(task, 200)));
            }
        }

        // 5. Ownership relationships: "John is responsible for the Authentication Service"
        Matcher ownMatcher = OWNERSHIP_PATTERN.matcher(rawText);
        while (ownMatcher.find()) {
            String person = ownMatcher.group(1).trim();
            String target = ownMatcher.group(3).trim();
            if (entityMap.containsKey(key(EntityType.PERSON, person))) {
                relationships.add(new CandidateRelationship(person, "owns", truncate(target, 200)));
            }
        }
        System.out.println("Entities = " + entityMap.values());
        System.out.println("Relationships = " + relationships);

        return new ExtractionResult(new ArrayList<>(entityMap.values()), relationships);
    }

    private void addOrBump(Map<String, CandidateEntity> map, EntityType type, String value) {
        addOrBump(map, type, value, 1);
    }

    private void addOrBump(Map<String, CandidateEntity> map, EntityType type, String value, int count) {
        String k = key(type, value);
        CandidateEntity existing = map.get(k);
        if (existing == null) {
            map.put(k, new CandidateEntity(type, value, count));
        } else {
            map.put(k, new CandidateEntity(type, value, existing.mentionCount() + count));
        }
    }

    private String key(EntityType type, String value) {
        return type.name() + "::" + value.toLowerCase();
    }

    private int countOccurrences(String text, String term) {
        int count = 0;
        int idx = 0;
        String lowerText = text.toLowerCase();
        String lowerTerm = term.toLowerCase();
        while ((idx = lowerText.indexOf(lowerTerm, idx)) != -1) {
            count++;
            idx += lowerTerm.length();
        }
        return count;
    }

    private String capitalize(String s) {
        if (s.isEmpty()) return s;
        return Character.toUpperCase(s.charAt(0)) + s.substring(1).toLowerCase();
    }

    private String truncate(String s, int max) {
        return s.length() <= max ? s : s.substring(0, max);
    }
}
