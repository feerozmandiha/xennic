# رانتایم کسب دانش — Knowledge Acquisition Runtime

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## Purpose — هدف

The Knowledge Acquisition Runtime transforms raw engineering documents (standards, catalogs, tariffs, regulations) into **validated Engineering Knowledge Objects** ready for consumption by AI services, search engines, and engineering applications. It is the operational engine of the Xennic knowledge platform, orchestrating the end-to-end pipeline from ingestion to publication.

**Core function:** Bridge the gap between unstructured source documents and structured, graph-ready, machine-readable engineering knowledge.

---

## Relationship to Adjacent Knowledge Domains — ارتباط با دامنه‌های مجاور

| Domain | Document | Relationship |
|--------|----------|--------------|
| **K1.1 Governance** | `governance/acquisition-policy.md` | Acquisition policy defines what may enter; runtime enforces the policy during ingestion and validation |
| **K1.1 Governance** | `governance/metadata-schema.md` | Runtime constructs metadata per the universal metadata schema; every published knowledge object carries governance-compliant metadata |
| **K1.1 Governance** | `governance/source-hierarchy.md` | Source tier compliance is validated during the Engineering Validation stage; tier-appropriate citations are enforced |
| **K1.1 Governance** | `governance/data-quality-policy.md` | Quality gates throughout the lifecycle align with data quality thresholds |
| **K1.5 Concepts** | `concepts/concept-model.md` | Concept and entity extraction reference the formal concept model; extracted concepts become graph nodes |
| **K1.5 Concepts** | `concepts/canonical-concepts.md` | Extracted terms are resolved against the canonical concept registry |
| **K1.5 Concepts** | `concepts/engineering-entities.md` | Entity extraction identifies equipment, standards, and manufacturers per the entity model |
| **K1.5 Concepts** | `concepts/engineering-relations.md` | Relationship extraction maps entity connections per the relation taxonomy |
| **K1.7 Semantics** | `semantics/engineering-vocabulary.md` | Semantic resolution uses the bilingual vocabulary for term normalization |
| **K1.7 Semantics** | `semantics/acronym-dictionary.md` | Acronym expansion resolves abbreviations during semantic resolution |
| **K1.7 Semantics** | `semantics/unit-normalization.md` | Unit fields are normalized to SI/canonical forms |
| **AI Intelligence** | `ai-intelligence/confidence-scoring.md` | AI Service computes confidence scores per the confidence framework |
| **AI Intelligence** | `ai-intelligence/evidence-chain.md` | Evidence chains for extracted knowledge follow the AI intelligence model |

---

## Directory Map — نقشه دایرکتوری

```
runtime/
├── README.md                       # این سند — نمای کلی دامنه رانتایم
├── runtime-overview.md             # معماری رانتایم — Runtime Architecture Overview
├── document-lifecycle.md           # چرخه حیات سند — Document Lifecycle
├── event-driven-architecture.md    # معماری رویدادمحور — Event-Driven Architecture
├── ingestion-runtime.md            # رانتایم دریافت — Ingestion Runtime
├── processing-runtime.md           # رانتایم پردازش — Processing Runtime
├── validation-runtime.md           # رانتایم اعتبارسنجی — Validation Runtime
├── publication-runtime.md          # رانتایم انتشار — Publication Runtime
├── runtime-observability.md        # مشاهده‌پذیری رانتایم — Runtime Observability
├── performance-strategy.md         # راهبرد عملکرد — Performance Strategy
├── scalability-strategy.md         # راهبرد مقیاس‌پذیری — Scalability Strategy
├── pipeline-versioning.md          # نسخه‌بندی پایپ‌لاین — Pipeline Versioning
```

### Planned Files (Future)

| File | Description | Sprint |
|------|-------------|--------|
| `ocr-service.md` | OCR Service — استخراج متن از اسناد اسکن‌شده | K1.8 |
| `parser-service.md` | Parser Service — تجزیه فرمت‌های مختلف اسناد | K1.8 |
| `metadata-service.md` | Metadata Service — ساخت و مدیریت فراداده | K1.8 |
| `concept-resolver.md` | Concept Resolver — شناسایی و تفکیک مفاهیم مهندسی | K1.9 |
| `entity-extractor.md` | Entity Extractor — استخراج موجودیت‌های مهندسی | K1.9 |
| `relationship-extractor.md` | Relationship Extractor — استخراج روابط بین موجودیت‌ها | K1.9 |
| `unit-normalizer.md` | Unit Normalizer — یکسان‌سازی واحدهای اندازه‌گیری | K1.9 |
| `chunk-generator.md` | Chunk Generator — تولید قطعات بهینه برای RAG | K1.10 |
| `embedding-service.md` | Embedding Service — تولید بردارهای Embedding | K1.10 |
| `orchestrator.md` | Orchestrator — هماهنگ‌کننده جریان کار | K1.11 |
| `event-bus.md` | Event Bus — رویدادهای ناهمگام بین سرویس‌ها | K1.11 |

---

## Runtime at a Glance — نمای کلی رانتایم

The runtime orchestrates a high-level flow across four phases:

| Phase | Description | Key Services |
|-------|-------------|--------------|
| **Ingestion** | Receive, validate integrity, virus-scan, and track documents | Ingestion Service, Event Bus |
| **Processing** | Extract text (OCR), parse format, clean, build metadata, extract concepts and entities | Processing Service, OCR Service, Parser Service, Metadata Service, Concept Resolver, Entity Extractor, Relationship Extractor, Unit Normalizer |
| **Validation** | Multi-layer validation of engineering correctness, knowledge consistency, and quality thresholds | Validation Service |
| **Publication** | Generate chunks, embed, publish to vector DB, knowledge graph, and Knowledge API | Chunk Generator, Embedding Service, Publication Service |

---

## Key Design Principles — اصول طراحی کلیدی

| Principle | Description |
|-----------|-------------|
| **Auditability** | Every operation is logged with full provenance; every knowledge object is traceable to source documents and processing steps |
| **Explainability** | All extraction, resolution, and validation decisions include reasoning context; AI Service outputs include confidence scores and evidence chains |
| **Scalability** | Event-driven architecture with horizontally scalable services; each stage can be independently scaled based on workload |
| **Event-Driven** | Services communicate asynchronously via RabbitMQ; pipeline stages are decoupled and can be parallelised |
| **Human-in-the-Loop** | Low-confidence results are flagged for human review; validation gates can require manual approval before publication |

---

## Future AI Compatibility — سازگاری با قابلیت‌های آینده

The runtime is architected for seamless integration with Xennic's AI roadmap:

| Capability | Readiness | Integration Point |
|------------|-----------|-------------------|
| **AI Service** | ✅ Designed | LLM-based extraction, semantic enrichment, quality scoring |
| **Graph RAG** | ✅ Designed | Knowledge graph construction from extracted entities and relationships |
| **Vector RAG** | ✅ Designed | Embedding generation and Qdrant vector store integration |
| **Hybrid Retrieval** | ✅ Designed | Combined vector + graph query infrastructure |
| **Knowledge Graph** | ✅ Designed | Neo4j/Age nodes and edges from extraction pipeline |
| **Vision Service** | ✅ Designed | OCR pipeline for scanned document processing |
| **Multi-Agent Architecture** | ✅ Designed | Event bus decoupling enables distributed agent coordination |
| **Reasoning Engine** | ✅ Designed | Concept and relationship extraction feeds rule-based inference |
| **Expert Systems** | ✅ Designed | Structured knowledge output compatible with expert system shells |
| **Digital Twin** | ✅ Designed | Published knowledge objects serve as semantic layer for digital twin models |
| **Predictive Analytics** | ✅ Designed | Historical knowledge states and lifecycle data enable trend analysis |

---

## Status — وضعیت جاری

| Aspect | Status | Description |
|--------|--------|-------------|
| **K1.8 Sprint** | 🔄 Planned | Foundation sprint — core pipeline services (ingestion, processing, validation, publication) |
| **Runtime Overview** | ✅ Defined | `runtime-overview.md` defines architecture, boundaries, and service topology |
| **Document Lifecycle** | ✅ Defined | `document-lifecycle.md` defines all 21 stages with quality gates and policies |
| **Service Specs** | 📋 Planned | Detailed service specifications in K1.8–K1.11 |
| **Event Schema** | 📋 Planned | Event definitions and message contracts for RabbitMQ |
| **Deployment** | 📋 Planned | Container orchestration and scaling configuration |
