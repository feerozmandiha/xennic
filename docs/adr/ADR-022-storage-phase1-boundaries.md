# ADR-022: Storage Phase 1 Boundaries

> **Status:** PROPOSED
> **Date:** 2026-07-19
> **Order:** XENNIC-STORAGE-REVIEW-004

---

## Context

Storage Platform Phase 1 introduces seven sub-phases (1A–1G) that modify the Storage Module and Knowledge Factory. Without explicit boundaries, phases risk scope creep, coupling, and irreversible changes. This ADR defines what each phase may and may not touch.

## Decision

### Principle 1: Each Phase Has Independent Rollback

Every phase must be independently reversible without affecting other phases. This requires:

- No cross-phase foreign key dependencies within the same migration
- No shared state modifications (e.g., two phases cannot modify the same column)
- Each phase produces a standalone migration file

### Principle 2: Schema Changes Are Additive Until Phase 1F

Phases 1A–1E must only ADD columns, tables, or indexes. Column removal, NOT NULL enforcement, and legacy column retirement are exclusively Phase 1F.

### Principle 3: No Breaking API Changes Without ADR

Phase 1C is the only phase that modifies API behavior (KF integration). If the adapter pattern proves insufficient, a new ADR is required before proceeding to 1D–1G.

### Principle 4: File Versioning Is Application-Level Only

Phase 1D activates `file_versions` at the application level. No MinIO versioning is used. Versions are stored as separate objects with independent keys.

### Phase Boundary Matrix

| Phase | Schema Add                     | Schema Remove     | Code Modify         | Code Create                    | API Change       |
| ----- | ------------------------------ | ----------------- | ------------------- | ------------------------------ | ---------------- |
| 1A    | ✅ FK columns                  | ❌                | ❌                  | ❌                             | ❌               |
| 1B    | ✅ ownership cols + join table | ❌                | ✅ entity           | ✅ entity                      | ❌               |
| 1C    | ❌                             | ❌                | ✅ module + service | ✅ adapter                     | ❌ (internal)    |
| 1D    | ❌                             | ❌                | ✅ module           | ✅ service + controller + repo | ✅ new endpoints |
| 1E    | ✅ audit_log table             | ❌                | ✅ service          | ✅ quota + audit services      | ❌               |
| 1F    | ❌                             | ✅ legacy columns | ✅ schema only      | ❌                             | ❌               |
| 1G    | ❌                             | ❌                | ✅ module           | ✅ health + cleanup            | ❌               |

### Forbidden Cross-Phase Actions

1. Phase 1A must NOT create `project_files` table (that is 1B)
2. Phase 1B must NOT remove `storage_path` from `knowledge_documents` (that is 1F)
3. Phase 1C must NOT add versioning endpoints (that is 1D)
4. Phase 1D must NOT add quota enforcement (that is 1E)
5. Phase 1E must NOT backfill data (that is 1F)
6. Phase 1F must NOT add health indicators (that is 1G)
7. Phase 1G must NOT modify schema (only operational code)

## Consequences

- Each phase can be issued as an independent Engineering Order
- Each phase can be reviewed and merged independently
- Rollback of any phase does not affect others
- Phase 1F is the only destructive phase and requires the highest scrutiny

## References

- `docs/implementation/storage-engineering-order-phase1.md` (superseded by this decomposition)
- `docs/adr/ADR-021-canonical-file-document-asset-platform.md` (parent ADR)
- `docs/generated/storage-schema-reconciliation.md` (verified facts)
- `docs/generated/storage-path-reconciliation.md` (verified paths)
