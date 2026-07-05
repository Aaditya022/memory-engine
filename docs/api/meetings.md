# Meetings & Transcripts API

Base URL: `http://localhost:8080`

All endpoints require authentication (except where noted). Include the JWT access token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

---

## Create Meeting

**POST** `/meetings`

### Request Body

```json
{
  "title": "Sprint Planning — Week 12",
  "source": "zoom",
  "startedAt": "2026-07-05T10:00:00Z",
  "durationSeconds": 2700,
  "participantNames": [
    "Sarah Chen",
    "Marcus Johnson",
    "Elena Rodriguez"
  ]
}
```

| Field            | Type           | Validation  |
|------------------|----------------|-------------|
| title            | `String`       | `@NotBlank` |
| source           | `String`       | Optional    |
| startedAt        | `Instant`      | Optional    |
| durationSeconds  | `Integer`      | Optional    |
| participantNames | `List<String>` | Optional    |

### Response — 200 OK

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "Sprint Planning — Week 12",
    "source": "zoom",
    "startedAt": "2026-07-05T10:00:00Z",
    "durationSeconds": 2700,
    "participants": ["Sarah Chen", "Marcus Johnson", "Elena Rodriguez"],
    "createdAt": "2026-07-05T10:05:00Z"
  },
  "message": null,
  "timestamp": "2026-07-05T10:05:00Z"
}
```

### Validation Error — 400 Bad Request

```json
{
  "success": false,
  "data": {
    "title": "must not be blank"
  },
  "message": "Validation failed",
  "timestamp": "2026-07-05T10:05:00Z"
}
```

### cURL

```bash
curl -X POST http://localhost:8080/meetings \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sprint Planning — Week 12",
    "source": "zoom",
    "startedAt": "2026-07-05T10:00:00Z",
    "durationSeconds": 2700,
    "participantNames": ["Sarah Chen", "Marcus Johnson", "Elena Rodriguez"]
  }'
```

---

## List Meetings

**GET** `/meetings`

### Query Parameters

| Parameter | Type     | Default    | Example                     |
|-----------|----------|------------|-----------------------------|
| page      | `int`    | 0          | `?page=0`                   |
| size      | `int`    | 20         | `?size=10`                  |
| sort      | `String` | unsorted   | `?sort=createdAt,desc`      |

### Response — 200 OK

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "title": "Sprint Planning — Week 12",
        "source": "zoom",
        "startedAt": "2026-07-05T10:00:00Z",
        "durationSeconds": 2700,
        "participants": ["Sarah Chen", "Marcus Johnson", "Elena Rodriguez"],
        "createdAt": "2026-07-05T10:05:00Z"
      }
    ],
    "totalPages": 1,
    "totalElements": 8,
    "size": 20,
    "number": 0,
    "first": true,
    "last": true,
    "empty": false
  },
  "message": null,
  "timestamp": "2026-07-05T12:00:00Z"
}
```

### cURL

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  "http://localhost:8080/meetings?page=0&size=10&sort=createdAt,desc"
```

---

## Get Meeting by ID

**GET** `/meetings/{id}`

### Path Parameters

| Parameter | Type   | Description  |
|-----------|--------|--------------|
| id        | `UUID` | Meeting ID   |

### Response — 200 OK

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "Sprint Planning — Week 12",
    "source": "zoom",
    "startedAt": "2026-07-05T10:00:00Z",
    "durationSeconds": 2700,
    "participants": ["Sarah Chen", "Marcus Johnson", "Elena Rodriguez"],
    "createdAt": "2026-07-05T10:05:00Z"
  },
  "message": null,
  "timestamp": "2026-07-05T12:00:00Z"
}
```

### Not Found — 404

```json
{
  "success": false,
  "data": null,
  "message": "Meeting not found: a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "timestamp": "2026-07-05T12:00:00Z"
}
```

### cURL

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  http://localhost:8080/meetings/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

---

## Ingest Transcript

Submits raw transcript text for async processing (entity extraction → memory building → embedding generation).

**POST** `/transcripts`

### Request Body

```json
{
  "meetingId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "rawText": "Sarah: Let's discuss the API migration plan...\nMarcus: I recommend we adopt a micro-frontend architecture..."
}
```

| Field     | Type     | Validation  |
|-----------|----------|-------------|
| meetingId | `UUID`   | `@NotNull`  |
| rawText   | `String` | `@NotBlank` |

### Response — 200 OK

```json
{
  "success": true,
  "data": {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "meetingId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "processed": false,
    "processedAt": null,
    "createdAt": "2026-07-05T12:00:00Z"
  },
  "message": "Transcript accepted — processing in background",
  "timestamp": "2026-07-05T12:00:00Z"
}
```

### cURL

```bash
curl -X POST http://localhost:8080/transcripts \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "meetingId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "rawText": "Sarah: Let us discuss the API migration plan..."
  }'
```

---

## Get Transcript

**GET** `/transcripts/{id}`

### Path Parameters

| Parameter | Type   | Description    |
|-----------|--------|----------------|
| id        | `UUID` | Transcript ID  |

### Response — 200 OK

```json
{
  "success": true,
  "data": {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "meetingId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "processed": true,
    "processedAt": "2026-07-05T12:05:00Z",
    "createdAt": "2026-07-05T12:00:00Z"
  },
  "message": null,
  "timestamp": "2026-07-05T12:05:00Z"
}
```

### cURL

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  http://localhost:8080/transcripts/b2c3d4e5-f6a7-8901-bcde-f12345678901
```

---

## MeetingResponse Fields

| Field           | Type           | Description                    |
|-----------------|----------------|--------------------------------|
| id              | `UUID`         | Unique identifier              |
| title           | `String`       | Meeting title                  |
| source          | `String`       | Source platform (`zoom`, `meet`, `manual`) |
| startedAt       | `Instant`      | Meeting start time             |
| durationSeconds | `Integer`      | Duration in seconds (nullable) |
| participants    | `List<String>` | Participant names              |
| createdAt       | `Instant`      | Record creation timestamp      |

## TranscriptResponse Fields

| Field       | Type      | Description                          |
|-------------|-----------|--------------------------------------|
| id          | `UUID`    | Unique identifier                    |
| meetingId   | `UUID`    | Associated meeting                   |
| processed   | `boolean` | Whether async processing is complete |
| processedAt | `Instant` | Processing completion time (nullable)|
| createdAt   | `Instant` | Record creation timestamp            |

---

## HTTP Status Codes

| Status | Description                     |
|--------|---------------------------------|
| 200    | Success                         |
| 400    | Validation error / bad request  |
| 401    | Missing or invalid token        |
| 404    | Meeting or transcript not found |
| 429    | Rate limit exceeded             |
| 500    | Internal server error           |
