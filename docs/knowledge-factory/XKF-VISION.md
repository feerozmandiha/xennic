# Xennic Knowledge Factory (XKF) — Vision & Philosophy

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## 1. The Manifesto

Engineering knowledge is the most valuable asset an engineering firm possesses.
Yet it remains trapped in PDFs, scattered across hard drives, and locked inside
the heads of senior engineers. The Xennic Knowledge Factory exists to liberate
this knowledge.

**XKF is not a document management system.**
**XKF is not a search engine.**
**XKF is not an AI chatbot.**

XKF is a **knowledge refinery**: it takes raw engineering documents in any
format, extracts structured engineering knowledge, validates it against
engineering truth, enriches it with semantic context, stores it in a form that
both humans and machines can reason over, and delivers it at the moment an
engineer needs it — not as a document link, but as an **answer**.

---

## 2. Core Philosophy

### 2.1 Knowledge is a Product, Not a Byproduct

Every document that enters XKF is treated as raw material. The output is a
knowledge product — verified, cited, versioned, and ready for engineering
decision-making.

### 2.2 Truth is Hierarchical

Not all knowledge is equally true. A IEC standard outranks a manufacturer
datasheet. A verified calculation outranks an LLM guess. XKF enforces a
source-trust hierarchy (see `governance/source-hierarchy.md`) at every stage
of the pipeline.

### 2.3 Engineering is Bilingual

Persian (Farsi) is not an afterthought. XKF is designed bilingual from the
ground up — concept registry, synonym dictionary, full-text search, LLM
prompts, and user interfaces all operate natively in both FA and EN.

### 2.4 Design for Replaceability

Every component in XKF has a defined interface. The embedding model can be
swapped. The LLM can be swapped. The vector database can be swapped.
Interfaces are contracts. Implementations are replaceable.

### 2.5 Traceability Above All

Every knowledge artifact in XKF carries a provenance chain: which document
it came from, which pipeline version processed it, which model extracted it,
which engineer validated it, and which AI service used it. No orphan knowledge.

### 2.6 Offline-First Curation

AI accelerates but does not replace engineering judgment. The best engineering
knowledge is curated by engineers. XKF's AI pipeline produces candidates;
human reviewers confirm truths. The factory runs in semi-autonomous mode until
trust thresholds are met.

---

## 3. The Factory Metaphor

```
  Raw Materials ──► Intake ──► Refining ──► Quality ──► Storage ──► Distribution
  (Documents)       (OCR)     (Extract)    (Verify)    (Vector)    (Answers)
                     Parse     Resolve      Validate    Graph       Search
                     Classify  Normalize    Review      Warehouse   Reasoning
```

| Factory Stage | Knowledge Equivalent |
|---------------|---------------------|
| Raw Materials | Incoming documents (PDF, DOCX, HTML, DWG, scanned) |
| Intake & Sorting | Document ingestion, OCR, format detection, classification |
| Refining | Entity extraction, concept resolution, relationship mapping, semantic normalization |
| Quality Control | Validation against governance, source hierarchy, confidence scoring, human review |
| Warehouse | Vector database (Qdrant), Knowledge Graph (Neo4j or similar), Metadata store (PostgreSQL) |
| Distribution | RAG retrieval, AI reasoning, engineering calculation, API delivery |

---

## 4. Design Principles

| # | Principle | Implication |
|---|-----------|-------------|
| 1 | **Single source of truth** | Every fact exists in exactly one canonical location |
| 2 | **Immutable event log** | All state changes are recorded; no destructive updates |
| 3 | **Defined interfaces** | Every service communicates via documented contracts |
| 4 | **Bounded contexts** | Each domain owns its data; no shared mutable state |
| 5 | **Chaos-ready** | The factory degrades gracefully when any component fails |
| 6 | **Observable by default** | Every operation emits structured telemetry |
| 7 | **Security at every layer** | Authentication, authorization, encryption at rest and in transit |
| 8 | **Tenant-isolated** | Every workspace sees only its own knowledge artifacts |
| 9 | **Versioned knowledge** | Every knowledge object has a version history |
| 10 | **Cost-aware retrieval** | The factory balances retrieval quality against computational cost |

---

## 5. Architectural Boundaries

### What XKF IS responsible for:

- Ingesting documents from any source (upload, API, crawl, webhook)
- Extracting structured engineering knowledge from unstructured content
- Resolving extracted terms against canonical concept registries
- Normalizing units, synonyms, and terminology across languages
- Validating knowledge quality against governance policies
- Storing knowledge in vector, graph, and relational stores
- Retrieving knowledge in response to engineering queries
- Reasoning over knowledge to produce engineering conclusions
- Tracking knowledge provenance and lifecycle
- Exposing knowledge via APIs for consumption by applications and AI

### What XKF IS NOT responsible for:

- Business logic of specific engineering calculations (handled by Engineering Service)
- User interface rendering (handled by Web and Mobile apps)
- Payment processing (handled by Billing Service)
- User identity management (handled by Auth Service)
- General-purpose file storage (handled by MinIO / Storage Service)
- Real-time collaboration (handled by Collaboration Service)
- External communication (email, SMS, notifications)

---

## 6. Relationship to Existing Documentation

| Existing Document | XKF Relationship |
|------------------|------------------|
| `knowledge/governance/*` | **Foundation** — XKF enforces governance rules as pipeline policies |
| `knowledge/concepts/concept-model.md` | **Core Domain** — XKF realizes the concept model as operational services |
| `knowledge/semantics/*` | **Core Domain** — XKF implements semantic resolution as pipeline stages |
| `knowledge/runtime/*` | **Predecessor** — XKF supersedes runtime architecture as the master design |
| `knowledge/reasoning/*` | **Downstream** — XKF feeds the reasoning runtime with validated knowledge |
| `knowledge/ai-intelligence/*` | **Downstream** — XKF produces the evidence chains AI intelligence consumes |
| `apps/api/` (NestJS) | **Gateway** — XKF is accessed through the existing API |
| `workspace/services/*` | **Implementation** — XKF microservices follow the patterns established |

---

## 7. Success Criteria

| Metric | Target (Alpha) | Target (Beta) | Target (GA) |
|--------|---------------|---------------|-------------|
| Document intake throughput | 100/day | 1,000/day | 10,000/day |
| End-to-end pipeline latency | <5 min/doc | <2 min/doc | <30 sec/doc |
| Concept extraction accuracy | >80% | >90% | >95% |
| Retrieval precision (Recall@5) | >0.7 | >0.85 | >0.95 |
| AI hallucination rate | <15% | <8% | <3% |
| Human review coverage | 100% | 50% | 10% (continuous) |
| Query response time (p95) | <3s | <1.5s | <500ms |
| System uptime | 99.0% | 99.5% | 99.9% |
| Supported document formats | 5 | 15 | 30+ |

---

## 8. Guiding Architectural Questions

Every architectural decision in XKF must answer these four questions:

1. **Does this preserve the provenance chain?** — Can I trace this output back
   to its source document, pipeline version, and processing parameters?

2. **Does this respect the source hierarchy?** — Is the knowledge's authority
   level properly represented and enforced?

3. **Does this work bilingually?** — Is the Persian-language use case treated
   as first-class, not as a translation of English?

4. **Does this degrade gracefully?** — If a dependency fails, do we return
   cached data, a degraded answer, or a clear error — never garbage?
