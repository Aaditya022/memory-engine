package com.mnemo.memoryengine.cognee;

import com.mnemo.memoryengine.cognee.dto.*;
import com.mnemo.memoryengine.cognee.exception.CogneeException;
import com.mnemo.memoryengine.memory.Memory;
import com.mnemo.memoryengine.search.SearchResultItem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
public class CogneeService {

    private static final Logger log = LoggerFactory.getLogger(CogneeService.class);

    private final CogneeClient cogneeClient;

    public CogneeService(CogneeClient cogneeClient) {
        this.cogneeClient = cogneeClient;
    }

    public void remember(Memory memory) {
        try {
            CogneeMemoryRequest request = new CogneeMemoryRequest(
                    memory.getId(),
                    memory.getContent(),
                    memory.getMemoryType().name(),
                    memory.getOwnerName(),
                    memory.getConfidence(),
                    memory.getImportanceScore(),
                    memory.getOrganization().getId(),
                    memory.getMeeting().getId(),
                    Map.of("memoryType", memory.getMemoryType().name())
            );
            CogneeMemoryResponse response = cogneeClient.remember(request);
            log.debug("Cognee remember() succeeded for memory {}: {}", memory.getId(), response);
        } catch (CogneeException e) {
            log.warn("Cognee remember() failed for memory {}: {}", memory.getId(), e.getMessage());
        }
    }

    public void improve(Memory memory) {
        try {
            CogneeMemoryRequest request = new CogneeMemoryRequest(
                    memory.getId(),
                    memory.getContent(),
                    memory.getMemoryType().name(),
                    memory.getOwnerName(),
                    memory.getConfidence(),
                    memory.getImportanceScore(),
                    memory.getOrganization().getId(),
                    memory.getMeeting().getId(),
                    Map.of("memoryType", memory.getMemoryType().name())
            );
            CogneeMemoryResponse response = cogneeClient.improve(request);
            log.debug("Cognee improve() succeeded for memory {}: {}", memory.getId(), response);
        } catch (CogneeException e) {
            log.warn("Cognee improve() failed for memory {}: {}", memory.getId(), e.getMessage());
        }
    }

    public void memify(String content, UUID organizationId, UUID meetingId, String ownerName) {
        try {
            CogneeMemoryRequest request = new CogneeMemoryRequest(
                    null, content, "DISCUSSION", ownerName, null, null,
                    organizationId, meetingId, Map.of("source", "transcript")
            );
            CogneeMemoryResponse response = cogneeClient.improve(request);
            log.debug("Cognee memify() succeeded: {}", response);
        } catch (CogneeException e) {
            log.warn("Cognee memify() failed: {}", e.getMessage());
        }
    }

    public List<SearchResultItem> recall(String query, UUID organizationId, int topK,
                                          String memoryType, String ownerName) {
        try {
            CogneeRecallRequest request = new CogneeRecallRequest(
                    query, organizationId, topK, memoryType, ownerName
            );
            CogneeRecallResponse response = cogneeClient.recall(request);
            if (response == null || response.results() == null) return List.of();

            return response.results().stream()
                    .map(this::toSearchResultItem)
                    .toList();
        } catch (CogneeException e) {
            log.warn("Cognee recall() failed: {}", e.getMessage());
            return List.of();
        }
    }

    public void forget(UUID memoryId) {
        try {
            cogneeClient.forget(memoryId);
            log.debug("Cognee forget() succeeded for memory {}", memoryId);
        } catch (CogneeException e) {
            log.warn("Cognee forget() failed for memory {}: {}", memoryId, e.getMessage());
            throw e;
        }
    }

    private SearchResultItem toSearchResultItem(CogneeSearchResult r) {
        return new SearchResultItem(
                r.memoryId(),
                r.meetingId(),
                r.meetingTitle(),
                r.memoryType(),
                r.content(),
                r.ownerName(),
                0.0, 0.0, r.score(),
                r.createdAt() != null ? r.createdAt() : Instant.now()
        );
    }
}
