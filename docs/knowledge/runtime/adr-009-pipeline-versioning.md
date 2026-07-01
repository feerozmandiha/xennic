# ADR-009: Pipeline Versioning

**Status:** Proposed | **Date:** Tir 1405 | **Deciders:** Xennic Architecture Team

---

## Context

The knowledge extraction pipeline will evolve: new parsers for additional document formats, improved chunking strategies, more accurate ML extraction models, additional validation rules, and new enrichment sources. Each change risks producing different output for the same input document, potentially creating inconsistent knowledge. Reprocessing all previously ingested documents on every change is prohibitively expensive (100M+ documents, each requiring multiple pipeline stages). Without versioning, operators cannot determine which pipeline version produced a given knowledge object, making debugging and audit impossible.

## Decision

Adopt a MAJOR.MINOR pipeline versioning scheme:

- **MAJOR** — breaking changes: output schema changes, removed extraction strategies, new mandatory validation rules, altered semantic meaning of existing fields. Requires staged migration.
- **MINOR** — backward-compatible changes: new optional extraction strategies, performance improvements, additional validation rules that can fail without blocking, new enrichment sources.

Key behaviours:

- **Backward compatibility for MINOR** — documents processed by version X.Y can coexist with X.Z without inconsistency. Published knowledge objects remain structurally identical; new fields are optional.
- **Staged migration for MAJOR** — old versions continue processing new documents in a legacy pipeline instance. A migration plan is created per MAJOR bump: migrate document cohorts in batches, verify consistency, retire old version.
- **Per-document version tracking** — every knowledge object in the database carries `pipeline_version` (MAJOR.MINOR). Downstream consumers can filter or be alerted to version changes.
- **Pipeline configuration is versioned** — the pipeline DAG definition, stage implementations, and parameter values are tagged with the pipeline version in the deployment registry.

## Alternatives Considered

- **Reprocess everything on every change:** Ensures consistency but is prohibitively expensive. A single MINOR release would cost thousands of compute hours. No incremental adoption path.
- **No versioning:** Simplest approach but produces chaos. Operators cannot explain why two similar documents produced different knowledge. Audit requirements cannot be met. Debugging is impossible.
- **Git-based versioning of pipeline config:** Tempting because Git is familiar, but Git versioning of YAML/JSON configs does not capture the runtime behaviour of ML models, library versions, or external service APIs that affect output.

## Consequences

- **Positive:** Backward compatibility on MINOR releases means zero reprocessing for most updates. Operators can confidently roll forward. Per-document version tracking enables audit, debugging, and gradual migrations. Staged MAJOR migrations allow controlled rollouts.
- **Negative:** Version tracking overhead — every knowledge object requires an additional indexed field. Migration planning is manual and effortful for each MAJOR release. Old pipeline versions must be maintained alongside new ones during migration, doubling infrastructure cost temporarily.

## Future Impact

The versioning scheme enables future capabilities: A/B comparison of pipeline versions on production data, automated regression testing in CI/CD (run new version against known document set, flag diffs), and self-service pipeline selection (clients choose which pipeline version processes their documents). The key constraint is that MINOR changes must genuinely be backward-compatible — this requires rigorous semantic versioning discipline.

## Compliance

- Every MAJOR version change requires a documented migration plan approved by the architecture team.
- MINOR version changes must pass a compatibility test suite that asserts output schema stability.
- All database schemas storing knowledge objects must include `pipeline_version` as a non-nullable field.
- Pipeline deployment tags must match the versioning scheme — no untagged or mutable-latest deployments.
