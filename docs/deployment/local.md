# Local Development

Run the Memory Engine stack on a developer workstation for development and testing.

---

## Overview

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │     │   Backend    │     │  PostgreSQL  │
│  Next.js 16  │────>│ Spring Boot  │────>│   pgvector   │
│  :3001       │     │  :8080       │     │  Docker      │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │              ┌──────────────┐
                            ├─────────────>│    Redis     │
                            │              │  Docker      │
                            │              └──────────────┘
                            │              ┌──────────────┐
                            └─────────────>│    Kafka     │
                                           │  Docker      │
                                           └──────────────┘
```

The frontend (Next.js) runs directly on the host for HMR. The backend (Spring Boot) runs directly for fast rebuilds. Infrastructure services (PostgreSQL, Redis, Kafka) run in Docker.

---

## Prerequisites

| Tool           | Version         | Purpose                           |
|----------------|-----------------|-----------------------------------|
| Java           | 21 (Temurin)    | Spring Boot backend runtime       |
| Maven          | 3.9+            | Backend build                     |
| Node.js        | 20+ (LTS)       | Next.js frontend runtime          |
| Docker         | 24+             | PostgreSQL, Redis, Kafka          |
| Docker Compose | 2.24+           | Service orchestration             |

---

## Step 1: Clone and Configure Environment

```bash
git clone <repo-url> memory-engine
cd memory-engine

cp .env.example .env
```

Edit `.env` with your local overrides. Default values work for development.

---

## Step 2: Start Infrastructure Dependencies

PostgreSQL (with pgvector), Redis, and Kafka run in Docker containers:

```bash
docker compose up -d postgres redis kafka
```

Verify they are healthy:

```bash
docker compose ps
```

| Service    | Port | Purpose                              |
|------------|------|--------------------------------------|
| PostgreSQL | 5432 | Primary database with pgvector       |
| Redis      | 6379 | Caching, rate limiting, token blacklist |
| Kafka      | 9092 | Async Cognee event sync              |

---

## Step 3: Start the Backend

```bash
cd backend

# Build (skip tests for speed)
mvn clean compile -DskipTests

# Run with dev profile (default)
mvn spring-boot:run
```

The backend starts at `http://localhost:8080`.

### Environment Variables

The `application.yml` reads these from the environment with defaults suitable for local development:

| Variable       | Default         | Source                     |
|----------------|-----------------|----------------------------|
| `DB_HOST`      | `localhost`     | `application.yml`          |
| `DB_PORT`      | `5432`          | `application.yml`          |
| `DB_NAME`      | `memory_engine` | `application.yml`          |
| `DB_USER`      | `memory_engine` | `application.yml`          |
| `DB_PASSWORD`  | `memory_engine` | `application.yml`          |
| `REDIS_HOST`   | `localhost`     | `application.yml`          |
| `REDIS_PORT`   | `6379`          | `application.yml`          |
| `JWT_SECRET`   | (32-char default)| `application.yml`         |

---

## Step 4: Start the Frontend

```bash
cd frontend

npm install
npm run dev
```

The frontend starts at `http://localhost:3001` with hot module replacement.

### Environment

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## Verification

### Backend Health Check

```bash
curl http://localhost:8080/health

# Expected:
# {"status":"UP","service":"memory-engine","timestamp":"2026-07-05T12:00:00Z"}
```

### API Documentation

```bash
# Open Swagger UI in browser
open http://localhost:8080/swagger-ui.html

# Fetch OpenAPI schema
curl http://localhost:8080/v3/api-docs
```

### Frontend

Open `http://localhost:3001` in your browser. The welcome page should load.

---

## Running Tests

```bash
cd backend

# Unit + integration tests (requires postgres + redis running)
mvn clean verify

# Tests only (skip integration)
mvn test

# Build without tests
mvn clean package -DskipTests
```

### CI Environment Variables

The CI workflow uses these values — use them for local test runs:

```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=memory_engine
export DB_USER=memory_engine
export DB_PASSWORD=memory_engine
export REDIS_HOST=localhost
export REDIS_PORT=6379
export JWT_SECRET=ci-test-secret-key-minimum-32-characters-long
```

---

## Optional: Start Observability Stack

```bash
docker compose up -d prometheus grafana
```

| Service    | Port | Default Credentials   |
|------------|------|-----------------------|
| Prometheus | 9090 | —                     |
| Grafana    | 3000 | `admin` / `admin`     |

---

## Database Migrations

Flyway runs migrations automatically on application startup. To run manually:

```bash
cd backend

# Run pending migrations
mvn flyway:migrate

# Check migration status
mvn flyway:info
```

Migration files are at `backend/src/main/resources/db/migration/`.

---

## Common Issues

| Symptom                         | Likely Cause                     | Fix                                       |
|---------------------------------|----------------------------------|-------------------------------------------|
| Backend fails to start          | PostgreSQL or Redis not running  | `docker compose up -d postgres redis`     |
| `relation does not exist`       | Flyway migration hasn't run      | Restart the app — Flyway runs on startup  |
| Frontend API calls fail         | Backend not running or wrong URL | Check `NEXT_PUBLIC_API_URL` in `.env.local` |
| Kafka connection refused        | Kafka not running                | `docker compose up -d kafka`              |
| `JWT_SECRET` too short          | Secret is less than 32 characters | Increase to 32+ characters               |
| Port already in use             | Another service on the same port | Change the port in `application.yml` or stop the conflicting process |

---

## Troubleshooting

### Backend Won't Start

```bash
# Check Docker containers
docker compose ps

# Check backend logs
docker compose logs -f app

# Reset the database
docker compose down postgres
docker volume rm memory-engine_pgdata
docker compose up -d postgres
```

### Database Connection Errors

```bash
# Test the database connection directly
docker compose exec postgres pg_isready -U memory_engine -d memory_engine

# Connect to the database
docker compose exec postgres psql -U memory_engine -d memory_engine
```

### Frontend Not Loading

```bash
# Check dev server is running
curl http://localhost:3001

# Verify the API URL
cat frontend/.env.local
```

---

## Useful Commands

```bash
# Rebuild backend
cd backend && mvn clean compile

# Rebuild frontend
cd frontend && npm run build

# Reset local database and restart
docker compose down postgres && \
  docker volume rm memory-engine_pgdata && \
  docker compose up -d postgres

# View service logs
docker compose logs -f app
docker compose logs -f postgres
docker compose logs -f redis

# Follow all logs
docker compose logs -f

# Rebuild and restart app container (Docker deployment)
docker compose build app
docker compose up -d app
```

---

## Port Reference

| Port | Service         | Notes                             |
|------|-----------------|-----------------------------------|
| 3001 | Frontend (Next) | Dev server with hot module reload |
| 8080 | Backend (API)   | Spring Boot REST API              |
| 5432 | PostgreSQL      | Docker only                       |
| 6379 | Redis           | Docker only                       |
| 9092 | Kafka           | Docker only                       |
| 9090 | Prometheus      | Optional                          |
| 3000 | Grafana         | Optional                          |

---

## Cleanup

```bash
# Stop all Docker containers (preserves data volumes)
docker compose down

# Stop all Docker containers and delete data
docker compose down -v

# Remove Docker images built by the project
docker compose down --rmi all

# Stop frontend dev server: Ctrl+C in the terminal where it is running
# Stop backend dev server: Ctrl+C in the terminal where it is running
```
