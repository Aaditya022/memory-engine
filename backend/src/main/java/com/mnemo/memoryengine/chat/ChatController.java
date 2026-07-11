package com.mnemo.memoryengine.chat;

import com.mnemo.memoryengine.chat.dto.ChatRequest;
import com.mnemo.memoryengine.chat.dto.ChatResponse;
import com.mnemo.memoryengine.common.ApiResponse;
import com.mnemo.memoryengine.security.AuthenticatedPrincipal;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@RestController
@RequestMapping("/chat")
@Tag(name = "AI Memory Chat")
public class ChatController {

    private final ChatService chatService;
    private final ExecutorService executor = Executors.newCachedThreadPool();

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ChatResponse>> chat(
            @AuthenticationPrincipal AuthenticatedPrincipal principal,
            @Valid @RequestBody ChatRequest request) {
        ChatResponse response = chatService.chat(principal.organizationId(), request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter chatStream(
            @AuthenticationPrincipal AuthenticatedPrincipal principal,
            @Valid @RequestBody ChatRequest request) {
        SseEmitter emitter = new SseEmitter(300000L);

        executor.execute(() -> {
            try {
                ChatResponse response = chatService.chat(principal.organizationId(), request);

                emitter.send(SseEmitter.event()
                        .name("message")
                        .data(Map.of("text", response.answer())));

                emitter.send(SseEmitter.event()
                        .name("done")
                        .data(response));

                emitter.complete();
            } catch (IOException e) {
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }
}
