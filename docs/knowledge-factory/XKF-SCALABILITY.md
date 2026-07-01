# Xennic Knowledge Factory (XKF) — Scalability, Reliability, Security

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## 1. Scalability Strategy

### 1.1 Horizontal Scaling Model

The XKF is designed for **horizontal scaling** at every layer:

| Layer | Scaling Unit | Scaling Trigger | Max Nodes |
|-------|-------------|-----------------|-----------|
| Factory Services | Service instance per queue | Queue depth > threshold | Unlimited |
| AI Inference | GPU pod per model | Request queue depth | 10 (cost-bound) |
| Vector Store | Qdrant shard | Collection size > 100K vectors | 16 shards |
| Graph Store | Partition | Graph size > 10M nodes | 8 partitions |
| Metadata Store | Read replica | Read/write ratio > 5:1 | 3 replicas |
| Event Bus | RabbitMQ cluster | Message throughput > 10K/s | 3 nodes |

### 1.2 Factory Service Scaling

Each factory service is stateless and scales independently:

```
                    ┌──────────────────────┐
                    │    Load Balancer     │
                    │   (RabbitMQ Queue)   │
                    └──────┬───────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ Service  │ │ Service  │ │ Service  │
        │ Instance │ │ Instance │ │ Instance │
        │  (v1)    │ │  (v2)    │ │  (vN)    │
        └──────────┘ └──────────┘ └──────────┘
              │            │            │
              └────────────┼────────────┘
                           ▼
                    ┌──────────────┐
                    │  Downstream  │
                    │  (DB/API/KG) │
                    └──────────────┘
```

### 1.3 Throughput Targets

| Metric | Alpha | Beta | GA |
|--------|-------|------|-----|
| Documents ingested per day | 100 | 1,000 | 10,000 |
| EKOs produced per document | ~50 | ~200 | ~500 |
| Concurrent pipeline executions | 5 | 20 | 100 |
| API queries per second | 50 | 500 | 5,000 |
| Vector search queries per second | 20 | 200 | 2,000 |

### 1.4 Resource Estimation (Per 1,000 Docs/Day)

| Resource | Requirement | Notes |
|----------|-------------|-------|
| CPU cores | 8 | Mostly for parsing and OCR |
| RAM | 32 GB | Document processing + caching |
| GPU (AI) | 1 (T4 equivalent) | Embedding + LLM inference |
| Storage (vector) | 2 GB | ~500K vectors at 1024 dim |
| Storage (documents) | 50 GB | Original files + processed |
| Storage (metadata) | 5 GB | EKO metadata in PostgreSQL |

---

## 2. Reliability Strategy

### 2.1 Availability Targets

| Component | Target | Strategy |
|-----------|--------|----------|
| Factory pipeline | 99.5% | Event-driven with DLQ, retry, circuit breaker |
| Knowledge stores | 99.9% | Qdrant replication, PG HA, MinIO HA |
| AI inference | 99.0% | Fallback to rule-based extraction |
| API gateway | 99.9% | Nginx HA, multiple upstreams |
| Event bus | 99.95% | RabbitMQ cluster with mirrored queues |

### 2.2 Failure Modes & Recovery

| Failure Mode | Detection | Recovery | RTO | RPO |
|-------------|-----------|----------|-----|-----|
| Service crash | Health check failure | Auto-restart (Docker/K8s) | <30s | 0 (stateless) |
| Pipeline stage timeout | Event age > SLA | Re-route to DLQ, alert | <5min | 0 (event-driven) |
| Vector store unavailable | Connection error | Read from replica; queue writes | <1min | <1s (write-ahead) |
| LLM provider down | HTTP 5xx | Cache hit; fallback extraction | <30s | 0 |
| Message broker failure | Heartbeat loss | Auto-reconnect with backoff | <2min | <1s (persistent queues) |
| Database corruption | Consistency check | Point-in-time recovery from backup | <1h | <24h (backup cycle) |
| Full region failure | Cross-region health | Manual DNS failover | <4h | <1h (async replication) |

### 2.3 Circuit Breaker Configuration

| Service | Failure Threshold | Reset Timeout | Half-Open Max |
|---------|------------------|---------------|---------------|
| AI Service | 5 failures / 30s | 60s | 3 requests |
| Qdrant | 10 failures / 30s | 30s | 5 requests |
| Postgres | 3 failures / 10s | 120s | 2 requests |
| RabbitMQ | 5 failures / 10s | 30s | 3 requests |

### 2.4 Idempotency

Every factory event carries an `idempotency_key` (UUID). Downstream services
deduplicate by this key before processing. This guarantees exactly-once
processing semantics despite at-least-once delivery.

---

## 3. Security Model

### 3.1 Security Principles

1. **Defense in depth** — Security at network, transport, application, and data layers
2. **Least privilege** — Every service has minimum required permissions
3. **Zero trust** — Services authenticate to each other; no implicit trust
4. **Tenant isolation** — Workspaces cannot access each other's data
5. **Audit everything** — Every access and mutation is logged

### 3.2 Authentication

| Layer | Mechanism | Notes |
|-------|-----------|-------|
| External API | JWT (RS256) | Issued by NestJS Auth module |
| Inter-service | mTLS | Mutual TLS between factory services |
| Event bus | TLS + SASL (PLAIN) | RabbitMQ TLS with service credentials |
| Database | TLS + password | PostgreSQL with SCRAM-SHA-256 |

### 3.3 Authorization

| Operation | Auth Check | Scope |
|-----------|-----------|-------|
| Upload document | JWT + workspace membership | Workspace-scoped |
| Read EKO | JWT + workspace membership | Workspace-scoped |
| Update EKO (human review) | JWT + reviewer role | Workspace-scoped |
| Admin operations | JWT + admin role | System-wide |
| Pipeline management | mTLS + service identity | Service-scoped |

### 3.4 Data Protection

| Data State | Protection |
|------------|-----------|
| At rest (database) | TDE (PostgreSQL) or column-level encryption for PII |
| At rest (documents) | Server-side encryption (MinIO SSE-S3) |
| At rest (vectors) | Qdrant payload encryption |
| In transit | TLS 1.3 for all communications |
| In memory | No sensitive data in logs; secrets from environment/secret store |

### 3.5 Audit Trail

Every factory operation is recorded in the audit log:

```json
{
  "timestamp": "2026-06-26T10:00:00Z",
  "actor": "service:extract-service/v1.2.0",
  "action": "eko.extracted",
  "resource": "eko:uuid",
  "workspace_id": "wks-001",
  "source_ip": "10.0.1.45",
  "result": "success",
  "metadata": {
    "extraction_time_ms": 1234,
    "concepts_found": 12,
    "confidence": 0.87
  }
}
```

### 3.6 Secrets Management

| Secret | Storage | Rotation |
|--------|---------|----------|
| JWT signing keys | Docker secrets | Every 90 days |
| Database passwords | Docker secrets | Every 90 days |
| AI provider API keys | Vault (future) / env (current) | Manual |
| TLS certificates | Let's Encrypt / filesystem | Auto (LE) / 90 days |
| Service mTLS certs | HashiCorp Vault (future) | TBD |

---

## 4. Observability

### 4.1 Metrics (Prometheus)

| Metric | Type | Labels | Purpose |
|--------|------|--------|---------|
| `factory_docs_received_total` | Counter | source, format, workspace | Intake volume |
| `factory_docs_processed_total` | Counter | service, stage, status | Pipeline throughput |
| `factory_eko_published_total` | Counter | kind, quality_tier | Publication rate |
| `factory_pipeline_duration_seconds` | Histogram | service, stage | Latency tracking |
| `factory_queue_depth` | Gauge | queue | Backlog monitoring |
| `factory_llm_tokens_total` | Counter | model, service | Cost tracking |
| `factory_errors_total` | Counter | service, error_type | Error rate |

### 4.2 Tracing (OpenTelemetry)

Distributed tracing across all factory services:

```
─── Intake ─── Classify ─── Parse ─── Extract ─── Resolve ─── Publish
    span_1      span_2      span_3     span_4      span_5      span_6
    │           │           │          │           │           │
    └───────────┴───────────┴──────────┴───────────┴───────────┘
                         Trace: Document Processing
```

### 4.3 Logging (Structured)

All factory services emit JSON-structured logs via stdout (collected by
Promtail → Loki):

```json
{
  "level": "info",
  "service": "extract-service",
  "version": "1.2.0",
  "trace_id": "abc123",
  "span_id": "def456",
  "document_id": "uuid",
  "message": "Extraction completed for document",
  "duration_ms": 1234,
  "entities_found": 15
}
```

### 4.4 Alerting Rules

| Alert | Condition | Severity | Channel |
|-------|-----------|----------|---------|
| Pipeline stalled | No document published in 30 min | CRITICAL | PagerDuty |
| Queue backed up | Queue depth > 1,000 for 5 min | WARNING | Slack |
| Error rate spike | Error rate > 5% for 5 min | CRITICAL | PagerDuty |
| LLM cost anomaly | Token usage > 2x daily average | WARNING | Email |
| Quality score drop | Average quality < 0.6 for 1h | WARNING | Slack |
| Disk space low | Storage > 85% | WARNING | Email |
