# Backend Architecture

```mermaid
graph TB
    subgraph Controllers["Controller Layer"]
        AC["AuthController<br/>/auth/*"]
        MC["MeetingController<br/>/meetings/*"]
        TC["TranscriptController<br/>/transcripts/*"]
        SeC["SearchController<br/>/search, /memory/search"]
        DC["DecisionController<br/>/memory/decisions"]
        AIC["ActionItemController<br/>/memory/action-items"]
        TLC["TimelineController<br/>/memory/timeline"]
        AUC["AuditController<br/>/audit"]
        HC["HealthController<br/>/health"]
    end

    subgraph Security["Security Layer"]
        JAF["JwtAuthFilter<br/>Token Validation"]
        RLF["RateLimitFilter<br/>Redis Backed"]
        TB["TokenBlacklistService<br/>Redis"]
    end

    subgraph Services["Service Layer"]
        AS["AuthService<br/>Register / Login / Refresh"]
        MS["MeetingService<br/>CRUD + Pagination"]
        TPS["TranscriptProcessingService<br/>@Async Pipeline"]
        ES["ExtractionService<br/>Entity Extraction"]
        MBS["MemoryBuilderService<br/>Memory Creation"]
        EMS["EmbeddingService<br/>Gemini Embeddings"]
        HSS["HybridSearchService<br/>BM25 + Vector Rerank"]
        CS["CogneeService<br/>REST Client + Kafka"]
        TLS["TimelineService"]
        AIS["ActionItemService"]
    end

    subgraph Data["Data Access Layer"]
        UR["UserRepository"]
        MR["MeetingRepository"]
        TR["TranscriptRepository"]
        ER["EntityRepository<br/>ExtractedEntity"]
        ERR["EntityRelationshipRepository"]
        MR2["MemoryRepository"]
        DR["DecisionRepository"]
        AIR["ActionItemRepository"]
        ALR["AuditLogRepository"]
    end

    subgraph External["External Integrations"]
        GC["GeminiClient<br/>text-embedding-004"]
        COG["Cognee<br/>Memory Engine"]
        KF["Kafka<br/>cognee.memory.remember<br/>cognee.memory.improve<br/>cognee.memory.forget"]
    end

    subgraph Config["Infrastructure Config"]
        RC["RedisConfig<br/>Lettuce Client"]
        OC["OpenApiConfig<br/>Swagger UI"]
        WC["WebClientConfig<br/>HTTP Client"]
        CC["CogneeConfiguration<br/>Connection Settings"]
    end

    Controllers --> Security
    Security --> Services
    Services --> Data
    Services --> External
    TPS --> ES
    ES --> MBS
    MBS --> EMS
    EMS --> GC
    MBS --> HSS
    CS --> COG
    CS --> KF
```

**Diagram 2: Backend Architecture** — Spring Boot layered architecture. Controllers handle HTTP requests through security filters (JWT validation, Redis-backed rate limiting). The service layer orchestrates business logic, including the async transcript processing pipeline (extraction → memory building → embedding generation). The hybrid search service combines BM25 (tsvector) with vector cosine similarity. Cognee integration uses both REST and Kafka events. Configuration classes manage Redis, Swagger/OpenAPI, HTTP clients, and Cognee connection settings.
