# Knowledge Intelligence Layer Architecture

> **Runtime qualification (audited 2026-08-19):** Knowledge Intelligence is active with 28 guarded HTTP routes and a management console. Knowledge CMS publish/archive events now synchronize article graph projections. Knowledge Factory remains dormant, there is no generic graph-node/edge CRUD controller, and the graph-search endpoint does not execute the target FTS/Qdrant/RRF pipeline shown below. Treat target diagrams separately from the source-backed inventory in [knowledge-runtime-audit.md](./knowledge-runtime-audit.md).

**Document ID:** XEN-ARCH-KIL-001  
**Date:** 2026-07-04  
**Status:** Approved  
**Phase:** PHASE K — Knowledge Intelligence Layer  
**Supersedes:** None

---

## 1. Purpose

The Knowledge Intelligence Layer is the semantic reasoning layer of the Xennic platform. It sits between the **Knowledge Factory** (document ingestion and publishing) and the **AI Runtime** (conversational agents and tool execution).

This layer is **NOT** a document database.  
This layer is **NOT** a vector store.

It is a **semantic reasoning layer** that transforms raw data and documents into a living, connected knowledge graph with reasoning capabilities, quality metrics, and rich APIs for downstream AI consumption.

---

## 2. Architecture Overview

```
┌─────────────────────┐
│   Knowledge Factory │╌╌╌▶ Target extraction flow ╌╌▶ Knowledge Graph
│     (Dormant)       │                               │
└─────────────────────┘                               ▼
                                                      ┌─────────────────────┐
┌─────────────────────┐                               │  Knowledge           │
│   Knowledge CMS     │───▶ Lifecycle event projection ▶│  Intelligence Layer │
│  (Articles/Taxonomy)│                               │                     │
└─────────────────────┘                               │  • Graph Traversal  │
                                                      │  • Reasoning        │
┌─────────────────────┐                               │  • Metrics          │
│   Engineering       │───▶ Calculation/Standard Link ─▶│  • Ontology         │
│   Service           │                               │  • Search           │
└─────────────────────┘                               └─────────┬───────────┘
                                                                    │
                                                                    ▼
                                                         ┌─────────────────────┐
                                                         │   AI Runtime        │
                                                         │ (Consumes KIL APIs) │
                                                         │  No direct DB/vector │
                                                         │  store access        │
                                                         └─────────────────────┘
```

---

## 3. Core Capabilities Mapping

| Capability                             | Implementation                                                   | Location                     |
| -------------------------------------- | ---------------------------------------------------------------- | ---------------------------- |
| **Knowledge Graph**                    | `knowledge_graph_nodes`, `knowledge_graph_edges`                 | Prisma models                |
| **Semantic Relationships**             | `graph_edges` with typed relations                               | `GraphEdgeRepository`        |
| **Citation Graph**                     | `knowledge_citations` table + `CitationExpansionService`         | Repository + Service         |
| **Cross-reference Network**            | Graph traversal with path discovery                              | `GraphTraversalService`      |
| **Engineering Standard Relationships** | Edge types: `regulates`, `references`, `supersedes`              | `ALLOWED_OUTGOING_EDGES`     |
| **Version Relationships**              | Edge type: `version_of`                                          | Edge type enum               |
| **Dependency Graph**                   | `DependencyResolutionService` with upstream/downstream traversal | Application service          |
| **Requirement Traceability**           | Citation graph + provenance chain                                | `KnowledgeProvenanceService` |
| **Conflict Detection**                 | `ConflictDetectionService`                                       | Application service          |
| **Duplicate Detection**                | `DuplicateDetectionService`                                      | Application service          |
| **Document Similarity**                | `DocumentSimilarityService` + `document_similarities` table      | Repository + Service         |
| **Knowledge Clustering**               | `KnowledgeClusteringService`                                     | Application service          |
| **Ontology Registry**                  | `OntologyRegistryService` + `ontologies` table                   | Repository + Service         |
| **Domain Taxonomy**                    | `DomainTaxonomyService` + `ontology_classes`                     | Repository + Service         |
| **Knowledge Provenance Graph**         | `KnowledgeProvenanceService`                                     | Application service          |
| **Knowledge Confidence Score**         | `KnowledgeConfidenceService`                                     | Application service          |
| **Knowledge Freshness Score**          | `KnowledgeFreshnessService`                                      | Application service          |
| **Knowledge Authority Ranking**        | `KnowledgeAuthorityService`                                      | Application service          |
| **Knowledge Completeness Analysis**    | `KnowledgeCompletenessService`                                   | Application service          |

---

## 4. Reasoning Primitives

| Primitive                            | Implementation                                  | Strategy                         |
| ------------------------------------ | ----------------------------------------------- | -------------------------------- |
| **Graph Traversal**                  | PostgreSQL recursive CTEs                       | `GraphTraversalRepository`       |
| **Dependency Resolution**            | Upstream/downstream subgraph extraction         | `DependencyResolutionService`    |
| **Semantic Expansion**               | Weighted neighbor expansion with decay          | `SemanticExpansionService`       |
| **Citation Expansion**               | BFS over citation graph                         | `CitationExpansionService`       |
| **Related Document Discovery**       | Semantic expansion + similarity ranking         | `GraphSearchService`             |
| **Hierarchical Reasoning**           | Ontology class tree traversal                   | `OntologyRepository`             |
| **Engineering Standard Inheritance** | `subclass_of`, `equivalent_to`, `part_of` edges | Graph edges + ontology relations |
| **Context Expansion**                | Multi-hop graph expansion                       | `GraphTraversalService.expand()` |
| **Multi-document Aggregation**       | Clustering + subgraph extraction                | `KnowledgeClusteringService`     |

---

## 5. Search Integration: Hybrid Graph Search

The following is the **target** fusion pipeline, not the current HTTP implementation:

```typescript
// Target search pipeline
keywordResults = keywordSearch(query); // PostgreSQL FTS
vectorResults = vectorSearch(query); // Qdrant via ai-service
graphResults = graphSearch(query); // Graph traversal + scoring
citationResults = citationExpand(query); // Citation graph expansion
ranked = fuseAll(keyword, vector, graph, citation); // RRF + authority weighting
filtered = applyPermissions(ranked, userContext); // RBAC enforcement
```

At runtime, `GET /search/graph` loads up to 100 recent workspace nodes; text-filters labels, entity fields, types, and scalar properties; then ranks only matching candidates using bounded text relevance, graph neighbors, citations, and persisted metrics. It returns at most 20 results with scores in `[0, 1]`. It does not call PostgreSQL FTS, Qdrant, or `HybridSearchService`. `HybridSearchService` can merge caller-supplied result arrays but is not wired to this controller. Endpoint guards declare JWT, workspace, and `knowledge.read`; the service-level `userContext` parameter is currently unused. The shared `PermissionsGuard` also has a pre-existing fail-open path for unexpected authorization-service exceptions, so guard declaration must not be read as fail-closed assurance until that shared behavior is corrected.

**Endpoints:**

- `GET /knowledge-intelligence/search/graph` — Semantic search over graph
- `GET /knowledge-intelligence/search/related/:nodeId` — Related documents via graph traversal

---

## 6. Metrics Engine

### Score Components

| Metric           | Formula                                                                                             | Range    |
| ---------------- | --------------------------------------------------------------------------------------------------- | -------- |
| **Confidence**   | `min(1, 0.5 + hasAtLeast3Props * 0.1 + hasEmbedding * 0.1 + min(0.3, incomingAverageWeight * 0.1))` | [0, 1]   |
| **Freshness**    | `f(age_days)`: 1.0 (<7d), 0.9 (<30d), 0.7 (<90d), 0.5 (<365d), 0.3 (≥365d)                          | [0.3, 1] |
| **Authority**    | `min(1, 0.5 + citationsOrReferences * 0.1 + regulates * 0.05)`                                      | [0, 1]   |
| **Completeness** | `label(0.2) + hasProps(0.3) + embedding(0.2) + entityId(0.1) + atLeast5Props(0.2)`                  | [0, 1]   |
| **Composite**    | `(confidence + freshness + authority + completeness) / 4`                                           | [0, 1]   |

When an authority metric already exists, `calculateAuthority()` persists and returns the average of the existing authority and the newly calculated value. The workspace completeness and freshness GET endpoints calculate current reports without persisting derived metrics; metric persistence remains in explicit mutation and lifecycle-projection workflows.

### Endpoints

- `GET /knowledge-intelligence/metrics/:nodeId`
- `POST /knowledge-intelligence/metrics/:nodeId/access`
- `GET /knowledge-intelligence/metrics/workspace/top/:metric`
- `GET /knowledge-intelligence/metrics/workspace/authority`
- `GET /knowledge-intelligence/metrics/workspace/completeness`
- `GET /knowledge-intelligence/metrics/workspace/freshness`
- `POST /knowledge-intelligence/metrics/workspace/confidence/recompute`

---

## 7. Graph Traversal Strategy

### PostgreSQL Recursive CTEs

All graph traversal queries use PostgreSQL recursive CTEs for maximum performance without a dedicated graph database.

#### Shortest Path

```sql
WITH RECURSIVE path AS (
  SELECT source_id, ARRAY[source_id] as path, 0 as depth
  FROM knowledge_graph_edges WHERE source_id = $1
  UNION ALL
  SELECT e.target_id, p.path || e.target_id, p.depth + 1
  FROM knowledge_graph_edges e
  JOIN path p ON e.source_id = p.source_id
  WHERE p.depth < $maxDepth AND NOT e.target_id = ANY(p.path)
)
SELECT * FROM path WHERE source_id = $target
ORDER BY depth ASC LIMIT 1
```

#### Connected Components

Uses recursive query to group nodes into connected components for cluster analysis.

#### Dependency Subgraph

Filters edges by type (`depends_on`, `references`, `derived_from`) and extracts upstream/downstream trees.

---

## 8. Data Model

### Knowledge Graph Nodes (`knowledge_graph_nodes`)

| Field          | Type    | Description                                                                                                |
| -------------- | ------- | ---------------------------------------------------------------------------------------------------------- |
| `id`           | UUID    | Primary key                                                                                                |
| `workspace_id` | String  | Tenant isolation                                                                                           |
| `type`         | Enum    | document \| entity \| concept \| standard \| formula \| calculation \| person \| organization \| equipment |
| `entity_type`  | Enum    | knowledge \| knowledge_document \| engineering_standard \| calculation \| user \| tag \| ...               |
| `entity_id`    | String  | Polymorphic FK to any entity                                                                               |
| `label`        | String? | Human-readable label                                                                                       |
| `properties`   | Json    | Arbitrary key-value metadata                                                                               |
| `embedding_id` | String? | Link to Qdrant point                                                                                       |

### Knowledge Graph Edges (`knowledge_graph_edges`)

| Field          | Type   | Description               |
| -------------- | ------ | ------------------------- |
| `id`           | UUID   | Primary key               |
| `workspace_id` | String | Tenant isolation          |
| `source_id`    | UUID   | Source node               |
| `target_id`    | UUID   | Target node               |
| `type`         | Enum   | Edge relationship type    |
| `weight`       | Float  | Edge weight (1.0 default) |
| `properties`   | Json   | Edge metadata             |

### Edge Types

| Type            | Direction     | Description              |
| --------------- | ------------- | ------------------------ |
| `cites`         | out           | Document citation        |
| `depends_on`    | out           | Dependency relationship  |
| `related_to`    | bidirectional | Semantic similarity      |
| `regulates`     | out           | Standard regulation      |
| `supersedes`    | out           | Version replacement      |
| `equivalent_to` | bidirectional | Ontology equivalence     |
| `part_of`       | out           | Hierarchical containment |
| `derived_from`  | out           | Derivation lineage       |
| `references`    | out           | Reference link           |
| `includes`      | out           | Container relationship   |
| `calculated_by` | out           | Calculation link         |
| `defined_in`    | out           | Definition source        |
| `belongs_to`    | out           | Ownership                |
| `version_of`    | out           | Version relation         |

---

## 9. Ontology Model

### Ontology Registry (`ontologies`)

| Field          | Description         |
| -------------- | ------------------- |
| `id`           | Primary key         |
| `workspace_id` | Tenant isolation    |
| `name`         | Human name          |
| `slug`         | URL-safe identifier |
| `version`      | Ontology version    |
| `description`  | Purpose description |
| `is_active`    | Active flag         |

### Ontology Classes (`ontology_classes`)

| Field         | Description                           |
| ------------- | ------------------------------------- |
| `id`          | Primary key                           |
| `ontology_id` | Parent ontology                       |
| `parent_id`   | Self-referential parent for hierarchy |
| `uri`         | Unique class URI                      |
| `label`       | Display name                          |
| `description` | Class description                     |
| `properties`  | Class metadata                        |
| `sort_order`  | Display ordering                      |
| `is_abstract` | Abstract base class flag              |

### Ontology Relations (`ontology_relations`)

| Field         | Description                                                          |
| ------------- | -------------------------------------------------------------------- |
| `id`          | Primary key                                                          |
| `ontology_id` | Parent ontology                                                      |
| `source_uri`  | Source class URI                                                     |
| `target_uri`  | Target class URI                                                     |
| `relation`    | subclass_of \| equivalent_to \| disjoint_with \| part_of \| has_part |

---

## 10. API Inventory

### Graph Controller (`/knowledge-intelligence/graph/*`)

| Method | Path                                       | Description                      |
| ------ | ------------------------------------------ | -------------------------------- |
| `GET`  | `/graph/shortest-path/:sourceId/:targetId` | Find shortest path between nodes |
| `GET`  | `/graph/neighbors/:nodeId`                 | Get node neighbors               |
| `GET`  | `/graph/subgraph`                          | Get subgraph for node IDs        |
| `GET`  | `/graph/ancestors/:nodeId`                 | Get all ancestors                |
| `GET`  | `/graph/descendants/:nodeId`               | Get all descendants              |
| `GET`  | `/graph/provenance/:nodeId`                | Build provenance chain           |
| `GET`  | `/graph/dependencies/:nodeId`              | Resolve dependency tree          |
| `GET`  | `/graph/conflicts/:nodeId`                 | Detect conflicts                 |
| `GET`  | `/graph/connected-components`              | Find connected components        |

### Ontology Controller (`/knowledge-intelligence/ontologies/*`)

| Method | Path                              | Description                 |
| ------ | --------------------------------- | --------------------------- |
| `GET`  | `/ontologies`                     | List active ontologies      |
| `POST` | `/ontologies`                     | Register new ontology       |
| `GET`  | `/ontologies/:ontologyId/classes` | List classes in ontology    |
| `GET`  | `/taxonomy/hierarchy`             | Get taxonomy hierarchy      |
| `POST` | `/taxonomy/classify/:nodeId`      | Classify node into ontology |

### Citations Controller (`/knowledge-intelligence/citations/*`)

| Method | Path                        | Description                |
| ------ | --------------------------- | -------------------------- |
| `GET`  | `/citations/graph`          | Get citation graph data    |
| `GET`  | `/citations/expand/:nodeId` | Expand citations from node |

### Graph Search Controller (`/knowledge-intelligence/search/*`)

| Method | Path                      | Description                          |
| ------ | ------------------------- | ------------------------------------ |
| `GET`  | `/search/graph`           | Semantic search over knowledge graph |
| `GET`  | `/search/related/:nodeId` | Find related documents via graph     |

### Metrics Controller (`/knowledge-intelligence/metrics/*`)

| Method | Path                                      | Description                  |
| ------ | ----------------------------------------- | ---------------------------- |
| `GET`  | `/metrics/:nodeId`                        | Get node metrics             |
| `POST` | `/metrics/:nodeId/access`                 | Record node access           |
| `GET`  | `/metrics/workspace/top/:metric`          | Top nodes by metric          |
| `GET`  | `/metrics/workspace/authority`            | Authority rankings           |
| `GET`  | `/metrics/workspace/completeness`         | Completeness analysis        |
| `GET`  | `/metrics/workspace/freshness`            | Freshness/staleness analysis |
| `POST` | `/metrics/workspace/confidence/recompute` | Batch confidence recompute   |

### Clusters Controller (`/knowledge-intelligence/clusters/*`)

| Method | Path                  | Description              |
| ------ | --------------------- | ------------------------ |
| `POST` | `/clusters/compute`   | Auto-compute clusters    |
| `GET`  | `/clusters`           | List workspace clusters  |
| `GET`  | `/duplicates/:nodeId` | Find duplicates for node |

---

## 11. AI Runtime Integration Contract

The AI Runtime **must never** access raw vector storage directly. It consumes only:

| Service Pattern            | Usage                                 |
| -------------------------- | ------------------------------------- |
| `GraphTraversalService`    | Path discovery, dependency resolution |
| `SemanticExpansionService` | Context expansion for prompts         |
| `CitationExpansionService` | Evidence gathering with provenance    |
| `KnowledgeMetricsService`  | Source quality weighting              |
| `HybridSearchService`      | Multi-modal search fusion             |
| `GraphSearchService`       | Related document discovery            |

---

## 12. Remaining Gaps

| Gap                             | Priority | Description                                                                                                                                                                                                                               |
| ------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **OCR/Extraction Integration**  | High     | Knowledge Factory parsing pipeline is stubbed; nodes are not auto-created from ingested documents                                                                                                                                         |
| **Real RAG Pipeline Wiring**    | High     | Qdrant embeddings exist in factory but graph nodes don't auto-link to vector IDs                                                                                                                                                          |
| **AI Runtime Persistence**      | Medium   | AI Runtime stores sessions in-memory; needs DB-backed session store                                                                                                                                                                       |
| **Streaming RAG**               | Medium   | AI Runtime streaming is simulated; needs real SSE from LLM provider                                                                                                                                                                       |
| **Implementation Completeness** | Medium   | `GraphNodeRepository` and `GraphEdgeRepository` are implemented; graph traversal relies on raw SQL CTEs which are correct but need load testing at scale                                                                                  |
| **Graph Visualization**         | Low      | Management workspaces now cover exploration, ontology, metrics, clusters, and duplicates; a dedicated interactive graph canvas is still absent                                                                                            |
| **Security/Sandboxing**         | High     | Controllers use JWT/workspace/permission guards and graph IDs use `GraphWorkspaceGuard`, but the shared permission guard can fail open on unexpected authorization-service errors; repositories are not uniformly workspace-parameterized |

---

## 13. Enterprise AI Readiness Assessment

> The percentages below are historical architecture estimates, not measured release criteria. Use the runtime audit and test results for operational decisions.

| Factor                  | Score | Notes                                                                                                                  |
| ----------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------- |
| **Semantic Foundation** | 85%   | Graph schema, ontology, and reasoning primitives are production-ready                                                  |
| **API Completeness**    | 90%   | REST endpoints expose all core capabilities for AI Runtime                                                             |
| **Data Pipeline**       | 50%   | Factory → graph node creation is not yet automated                                                                     |
| **Persistence**         | 70%   | PostgreSQL graph model is solid; AI Runtime still needs DB persistence                                                 |
| **Observability**       | 60%   | Metrics and management views exist; operational telemetry is limited                                                   |
| **Security**            | 60%   | Workspace/RBAC/resource guards exist, but shared authorization must fail closed and repositories need defense-in-depth |

### Estimated Completion Percentage

**Overall: ~70%**

- Core architecture: **95%**
- Domain models: **95%**
- Knowledge graph schema: **90%**
- Ontology: **85%**
- Services (reasoning): **80%**
- Repositories: **85%**
- Graph queries: **75%**
- Search integration: **60%**
- Metrics: **80%**
- Tests: **40%** (entity tests pass; integration tests need mocks)
- Documentation: **70%**

### Next Steps to Production Quality

1. Change the shared `PermissionsGuard` to fail closed on unexpected authorization-service errors
2. Complete and safely activate Knowledge Factory before enabling its document-to-graph producer
3. Implement AI Runtime DB-backed session storage
4. Add repository-level workspace constraints as defense in depth behind controller/resource guards
5. Load-test recursive CTEs with 100K+ nodes
6. Add a dedicated interactive graph canvas to the existing management console if required
7. Wire a real hybrid/RAG pipeline: FTS/vector/graph/citation retrieval → fusion → cited LLM response

---

## 14. Module File Structure

```
apps/api/src/modules/knowledge-intelligence/
├── knowledge-intelligence.module.ts
├── domain/
│   ├── entities/
│   │   ├── graph-node.entity.ts
│   │   ├── graph-edge.entity.ts
│   │   ├── graph-metrics.entity.ts
│   │   ├── ontology-class.entity.ts
│   │   ├── ontology-relation.entity.ts
│   │   ├── citation.entity.ts
│   │   ├── document-similarity.entity.ts
│   │   ├── cluster.entity.ts
│   │   └── index.ts
│   ├── value-objects/
│   │   ├── node-type.vo.ts
│   │   ├── edge-type.vo.ts
│   │   ├── entity-type.vo.ts
│   │   ├── relation-type.vo.ts
│   │   └── index.ts
│   ├── interfaces/
│   │   ├── graph-node.repository.interface.ts
│   │   ├── graph-edge.repository.interface.ts
│   │   ├── graph-metrics.repository.interface.ts
│   │   ├── graph-traversal.repository.interface.ts
│   │   ├── ontology.repository.interface.ts
│   │   ├── citation.repository.interface.ts
│   │   ├── document-similarity.repository.interface.ts
│   │   ├── cluster.repository.interface.ts
│   │   └── index.ts
├── application/
│   ├── services/
│   │   ├── graph-traversal.service.ts
│   │   ├── semantic-expansion.service.ts
│   │   ├── citation-expansion.service.ts
│   │   ├── dependency-resolution.service.ts
│   │   ├── conflict-detection.service.ts
│   │   ├── duplicate-detection.service.ts
│   │   ├── knowledge-clustering.service.ts
│   │   ├── ontology-registry.service.ts
│   │   ├── domain-taxonomy.service.ts
│   │   ├── knowledge-provenance.service.ts
│   │   ├── knowledge-metrics.service.ts
│   │   ├── knowledge-authority.service.ts
│   │   ├── knowledge-completeness.service.ts
│   │   ├── knowledge-freshness.service.ts
│   │   ├── knowledge-confidence.service.ts
│   │   ├── hybrid-search.service.ts
│   │   ├── graph-search.service.ts
│   │   └── document-similarity.service.ts
├── infrastructure/
│   ├── repositories/
│   │   ├── graph-node.repository.ts
│   │   ├── graph-edge.repository.ts
│   │   ├── graph-metrics.repository.ts
│   │   ├── graph-traversal.repository.ts
│   │   ├── ontology.repository.ts
│   │   ├── citation.repository.ts
│   │   ├── document-similarity.repository.ts
│   │   └── cluster.repository.ts
└── presentation/
    ├── controllers/
    │   ├── graph.controller.ts
    │   ├── ontology.controller.ts
    │   ├── citations.controller.ts
    │   ├── graph-search.controller.ts
    │   ├── metrics.controller.ts
    │   └── clusters.controller.ts
    └── dtos/ (DTOs defined inline in controllers via NestJS decorators)
```

---

_End of Knowledge Intelligence Layer Architecture v1.0_
