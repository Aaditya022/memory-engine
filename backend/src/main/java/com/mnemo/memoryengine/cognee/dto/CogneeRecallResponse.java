package com.mnemo.memoryengine.cognee.dto;

import java.util.List;

public record CogneeRecallResponse(
        List<CogneeSearchResult> results
) {}
