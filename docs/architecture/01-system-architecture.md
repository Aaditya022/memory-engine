# System Architecture

```mermaid
graph TB
    subgraph Client["Client Layer"]
        UI["Next.js 16 Frontend<br/>React 19 + Tailwind CSS v4"]
    end

    subgraph Gateway["API Gateway"]
        NGINX["Nginx Reverse Proxy<br/>TLS Termination"]
    end

    subgraph Backend["Backend Layer"]
        SB["Spring Boot 3.3.4<br/>Java 21"]

        subgraph Auth["Authentication"]
            JWT["JWT Token Management<br/>jjwt 0.12.6"]
            SC["Security Config<br/>Spring Security"]
        end

        subgraph Processing["Async Processing"]
            ASYNC["@Async Pipeline<br/>Thread Pool"]
            KS["Kafka Streams<br/>Cognee Sync"]
        end
    end

    subgraph AI["AI Layer"]
        GEMINI["Gemini API<br/>text-embedding-004<br/>gemini-2.5-flash"]
        COGNEE["Cognee<br/>Memory Engine<br/>External AI Service"]
    end

    subgraph Storage["Data Layer"]
        PG[("PostgreSQL 16<br/>+ pgvector")]
        REDIS[("Redis 7<br/>Cache + Rate Limiting")]
    end

    subgraph Monitoring["Observability"]
        PROM["Prometheus"]
        GRAFANA["Grafana"]
    end

    UI -->|"HTTPS<br/>REST API"| NGINX
    NGINX -->|"Proxy"| SB

    SB --> JWT
    SB --> SC
    SB --> ASYNC
    SB --> KS

    ASYNC -->|"Embeddings"| GEMINI
    KS -->|"Memory Events"| COGNEE
    SB -->|"REST Client"| COGNEE

    SB --> PG
    SB --> REDIS

    PROM -->|"Scrape"| SB
    GRAFANA -->|"Query"| PROM
```

**Diagram 1: System Architecture** — High-level overview of the Memory Engine platform. A Next.js 16 frontend communicates via HTTPS through an Nginx reverse proxy to a Spring Boot 3.3.4 backend. The backend handles authentication via JWT, processes transcripts asynchronously, generates embeddings via Gemini API, syncs with the Cognee external memory service over Kafka, and persists data to PostgreSQL 16 (with pgvector) while using Redis 7 for caching, rate limiting, and token blacklisting. Prometheus and Grafana provide observability.
