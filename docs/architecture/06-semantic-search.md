# Semantic Search Architecture

```mermaid
graph TB
    subgraph Input["Search Input"]
        Q["Natural Language Query<br/>e.g. 'What pricing decision<br/>was made for Enterprise?'"]
        FILTERS["Filters<br/>Memory Type<br/>Date Range<br/>Confidence Score"]
    end

    subgraph VectorSearch["Vector Search Branch"]
        V1["Query Embedding<br/>Gemini text-embedding-004<br/>768 Dimensions"]
        V2["pgvector IVFFlat Index<br/>Approximate Nearest Neighbor<br/>Cosine Similarity"]
        V3["Top-K Results<br/>Ordered by Vector Distance"]
    end

    subgraph BMSearch["BM25 Search Branch"]
        B1["Query Parsing<br/>Lexical Tokenization<br/>Stop Word Removal"]
        B2["TSVector GIN Index<br/>Full-Text Search<br/>memories.search_vector"]
        B3["Top-K Results<br/>Ordered by ts_rank"]
    end

    subgraph Reranking["Reranking & Fusion"]
        R1["Score Normalization<br/>Min-Max Scaling<br/>0-1 Range"]
        R2["Weighted Combination<br/>60% Vector + 40% BM25<br/>Configurable Weights"]
        R3["Importance Score Boost<br/>Decision Type +20%<br/>High Confidence +10%"]
        R4["Final Ranking<br/>Deduplicated Results<br/>Top-N Returned"]
    end

    subgraph Output["Search Results"]
        O1["SearchResultItem[]<br/>Content, Memory Type<br/>Confidence, Source Meeting<br/>Relevance Score"]
    end

    subgraph Config["Configuration (application.yml)"]
        C1["search.weights.vector: 0.6"]
        C2["search.weights.bm25: 0.4"]
        C3["search.weights.importance: 1.5"]
        C4["search.top-k: 20"]
    end

    Q --> V1
    Q --> B1
    FILTERS --> R3

    V1 --> V2
    V2 --> V3
    V3 --> R1

    B1 --> B2
    B2 --> B3
    B3 --> R1

    R1 --> R2
    R2 --> R3
    C1 --> R2
    C2 --> R2
    C3 --> R3
    R3 --> R4
    R4 --> O1
```

**Diagram 6: Semantic Search** — Hybrid search architecture combining vector similarity and BM25 full-text search. The vector branch embeds the query via Gemini and searches the pgvector IVFFlat index using cosine similarity. The BM25 branch tokenizes the query and searches the tsvector GIN index. Results are normalized, combined using configurable weights (default 60% vector, 40% BM25), and boosted by importance score (decisions +20%, high-confidence +10%). The final ranked list is deduplicated and returned as `SearchResultItem[]`.
