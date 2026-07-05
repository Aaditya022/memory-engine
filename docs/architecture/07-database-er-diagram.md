# Database Entity-Relationship Diagram

```mermaid
erDiagram
    organizations ||--o{ users : "has"
    organizations ||--o{ meetings : "contains"
    organizations ||--o{ memories : "owns"
    organizations ||--o{ entity_relationships : "tracks"
    organizations ||--o{ audit_logs : "logs"

    users ||--o{ meetings : "participated"

    meetings ||--o{ meeting_participants : "includes"
    meetings ||--o{ transcripts : "generates"
    meetings ||--o{ extracted_entities : "discovers"
    meetings ||--o{ memories : "produces"
    meetings ||--o{ entity_relationships : "originates"

    transcripts ||--o{ extracted_entities : "contains"
    transcripts ||--o{ memories : "sources"

    memories ||--o{ action_items : "triggers"
    memories ||--o{ decisions : "records"

    organizations {
        uuid id PK
        varchar name
        timestamp created_at
    }

    users {
        uuid id PK
        uuid organization_id FK
        varchar full_name
        varchar email UK
        varchar password_hash
        enum role "ADMIN | MANAGER | EMPLOYEE"
        timestamp created_at
    }

    meetings {
        uuid id PK
        uuid organization_id FK
        varchar title
        varchar source
        timestamp started_at
        integer duration_seconds
        uuid created_by FK
        timestamp created_at
    }

    meeting_participants {
        uuid id PK
        uuid meeting_id FK
        varchar name
        uuid user_id FK
    }

    transcripts {
        uuid id PK
        uuid meeting_id FK
        text raw_text
        boolean processed
        timestamp created_at
    }

    extracted_entities {
        uuid id PK
        uuid transcript_id FK
        uuid meeting_id FK
        enum entity_type "PERSON | ORGANIZATION | PRODUCT | DATE | TECHNOLOGY | PROJECT"
        varchar entity_value
        integer mention_count
    }

    entity_relationships {
        uuid id PK
        uuid organization_id FK
        varchar source_entity
        varchar relationship
        varchar target_entity
        uuid meeting_id FK
        float confidence
    }

    memories {
        uuid id PK
        uuid organization_id FK
        uuid meeting_id FK
        enum memory_type "DECISION | ACTION_ITEM | FACT | COMMITMENT | DISCUSSION"
        text content
        varchar owner_name
        tsvector search_vector
        vector embedding "(768)"
        float importance_score
        float confidence_score
        timestamp created_at
    }

    decisions {
        uuid id PK
        uuid organization_id FK
        uuid meeting_id FK
        uuid memory_id FK
        text decision_text
        varchar decision_maker
        text alternatives_discussed
        text final_outcome
        timestamp created_at
    }

    action_items {
        uuid id PK
        uuid organization_id FK
        uuid meeting_id FK
        uuid memory_id FK
        varchar owner_name
        text task
        date deadline
        enum status "PENDING | IN_PROGRESS | DONE | CANCELLED"
        enum priority "LOW | MEDIUM | HIGH | CRITICAL"
        timestamp created_at
    }

    audit_logs {
        uuid id PK
        uuid organization_id FK
        uuid actor_id FK
        varchar action
        varchar resource_type
        varchar resource_id
        jsonb details
        timestamp created_at
    }
```

**Diagram 7: Database ER Diagram** — Complete entity-relationship model across 11 tables. The schema uses UUID primary keys, organizations for multi-tenancy, and pgvector's `vector(768)` type for embeddings. Key relationships show the meeting-to-memory pipeline, entity extraction graph, and action item/decision tracking. The `memories` table has both a `tsvector` (GIN-indexed for BM25) and `embedding` (IVFFlat-indexed for vector search) column for hybrid search. Audit logs capture all mutations with JSONB detail storage.
