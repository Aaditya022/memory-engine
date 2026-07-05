# Health & Monitoring API

Base URL: `http://localhost:8080`

These endpoints do **not** require authentication, with the exception of admin-only actuator endpoints.

---

## Health Check

Returns the current status of the Memory Engine service. Used by load balancers, orchestration platforms (Kubernetes), and monitoring tools.

**GET** `/health`

### Response — 200 OK

```json
{
  "status": "UP",
  "service": "memory-engine",
  "timestamp": "2026-07-05T12:00:00Z"
}
```

| Field     | Type     | Description                        |
|-----------|----------|------------------------------------|
| status    | `String` | Service health: `UP` or `DOWN`     |
| service   | `String` | Service identifier: `memory-engine`|
| timestamp | `String` | ISO-8601 timestamp                 |

### cURL

```bash
curl http://localhost:8080/health
```

---

## Actuator Health

Spring Boot Actuator health endpoint with detailed component status.

**GET** `/actuator/health`

### Response — 200 OK

```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "PostgreSQL",
        "validationQuery": "isValid()"
      }
    },
    "redis": {
      "status": "UP",
      "details": {
        "version": "7.2.4"
      }
    },
    "ping": {
      "status": "UP"
    }
  }
}
```

### cURL

```bash
curl http://localhost:8080/actuator/health
```

---

## Prometheus Metrics

Exposes metrics in Prometheus scrape format. Configured for ingestion by Prometheus and visualization in Grafana.

**GET** `/actuator/prometheus`

### Response — 200 OK

```
# HELP jvm_memory_used_bytes The amount of used memory
# TYPE jvm_memory_used_bytes gauge
jvm_memory_used_bytes{area="heap",id="G1 Eden Space"} 6.5196832E7
...
http_server_requests_seconds_count{method="GET",status="200",uri="/health"} 42.0
http_server_requests_seconds_count{method="POST",status="200",uri="/auth/login"} 128.0
```

### cURL

```bash
curl http://localhost:8080/actuator/prometheus
```

---

## Admin-Only Actuator Endpoints

All endpoints under `/actuator/` beyond `/health` and `/prometheus` require `ROLE_ADMIN`.

| Endpoint                   | Description                          |
|----------------------------|--------------------------------------|
| `/actuator/health`         | Public — health details              |
| `/actuator/prometheus`     | Public — metrics scrape endpoint     |
| `/actuator/info`           | ADMIN — application info             |
| `/actuator/metrics`        | ADMIN — runtime metrics              |
| `/actuator/env`            | ADMIN — environment properties       |
| `/actuator/loggers`        | ADMIN — logger configuration         |

### Admin cURL

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  http://localhost:8080/actuator/info
```

---

## Audit Log

Retrieves paginated audit log entries. Requires `ADMIN` or `MANAGER` role.

**GET** `/audit`

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
        "actorUserId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        "action": "MEMORY_DELETED",
        "resourceType": "MEMORY",
        "resourceId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
        "details": "Memory deleted via forget endpoint. Memory content: Decided to adopt...",
        "createdAt": "2026-07-05T12:00:00Z"
      }
    ],
    "totalPages": 1,
    "totalElements": 1,
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

### AuditLogResponse Fields

| Field        | Type      | Description                         |
|--------------|-----------|-------------------------------------|
| id           | `UUID`    | Unique identifier                   |
| actorUserId  | `UUID`    | User who performed the action (nullable on anonymous error) |
| action       | `String`  | Action type (e.g. `MEETING_CREATED`, `MEMORY_DELETED`, `TRANSCRIPT_INGESTED`) |
| resourceType | `String`  | Resource type (`MEETING`, `TRANSCRIPT`, `MEMORY`) |
| resourceId   | `UUID`    | ID of the affected resource         |
| details      | `String`  | Human-readable details              |
| createdAt    | `Instant` | Record creation timestamp           |

### cURL

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  "http://localhost:8080/audit?page=0&size=20&sort=createdAt,desc"
```

---

## Swagger / OpenAPI

Interactive API documentation is available when the application is running:

| Endpoint                     | Description               |
|------------------------------|---------------------------|
| `/swagger-ui/index.html`     | Swagger UI (browser)      |
| `/v3/api-docs`               | OpenAPI 3.0 JSON schema   |

Both are public (no authentication required).

---

## Observability Stack

| Component   | Role                                | Endpoint                    |
|-------------|-------------------------------------|-----------------------------|
| Prometheus  | Metrics collection and alerting     | Scrapes `/actuator/prometheus` |
| Grafana     | Dashboard and visualization         | Queries Prometheus datasource |

---

## HTTP Status Codes

| Status | Description                         |
|--------|-------------------------------------|
| 200    | Service is healthy                  |
| 503    | Service unavailable                 |
| 401    | Missing or invalid token (actuators)|
| 403    | Insufficient role (non-ADMIN)       |
