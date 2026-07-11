package com.mnemo.memoryengine.graph.dto;

import java.util.List;

public record GraphResponse(
    List<GraphNode> nodes,
    List<GraphEdge> edges
) {}
