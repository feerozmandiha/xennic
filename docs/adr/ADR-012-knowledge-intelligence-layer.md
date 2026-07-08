# ADR-012: Knowledge Intelligence Layer Architecture & Implementation

- **Status:** Accepted
- **Date:** 2026-07-04
- **Decision makers:** Chief Enterprise Architect, AI Architect, Backend Lead
- **Related RFC:** RFC-KIL-001
- **Gaps addressed:** XEN-GAP-KIL-001 through XEN-GAP-KIL-020

---

## Context

The `knowledge-factory` module provides automated document ingestion. The `knowledge` module provides manual article management. The `ai-runtime` module provides conversational agent execution. However, there is **no semantic reasoning layer** connecting these systems.

Without a Knowledge Intelligence Layer, the AI Runtime must either:
1. Access raw vector storage (forbidden by architecture directive)
2. Re-implement semantic logic independently
3. Operate without graph context, citations, or quality metrics

This creates a hard blocker for Enterprise AI Agents, which require semantic reasoning, citation-grounded responses, and knowledge quality weighting.

## Decision

Implement the Knowledge Intelligence Layer as a **full DDD NestJS module** (`knowledge-intelligence`) with PostgreSQL-backed graph storage using recursive CTEs.

### Key architectural decisions:

1. **No dedicated graph database:** Use PostgreSQL recursive CTEs (`WITH RECURSIVE`) for all graph traversals. This avoids introducing a new infrastructure dependency (Neo4j, etc.) and aligns with the existing PostgreSQL-centric stack.

2. **Symmetric relationships:** Dual `source/target` relations on `knowledge_graph_edges` enable efficient bidirectional traversal without UNION queries in the common case.

3. **Polymorphic nodes:** `knowledge_graph_nodes` uses `entity_type`/`entity_id` to link to any existing entity (knowledge articles, standards, calculations, users). This avoids creating rigid foreign keys and supports cross-domain graph construction.

4. **Metrics as first-class citizens:** Every node has a `knowledge_graph_metrics` record (confidence, freshness, authority, completeness). These are computed and recomputed asynchronously, enabling quality-aware AI responses.

5. **AI Runtime isolation:** The AI Runtime **never** accesses raw Qdrant or PostgreSQL vector columns directly. All retrieval passes through `GraphSearchService`, `HybridSearchService`, and related interfaces.

6. **Ontology registry:** A lightweight triple-store-like structure (`ontologies`, `ontology_classes`, `ontology_relations`) provides class hierarchy and relation definitions without the overhead of full OWL/RDF.

### Module structure:

- **Domain:** Entities (`KnowledgeGraphNode`, `KnowledgeGraphEdge`, `KnowledgeGraphMetrics`, `OntologyClass`, `OntologyRelation`, `KnowledgeCitation`, `DocumentSimilarity`, `KnowledgeCluster`), value objects (`NodeType`, `EdgeType`, `RelationType`), repository interfaces.
- **Application:** 16 service classes covering graph traversal, semantic expansion, citation expansion, dependency resolution, conflict detection, duplicate detection, clustering, ontology registry, taxonomy, provenance, and all four quality metrics.
- **Infrastructure:** 8 Prisma-backed repositories, including `GraphTraversalRepository` with raw recursive CTE queries.
- **Presentation:** 6 controllers (Graph, Ontology, Citations, GraphSearch, Metrics, Clusters) exposing 15+ REST endpoints.

## Consequences

### Benefits
- Semantic brain of the platform enables Enterprise AI Agents
- No new database infrastructure required
- Existing Knowledge Factory and Knowledge CMS integrate via polymorphic node creation
- All AI consumption Goes through typed interfaces, preventing vector-store leaks
- Quality metrics enable citation-grounded, confidence-weighted AI responses

### Tradeoffs
- Recursive CTEs have depth limits (configurable `maxDepth`); deeply nested knowledge may need materialized path optimization
- Polymorphic `entity_type`/`entity_id` prevents foreign key constraints at the DB level
- Metrics recomputation is synchronous by default; for large workspaces, batch jobs are needed
- No frontend graph visualization yet (out of scope for this directive)

### Risks
- Large graphs (>100K nodes) may experience CTE performance degradation — mitigated by indexing on `(workspace_id, type, entity_type, entity_id)`
- Concurrent metric updates may cause write conflicts — mitigated by `upsert` semantics in `GraphMetricsRepository`

## Compliance

- All repositories enforce `workspace_id` filtering at query level
- Endpoints use existing `PermissionsGuard` from RBAC module
- Audit trail can be added by hooking into `audit_logs` via NestJS interceptors
- All node/edge creation validates `EdgeType` and `NodeType` enums

## Related

- **Architecture doc:** `docs/knowledge/knowledge-intelligence-architecture.md`
- **Prisma models:** `prisma/schema.prisma` (`knowledge_graph_*`, `ontologies`, `ontology_*`, `knowledge_citations`, `document_similarities`, `knowledge_clusters`)
- **Module:** `apps/api/src/modules/knowledge-intelligence/`
- **Supersedes:** gap analysis for semantic reasoning layer
- **Blocks:** Enterprise AI Agent implementation (RFC-AI-003)

## Appendix: Model Schema

```prisma
model knowledge_graph_nodes {
  id           String   @id @default(uuid())
  workspace_id String
  type         String   // document | entity | concept | standard | formula | ...
  entity_type  String   // knowledge | knowledge_document | engineering_standard | ...
  entity_id    String
  label        String?
  properties   Json     @default("{}")
  embedding_id String?
  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt
}

model knowledge_graph_edges {
  id           String   @id @default(uuid())
  workspace_id String
  source_id    String
  target_id    String
  type         String   // cites | depends_on | related_to | regulates | ...
  weight       Float    @default(1.0)
  properties   Json     @default("{}")
  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt
}

model knowledge_graph_metrics {
  id               String    @id @default(uuid())
  node_id          String    @unique
  confidence       Float     @default(0.5)
  freshness        Float     @default(0.5)
  authority        Float     @default(0.5)
  completeness     Float     @default(0.5)
  access_count     Int       @default(0)
  last_accessed_at DateTime?
  computed_at      DateTime  @default(now())
  updated_at       DateTime  @updatedAt
}

model ontologies { ... }
model ontology_classes { ... }
model ontology_relations { ... }
model knowledge_citations { ... }
model document_similarities { ... }
model knowledge_clusters { ... }
```

---

## Implementation Order Applied

1. **Architecture** — Knowledge Intelligence Layer design document + ADR
2. **Domain Model** — 8 entities, 4 value objects, 8 repository interfaces
3. **Knowledge Graph Schema** — 6 Prisma models with indexes
4. **Ontology** — Ontology registry, classes, relations
5. **Services** — 16 application services
6. **Repositories** — 8 Prisma repositories + graph traversal with raw CTEs
7. **Graph Queries** — Recursive CTEs for shortest path, all paths, ancestors, descendants, connected components, dependency subgraph, semantic expansion
8. **Search Integration** — Graph search + hybrid search service + 2 controllers
9. **Metrics** — Confidence, freshness, authority, completeness with batch recompute
10. **Tests** — Entity unit tests; module specs deferred pending mock database setup

---

*End of ADR-012*
