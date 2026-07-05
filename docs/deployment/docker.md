# Docker Compose Deployment

Deploy Memory Engine using Docker Compose with a layered configuration for development and production.

---

## Overview

Two compose files form a layered configuration:

| File                      | Purpose                              |
|---------------------------|--------------------------------------|
| `docker-compose.yml`      | Base — all services with exposed ports |
| `docker-compose.prod.yml` | Production overlay — TLS, resource limits, health checks |

Usage:

```bash
# Development (all ports exposed to host)
docker compose up -d --build

# Production (behind nginx, resource limits, restart policies)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### Architecture

```
                        ┌─────────────┐
                        │   Client    │
                        └──────┬──────┘
                               │ HTTPS :443
                        ┌──────▼──────┐
                        │    Nginx    │  TLS termination + reverse proxy
                        │  1.27-alp   │  Prod only
                        └──────┬──────┘
                               │ http://app:8080
                        ┌──────▼──────┐
                        │  Backend    │  Spring Boot 3.3.4 / Java 21
                        │  :8080      │
                        └──┬───┬───┬──┘
                           │   │   │
                 ┌─────────┘   │   └──────────┐
                 ▼             ▼              ▼
          ┌──────────┐  ┌──────────┐  ┌──────────────┐
          │PostgreSQL│  │  Redis   │  │    Kafka     │
          │  pg16    │  │  7-alp   │  │  4.0.0 KRaft │
          └──────────┘  └──────────┘  └──────────────┘

          ┌──────────────┐  ┌──────────────┐
          │  Prometheus  │  │   Grafana    │
          │   scrape     │  │  dashboards  │
          └──────────────┘  └──────────────┘
```

---

## Prerequisites

| Tool           | Version | Purpose                    |
|----------------|---------|----------------------------|
| Docker         | 24+     | Container runtime          |
| Docker Compose | 2.24+   | Multi-service orchestration |
| (Optional) Domain name | — | Required for TLS in production |

---

## Step 1: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values. See the [environment variables table](#environment-variables) below.

---

## Step 2: Build and Start (Development)

```bash
# Build images and start all services
docker compose up -d --build
```

All services start with ports exposed to the host for direct access.

### Verify

```bash
docker compose ps
```

| Service    | Port  | Health    |
|------------|-------|-----------|
| app        | 8080  | (none)    |
| postgres   | 5432  | healthy   |
| redis      | 6379  | healthy   |
| kafka      | 9092  | healthy   |
| prometheus | 9090  | (none)    |
| grafana    | 3000  | (none)    |

```bash
curl http://localhost:8080/health

# Expected:
# {"status":"UP","service":"memory-engine","timestamp":"2026-07-05T12:00:00Z"}
```

---

## Step 3: Deploy to Production

```bash
# Build images and start with production overlay
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

The production overlay applies these changes:

| Aspect          | Dev                       | Prod                          |
|-----------------|---------------------------|-------------------------------|
| Port exposure   | All ports published       | Only nginx ports 80/443       |
| Restart policy  | None                      | `unless-stopped` on all services |
| Resource limits | None                      | CPU/memory limits on postgres, redis, app |
| Backend profile | Default                   | `SPRING_PROFILES_ACTIVE=prod` |
| App health check| None                      | `wget http://localhost:8080/health` |
| TLS             | None                      | nginx + certbot + Let's Encrypt |
| Redis config    | Default                   | Maxmemory 256 MB, allkeys-lru |

### Verify

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps

# NAME                      IMAGE                             STATUS
# memory-engine-app         memory-engine-backend             Up (healthy)
# memory-engine-postgres    pgvector/pgvector:pg16            Up (healthy)
# memory-engine-redis       redis:7-alpine                    Up (healthy)
# memory-engine-nginx       nginx:1.27-alpine                 Up
# memory-engine-certbot     certbot/certbot                   Up
```

```bash
# Direct health check (from the host)
curl http://localhost:8080/health

# Via nginx (after TLS is configured)
curl https://api.yourdomain.com/health
```

---

## Verification

### Development

```bash
# Check all containers are running
docker compose ps

# Test the API health endpoint
curl http://localhost:8080/health

# Expected:
# {"status":"UP","service":"memory-engine","timestamp":"2026-07-05T12:00:00Z"}
```

### Production

```bash
# Check all containers including nginx and certbot
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps

# Test via nginx
curl https://api.yourdomain.com/health

# Test direct to app
curl http://localhost:8080/health
```

---

## Step 4: Set Up TLS with Let's Encrypt

The project includes an automated TLS bootstrap script at `nginx/init-letsencrypt.sh`.

### Prerequisites for TLS

- DNS A record pointing your domain to the server's public IP
- Ports 80 and 443 reachable from the internet

### Bootstrap TLS

```bash
# Ensure DOMAIN_NAME and CERTBOT_EMAIL are set in .env
chmod +x nginx/init-letsencrypt.sh
./nginx/init-letsencrypt.sh
```

The script:
1. Reads `DOMAIN_NAME` and `CERTBOT_EMAIL` from `.env`
2. Replaces `DOMAIN_NAME_PLACEHOLDER` in `nginx/nginx.conf`
3. Generates a temporary self-signed certificate
4. Starts nginx with the temporary cert
5. Requests a real Let's Encrypt certificate via certbot webroot challenge
6. Reloads nginx with the real certificate
7. Certbot auto-renews certificates every 12 hours

### Verify TLS

```bash
openssl s_client -connect api.yourdomain.com:443 \
  -servername api.yourdomain.com < /dev/null 2>/dev/null | \
  openssl x509 -noout -issuer -subject -dates
```

---

## Service Definitions

### PostgreSQL (`pgvector/pgvector:pg16`)

```yaml
postgres:
  image: pgvector/pgvector:pg16
  ports:
    - "5432:5432"
  volumes:
    - pgdata:/var/lib/postgresql/data
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
    interval: 5s
    timeout: 5s
    retries: 10
```

### Redis (`redis:7-alpine`)

```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 5s
    timeout: 5s
    retries: 10
```

Production adds memory limits:

```yaml
redis:
  command: ["redis-server", "--maxmemory", "256mb", "--maxmemory-policy", "allkeys-lru"]
```

### Kafka (`bitnamilegacy/kafka:4.0.0-debian-12-r10`)

Single-node KRaft mode (no Zookeeper dependency):

```yaml
kafka:
  image: bitnamilegacy/kafka:4.0.0-debian-12-r10
  environment:
    KAFKA_CFG_NODE_ID: 1
    KAFKA_CFG_PROCESS_ROLES: broker,controller
    KAFKA_CFG_LISTENERS: PLAINTEXT://:9092,CONTROLLER://:9093
    KAFKA_CFG_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
    KAFKA_KRAFT_CLUSTER_ID: cognee-cluster
```

### Backend App (built from `backend/Dockerfile`)

Multi-stage Dockerfile:

```dockerfile
# Stage 1: Build with Maven
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B clean package -DskipTests

# Stage 2: Runtime with JRE
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
RUN addgroup --system spring && adduser --system --ingroup spring spring
COPY --from=build /app/target/*.jar app.jar
USER spring:spring
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=5 \
    CMD wget -qO- http://localhost:8080/health || exit 1
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
```

### Nginx (`nginx:1.27-alpine`)

Only present in the production overlay:

```yaml
nginx:
  image: nginx:1.27-alpine
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
    - ./nginx/certbot/conf:/etc/letsencrypt:ro
    - ./nginx/certbot/www:/var/www/certbot:ro
```

### Certbot (`certbot/certbot`)

Only present in the production overlay, auto-renews TLS every 12 hours:

```yaml
certbot:
  image: certbot/certbot
  volumes:
    - ./nginx/certbot/conf:/etc/letsencrypt
    - ./nginx/certbot/www:/var/www/certbot
  entrypoint: >
    sh -c "trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;"
```

### Prometheus (`prom/prometheus:latest`)

```yaml
prometheus:
  image: prom/prometheus:latest
  volumes:
    - ./docker/prometheus.yml:/etc/prometheus/prometheus.yml
  ports:
    - "9090:9090"
  depends_on:
    - app
```

### Grafana (`grafana/grafana:latest`)

```yaml
grafana:
  image: grafana/grafana:latest
  ports:
    - "3000:3000"
  environment:
    GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_ADMIN_PASSWORD:-admin}
  depends_on:
    - prometheus
```

---

## Startup Order

```
postgres (healthy) ──┐
redis (healthy)    ──┤
                     ├──> app ──> prometheus ──> grafana
kafka               ─┘
nginx (prod only)   ───> app (waits for app to start)
```

---

## Volumes

| Volume Mount                 | Purpose                       |
|------------------------------|-------------------------------|
| `pgdata` (named Docker volume) | PostgreSQL data directory    |
| `./nginx/certbot/conf`       | Let's Encrypt TLS certificates |
| `./nginx/certbot/www`        | ACME challenge verification files |
| `./docker/prometheus.yml`    | Prometheus scrape configuration (bind mount) |

---

## Resource Limits (Production)

From `docker-compose.prod.yml`:

| Service    | CPU Limit | Memory Limit |
|------------|-----------|--------------|
| PostgreSQL | 1.0       | 1 GB         |
| Redis      | 0.5       | 300 MB       |
| App        | 2.0       | 1536 MB      |

The JVM uses `-XX:MaxRAMPercentage=75.0`, so at 1536 MB limit approximately 1152 MB is available to the JVM heap.

---

## Environment Variables

All configurable via `.env`. See `.env.example` for defaults.

| Variable                    | Default                                    | Required | Description                          |
|-----------------------------|--------------------------------------------|----------|--------------------------------------|
| `DB_NAME`                   | `memory_engine`                            | No       | PostgreSQL database name             |
| `DB_USER`                   | `memory_engine`                            | No       | PostgreSQL user                      |
| `DB_PASSWORD`               | `memory_engine`                            | **Yes**  | PostgreSQL password                  |
| `JWT_SECRET`                | (32-char default in code)                  | **Yes**  | JWT signing key (min 32 chars)       |
| `GEMINI_API_KEY`            | (empty)                                    | No       | Google Gemini API key                |
| `APP_CORS_ALLOWED_ORIGINS`  | `*`                                        | **Yes**  | CORS allowed origins (set to frontend URL in prod) |
| `RATE_LIMIT_MAX_REQUESTS`   | `100`                                      | No       | Max requests per rate limit window   |
| `RATE_LIMIT_WINDOW_SECONDS` | `60`                                       | No       | Rate limit window duration           |
| `DOMAIN_NAME`               | (not set)                                  | **Yes*** | Domain for TLS (required for prod)   |
| `CERTBOT_EMAIL`             | (not set)                                  | **Yes*** | Email for Let's Encrypt (required for prod) |
| `GRAFANA_ADMIN_PASSWORD`    | `admin`                                    | **Yes**  | Grafana admin password               |
| `COGNEE_API_URL`            | `http://localhost:8000`                    | No       | External Cognee service URL          |
| `COGNEE_API_KEY`            | (empty)                                    | No       | Cognee authentication key            |
| `KAFKA_BOOTSTRAP_SERVERS`   | `kafka:9092`                               | No       | Kafka broker address                 |

---

## Common Issues

| Symptom                             | Likely Cause                      | Fix                                      |
|-------------------------------------|-----------------------------------|------------------------------------------|
| App container exits immediately     | PostgreSQL or Redis not ready     | Check dependency health in compose file |
| Nginx returns 502 Bad Gateway       | App not healthy or not started    | `docker compose logs -f app`             |
| TLS certificate not found           | Certbot hasn't run yet            | Run `./nginx/init-letsencrypt.sh`        |
| `ERR_CERT_AUTHORITY_INVALID`        | Temporary self-signed cert still active | Let certbot finish or check logs   |
| Port already in use                 | Another service on same port      | Stop the conflicting service or change the port mapping |
| Rate limit errors (429)             | Too many requests from single IP  | Adjust `RATE_LIMIT_MAX_REQUESTS` in `.env` |

---

## Troubleshooting

```bash
# Check container status
docker compose ps

# View app logs
docker compose logs -f app

# Follow all logs
docker compose logs -f

# Check if the app health endpoint responds inside the container
docker compose exec app wget -qO- http://localhost:8080/health

# Check database connectivity
docker compose exec postgres pg_isready -U memory_engine -d memory_engine

# Check Redis connectivity
docker compose exec redis redis-cli ping

# Inspect the nginx configuration
docker compose exec nginx cat /etc/nginx/conf.d/default.conf

# Check TLS certificate expiry
docker compose exec certbot certbot certificates
```

---

## Useful Commands

```bash
# Build and start all services
docker compose up -d --build

# Build and start (production)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Rebuild a single service and restart
docker compose build app
docker compose up -d app

# View logs for a specific service
docker compose logs -f app
docker compose logs -f nginx

# Follow all logs
docker compose logs -f

# Restart a service
docker compose restart nginx

# Check resource usage
docker stats

# Scale a service (development only)
docker compose up -d --scale app=2
```

---

## Cleanup

```bash
# Stop all containers (preserves data)
docker compose down

# Stop and remove volumes (deletes database data)
docker compose down -v

# Stop and remove images as well
docker compose down --rmi all -v

# For production overlay
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
docker compose -f docker-compose.yml -f docker-compose.prod.yml down -v
```

---

## References

- `docker-compose.yml` — Base service definitions
- `docker-compose.prod.yml` — Production overlay
- `backend/Dockerfile` — Multi-stage backend build
- `nginx/nginx.conf` — Nginx reverse proxy configuration
- `nginx/init-letsencrypt.sh` — TLS bootstrap script
- `docker/prometheus.yml` — Prometheus scrape configuration
- `.env.example` — Environment variable template
- `backend/src/main/resources/application.yml` — Spring Boot configuration
- `backend/src/main/resources/application-prod.yml` — Production Spring Boot profile
