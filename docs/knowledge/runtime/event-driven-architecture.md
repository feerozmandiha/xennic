# معماری رویدادمحور — Event-Driven Architecture

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## 1. فناوری گذرگاه رویداد — Event Bus Technology

| Aspect | Implementation |
|--------|----------------|
| **Message Broker** | RabbitMQ (existing Xennic infrastructure) |
| **Exchange Type — Topic** | Routing by event type pattern (e.g., `document.uploaded.*`, `processing.ocr.#`) |
| **Exchange Type — Direct** | Point-to-point delivery for commands and lifecycle events |
| **Message Persistence** | Persistent messages on durable queues — survive broker restart |
| **Delivery Guarantee** | At-least-once delivery with consumer acknowledgements |
| **Dead Letter Exchange** | Unified DLX for all queues — failed messages after max retries |

### RabbitMQ Topology

| Object | Naming Convention | Example |
|--------|-------------------|---------|
| Topic Exchange | `xennic.event.topic` | Routes ingestion, processing, validation events |
| Direct Exchange | `xennic.event.direct` | Routes system commands and point-to-point messages |
| Queue | `xennic.{service}.{event_type}` | `xennic.ingestion.document_uploaded` |
| Dead Letter Exchange | `xennic.dlx` | Collects all expired messages |
| Dead Letter Queue | `xennic.dlq` | Admin-monitored failure queue |

---

## 2. کاتالوگ رویدادها — Event Catalog

Each event is defined by: **Event Name**, **Publisher**, **Subscribers**, **Payload Schema**, **Retry Strategy**, **Idempotency**, **Ordering Requirements**.

### 2.1. رویدادهای دریافت — Ingestion Events

| # | Event Name | Publisher | Subscribers | Retry Strategy | Idempotency | Ordering |
|---|-----------|-----------|-------------|----------------|-------------|----------|
| 1 | `DocumentUploaded` | API Gateway / Upload Service | Ingestion Orchestrator | 3× backoff | Correlation ID dedup | Per-document |
| 2 | `DocumentQueued` | Ingestion Orchestrator | Processing Orchestrator | 3× backoff | Correlation ID dedup | Per-document |
| 3 | `DocumentRejected` | Validation Layers | Notification Service, Uploader | None (terminal) | N/A | N/A |
| 4 | `DocumentDeferred` | Orchestrator | Scheduler (delayed processing) | 3× backoff | Correlation ID dedup | Per-document |

### 2.2. رویدادهای پردازش — Processing Events

| # | Event Name | Publisher | Subscribers | Retry Strategy | Idempotency | Ordering |
|---|-----------|-----------|-------------|----------------|-------------|----------|
| 5 | `OCRStarted` / `OCRCompleted` / `OCRFailed` | OCR Processor | Processing Orchestrator | 3× backoff | Correlation ID dedup | Per-document sequential |
| 6 | `ParsingStarted` / `ParsingCompleted` / `ParsingFailed` | Parser Processor | Processing Orchestrator | 3× backoff | Correlation ID dedup | Per-document sequential |
| 7 | `CleaningCompleted` | Cleaner Processor | Processing Orchestrator | 3× backoff | Correlation ID dedup | Per-document |
| 8 | `MetadataReady` | Metadata Builder | Concept Resolver, Entity Extractor | 3× backoff | Correlation ID dedup | Per-document |
| 9 | `ConceptResolved` | Concept Resolver | Ontology Resolver | 3× backoff | Correlation ID dedup | Per-document |
| 10 | `EntityExtracted` | Entity Extractor | Relationship Extractor | 3× backoff | Correlation ID dedup | Per-document |
| 11 | `RelationshipExtracted` | Relationship Extractor | Validation Orchestrator | 3× backoff | Correlation ID dedup | Per-document |
| 12 | `SemanticResolved` | Semantic Resolution | Validation Orchestrator | 3× backoff | Correlation ID dedup | Per-document |
| 13 | `ChunkCreated` | Chunk Generator | Embedding Generator | 3× backoff | Correlation ID dedup | Per-chunk |
| 14 | `EmbeddingCreated` | Embedding Generator | Vector Publisher | 3× backoff | Embedding hash dedup | Per-chunk |

### 2.3. رویدادهای اعتبارسنجی — Validation Events

| # | Event Name | Publisher | Subscribers | Retry Strategy | Idempotency | Ordering |
|---|-----------|-----------|-------------|----------------|-------------|----------|
| 15 | `ValidationPassed` | Any Validation Layer | Orchestrator | None (terminal) | Correlation ID dedup | Per-document |
| 16 | `ValidationFailed` | Any Validation Layer | Orchestrator, Error Handler | 3× backoff | Correlation ID dedup | Per-document |
| 17 | `ValidationFlagged` | Any Validation Layer | Human Review Queue | None (async review) | Correlation ID dedup | Per-document |
| 18 | `HumanReviewCompleted` | Review Interface | Orchestrator | None (terminal) | Review ID dedup | Per-review |
| 19 | `HumanReviewEscalated` | Review Interface | Senior Reviewer | None | Review ID dedup | Per-review |

### 2.4. رویدادهای انتشار — Publication Events

| # | Event Name | Publisher | Subscribers | Retry Strategy | Idempotency | Ordering |
|---|-----------|-----------|-------------|----------------|-------------|----------|
| 20 | `VectorPublished` | Vector Publisher | Graph Publisher, Publication Coordinator | 3× backoff | Vector hash dedup | Per-chunk |
| 21 | `GraphPublished` | Graph Publisher | Publication Coordinator | 3× backoff | Graph transaction ID dedup | Per-document |
| 22 | `KnowledgePublished` | Publication Coordinator | AI Service, Search Engine, Cache Invalidator | None (terminal) | Publication ID dedup | Per-document |
| 23 | `PublicationFailed` | Publication Coordinator | Admin Alert | 3× backoff then DLQ | Correlation ID dedup | Per-document |
| 24 | `PublicationRolledBack` | Publication Coordinator | Admin, Audit | None | Rollback ID dedup | Per-document |

### 2.5. رویدادهای چرخه عمر — Lifecycle Events

| # | Event Name | Publisher | Subscribers | Retry Strategy | Idempotency | Ordering |
|---|-----------|-----------|-------------|----------------|-------------|----------|
| 25 | `KnowledgeUpdated` | Lifecycle Manager | AI Service (cache refresh) | 3× backoff | Knowledge object ID dedup | Per-object |
| 26 | `KnowledgeDeprecated` | Lifecycle Manager | AI Service (de-prioritize), Search Engine | 1× | Knowledge object ID dedup | Per-object |
| 27 | `KnowledgeArchived` | Lifecycle Manager | Archive Service | 3× backoff | Knowledge object ID dedup | Per-object |
| 28 | `KnowledgeSuperseded` | Lifecycle Manager | AI Service (redirect to new version) | 1× | Knowledge object ID dedup | Per-object |

### 2.6. رویدادهای سیستمی — System Events

| # | Event Name | Publisher | Subscribers | Retry Strategy | Idempotency | Ordering |
|---|-----------|-----------|-------------|----------------|-------------|----------|
| 29 | `PipelineHealthCheck` | Monitoring Service | All services (respond with status) | None (polling) | N/A | Global |
| 30 | `PipelineConfigurationChanged` | Admin Interface | All services (reload config) | 5× backoff | Config version dedup | Global |

---

## 3. طراحی بار رویداد — Event Payload Design

Every event carries a standard envelope with two top-level sections: a metadata `event` header and a domain-specific `data` payload.

### Payload Envelope — پوشش بار

| Field | Path | Type | Description |
|-------|------|------|-------------|
| Event ID | `event.id` | UUID (v7, time-ordered) | Globally unique event identifier |
| Event Type | `event.type` | String | Fully qualified event name from the catalog |
| Version | `event.version` | Integer | Payload schema version (starts at 1, incremented on breaking changes) |
| Timestamp | `event.timestamp` | ISO 8601 | UTC timestamp of event creation |
| Source | `event.source` | String | Service name that published the event |
| Correlation ID | `event.correlation_id` | UUID | Document-level identifier — all events for the same document share this ID |
| Causation ID | `event.causation_id` | UUID | ID of the immediate preceding event in the chain |
| Data | `data` | Object | Event-specific payload (varies per event type) |

### Per-Event Data Payloads

| Event Type | Data Fields |
|-----------|-------------|
| `DocumentUploaded` | `document_id`, `source`, `size`, `mime_type`, `original_filename` |
| `DocumentQueued` | `document_id`, `queue_name`, `position`, `estimated_wait` |
| `DocumentRejected` | `document_id`, `reason`, `validation_errors[]` |
| `OCRCompleted` | `document_id`, `page_count`, `confidence`, `text_length`, `language` |
| `OCRFailed` | `document_id`, `stage`, `error_type`, `retry_count` |
| `EmbeddingCreated` | `document_id`, `chunk_id`, `dimension`, `vector_id` in Qdrant |
| `ValidationPassed` | `document_id`, `validation_layer`, `score`, `rules_passed[]` |
| `ValidationFailed` | `document_id`, `validation_layer`, `failed_rules[]`, `score` |
| `KnowledgePublished` | `document_id`, `knowledge_id`, `published_at`, `targets[]` |
| `PublicationRolledBack` | `document_id`, `previous_version`, `rolled_back_targets[]`, `reason` |

---

## 4. همانی — Idempotency

| Principle | Implementation |
|-----------|----------------|
| **Unique Event ID** | Every event carries a globally unique `event.id` (UUID v7) |
| **Processed ID Tracking** | Each subscriber maintains a processed-event-id store (Redis / PostgreSQL) with at least 7-day TTL |
| **Duplicate Detection** | On receiving an event, subscriber checks if `event.id` already in processed store; if yes, silently acknowledge and skip |
| **At-Least-Once Safety** | Duplicates are expected and harmless — idempotency guarantees exactly-once semantics |
| **Window Enforcement** | Events older than 7 days may be reprocessed (acceptable — downstream services are also idempotent) |

---

## 5. ترتیب‌بندی — Ordering

| Requirement | Mechanism |
|-------------|-----------|
| **Per-document ordering** | All events for the same document share `correlation_id` = `document_uuid`; RabbitMQ single-consumer queue per `correlation_id` hash |
| **Causal chain ordering** | Events linked via `causation_id` form a directed acyclic graph; processors wait for all causal predecessors before acting |
| **Parallel branches** | Independent processors (e.g., Concept Resolver + Ontology Resolver) get different `correlation_id` suffixes |
| **Join points** | Downstream service consumes from all upstream queues and aggregates before proceeding |
| **No global ordering** | Documents are independent — no cross-document ordering required |

---

## 6. استراتژی تلاش مجدد — Retry Strategy

| Failure Category | Retry Count | Backoff Sequence | Max Backoff | Action on Exhaustion |
|-----------------|-------------|------------------|-------------|---------------------|
| Transient failure (network, timeout) | 3 | 100 ms → 500 ms → 2 s | 2 s | Dead letter queue |
| Processing failure (exception, crash) | 3 | 1 s → 5 s → 30 s | 30 s | Dead letter queue + alert |
| Publication failure | 3 | 1 s → 10 s → 60 s | 60 s | Rollback + alert |
| Health check / config change | 5 | 100 ms → 200 ms → 500 ms → 1 s → 2 s | 2 s | Log and continue |

### Retry Configuration Per Queue

| Queue | Max Retries | Backoff Type | Initial Delay | Multiplier |
|-------|-------------|-------------|---------------|------------|
| Ingestion queues | 3 | Exponential | 100 ms | ×2.5 |
| Processing queues | 3 | Exponential | 1 s | ×3 |
| Publication queues | 3 | Exponential | 1 s | ×3 |
| System queues | 5 | Exponential | 100 ms | ×2 |
| Dead letter (all) | 0 | N/A | N/A | N/A |

---

## 7. نظارت و هشدار — Monitoring & Alerting

| Metric | Threshold | Action |
|--------|-----------|--------|
| Queue depth (per queue) | > 1000 messages | Alert: processing bottleneck |
| DLQ depth | > 10 messages | Alert: admin review required |
| Event processing latency | > 5 minutes per document | Alert: pipeline slowdown |
| Retry rate | > 10% of total events | Alert: systemic failure pattern |
| Duplicate rate | > 1% of total events | Alert: publisher misconfiguration |
| Consumer connection count | Drop > 20% in 5 minutes | Critical: broker or service outage |
