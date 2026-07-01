# Xennic Knowledge Factory (XKF) — Architecture

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## 1. Layered Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER                             │
│        Web App (Next.js)    Mobile App    CLI / SDK    Third-Party      │
│                              API Gateway / BFF                           │
├──────────────────────────────────────────────────────────────────────────┤
│                           EXPERIENCE LAYER                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐  │
│  │ Engineering │  │  AI Chat    │  │  Knowledge  │  │  Search &     │  │
│  │ Calculator  │  │  Assistant  │  │  Explorer   │  │  Discovery    │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └───────────────┘  │
├──────────────────────────────────────────────────────────────────────────┤
│                           REASONING LAYER                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Context  │  │Knowledge │  │ Evidence │  │Reasoning │  │Conflict  │  │
│  │ Builder  │  │ Selector │  │ Collector│  │ Engine   │  │ Resolver │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│  │Formula   │  │Constraint│  │Confidence│  │ Citation │                │
│  │Evaluator │  │ Checker  │  │ Engine   │  │ Generator│                │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘                │
├──────────────────────────────────────────────────────────────────────────┤
│                        KNOWLEDGE STORE LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │ Vector Store │  │ Knowledge    │  │ Metadata     │  │ Document   │  │
│  │ (Qdrant)     │  │ Graph (KG)   │  │ Store (PG)   │  │ Store      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │ Embedding    │  │ Concept      │  │ Synonym      │                  │
│  │ Index        │  │ Registry     │  │ Dictionary   │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
├──────────────────────────────────────────────────────────────────────────┤
│                        KNOWLEDGE CURATION LAYER                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │Quality   │  │ Human    │  │Version   │  │ Lifecycle│  │Publisher │  │
│  │ Gate     │  │ Review   │  │ Manager  │  │ Manager  │  │          │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
├──────────────────────────────────────────────────────────────────────────┤
│                        KNOWLEDGE FACTORY LAYER                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │Intake    │  │ Classify │  │ Parse    │  │ Extract  │  │ Resolve  │  │
│  │ Service  │  │ Service  │  │ Service  │  │ Service  │  │ Service  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Normalize│  │ Chunk    │  │ Embed    │  │ Enrich   │  │ Publish  │  │
│  │ Service  │  │ Service  │  │ Service  │  │ Service  │  │ Service  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
├──────────────────────────────────────────────────────────────────────────┤
│                        INFRASTRUCTURE LAYER                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │PostgreSQL│  │  Redis   │  │ RabbitMQ │  │  MinIO   │  │  Qdrant  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│  │Prometheus│  │ Grafana  │  │   Loki   │  │  Nginx   │                │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘                │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Layer Definitions

### 2.1 Infrastructure Layer
The raw compute, storage, networking, and observability resources. All services
run on this foundation. See `infrastructure/docker/compose/production/` and
`docs/deployment/` for implementation details.

### 2.2 Knowledge Factory Layer (Core)
The ingestion and processing pipeline that transforms raw documents into
structured knowledge objects. This is the heart of the factory.

| Service | Responsibility | Input | Output |
|---------|---------------|-------|--------|
| **Intake Service** | Receive documents from any source, validate format, generate checksum, enqueue for processing | Raw file + metadata | Staged document record |
| **Classify Service** | Detect document type, language, domain; assign taxonomy labels | Raw file + metadata | Classified document |
| **Parse Service** | Convert document to machine-readable text (OCR, PDF parse, HTML extract) | Raw file | Structured text + layout |
| **Extract Service** | Identify entities, concepts, relationships, formulas, and standards references | Structured text | Extraction graph |
| **Resolve Service** | Map extracted terms to canonical concepts, entities, and synonyms | Extraction graph | Resolved concept graph |
| **Normalize Service** | Convert units to SI, standardize terminology, normalize numerical formats | Concept graph | Normalized knowledge |
| **Chunk Service** | Split knowledge into optimal segments for embedding and retrieval | Normalized doc | Chunked segments |
| **Embed Service** | Generate vector embeddings for each chunk using configured model | Text chunks | Dense vectors |
| **Enrich Service** | Add metadata, cross-references, source provenance, and quality tags | Chunks + vectors | Enriched knowledge objects |
| **Publish Service** | Write to vector store, knowledge graph, and metadata store atomically | Enriched objects | Published EKOs |

### 2.3 Knowledge Curation Layer
Quality control, human review, versioning, and lifecycle management.

| Component | Responsibility |
|-----------|---------------|
| **Quality Gate** | Automated quality checks against governance policy; score each EKO |
| **Human Review** | Escalate low-confidence EKOs for human engineer validation |
| **Version Manager** | Track all EKO versions; support rollback and supersession |
| **Lifecycle Manager** | Manage EKO state machine (see XKF-LIFECYCLE.md) |
| **Publisher** | Coordinate atomic publication across all stores |

### 2.4 Knowledge Store Layer
The persistent storage of all knowledge artifacts.

| Store | Technology | Contents | Query Pattern |
|-------|-----------|----------|---------------|
| Vector Store | Qdrant | Chunk embeddings + metadata | Hybrid search (dense + sparse) |
| Knowledge Graph | Neo4j / custom | Entities, concepts, relationships | Graph traversal, path finding |
| Metadata Store | PostgreSQL | EKO metadata, provenance, governance | SQL, relation queries |
| Document Store | MinIO | Original files, intermediate artifacts | Object storage |
| Concept Registry | PostgreSQL | Canonical concepts, synonyms, ontology | Lookup, resolution |
| Embedding Index | Qdrant + cache | All embedding vectors | ANN search |

### 2.5 Reasoning Layer
The AI-powered reasoning pipeline that consumes knowledge and produces answers.
Fully specified in `knowledge/reasoning/reasoning-runtime.md`. XKF supplies
this layer with validated, published EKOs.

### 2.6 Experience Layer
The application-level services that present knowledge to end users through
various interfaces.

### 2.7 Presentation Layer
The user-facing applications (web, mobile, CLI, API consumers).

---

## 3. Service Boundaries

### 3.1 Service Ownership Principle

Each service owns its data exclusively. No service reads another service's
database. Communication occurs only through defined APIs or the event bus.

### 3.2 Factory Services Map

```
                    ┌─────────────┐
                    │   Intake    │
                    │   Service   │
                    └──────┬──────┘
                           │ doc_ingested
                           ▼
                    ┌─────────────┐
                    │  Classify   │
                    │   Service   │
                    └──────┬──────┘
                           │ doc_classified
                           ▼
                    ┌─────────────┐
                    │   Parse     │
                    │   Service   │
                    └──────┬──────┘
                           │ doc_parsed
                           ▼
                    ┌─────────────┐
                    │  Extract    │
                    │   Service   │
                    └──────┬──────┘
                           │ extraction_complete
                           ▼
                    ┌─────────────┐
                    │  Resolve    │
                    │   Service   │
                    └──────┬──────┘
                           │ resolution_complete
                           ▼
                    ┌─────────────┐
                    │  Normalize  │
                    │   Service   │
                    └──────┬──────┘
                           │ normalization_complete
                           ▼
                    ┌─────────────┐
                    │   Chunk     │
                    │   Service   │
                    └──────┬──────┘
                           │ chunks_ready
                           ▼
                    ┌─────────────┐
                    │   Embed     │
                    │   Service   │
                    └──────┬──────┘
                           │ embedding_complete
                           ▼
                    ┌─────────────┐
                    │   Enrich    │
                    │   Service   │
                    └──────┬──────┘
                           │ enrichment_complete
                           ▼
                    ┌─────────────┐
                    │  Publish    │      ┌─────────────┐
                    │   Service   │─────►│  Quality    │
                    └──────┬──────┘      │   Gate      │
                           │            └─────────────┘
                           ▼
               ┌─────────────────────┐
               │  Knowledge Store    │
               │  (Vector+Graph+Meta)│
               └─────────────────────┘
```

### 3.3 Event Contracts

Every pipeline stage produces an event on RabbitMQ. Events conform to CloudEvents
specification with the following envelope:

```json
{
  "specversion": "1.0",
  "id": "uuid",
  "source": "/xennic/factory/intake",
  "type": "com.xennic.factory.doc.ingested.v1",
  "datacontenttype": "application/json",
  "subject": "doc-{id}",
  "time": "2026-06-26T10:00:00Z",
  "data": {
    "document_id": "uuid",
    "workspace_id": "uuid",
    "pipeline_version": "1.2.0",
    "previous_event_id": "uuid",
    "provenance": { ... }
  }
}
```

### 3.4 Failure Handling

Each service implements:
- **Retry with exponential backoff** (max 3 retries)
- **Dead-letter queue** for unrecoverable failures
- **Circuit breaker** when downstream is unavailable
- **Idempotency** via event ID deduplication

---

## 4. Integration with the NestJS API

The existing NestJS API (`apps/api`) serves as the **synchronous gateway** to
the Knowledge Factory. All user-facing operations pass through it.

### 4.1 Synchronous Operations (via NestJS)

| Operation | Endpoint | Description |
|-----------|----------|-------------|
| Upload document | `POST /api/v1/knowledge/upload` | Receives file, creates record, dispatches to Intake |
| Query knowledge | `GET /api/v1/knowledge/search` | Synchronous search across stores |
| Get EKO detail | `GET /api/v1/knowledge/:id` | Full EKO with provenance |
| Manage pipeline | `PATCH /api/v1/knowledge/:id/workflow` | Human review actions |
| List pipeline status | `GET /api/v1/knowledge/status` | Queue depth, processing status |

### 4.2 Asynchronous Operations (via Event Bus)

| Event | Producer | Consumer(s) |
|-------|----------|-------------|
| `doc.uploaded` | NestJS | Intake Service |
| `eko.published` | Publish Service | NestJS (notification), Reasoning Runtime |
| `eko.failed` | Any factory service | NestJS (notification, logging) |
| `quality.escalated` | Quality Gate | Human Review Service |
| `review.completed` | Human Review | Publish Service |

---

## 5. Event-Driven Architecture

### 5.1 Message Topology

```
                    ┌──────────────────────────────────────────────┐
                    │              RABBITMQ EXCHANGE               │
                    │         xennic.factory (topic)               │
                    └──────┬──────┬──────┬──────┬──────┬──────────┘
                           │      │      │      │      │
              ┌────────────┘      │      │      │      └────────────┐
              ▼                   ▼      ▼      ▼                   ▼
         ┌──────────┐     ┌──────────┐     ┌──────────┐      ┌──────────┐
         │  Queue:  │     │  Queue:  │     │  Queue:  │      │  Queue:  │
         │ factory. │     │ factory. │     │ factory. │      │ factory. │
         │ intake   │     │ classify │     │  embed   │      │   dlq    │
         └──────────┘     └──────────┘     └──────────┘      └──────────┘
```

### 5.2 Exchange Topology
- **Exchange**: `xennic.factory` (type: `topic`)
- **Routing keys**: `factory.{service}.{event}.v{version}`
- **One queue per service** (competing consumers pattern)
- **Dead letter exchange**: `xennic.factory.dlq`

### 5.3 Delivery Guarantees
- Publisher confirms (at-least-once delivery)
- Consumer acknowledgements (manual ack)
- Rejected messages → DLQ after 3 retries
- DLQ TTL: 7 days (manual replay or discard)

---

## 6. Pipeline Orchestration

The factory pipeline is **event-driven by default, orchestrated on demand**.

- **Default mode**: Each stage subscribes to the previous stage's event.
  No central orchestrator needed for standard flow.

- **Re-processing mode**: An Orchestrator Service can replay documents through
  specific stages (e.g., re-embed after model upgrade).

- **Backfill mode**: Bulk re-processing of all documents after a pipeline
  version change (see `runtime/pipeline-versioning.md`).

### 6.1 Orchestrator Service (Future)

When the factory scales beyond simple linear pipelines, an Orchestrator Service
will manage:
- Conditional branching (skip chunk if already chunked)
- Parallel processing (resolve + normalize concurrently)
- Pipeline version migration
- Batch operations
- SLA monitoring per document

---

## 7. Multi-Tenancy Architecture

XKF inherits the workspace-based multi-tenancy from the platform.

### 7.1 Isolation Levels

| Level | Storage | Compute | Use Case |
|-------|---------|---------|----------|
| **Shared** | Shared PG + Qdrant (filtered) | Shared workers | Default for small tenants |
| **Dedicated** | Isolated Qdrant collection + PG schema | Reserved workers | Enterprise tenants |
| **Air-gapped** | Entirely separate deployment | Isolated cluster | Classified / compliance |

### 7.2 Tenant Context Propagation

```
Request → NestJS Auth → Extract workspace_id
  → Inject into TenantContext (AsyncLocalStorage)
  → Pass as header to factory services
  → Filter queries in PG, Qdrant, KG
  → Tag all events with workspace_id
```

---

## 8. Cost Model

The factory operations have a cost associated with each stage:

| Stage | Cost Driver | Estimated Cost/Doc |
|-------|-------------|-------------------|
| Intake | Storage, bandwidth | $0.001 |
| Classify | AI model inference | $0.005 |
| Parse (OCR) | Compute (GPU if vision) | $0.02 |
| Extract | LLM tokens | $0.05 |
| Resolve | DB lookups | $0.002 |
| Embed | GPU inference | $0.003 |
| Publish | Storage (vector + graph) | $0.001 |

Total estimated cost per document: **~$0.08** (at scale).
These costs inform the platform subscription tiers.
