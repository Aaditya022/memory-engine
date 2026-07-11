package com.mnemo.memoryengine.graph;

import com.mnemo.memoryengine.common.ApiResponse;
import com.mnemo.memoryengine.graph.dto.GraphResponse;
import com.mnemo.memoryengine.security.AuthenticatedPrincipal;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/graph")
@Tag(name = "Knowledge Graph")
public class GraphController {

    private final GraphService graphService;

    public GraphController(GraphService graphService) {
        this.graphService = graphService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<GraphResponse>> getFullGraph(
            @AuthenticationPrincipal AuthenticatedPrincipal principal,
            @RequestParam(required = false) String entity,
            @RequestParam(defaultValue = "2") int depth) {
        if (entity != null && !entity.isBlank()) {
            return ResponseEntity.ok(ApiResponse.ok(
                graphService.getEntitySubgraph(principal.organizationId(), entity, depth)));
        }
        return ResponseEntity.ok(ApiResponse.ok(graphService.getFullGraph(principal.organizationId())));
    }

    @GetMapping("/meeting/{meetingId}")
    public ResponseEntity<ApiResponse<GraphResponse>> getGraphByMeeting(
            @PathVariable UUID meetingId) {
        return ResponseEntity.ok(ApiResponse.ok(graphService.getGraphByMeeting(meetingId)));
    }
}
