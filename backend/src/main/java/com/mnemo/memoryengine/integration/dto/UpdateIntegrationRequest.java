package com.mnemo.memoryengine.integration.dto;

public record UpdateIntegrationRequest(
    boolean enabled,
    String configJson
) {}
