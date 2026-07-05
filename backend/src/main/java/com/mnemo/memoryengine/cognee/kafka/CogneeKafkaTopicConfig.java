package com.mnemo.memoryengine.cognee.kafka;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CogneeKafkaTopicConfig {

    public static final String TOPIC_REMEMBER = "cognee.memory.remember";
    public static final String TOPIC_IMPROVE = "cognee.memory.improve";
    public static final String TOPIC_FORGET = "cognee.memory.forget";

    @Bean
    public NewTopic rememberTopic() {
        return new NewTopic(TOPIC_REMEMBER, 1, (short) 1);
    }

    @Bean
    public NewTopic improveTopic() {
        return new NewTopic(TOPIC_IMPROVE, 1, (short) 1);
    }

    @Bean
    public NewTopic forgetTopic() {
        return new NewTopic(TOPIC_FORGET, 1, (short) 1);
    }
}
