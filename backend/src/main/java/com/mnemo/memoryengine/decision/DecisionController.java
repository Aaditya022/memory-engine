package com.mnemo.memoryengine.decision;

import com.mnemo.memoryengine.common.ApiResponse;
import com.mnemo.memoryengine.decision.dto.DecisionResponse;
import com.mnemo.memoryengine.security.AuthenticatedPrincipal;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/memory/decisions")
@Tag(name = "Decisions")
public class DecisionController {

    private final DecisionRepository decisionRepository;

    public DecisionController(DecisionRepository decisionRepository) {
        this.decisionRepository = decisionRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DecisionResponse>>> list(@AuthenticationPrincipal AuthenticatedPrincipal principal) {
        List<DecisionResponse> results = decisionRepository.findByOrganizationId(principal.organizationId())
                .stream().map(DecisionResponse::from).toList();
        return ResponseEntity.ok(ApiResponse.ok(results));
    }
}
