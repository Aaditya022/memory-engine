# Kubernetes manifests (optional path)

These are a minimal, working starting point — not a Helm chart, no bells and
whistles. They assume you already have Postgres (with pgvector) and Redis
running somewhere reachable from the cluster (managed services like RDS +
ElastiCache, or your own StatefulSets — not included here, since production
DB hosting choices vary too much to script sensibly).

## Apply order

```bash
kubectl create namespace memory-engine
kubectl -n memory-engine create secret generic memory-engine-secrets \
  --from-literal=JWT_SECRET="$(openssl rand -base64 48)" \
  --from-literal=DB_PASSWORD="your-real-db-password" \
  --from-literal=GEMINI_API_KEY="your-key-or-empty"

kubectl apply -f configmap.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
kubectl apply -f ingress.yaml
kubectl apply -f hpa.yaml
```

Edit `configmap.yaml` first: set `DB_HOST`, `DB_NAME`, `DB_USER`, `REDIS_HOST`,
and `APP_CORS_ALLOWED_ORIGINS` to your real values. Edit `ingress.yaml` to set
your real domain and TLS/cert-manager setup (or swap for your own ingress
controller's annotations).
