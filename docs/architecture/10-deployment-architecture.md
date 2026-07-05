# Deployment Architecture

```mermaid
graph TB
    subgraph DevOps["CI/CD Pipeline<br/>GitHub Actions"]
        GIT["Git Push<br/>main Branch"]
        CI["CI Workflow<br/>ubuntu-latest"]
        BUILD["mvn -B clean verify<br/>JUnit + Testcontainers"]
        DOCKER_BUILD["Docker Build<br/>Multi-stage Maven + JRE"]
        PUSH["Push to Registry"]
    end

    subgraph DockerCompose["Docker Compose Deployment"]
        direction TB
        NGINX["Nginx<br/>Port 443/80<br/>TLS Termination"]
        APP["Spring Boot App<br/>Port 8080<br/>2+ Replicas"]
        PG[("PostgreSQL 16<br/>+ pgvector<br/>Port 5432")]
        REDIS[("Redis 7<br/>Alpine<br/>Port 6379")]
        KAFKA["Kafka 4.0<br/>Kraft Mode<br/>Port 9092"]
        PROM["Prometheus<br/>Port 9090"]
        GRAFANA["Grafana<br/>Port 3000"]
        CERTBOT["Certbot<br/>Let's Encrypt<br/>Auto-Renewal"]
    end

    subgraph K8s["Kubernetes Deployment<br/>(Alternative)"]
        INGRESS["Ingress<br/>TLS via cert-manager"]
        SVC["ClusterIP Service<br/>Port 80 → 8080"]
        DEPLOY["Deployment<br/>2-8 Replicas<br/>CPU Auto-Scaling"]
        HPA["HorizontalPodAutoscaler<br/>70% CPU Target"]
        CM["ConfigMap<br/>Non-Sensitive Env Vars"]
        SECRETS["Secrets<br/>DB Credentials<br/>JWT Secret<br/>API Keys"]
    end

    subgraph ExternalServices["External Dependencies"]
        GEMINI["Gemini API<br/>text-embedding-004"]
        COGNEE["Cognee<br/>Memory Engine API"]
    end

    subgraph Monitoring["Observability Stack"]
        PROM_METRICS["JVM Metrics<br/>/actuator/prometheus"]
        GRAFANA_DASH["Memory Engine<br/>Dashboard"]
        HEALTH["Health Checks<br/>/actuator/health<br/>/health"]
    end

    GIT --> CI
    CI --> BUILD
    BUILD --> DOCKER_BUILD
    DOCKER_BUILD --> PUSH

    PUSH --> APP

    APP --> PG
    APP --> REDIS
    APP --> KAFKA
    APP --> NGINX
    CERTBOT --> NGINX

    APP --> GEMINI
    APP --> COGNEE

    PROM --> APP
    GRAFANA --> PROM

    INGRESS --> SVC
    SVC --> DEPLOY
    DEPLOY --> HPA
    DEPLOY --> CM
    DEPLOY --> SECRETS
    DEPLOY --> PG
    DEPLOY --> REDIS
    DEPLOY --> KAFKA

    PROM_METRICS --> PROM
    HEALTH --> PROM
```

**Diagram 10: Deployment Architecture** — Two deployment options: Docker Compose (development/staging) and Kubernetes (production). The CI pipeline builds and tests the application with Testcontainers, produces a multi-stage Docker image (Maven build → JRE runtime), and pushes to a container registry. Docker Compose orchestrates all services including PostgreSQL 16 (pgvector), Redis 7, Kafka 4.0 (Kraft mode), Prometheus, Grafana, and an Nginx reverse proxy with Let's Encrypt TLS. The Kubernetes option adds auto-scaling (2-8 pods, 70% CPU), ConfigMap for environment variables, and secrets for sensitive credentials. Both configurations connect to external Gemini and Cognee APIs.
