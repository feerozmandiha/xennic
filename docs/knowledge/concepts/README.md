# مفاهیم مهندسی — Engineering Concepts

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## Purpose — هدف

The Concepts domain provides a **formal conceptual model** for engineering knowledge within the Xennic platform. It defines the atomic units of engineering reasoning — Facts, Rules, Constraints, Assumptions, Calculations, and Conclusions — along with their relationships, lifecycle, and truth model. This domain is the bridge between raw ingested documents (standards, catalogs, tariffs) and intelligent AI services that reason over engineering problems.

**Core function:** Transform unstructured and semi-structured technical content into a **graph-ready, machine-readable conceptual knowledge base** that supports retrieval-augmented generation (RAG), multi-hop reasoning, and expert system integration.

---

## Relationship to Governance — ارتباط با مستندات حاکمیتی

The Concepts domain depends on and extends the governance layer:

| Governance Document | Relationship |
|---|---|
| `governance/metadata-schema.md` | Concepts inherit Universal Metadata Schema fields (`id`, `version`, `status`, `confidence_score`, `source_tier`, etc.) and add concept-specific properties |
| `governance/source-hierarchy.md` | Every concept must cite sources per the tier system (Tier 1–5); concept truth authority derives directly from source hierarchy |
| `governance/taxonomy.md` | Concepts are classified by taxonomy categories (`domains`, `equipment_type`, `voltage_level`, `engineering_discipline`) |
| `governance/naming-conventions.md` | Concept IDs, names, and file paths follow governance naming rules |
| `governance/data-quality-policy.md` | Concept validation, review, and quality gates align with data quality policy |
| `ai-intelligence/confidence-scoring.md` | Concept confidence scores are computed per the AI intelligence confidence framework |
| `ai-intelligence/evidence-chain.md` | Evidence chains for concept conclusions follow the AI intelligence evidence model |

---

## Directory Map — نقشه دایرکتوری

```
concepts/
├── README.md                   # این سند — نمای کلی دامنه مفاهیم
└── concept-model.md            # مدل مفهومی مهندسی — هسته دامنه مفاهیم
```

### Planned Files (Future)

| File | Description | Sprint |
|------|-------------|--------|
| `concept-registry.md` | Registry of all defined concepts with IDs, types, and statuses | K1.6 |
| `concept-lifecycle.md` | Lifecycle states, transitions, and governance workflows per concept | K1.6 |
| `calculation-templates.md` | Reusable calculation templates for engineering formulas | K1.7 |
| `concept-validation.md` | Validation rules and test cases for concept correctness | K1.7 |
| `graph-mapping.md` | Detailed mapping of concepts to RDF/OWL and Property Graph models | K2.1 |

---

## Status — وضعیت جاری

| Aspect | Status | Description |
|--------|--------|-------------|
| **K1.5 Sprint** | 🔄 در حال توسعه | Foundation sprint — establishes concept model, truth model, and Graph RAG compatibility |
| **Concept Model** | 📋 تکمیل | `concept-model.md` defines all 6 concept types, relationships, and truth model |
| **Examples** | ✅ ارائه شده | Three worked examples demonstrate the model with real engineering scenarios |
| **Graph RAG Readiness** | 📋 تعریف شده | Requirements specified; implementation in K2.1 |
| **AI Service Integration** | 📋 برنامه‌ریزی | AI reasoning engine will consume concept model in K2.2 |

---

## Future Roadmap — نقشه راه آینده

| Horizon | Feature | Description |
|---------|---------|-------------|
| **K1.6** | Concept Registry | Centralized registry with CRUD API, search, and versioning |
| **K1.7** | Calculation Engine | Template-based calculation execution with parameter validation |
| **K2.1** | Graph RAG Implementation | RDF/OWL serialization, SPARQL endpoints, Property Graph model |
| **K2.2** | Expert System Integration | Rule-based inference engine using concept Rules and Constraints |
| **K2.3** | Multi-Agent Reasoning | Distributed reasoning across AI agents using shared concept graph |
| **K3.0** | Autonomous Engineering | End-to-end automated engineering design using concept knowledge |

---

## Graph RAG Compatibility Requirements — الزامات سازگاری با Graph RAG

All concepts, relationships, and metadata defined in this domain **MUST** satisfy the following requirements to ensure native compatibility with Graph RAG architectures (vector + graph hybrid retrieval):

| # | Requirement | Description | Implication |
|---|-------------|-------------|-------------|
| R1 | **Node Representation** | All concepts must be representable as graph nodes | Every `concept_id` maps to a unique node in the knowledge graph |
| R2 | **Edge Representation** | All relationships must be representable as graph edges | Concept-to-concept connections (e.g., `supports`, `constrains`) are directed edges |
| R3 | **Node Attributes** | Entities must support key-value properties on nodes | Concept properties (`definition`, `type`, `domains`, `confidence`) are stored as node attributes |
| R4 | **Edge Attributes** | Relationships must support direction, type, and weight | Edge metadata includes `relation_type`, `weight`, `confidence`, `source_tier` |
| R5 | **RDF/OWL Serialization** | The conceptual model must be serializable to RDF/OWL | A mapping from concept model to OWL classes/properties must be defined |
| R6 | **Graph Traversal** | Must support shortest path, neighbor finding, and sub-graph extraction | Query engine must support BFS, DFS, Dijkstra, and k-hop neighborhood queries |
| R7 | **Multi-Hop Reasoning** | Must support reasoning across entity chains of length ≥ 3 | AI Service must traverse concept → rule → calculation → conclusion paths |
| R8 | **Standards Compatibility** | Compatibility with Knowledge Graph standards (RDF, SPARQL, Property Graph) | Both RDF/SPARQL and Labeled Property Graph (Cypher, Gremlin) models must be supported |

> **Compliance:** All concept definitions in this directory SHALL be validated against these 8 requirements before being marked as `approved`. A compliance matrix MUST accompany each new concept definition.

---

## Quick Reference — مرجع سریع

| Concept Type | Graph Node Label | Default Edge Type | Required Source Tier |
|---|---|---|---|
| Engineering Fact | `Fact` | `supports` | Tier 1–2 |
| Engineering Rule | `Rule` | `constrains`, `prescribes` | Tier 1–2 |
| Engineering Constraint | `Constraint` | `bounds` | Tier 1–3 |
| Engineering Assumption | `Assumption` | `parameterizes` | Tier 2–5 |
| Engineering Calculation | `Calculation` | `produces` | Tier 1–3 |
| Engineering Conclusion | `Conclusion` | `concludes` | Tier 1–3 |

---

> For the complete concept model definition, see [`concept-model.md`](concept-model.md).
