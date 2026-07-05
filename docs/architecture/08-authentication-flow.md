# Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client<br/>(Next.js Frontend)
    participant A as AuthProvider<br/>(React Context)
    participant AC as api-client.ts<br/>(Axios Interceptor)
    participant S as Spring Boot Backend
    participant R as Redis
    participant D as PostgreSQL

    Note over C,D: Registration Flow
    C->>A: Register (email, password, org name)
    A->>AC: POST /auth/register
    AC->>S: HTTP Request
    S->>D: Create Organization
    S->>D: Create Admin User
    S->>D: Hash Password (BCrypt)
    S-->>AC: AuthResponse { accessToken, refreshToken, user }
    AC->>A: Store tokens in localStorage
    A-->>C: Authenticated

    Note over C,D: Login Flow
    C->>A: Login (email, password)
    A->>AC: POST /auth/login
    AC->>S: HTTP Request
    S->>D: Find User by Email
    S->>D: Verify Password (BCrypt)
    S->>S: Generate Access Token (15 min)
    S->>S: Generate Refresh Token (7 days)
    S-->>AC: AuthResponse { accessToken, refreshToken, user }
    AC->>A: Store tokens in localStorage
    A-->>C: Authenticated

    Note over C,D: Authenticated Request
    C->>A: Access protected resource
    A->>AC: GET /meetings
    AC->>AC: Attach Authorization: Bearer <accessToken>
    AC->>S: HTTP Request with JWT
    S->>S: Validate JWT Signature
    S->>S: Extract Principal (orgId, userId, role)
    S->>R: Check Token Blacklist
    S->>D: Query Data
    S-->>AC: 200 OK
    AC-->>A: Response Data

    Note over C,D: Token Refresh
    C->>A: Access expired resource
    A->>AC: GET /meetings
    AC->>S: HTTP Request with expired JWT
    S-->>AC: 401 Unauthorized
    AC->>AC: Queue failed request
    AC->>S: POST /auth/refresh { refreshToken }
    S->>S: Validate Refresh Token
    S->>R: Check Token Blacklist
    S->>S: Generate New Access Token
    S-->>AC: AuthResponse { accessToken }
    AC->>AC: Rotate token in localStorage
    AC->>AC: Retry queued request with new token
    AC-->>A: Response Data

    Note over C,D: Logout
    C->>A: Logout
    A->>AC: POST /auth/logout
    AC->>S: HTTP Request with accessToken
    S->>R: Blacklist access token (TTL: 15 min)
    S->>R: Blacklist refresh token (TTL: 7 days)
    S-->>AC: 200 OK
    AC->>A: Clear tokens from localStorage
    A-->>C: Unauthenticated
```

**Diagram 8: Authentication Flow** — Complete JWT-based authentication sequence. Registration creates an organization and admin user. Login returns an access token (15-minute expiry) and refresh token (7-day expiry). Authenticated requests attach the JWT in the Authorization header; the backend validates the signature, extracts the principal (org/user/role), and checks Redis for blacklisted tokens. On 401, the Axios interceptor automatically refreshes the token using the refresh token, retries the queued request, and rotates the stored token. Logout blacklists both tokens in Redis with TTL matching their original expiry.
