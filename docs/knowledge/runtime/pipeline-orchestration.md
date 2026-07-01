# ارکستراسیون پایپ‌لاین — Pipeline Orchestration

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## 1. نمای کلی معماری ارکستراسیون — Orchestration Architecture Overview

The Pipeline Orchestrator is the central coordination engine of the Knowledge Acquisition Runtime. It manages document state through every stage of the pipeline — from ingestion through validation to publication — using an event-driven, stateful, and resumable execution model.

### اصول ارکستراسیون — Orchestration Principles

| اصل | Principle | Description |
|-----|-----------|-------------|
| **رویداد-محور** | Event-Driven | Stages are triggered by events; no polling, no tight coupling |
| **حفظ حالت** | Stateful | Every document's pipeline state is tracked and persisted through all stages |
| **تاب‌آور** | Resilient | Failures are handled at the stage level; document state is never lost |
| **قابل مشاهده** | Observable | Every state transition, failure, and decision is logged with full context |
| **قابل تنظیم** | Configurable | Pipeline stages can be enabled, disabled, or reordered per document type |

### ماشین حالت پایپ‌لاین — Pipeline State Machine

```
Received → Queued → Processing → Validating → Publishing → Published
                ↓         ↓           ↓
             Failed    Flagged    Rolled Back
                ↓         ↓
            Dead Letter  Human Review
```

---

## 2. مدل‌های اجرا — Execution Models

### اجرای موازی — Parallel Execution

Independent processors that can run simultaneously on the same document.

| Processor Group | Processors | Dependency | Parallelizable |
|-----------------|------------|------------|----------------|
| **Resolver Group** | Concept Resolver, Ontology Resolver | Both depend on Cleaner; independent of each other | ✅ Yes |
| **Extractor Group** | Entity Extractor, Relationship Extractor, Unit Normalizer | Both depend on Parser; independent of each other | ✅ Yes |
| **Validation Group** | Semantic Validator, Engineering Validator | Both depend on Metadata Validator; independent of each other | ✅ Yes |

**Benefits:**
- Reduces total processing time by running independent tasks simultaneously
- Improves resource utilization across available workers
- Allows faster feedback on multiple validation dimensions

**Risks:**
- Resource contention (CPU, memory, I/O) when too many processors run in parallel
- Race conditions if processors share mutable state (mitigated by immutable document segments)

**Configuration:** `max_parallel_workers` is configurable per processor type and per document type.

---

### اجرای ترتیبی — Sequential Execution

Processors with dependency chains must run in strict order.

| Pipeline | Sequence | Rationale |
|----------|----------|-----------|
| **Document Preparation** | OCR → Parser → Cleaner | Each step depends on the output of the previous |
| **Metadata Pipeline** | Format Detection → Metadata Builder → Metadata Validator | Build metadata before validating it |
| **Knowledge Publication** | Chunk Generator → Embedding Service → Vector Publisher | Generate chunks before embedding; embed before publishing |

**Benefits:**
- Deterministic output; easy to debug and trace
- Clear failure boundaries — each stage knows exactly which predecessor failed
- Resource usage is predictable and bounded

**Trade-off:** Longer end-to-end processing time compared to parallel execution.

---

### اجرای شرطی — Conditional Execution

Stages are dynamically enabled or disabled based on document type, content characteristics, or configuration.

| Condition | Stage | Enabled When | Disabled When |
|-----------|-------|--------------|---------------|
| **Scanned document** | OCR | Image-only PDF; DPI < 200 | Born-digital PDF; text layers present |
| **Engineering document** | Concept Resolver | Domain = power_systems, transmission, distribution | Domain = general, administrative |
| **Contains measurements** | Unit Normalizer | Document has numerical values with units | Document has no measurable quantities |
| **Multi-page document** | Chunk Generator | Page count > 1 | Single-page documents (skipped) |
| **Persian-language document** | Bilingual Validator | Language = fa or mixed FA/EN | Language = EN only |

**Evaluation:** Condition rules are evaluated at runtime per document, immediately before the stage would execute. Rules can reference document metadata, content analysis results, or external configuration.

---

### گیت‌های تأیید انسانی — Manual Approval Gates

Certain pipeline stages require human approval before the document may proceed.

| Gate | Trigger | Required Reviewer | Timeout | Escalation |
|------|---------|-------------------|---------|------------|
| **Tier 1–2 source validation** | Document from Tier 1 or Tier 2 source | Senior domain expert | 24 hours | Manager after 24 h |
| **Conflicting knowledge resolution** | Knowledge validation layer flags contradiction | Knowledge admin | 48 hours | Engineering lead after 48 h |
| **Low-confidence extraction** | Confidence score below 0.6 for Tier 1–2 | Domain expert | 24 hours | Quality team after 24 h |
| **Security-flagged document** | Checksum mismatch or integrity warning | Security team | 12 hours | Security lead after 12 h |
| **Manual publication approval** | Optional; configured per document type | Document owner | 72 hours | Admin auto-approve after 72 h |

**Gate workflow:**
1. Pipeline reaches approval gate → document paused
2. Notification sent to assigned reviewer queue
3. Reviewer dashboard displays: document context, validation results, suggested action
4. Reviewer takes one of: **Approve** (proceed), **Reject** (return to sender), **Modify** (adjust and proceed), **Request Info** (pause for more data)
5. If no action within timeout → escalation to next reviewer tier
6. If all tiers time out → automatic rejection with notification

---

### جریان بررسی انسانی — Human Review Workflow

Documents flagged by validation layers (neither passed nor failed) enter the human review system.

| Step | Action | Responsibility |
|------|--------|----------------|
| 1 | Document enters review queue | Orchestrator |
| 2 | Reviewer assigned (round-robin or expertise-based) | Queue Manager |
| 3 | Reviewer dashboard displays document with flags, validation context, and suggested actions | Review UI |
| 4 | Reviewer reviews document, flags, and evidence | Human reviewer |
| 5 | Reviewer decision: **Approve** (override flag, continue), **Reject** (return to sender), **Modify** (edit metadata/content, continue), **Request More Info** (pause, notify sender) | Human reviewer |
| 6 | Decision recorded in audit log | Orchestrator |
| 7 | Document re-enters pipeline at appropriate stage | Orchestrator |
| 8 | If approved → proceed to next pipeline stage; if rejected → terminal state; if modified → re-validate | Orchestrator |

**Review queue prioritization:** Documents from higher-tier sources and with longer queue wait times are prioritized.

---

## 3. تلاش مجدد خودکار — Automatic Retry

### استراتژی تلاش مجدد — Retry Strategy

| Failure Type | Retry Policy | Description |
|--------------|--------------|-------------|
| **Transient** | Retry 3 attempts | Network timeouts, temporary service unavailability, resource contention |
| **Permanent** | No retry; route to DLQ | Invalid input, schema violation, corrupted data |
| **Throttled** | Retry with backoff | Rate limit exceeded, resource pool exhausted |

### پشتیبان نمایی تأخیر — Exponential Backoff

| Attempt | Delay | Cumulative Wait |
|---------|-------|-----------------|
| 1 | 1 second | 1 second |
| 2 | 5 seconds | 6 seconds |
| 3 | 30 seconds | 36 seconds |

**Rules:**
- Only retry idempotent operations (processing stages that produce deterministic output)
- Non-idempotent operations (e.g., creating external records) must fail safe
- After 3 attempts → move to Dead Letter Queue with full error context
- DLQ contents reviewed via admin dashboard with retry/delete actions

---

## 4. اولویت‌بندی صف — Queue Priorities

### سطوح اولویت — Priority Levels

| Priority | Label | Assigned To | Processing SLA |
|----------|-------|-------------|----------------|
| **P0** | Critical | Human review results, security alerts | < 1 minute |
| **P1** | High | Manual upload (Web UI), admin-triggered processing | < 5 minutes |
| **P2** | Normal | API ingest, connector-triggered ingestion | < 30 minutes |
| **P3** | Low | Batch imports, web crawler results | < 4 hours |

### جلوگیری از گرسنگی — Starvation Prevention

| Rule | Detail |
|------|--------|
| **Age promotion** | Low priority items promoted one level after 24 hours in queue |
| **Max queue time** | No document waits longer than 48 hours at any priority level |
| **Fair scheduling** | Weighted round-robin: P0 gets 40% capacity, P1 30%, P2 20%, P3 10% |
| **Burst allowance** | Higher-priority items can borrow from lower-priority capacity if idle |

---

## 5. زمان‌بندی — Scheduling

### وظایف زمان‌بندی‌شده — Scheduled Tasks

| Task | Schedule | Description |
|------|----------|-------------|
| **Batch imports** | Low-usage window (02:00–05:00 Iran time) | Process queued batch imports with minimal user impact |
| **Web crawler** | Configurable per source (daily, weekly, monthly) | Crawl approved sources for new or updated documents |
| **Re-embedding** | Quarterly or on model update | Re-generate embeddings for all active knowledge objects with new embedding model |
| **Re-indexing** | Monthly | Full-text search index rebuild for consistency |
| **Health check** | Every 15 minutes | Pipeline health check: queue depths, service availability, error rates |
| **Cleanup** | Daily at 03:00 | Temp file cleanup, stale lock release, dead letter queue review reminder |

### ماشه‌های زمان‌بندی — Scheduling Triggers

| Trigger Type | Examples |
|--------------|----------|
| **Cron expression** | Fixed schedule (e.g., `0 2 * * *` for daily 02:00) |
| **Interval** | Periodic (e.g., every 15 minutes for health checks) |
| **Event-driven** | Triggered by event (e.g., new model deployed → trigger re-embedding) |
| **On-demand** | Manual trigger via admin interface |

---

## 6. هماهنگی جریان کار — Workflow Coordination

### سرویس ارکستراتور — Orchestrator Service

| Responsibility | Detail |
|----------------|--------|
| **State management** | Maintains per-document state machine: current stage, history, errors |
| **Execution planning** | Computes optimal execution order (DAG-based) based on dependencies and document type |
| **Stage dispatch** | Sends document to correct processor based on current stage |
| **Event emission** | Fires events on state transitions for observability and downstream consumers |
| **Recovery** | Handles failed stages: retry, route to DLQ, or trigger human review |
| **Graceful shutdown** | Completes all in-flight documents before stopping; saves checkpoint for resumable documents |

### DAG برنامه‌ریزی اجرا — DAG-Based Execution Planning

```
Ingestion ──→ File Validation ──→ OCR (conditional) ──→ Parser
                                                                │
                                                                ↓
                                                          Metadata Builder
                                                                │
                                          ┌─────────────────────┼─────────────────────┐
                                          ↓                     ↓                     ↓
                                    Concept Resolver      Entity Extractor      Unit Normalizer
                                          ↓                     ↓                     ↓
                                    Semantic Validator   Engineering Valid.    Metadata Validator
                                          │                     │                     │
                                          └─────────────────────┼─────────────────────┘
                                                                ↓
                                                          Knowledge Validation
                                                                ↓
                                                          Publication Validation
                                                                ↓
                                                          Publication Runtime
```

### پیکربندی پویا — Dynamic Reconfiguration

| Feature | Description |
|---------|-------------|
| **Per-type pipeline** | Pipeline stages configurable per document type (PDF, DOCX, standard, catalog) |
| **Stage enable/disable** | Any stage can be enabled or disabled without service restart |
| **Reroute** | Failure actions can be reconfigured (e.g., change flag severity) |
| **Hot reload** | Configuration changes propagate within 60 seconds without pipeline downtime |

### خاموشی ایمن — Graceful Shutdown

| Phase | Action | Timeout |
|-------|--------|---------|
| 1 | Stop accepting new documents | Immediate |
| 2 | Complete in-flight processing for documents in current stage | 60 seconds |
| 3 | Save checkpoint for interrupted documents (pipeline position, progress) | 10 seconds |
| 4 | Drain event queue | 30 seconds |
| 5 | Shut down orchestrator | — |

Documents with saved checkpoints resume from the saved stage when the orchestrator restarts.

---

## 7. مدیریت رویدادها — Event Management

### رویدادهای پایپ‌لاین — Pipeline Events

| Event | Emitter | Payload | Consumers |
|-------|---------|---------|-----------|
| `DocumentReceived` | Ingestion Service | `{doc_id, source, tier, format}` | Orchestrator, Analytics |
| `DocumentQueued` | Orchestrator | `{doc_id, queue, priority, timestamp}` | Queue Monitor |
| `StageStarted` | Orchestrator | `{doc_id, stage, timestamp}` | Audit Log, Dashboard |
| `StageCompleted` | Processor | `{doc_id, stage, result, timestamp}` | Orchestrator, Audit Log |
| `StageFailed` | Processor | `{doc_id, stage, error, attempt, timestamp}` | Orchestrator, Alerting |
| `DocumentFlagged` | Validator | `{doc_id, layer, reason, evidence}` | Human Review Queue |
| `DocumentApproved` | Reviewer | `{doc_id, reviewer, action, timestamp}` | Orchestrator |
| `DocumentRejected` | Reviewer | `{doc_id, reviewer, reason, timestamp}` | Sender notification |
| `PipelineComplete` | Orchestrator | `{doc_id, total_time, stages_passed, timestamp}` | Publication Runtime |

---

## 8. پیکربندی پایپ‌لاین بر اساس نوع سند — Per-Document-Type Pipeline Configuration

| Document Type | Enabled Stages | Disabled Stages | Parallel Groups | Approval Gates |
|---------------|----------------|-----------------|-----------------|----------------|
| **PDF standard** | All | — | Resolver, Extractor | Tier 1–2 sources |
| **Scanned catalog** | File → OCR → Parser → Metadata → Concept → Entity → Unit → Validate → Publish | — | Extractor | — |
| **Web crawl result** | File → Parser → Metadata → Validate → Publish | OCR, Concept Resolver, Unit Normalizer | — | Security check |
| **Batch import** | All (with manifest metadata) | — | Resolver, Extractor, Validator | Manual publication approval |
| **API connector** | File → Parser → Metadata → Validate → Publish | OCR, Concept Resolver | — | — |
| **Update to existing** | Validate → Publish | All extraction stages | — | — |

---

## 9. شاخص‌های کلیدی عملکرد — Key Performance Indicators

| Metric | Target | Measurement |
|--------|--------|-------------|
| End-to-end pipeline time | < 10 min for 90% of documents | Time from `DocumentReceived` to `PipelineComplete` |
| Stage success rate | > 98% per stage | Successful / Total stage executions |
| Parallel execution efficiency | > 80% resource utilization | Active workers / Total workers |
| Human review turnaround | < 24 hours average | Time from flag to decision |
| Automatic retry success rate | > 90% | Successful retries / Total retries |
| Dead letter queue depth | < 10 documents on average | Current DLQ count |
| Graceful shutdown recovery | 100% | Resumed documents / Interrupted documents |
| Pipeline configuration propagation | < 60 seconds | Time from config change to active use |
