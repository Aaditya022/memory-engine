# Kubernetes Deployment

The `k8s/` directory contains a minimal set of manifests for deploying the Memory Engine backend on Kubernetes. These are a working starting point — not a Helm chart.

**Important**: These manifests deploy only the backend application (Spring Boot). You must provide external PostgreSQL (with pgvector) and Redis instances (e.g., RDS, Cloud SQL, ElastiCache, or your own StatefulSets).

---

## Overview

```
                              ┌──────────────┐
                              │   Ingress    │  TLS via cert-manager
                              │  (external)  │  nginx ingress controller
                              └──────┬───────┘
                                     │ https://api.yourdomain.com
                              ┌──────▼───────┐
                              │   Service    │  ClusterIP :80
                              │  (internal)  │  → :8080
                              └──────┬───────┘
                                     │
                        ┌────────────▼────────────┐
                        │      Deployment         │  2 replicas (HPA 2-8)
                        │  memory-engine:latest   │  requests: 250m/512Mi
                        └────────────┬────────────┘        limits: 1/1Gi
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
            ┌───────▼──────┐ ┌──────▼───────┐ ┌──────▼───────┐
            │  PostgreSQL  │ │    Redis     │ │   (Kafka)    │
            │  (external)  │ │  (external)  │ │  (optional)  │
            └──────────────┘ └──────────────┘ └──────────────┘
```

---

## Prerequisites

| Tool         | Version  | Purpose                                |
|--------------|----------|----------------------------------------|
| kubectl      | 1.28+    | Kubernetes CLI                         |
| Docker       | 24+      | Build the backend image                |
| Container registry | —   | Where you push the image (Docker Hub, ECR, GCR, etc.) |
| cert-manager | 1.12+    | Automated TLS certificates (optional)  |
| Ingress controller | —   | nginx-ingress, Traefik, or AWS/GCP ALB |

External dependencies (not included in manifests):

| Service    | Purpose                           | Example Managed Service     |
|------------|-----------------------------------|-----------------------------|
| PostgreSQL | Primary database with pgvector    | AWS RDS, Cloud SQL, Aiven   |
| Redis      | Caching, rate limiting, tokens    | AWS ElastiCache, Redis Cloud|

---

## Step 1: Build and Push the Backend Image

```bash
cd backend

# Build
docker build -t <your-registry>/memory-engine:<tag> .

# Push
docker push <your-registry>/memory-engine:<tag>
```

---

## Step 2: Configure the ConfigMap

Edit `k8s/configmap.yaml` with your real infrastructure values:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: memory-engine-config
  namespace: memory-engine
data:
  DB_HOST: "postgres.example.internal"       # Your PostgreSQL host
  DB_PORT: "5432"
  DB_NAME: "memory_engine"
  DB_USER: "memory_engine"
  REDIS_HOST: "redis.example.internal"        # Your Redis host
  REDIS_PORT: "6379"
  SERVER_PORT: "8080"
  SPRING_PROFILES_ACTIVE: "prod"
  APP_CORS_ALLOWED_ORIGINS: "https://app.yourdomain.com"
  RATE_LIMIT_MAX_REQUESTS: "100"
  RATE_LIMIT_WINDOW_SECONDS: "60"
```

---

## Step 3: Configure the Deployment

Edit `k8s/deployment.yaml`:

```yaml
spec:
  template:
    spec:
      containers:
        - name: memory-engine
          image: <your-registry>/memory-engine:<tag>   # ← Change this
```

---

## Step 4: Configure the Ingress

Edit `k8s/ingress.yaml` with your domain and TLS setup:

```yaml
spec:
  tls:
    - hosts: ["api.yourdomain.com"]          # ← Your domain
      secretName: memory-engine-tls
  rules:
    - host: api.yourdomain.com               # ← Your domain
```

---

## Step 5: Create the Namespace and Secrets

```bash
kubectl create namespace memory-engine
```

```bash
kubectl -n memory-engine create secret generic memory-engine-secrets \
  --from-literal=JWT_SECRET="$(openssl rand -base64 48)" \
  --from-literal=DB_PASSWORD="your-real-db-password" \
  --from-literal=GEMINI_API_KEY="your-gemini-key-or-empty"
```

---

## Step 6: Apply All Manifests

Apply in the order defined in `k8s/README.md`:

```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
```

---

## Verification

### Check Pod Status

```bash
kubectl -n memory-engine get pods

# NAME                             READY   STATUS    RESTARTS   AGE
# memory-engine-7d4f8b9c6f-abc12   1/1     Running   0          2m
# memory-engine-7d4f8b9c6f-xyz78   1/1     Running   0          2m
```

### Check the Health Endpoint

```bash
# Port-forward to a pod
kubectl -n memory-engine port-forward deploy/memory-engine 8080:8080 &
curl http://localhost:8080/health

# Expected:
# {"status":"UP","service":"memory-engine","timestamp":"2026-07-05T12:00:00Z"}
```

### Check Ingress

```bash
kubectl -n memory-engine get ingress
```

### Check HPA

```bash
kubectl -n memory-engine get hpa

# NAME            REFERENCE                  TARGETS   MINPODS   MAXPODS   REPLICAS
# memory-engine   Deployment/memory-engine   45%/70%   2         8         2
```

### Check Logs

```bash
kubectl -n memory-engine logs -l app=memory-engine --tail=50
```

---

## Resource Configuration

### Deployment

| Property          | Value                    |
|-------------------|--------------------------|
| Replicas          | 2 (default)              |
| CPU request       | 250m                     |
| Memory request    | 512 Mi                   |
| CPU limit         | 1                        |
| Memory limit      | 1 Gi                     |
| Readiness probe   | `GET /health`, delay 20s, period 10s |
| Liveness probe    | `GET /health`, delay 40s, period 20s |

### HPA

| Property       | Value         |
|----------------|---------------|
| Min replicas   | 2             |
| Max replicas   | 8             |
| Metric         | CPU at 70%    |

### Service

| Property  | Value                 |
|-----------|-----------------------|
| Type      | ClusterIP             |
| Port      | 80 → targetPort 8080  |

---

## Environment Variables

### ConfigMap (non-sensitive)

| Variable                    | ConfigMap Key               |
|-----------------------------|-----------------------------|
| `DB_HOST`                   | `postgres.example.internal` |
| `DB_PORT`                   | `5432`                      |
| `DB_NAME`                   | `memory_engine`             |
| `DB_USER`                   | `memory_engine`             |
| `REDIS_HOST`                | `redis.example.internal`    |
| `REDIS_PORT`                | `6379`                      |
| `SERVER_PORT`               | `8080`                      |
| `SPRING_PROFILES_ACTIVE`    | `prod`                      |
| `APP_CORS_ALLOWED_ORIGINS`  | `https://app.yourdomain.com`|
| `RATE_LIMIT_MAX_REQUESTS`   | `100`                       |
| `RATE_LIMIT_WINDOW_SECONDS` | `60`                        |

### Secrets (sensitive)

| Variable        | Source                      |
|-----------------|-----------------------------|
| `JWT_SECRET`    | `memory-engine-secrets` key `JWT_SECRET` |
| `DB_PASSWORD`   | `memory-engine-secrets` key `DB_PASSWORD` |
| `GEMINI_API_KEY`| `memory-engine-secrets` key `GEMINI_API_KEY` |

---

## Common Issues

| Symptom                              | Likely Cause                        | Fix                                            |
|--------------------------------------|-------------------------------------|------------------------------------------------|
| Pods crash-loop with DB connection error | Wrong DB host/credentials in ConfigMap or Secrets | Verify `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` |
| Pods crash-loop with Redis error     | Redis unreachable                   | Verify `REDIS_HOST` and `REDIS_PORT`           |
| ImagePullBackOff                     | Image not found in registry         | Verify image name and tag in `deployment.yaml` |
| Ingress returns 503                  | Backend not healthy or Service misconfigured | Check pods, port, service endpoint   |
| TLS certificate not provisioning     | cert-manager not installed or misconfigured | Check cert-manager logs and `ClusterIssuer` |
| HPA not scaling                      | Metrics server not installed        | `kubectl top pods` to verify metrics availability |

---

## Troubleshooting

```bash
# Describe a failing pod
kubectl -n memory-engine describe pod <pod-name>

# Check pod logs
kubectl -n memory-engine logs <pod-name>

# Check events in namespace
kubectl -n memory-engine get events --sort-by=.lastTimestamp

# Exec into a pod
kubectl -n memory-engine exec -it <pod-name> -- sh

# Port-forward for local testing
kubectl -n memory-engine port-forward deploy/memory-engine 8080:8080

# Check ConfigMap
kubectl -n memory-engine get configmap memory-engine-config -o yaml

# Check Secrets (base64 encoded)
kubectl -n memory-engine get secret memory-engine-secrets -o yaml
```

---

## Useful Commands

```bash
# Scale manually
kubectl -n memory-engine scale deploy/memory-engine --replicas=3

# Rolling restart
kubectl -n memory-engine rollout restart deploy/memory-engine

# Check rollout status
kubectl -n memory-engine rollout status deploy/memory-engine

# View HPA status
kubectl -n memory-engine describe hpa memory-engine

# Delete everything
kubectl delete namespace memory-engine
```

---

## Cleanup

```bash
# Delete all resources in the namespace
kubectl delete namespace memory-engine

# Or delete individual resources
kubectl delete -f k8s/hpa.yaml
kubectl delete -f k8s/ingress.yaml
kubectl delete -f k8s/service.yaml
kubectl delete -f k8s/deployment.yaml
kubectl delete -f k8s/configmap.yaml
kubectl delete secret -n memory-engine memory-engine-secrets
```

---

## Important Notes

- **PostgreSQL must have pgvector extension** installed. If using RDS, enable the `pgvector` extension via a custom DB parameter group.
- **No Kafka in k8s manifests**. The manifests deploy only the app. Kafka for Cognee sync is optional and can be run separately.
- **No Prometheus/Grafana in k8s manifests**. Deploy these separately (e.g., Prometheus Operator, Grafana Helm chart).
- **No frontend**. The Next.js frontend is not containerized in this project. Deploy it separately (Vercel, Netlify, or a separate nginx container with the built static output).
- **Image tag**: The `deployment.yaml` uses `REPLACE_WITH_YOUR_REGISTRY/memory-engine:latest`. Always use an explicit, versioned tag in production (e.g., `memory-engine:v1.2.3`).

---

## References

- `k8s/configmap.yaml` — Non-sensitive configuration
- `k8s/deployment.yaml` — App deployment with probes and resource limits
- `k8s/service.yaml` — Internal ClusterIP service
- `k8s/ingress.yaml` — TLS ingress with cert-manager
- `k8s/hpa.yaml` — CPU-based horizontal autoscaling
- `k8s/README.md` — Original apply instructions
