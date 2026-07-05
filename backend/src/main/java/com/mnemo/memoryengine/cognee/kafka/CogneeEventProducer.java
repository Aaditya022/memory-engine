package com.mnemo.memoryengine.cognee.kafka;

import com.mnemo.memoryengine.cognee.kafka.event.CogneeForgetEvent;
import com.mnemo.memoryengine.cognee.kafka.event.CogneeImproveEvent;
import com.mnemo.memoryengine.cognee.kafka.event.CogneeRememberEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class CogneeEventProducer {

    private static final Logger log = LoggerFactory.getLogger(CogneeEventProducer.class);

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public CogneeEventProducer(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishRememberEvent(CogneeRememberEvent event) {
        log.debug("Publishing remember event for memory {}", event.memoryId());
        kafkaTemplate.send(CogneeKafkaTopicConfig.TOPIC_REMEMBER,
                event.memoryId() != null ? event.memoryId().toString() : null, event);
    }

    public void publishImproveEvent(CogneeImproveEvent event) {
        log.debug("Publishing improve event for memory {}", event.memoryId());
        kafkaTemplate.send(CogneeKafkaTopicConfig.TOPIC_IMPROVE,
                event.memoryId() != null ? event.memoryId().toString() : null, event);
    }

    public void publishForgetEvent(UUID memoryId) {
        log.debug("Publishing forget event for memory {}", memoryId);
        kafkaTemplate.send(CogneeKafkaTopicConfig.TOPIC_FORGET,
                memoryId.toString(), new CogneeForgetEvent(memoryId));
    }
}
