package com.mnemo.memoryengine.cognee;

import com.mnemo.memoryengine.cognee.dto.CogneeMemoryRequest;
import com.mnemo.memoryengine.cognee.dto.CogneeMemoryResponse;
import com.mnemo.memoryengine.cognee.dto.CogneeRecallRequest;
import com.mnemo.memoryengine.cognee.dto.CogneeRecallResponse;
import com.mnemo.memoryengine.cognee.exception.CogneeApiException;
import com.mnemo.memoryengine.cognee.exception.CogneeConnectionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.UUID;

@Component
public class CogneeClient {

    private static final Logger log = LoggerFactory.getLogger(CogneeClient.class);

    private final WebClient webClient;

    public CogneeClient(WebClient cogneeWebClient) {
        this.webClient = cogneeWebClient;
    }

    public CogneeMemoryResponse remember(CogneeMemoryRequest request) {
        return post("/v1/cognee/remember", request, CogneeMemoryResponse.class);
    }

    public CogneeRecallResponse recall(CogneeRecallRequest request) {
        return post("/v1/cognee/recall", request, CogneeRecallResponse.class);
    }

    public CogneeMemoryResponse improve(CogneeMemoryRequest request) {
        return post("/v1/cognee/improve", request, CogneeMemoryResponse.class);
    }

    public void forget(UUID memoryId) {
        try {
            webClient.delete()
                    .uri("/v1/cognee/forget/{id}", memoryId)
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                            response -> response.bodyToMono(String.class)
                                    .map(body -> new CogneeApiException(response.statusCode().value(), body)))
                    .toBodilessEntity()
                    .retryWhen(Retry.backoff(2, Duration.ofMillis(500)))
                    .block();
        } catch (CogneeApiException e) {
            throw e;
        } catch (Exception e) {
            throw new CogneeConnectionException("Failed to call Cognee forget()", e);
        }
    }

    private <T, R> R post(String path, T request, Class<R> responseType) {
        try {
            return webClient.post()
                    .uri(path)
                    .bodyValue(request)
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(),
                            response -> response.bodyToMono(String.class)
                                    .map(body -> new CogneeApiException(response.statusCode().value(), body)))
                    .bodyToMono(responseType)
                    .retryWhen(Retry.backoff(2, Duration.ofMillis(500)))
                    .block();
        } catch (CogneeApiException e) {
            throw e;
        } catch (Exception e) {
            throw new CogneeConnectionException("Failed to call Cognee at " + path, e);
        }
    }
}
