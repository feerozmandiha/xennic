# مشاهده‌پذیری استدلال — Reasoning Observability

> **Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## Metrics

### سنجه‌های استدلال — Reasoning Metrics

| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `reasoning_requests_total` | Counter | domain, mode | Total reasoning requests |
| `reasoning_latency_seconds` | Histogram | mode | Latency distribution (P50/P95/P99) |
| `reasoning_success_rate` | Gauge | — | % of requests completing without error |
| `reasoning_mode_distribution` | Gauge | mode | % of requests per reasoning mode |
| `reasoning_steps_per_request` | Histogram | — | Evidence chain length per request |
| `hybrid_mode_combination_count` | Counter | modes | Which modes were combined in hybrid |

### سنجه‌های شواهد — Evidence Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `evidence_retrieved_per_request` | Histogram | Evidence nodes retrieved per request |
| `evidence_coverage` | Gauge | % of claims with direct evidence |
| `evidence_confidence_distribution` | Histogram | By source tier |
| `evidence_expiration_rate` | Gauge | % of evidence within currency window |

### سنجه‌های استناد — Citation Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `citation_accuracy` | Gauge | Automated validation pass rate |
| `citations_per_conclusion` | Histogram | Number of citations per conclusion |
| `tier_1_citation_rate` | Gauge | % of conclusions citing Tier 1–2 sources |
| `orphan_claim_rate` | Gauge | % of claims without any citation |

### سنجه‌های اطمینان — Confidence Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `confidence_distribution` | Histogram | Overall confidence score distribution |
| `confidence_by_component` | Gauge | Average confidence per component |
| `low_confidence_rate` | Gauge | % of conclusions with confidence < 0.5 |
| `very_low_confidence_rate` | Gauge | % of conclusions with confidence < 0.3 |

### سنجه‌های ارجاع — Escalation Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `escalation_rate` | Gauge | % of requests escalated |
| `escalation_reason_distribution` | Gauge | By trigger type |
| `human_review_queue_depth` | Gauge | Pending human reviews |
| `human_review_processing_time` | Histogram | By priority |
| `human_review_approval_rate` | Gauge | % of reviews approved |

### سنجه‌های کیفیت — Quality Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `reasoning_quality_score` | Gauge | Composite of accuracy + coverage + citation |
| `user_feedback_score` | Gauge | Average user rating of reasoning quality |
| `error_rate` | Gauge | % of conclusions with post-publication correction |

---

## ردیابی — Tracing

- **OpenTelemetry** distributed tracing across all reasoning stages
- **Trace per reasoning session**: `context_building` → `knowledge_selection` → `evidence_collection` → `reasoning` → `constraint` → `formula` → `conflict` → `confidence` → `citation` → `conclusion`
- **Spans** per stage with stage-specific attributes (domain, mode, confidence, latency)

---

## ثبت رویداد — Logging

- Structured **JSON logging** per reasoning request
- **Log fields**: `session_id`, `query`, `domain`, `reasoning_mode`, `confidence`, `citation_count`, `latency`, `errors`
- **Log levels**:
  - `INFO` — normal request completion
  - `WARN` — low confidence, partial coverage
  - `ERROR` — reasoning failure

---

## قوانین هشدار — Alert Rules

| Condition | Action |
|-----------|--------|
| P95 latency > 30s | Alert reasoning team |
| Success rate < 95% | Alert engineering |
| Low confidence rate > 20% over 1 hour | Alert knowledge team |
| Escalation rate > 30% | Alert product team |
| Human review queue > 50 pending | Alert operations |
| Orphan claim rate > 5% | Alert quality team |

---

## داشبوردها — Dashboards

| Dashboard | Key Panels |
|-----------|------------|
| **Reasoning Overview** | Request rate, latency, success rate, mode distribution |
| **Confidence Dashboard** | Confidence distribution, low-confidence trends |
| **Escalation Dashboard** | Queue depth, processing time, approval rate |
| **Quality Dashboard** | Citation accuracy, evidence coverage, user feedback |
