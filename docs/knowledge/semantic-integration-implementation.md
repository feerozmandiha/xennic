# Implementation Report — Semantic Integration Layer

> **Runtime qualification (audited 2026-08-19):** Semantic Integration is registered in `ApiModule`. Knowledge CMS now emits active article lifecycle events. Knowledge Factory is not registered, so its document-ingestion event flow remains dormant. This report describes the source as implemented; it does not claim that Factory is production-ready. See [knowledge-runtime-audit.md](./knowledge-runtime-audit.md).

## Current runtime summary

The integration layer provides a PostgreSQL outbox, a five-second polling relay, an in-memory event bus, process logs, and idempotent handlers. The current registry contains **14 typed event contracts** and **4 handlers**.

| Producer/capability                         | Runtime state                                                                                            |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Knowledge CMS publish/archive               | Active. `KnowledgeService` enqueues `KnowledgeArticlePublished` and `KnowledgeArticleArchived`.          |
| CMS article graph projection                | Active. Publish creates or updates the article node and metrics; archive removes the article projection. |
| Knowledge Factory `DocumentPublished`       | Dormant. The worker and handler exist, but `KnowledgeFactoryModule` is not imported.                     |
| AI cache invalidation for Factory documents | Handler exists, but has no active Factory producer.                                                      |
| Graph/metrics follow-up events              | Contracts and publishing calls exist for the document flow; no consumers are registered.                 |

## Event registry

The immutable event definitions, versions, payload maps, and factory live in `domain/events/domain-event.types.ts`.

| Group                              | Events                                                                                                                                          |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Factory document lifecycle         | `DocumentUploaded`, `DocumentClassified`, `DocumentParsed`, `DocumentNormalized`, `DocumentChunked`, `EmbeddingsGenerated`, `DocumentPublished` |
| Knowledge CMS lifecycle            | `KnowledgeArticlePublished`, `KnowledgeArticleArchived`                                                                                         |
| Knowledge Intelligence/integration | `GraphNodeCreated`, `GraphEdgesCreated`, `OntologyUpdated`, `MetricsCalculated`, `SearchIndexUpdated`                                           |

All 14 contracts are version 1. `KnowledgeArticlePublished` carries the article/workspace identity, slug, title, language, visibility, version, content traits, and publication metadata. `KnowledgeArticleArchived` carries the article/workspace identity and archive timestamp.

## Active CMS lifecycle flow

### Publish → graph projection and metrics

1. The lifecycle endpoint calls `KnowledgeService.publish()`.
2. The article is persisted as published and version history is updated.
3. `DomainEventPublisher` inserts `KnowledgeArticlePublished` into `event_outbox`.
4. `OutboxRelayService` polls pending rows and dispatches the event to `SemanticEventBus`.
5. `KnowledgeArticlePublishedHandler` checks `event_process_log` for idempotency.
6. The handler creates or updates a workspace-bound graph node with entity type `knowledge`.
7. The handler computes and saves confidence, freshness, authority, and completeness.
8. Completion is recorded in `event_process_log`.

Republishing updates the existing projection rather than creating a duplicate node.

### Archive → projection removal

1. The lifecycle endpoint calls `KnowledgeService.archive()`.
2. The article is persisted as archived and version history is updated.
3. `KnowledgeArticleArchived` is inserted into the outbox.
4. `KnowledgeArticleArchivedHandler` verifies idempotency and workspace ownership.
5. The scoped projection is deleted transactionally: citations are removed explicitly, then database cascades remove its edges and metrics with the graph node.
6. Completion is recorded in `event_process_log`.

The CMS event is enqueued only after the article update succeeds. The article mutation and outbox insert are separate database operations, not one atomic transaction.

## Registered handlers

| Handler                            | Event                       | Effect                                                                                                   |
| ---------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------- |
| `DocumentPublishedHandler`         | `DocumentPublished`         | Creates a Factory-document graph node, calculates metrics, and emits follow-up events. Producer dormant. |
| `CacheInvalidationHandler`         | `DocumentPublished`         | Clears AI Runtime caches. Producer dormant.                                                              |
| `KnowledgeArticlePublishedHandler` | `KnowledgeArticlePublished` | Upserts the CMS article graph projection and metrics.                                                    |
| `KnowledgeArticleArchivedHandler`  | `KnowledgeArticleArchived`  | Deletes the CMS article projection and dependent graph data.                                             |

## Reliability semantics and limitations

The current implementation should not be described as strict exactly-once or guaranteed end-to-end delivery:

- Outbox rows persist across process restarts and are polled in batches of 50 every five seconds.
- Relay-level exceptions increment `retry_count`; the row becomes `dead_letter` after three attempts.
- Retries occur on the next fixed poll. There is no exponential backoff.
- Individual event handlers log and swallow their own errors in `SemanticEventBus`. Consequently, a handler failure can still be followed by the relay marking the outbox row `delivered`; that failure does not currently trigger the outbox retry path.
- `event_process_log` allows a completed handler to skip duplicate delivery, but this is idempotent at-least-once handling support, not a universal exactly-once guarantee.
- The event bus is process-local and is not suitable for distributing handlers across multiple API replicas.
- Source mutations and their outbox inserts are not performed in one shared Prisma transaction.
- There is no administration surface for dead-letter inspection, retry, or event replay.

## Key implementation files

| File                                                                                                            | Purpose                                                     |
| --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `semantic-integration.module.ts`                                                                                | Global module, handler registration, and relay startup      |
| `domain/events/domain-event.types.ts`                                                                           | 14 event types, typed payloads, versions, and event factory |
| `application/services/domain-event-publisher.service.ts`                                                        | Persists events to the outbox                               |
| `application/services/outbox-relay.service.ts`                                                                  | Polls and dispatches pending rows                           |
| `application/services/semantic-event-bus.service.ts`                                                            | In-process handler registry and dispatch                    |
| `application/event-handlers/knowledge-article-published.handler.ts` and `knowledge-article-archived.handler.ts` | CMS publish/archive graph synchronization                   |
| `application/event-handlers/document-published.handler.ts`                                                      | Factory document graph synchronization                      |
| `application/event-handlers/cache-invalidation.handler.ts`                                                      | AI Runtime cache invalidation                               |
| `infrastructure/persistence/event-outbox.repository.ts`                                                         | Outbox persistence and relay retry state                    |
| `infrastructure/persistence/event-process-log.repository.ts`                                                    | Handler idempotency/process records                         |

## Validation

The Knowledge lifecycle and handler suites cover event emission, republishing, idempotency, workspace isolation, metric persistence, archive cleanup, and failure paths. See the current validation results in [knowledge-runtime-audit.md](./knowledge-runtime-audit.md). Full API compilation still depends on generating and building `@xennic/database`.

## Required hardening

1. Propagate or aggregate handler failures so the relay cannot mark a partially failed dispatch as delivered.
2. Enqueue source mutations and lifecycle events in the same database transaction.
3. Claim rows atomically for safe multi-replica relay processing.
4. Implement actual backoff and expose dead-letter inspection/retry controls.
5. Replace or bridge the process-local event bus before multi-instance deployment.
6. Activate Knowledge Factory only after its controllers, persistence reads, queues, workers, permissions, and analytics have real implementations.
