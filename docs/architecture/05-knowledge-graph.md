# Knowledge Graph Architecture

```mermaid
graph TB
    subgraph Entities["Core Entities"]
        PEOPLE["People<br/>Names, Roles<br/>Meeting Participants"]
        MEETINGS["Meetings<br/>Title, Date<br/>Duration, Source"]
        PROJ["Projects<br/>Cross-Meeting Topics<br/>Goal Tracking"]
        DEC["Decisions<br/>Decision Text<br/>Decision Maker<br/>Alternatives Discussed<br/>Final Outcome"]
        ACT["Action Items<br/>Task Description<br/>Owner, Deadline<br/>Priority, Status"]
        ORG["Organizations<br/>Company Names<br/>Team Structures"]
        TECH["Technologies<br/>Tech Stack<br/>Tools Used"]
        FACT["Facts<br/>Extracted Knowledge<br/>Key Information"]
    end

    subgraph Relationships["Entity Relationships Table"]
        R1["Source Entity → Relationship → Target Entity<br/>confidence: Float<br/>meeting_id: FK"]
    end

    subgraph Graph["Knowledge Graph Construction"]
        G1["Entity Co-occurrence<br/>Same Meeting Mentions"]
        G2["Sequential Linking<br/>Discussion → Decision Chain"]
        G3["Temporal Connection<br/>Timeline-Based Context"]
    end

    subgraph Storage["Storage Layer"]
        S1[("extracted_entities Table<br/>entity_type, entity_value<br/>mention_count")]
        S2[("entity_relationships Table<br/>source_entity, relationship<br/>target_entity, confidence")]
        S3[("memories Table<br/>memory_type, content<br/>search_vector, embedding")]
    end

    subgraph Query["Query Patterns"]
        Q1["By Person<br/>GET /memory/person/{name}"]
        Q2["By Project<br/>GET /memory/project/{name}"]
        Q3["Semantic Search<br/>POST /search<br/>Natural Language Query"]
        Q4["Timeline View<br/>GET /memory/timeline<br/>Chronological Feed"]
    end

    PEOPLE --- R1
    MEETINGS --- R1
    PROJ --- R1
    DEC --- R1
    ACT --- R1
    ORG --- R1
    TECH --- R1
    FACT --- R1

    R1 --> G1
    R1 --> G2
    R1 --> G3

    G1 --> S1
    G2 --> S2
    G3 --> S3

    S1 --> Q1
    S2 --> Q2
    S3 --> Q3
    S3 --> Q4
```

**Diagram 5: Knowledge Graph** — The knowledge graph connects eight entity types (People, Meetings, Projects, Decisions, Action Items, Organizations, Technologies, Facts) through a dedicated `entity_relationships` table. Each relationship stores source/target entities, relationship type, confidence score, and the originating meeting. The graph is constructed through entity co-occurrence analysis, sequential decision-action linking, and temporal connections across the timeline. Query patterns include person-based, project-based, semantic, and chronological retrieval.
