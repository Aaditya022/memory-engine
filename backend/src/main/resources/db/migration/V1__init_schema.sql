-- ============================================================
-- Persistent Memory Engine - Initial Schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ---------- Organizations ----------
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Users ----------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'EMPLOYEE', -- ADMIN, MANAGER, EMPLOYEE
    api_key VARCHAR(128) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_org ON users(organization_id);

-- ---------- Meetings ----------
CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    source VARCHAR(64), -- zoom, meet, manual, etc.
    started_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_meetings_org ON meetings(organization_id);
CREATE INDEX idx_meetings_started_at ON meetings(started_at);

-- ---------- Participants ----------
CREATE TABLE meeting_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id),
    role_in_meeting VARCHAR(64)
);

CREATE INDEX idx_participants_meeting ON meeting_participants(meeting_id);

-- ---------- Transcripts ----------
CREATE TABLE transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    raw_text TEXT NOT NULL,
    processed BOOLEAN NOT NULL DEFAULT false,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transcripts_meeting ON transcripts(meeting_id);
CREATE INDEX idx_transcripts_processed ON transcripts(processed);

-- ---------- Extracted Entities ----------
CREATE TABLE extracted_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transcript_id UUID NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    entity_type VARCHAR(32) NOT NULL, -- PERSON, ORGANIZATION, PRODUCT, DATE, TECHNOLOGY, PROJECT
    entity_value VARCHAR(500) NOT NULL,
    mention_count INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_entities_meeting ON extracted_entities(meeting_id);
CREATE INDEX idx_entities_value ON extracted_entities USING gin (entity_value gin_trgm_ops);
CREATE INDEX idx_entities_type ON extracted_entities(entity_type);

-- ---------- Entity Relationships (lightweight knowledge graph) ----------
CREATE TABLE entity_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    source_entity VARCHAR(500) NOT NULL,
    relationship VARCHAR(64) NOT NULL, -- owns, assigned, replaced_by, works_on, decided_by ...
    target_entity VARCHAR(500) NOT NULL,
    meeting_id UUID REFERENCES meetings(id),
    confidence NUMERIC(4,3) NOT NULL DEFAULT 0.8,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_relationships_org ON entity_relationships(organization_id);
CREATE INDEX idx_relationships_source ON entity_relationships(source_entity);
CREATE INDEX idx_relationships_target ON entity_relationships(target_entity);

-- ---------- Memories ----------
CREATE TABLE memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    memory_type VARCHAR(32) NOT NULL, -- DECISION, ACTION_ITEM, FACT, COMMITMENT, DISCUSSION
    content TEXT NOT NULL,
    owner_name VARCHAR(255),
    event_date DATE,
    confidence NUMERIC(4,3) NOT NULL DEFAULT 0.8,
    importance_score NUMERIC(5,3) NOT NULL DEFAULT 0.5,
    freshness_score NUMERIC(5,3) NOT NULL DEFAULT 1.0,
    frequency_score NUMERIC(5,3) NOT NULL DEFAULT 0.0,
    final_rank_score NUMERIC(6,3) NOT NULL DEFAULT 0.0,
    search_vector tsvector,
    embedding vector(768),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_memories_org ON memories(organization_id);
CREATE INDEX idx_memories_meeting ON memories(meeting_id);
CREATE INDEX idx_memories_type ON memories(memory_type);
CREATE INDEX idx_memories_search_vector ON memories USING gin(search_vector);
-- IVFFlat index for approximate nearest-neighbour vector search.
-- lists chosen conservatively for small-to-medium datasets; tune as data grows.
CREATE INDEX idx_memories_embedding ON memories USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE OR REPLACE FUNCTION memories_search_vector_trigger() RETURNS trigger AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', coalesce(NEW.content, '') || ' ' || coalesce(NEW.owner_name, ''));
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_memories_search_vector
BEFORE INSERT OR UPDATE ON memories
FOR EACH ROW EXECUTE FUNCTION memories_search_vector_trigger();

-- ---------- Action Items ----------
CREATE TABLE action_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    memory_id UUID REFERENCES memories(id) ON DELETE SET NULL,
    owner_name VARCHAR(255),
    task TEXT NOT NULL,
    deadline DATE,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, DONE, CANCELLED
    priority VARCHAR(16) NOT NULL DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_action_items_org ON action_items(organization_id);
CREATE INDEX idx_action_items_status ON action_items(status);
CREATE INDEX idx_action_items_owner ON action_items(owner_name);

-- ---------- Decisions ----------
CREATE TABLE decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    memory_id UUID REFERENCES memories(id) ON DELETE SET NULL,
    decision_text TEXT NOT NULL,
    decision_maker VARCHAR(255),
    alternatives_discussed TEXT,
    final_outcome TEXT,
    decided_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_decisions_org ON decisions(organization_id);
CREATE INDEX idx_decisions_meeting ON decisions(meeting_id);

-- ---------- Audit Logs ----------
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    actor_user_id UUID REFERENCES users(id),
    action VARCHAR(128) NOT NULL,
    resource_type VARCHAR(64),
    resource_id UUID,
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at);
