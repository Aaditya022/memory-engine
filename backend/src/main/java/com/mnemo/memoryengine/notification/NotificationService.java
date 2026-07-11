package com.mnemo.memoryengine.notification;

import com.mnemo.memoryengine.notification.dto.NotificationEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final Map<UUID, List<SseEmitter>> organizationEmitters = new ConcurrentHashMap<>();

    public SseEmitter createEmitter(UUID organizationId) {
        SseEmitter emitter = new SseEmitter(0L);

        List<SseEmitter> emitters = organizationEmitters
                .computeIfAbsent(organizationId, k -> new CopyOnWriteArrayList<>());
        emitters.add(emitter);

        emitter.onCompletion(() -> removeEmitter(organizationId, emitter));
        emitter.onTimeout(() -> removeEmitter(organizationId, emitter));
        emitter.onError(e -> removeEmitter(organizationId, emitter));

        try {
            emitter.send(SseEmitter.event()
                    .name("connected")
                    .data(Map.of("status", "connected", "organizationId", organizationId)));
        } catch (IOException e) {
            removeEmitter(organizationId, emitter);
        }

        return emitter;
    }

    public void broadcast(UUID organizationId, NotificationEvent event) {
        List<SseEmitter> emitters = organizationEmitters.get(organizationId);
        if (emitters == null || emitters.isEmpty()) return;

        emitters.removeIf(emitter -> {
            try {
                emitter.send(SseEmitter.event()
                        .name("notification")
                        .data(event));
                return false;
            } catch (IOException e) {
                return true;
            }
        });
    }

    private void removeEmitter(UUID organizationId, SseEmitter emitter) {
        List<SseEmitter> emitters = organizationEmitters.get(organizationId);
        if (emitters != null) {
            emitters.remove(emitter);
        }
    }
}
