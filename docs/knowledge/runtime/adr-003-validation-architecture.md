# ADR-003: Validation Architecture

**Status:** Proposed | **Date:** Tir 1405 | **Deciders:** Xennic Architecture Team

---

## Context

Engineering knowledge errors can have severe consequences — incorrect specifications, safety violations, or design failures. The runtime must ensure every knowledge object meets quality standards before publication. Validation must cover file integrity, metadata correctness, semantic consistency, engineering domain rules, knowledge graph integrity, and publication readiness. Different document sources and tiers require different validation rigour.

## Decision

Implement a six-layer validation pipeline, executed sequentially. Each layer can pass, fail, or trigger a human review gate:

1. **File Validation** — checksum integrity, format compliance, virus scan, file size limits
2. **Metadata Validation** — mandatory fields present, correct types, valid UUIDs, source attribution
3. **Semantic Validation** — cross-reference consistency, language detection, duplicate detection, embedding coherence
4. **Engineering Validation** — domain-specific rules e.g., unit consistency, value ranges, formula syntax, standard references
5. **Knowledge Validation** — graph integrity (no dangling edges), uniqueness constraints, relationship cardinality
6. **Publication Validation** — target-specific checks (vector DB schema, search index mapping, API contract compliance)

Tier-dependent approval rules:
- **Tier 1** (regulatory/critical): Human approval required at layers 3–6
- **Tier 2** (engineering standard): Human approval at layers 4–6; auto-pass for layers 1–3
- **Tier 3** (general): Fully automated with random sampling for audit

## Alternatives Considered

- **Single validation gate:** Simpler but creates a bottleneck; failure at a late stage forces reprocessing through the entire gate. No graded confidence.
- **Fully automated validation:** Fastest throughput but no safety net for novel errors or edge cases. Unacceptable for safety-critical engineering content.
- **Fully manual review:** Maximum accuracy but prohibitive cost and latency. Cannot scale to 100M+ documents.

## Consequences

- **Positive:** Layered defence catches errors early (file issues don't waste semantic validation effort). Tier-dependent gates optimise reviewer effort. Full audit trail at each layer enables traceability of why a document passed or failed.
- **Negative:** Processing time increases linearly with layers. Validation orchestration adds complexity (state machines per document). Requires domain experts to author and maintain engineering validation rules.

## Future Impact

The layered architecture allows inserting new validation layers (e.g., regulatory compliance checks per jurisdiction) without modifying existing layers. Validation rules can be sourced from external rule engines or AI-assisted pattern detection. The tier system creates a clear roadmap: increase automation coverage as rule confidence improves over time.

## Compliance

- Every document must pass all six layers (or satisfy tier-specific approval exemptions) before publication.
- Validation results per layer, per document must be persisted for audit.
- Human review decisions must be recorded with reviewer identity, timestamp, and rationale.
- New validation rules require unit tests covering pass/fail/human-review scenarios.
