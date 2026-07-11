package com.mnemo.memoryengine.integration;

import com.mnemo.memoryengine.common.ApiResponse;
import com.mnemo.memoryengine.integration.dto.IntegrationResponse;
import com.mnemo.memoryengine.integration.dto.UpdateIntegrationRequest;
import com.mnemo.memoryengine.security.AuthenticatedPrincipal;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/integrations")
@Tag(name = "Integrations")
public class IntegrationController {

    private final IntegrationService integrationService;

    public IntegrationController(IntegrationService integrationService) {
        this.integrationService = integrationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<IntegrationResponse>>> list(
            @AuthenticationPrincipal AuthenticatedPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(integrationService.list(principal.organizationId())));
    }

    @PutMapping("/{name}")
    public ResponseEntity<ApiResponse<IntegrationResponse>> update(
            @AuthenticationPrincipal AuthenticatedPrincipal principal,
            @PathVariable String name,
            @RequestBody UpdateIntegrationRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(integrationService.update(principal.organizationId(), name, request)));
    }

    @DeleteMapping("/{name}")
    public ResponseEntity<ApiResponse<Void>> disconnect(
            @AuthenticationPrincipal AuthenticatedPrincipal principal,
            @PathVariable String name) {
        integrationService.disconnect(principal.organizationId(), name);
        return ResponseEntity.ok(ApiResponse.ok(null, "Integration disconnected"));
    }
}
