# ADR-011: Knowledge Object Architecture

**Status:** Proposed | **Date:** Tir 1405 | **Deciders:** Xennic Architecture Team

---

## Context

Validated engineering knowledge consumed by AI reasoning must follow a consistent, machine-readable format. Without a standard structure, reasoning stages (evidence linking, confidence scoring, conflict resolution) cannot reliably parse or produce knowledge objects. Each piece of engineering knowledge — a code requirement, a manufacturer specification, a design rule — must carry its provenance, version, and integrity metadata so that downstream consumers can trust and trace it.

## Decision

Adopt the **Engineering Knowledge Object (EKO)** as the canonical unit of validated engineering knowledge. Every EKO is a JSON-serializable document with exactly 16 sections:

1. **id** — UUID v7
2. **type** — knowledge category (code, spec, rule, standard, etc.)
3. **content** — the primary knowledge payload (markdown or structured data)
4. **metadata** — author, source document, domain tags, language
5. **version** — semver string
6. **sha256** — integrity hash of the content + metadata fields
7. **provenance** — chain of pipeline stages that produced the object
8. **evidence_refs** — list of Evidence node IDs (see ADR-012)
9. **applicability** — jurisdiction, scope, effective date range
10. **dependencies** — prerequisite EKO IDs
11. **supersedes** — ID of the EKO this replaces (if any)
12. **confidence** — minimum confidence threshold (see ADR-017)
13. **constraints** — inline constraint expressions (see ADR-015)
14. **formulas** — referenced formula IDs (see ADR-016)
15. **rules** — referenced rule IDs (see ADR-014)
16. **signature** — author or system signature for audit

Versioning follows strict semver: major bumps on breaking schema changes, minor on additive field changes, patch on corrections. The SHA-256 hash covers a canonical JSON serialization of fields 1–15 to detect tampering or corruption.

## Alternatives Considered

- **Flat document (Markdown/PDF):** Too unstructured — no machine-traversable fields, no integrity guarantees, no dependency tracking. Every consumer would need bespoke parsing logic.
- **RDF triple store:** Maximum expressivity for linked data, but introduces a steep learning curve, complex querying, and heavyweight infrastructure. Unsuitable for the initial implementation horizon where development velocity is critical.
- **Protobuf:** Strong typing and backward compatibility, but adds a compilation step and reduces accessibility for non-Go services. JSON is ubiquitous across the stack.

## Consequences

- **Positive:** Structured knowledge enables deterministic reasoning; versioning and SHA-256 provide audit-grade traceability; JSON serialization is universally supported; the 16-section schema is comprehensive yet implementable.
- **Negative:** Serialization overhead for large payloads; schema rigidity requires governance for field additions; every producer and consumer must conform to the schema — drift causes silent failures.

## Future Impact

The EKO schema becomes the contract between all knowledge producers (ingestion pipeline, manual authoring tools) and consumers (reasoning runtime, search, API). New reasoning capabilities (e.g., formula evaluation, constraint checking) can be added as new section references without breaking existing consumers. The 16-section format constrains future schema evolution to additive changes only — structural redesign would require a major version bump and migration.

## Compliance

- All pipeline stages that emit validated knowledge MUST produce EKO-compliant JSON.
- Schema validation runs at publication time (see ADR-005).
- SHA-256 integrity is verified before any EKO enters the reasoning runtime.
- Any deviation from the 16-section schema MUST be reviewed by the Architecture Team and reflected in a new ADR.
