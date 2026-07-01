# مشاهده‌پذیری رانتایم — Runtime Observability

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## 1. Observability Pillars — ستون‌های مشاهده‌پذیری

### 1.1 Metrics — معیارها (Prometheus + Grafana)

**Ingestion Metrics — معیارهای دریافت**

| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `documents_ingested_total` | Counter | `source_type` | Total documents received by source channel |
| `ingestion_rate` | Gauge | `source_type` | Documents ingested per minute |
| `ingestion_latency_seconds` | Histogram | `source_type` | Time from receive to ingestion completion |
| `document_size_bytes` | Histogram | `source_type`, `format` | Raw document file size distribution |
| `ingestion_failures_total` | Counter | `source_type`, `failure_type` | Ingestion failures by type (virus, integrity, format) |

**Processing Metrics — معیارهای پردازش**

| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `processing_time_per_stage_seconds` | Histogram | `stage_name` | Duration per processing stage |
| `documents_in_progress` | Gauge | `stage_name` | Documents currently being processed |
| `queue_depth_per_processor` | Gauge | `processor_name` | Items waiting in each processor queue |
| `processor_throughput` | Gauge | `processor_name` | Documents processed per minute |
| `retry_count_total` | Counter | `stage_name` | Total retry attempts per stage |
| `ocr_confidence` | Gauge | `language` | OCR confidence score per language (0–1) |
| `extraction_quality_score` | Gauge | `extractor_type` | Extraction quality score per extractor (0–1) |

**Validation Metrics — معیارهای اعتبارسنجی**

| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `validation_pass_rate` | Gauge | `layer` | Percentage of documents passing each validation layer |
| `validation_failures_total` | Counter | `layer`, `rule` | Validation failures by layer and rule |
| `human_review_queue_depth` | Gauge | `review_type` | Documents awaiting human review |
| `human_review_processing_time_seconds` | Histogram | `review_type` | Time taken for human review |
| `documents_awaiting_approval` | Gauge | `stage` | Documents waiting for approval gate |

**Publication Metrics — معیارهای انتشار**

| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `publication_latency_seconds` | Histogram | `target` | Time to publish to each target (Qdrant, Graph, API) |
| `documents_published_total` | Counter | `target` | Documents successfully published per target |
| `publication_failures_total` | Counter | `target` | Publication failures per target |
| `rollback_count_total` | Counter | `reason` | Document rollback events |
| `knowledge_base_growth_bytes` | Gauge | — | Total knowledge base storage growth |
| `vector_db_collection_size` | Gauge | `collection` | Vector count per Qdrant collection |
| `graph_node_count` | Gauge | `namespace` | Total graph nodes per namespace |
| `graph_edge_count` | Gauge | `namespace` | Total graph edges per namespace |

---

### 1.2 Tracing — ردیابی توزیع‌شده (OpenTelemetry + Jaeger)

| Aspect | Configuration |
|--------|---------------|
| **Protocol** | OpenTelemetry gRPC exporter |
| **Trace Context** | Propagated via `correlation_id` through all events |
| **Spans** | Per processor execution, per stage, per external call (AI Service, Vision Service) |
| **Key Traces** | End-to-end document lifecycle, publication workflow, retry chains, validation gate |
| **Sampling** | 100% for errors and FATAL, 10% for success (configurable per processor) |
| **Span Attributes** | `document_id`, `stage`, `processor`, `workspace_id`, `source_type`, `retry_count` |

**Critical Trace Paths — مسیرهای ردیابی بحرانی**

| Trace Name | Span Chain | Purpose |
|------------|-----------|---------|
| `document_lifecycle` | Receive → Process → Validate → Publish | End-to-end document journey |
| `publication_workflow` | Chunk → Embed → Vector → Graph → API | Publication phase observability |
| `retry_chain` | Fail → Retry → Retry → Success/DLQ | Retry loop monitoring |
| `human_review` | Flag → Review → Approve/Reject | Human-in-the-loop gate tracking |

---

### 1.3 Structured Logging — ثبت ساختاریافته

**Log Schema — ساختار لاگ**

```json
{
  "timestamp": "2025-06-26T10:30:00.123Z",
  "level": "INFO",
  "service": "processing-service",
  "correlation_id": "XEN-CORR-ABC123",
  "document_id": "XEN-DOC-001",
  "stage": "entity_extraction",
  "processor": "entity_extractor",
  "message": "Entity extraction completed",
  "metadata": {
    "entities_found": 15,
    "confidence": 0.92,
    "duration_ms": 3400
  }
}
```

**Log Levels — سطوح لاگ**

| Level | Usage | Action |
|-------|-------|--------|
| DEBUG | Development debugging | No production retention |
| INFO | Normal operation events | Standard monitoring |
| WARN | Transient issues, retries | Investigate if persistent |
| ERROR | Stage/processor failures | Immediate investigation |
| FATAL | System-level failure | On-call escalation |

**Log Aggregation — تجمیع لاگ**

| Component | Technology | Configuration |
|-----------|-----------|--------------|
| **Agent** | Promtail (or fluent-bit) | DaemonSet per node, ships to Loki |
| **Storage** | Loki (existing Xennic stack) | Grafana Loki cluster |
| **Retention (Hot)** | 90 days | Immediate query access, SSD-backed |
| **Retention (Warm)** | 1 year | Slower query, HDD/object storage |
| **Retention (Cold)** | 7 years | Archive storage, audit compliance |

**Log Enrichment — غنی‌سازی لاگ**

| Enrichment | Source | Description |
|------------|--------|-------------|
| Kubernetes metadata | Downward API | Pod name, namespace, node |
| Workspace context | Event payload | `workspace_id`, `tenant_id` |
| Pipeline version | Document record | `pipeline_version`, `processor_version` |

---

### 1.4 Audit Trail — ردگیری حسابرسی

| Aspect | Specification |
|--------|---------------|
| **Storage** | Separate `audit_log` table in PostgreSQL |
| **Immutability** | Append-only; no UPDATE or DELETE permitted |
| **Retention** | 7 years minimum (engineering regulation requirement) |
| **Tamper-Evident** | Optional SHA-256 chaining of consecutive audit entries |
| **Query** | By `document_id`, `correlation_id`, `workspace_id`, `actor`, time range |

**Audit Events — رویدادهای حسابرسی**

| Event | Actor | Description |
|-------|-------|-------------|
| `document.created` | Ingestion Service | Document received and tracked |
| `document.processing_started` | Orchestrator | Processing phase initiated |
| `document.processing_completed` | Processing Service | All processing stages finished |
| `document.validation_passed` | Validation Service | Document passed validation gate |
| `document.validation_failed` | Validation Service | Document failed validation |
| `document.sent_for_review` | Orchestrator | Sent for human review |
| `document.review_approved` | Human Reviewer | Manual approval granted |
| `document.review_rejected` | Human Reviewer | Manual rejection |
| `document.published` | Publication Service | Published to all targets |
| `document.rolled_back` | Orchestrator | Publication rolled back |
| `document.deprecated` | Orchestrator | Document deprecated |
| `document.archived` | Orchestrator | Document archived |

**Audit Record Schema — ساختار رکورد حسابرسی**

| Field | Type | Description |
|-------|------|-------------|
| `audit_id` | UUID | Primary key |
| `timestamp` | Timestamptz | Event timestamp |
| `event_type` | VARCHAR(50) | Audit event name |
| `document_id` | UUID | Target document |
| `workspace_id` | UUID | Document workspace |
| `actor_service` | VARCHAR(50) | Service that generated the event |
| `actor_user_id` | UUID | Human actor (if applicable) |
| `previous_state` | JSONB | Document state before transition |
| `new_state` | JSONB | Document state after transition |
| `correlation_id` | UUID | Trace correlation |
| `metadata` | JSONB | Additional context |
| `sha256_prev` | VARCHAR(64) | Hash of previous audit entry |
| `sha256_self` | VARCHAR(64) | Hash of this audit entry |

---

### 1.5 Health Checks — بررسی سلامت

| Endpoint | Purpose | Checks |
|----------|---------|--------|
| `/health/live` | Liveness | Service process alive |
| `/health/ready` | Readiness | Dependencies reachable, queue not full |
| `/health/deep` | Deep health | Connection to PostgreSQL, RabbitMQ, MinIO, AI Service |
| `/health/pipeline` | Pipeline health | Orchestrator checks all registered services |

**Health Response Format — قالب پاسخ سلامت**

```json
{
  "status": "healthy",
  "service": "processing-service",
  "version": "1.0.0",
  "timestamp": "2025-06-26T10:30:00Z",
  "checks": {
    "postgresql": { "status": "up", "latency_ms": 5 },
    "rabbitmq": { "status": "up", "latency_ms": 3 },
    "ai_service": { "status": "up", "latency_ms": 120 }
  },
  "uptime_seconds": 86400
}
```

**Grafana Health Dashboard**

| Panel | Metric | Threshold |
|-------|--------|-----------|
| Service Uptime | `up{service="*"}` | < 99.9% → Warning |
| Dependency Status | All deep checks | Any down → Critical |
| Pipeline Health | All services registered | Missing → Warning |
| Dead Services | Services with no /health response | > 1 → Critical |

---

### 1.6 Latency Monitoring — نظارت بر تأخیر

**Per-Processor Latency — تأخیر هر پردازشگر**

| Processor | P50 | P95 | P99 | Max Allowed |
|-----------|-----|-----|-----|-------------|
| File Validation | 100ms | 500ms | 1s | 2s |
| OCR (10 pages) | 10s | 30s | 60s | 120s |
| PDF Parsing | 2s | 10s | 30s | 60s |
| Metadata Building | 500ms | 2s | 5s | 10s |
| Concept Resolution | 3s | 15s | 45s | 90s |
| Entity Extraction | 5s | 20s | 60s | 120s |
| Relationship Extraction | 5s | 20s | 60s | 120s |
| Embedding (100 chunks) | 5s | 15s | 30s | 60s |
| Vector Publication | 2s | 10s | 30s | 60s |
| Graph Publication | 3s | 15s | 45s | 90s |

**End-to-End Latency Targets — اهداف تأخیر سرتاسری**

| Document Type | P50 | P95 | P99 | SLA |
|--------------|-----|-----|-----|-----|
| Text (clean PDF, ≤ 50 pages) | 30s | 120s | 300s | 600s |
| Scanned (10 pages, OCR) | 60s | 240s | 600s | 900s |
| Large document (> 500 pages) | 300s | 900s | 1800s | 3600s |

**Alerting Rules — قوانین هشدار تأخیر**

| Condition | Severity | Action |
|-----------|----------|--------|
| P95 latency exceeds 2x baseline for 5 min | Warning | Investigate processor bottleneck |
| P99 latency exceeds max allowed | Critical | Page on-call engineer |
| End-to-end SLA breached | Critical | Escalate, assess pipeline health |
| Latency budget per stage exceeded | Warning | Review stage configuration |

---

### 1.7 Knowledge Freshness — تازگی دانش

| Metric | Description | Target |
|--------|-------------|--------|
| **Document Age** | Time since last update per document in KB | < 12 months for Tier 1 |
| **Standards Currency** | % of Tier 1-2 sources within currency window | > 95% |
| **Crawler Freshness** | Time since last crawler run per source type | < 24h for active sources |
| **Verification Coverage** | % of KB verified in last 12 months | > 90% |

---

### 1.8 Pipeline Throughput — توان عملیاتی پایپ‌لاین

| Metric | Description | Dashboard |
|--------|-------------|-----------|
| **Documents/Hour** | Current throughput vs capacity | Real-time gauge |
| **Bottleneck Detection** | Stage with highest queue depth | Heatmap by stage |
| **Throughput Trending** | Daily, weekly, monthly reports | Time-series charts |
| **Capacity Planning** | Projected growth vs current capacity | Predictive model |

---

## 2. Alert Rules — قوانین هشدار

| Metric | Condition | Severity | Notification |
|--------|-----------|----------|--------------|
| `ingestion_failures_total` | Rate > 10/min for 5 min | Critical | Slack + PagerDuty |
| `queue_depth_per_processor` | > 5000 for 2 min | Warning | Slack |
| `queue_depth_per_processor` | > 10000 for 1 min | Critical | PagerDuty |
| `validation_pass_rate` | < 80% for 10 min | Warning | Slack |
| `validation_failures_total` | Rate > 50/min for 5 min | Critical | PagerDuty |
| `publication_latency_seconds` | P95 > 30s for 5 min | Warning | Slack |
| `publication_failures_total` | Rate > 5/min for 3 min | Critical | PagerDuty |
| `human_review_queue_depth` | > 100 for 1 hour | Warning | Slack |
| `human_review_queue_depth` | > 500 for 30 min | Critical | PagerDuty |
| `documents_in_progress` | > 500 for 5 min | Warning | Slack |
| `processor_throughput` | < 50% of baseline for 10 min | Warning | Slack |
| `ocr_confidence` | < 0.7 average for 15 min | Warning | Slack |
| `knowledge_base_growth_bytes` | > 10GB/day sustained | Info | Weekly report |
| Health check | Any service down for 30s | Critical | PagerDuty |
| Pipeline SLA breach | End-to-end > max allowed | Critical | PagerDuty |

---

## 3. Observability Stack — پشته مشاهده‌پذیری

| Component | Tool | Purpose |
|-----------|------|---------|
| **Metrics Storage** | Prometheus | Time-series metric collection |
| **Metrics Visualization** | Grafana | Dashboards, alerting, heatmaps |
| **Tracing** | Jaeger via OpenTelemetry | Distributed trace visualization |
| **Log Aggregation** | Loki | Centralized log storage |
| **Log Agent** | Promtail | Log shipping from Kubernetes |
| **Alertmanager** | Prometheus Alertmanager | Alert routing, silencing, grouping |
| **Notification** | Slack + PagerDuty | Incident notification |

---

## 4. Dashboard Catalog — کاتالوگ داشبوردها

| Dashboard | Panels | Audience |
|-----------|--------|----------|
| **Pipeline Overview** | Throughput, latency, error rates, queue depths | All engineers |
| **Ingestion Dashboard** | Ingestion rate, failures by source, size distribution | Ingestion team |
| **Processing Dashboard** | Per-stage latency, queue depth, retry count | Processing team |
| **Validation Dashboard** | Pass/fail rates, human review queue, quality scores | Quality team |
| **Publication Dashboard** | Publication latency, target health, KB growth | Publication team |
| **Health Overview** | Service health, dependency status, SLA compliance | SRE / on-call |
| **Capacity Planning** | Growth trends, resource utilization, projections | Infrastructure team |
| **Audit Dashboard** | Lifecycle transitions, rollbacks, deprecations | Governance team |
