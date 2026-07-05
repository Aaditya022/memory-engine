package com.mnemo.memoryengine.cognee.kafka.event;

import java.util.UUID;

public record CogneeForgetEvent(
        UUID memoryId
) {}
