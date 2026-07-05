# Production Deployment

Hardening and operational guidance for running Memory Engine in production.

---

## Overview

Deploying Memory Engine to production requires more than just starting containers. This guide covers environment hardening, TLS, resource management, monitoring, backups, and a pre-launch checklist.

---

## Architecture (Production)

```
                         ┌─────────────┐
                         │   Client    │
                         └──────┬──────┘
                                │ HTTPS :443
                         ┌──────▼──────┐
                         │   Nginx     │  Reverse proxy, TLS termination
                         │  1.27-alp   │  Rate limiting, security headers
                         └──────┬──────┘
                                │ http://app:8080
                         ┌──────▼──────┐
                         │  Backend    │  Spring Boot, JVM
                         │  2 CPU /    │  Health-checked
                         │  1.5G RAM   │
                         └──┬───┬───┬──┘
                            │   │   │
                  ┌─────────┘   │   └──────────┐
                  ▼             ▼              ▼
           ┌──────────┐  ┌──────────┐  ┌──────────────┐
           │PostgreSQL│  │  Redis   │  │    Kafka     │
           │  pg16    │  │  7-alp   │  │  (optional)  │
           │  1 CPU   │  │ 0.5 CPU  │  │              │
           │  1G RAM  │  │ 300M RAM │  │              │
           └──────────┘  └──────────┘  └──────────────┘

           ┌──────────────┐  ┌──────────────┐
           │  Prometheus  │  │   Grafana    │  Observability
           │  /actuator   │  │  dashboards  │  (optional)
           └──────────────┘  └──────────────┘
```

---

## Prerequisites

| Requirement          | Details                              |
|----------------------|--------------------------------------|
| Docker + Compose     | Docker 24+, Compose 2.24+            |
| Linux VM / host      | Ubuntu 22.04+ or Debian 12+          |
| Domain name          | For TLS (e.g., `api.yourdomain.com`) |
| Email address        | For Let's Encrypt certificate        |
| PostgreSQL           | pgvector extension required          |
| Redis                | 7.x recommended                      |
| Gemini API key       | Optional — needed for embeddings     |

---

## Step 1: Environment Configuration

### Copy and Edit `.env`

```bash
cp .env.example .env
```

### Mandatory Variables

| Variable                    | Description                           | Example                          |
|-----------------------------|---------------------------------------|----------------------------------|
| `DB_PASSWORD`               | PostgreSQL password (strong, random)  | `openssl rand -base64 24`        |
| `JWT_SECRET`                | JWT signing key (min 32 chars)        | `openssl rand -base64 48`        |
| `APP_CORS_ALLOWED_ORIGINS`  | Your frontend domain                  | `https://app.yourdomain.com`     |
| `DOMAIN_NAME`               | API domain for TLS                    | `api.yourdomain.com`             |
| `CERTBOT_EMAIL`             | Email for Let's Encrypt               | `ops@yourdomain.com`             |
| `GRAFANA_ADMIN_PASSWORD`    | Grafana admin password                | `openssl rand -base64 18`        |

### Optional Variables

| Variable                    | Default            | Notes                               |
|-----------------------------|--------------------|-------------------------------------|
| `GEMINI_API_KEY`            | (empty)            | Falls back to local embeddings      |
| `RATE_LIMIT_MAX_REQUESTS`   | `100`              | Per window per IP                   |
| `RATE_LIMIT_WINDOW_SECONDS` | `60`               | Window duration in seconds          |
| `COGNEE_API_URL`            | `http://localhost:8000` | External Cognee service         |
| `COGNEE_API_KEY`            | (empty)            | Cognee authentication               |
| `COGNEE_TIMEOUT_MS`         | `10000`            | Cognee request timeout              |

---

## Step 2: TLS with Let's Encrypt

The project includes an automated TLS bootstrap script at `nginx/init-letsencrypt.sh`.

### Prerequisites

- DNS A record pointing your domain to the server's public IP
- Ports 80 and 443 reachable from the internet

### Bootstrap TLS

```bash
# Ensure .env has DOMAIN_NAME and CERTBOT_EMAIL set
chmod +x nginx/init-letsencrypt.sh
./nginx/init-letsencrypt.sh
```

### What the Script Does

1. Reads `DOMAIN_NAME` and `CERTBOT_EMAIL` from `.env`
2. Replaces `DOMAIN_NAME_PLACEHOLDER` in `nginx/nginx.conf`
3. Generates a temporary self-signed certificate
4. Starts nginx with the temporary cert
5. Requests a real Let's Encrypt certificate via certbot webroot challenge
6. Reloads nginx with the real certificate
7. Certbot auto-renews every 12 hours

### Manual Renewal

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm certbot renew
```

---

## Step 3: Deploy the Stack

```bash
# Build and start in production mode
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### Verify All Services Are Running

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps

# NAME                      IMAGE                             STATUS
# memory-engine-app         memory-engine-backend             Up (healthy)
# memory-engine-postgres    pgvector/pgvector:pg16            Up (healthy)
# memory-engine-redis       redis:7-alpine                    Up (healthy)
# memory-engine-kafka       bitnamilegacy/kafka:4.0.0         Up
# memory-engine-nginx       nginx:1.27-alpine                 Up
# memory-engine-certbot     certbot/certbot                   Up
# memory-engine-prometheus  prom/prometheus:latest            Up
# memory-engine-grafana     grafana/grafana:latest            Up
```

---

## Step 4: Verification

### Health Check

```bash
# Direct to backend
curl http://localhost:8080/health

# Via nginx (HTTPS)
curl https://api.yourdomain.com/health

# Expected:
# {"status":"UP","service":"memory-engine","timestamp":"2026-07-05T12:00:00Z"}
```

### API Test

```bash
# Register a test user
curl -X POST https://api.yourdomain.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "organizationName": "TestOrg",
    "fullName": "Admin User",
    "email": "admin@test.com",
    "password": "password123"
  }'
```

### TLS Certificate

```bash
openssl s_client -connect api.yourdomain.com:443 -servername api.yourdomain.com < /dev/null 2>/dev/null \
  | openssl x509 -noout -issuer -subject -dates
```

---

## Step 5: Monitoring

### Prometheus Metrics

```bash
curl https://api.yourdomain.com/actuator/prometheus
```

### Grafana Dashboard

1. Access Grafana at `https://api.yourdomain.com:3000` (or via SSH tunnel)
2. Log in with admin / `GRAFANA_ADMIN_PASSWORD`
3. Add Prometheus data source: `http://prometheus:9090`
4. Import a Spring Boot dashboard (e.g., ID `4701` from grafana.com)

### Default Metrics Available

- JVM memory, GC, threads
- HTTP request count, duration, and error rate
- Database connection pool
- Cache hit/miss ratios
- Rate limit counters

---

## Pre-Launch Checklist

Before opening the service to users, verify every item:

### Security

- [ ] `JWT_SECRET` is a random string of 32+ characters
- [ ] `DB_PASSWORD` is a strong random password
- [ ] `APP_CORS_ALLOWED_ORIGINS` is set to the exact frontend origin (not `*`)
- [ ] TLS certificate is valid and auto-renewal is configured
- [ ] Rate limiting is enabled (default: 100 req/min per IP)
- [ ] Health endpoint details are hidden (`show-details: never` in prod profile)
- [ ] Audit logging is accessible (`/audit`) by admin/managers
- [ ] Redis is configured with `--maxmemory-policy allkeys-lru`

### Infrastructure

- [ ] PostgreSQL is configured with automated backups
- [ ] Docker volumes are on a persistent filesystem
- [ ] Host firewall allows only ports 80, 443, and SSH
- [ ] Docker containers have resource limits applied
- [ ] Log rotation is configured for Docker containers

### Operations

- [ ] Grafana admin password is changed from default
- [ ] Prometheus alerting rules are configured (optional)
- [ ] `SPRING_PROFILES_ACTIVE=prod` is set
- [ ] Health checks are passing for all services
- [ ] `wget` is installed in the app container (used by healthcheck)

---

## Resource Allocation (Production)

From `docker-compose.prod.yml`:

| Service    | CPU Limit | Memory Limit | Restart Policy  |
|------------|-----------|--------------|-----------------|
| PostgreSQL | 1.0       | 1 GB         | unless-stopped  |
| Redis      | 0.5       | 300 MB       | unless-stopped  |
| App        | 2.0       | 1536 MB      | unless-stopped  |
| Nginx      | none      | none         | unless-stopped  |
| Prometheus | none      | none         | unless-stopped  |
| Grafana    | none      | none         | unless-stopped  |

**Note**: Adjust these based on your workload. The app's JVM uses `-XX:MaxRAMPercentage=75.0`, so at 1536 MB limit, approximately 1152 MB is available to the JVM heap.

---

## Performance Tuning

### JVM

```dockerfile
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
```

| Flag                    | Effect                              |
|-------------------------|-------------------------------------|
| `MaxRAMPercentage=75`   | JVM heap capped at 75% of container memory |

### Database Connection Pool

Configured in `application.yml`:

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
```

### Redis Cache TTL

```yaml
spring:
  cache:
    redis:
      time-to-live: 600000  # 10 minutes
```

### Search Performance

```yaml
app:
  search:
    default-top-k: 10
    bm25-weight: 0.4
    vector-weight: 0.6
```

---

## Backup Strategy

| Data             | Method                                           | Frequency |
|------------------|--------------------------------------------------|-----------|
| PostgreSQL       | `pg_dump` or managed DB automated snapshots      | Daily     |
| Redis            | `SAVE` or `BGSAVE` (RDB snapshots already on disk)| Not critical (cache only) |
| TLS certificates | `nginx/certbot/conf/` volume backup              | Manual after renewal |

### Example PostgreSQL Backup

```bash
# Manual backup
docker compose exec postgres pg_dump -U memory_engine memory_engine > backup_$(date +%Y%m%d).sql

# Restore
cat backup.sql | docker compose exec -T postgres psql -U memory_engine memory_engine
```

---

## Logging

### Application Logs

```bash
docker compose logs -f app
docker compose logs --tail=100 app
```

### Log Levels

Configured in `application-prod.yml`:

```yaml
logging:
  level:
    com.mnemo.memoryengine: INFO
    org.hibernate.SQL: WARN
    org.springframework.security: WARN
```

### Docker Log Rotation

Docker's built-in log rotation is recommended:

```bash
# /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Then restart Docker:

```bash
sudo systemctl restart docker
```

---

## Scaling

### Vertical Scaling

Increase resource limits in `docker-compose.prod.yml`:

```yaml
app:
  deploy:
    resources:
      limits:
        cpus: "4.0"
        memory: 4G
```

### Horizontal Scaling

For Kubernetes, see the [Kubernetes deployment guide](kubernetes.md). The manifests include an HPA that autoscales from 2 to 8 replicas based on CPU utilization.

### Database Scaling

- **PostgreSQL**: Upgrade instance size, add read replicas, or shard by organization
- **Redis**: Cluster mode for larger cache workloads
- **Kafka**: Add partitions and brokers for higher throughput

---

## Known Gaps

The following are not yet implemented but should be addressed for enterprise readiness:

| Gap                    | Recommendation                          |
|------------------------|-----------------------------------------|
| Automated DB backups   | Schedule `pg_dump` via cron or use managed DB snapshots |
| Secrets manager        | Use HashiCorp Vault, AWS Secrets Manager, or Kubernetes External Secrets |
| Blue/green deployments | Use Kubernetes rolling updates or Docker Compose with a load balancer |
| WAF / DDoS protection  | Cloudflare, AWS WAF, or similar         |
| Load testing           | k6 or Gatling before production launch |
| Container image scanning | Trivy or Snyk in CI pipeline          |

---

## Useful Commands

```bash
# Full production deploy
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Rebuild a single service
docker compose -f docker-compose.yml -f docker-compose.prod.yml build app
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d app

# View logs
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f app

# Restart nginx (e.g., after cert renew)
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart nginx

# Check resource usage
docker stats

# Stop everything
docker compose -f docker-compose.yml -f docker-compose.prod.yml down

# Stop everything and remove volumes
docker compose -f docker-compose.yml -f docker-compose.prod.yml down -v
```

---

## Common Issues

| Symptom                             | Likely Cause                      | Fix                                      |
|-------------------------------------|-----------------------------------|------------------------------------------|
| Nginx returns 502 Bad Gateway       | App not healthy or not started    | `docker compose logs -f app`             |
| TLS certificate not found           | Certbot hasn't run yet            | Run `./nginx/init-letsencrypt.sh`        |
| `ERR_CERT_AUTHORITY_INVALID`        | Temporary self-signed cert still active | Let certbot finish or check logs   |
| App repeatedly restarts             | Health check failing              | Check app logs: `docker compose logs app` |
| Rate limit errors (429)             | Too many requests from single IP  | Adjust `RATE_LIMIT_MAX_REQUESTS` in `.env` |
| Out of memory                       | Container memory limit too low    | Increase `memory` limit in compose overlay |
| Disk full                           | Logs or DB volume growing         | Configure log rotation, archive old backups |
| `ERR_NAME_NOT_RESOLVED`             | DNS not configured for domain     | Add DNS A record pointing to server IP   |

---

## Troubleshooting

### Diagnosis Commands

```bash
# Check all container statuses
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps

# View app logs
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f app

# Test backend health directly
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec app wget -qO- http://localhost:8080/health

# Check PostgreSQL connectivity
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec postgres pg_isready -U memory_engine

# Check Redis connectivity
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec redis redis-cli ping

# Verify TLS certificate
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec certbot certbot certificates

# Check nginx configuration
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec nginx nginx -t

# Inspect resource usage
docker stats
```

### Restarting Services

```bash
# Restart nginx after configuration changes
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart nginx

# Rebuild and restart the app
docker compose -f docker-compose.yml -f docker-compose.prod.yml build app
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d app

# Full restart of the stack
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

---

## Cleanup

```bash
# Stop all containers and remove the stack (preserves data volumes)
docker compose -f docker-compose.yml -f docker-compose.prod.yml down

# Stop all containers and delete all data (database, logs, TLS certs)
docker compose -f docker-compose.yml -f docker-compose.prod.yml down -v

# Stop all containers and remove images
docker compose -f docker-compose.yml -f docker-compose.prod.yml down --rmi all -v

# Revoke TLS certificates (if decommissioning permanently)
docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm certbot certbot delete --cert-name ${DOMAIN_NAME}
```

---

## References

- `docker-compose.yml` — Base service definitions
- `docker-compose.prod.yml` — Production overlay
- `nginx/nginx.conf` — Nginx reverse proxy configuration
- `nginx/init-letsencrypt.sh` — TLS bootstrap script
- `docker/prometheus.yml` — Prometheus scrape configuration
- `backend/src/main/resources/application-prod.yml` — Spring Boot production profile
- `DEPLOYMENT.md` — Original deployment notes and pre-launch checklist
