# ADR-012: Evidence Graph

**Status:** Proposed | **Date:** Tir 1405 | **Deciders:** Xennic Architecture Team

---

## Context

Engineering reasoning produces chains of evidence: a source document supports a claim, a claim supports a conclusion, a conclusion contradicts another. These relationships must be machine-traversable to enable multi-hop reasoning, traceability audits, and confidence propagation. Without a structured evidence model, the reasoning runtime cannot answer "why" a conclusion was reached or trace a conclusion back to its supporting sources.

## Decision

Model evidence as a first-class **directed graph** where:

- **Nodes (Evidence):** atomic units of evidence — a quote from a codebook, a test result, a calculation output. Each node carries the EKO `evidence_refs` fields (see ADR-011) and a structured payload (type, content, source ID, timestamp, confidence).
- **Edges (Reasoning Steps):** typed, directed relationships between evidence nodes. Edge types include `SUPPORTS`, `CONTRADICTS`, `AMPLIFIES`, `QUALIFIES`, `DERIVED_FROM`, and `REPLACES`. Each edge stores the reasoning step ID, the rationale, the confidence contribution, and the rule or formula used.

The graph is stored in the **Knowledge Graph** database (Qdrant with graph extension or dedicated graph DB). Graph traversal queries power:

- **Traceability:** from any conclusion, walk back to root sources.
- **Conflict detection:** find contradictory evidence subgraphs.
- **Confidence propagation:** propagate confidence scores along edges (see ADR-017).
- **Explanation generation:** serialize the traversed subgraph as a human-readable chain.

## Alternatives Considered

- **Relational tables (evidence + join table):** Well-understood and ACID-compliant, but graph traversal requires recursive CTEs or multiple joins, which perform poorly beyond depth ~3. No native pathfinding or multi-hop query support.
- **Flat evidence list (no relationships):** Simple to implement but cannot represent dependencies, contradictions, or derived evidence. Fundamentally inadequate for auditability and explainability.
- **Hypergraph:** More expressive (edges can connect >2 nodes) but tooling is immature and query performance is unpredictable. Over-engineered for the current use case.

## Consequences

- **Positive:** Efficient multi-hop traversal; native support for contradiction detection and confidence propagation; enables rich explanation generation; edges carry structured reasoning metadata.
- **Negative:** Graph DB dependency adds operational complexity; schema design for edges is critical and must evolve carefully; queries across very large graphs may require indexing strategies.

## Future Impact

The evidence graph is the backbone of explainability. As the reasoning runtime matures, the graph enables automated audit report generation, visual traceability dashboards, and counterfactual analysis ("what if this evidence were removed?"). It also constrains the system to a graph-native query model — consumers that need relational views must build projections.

## Compliance

- Every reasoning stage MUST produce at least one evidence node or edge.
- Edges MUST be typed from the controlled vocabulary; new edge types require architecture review.
- Graph integrity (no dangling nodes, no contradictory edge cycles) is validated after each reasoning cycle.
