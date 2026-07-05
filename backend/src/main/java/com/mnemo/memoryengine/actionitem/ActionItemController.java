package com.mnemo.memoryengine.actionitem;

import com.mnemo.memoryengine.actionitem.dto.ActionItemResponse;
import com.mnemo.memoryengine.common.ApiResponse;
import com.mnemo.memoryengine.security.AuthenticatedPrincipal;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/memory/action-items")
@Tag(name = "Action Items")
public class ActionItemController {

    private final ActionItemService actionItemService;

    public ActionItemController(ActionItemService actionItemService) {
        this.actionItemService = actionItemService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ActionItemResponse>>> list(
            @AuthenticationPrincipal AuthenticatedPrincipal principal,
            @RequestParam(required = false) ActionItemStatus status,
            @RequestParam(required = false) String ownerName) {
        List<ActionItemResponse> results = actionItemService.list(principal.organizationId(), status, ownerName)
                .stream().map(ActionItemResponse::from).toList();
        return ResponseEntity.ok(ApiResponse.ok(results));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ActionItemResponse>> updateStatus(@PathVariable UUID id,
                                                                          @RequestBody Map<String, String> body) {
        String raw = body.get("status");
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("Request body must include a non-empty 'status' field");
        }
        ActionItemStatus status = ActionItemStatus.valueOf(raw.trim().toUpperCase());
        return ResponseEntity.ok(ApiResponse.ok(ActionItemResponse.from(actionItemService.updateStatus(id, status))));
    }
}
