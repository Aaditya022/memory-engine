package com.mnemo.memoryengine.transcript;

import com.mnemo.memoryengine.common.ApiResponse;
import com.mnemo.memoryengine.transcript.dto.IngestTranscriptRequest;
import com.mnemo.memoryengine.transcript.dto.TranscriptResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/transcripts")
@Tag(name = "Transcripts")
public class TranscriptController {

    private final TranscriptService transcriptService;

    public TranscriptController(TranscriptService transcriptService) {
        this.transcriptService = transcriptService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TranscriptResponse>> ingest(@Valid @RequestBody IngestTranscriptRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(transcriptService.ingest(request),
                "Transcript accepted — processing in background"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TranscriptResponse>> get(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(transcriptService.get(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TranscriptResponse>>> listByMeeting(@RequestParam UUID meetingId) {
        return ResponseEntity.ok(ApiResponse.ok(transcriptService.listByMeeting(meetingId)));
    }
}
