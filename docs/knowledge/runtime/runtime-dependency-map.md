# نقشه وابستگی‌های رانتایم — Runtime Dependency Map

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## 1. وابستگی‌های سرویس — Service Dependencies

| Service | Depends On | Dependency Type | Impact if Unavailable |
|---------|-----------|----------------|----------------------|
| **Ingestion Service** | Object Storage (MinIO), Event Bus (RabbitMQ) | Hard | Document receipt and queuing blocked entirely |
| **OCR Processor** | Vision Service, Object Storage | Hard | Scanned documents cannot be processed; text documents unaffected |
| **Parser Processor** | Object Storage | Hard | Structured documents cannot be extracted |
| **Cleaner Processor** | None | None | No external dependencies; operates on in-memory text |
| **Metadata Builder** | Knowledge API (taxonomy API) | Soft | Falls back to local cache; partial metadata with warning |
| **Concept Resolver** | AI Service (LLM) | Soft | Falls back to pattern matching; reduced accuracy |
| **Entity Extractor** | AI Service, Knowledge Graph | Soft | Falls back to regex extraction; reduced recall |
| **Embedding Generator** | AI Service (embedding model) | Hard | Embedding generation blocked; publication cannot proceed |
| **Vector Publisher** | Qdrant | Hard | Vector storage blocked; vector search unavailable |
| **Graph Publisher** | Knowledge Graph (Neo4j/Age) | Hard | Graph storage blocked; graph queries unavailable |
| **Validation Service** | Knowledge API (existing KB lookup) | Soft | Falls back to local validation rules; reduced consistency checks |
| **Human Review Interface** | PostgreSQL, Event Bus | Hard | Review queue inaccessible; human-in-the-loop blocked |
| **Publication Coordinator** | All publication targets (Qdrant, Neo4j, Knowledge API, Search) | Hard | Knowledge publication blocked; documents stuck in final stage |
| **Lifecycle Manager** | PostgreSQL, Event Bus | Hard | Knowledge updates, deprecation, and archival blocked |

### Dependency Legend

| Type | Meaning | Behaviour on Failure |
|------|---------|---------------------|
| **Hard** | Service cannot function without this dependency | Pipeline halts; document enters retry or DLQ |
| **Soft** | Service degrades gracefully without this dependency | Falls back to alternative; warning logged; document continues |
| **None** | No external dependencies; fully self-contained | Always available as long as service is running |

---

## 2. وابستگی‌های خط لوله — Pipeline Dependencies

### Full Processing DAG

```
DocumentUploaded
       │
       ▼
  ┌────┴────┐
  ▼         ▼
(OCR)    (Parser)      ← parallel if scanned + text
  │         │
  └────┬────┘
       ▼
    Cleaner
       │
       ▼
 Metadata Builder
       │
       ▼
  ┌────┴────┐
  ▼         ▼
Concept    Ontology       ← parallel (independent)
Resolver   Resolver
  │         │
  └────┬────┘
       ▼
Semantic Resolution
  (Vocabulary + Synonym)
       │
       ▼
  ┌────┴────┐
  ▼         ▼
Entity     Relationship   ← parallel (semi-independent)
Extractor  Extractor
  │         │
  └────┬────┘
       ▼
Unit Normalizer
       │
       ▼
Chunk Generator
       │
       ▼
  ┌────┴────┐
  ▼         ▼
Chunk 1   Chunk N        ← parallel (per chunk)
  │         │
  └────┬────┘
       ▼
Embedding Generator
       │
       ▼
Vector Publisher         ← parallel if...
       │                  ...graph also ready
       ▼
Graph Publisher
       │
       ▼
Publication Coordinator
       │
       ▼
  ┌────┴────┐
  ▼         ▼
Knowledge   Search       ← parallel (independent)
API        Engine
  │
  ▼
KnowledgePublished
```

---

## 3. ترتیب اجرا — Execution Order

| Order | Stage | Dependencies | Parallelism |
|-------|-------|-------------|-------------|
| 1 | OCR | Uploaded scanned document | Parallel with Parser |
| 2 | Parser | Uploaded text document | Parallel with OCR |
| 3 | Cleaner | OCR output / Parser output | Sequential (after both complete) |
| 4 | Metadata Builder | Cleaned text | Sequential |
| 5a | Concept Resolver | Metadata | **Parallel branch** with Ontology |
| 5b | Ontology Resolver | Metadata | **Parallel branch** with Concept |
| 6 | Semantic Resolution | Concept + Ontology | **Join point** (both required) |
| 7a | Entity Extractor | Semantic output | **Parallel branch** with Relationship |
| 7b | Relationship Extractor | Semantic output | **Parallel branch** with Entity |
| 8 | Unit Normalizer | Entities + Relationships | **Join point** (both required) |
| 9 | Chunk Generator | Normalized output | Sequential |
| 10a | Embedding — Chunk 1 | Chunk N first chunk | **Parallel** with other chunks |
| 10b | Embedding — Chunk N | Chunk N | **Parallel** per chunk |
| 11 | Vector Publisher | All embeddings | Sequential (all embeddings ready) |
| 12 | Graph Publisher | Vector publication | **Parallel** with... |
| 13 | Publication Coordinator | Vector + Graph | **Join point** (both required) |
| 14 | Knowledge API Publish | Coordinator signal | **Parallel** with Search |
| 15 | Search Engine Publish | Coordinator signal | **Parallel** with Knowledge API |
| 16 | Cache Invalidation | Publication complete | Sequential (after both publish) |

---

## 4. فرصت‌های موازی‌سازی — Parallel Opportunities

| # | Parallel Group | Stages | Condition | Benefit |
|---|---------------|--------|-----------|---------|
| 1 | OCR + Parser | OCR, Parser | Document has both scanned pages and embedded text | Reduces wall-clock time for mixed documents |
| 2 | Concept + Ontology | Concept Resolver, Ontology Resolver | Independent — neither depends on the other | 50% reduction in semantic pre-processing time |
| 3 | Entity + Relationship | Entity Extractor, Relationship Extractor | Semi-independent — Entity Extractor preferred first as Relationship Extractor consumes entities | Up to 40% time savings |
| 4 | Multi-chunk embedding | Embedding Generator per chunk | Chunks are independent — no cross-chunk dependencies | Linear speedup with chunk count up to available workers |
| 5 | Vector + Graph publish | Vector Publisher, Graph Publisher | Independent storage targets | Reduces publication phase by ~60% |

---

## 5. مسیر بحرانی — Critical Path

The longest dependency chain determines the minimum end-to-end processing time:

```
Upload → Parser → Cleaner → Metadata → Concept → Semantic → Entity → Chunk → Embedding → Vector → Publication
```

| Segment | Estimated Duration | Notes |
|---------|-------------------|-------|
| Upload + validation | 1–5 s | Negligible for most documents |
| Parser | 2–30 s | Varies by document length and format complexity |
| Cleaner | 1–5 s | Linear in text length |
| Metadata Builder | 1–3 s | Taxonomy lookup if cache cold |
| Concept Resolver | 3–30 s | LLM call or pattern matching |
| Semantic Resolution | 2–15 s | Synonym + acronym resolution |
| Entity Extractor | 5–30 s | LLM-bound for complex documents |
| Chunk Generator | 1–5 s | Linear in document length |
| Embedding Generator | 5–60 s | GPU-bound; dominant cost for large documents |
| Vector Publisher | 1–5 s | Qdrant write latency |
| Publication Coordinator | 1–3 s | Consistency checks + API calls |
| **Total (estimated minimum)** | **30–120 s** | Per document — varies by size, complexity, and OCR requirement |

### Impact of OCR on Critical Path

| Scenario | Critical Path | Wall-Clock Time |
|----------|--------------|-----------------|
| Text-only document | Parser → … → Publication | 30–90 s |
| Scanned document | OCR → … → Publication | 60–180 s |
| Mixed (scanned + text) | OCR (parallel with Parser) → … → Publication | 60–150 s |

---

## 6. مؤلفه‌های مسدودکننده — Blocking Components

| Component | Blocks What | Reason | Workaround |
|-----------|------------|--------|------------|
| **OCR Processor** | All downstream stages for scanned documents | Scanned text must be extracted before any processing can begin | None — no alternative text source |
| **Embedding Generator** | Publication (vector, graph, API) | Knowledge cannot be published without vector embeddings | None — embeddings are mandatory for RAG retrieval |
| **Publication Coordinator** | All publication targets | Consistency requirement — all targets must be updated atomically from the coordinator's perspective | None — rollback is the only recovery mechanism |
| **Human Review** | Documents that fail validation or have low confidence | Documents cannot proceed to publication without human approval for flagged items | Manual override by senior reviewer |

---

## 7. مؤلفه‌های غیرمسدودکننده — Non-Blocking Components

| Component | Behaviour When Unavailable | Fallback Mechanism | Quality Impact |
|-----------|---------------------------|-------------------|----------------|
| **Concept Resolver** | Falls back to pattern matching | Regex-based concept identification from canonical concept registry | Lower precision and recall (estimated ~15–25% reduction) |
| **Metadata Builder** | Falls back to local taxonomy cache | Serves metadata from last-known-good taxonomy snapshot | May use outdated taxonomy (stale within days of taxonomy update) |
| **Validation Service** | Falls back to local validation rules | Embedded rule set without external KB lookup | Reduced cross-document consistency validation |
| **Entity Extractor** | Falls back to regex patterns | Regex-based entity identification from known patterns | Lower recall on non-standard entity formats |
| **Graph Publisher** | Deferred to retry queue | Document published to vector DB; graph update queued for when graph DB returns | Graph queries temporarily inconsistent with vector search results |
| **Search Engine Index** | Deferred to retry queue | Knowledge API serves as fallback retrieval source | Slightly higher latency for search queries until index is rebuilt |
