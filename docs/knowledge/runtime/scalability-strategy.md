# راهبرد مقیاس‌پذیری — Scalability Strategy

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## 1. Design Target — هدف طراحی

| Dimension | Target | Burst |
|-----------|--------|-------|
| Total Documents | 100 million | 200 million |
| Total Chunks | 10 billion | 20 billion |
| Total Vectors | 10 billion | 20 billion |
| Knowledge Graph Nodes | 500 million | 1 billion |
| Knowledge Graph Edges | 2 billion | 4 billion |
| Active Workspaces | 10,000 | 25,000 |
| Documents per Day | 100,000 | 500,000 |
| Concurrent Pipeline | 1,000 documents | 5,000 documents |

---

## 2. Horizontal Scaling — مقیاس‌پذیری افقی

**Stateless Processor Design — طراحی پردازشگرهای بدون حالت**

| Property | Implementation |
|----------|---------------|
| State Location | Event Bus (RabbitMQ) + Database (PostgreSQL) |
| Processor Persistence | None — all state externalized |
| Scaling Model | Add/remove worker instances freely |
| Session Affinity | Not required — any worker can process any event |

**Worker Pool Configuration — پیکربندی استخر کارگری**

| Processor Type | Min Replicas | Max Replicas | Scale Trigger | Metric |
|----------------|-------------|--------------|---------------|--------|
| Ingestion | 2 | 20 | Queue depth > 100 | `rabbitmq_queue_messages` |
| OCR | 1 | 10 | Queue depth > 50 | `rabbitmq_queue_messages` |
| Parser | 2 | 30 | Queue depth > 200 | `rabbitmq_queue_messages` |
| Metadata | 2 | 15 | Queue depth > 100 | `rabbitmq_queue_messages` |
| Concept Resolver | 2 | 20 | Queue depth > 100 | `rabbitmq_queue_messages` |
| Entity Extractor | 2 | 20 | Queue depth > 100 | `rabbitmq_queue_messages` |
| Embedding Generator | 1 | 8 | Queue depth > 50 | `rabbitmq_queue_messages` |
| Validation | 2 | 15 | Queue depth > 100 | `rabbitmq_queue_messages` |
| Publication | 2 | 15 | Queue depth > 100 | `rabbitmq_queue_messages` |

**Auto-Scaling Rules — قوانین مقیاس‌گذاری خودکار**

| Trigger | Scale Up | Scale Down | Cooldown |
|---------|----------|------------|----------|
| Queue depth > 1000 | +2 replicas | — | 5 min |
| CPU > 70% | +1 replica | — | 5 min |
| Memory > 80% | +1 replica | — | 5 min |
| Queue depth < 100 | — | -1 replica | 5 min |
| CPU < 30% for 10 min | — | -1 replica | 5 min |

---

## 3. Distributed Processing — پردازش توزیع‌شده

**Geographic Distribution — توزیع جغرافیایی**

| Region | Purpose | Services |
|--------|---------|----------|
| **Primary (IR-Tehran)** | Main processing cluster | Full pipeline |
| **Secondary (DE-Frankfurt)** | Disaster recovery, EU data sovereignty | Full pipeline (standby) |
| **Edge (AE-Dubai)** | Low-latency ingestion for MENA region | Ingestion + processing |

**Cross-Region Event Replication — تکرار رویداد بین منطقه‌ای**

| Mechanism | Technology | Latency | Consistency |
|-----------|-----------|---------|-------------|
| RabbitMQ Federation | AMQP federation plugin | < 1s | Eventually consistent |
| RabbitMQ Shovel | AMQP shovel plugin | < 500ms | At-least-once |
| Event Replay | Event store replay | Minutes | Fully consistent |

**No Single Point of Failure — بدون نقطه شکست واحد**

| Component | Redundancy Strategy |
|-----------|---------------------|
| RabbitMQ | Mirrored queues across 3 nodes per cluster |
| PostgreSQL | Streaming replication (1 primary + 2 replicas) |
| Qdrant | Sharding + replication factor = 3 |
| MinIO | Erasure coding (4+2) across nodes |
| Orchestrator | Active-passive with leader election |
| Processors | Stateless — multiple replicas always running |

---

## 4. Multi-Tenant Isolation — ایزولاسیون چندمستأجری

| Isolation Layer | Mechanism | Configuration |
|-----------------|-----------|---------------|
| **Workspace ID** | All events and records tagged with `workspace_id` | UUID per workspace |
| **Vector DB** | Separate Qdrant collection per workspace | `workspace_{uuid}` collection naming |
| **Knowledge Graph** | Namespace prefix per workspace | `ws_{uuid}_` node/edge labels |
| **Object Storage** | Prefix-based isolation in MinIO | `workspaces/{uuid}/` path prefix |
| **Processing Quota** | Rate limiter per workspace | Configurable max docs/day |

**Per-Workspace Quotas — سهمیه‌های هر فضای کاری**

| Resource | Default Quota | Max Quota | Enforcement |
|----------|--------------|-----------|-------------|
| Documents per day | 1,000 | 10,000 | Rate limiter at ingestion |
| Total storage | 100 GB | 10 TB | Monitored at publication |
| Chunks per document | 10,000 | 100,000 | Chunk generator limit |
| Concurrent processing | 10 | 100 | Worker pool limit |
| Vector DB size | 10 million | 1 billion | Collection-level monitor |
| API rate (queries) | 100/min | 1000/min | API gateway |

**Priority Queues — صف‌های اولویت**

| Priority Tier | Workspace Criteria | Processing SLA |
|---------------|-------------------|----------------|
| **Critical** | Enterprise SLA, production incidents | < 5 minutes |
| **High** | Premium tier, time-sensitive ingestion | < 15 minutes |
| **Normal** | Standard tier | < 60 minutes |
| **Low** | Trial, batch import, bulk re-processing | Best effort |

---

## 5. Multi-Language Support — پشتیبانی چندزبانه

| Language | OCR | Parser | Embedding Model | Priority |
|----------|-----|--------|-----------------|----------|
| **English (EN)** | Tesseract `eng` | Default | `multilingual-e5-large` | Primary |
| **Persian (FA)** | Tesseract `fas` | RTL-aware parser | `multilingual-e5-large` | Primary |
| **German (DE)** | Tesseract `deu` | Default | `multilingual-e5-large` | Secondary |
| **French (FR)** | Tesseract `fra` | Default | `multilingual-e5-large` | Secondary |
| **Arabic (AR)** | Tesseract `ara` | RTL-aware parser | `multilingual-e5-large` | Secondary |

**Language Detection Flow — جریان تشخیص زبان**

| Step | Component | Action |
|------|-----------|--------|
| 1 | Ingestion Service | Detect document language (CLD3 / fastText) |
| 2 | Routing | Route to language-specific parser |
| 3 | OCR (if scanned) | Load appropriate Tesseract language pack |
| 4 | Parser | Select RTL or LTR parsing strategy |
| 5 | Embedding | Use multilingual embedding model |

---

## 6. Multi-Country Support — پشتیبانی چندکشوری

| Capability | Implementation |
|------------|---------------|
| **Document Routing** | Route documents by jurisdiction (country code in metadata) |
| **Validation Rules** | Country-specific rule sets (e.g., DE-specific DIN validation) |
| **Metadata** | Jurisdiction-aware fields: applicable standards, local regulations |
| **Data Sovereignty** | Regional storage constraints; EU data stays in EU cluster |

---

## 7. Multi-Domain Support — پشتیبانی چنددامنه‌ای

| Domain | Specialized Processor | Validation Rules | Embedding |
|--------|-----------------------|------------------|-----------|
| **Electrical Engineering** | Default extraction rules | IEEE, IEC standards | General |
| **Civil Engineering** | Custom entity types | Local building codes | General |
| **Mechanical Engineering** | Custom entity types | ISO, DIN standards | General |
| **Telecommunications** | Custom entity types | ITU, ETSI standards | General |

---

## 8. Storage Scaling — مقیاس‌پذیری ذخیره‌سازی

| Storage System | Scaling Strategy | Capacity | Replication |
|----------------|-----------------|----------|-------------|
| **Object Storage (MinIO)** | Erasure coding, multi-node cluster | Petabyte-scale | 4+2 erasure coding |
| **Vector DB (Qdrant)** | Sharding + replication | 100B vectors (theoretical) | RF = 3 |
| **Knowledge Graph (Neo4j/Age)** | Read replicas + sharding | 1B nodes, 4B edges | Core + replica |
| **PostgreSQL** | Read replicas + partitioning | 10 TB | Streaming replication |
| **Event Bus (RabbitMQ)** | Clustered mirrored queues | 100K msg/s throughput | Mirror across 3 nodes |
| **Cache (Redis)** | Cluster mode | 100 GB | Replication |

**Qdrant Sharding Strategy — راهبرد پارتیشن‌بندی Qdrant**

| Parameter | Configuration |
|-----------|---------------|
| Shards per collection | 6 (default), scalable to 64 |
| Replication factor | 3 |
| Write consistency | `Majority` |
| Read consistency | `Quorum` (strong), `One` (eventual for search) |
| Optimizer | `auto` with `default_segment_number = 10` |

**PostgreSQL Partitioning — پارتیشن‌بندی PostgreSQL**

| Table | Partition Key | Partition Type | Retention |
|-------|--------------|----------------|-----------|
| `documents` | `created_at` (month) | Range | No deletion |
| `audit_log` | `timestamp` (month) | Range | 7 years |
| `chunks` | `document_id` (hash) | Hash | No deletion |
| `events` | `timestamp` (day) | Range | 90 days |

---

## 9. Scaling Limits — محدودیت‌های مقیاس‌پذیری

| Limit | Target | Burst | Hard Cap |
|-------|--------|-------|----------|
| Documents per day | 100,000 | 500,000 | 1,000,000 |
| Document size | 50 MB | 100 MB | 200 MB |
| Storage per workspace | 1 TB | 10 TB | 50 TB |
| Chunks per document | 10,000 | 50,000 | 100,000 |
| Concurrent pipeline | 1,000 | 5,000 | 10,000 |
| Vector DB total | 10B vectors | 50B vectors | 100B vectors |
| Queue depth per processor | 5,000 | 10,000 | 50,000 |
| Max replicas per processor | 20 | 50 | 100 |

---

## 10. Cloud-Native Deployment — استقرار بومی ابری

| Component | Technology | Configuration |
|-----------|-----------|---------------|
| **Container Runtime** | Docker | Images per processor |
| **Orchestration** | Kubernetes | Multi-node cluster (min 3 workers) |
| **Service Mesh** | Istio / Linkerd | mTLS, traffic splitting, observability |
| **Auto-Scaling** | HPA + KEDA | CPU, memory, and custom RabbitMQ metrics |
| **Deployment** | Rolling update with maxSurge 25% | Zero-downtime |
| **Canary** | 10% traffic to new version | Gradual rollout over 15 min |
| **Resource Requests** | Guaranteed CPU + memory per processor | Avoids noisy neighbor |
| **Pod Disruption Budget** | minAvailable 50% | Ensures HA during node maintenance |

**Kubernetes HPA Configuration — پیکربندی HPA در Kubernetes**

| Processor | Metric | Target Value | Min/Max |
|-----------|--------|-------------|---------|
| Ingestion | `rabbitmq_queue_messages` | 500 | 2 / 20 |
| Parser | `rabbitmq_queue_messages` | 500 | 2 / 30 |
| Embedding | `rabbitmq_queue_messages` | 200 | 1 / 8 |
| Validation | `rabbitmq_queue_messages` | 500 | 2 / 15 |
| Publication | `rabbitmq_queue_messages` | 500 | 2 / 15 |

**Resource Requests and Limits — درخواست و محدودیت منابع**

| Processor | Request CPU | Limit CPU | Request RAM | Limit RAM |
|-----------|-----------|-----------|-------------|-----------|
| Ingestion | 250m | 1 | 256 Mi | 1 Gi |
| OCR | 500m | 2 | 1 Gi | 4 Gi |
| Parser | 500m | 4 | 512 Mi | 2 Gi |
| Metadata | 100m | 500m | 128 Mi | 512 Mi |
| Concept Resolver | 500m | 2 | 1 Gi | 4 Gi |
| Entity Extractor | 500m | 2 | 1 Gi | 4 Gi |
| Embedding Generator | 1 | 4 | 2 Gi | 8 Gi |
| Validation | 500m | 2 | 512 Mi | 2 Gi |
| Publication | 500m | 2 | 512 Mi | 2 Gi |
| Orchestrator | 100m | 500m | 256 Mi | 1 Gi |
