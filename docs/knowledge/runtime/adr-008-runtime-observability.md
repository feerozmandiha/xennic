# ADR-008: Runtime Observability

**Status:** Proposed | **Date:** Tir 1405 | **Deciders:** Xennic Architecture Team

---

## Context

The runtime consists of 20+ microservices processing millions of events across multiple pipeline stages. When a document fails mid-pipeline or a service degrades, operators must be able to answer: what failed, why it failed, which documents are affected, and what the blast radius is. The observability stack must support real-time alerting, post-mortem analysis, capacity planning, and SLA monitoring — without requiring proprietary tools or vendor lock-in.

## Decision

Adopt an open-source observability stack:

- **Prometheus** — collect metrics from all services: queue depths, processing latency (p50/p95/p99), throughput (documents/sec), error rates by stage, retry counts, DLQ sizes. Service-level metrics exposed via standard `/metrics` endpoints.
- **OpenTelemetry (OTel)** — distributed tracing across all pipeline stages. Every event carries a `trace_id` and `span_id`. Traces capture per-document end-to-end latency, with individual spans per pipeline stage. Sampled at 1:100 for production, 1:1 for debugging sessions.
- **Structured JSON logging to Loki** — all services log structured JSON (not plain text). Logs include `correlation_id`, `document_id`, `stage`, `event_type`, `error_code`, and `duration_ms`. Logs are shipped to Loki via Promtail. No log parsing needed — query directly by key-value pairs.
- **Grafana dashboards** — pre-built dashboards for:
  - Pipeline overview (throughput, error rates, queue depths)
  - Per-document trace viewer
  - Stage-specific performance (latency histograms, retry counts)
  - SLA compliance (ingestion-to-publication time by tier)
  - Resource utilisation (CPU, memory, network per pod)
- **Alertmanager** — rule-based alerting with configurable severity (P1–P5). Alerts routed to Slack, email, and the internal incident management system.

## Alternatives Considered

- **ELK stack (Elasticsearch, Logstash, Kibana):** Mature and powerful but operationally heavy — requires managing Elasticsearch clusters, Logstash pipelines, and index lifecycle. Higher resource consumption than Loki.
- **Proprietary APM (Datadog, New Relic):** Excellent UX and out-of-the-box integrations but expensive at scale (per-host or per-event pricing for 100M+ documents/month). Vendor lock-in.
- **CloudWatch:** Native to AWS but non-portable to on-premise or air-gapped deployments. Limited query capabilities compared to Loki + Grafana.

## Consequences

- **Positive:** Full observability stack runs on open-source tools with no licensing costs. Integrates with existing Xennic infrastructure (Grafana already deployed). Distributed tracing enables end-to-end latency analysis. Structured logging makes troubleshooting fast and precise. Portable across cloud and on-premise.
- **Negative:** Setup complexity — requires configuring OTel collectors, Promtail, Loki, and Prometheus for each service. OTel overhead (CPU, memory) on every worker pod. Sampling means some rare edge cases may not be captured in traces.

## Future Impact

The OTel foundation enables future capabilities: automated root-cause analysis (correlate error rate spikes with deployment events), ML-based anomaly detection on metric streams, and real-time SLA dashboards for client-facing reporting. The key constraint is that all services must be instrumented consistently — ad-hoc logging or metrics undermine the unified observability model.

## Compliance

- Every service must expose a `/metrics` endpoint with Prometheus-formatted metrics for latency, throughput, error rate, and queue depth.
- All logs must be structured JSON with mandatory fields: `timestamp`, `level`, `service`, `correlation_id`, `message`.
- Distributed tracing must be enabled for all pipeline stages; sampling rate is configurable per environment.
- New services must include Grafana dashboard definitions as part of their Helm chart.
