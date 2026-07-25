# ADR-024: Storage File Versioning

- **ID:** ADR-024
- **Title:** Storage File Versioning
- **Status:** PROPOSED
- **Date:** 2026-07-25
- **Decision makers:** Chief Executive AI — Xennic Platform
- **Related:** ADR-021, Phase 1D Review, XENNIC-STORAGE-EO-1D-REVIEW-034
- **Supersedes:** N/A (new capability)

---

## Context

Xennic's Storage Platform has a `file_versions` table that exists since the initial migration (2026-06-02) but is **dead schema**:

- **Zero** TypeScript code references in any module
- **Zero** rows in the database
- `StorageService` has no versioning methods
- `FileEntity` has no version fields
- No controller endpoints for version operations

ADR-021 (Canonical File, Document, Asset & Attachment Platform) proposed:

> "Application-level versioning using `file_versions` table. Each upload to an existing logical file creates a new version record."

Phase 1D decomposition identified versioning as the next activation step after Phase 1C (adapter binding).

---

## Decision

Implement **application-level file versioning** using the existing `file_versions` table.

### Specific Decisions

| #   | Decision                                            | Rationale                                               |
| --- | --------------------------------------------------- | ------------------------------------------------------- |
| D1  | App-level versioning (not MinIO bucket versioning)  | Simpler, consistent with existing pattern, more control |
| D2  | Each version = independent MinIO object + DB row    | Enables independent download, audit, and delete         |
| D3  | Versions immutable once created                     | Audit integrity; no accidental corruption               |
| D4  | Revert = create new version from source             | Never in-place mutation; preserves history              |
| D5  | Version inherits parent file permissions            | Simplifies ACL model; no per-version permission         |
| D6  | Sequential version numbering per file (1, 2, 3...)  | Deterministic; easy to understand                       |
| D7  | Latest version = MAX(version) (no is_active column) | Avoids update contention; simple derivation             |
| D8  | All versions count in quota                         | Accurate storage accounting                             |
| D9  | No retention policy in Phase 1D                     | Deferred to Phase 1G for simplicity                     |
| D10 | Hard delete for individual versions                 | Simplicity; file-level soft delete covers full removal  |
| D11 | 6 API endpoints under /files/:fileId/versions/\*    | Standard REST pattern                                   |

---

## Alternatives Considered

### Alternative A: MinIO Bucket Versioning

**Description:** Enable native MinIO versioning on the bucket. Each PUT automatically creates a new version.

**Pros:**

- No application code needed
- Automatic versioning
- MinIO handles object lifecycle

**Cons:**

- Less control over version metadata
- Cannot add custom fields (change_reason, created_by)
- Different pattern from rest of codebase
- Complex cleanup/retention
- Cannot version metadata independently

**Decision:** REJECTED — app-level provides more control and consistency.

### Alternative B: Single Version Pointer

**Description:** Store only the latest version reference on the `files` table. Previous versions are overwritten.

**Pros:**

- Simple implementation
- No storage growth

**Cons:**

- Loses version history
- No audit trail
- Cannot revert to specific version
- Defeats the purpose of versioning

**Decision:** REJECTED — no history = no versioning.

### Alternative C: Separate Versioning Microservice

**Description:** Create a dedicated `versioning-service` microservice.

**Pros:**

- Clean separation of concerns
- Independent scaling

**Cons:**

- Over-engineering for current needs
- Adds operational complexity
- Duplicates existing Storage module infrastructure

**Decision:** REJECTED — premature optimization.

---

## Consequences

### Positive

- Complete version history for all files
- Audit trail for compliance
- Revert capability for error recovery
- Workspace-isolated access control
- Foundation for future retention policies

### Negative

- Storage duplication (N versions × file size)
- No automatic cleanup in Phase 1D
- New code complexity in Storage module

### Neutral

- New service/controller/repository code
- Schema enhancement required (additive only)
- New API endpoints to document and maintain

---

## Schema Changes Required

| Change                               | Type       | Risk |
| ------------------------------------ | ---------- | ---- |
| Add `@@unique([file_id, version])`   | Constraint | LOW  |
| Add `size BIGINT` column             | Column     | LOW  |
| Add `created_by TEXT` FK column      | Column     | LOW  |
| Add `mime_type TEXT` column          | Column     | LOW  |
| Add `original_name TEXT` column      | Column     | LOW  |
| Add `change_reason TEXT` column      | Column     | LOW  |
| Add `@@index([file_id, created_at])` | Index      | LOW  |

All changes are additive on an empty table — zero risk.

---

## Implementation Plan

| Phase         | Deliverable                                    | Dependencies  |
| ------------- | ---------------------------------------------- | ------------- |
| 1D-Migration  | Schema enhancement                             | None          |
| 1D-Repository | IFileVersionRepository + FileVersionRepository | 1D-Migration  |
| 1D-Service    | FileVersionService                             | 1D-Repository |
| 1D-Controller | FileVersionController (6 endpoints)            | 1D-Service    |
| 1D-Tests      | Unit + Integration + E2E tests                 | 1D-Controller |
| 1D-Docs       | API docs, OpenAPI update                       | 1D-Controller |

---

## Risk Assessment

| Severity | Count | Notes                                             |
| -------- | ----- | ------------------------------------------------- |
| CRITICAL | 0     | —                                                 |
| HIGH     | 2     | Cross-workspace mitigated; no retention deferred  |
| MEDIUM   | 4     | Storage duplication, large files, missing columns |
| LOW      | 5     | Checksum collision, orphan objects, etc.          |

---

## Acceptance Criteria

1. `FileVersionService` creates/list/reverts/deletes versions
2. `file_versions` rows created on each version
3. All 6 endpoints functional
4. Workspace isolation enforced
5. All existing storage tests pass
6. Schema migration applied successfully
7. `pnpm typecheck` passes

---

## Change Log

| Date       | Author             | Change      |
| ---------- | ------------------ | ----------- |
| 2026-07-25 | Chief Executive AI | Initial ADR |

---

_End of ADR-024_
