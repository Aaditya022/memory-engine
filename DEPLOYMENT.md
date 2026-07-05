# Deployment Guide

Two supported paths: **Docker Compose on a single VM** (simplest, good up to
moderate traffic) and **Kubernetes** (for real horizontal scale / multi-node
HA). Both use the same Docker image.

---

## Path A — Docker Compose on a VM (recommended to start)

### 1. Provision a machine
Any VM with Docker + Docker Compose v2 installed. 2 vCPU / 4GB RAM is a
reasonable starting point. Point a DNS A record at its public IP
(`api.yourdomain.com`).

### 2. Configure secrets
```bash
cp .env.example .env
```
Fill in every value in `.env` — in particular:
- `JWT_SECRET` — generate with `openssl rand -base64 48`. **The app refuses to
  start under `SPRING_PROFILES_ACTIVE=prod` if this is left at the default.**
- `DB_PASSWORD` — same rule applies.
- `APP_CORS_ALLOWED_ORIGINS` — your real frontend origin(s), not `*`.
- `DOMAIN_NAME` / `CERTBOT_EMAIL` — for TLS.

### 3. Bootstrap TLS (one-time)
```bash
chmod +x nginx/init-letsencrypt.sh
./nginx/init-letsencrypt.sh
```
This gets you a real Let's Encrypt cert behind nginx. The `certbot` container
in `docker-compose.prod.yml` keeps renewing it automatically every 12h checks.

### 4. Bring the stack up
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

This starts Postgres, Redis, the app (with `SPRING_PROFILES_ACTIVE=prod`),
nginx (TLS termination), Prometheus, and Grafana — with Postgres/Redis/app
ports **not** published to the host (only nginx's 80/443 are public).

### 5. Verify
```bash
curl https://api.yourdomain.com/health
# {"status":"UP","service":"memory-engine",...}

docker compose logs -f app   # watch startup, confirm no errors
```

### 6. Ongoing operations
- **Logs**: `docker compose logs -f app`
- **Restart after config change**: `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d`
- **DB backups**: set up a cron job running `docker exec memory-engine-postgres pg_dump -U <user> <db> | gzip > backup-$(date +%F).sql.gz` on a schedule, shipped off-box (S3/similar). Not included here — genuinely depends on your retention/compliance needs.
- **Updating the app**: `git pull && docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build app`
- **Monitoring**: Grafana is running but not exposed publicly — reach it via `ssh -L 3000:localhost:3000 your-vm` then open `localhost:3000` locally, or put it behind the same nginx with basic auth if you want it public.

---

## Path B — Kubernetes

See `k8s/README.md`. You'll need Postgres (with pgvector) and Redis available
as managed services or your own StatefulSets — the manifests here assume
those already exist and just deploy the app itself, since DB/cache hosting
choices vary too much between clusters to script generically.

---

## Pre-launch checklist

Run through this before pointing real users at it:

- [ ] `mvn clean verify` passes locally (this code was not compiled in the
      sandbox that generated it — treat this as step zero, not optional)
- [ ] `.env` has real, unique `JWT_SECRET` and `DB_PASSWORD` (not the defaults)
- [ ] `APP_CORS_ALLOWED_ORIGINS` set to your real frontend origin(s)
- [ ] TLS is live (`https://` works, `http://` redirects to it)
- [ ] Registered a test account, created a meeting, ingested a transcript,
      confirmed `/search` returns results end-to-end
- [ ] Rate limiting confirmed working (`RATE_LIMIT_MAX_REQUESTS` requests in
      `RATE_LIMIT_WINDOW_SECONDS` → next request gets HTTP 429)
- [ ] Postgres backup job scheduled and tested (restore, not just backup)
- [ ] `/audit`, `/actuator/**` confirmed to require ADMIN/MANAGER role
      (`curl` without a token should get 401/403, not data)
- [ ] Grafana admin password changed from the `.env` default
- [ ] Decide and document your actual SLA/on-call plan if this is customer-facing —
      nothing here provides paging/alerting, that's a separate integration
      (Prometheus Alertmanager + PagerDuty/Opsgenie, not included)

## What's still genuinely missing for "enterprise-grade production"

Being upfront rather than overselling this:

- **No automated DB backups** — you must wire this up yourself (see above)
- **No secrets manager integration** — `.env` file secrets are fine for a
  single VM, not for a team; move to Vault/AWS Secrets Manager/Doppler if
  more than one person touches this
- **No blue/green or canary deploy** — `docker compose up -d --build app`
  causes a brief restart-induced gap; fine for early stage, not for
  zero-downtime requirements
- **No WAF/DDoS protection** — the app-level rate limiter guards its own
  capacity, not volumetric attacks; put Cloudflare or similar in front if
  that's a real threat model for you
- **No load testing performed** — the PRD's "10,000+ concurrent users" target
  is aspirational until you actually run k6/Gatling against it
