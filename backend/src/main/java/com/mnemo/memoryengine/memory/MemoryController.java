package com.mnemo.memoryengine.memory;

import com.mnemo.memoryengine.cognee.kafka.CogneeEventProducer;
import com.mnemo.memoryengine.common.ApiResponse;
import com.mnemo.memoryengine.memory.dto.MemoryResponse;
import com.mnemo.memoryengine.search.HybridSearchService;
import com.mnemo.memoryengine.search.SearchResultItem;
import com.mnemo.memoryengine.security.AuthenticatedPrincipal;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Convenience GET-based read endpoints over memories, mirroring the PRD's
 * `/memory/*` surface. POST /search (SearchController) offers the same hybrid
 * search with richer filtering; these are thinner, URL-friendly wrappers.
 */
@RestController
@RequestMapping("/memory")
@Tag(name = "Memory")
public class MemoryController {

    private final HybridSearchService hybridSearchService;
    private final MemoryRepository memoryRepository;
    private final CogneeEventProducer eventProducer;

    public MemoryController(HybridSearchService hybridSearchService, MemoryRepository memoryRepository,
                             CogneeEventProducer eventProducer) {
        this.hybridSearchService = hybridSearchService;
        this.memoryRepository = memoryRepository;
        this.eventProducer = eventProducer;
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<SearchResultItem>>> search(
            @AuthenticationPrincipal AuthenticatedPrincipal principal,
            @RequestParam String query,
            @RequestParam(required = false) Integer topK,
            @RequestParam(required = false) String memoryType,
            @RequestParam(required = false) String ownerName) {
        return ResponseEntity.ok(ApiResponse.ok(
                hybridSearchService.search(principal.organizationId(), query, topK, memoryType, ownerName)));
    }

    @GetMapping("/person/{name}")
    public ResponseEntity<ApiResponse<List<MemoryResponse>>> byPerson(
            @AuthenticationPrincipal AuthenticatedPrincipal principal,
            @PathVariable String name) {
        List<MemoryResponse> results = memoryRepository
                .findByOrganizationIdAndOwnerNameIgnoreCase(principal.organizationId(), name)
                .stream().map(MemoryResponse::from).toList();
        return ResponseEntity.ok(ApiResponse.ok(results));
    }

    @GetMapping("/project/{name}")
    public ResponseEntity<ApiResponse<List<SearchResultItem>>> byProject(
            @AuthenticationPrincipal AuthenticatedPrincipal principal,
            @PathVariable String name) {
        // "Project" queries route through hybrid search since project mentions
        // live inside memory content/entities rather than as a first-class column.
        return ResponseEntity.ok(ApiResponse.ok(
                hybridSearchService.search(principal.organizationId(), name, 20, null, null)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> forget(
            @AuthenticationPrincipal AuthenticatedPrincipal principal,
            @PathVariable java.util.UUID id) {
        var memory = memoryRepository.findById(id)
                .orElseThrow(() -> new com.mnemo.memoryengine.common.ResourceNotFoundException("Memory not found: " + id));
        eventProducer.publishForgetEvent(id);
        memoryRepository.delete(memory);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
