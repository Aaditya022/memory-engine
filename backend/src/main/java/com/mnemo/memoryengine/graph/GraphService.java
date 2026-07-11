package com.mnemo.memoryengine.graph;

import com.mnemo.memoryengine.extraction.ExtractedEntity;
import com.mnemo.memoryengine.extraction.ExtractedEntityRepository;
import com.mnemo.memoryengine.extraction.EntityRelationship;
import com.mnemo.memoryengine.extraction.EntityRelationshipRepository;
import com.mnemo.memoryengine.graph.dto.GraphEdge;
import com.mnemo.memoryengine.graph.dto.GraphNode;
import com.mnemo.memoryengine.graph.dto.GraphResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class GraphService {

    private final ExtractedEntityRepository extractedEntityRepository;
    private final EntityRelationshipRepository entityRelationshipRepository;

    public GraphService(ExtractedEntityRepository extractedEntityRepository,
                        EntityRelationshipRepository entityRelationshipRepository) {
        this.extractedEntityRepository = extractedEntityRepository;
        this.entityRelationshipRepository = entityRelationshipRepository;
    }

    @Transactional(readOnly = true)
    public GraphResponse getFullGraph(UUID organizationId) {
        List<EntityRelationship> relationships = entityRelationshipRepository.findByOrganizationId(organizationId);
        return buildGraph(relationships, null);
    }

    @Transactional(readOnly = true)
    public GraphResponse getGraphByMeeting(UUID meetingId) {
        List<ExtractedEntity> entities = extractedEntityRepository.findByMeetingId(meetingId);
        List<EntityRelationship> relationships = entityRelationshipRepository.findByOrganizationId(
            entities.isEmpty() ? null : entities.get(0).getMeeting().getOrganization().getId()
        );

        Set<String> meetingEntityNames = entities.stream()
            .map(ExtractedEntity::getEntityValue)
            .map(String::toLowerCase)
            .collect(Collectors.toSet());

        List<EntityRelationship> filteredRelationships = relationships.stream()
            .filter(r -> r.getMeeting() != null && r.getMeeting().getId().equals(meetingId))
            .collect(Collectors.toList());

        return buildGraph(filteredRelationships, meetingEntityNames);
    }

    @Transactional(readOnly = true)
    public GraphResponse getEntitySubgraph(UUID organizationId, String entityName, int depth) {
        List<EntityRelationship> allRelationships = entityRelationshipRepository.findByOrganizationId(organizationId);
        Set<String> included = new HashSet<>();
        Set<String> frontier = new HashSet<>();
        frontier.add(entityName.toLowerCase());

        for (int d = 0; d < depth; d++) {
            Set<String> next = new HashSet<>();
            for (EntityRelationship r : allRelationships) {
                boolean sourceIn = frontier.contains(r.getSourceEntity().toLowerCase());
                boolean targetIn = frontier.contains(r.getTargetEntity().toLowerCase());
                if (sourceIn || targetIn) {
                    included.add(r.getSourceEntity().toLowerCase());
                    included.add(r.getTargetEntity().toLowerCase());
                    if (sourceIn) next.add(r.getTargetEntity().toLowerCase());
                    if (targetIn) next.add(r.getSourceEntity().toLowerCase());
                }
            }
            frontier = next;
        }

        List<EntityRelationship> filtered = allRelationships.stream()
            .filter(r -> included.contains(r.getSourceEntity().toLowerCase())
                      && included.contains(r.getTargetEntity().toLowerCase()))
            .collect(Collectors.toList());

        return buildGraph(filtered, included);
    }

    private GraphResponse buildGraph(List<EntityRelationship> relationships, Set<String> entityFilter) {
        Set<String> nodeKeys = new LinkedHashSet<>();
        List<GraphEdge> edges = new ArrayList<>();

        for (EntityRelationship r : relationships) {
            nodeKeys.add(normalizeKey(r.getSourceEntity()));
            nodeKeys.add(normalizeKey(r.getTargetEntity()));
            edges.add(new GraphEdge(
                r.getId().toString(),
                r.getSourceEntity(),
                r.getTargetEntity(),
                r.getRelationship(),
                r.getConfidence(),
                r.getMeeting() != null ? r.getMeeting().getId() : null
            ));
        }

        if (entityFilter != null) {
            nodeKeys.retainAll(entityFilter);
        }

        List<GraphNode> nodes = nodeKeys.stream()
            .map(key -> {
                String label = restoreCase(key, relationships);
                return new GraphNode(
                    key, label, "ENTITY", 1, null, null, null
                );
            })
            .collect(Collectors.toList());

        return new GraphResponse(nodes, edges);
    }

    private static String normalizeKey(String value) {
        return value.toLowerCase().replaceAll("\\s+", "_");
    }

    private static String restoreCase(String key, List<EntityRelationship> relationships) {
        for (EntityRelationship r : relationships) {
            if (r.getSourceEntity().equalsIgnoreCase(key)) return r.getSourceEntity();
            if (r.getTargetEntity().equalsIgnoreCase(key)) return r.getTargetEntity();
        }
        return key;
    }
}
