# بازیابی خطا — Failure Recovery

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## 1. دسته‌بندی خطاها — Failure Categories

| Category | Examples | Recoverability |
|----------|---------|----------------|
| **Transient Failures** | Network timeout, service temporarily unavailable, rate limited | Auto-retry — typically self-resolving |
| **Permanent Failures** | Invalid document format, unrecoverable corruption, security violation | No retry — document rejected or quarantined |
| **Processing Failures** | OCR confidence too low, parser exception, extractor timeout | Retry with alternative strategy or fallback |
| **Validation Failures** | Failed quality gate, tier violation, semantic inconsistency | Flag for human review or reject |
| **Publication Failures** | Target unavailable, write conflict, consistency check failed | Retry with backoff; rollback if terminal |

---

## 2. مدیریت خطا در هر مرحله — Failure Handling Per Stage

### 2.1. خطای OCR — OCR Failure

| Aspect | Detail |
|--------|--------|
| **Causes** | Low quality scan (< 200 DPI), unsupported language, Vision Service unavailable, image corruption |
| **Recovery** | Retry 3× with different preprocessing (deskew, denoise, contrast enhancement); fallback to human transcription service |
| **Terminal State** | Flag document as "text-unavailable"; preserve raw image in MinIO for manual processing |
| **Dead Letter** | Routed to manual OCR queue for human-led transcription |
| **Checkpoint** | Raw image preserved in MinIO with metadata of all failed attempts |

### 2.2. خطای تجزیه — Parser Failure

| Aspect | Detail |
|--------|--------|
| **Causes** | Corrupt file, unsupported format variant, encoding mismatch, truncated download |
| **Recovery** | Retry 3× with alternative parser library; attempt format conversion (e.g., PDF → text via different engine); try encoding detection and re-read |
| **Terminal State** | Report document as "unparseable"; include parser error details for human operator |
| **Dead Letter** | Routed to manual processing queue with full error trace |

### 2.3. خطای فراداده — Metadata Failure

| Aspect | Detail |
|--------|--------|
| **Causes** | Missing required metadata fields, invalid field values, taxonomy violation, knowledge API unavailable |
| **Recovery** | Auto-populate missing fields from document content (title from first heading, date from document text); flag missing fields in metadata with `source: auto-populated` annotation |
| **Terminal State** | Accept partial metadata with warning — no hard failure |
| **Quality Impact** | Auto-populated fields carry reduced confidence score |

### 2.4. خطای معنایی — Semantic Failure

| Aspect | Detail |
|--------|--------|
| **Causes** | Unresolved engineering terms, unknown synonyms, unexpandable acronyms, vocabulary mismatch |
| **Recovery** | Flag each unresolved term with `status: unresolved`; log term for vocabulary maintainer review; proceed without semantic resolution for those specific terms |
| **Quality Score Penalty** | Each unresolved term reduces the document confidence score by a configurable penalty (default: 2% per term, max 30% penalty) |
| **Audit** | Unresolved terms recorded in semantic audit log for periodic vocabulary enrichment |

### 2.5. خطای تعبیه — Embedding Failure

| Aspect | Detail |
|--------|--------|
| **Causes** | AI Service (embedding model) unavailable, model version mismatch, dimension mismatch, GPU OOM |
| **Recovery** | Retry 3× with exponential backoff; queue document for later embedding if persistent failure |
| **Terminal State** | Publication blocked — no fallback for missing embeddings |
| **Critical Path Impact** | Embedding Generator is a hard blocking component — no document can be published without embeddings |
| **Priority Queue** | Recovered documents re-enter embedding queue with elevated priority |

### 2.6. خطای گراف — Graph Failure

| Aspect | Detail |
|--------|--------|
| **Causes** | Graph DB (Neo4j/Age) unavailable, constraint violation, transaction timeout, read replica lag |
| **Recovery** | Retry 3× with backoff; queue for deferred graph update if persistent |
| **Terminal State** | Publication can proceed with warning — document published to vector DB even if graph update pending |
| **Consistency** | Knowledge graph marked as "pending update"; periodic reconciliation job resolves pending updates |

### 2.7. خطای اعتبارسنجی — Validation Failure

| Aspect | Detail |
|--------|--------|
| **Causes** | Engineering tier violation, knowledge completeness below threshold, cross-document inconsistency detected |
| **Recovery** | Route to Human Review Queue with detailed validation report; validation layer specifies which rules failed and why |
| **Outcomes** | Human reviewer may: approve despite failure (with override reason), request reprocessing with modified config, or reject permanently |
| **Audit** | Every validation decision logged with reviewer identity, timestamp, and justification |

### 2.8. خطای انتشار — Publication Failure

| Aspect | Detail |
|--------|--------|
| **Causes** | Target storage (Qdrant, Neo4j, Knowledge API) unavailable, write conflict, version clash, consistency check failed |
| **Recovery** | Retry 3× with exponential backoff; if all retries exhausted, initiate publication rollback |
| **Rollback** | Revert all targets to previous version; mark document as "publication_failed" with rollback audit |
| **Alert Severity** | Critical — admin notified via alerting system |

---

## 3. مهلت زمانی — Timeout

### Per-Stage Timeout

| Stage | Default Timeout | Unit | Configurable? |
|-------|----------------|------|---------------|
| OCR | 10 | minutes | Yes |
| Parser | 5 | minutes | Yes |
| Cleaner | 2 | minutes | Yes |
| Metadata Builder | 3 | minutes | Yes |
| Concept Resolver | 5 | minutes | Yes |
| Semantic Resolution | 5 | minutes | Yes |
| Entity Extractor | 5 | minutes | Yes |
| Relationship Extractor | 5 | minutes | Yes |
| Unit Normalizer | 2 | minutes | Yes |
| Chunk Generator | 3 | minutes | Yes |
| Embedding Generator | 10 | minutes | Yes |
| Vector Publisher | 5 | minutes | Yes |
| Graph Publisher | 5 | minutes | Yes |
| Publication Coordinator | 5 | minutes | Yes |

### Timeout Actions

| Condition | Action |
|-----------|--------|
| Per-stage timeout exceeded | Retry 3×; after exhaustion, fail and log with full timeout context |
| Retry total exceeds stage timeout × 3 | Mark document as processing failed; route to DLQ |
| Pipeline-level timeout exceeded (60 min total) | Mark document as "Timed Out"; preserve intermediate state; alert admin |
| Document age > 60 minutes | Terminate all processing; roll back any partial publications |

---

## 4. استراتژی تلاش مجدد — Retry Strategy

| Parameter | Value |
|-----------|-------|
| **Backoff algorithm** | Exponential backoff with jitter |
| **Base delay** | 1 second |
| **Multiplier** | ×5 per attempt |
| **Sequence** | 1 s → 5 s → 30 s → 150 s (max) |
| **Jitter** | ±20% random delay added to each interval |
| **Max retries (standard)** | 3 |
| **Max retries (network)** | 5 |
| **Max retries (publication)** | 3 |
| **Retry budget per document** | 15 total retries across all stages |
| **Retry exhaustion** | Document moved to Dead Letter Queue |

### Retry Backoff Sequence

| Attempt | Base Delay | With Jitter (±20%) | Cumulative |
|---------|-----------|-------------------|------------|
| 1 | 1 s | 0.8–1.2 s | ~1 s |
| 2 | 5 s | 4–6 s | ~6 s |
| 3 | 30 s | 24–36 s | ~36 s |
| 4 (network only) | 150 s | 120–180 s | ~180 s |
| 5 (network only) | 300 s | 240–360 s | ~480 s |

---

## 5. بازگشت — Rollback

| Rollback Type | Scope | Trigger | Mechanism |
|--------------|-------|---------|-----------|
| **Publication rollback** | All publication targets (Qdrant, Neo4j, Knowledge API, Search) | Publication failure after all retries exhausted | Revert each target to previous version using versioned snapshots |
| **Processing rollback** | Not applicable | Processors are stateless — no state to roll back | N/A — simply retry or abandon |
| **Document rollback** | Metadata and content in PostgreSQL | Admin request or failed reprocessing | Restore previous version from document history table |
| **Partial rollback** | Individual target (e.g., graph only) | Single target failure while others succeeded | Revert only the failed target; flag inconsistency for reconciliation |

### Rollback Process

```
Publication Failure (after 3 retries)
       │
       ▼
Coordinator reads previous version from version store
       │
       ├──→ Qdrant: revert vector collection to version N-1
       ├──→ Neo4j: revert graph to version N-1 (or remove new nodes)
       ├──→ Knowledge API: set status to previous_version
       └──→ Search index: remove new document from index
       │
       ▼
Coordinator emits PublicationRolledBack event
       │
       ▼
Admin alert triggered with rollback summary
```

---

## 6. صف پیام‌های مرده — Dead Letter Queue (DLQ)

| Property | Specification |
|----------|---------------|
| **Trigger** | Document fails all retry attempts at any stage |
| **Storage** | RabbitMQ Dead Letter Exchange (`xennic.dlx`) → Dead Letter Queue (`xennic.dlq`) |
| **DLQ Entry Metadata** | Document ID, failed stage, error details, retry count, timestamps, raw event payload |
| **Monitoring** | Admin dashboard displays DLQ contents with sortable columns and search |
| **Alert Threshold** | DLQ depth > 10 entries triggers critical alert to knowledge engineering team |
| **Review Cadence** | DLQ entries reviewed daily during engineering triage |
| **Cleanup** | DLQ entries older than 30 days auto-archived to long-term audit storage |

### DLQ Actions

| Action | Description | Who Can Perform |
|--------|-------------|-----------------|
| **Reprocess** | Re-queue the document at the failed stage after a fix is applied | Admin, Knowledge Engineer |
| **Reprocess with modified config** | Re-queue with overridden parameters (e.g., different parser engine, lower confidence threshold) | Admin, Knowledge Engineer |
| **Reject permanently** | Mark document as permanently failed; move to rejection archive | Admin |
| **Manual process** | Extract knowledge manually via the Human Review Interface | Knowledge Engineer |
| **Ignore** | Acknowledge and remove from DLQ without action (rare — documented reason required) | Admin |

---

## 7. بازیابی دستی — Manual Recovery

| Role | Responsibility | Tools |
|------|----------------|-------|
| **Admin** | Monitor DLQ, approve reprocessing, manage rejection archive | Admin dashboard, alert console |
| **Knowledge Engineer** | Review failed documents, extract knowledge manually, update vocabulary | Human Review Interface, DLQ dashboard |
| **Senior Reviewer** | Handle escalated validation failures and override decisions | Escalation interface |

### Manual Recovery Workflow

```
DLQ Entry Created
       │
       ▼
Admin reviews DLQ (daily or on alert)
       │
       ├──→ Reprocess → Document re-enters pipeline at failed stage
       ├──→ Manual Extract → Knowledge Engineer extracts via Review UI
       ├──→ Reject → Permanent rejection with documented reason
       └──→ Escalate → Senior Review for complex failure decisions
```

---

## 8. جدول تصمیم بازیابی خطا — Failure Recovery Decision Table

| Failure Type | Retry? | Max Retries | Backoff | Fallback | DLQ? | Alert? | Alert Severity |
|-------------|--------|-------------|---------|----------|------|--------|----------------|
| OCR failure | Yes | 3 | 1 s → 5 s → 30 s | Human transcription | Yes | Yes | High |
| Parser failure | Yes | 3 | 1 s → 5 s → 30 s | Alternative parser engine | Yes | Yes | High |
| Metadata validation | No | 0 | N/A | Partial metadata with auto-population | No | No | None |
| Semantic failure | No | 0 | N/A | Skip unresolved terms; log for maintainer | No | Log only | Info |
| Embedding failure | Yes | 3 | 1 s → 5 s → 30 s | Queue for later embedding | Yes | Yes | High |
| Graph failure | Yes | 3 | 1 s → 5 s → 30 s | Deferred graph update | Yes | Warning | Medium |
| Network timeout | Yes | 5 | 1 s → 5 s → 30 s → 150 s → 300 s | None | Yes | Warning | Medium |
| Document rejected (permanent) | No | 0 | N/A | Notify uploader with reason | No | Yes | High |
| Validation failure | No | 0 | N/A | Human review queue | No | Yes | Medium |
| Human review escalation | No | 0 | N/A | Senior reviewer queue | No | Yes | High |
| Publication failure | Yes | 3 | 1 s → 10 s → 60 s | Rollback to previous version | Yes | Yes | **Critical** |
| Configuration change error | Yes | 3 | 1 s → 5 s → 30 s | Keep previous config | Yes | Yes | Medium |
| Health check timeout | Yes | 3 | 100 ms → 500 ms → 2 s | Mark service as degraded | No | Warning | Medium |
| Lifecycle operation failure | Yes | 3 | 1 s → 5 s → 30 s | Deferred retry | Yes | Yes | High |

---

## 9. استراتژی پایداری — Resilience Strategy Summary

| Principle | Implementation |
|-----------|----------------|
| **Fail fast** | Validation failures are immediate — no retry on permanent errors |
| **Graceful degradation** | Soft dependencies use fallback mechanisms — document never blocks on optional services |
| **At-least-once safety** | Idempotent event processing ensures retries are safe |
| **Bounded retry** | Configurable retry budget per document — prevents infinite loops |
| **Isolation** | Document-level isolation — one document's failure never blocks other documents |
| **Observability** | Every failure is logged with correlation ID, stage, error type, and action taken |
| **Human-in-the-loop** | Critical and ambiguous failures escalate to human operators |
| **Self-healing** | Transient failures resolve via automatic retry without human intervention |
