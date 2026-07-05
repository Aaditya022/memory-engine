# Authentication API

Base URL: `http://localhost:8080`

## Envelope

All API responses use a standard envelope:

```json
{
  "success": true,
  "data": { … },
  "message": null,
  "timestamp": "2026-07-05T12:00:00Z"
}
```

| Field     | Type      | Description                              |
|-----------|-----------|------------------------------------------|
| success   | `boolean` | `true` for 2xx, `false` for errors       |
| data      | `T`       | Payload (nullable on error)              |
| message   | `String`  | Human-readable message (null on success) |
| timestamp | `Instant` | Server-side timestamp                    |

---

## Register

Creates a new organization with the first user as `ADMIN`.

**POST** `/auth/register`

### Request Body

```json
{
  "organizationName": "Acme Corp",
  "fullName": "Jane Doe",
  "email": "jane@acme.com",
  "password": "securePass123"
}
```

| Field            | Type     | Validation                        |
|------------------|----------|-----------------------------------|
| organizationName | `String` | `@NotBlank`                       |
| fullName         | `String` | `@NotBlank`                       |
| email            | `String` | `@NotBlank`, `@Email`             |
| password         | `String` | `@Size(min = 8)`                  |

### Response — 200 OK

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqYW5lQGFjbWUuY29tIiwidXNlcklkIjoiZjdrYTI5MzQtYjExYy00...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4uLi4=",
    "tokenType": "Bearer",
    "userId": "f7ca2934-b11c-4b2c-9e3d-8a1f2b3c4d5e",
    "role": "ADMIN",
    "organizationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  },
  "message": "Registered successfully",
  "timestamp": "2026-07-05T12:00:00Z"
}
```

### Validation Errors — 400 Bad Request

```json
{
  "success": false,
  "data": {
    "password": "Password must be at least 8 characters",
    "email": "must be a well-formed email address"
  },
  "message": "Validation failed",
  "timestamp": "2026-07-05T12:00:00Z"
}
```

### cURL

```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "organizationName": "Acme Corp",
    "fullName": "Jane Doe",
    "email": "jane@acme.com",
    "password": "securePass123"
  }'
```

---

## Login

Authenticates a user and returns JWT tokens.

**POST** `/auth/login`

### Request Body

```json
{
  "email": "jane@acme.com",
  "password": "securePass123"
}
```

| Field    | Type     | Validation              |
|----------|----------|-------------------------|
| email    | `String` | `@NotBlank`, `@Email`   |
| password | `String` | `@NotBlank`             |

### Response — 200 OK

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqYW5lQGFjbWUuY29tIiwidXNlcklkIjoiZjdrYTI5MzQtYjExYy00...",
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4uLi4=",
    "tokenType": "Bearer",
    "userId": "f7ca2934-b11c-4b2c-9e3d-8a1f2b3c4d5e",
    "role": "ADMIN",
    "organizationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  },
  "message": "Login successful",
  "timestamp": "2026-07-05T12:00:00Z"
}
```

### Invalid Credentials — 401 Unauthorized

```json
{
  "success": false,
  "data": null,
  "message": "Invalid email or password",
  "timestamp": "2026-07-05T12:00:00Z"
}
```

### cURL

```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@acme.com",
    "password": "securePass123"
  }'
```

---

## Refresh Token

Issues a new access/refresh token pair. The old refresh token is rotated (blacklisted).

**POST** `/auth/refresh`

### Request Body

```json
{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4uLi4="
}
```

| Field        | Type     | Validation  |
|--------------|----------|-------------|
| refreshToken | `String` | `@NotBlank` |

### Response — 200 OK

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqYW5lQGFjbWUuY29tIiwiZXhwIjoxNzE5MzQ5M...",
    "refreshToken": "bmV3IHJlZnJlc2ggdG9rZW4uLi4=",
    "tokenType": "Bearer",
    "userId": "f7ca2934-b11c-4b2c-9e3d-8a1f2b3c4d5e",
    "role": "ADMIN",
    "organizationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  },
  "message": "Token refreshed",
  "timestamp": "2026-07-05T12:00:00Z"
}
```

### cURL

```bash
curl -X POST http://localhost:8080/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4uLi4="
  }'
```

---

## Logout

Blacklists both the access and refresh tokens so they can no longer be used.

**POST** `/auth/logout`

### Request Headers (optional)

| Header        | Value                         |
|---------------|-------------------------------|
| Authorization | `Bearer <accessToken>`        |

### Request Body (optional)

```json
{
  "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4uLi4="
}
```

### Response — 200 OK

```json
{
  "success": true,
  "data": null,
  "message": "Logged out",
  "timestamp": "2026-07-05T12:00:00Z"
}
```

### cURL

```bash
curl -X POST http://localhost:8080/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4uLi4="
  }'
```

---

## JWT Token

### Structure

Standard JWT with three base64url-encoded segments (header.payload.signature).

### Header

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### Payload Claims

| Claim          | Type   | Description                        |
|----------------|--------|------------------------------------|
| sub            | String | Email address                      |
| userId         | String | UUID                               |
| email          | String | Email address                      |
| organizationId | String | UUID                               |
| role           | String | `ADMIN`, `MANAGER`, or `EMPLOYEE`  |
| jti            | String | Unique token ID (for blacklisting) |
| type           | String | `access` or `refresh`              |
| iat            | Number | Issued-at timestamp (epoch)        |
| exp            | Number | Expiration timestamp (epoch)       |

### Usage

All authenticated requests must include the access token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

---

## Roles

| Role      | Access Level                                 |
|-----------|----------------------------------------------|
| `ADMIN`   | Full access, including audit logs and actuators |
| `MANAGER` | Standard access plus audit logs              |
| `EMPLOYEE`| Standard meeting, memory, and search access  |

---

## Security Configuration

| Endpoint pattern         | Access                    |
|--------------------------|---------------------------|
| `/auth/**`               | Public                    |
| `/health`                | Public                    |
| `/actuator/health`       | Public                    |
| `/actuator/prometheus`   | Public                    |
| `/swagger-ui/**`         | Public                    |
| `/v3/api-docs/**`        | Public                    |
| `/actuator/**`           | ADMIN only                |
| `/audit/**`              | ADMIN or MANAGER          |
| All others (`/**`)       | Authenticated (any role)  |

- CSRF: **disabled**
- Session: **STATELESS**
- Password encoding: **BCrypt** (strength 12)
- Filter chain: `RateLimitFilter` → `JwtAuthFilter` → `UsernamePasswordAuthenticationFilter`

---

## Rate Limiting

Redis-backed fixed-window rate limiter applied to all requests except `/health`, `/actuator/health`, and `/actuator/prometheus`.

### 429 Too Many Requests

```json
{
  "success": false,
  "data": null,
  "message": "Rate limit exceeded. Try again shortly.",
  "timestamp": "2026-07-05T12:00:00Z"
}
```

| Configuration          | Environment Variable               | Default |
|------------------------|------------------------------------|---------|
| Max requests per window| `app.rate-limit.max-requests`      | 100     |
| Window duration (sec)  | `app.rate-limit.window-seconds`    | 60      |

---

## Error Responses

| HTTP Status | Condition                     |
|-------------|-------------------------------|
| 400         | Validation failure            |
| 401         | Invalid/missing credentials   |
| 429         | Rate limit exceeded           |
| 500         | Internal server error         |
