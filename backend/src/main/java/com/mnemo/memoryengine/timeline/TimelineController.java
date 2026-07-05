package com.mnemo.memoryengine.timeline;

import com.mnemo.memoryengine.common.ApiResponse;
import com.mnemo.memoryengine.security.AuthenticatedPrincipal;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/memory/timeline")
@Tag(name = "Timeline")
public class TimelineController {

    private final TimelineService timelineService;

    public TimelineController(TimelineService timelineService) {
        this.timelineService = timelineService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TimelineEvent>>> timeline(
            @AuthenticationPrincipal AuthenticatedPrincipal principal,
            @RequestParam(required = false) String topic) {
        return ResponseEntity.ok(ApiResponse.ok(timelineService.getTimeline(principal.organizationId(), topic)));
    }
}
