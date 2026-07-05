package com.mnemo.memoryengine.cognee.kafka;

import com.mnemo.memoryengine.cognee.CogneeClient;
import com.mnemo.memoryengine.cognee.dto.CogneeMemoryRequest;
import com.mnemo.memoryengine.cognee.kafka.event.CogneeForgetEvent;
import com.mnemo.memoryengine.cognee.kafka.event.CogneeImproveEvent;
import com.mnemo.memoryengine.cognee.kafka.event.CogneeRememberEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class CogneeEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(CogneeEventConsumer.class);

    private final CogneeClient cogneeClient;

    public CogneeEventConsumer(CogneeClient cogneeClient) {
        this.cogneeClient = cogneeClient;
    }

    @KafkaListener(topics = CogneeKafkaTopicConfig.TOPIC_REMEMBER)
    public void onRememberEvent(CogneeRememberEvent event) {
        try {
            CogneeMemoryRequest request = new CogneeMemoryRequest(
                    event.memoryId(), event.content(), event.memoryType(),
                    event.ownerName(), event.confidence(), event.importanceScore(),
                    event.organizationId(), event.meetingId(),
                    Map.of("memoryType", event.memoryType() != null ? event.memoryType() : ""));
            cogneeClient.remember(request);
            log.debug("Consumer processed remember event for memory {}", event.memoryId());
        } catch (Exception e) {
            log.error("Failed to process remember event for memory {}: {}", event.memoryId(), e.getMessage(), e);
        }
    }

    @KafkaListener(topics = CogneeKafkaTopicConfig.TOPIC_IMPROVE)
    public void onImproveEvent(CogneeImproveEvent event) {
        try {
            CogneeMemoryRequest request = new CogneeMemoryRequest(
                    event.memoryId(), event.content(), event.memoryType(),
                    event.ownerName(), event.confidence(), event.importanceScore(),
                    event.organizationId(), event.meetingId(),
                    Map.of("memoryType", event.memoryType() != null ? event.memoryType() : ""));
            cogneeClient.improve(request);
            log.debug("Consumer processed improve event for memory {}", event.memoryId());
        } catch (Exception e) {
            log.error("Failed to process improve event for memory {}: {}", event.memoryId(), e.getMessage(), e);
        }
    }

    @KafkaListener(topics = CogneeKafkaTopicConfig.TOPIC_FORGET)
    public void onForgetEvent(CogneeForgetEvent event) {
        try {
            cogneeClient.forget(event.memoryId());
            log.debug("Consumer processed forget event for memory {}", event.memoryId());
        } catch (Exception e) {
            log.error("Failed to process forget event for memory {}: {}", event.memoryId(), e.getMessage(), e);
        }
    }
}
