# Knowledge Graph API

Base URL: `http://localhost:8080`

All endpoints require authentication. Include the JWT access token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

The Knowledge Graph is not exposed as a dedicated entity CRUD API. Instead, it is implicitly constructed from extracted entities, entity relationships, and memories — queryable through the `/memory/person/{name}`, `/memory/project/{name}`, and search endpoints.

---

## Overview

The knowledge graph is built during transcript processing. The `ExtractionService` applies rule-based extraction (regex + technology vocabulary) to identify:

- **People** — Meeting participants and mentioned persons
- **Organizations** — Company names, team structures
- **Technologies** — Tech stack, tools, frameworks
- **Projects** — Cross-meeting topics
- **Dates** — Temporal references

These entities are stored in the `extracted_entities` table and linked via the `entity_relationships` table. Each relationship records a source entity, target entity, relationship type, confidence score, and originating meeting.

### Entity Types

| Entity Type    | Examples                                         |
|----------------|--------------------------------------------------|
| `PERSON`       | Sarah Chen, Marcus Johnson                       |
| `ORGANIZATION` | Acme Corp, Engineering Team                      |
| `PRODUCT`      | Memory Engine, Dashboard Module                  |
| `DATE`         | July 5, 2026, Q3 2026                            |
| `TECHNOLOGY`   | PostgreSQL, Tailwind CSS, React, Kafka           |
| `PROJECT`      | API Migration, Micro-frontend Architecture       |

### Relationship Types

| Relationship Type     | Example                                        |
|-----------------------|------------------------------------------------|
| `MENTIONS`            | Meeting → Technology                           |
| `ASSIGNED_TO`         | Action Item → Person                           |
| `DECIDED_BY`          | Decision → Person                              |
| `RELATES_TO`          | Memory → Project                               |
| `PART_OF`             | Technology → Project                           |

These relationships are stored in the `entity_relationships` table with structure:

| Field        | Type      | Description                              |
|--------------|-----------|------------------------------------------|
| sourceEntity | `String`  | Source entity value                      |
| relationship | `String`  | Relationship type                        |
| targetEntity | `String`  | Target entity value                      |
| confidence   | `Float`   | Confidence score (0.0 – 1.0)            |
| meetingId    | `UUID`    | Originating meeting (FK)                |

---

## Query by Person

Retrieves all memories associated with a person. Useful for building a personal knowledge graph.

**GET** `/memory/person/{name}`

### Path Parameters

| Parameter | Type     | Description                         |
|-----------|----------|-------------------------------------|
| name      | `String` | Person name (case-insensitive match)|

### Response — 200 OK

```json
{
  "success": true,
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "meetingId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "memoryType": "ACTION_ITEM",
      "content": "Sarah Chen to finalize API contract for memory search endpoint.",
      "ownerName": "Sarah Chen",
      "eventDate": "2026-07-02",
      "confidence": 0.95,
      "importanceScore": 0.88,
      "createdAt": "2026-07-02T15:30:00Z"
    }
  ],
  "message": null,
  "timestamp": "2026-07-05T12:00:00Z"
}
```

### cURL

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  http://localhost:8080/memory/person/Sarah%20Chen
```

---

## Query by Project

Searches memories matching a project or topic name via hybrid search. Useful for understanding all context around a specific initiative.

**GET** `/memory/project/{name}`

### Path Parameters

| Parameter | Type     | Description              |
|-----------|----------|--------------------------|
| name      | `String` | Project or topic name    |

### Response — 200 OK

```json
{
  "success": true,
  "data": [
    {
      "memoryId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "meetingId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "meetingTitle": "Architecture Decision: API Migration",
      "memoryType": "DECISION",
      "content": "Decided to adopt micro-frontend architecture for the dashboard module.",
      "ownerName": "Elena Rodriguez",
      "bm25Score": 0.91,
      "vectorScore": 0.88,
      "finalScore": 0.90,
      "createdAt": "2026-07-02T15:30:00Z"
    }
  ],
  "message": null,
  "timestamp": "2026-07-05T12:00:00Z"
}
```

### cURL

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  http://localhost:8080/memory/project/micro-frontend
```

---

## Query by Timeline

Retrieves a chronological feed of memory events, optionally filtered by topic.

**GET** `/memory/timeline`

### Query Parameters

| Parameter | Type     | Required | Description                    |
|-----------|----------|----------|--------------------------------|
| topic     | `String` | No       | Filter by topic keyword        |

### Response — 200 OK

```json
{
  "success": true,
  "data": [
    {
      "memoryId": "d4e5f6a7-b8c9-0123-defa-1234567890ab",
      "meetingId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "meetingTitle": "Security Audit Review",
      "memoryType": "DECISION",
      "content": "Security team flagged that JWT token rotation needs to be hardened.",
      "ownerName": "Sarah Chen",
      "eventDate": "2026-07-04",
      "createdAt": "2026-07-04T14:00:00Z"
    }
  ],
  "message": null,
  "timestamp": "2026-07-05T12:00:00Z"
}
```

### cURL

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  "http://localhost:8080/memory/timeline?topic=security"
```

---

## Graph Construction Pipeline

The knowledge graph is built through a multi-stage pipeline triggered when a transcript is ingested:

```
Ingest Transcript
       ↓
ExtractionService — Regex + tech vocabulary entity extraction
       ↓
Entities stored in extracted_entities table
       ↓
Entity relationships computed (co-occurrence, sequential, temporal)
       ↓
Relationships stored in entity_relationships table
       ↓
Memories classified and stored in memories table
       ↓
Embeddings generated via Gemini text-embedding-004
       ↓
Cognee sync via REST + Kafka for external graph enrichment
```

### Graph Construction Methods

| Method                  | Description                                       |
|-------------------------|---------------------------------------------------|
| Entity Co-occurrence    | Entities mentioned together in the same meeting   |
| Sequential Linking      | Discussion → Decision → Action Item chains        |
| Temporal Connection     | Cross-meeting context based on timeline ordering  |

---

## Storage Layer

| Table                 | Description                              |
|-----------------------|------------------------------------------|
| `extracted_entities`  | Entities with type, value, mention count |
| `entity_relationships`| Source → Relationship → Target mappings  |
| `memories`            | Memory records with search_vector and embedding |

---

## Query Patterns

| Pattern                  | Endpoint                              |
|--------------------------|---------------------------------------|
| By Person                | `GET /memory/person/{name}`           |
| By Project               | `GET /memory/project/{name}`          |
| Semantic Search          | `POST /search` or `GET /memory/search`|
| Timeline / Chronological | `GET /memory/timeline`                |

---

## Audit Log

All memory-related actions (create, delete) are recorded in the audit log. See the [Meetings API](meetings.md) for audit endpoint details.

---

## HTTP Status Codes

| Status | Description                         |
|--------|-------------------------------------|
| 200    | Success (results may be empty)      |
| 401    | Missing or invalid token            |
| 429    | Rate limit exceeded                 |
| 500    | Internal server error               |
