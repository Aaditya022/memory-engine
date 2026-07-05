package com.mnemo.memoryengine.search;

import com.mnemo.memoryengine.common.ApiResponse;
import com.mnemo.memoryengine.search.dto.SearchRequest;
import com.mnemo.memoryengine.security.AuthenticatedPrincipal;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/search")
@Tag(name = "Hybrid Search")
public class SearchController {

    private final HybridSearchService hybridSearchService;

    public SearchController(HybridSearchService hybridSearchService) {
        this.hybridSearchService = hybridSearchService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<List<SearchResultItem>>> search(
            @AuthenticationPrincipal AuthenticatedPrincipal principal,
            @Valid @RequestBody SearchRequest request) {
        List<SearchResultItem> results = hybridSearchService.search(
                principal.organizationId(), request.query(), request.topK(),
                request.memoryType(), request.ownerName());
        return ResponseEntity.ok(ApiResponse.ok(results));
    }
}
