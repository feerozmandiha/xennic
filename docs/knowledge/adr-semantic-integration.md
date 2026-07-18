# ADR-002: Semantic Integration Layer

**Status:** Accepted  
**Date:** 2026-07-04  
**Deciders:** Architecture Team  
**Tags:** events, integration, outbox, domain-events

## Context

The Xennic platform has 8 independently-operating modules (Knowledge Factory, Knowledge Intelligence, Knowledge CMS, AI Runtime, Storage, RBAC, Workspace, Search) with no automated cross-module orchestration. When a document is published in Knowledge Factory, there is no mechanism to:

1. Auto-create a graph representation in Knowledge Intelligence
2. Calculate semantic metrics (authority, confidence, freshness, completeness)
3. Invalidate AI Runtime caches
4. Synchronize search indexes

Previously this would require manual API calls or tight coupling between modules.

## Decision

Implement a **Semantic Integration Layer** using the following patterns:

### 1. Domain Events (Immutable)

Define 12 domain events as frozen TypeScript objects with typed payloads, event versioning, and correlation/tracing IDs:

| Event               | Source | Description                         |
| ------------------- | ------ | ----------------------------------- |
| DocumentUploaded    | KF     | Raw file ingested                   |
| DocumentClassified  | KF     | Document type classified            |
| DocumentParsed      | KF     | Text extracted                      |
| DocumentNormalized  | KF     | Content normalized                  |
| DocumentChunked     | KF     | Document split into chunks          |
| EmbeddingsGenerated | KF     | Vector embeddings created           |
| DocumentPublished   | KF     | Document published with knowledgeId |
| GraphNodeCreated    | SI     | Graph node created in KI            |
| GraphEdgesCreated   | SI     | Graph edges connected               |
| OntologyUpdated     | KI     | Ontology changed                    |
| MetricsCalculated   | SI     | Metrics computed for a node         |
| SearchIndexUpdated  | SI     | Search index refreshed              |

### 2. Outbox Pattern

Events are written to an `event_outbox` PostgreSQL table in the same transaction as the source operation (eventual consistency). A background relay polls the table and delivers events to the Semantic Event Bus.

### 3. Semantic Event Bus

An in-memory publish/subscribe bus that routes events to registered handlers. Handlers are registered at module init in `SemanticIntegrationModule.onModuleInit()`.

### 4. Idempotent Handlers

Each handler records its processing status in the `event_process_log` table. Before processing, handlers check if the event+handler combination has already been completed. This ensures exactly-once processing semantics even with retries.

### 5. Retry & Dead Letter

Failed events are retried up to 3 times with exponential backoff, then moved to `dead_letter` status in the outbox table.

### 6. Module Architecture

```
semantic-integration/
 ├── domain/
 │   ├── events/domain-event.types.ts        # EventType enum, payloads, factory
 │   └── interfaces/
 │       ├── event-handler.interface.ts       # IEventHandler contract
 │       └── event-publisher.interface.ts     # IDomainEventPublisher contract
 ├── application/
 │   ├── services/
 │   │   ├── domain-event-publisher.service.ts # Writes to outbox
 │   │   ├── semantic-event-bus.service.ts    # In-memory pub/sub
 │   │   └── outbox-relay.service.ts          # Polls + dispatches
 │   └── event-handlers/
 │       ├── document-published.handler.ts    # Creates graph + metrics
 │       └── cache-invalidation.handler.ts    # Clears AI Runtime caches
 ├── infrastructure/
 │   └── persistence/
 │       ├── event-outbox.repository.ts       # Outbox CRUD
 │       └── event-process-log.repository.ts  # Idempotency tracking
 ├── semantic-integration.module.ts           # @Global() module
 └── semantic-integration.constants.ts        # Poll interval, batch size
```

### 7. Wiring

**Knowledge Factory → Domain Events:** `PublishWorker` injects `DomainEventPublisher` and emits `DocumentPublished` after successful publish.

**Event Bus → Handlers:** `OutboxRelayService` polls every 5s, delivers to `SemanticEventBus`, which routes to registered handlers.

**Handlers → Knowledge Intelligence:** `DocumentPublishedHandler` uses KI's `GraphNodeRepository`, `KnowledgeConfidenceService`, `KnowledgeAuthorityService`, `KnowledgeFreshnessService`, `KnowledgeCompletenessService`, and `GraphMetricsRepository`.

**Handlers → AI Runtime:** `CacheInvalidationHandler` uses `MemoryAbstractionService.clearSession()` and `PromptRegistryService.remove()`.

## Consequences

### Positive

- **Decoupled integration:** No module needs to import another for event processing
- **Guaranteed delivery:** Outbox pattern ensures events survive crashes
- **Idempotent processing:** Duplicate events are safe
- **Observable:** All events logged in `event_process_log` table
- **Extensible:** New handlers can be added by registering with the event bus
- **Tracing:** Each event chain has a `tracingId` for end-to-end debugging

### Negative

- **Polling latency:** Up to 5s delay between event emission and handler execution
- **Database load:** Outbox polling adds read load on PostgreSQL
- **In-memory bus:** Handlers are lost on process restart (but events survive in outbox)

### Neutral

- **No new infrastructure:** Uses existing PostgreSQL, no message broker dependency for events
- **@Global() module:** Makes DomainEventPublisher available everywhere without explicit imports

## Alternatives Considered

1. **Direct NestJS EventEmitter:** Loses persistence (events lost on crash)
2. **RabbitMQ direct:** Adds infrastructure complexity, requires message schema registry
3. **BullMQ jobs:** Duplicates existing pipeline mechanism, couples to Redis
4. **Webhooks:** Adds network latency, requires HTTP endpoints

The outbox pattern on PostgreSQL was chosen for its balance of reliability, simplicity, and zero new infrastructure.

## Related

- ADR-001: (Previous architecture decisions)
- `docs/knowledge/event-topology.md`: Event flow diagrams
- `prisma/schema.prisma`: `event_outbox` and `event_process_log` tables
