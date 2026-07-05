# Hybrid Search API

Base URL: `http://localhost:8080`

All endpoints require authentication. Include the JWT access token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

---

## Search (POST)

Performs a hybrid search combining BM25 full-text search (PostgreSQL tsvector) with vector cosine similarity (pgvector). Results are reranked with a weighted score and returned in descending order.

**POST** `/search`

### Request Body

```json
{
  "query": "micro-frontend architecture decisions",
  "topK": 20,
  "memoryType": "DECISION",
  "ownerName": "Elena"
}
```

| Field      | Type      | Required | Description                                          |
|------------|-----------|----------|------------------------------------------------------|
| query      | `String`  | Yes      | Natural language search query (`@NotBlank`)           |
| topK       | `Integer` | No       | Max results (defaults to `app.search.default-top-k`)  |
| memoryType | `String`  | No       | Filter: `DECISION`, `ACTION_ITEM`, `FACT`, `COMMITMENT`, `DISCUSSION` |
| ownerName  | `String`  | No       | Filter by owner name (partial, case-insensitive)      |

### Response — 200 OK

```json
{
  "success": true,
  "data": [
    {
      "memoryId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "meetingId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "meetingTitle": "Architecture Decision: API Migration",
      "memoryType": "DECISION",
      "content": "Decided to adopt micro-frontend architecture for the dashboard module to enable independent team deployments.",
      "ownerName": "Elena Rodriguez",
      "bm25Score": 0.89,
      "vectorScore": 0.94,
      "finalScore": 0.92,
      "createdAt": "2026-07-02T15:30:00Z"
    },
    {
      "memoryId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "meetingId": "d4e5f6a7-b8c9-0123-defa-1234567890ab",
      "meetingTitle": "Sprint Planning — Week 12",
      "memoryType": "ACTION_ITEM",
      "content": "Sarah Chen to finalize API contract for memory search endpoint.",
      "ownerName": "Sarah Chen",
      "bm25Score": 0.72,
      "vectorScore": 0.85,
      "finalScore": 0.78,
      "createdAt": "2026-06-30T10:00:00Z"
    }
  ],
  "message": null,
  "timestamp": "2026-07-05T12:00:00Z"
}
```

### Validation Error — 400 Bad Request

```json
{
  "success": false,
  "data": {
    "query": "must not be blank"
  },
  "message": "Validation failed",
  "timestamp": "2026-07-05T12:00:00Z"
}
```

### cURL

```bash
curl -X POST http://localhost:8080/search \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "query": "micro-frontend architecture decisions",
    "topK": 20,
    "memoryType": "DECISION",
    "ownerName": "Elena"
  }'
```

---

## Search (GET)

A lightweight GET variant of hybrid search. See the [Memory API](memory.md#search-memories-get) for details.

**GET** `/memory/search?query=...`

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  "http://localhost:8080/memory/search?query=micro-frontend&topK=10&memoryType=DECISION"
```

---

## Search Algorithm

The `HybridSearchService` combines two retrieval approaches:

| Component   | Method                     | Index              |
|-------------|----------------------------|--------------------|
| BM25        | PostgreSQL `tsvector` full-text search | GIN index on `search_vector` column |
| Vector      | Cosine similarity on embeddings | IVFFlat index on `embedding` column (pgvector) |

### Scoring

```
finalScore = α × bm25Score + (1 - α) × vectorScore
```

Where `α` is a configurable weight (default: `0.3`) set via `app.search.bm25-weight`.

### SearchResultItem

| Field       | Type     | Description                              |
|-------------|----------|------------------------------------------|
| memoryId    | `UUID`   | Memory identifier                        |
| meetingId   | `UUID`   | Associated meeting                       |
| meetingTitle| `String` | Meeting title                            |
| memoryType  | `String` | Memory type enum                         |
| content     | `String` | Memory content                           |
| ownerName   | `String` | Owner name                               |
| bm25Score   | `double` | BM25 relevance score (0.0 – 1.0)         |
| vectorScore | `double` | Cosine similarity score (0.0 – 1.0)      |
| finalScore  | `double` | Weighted combined score (0.0 – 1.0)      |
| createdAt   | `Instant`| Record creation timestamp                |

---

## Query Parameters (GET /memory/search)

| Parameter  | Type      | Required | Description            |
|------------|-----------|----------|------------------------|
| query      | `String`  | Yes      | Search query           |
| topK       | `Integer` | No       | Max results            |
| memoryType | `String`  | No       | Memory type filter     |
| ownerName  | `String`  | No       | Owner name filter      |

---

## HTTP Status Codes

| Status | Description                         |
|--------|-------------------------------------|
| 200    | Results returned (may be empty)     |
| 400    | Validation error (blank query)      |
| 401    | Missing or invalid token            |
| 429    | Rate limit exceeded                 |
| 500    | Internal server error               |
