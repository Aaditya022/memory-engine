# Memory Pipeline Sequence Diagram

```mermaid
sequenceDiagram
    actor U as User
    participant F as Frontend<br/>(Next.js)
    participant S as Spring Boot<br/>Controller
    participant TPS as TranscriptProcessingService<br/>(Async)
    participant ES as ExtractionService
    participant MBS as MemoryBuilderService
    participant EMS as EmbeddingService
    participant CS as CogneeService
    participant DB as PostgreSQL<br/>+ pgvector
    participant R as Redis
    participant G as Gemini API

    Note over U, G: Transcript Ingestion
    U->>F: Upload meeting transcript
    F->>S: POST /transcripts { meetingId, rawText }
    S->>DB: Save transcript (processed=false)
    S->>TPS: @Async processTranscript(transcriptId)
    S-->>F: 202 Accepted { transcriptId }
    F-->>U: Processing in progress

    Note over TPS, G: Async Pipeline Execution
    TPS->>DB: Load transcript by ID
    TPS->>DB: Mark processed=true

    TPS->>ES: extractEntities(rawText)
    ES->>ES: Apply regex patterns<br/>(email, URL, dates)
    ES->>ES: Match technology vocabulary<br/>(Java, Python, Stripe, etc.)
    ES->>ES: Extract named entities<br/>(People, Organizations, Products)
    ES-->>TPS: List<ExtractedEntity>

    TPS->>DB: Save extracted entities
    TPS->>DB: Build entity_relationships<br/>from co-occurrence

    TPS->>MBS: buildMemories(extractedEntities)
    MBS->>MBS: Classify by type<br/>(DECISION, ACTION_ITEM,<br/>FACT, COMMITMENT, DISCUSSION)
    MBS->>MBS: Score importance<br/>& confidence
    MBS-->>TPS: List<Memory>

    TPS->>DB: Save memories
    DB->>DB: Auto-trigger search_vector<br/>generation (database trigger)

    loop For each Memory
        TPS->>EMS: generateEmbedding(memory.content)
        EMS->>G: POST embeddings:embedText<br/>model: text-embedding-004
        G-->>EMS: 768-dim vector
        EMS-->>TPS: float[768]
        TPS->>DB: UPDATE memory SET embedding=vector
    end

    TPS->>CS: syncToCognee(memories, entities)
    CS->>CS: Prepare CogneeRememberEvent
    CS->>R: Publish to kafka:cognee.memory.remember
    CS->>R: Send REST to Cognee API
    CS-->>TPS: Sync acknowledged

    TPS->>DB: Update transcript status

    Note over U, G: Search & Retrieval
    U->>F: "What pricing decision was made?"

    F->>S: POST /search { query, filters }
    S->>EMS: generateEmbedding(query)
    EMS->>G: Embed query text
    G-->>EMS: 768-dim query vector

    S->>DB: Vector search<br/>SELECT *, cosine_distance(embedding, :qv)<br/>ORDER BY distance<br/>LIMIT 20
    S->>DB: BM25 search<br/>SELECT *, ts_rank(search_vector, query)<br/>ORDER BY rank<br/>LIMIT 20

    S->>S: Normalize scores (0-1)
    S->>S: Weighted combination<br/>0.6 * vector + 0.4 * bm25
    S->>S: Apply importance boost<br/>Decisions: +20%, High conf: +10%
    S->>S: Deduplicate & rank

    S-->>F: SearchResultItem[]<br/>with relevance scores
    F-->>U: Display ranked results<br/>with source references
```

**Diagram 9: Memory Pipeline Sequence** — Complete end-to-end sequence from transcript ingestion to semantic search. The user uploads a transcript, which triggers an `@Async` pipeline: entity extraction (regex + tech vocabulary), memory building (classification + scoring), embedding generation (Gemini API, 768 dimensions stored in pgvector), and Cognee synchronization (Kafka + REST). The search flow embeds the user's query, performs hybrid BM25 + vector search, reranks with configurable weights and importance boosts, and returns deduplicated results.
