# Xennic Knowledge Factory (XKF) — Integration Architecture

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## 1. Integration Philosophy

The XKF does not replace existing components — it **orchestrates** them.
Every integration is defined by a **contract** (API schema, event format, or
shared data model). The factory depends on existing governance for policy,
on existing NestJS services for user-facing operations, and on existing
infrastructure for storage and compute.

---

## 2. Integration: Knowledge Governance

### 2.1 Governance Documents Enforced

| Governance Document | How XKF Enforces It |
|--------------------|---------------------|
| `metadata-schema.md` | Every EKO validates against the universal metadata schema before publication |
| `taxonomy.md` | Classify Service assigns taxonomy labels; Publish Service verifies completeness |
| `ontology.md` | Resolve Service maps entities per the ontology; Extract Service validates relationships |
| `naming-conventions.md` | All EKO IDs, file names, and metadata keys follow naming conventions |
| `data-quality-policy.md` | Quality Gates implement the policy thresholds and scoring formula |
| `source-hierarchy.md` | All EKOs carry source tier; reasoning engine uses tier for conflict resolution |

### 2.2 Governance Integration Points

```
Governance Docs ──► Policy Engine ──► Factory Pipeline
                      │
                      ├── QG-1: Validate metadata schema
                      ├── QG-2: Validate taxonomy assignment
                      ├── QG-3: Validate naming conventions
                      ├── QG-4: Validate source hierarchy
                      └── QG-5: Validate quality score threshold
```

---

## 3. Integration: AI Service

### 3.1 AI Service Role

The AI Service (`workspace/services/ai-service`, port 8002) provides LLM-powered
extraction, classification, and enrichment capabilities to the factory.

### 3.2 Factory ↔ AI Service Contract

| Factory Service | AI Service Endpoint | Purpose |
|----------------|---------------------|---------|
| Classify Service | `POST /classify` | Classify document type, domain, language |
| Extract Service | `POST /extract/concepts` | Extract entities and concepts from text |
| Extract Service | `POST /extract/relations` | Extract relationships between entities |
| Extract Service | `POST /extract/formulas` | Identify mathematical formulas |
| Resolve Service | `POST /resolve` | Map extracted terms to canonical forms |
| Enrich Service | `POST /enrich/summarize` | Generate bilingual summaries |
| Enrich Service | `POST /enrich/tag` | Suggest additional tags and cross-references |

### 3.3 AI Service Caching

The AI Service maintains a **semantic cache** (Redis) to avoid redundant LLM
calls. When the same extraction task is requested (identical text + model +
parameters), the cached result is returned. Cache TTL: 24 hours.

### 3.4 AI Service Fallback Strategy

| Scenario | Fallback |
|----------|----------|
| LLM provider unavailable | Return cached result; if no cache, return rule-based extraction |
| LLM timeout (>30s) | Return partial extraction; escalate to human review |
| Confidence below threshold | Return extraction with warning; escalate to human review |
| Rate limit exceeded | Queue request; retry with exponential backoff |

---

## 4. Integration: Engineering Runtime

### 4.1 Engineering Service Role

The Engineering Service (`workspace/services/engineering-service`, port 8001)
provides deterministic engineering calculations. The factory integrates these
calculations as EKOs of kind `CALCULATION`.

### 4.2 Integration Points

| Integration | Direction | Mechanism |
|-------------|-----------|-----------|
| Publish calculation results | Engineering → Factory | NestJS API event |
| Reference calculation metadata | Factory → Engineering | Shared concept registry |
| Execute published calculation | Engineering → Factory | Engine reads EKO formula |

### 4.3 Calculation as EKO

When a calculation is performed in the Engineering Service, the result can be
published as a `CALCULATION` EKO:

```json
{
  "kind": "CALCULATION",
  "content": {
    "primary": "جریان اتصال کوتاه در نقطه PCC: 12.47 کیلوآمپر",
    "translation": "Short-circuit current at PCC: 12.47 kA",
    "structured": {
      "inputs": { "voltage": 20000, "impedance": 0.925 },
      "outputs": { "I_sc": 12470, "unit": "A" },
      "formula": "I_sc = V / (√3 × Z)",
      "standard": "IEC 60909"
    }
  }
}
```

---

## 5. Integration: Graph RAG

### 5.1 Knowledge Graph Structure

XKF maintains a Knowledge Graph (KG) that stores:
- **Entities**: Equipment types, standards, manufacturers, documents, engineers
- **Concepts**: Canonical engineering concepts from the concept registry
- **Relationships**: `derives_from`, `refers_to`, `constrains`, `exemplifies`
- **Hierarchies**: Taxonomy trees, standard-composes-standard

### 5.2 Graph RAG Query Flow

```
User Query
    │
    ▼
┌──────────────┐
│  Query       │  Parse query → identify entities + intent
│  Analyzer    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Graph       │  Traverse KG: find related entities, paths,
│  Traverser   │  infer relationships relevant to query
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Vector      │  Retrieve chunks from Qdrant using query
│  Retriever   │  + graph context as boost terms
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Fusion      │  Merge graph paths + vector chunks
│  Engine      │  Deduplicate, rank, format
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  LLM         │  Generate answer with citations
│  Generator   │
└──────┬───────┘
       │
       ▼
    Answer + Evidence
```

### 5.3 Graph ↔ Vector Fusion Strategy

| Query Type | Primary Retriever | Secondary Retriever |
|------------|-------------------|---------------------|
| Factual lookup | Graph | Vector |
| Comparative analysis | Graph | Vector |
| Open-ended question | Vector | Graph |
| "How to" / procedure | Vector | Graph |
| Standards compliance | Graph | Vector |
| Troubleshooting | Vector | Graph |

---

## 6. Integration: Vector Search

### 6.1 Vector Store Contract

- **Technology**: Qdrant
- **Collection naming**: `xennic_{workspace_id}_{language}`
- **Embedding dimensions**: 1024 (multilingual-e5-large)
- **Distance metric**: Cosine
- **Payload fields**: All EKO metadata for filtering

### 6.2 Hybrid Search Strategy

```
Query ──► Dense Retriever ──► cosine similarity ──► Ranked chunks
          ┌────────────────────────────────────────────────┐
          │                  FUSION                         │
          │   Reciprocal Rank Fusion (RRF)                 │
          │   k = 60   weight_dense = 0.7                  │
          │            weight_sparse = 0.3                 │
          └────────────────────────────────────────────────┘
Query ──► Sparse Retriever ──► BM25 ──► Ranked chunks
```

### 6.3 Embedding Model Strategy

| Phase | Model | Dimensions | Purpose |
|-------|-------|-----------|---------|
| Current | `intfloat/multilingual-e5-large` | 1024 | Production (bilingual) |
| Evaluation | `BAAI/bge-m3` | 1024 | Candidate (potentially faster) |
| Future | Custom fine-tuned on engineering corpus | TBD | Domain-optimized |

---

## 7. Integration: Metadata System

### 7.1 Metadata Flow

```
Document Upload
    │
    ▼
┌─────────────────┐
│  Intake Service  │  Extract: filename, size, format, checksum
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Classify Service│  Assign: domain, type, tier, application, language
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Extract Service │  Generate: AI confidence, evidence count, review status
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Chunk Service   │  Record: chunk count, chunk strategy
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Embed Service   │  Record: embedding model, dimension, rerank score
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Enrich Service  │  Add: related documents, citations, provenance chain
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Publish Service │  Validate: all metadata fields complete per schema
└─────────────────┘
```

### 7.2 Metadata Validation

Every EKO must pass metadata validation before publication, checking:
1. All required fields populated (from `metadata-schema.md`)
2. Enum values valid
3. Timestamps in ISO 8601 UTC
4. UUIDs in correct format
5. JSON fields validatable against schema

---

## 8. Integration: Future Knowledge Sources

### 8.1 Source Adapter Pattern

Every future knowledge source implements a common adapter interface:

```typescript
interface KnowledgeSourceAdapter {
  // Metadata
  sourceType: SourceType;
  supportedFormats: Format[];
  authentication: AuthMethod;

  // Operations
  fetch(sourceConfig: SourceConfig): AsyncIterator<RawDocument>;
  validate(document: RawDocument): ValidationResult;
  transform(document: RawDocument): StagedDocument;
}
```

### 8.2 Planned Source Adapters

| Source | Adapter | Priority | Notes |
|--------|---------|----------|-------|
| Web crawl | WebAdapter | Beta | Standards bodies, manufacturer sites |
| Email attachment | EmailAdapter | Beta | Inbound email ingestion |
| API integration | APIAdapter | Beta | Third-party engineering platforms |
| RSS/Atom feeds | FeedAdapter | Beta | News, updates from standards orgs |
| FTP/SMB share | FileShareAdapter | Beta | Legacy file servers |
| Google Drive | DriveAdapter | GA | Cloud storage integration |
| SharePoint | SPAdapter | GA | Enterprise document management |

---

## 9. Integration: Existing NestJS Modules

### 9.1 NestJS ↔ Factory Mapping

| NestJS Module | Factory Integration | Direction |
|---------------|--------------------|-----------|
| `KnowledgeModule` | Primary gateway for CRUD | NestJS → Factory |
| `EngineeringModule` | Calculation EKO publication | Engineering → NestJS → Factory |
| `AiModule` | Conversation context from EKOs | Factory → NestJS → AI |
| `SearchModule` | Hybrid search across stores | NestJS → Factory (read) |
| `StorageModule` | File persistence and retrieval | NestJS ↔ MinIO |
| `NotificationsModule` | Pipeline status notifications | Factory → NestJS → User |
| `WorkspacesModule` | Tenant context for isolation | Workspace → Factory |
