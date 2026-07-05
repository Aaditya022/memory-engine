package com.mnemo.memoryengine.cognee;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class CogneeConfiguration {

    private final WebClient.Builder webClientBuilder;

    public CogneeConfiguration(WebClient.Builder webClientBuilder) {
        this.webClientBuilder = webClientBuilder;
    }

    @Bean
    public WebClient cogneeWebClient(
            @Value("${app.cognee.api-url}") String apiUrl,
            @Value("${app.cognee.api-key}") String apiKey,
            @Value("${app.cognee.timeout-ms}") int timeoutMs) {
        return webClientBuilder
                .baseUrl(apiUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
}
