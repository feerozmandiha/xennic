# ADR-002: Semantic Integration Layer

**Status:** Accepted  
**Date:** 2026-07-04  
**Deciders:** Architecture Team  
**Tags:** events, integration, outbox, domain-events

> **Implementation audit — 2026-08-19:** the original decision below described 12 contracts and stronger delivery semantics than the runtime provides. The registry now has 14 contracts after adding active Knowledge CMS publish/archive events. Source mutations and outbox inserts are not atomic, relay retries use a fixed polling interval, and handler errors are currently swallowed before the relay decides delivery status. Treat “same transaction”, “exactly-once”, exponential backoff, and guaranteed end-to-end delivery below as design goals rather than current guarantees. Knowledge Factory remains dormant. See `knowledge-runtime-audit.md` and `semantic-integration-implementation.md`.

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

Define 14 domain events as frozen TypeScript objects with typed payloads, event versioning, and correlation/tracing IDs:

| Event                     | Source | Description                                |
| ------------------------- | ------ | ------------------------------------------ |
| DocumentUploaded          | KF     | Raw file ingested                          |
| DocumentClassified        | KF     | Document type classified                   |
| DocumentParsed            | KF     | Text extracted                             |
| DocumentNormalized        | KF     | Content normalized                         |
| DocumentChunked           | KF     | Document split into chunks                 |
| EmbeddingsGenerated       | KF     | Vector embeddings created                  |
| DocumentPublished         | KF     | Document published with knowledgeId        |
| KnowledgeArticlePublished | CMS    | Knowledge article published or republished |
| KnowledgeArticleArchived  | CMS    | Knowledge article archived                 |
| GraphNodeCreated          | SI     | Graph node created in KI                   |
| GraphEdgesCreated         | SI     | Graph edges connected                      |
| OntologyUpdated           | KI     | Ontology changed                           |
| MetricsCalculated         | SI     | Metrics computed for a node                |
| SearchIndexUpdated        | SI     | Search index refreshed                     |

### 2. Outbox Pattern

The decision intended events to be written to an `event_outbox` PostgreSQL table in the same transaction as the source operation. The current producers enqueue after the source mutation in a separate database call. A background relay polls the table and delivers successfully inserted rows to the Semantic Event Bus.

### 3. Semantic Event Bus

An in-memory publish/subscribe bus that routes events to registered handlers. Handlers are registered at module init in `SemanticIntegrationModule.onModuleInit()`.

### 4. Idempotent Handlers

Each handler records its processing status in the `event_process_log` table. Before processing, handlers check if the event+handler combination has already been completed. This prevents a completed handler from repeating work for the same event ID; it does not by itself ensure exactly-once processing.

### 5. Retry & Dead Letter

The outbox stores a maximum of three attempts and a `dead_letter` state. In the current relay, only exceptions propagated to the relay increment this counter, retries occur on the fixed polling cadence rather than exponential backoff, and event-bus handler errors do not propagate.

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
 │       ├── document-published.handler.ts          # Factory document graph + metrics
 │       ├── cache-invalidation.handler.ts          # Clears AI Runtime caches
 │       ├── knowledge-article-published.handler.ts # CMS article graph + metrics
 │       └── knowledge-article-archived.handler.ts  # Removes CMS article projection
 ├── infrastructure/
 │   └── persistence/
 │       ├── event-outbox.repository.ts       # Outbox CRUD
 │       └── event-process-log.repository.ts  # Idempotency tracking
 ├── semantic-integration.module.ts           # @Global() module
 └── semantic-integration.constants.ts        # Poll interval, batch size
```

### 7. Wiring

**Knowledge CMS → Domain Events:** active lifecycle methods enqueue `KnowledgeArticlePublished` and `KnowledgeArticleArchived` after the article mutation succeeds. Publish upserts a graph projection and metrics; archive removes the projection.

**Knowledge Factory → Domain Events:** `PublishWorker` contains a `DocumentPublished` producer, but the Factory module is dormant and this is not a current runtime flow.

**Event Bus → Handlers:** `OutboxRelayService` polls every 5s, delivers to `SemanticEventBus`, which routes to registered handlers.

**Handlers → Knowledge Intelligence:** `DocumentPublishedHandler` uses KI's `GraphNodeRepository`, `KnowledgeConfidenceService`, `KnowledgeAuthorityService`, `KnowledgeFreshnessService`, `KnowledgeCompletenessService`, and `GraphMetricsRepository`.

**Handlers → AI Runtime:** `CacheInvalidationHandler` uses `MemoryAbstractionService.clearSession()` and `PromptRegistryService.remove()`.

## Consequences

### Positive

- **Decoupled integration:** No module needs to import another for event processing
- **Persistent enqueue:** Successfully inserted outbox rows survive process crashes; current handler error propagation does not guarantee end-to-end delivery
- **Idempotent handlers:** Completed handler records allow registered handlers to skip duplicate event IDs
- **Observable:** All events logged in `event_process_log` table
- **Extensible:** New handlers can be added by registering with the event bus
- **Tracing:** Each event chain has a `tracingId` for end-to-end debugging

### Negative

- **Polling latency:** Up to 5s delay between event emission and handler execution
- **Database load:** Outbox polling adds read load on PostgreSQL
- **In-memory bus:** subscriptions are process-local and are not distributed across replicas
- **Non-atomic producer writes:** source mutations and outbox inserts are separate database operations
- **Handler failure gap:** handler exceptions are caught by the bus, so the relay can mark a partially failed dispatch as delivered

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
