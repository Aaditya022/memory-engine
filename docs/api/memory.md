# Memory API

Base URL: `http://localhost:8080`

All endpoints require authentication. Include the JWT access token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

---

## Search Memories (GET)

Quick-search via query parameters. For richer filtering (POST), see the [Search API](search.md).

**GET** `/memory/search`

### Query Parameters

| Parameter  | Type      | Required | Description                                          |
|------------|-----------|----------|------------------------------------------------------|
| query      | `String`  | Yes      | Natural language search query                        |
| topK       | `Integer` | No       | Max results (default: configured in `app.search.default-top-k`) |
| memoryType | `String`  | No       | Filter: `DECISION`, `ACTION_ITEM`, `FACT`, `COMMITMENT`, `DISCUSSION` |
| ownerName  | `String`  | No       | Filter by owner name (partial match)                 |

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
      "bm25Score": 0.89,
      "vectorScore": 0.94,
      "finalScore": 0.92,
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
  "http://localhost:8080/memory/search?query=micro-frontend+architecture&topK=10&memoryType=DECISION"
```

---

## Get Memories by Person

Retrieves all memories associated with a person's name.

**GET** `/memory/person/{name}`

### Path Parameters

| Parameter | Type     | Description          |
|-----------|----------|----------------------|
| name      | `String` | Owner name (case-insensitive) |

### Response — 200 OK

```json
{
  "success": true,
  "data": [
    {
      "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "meetingId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
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

## Get Memories by Project

Queries memories matching a project name through hybrid search.

**GET** `/memory/project/{name}`

### Path Parameters

| Parameter | Type     | Description                 |
|-----------|----------|-----------------------------|
| name      | `String` | Project or topic name       |

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

## Delete Memory (Forget)

Deletes a memory record and publishes a Cognee forget event.

**DELETE** `/memory/{id}`

### Path Parameters

| Parameter | Type   | Description |
|-----------|--------|-------------|
| id        | `UUID` | Memory ID   |

### Response — 200 OK

```json
{
  "success": true,
  "data": null,
  "message": null,
  "timestamp": "2026-07-05T12:00:00Z"
}
```

### Not Found — 404

```json
{
  "success": false,
  "data": null,
  "message": "Memory not found: c3d4e5f6-a7b8-9012-cdef-123456789012",
  "timestamp": "2026-07-05T12:00:00Z"
}
```

### cURL

```bash
curl -X DELETE -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  http://localhost:8080/memory/c3d4e5f6-a7b8-9012-cdef-123456789012
```

---

## List Action Items

**GET** `/memory/action-items`

### Query Parameters

| Parameter | Type     | Required | Description                                     |
|-----------|----------|----------|-------------------------------------------------|
| status    | `String` | No       | Filter: `PENDING`, `IN_PROGRESS`, `DONE`, `CANCELLED` |
| ownerName | `String` | No       | Filter by owner name                            |

### Response — 200 OK

```json
{
  "success": true,
  "data": [
    {
      "id": "d4e5f6a7-b8c9-0123-defa-1234567890ab",
      "meetingId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "ownerName": "Sarah Chen",
      "task": "Finalize API contract for memory search endpoint",
      "deadline": "2026-07-09",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "createdAt": "2026-06-30T10:00:00Z"
    }
  ],
  "message": null,
  "timestamp": "2026-07-05T12:00:00Z"
}
```

### cURL

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  "http://localhost:8080/memory/action-items?status=PENDING&ownerName=Sarah"
```

---

## Update Action Item Status

**PATCH** `/memory/action-items/{id}/status`

### Path Parameters

| Parameter | Type   | Description       |
|-----------|--------|-------------------|
| id        | `UUID` | Action Item ID    |

### Request Body

```json
{
  "status": "DONE"
}
```

| Field  | Type     | Validation               |
|--------|----------|--------------------------|
| status | `String` | Required, non-empty. One of: `PENDING`, `IN_PROGRESS`, `DONE`, `CANCELLED` |

### Response — 200 OK

```json
{
  "success": true,
  "data": {
    "id": "d4e5f6a7-b8c9-0123-defa-1234567890ab",
    "meetingId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "ownerName": "Sarah Chen",
    "task": "Finalize API contract for memory search endpoint",
    "deadline": "2026-07-09",
    "status": "DONE",
    "priority": "HIGH",
    "createdAt": "2026-06-30T10:00:00Z"
  },
  "message": null,
  "timestamp": "2026-07-05T12:00:00Z"
}
```

### Validation Error — 400 Bad Request

```json
{
  "success": false,
  "data": null,
  "message": "Invalid request: Request body must include a non-empty 'status' field",
  "timestamp": "2026-07-05T12:00:00Z"
}
```

### cURL

```bash
curl -X PATCH http://localhost:8080/memory/action-items/d4e5f6a7-b8c9-0123-defa-1234567890ab/status \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{"status": "DONE"}'
```

---

## List Decisions

**GET** `/memory/decisions`

### Response — 200 OK

```json
{
  "success": true,
  "data": [
    {
      "id": "e5f6a7b8-c9d0-1234-efab-1234567890bc",
      "meetingId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "decisionText": "Adopt micro-frontend architecture for dashboard module",
      "decisionMaker": "Elena Rodriguez",
      "alternativesDiscussed": "Monorepo with module federation, iframe-based isolation",
      "finalOutcome": "Approved for Q2 implementation",
      "decidedAt": "2026-07-02T15:30:00Z",
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
  http://localhost:8080/memory/decisions
```

---

## Get Timeline

**GET** `/memory/timeline`

### Query Parameters

| Parameter | Type     | Required | Description                          |
|-----------|----------|----------|--------------------------------------|
| topic     | `String` | No       | Filter timeline events by topic      |

### Response — 200 OK

```json
{
  "success": true,
  "data": [
    {
      "memoryId": "f6a7b8c9-d0e1-2345-abcd-1234567890cd",
      "meetingId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "meetingTitle": "Sprint Planning — Week 12",
      "memoryType": "DECISION",
      "content": "Decided to adopt micro-frontend architecture for the dashboard module.",
      "ownerName": "Elena Rodriguez",
      "eventDate": "2026-07-02",
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
  "http://localhost:8080/memory/timeline?topic=architecture"
```

---

## Response DTOs

### MemoryResponse

| Field           | Type         | Description                                |
|-----------------|--------------|--------------------------------------------|
| id              | `UUID`       | Unique identifier                          |
| meetingId       | `UUID`       | Associated meeting                         |
| memoryType      | `String`     | `DECISION`, `ACTION_ITEM`, `FACT`, `COMMITMENT`, `DISCUSSION` |
| content         | `String`     | Memory content                             |
| ownerName       | `String`     | Person who owns/created this memory        |
| eventDate       | `LocalDate`  | Date of the event (nullable)               |
| confidence      | `BigDecimal` | Extraction confidence score                |
| importanceScore | `BigDecimal` | Computed importance score                  |
| createdAt       | `Instant`    | Record creation timestamp                  |

### ActionItemResponse

| Field     | Type       | Description                                           |
|-----------|------------|-------------------------------------------------------|
| id        | `UUID`     | Unique identifier                                     |
| meetingId | `UUID`     | Associated meeting                                    |
| ownerName | `String`   | Assigned owner                                        |
| task      | `String`   | Task description                                      |
| deadline  | `LocalDate`| Due date (nullable)                                   |
| status    | `String`   | `PENDING`, `IN_PROGRESS`, `DONE`, `CANCELLED`         |
| priority  | `String`   | `LOW`, `MEDIUM`, `HIGH`                               |
| createdAt | `Instant`  | Record creation timestamp                             |

### DecisionResponse

| Field                | Type      | Description                     |
|----------------------|-----------|---------------------------------|
| id                   | `UUID`    | Unique identifier               |
| meetingId            | `UUID`    | Associated meeting              |
| decisionText         | `String`  | The decision that was made      |
| decisionMaker        | `String`  | Person who made the decision    |
| alternativesDiscussed| `String`  | Alternatives considered         |
| finalOutcome         | `String`  | Final outcome description       |
| decidedAt            | `Instant` | When the decision was made      |
| createdAt            | `Instant` | Record creation timestamp       |

### TimelineEvent

| Field        | Type       | Description                     |
|--------------|------------|---------------------------------|
| memoryId     | `UUID`     | Memory identifier               |
| meetingId    | `UUID`     | Associated meeting              |
| meetingTitle | `String`   | Meeting title                   |
| memoryType   | `String`   | Memory type enum                |
| content      | `String`   | Memory content                  |
| ownerName    | `String`   | Owner name                      |
| eventDate    | `LocalDate`| Date of the event               |
| createdAt    | `Instant`  | Record creation timestamp       |

---

## Enums

### MemoryType

| Value          | Description             |
|----------------|-------------------------|
| `DECISION`     | A decision made         |
| `ACTION_ITEM`  | A task or action item   |
| `FACT`         | An extracted fact       |
| `COMMITMENT`   | A commitment made       |
| `DISCUSSION`   | A discussion topic      |

### ActionItemStatus

| Value          | Description          |
|----------------|----------------------|
| `PENDING`      | Not yet started      |
| `IN_PROGRESS`  | Work in progress     |
| `DONE`         | Completed            |
| `CANCELLED`    | Cancelled            |

### ActionItemPriority

| Value     | Description |
|-----------|-------------|
| `LOW`     | Low priority |
| `MEDIUM`  | Medium priority |
| `HIGH`    | High priority |

---

## HTTP Status Codes

| Status | Description                         |
|--------|-------------------------------------|
| 200    | Success                             |
| 400    | Validation error / bad request      |
| 401    | Missing or invalid token            |
| 404    | Resource not found                  |
| 429    | Rate limit exceeded                 |
| 500    | Internal server error               |
