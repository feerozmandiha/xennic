# Event Topology — Semantic Integration Layer

## Event Pipeline

```mermaid
flowchart LR
    subgraph KF["Knowledge Factory"]
        U[Document Uploaded]
        C[Document Classified]
        P[Document Parsed]
        N[Document Normalized]
        H[Document Chunked]
        E[Embeddings Generated]
        PB[Document Published]
    end

    subgraph SI["Semantic Integration"]
        OB[Event Outbox]
        BUS[Semantic Event Bus]
        DPH[DocumentPublished Handler]
        CIH[Cache Invalidation Handler]
    end

    subgraph KI["Knowledge Intelligence"]
        GN[Graph Node Created]
        GE[Graph Edges Created]
        MC[Metrics Calculated]
    end

    subgraph AIR["AI Runtime"]
        CACHE[In-Memory Caches]
    end

    U --> OB
    C --> OB
    P --> OB
    N --> OB
    H --> OB
    E --> OB
    PB --> OB

    OB -->|poll 5s| BUS
    BUS --> DPH
    BUS --> CIH

    DPH --> GN
    DPH --> MC
    DPH -->|creates node| KI
    CIH -->|clears| CACHE

    GN -.->|subsequent events| OB
    MC -.->|subsequent events| OB
```

## Document Published Event Flow

```mermaid
sequenceDiagram
    participant PW as PublishWorker
    participant DP as DomainEventPublisher
    participant OB as Event Outbox (DB)
    participant OR as OutboxRelay
    participant BUS as SemanticEventBus
    participant DPH as DocumentPublishedHandler
    participant GNR as GraphNodeRepository
    participant GMR as GraphMetricsRepository
    participant CCS as ConfidenceService
    participant ATS as AuthorityService
    participant FRS as FreshnessService
    participant CPS as CompletenessService
    participant CIH as CacheInvalidationHandler
    participant AIR as AI Runtime Caches

    PW->>DP: publish(DocumentPublished)
    DP->>OB: INSERT event_outbox (status=pending)

    loop every 5s
        OR->>OB: SELECT pending events
        OB-->>OR: [DocumentPublished]
        OR->>BUS: publish(event)
    end

    BUS->>DPH: handle(event)
    DPH->>DPH: check event_process_log (idempotency)

    DPH->>GNR: findByEntity('knowledge_document', docId)
    alt Node doesn't exist
        DPH->>GNR: create(graph node)
        GNR-->>DPH: node
    end

    DPH->>CCS: calculateConfidence(nodeId)
    DPH->>FRS: calculateFreshness(nodeId)
    DPH->>ATS: calculateAuthority(nodeId)
    DPH->>CPS: calculateCompleteness(nodeId)
    CCS-->>DPH: 0.85
    FRS-->>DPH: 0.92
    ATS-->>DPH: 0.78
    CPS-->>DPH: 0.65

    DPH->>GMR: save({nodeId, confidence, freshness, authority, completeness})
    DPH->>DP: publish(GraphNodeCreated)
    DPH->>DP: publish(MetricsCalculated)
    DPH->>OR: log completion in event_process_log

    BUS->>CIH: handle(event)
    CIH->>CIH: check event_process_log (idempotency)
    CIH->>AIR: clearSession('*')
    CIH->>AIR: remove('*')
    CIH->>OR: log completion
```

## Domain Event Schema

```typescript
interface DomainEvent<T> {
  eventId: string; // UUID v4
  eventType: EventType; // Enum: DocumentUploaded..SearchIndexUpdated
  eventVersion: number; // Schema version (starts at 1)
  correlationId: string; // Links all events from same document
  causationId: string; // Links to the causing event
  tracingId: string; // End-to-end trace
  timestamp: string; // ISO 8601
  source: string; // Module name
  data: T; // Typed payload
  metadata: {
    userId?: string;
    workspaceId: string;
    retryCount: number;
  };
}
```

## Outbox Table Schema

```sql
CREATE TABLE event_outbox (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID NOT NULL UNIQUE,
  event_type      VARCHAR(50) NOT NULL,
  event_version   INT DEFAULT 1,
  correlation_id  UUID NOT NULL,
  causation_id    UUID,
  tracing_id      UUID NOT NULL,
  source          VARCHAR(50) NOT NULL,
  payload         JSONB NOT NULL,
  metadata        JSONB DEFAULT '{}',
  workspace_id    UUID NOT NULL,
  status          VARCHAR(20) DEFAULT 'pending',
  retry_count     INT DEFAULT 0,
  max_retries     INT DEFAULT 3,
  last_error      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  last_attempt_at TIMESTAMPTZ
);

CREATE INDEX idx_outbox_status ON event_outbox(status, created_at);
CREATE INDEX idx_outbox_correlation ON event_outbox(correlation_id);
CREATE INDEX idx_outbox_workspace ON event_outbox(workspace_id);
```

## Event Chaining (Correlation)

When a document is processed through the pipeline, events form a chain:

```
DocumentUploaded (correlationId: A)
  └─ causationId: A
  └─ tracingId: T

DocumentPublished (correlationId: A, causationId: prev-event-id)
  └─ tracingId: T

GraphNodeCreated (correlationId: A, causationId: doc-published-event-id)
  └─ tracingId: T

MetricsCalculated (correlationId: A, causationId: doc-published-event-id)
  └─ tracingId: T
```

- All events for one document share the same `correlationId`
- Each event records what caused it via `causationId`
- `tracingId` is preserved end-to-end for distributed tracing
