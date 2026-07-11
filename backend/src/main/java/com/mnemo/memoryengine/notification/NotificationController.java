package com.mnemo.memoryengine.notification;

import com.mnemo.memoryengine.security.AuthenticatedPrincipal;
import com.mnemo.memoryengine.security.JwtUtil;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.UUID;

@RestController
@RequestMapping("/notifications")
@Tag(name = "Notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final JwtUtil jwtUtil;

    public NotificationController(NotificationService notificationService, JwtUtil jwtUtil) {
        this.notificationService = notificationService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@AuthenticationPrincipal AuthenticatedPrincipal principal,
                              @RequestParam(required = false) String token) {
        UUID orgId;
        if (principal != null) {
            orgId = principal.organizationId();
        } else if (token != null && !token.isBlank()) {
            try {
                orgId = jwtUtil.extractOrganizationId(token);
            } catch (Exception e) {
                SseEmitter errorEmitter = new SseEmitter(0L);
                errorEmitter.completeWithError(new IllegalArgumentException("Invalid token"));
                return errorEmitter;
            }
        } else {
            SseEmitter errorEmitter = new SseEmitter(0L);
            errorEmitter.completeWithError(new IllegalArgumentException("Authentication required"));
            return errorEmitter;
        }
        return notificationService.createEmitter(orgId);
    }
}
