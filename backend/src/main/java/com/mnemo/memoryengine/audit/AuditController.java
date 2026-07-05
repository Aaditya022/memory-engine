package com.mnemo.memoryengine.audit;

import com.mnemo.memoryengine.audit.dto.AuditLogResponse;
import com.mnemo.memoryengine.common.ApiResponse;
import com.mnemo.memoryengine.security.AuthenticatedPrincipal;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/audit")
@Tag(name = "Admin - Audit")
public class AuditController {

    private final AuditLogRepository auditLogRepository;

    public AuditController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AuditLogResponse>>> list(@AuthenticationPrincipal AuthenticatedPrincipal principal,
                                                                      Pageable pageable) {
        Page<AuditLogResponse> results = auditLogRepository
                .findByOrganizationId(principal.organizationId(), pageable)
                .map(AuditLogResponse::from);
        return ResponseEntity.ok(ApiResponse.ok(results));
    }
}
