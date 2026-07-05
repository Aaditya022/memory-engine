package com.mnemo.memoryengine.meeting;

import com.mnemo.memoryengine.common.ApiResponse;
import com.mnemo.memoryengine.meeting.dto.CreateMeetingRequest;
import com.mnemo.memoryengine.meeting.dto.MeetingResponse;
import com.mnemo.memoryengine.security.AuthenticatedPrincipal;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/meetings")
@Tag(name = "Meetings")
public class MeetingController {

    private final MeetingService meetingService;

    public MeetingController(MeetingService meetingService) {
        this.meetingService = meetingService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MeetingResponse>> create(@AuthenticationPrincipal AuthenticatedPrincipal principal,
                                                                 @Valid @RequestBody CreateMeetingRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(meetingService.createMeeting(principal, request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<MeetingResponse>>> list(@AuthenticationPrincipal AuthenticatedPrincipal principal,
                                                                     Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(meetingService.listMeetings(principal.organizationId(), pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MeetingResponse>> get(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(meetingService.getMeeting(id)));
    }
}
