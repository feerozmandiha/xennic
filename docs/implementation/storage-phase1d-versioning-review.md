# Storage Phase 1D — File Versioning Review

- **Document ID:** XENNIC-STORAGE-PHASE1D-REVIEW
- **Date:** 2026-07-25
- **Version:** 1.0.0
- **Status:** COMPLETE
- **Owner:** Chief Executive AI — Xennic Platform
- **Order:** XENNIC-STORAGE-EO-1D-REVIEW-034
- **Branch:** arena/019f75f0-xennic

---

## 1. Executive Summary

Phase 1D activates the existing `file_versions` dead schema into a fully functional application-level file versioning system. The table exists since the initial migration (2026-06-02) but has zero code references and zero rows.

This review provides the complete architecture, domain decisions, API design, migration analysis, security assessment, and test strategy required before implementation.

---

## 2. Verified Schema Facts

### 2.1 `file_versions` Table (schema.prisma:1176-1187)

| Column       | Type          | Nullable | Default  | Notes                                |
| ------------ | ------------- | -------- | -------- | ------------------------------------ |
| `id`         | String (UUID) | NO       | `uuid()` | Primary key                          |
| `file_id`    | String        | NO       | —        | FK → `files.id`, `onDelete: Cascade` |
| `version`    | Int           | NO       | `1`      | Version number                       |
| `path`       | String        | NO       | —        | Object storage path                  |
| `checksum`   | String?       | YES      | —        | SHA-256 hash                         |
| `created_at` | DateTime      | NO       | `now()`  | Creation timestamp                   |

**Relations:**

- `file files @relation(fields: [file_id], references: [id], onDelete: Cascade)`

**Indexes:**

- `@@index([file_id])` — only index

**Missing (not in schema):**

- `@@unique([file_id, version])` — no uniqueness guarantee
- `size` — no size tracking per version
- `created_by` — no user attribution
- `mime_type` — no per-version MIME (inherits from parent)
- `original_name` — no per-version name (inherits from parent)
- `change_reason` — no audit trail for why version was created

### 2.2 `files` Table (schema.prisma:1148-1174)

| Column          | Type          | Notes                        |
| --------------- | ------------- | ---------------------------- |
| `id`            | String (UUID) | Primary key                  |
| `workspace_id`  | String        | FK → workspaces              |
| `bucket`        | String        | MinIO bucket name            |
| `path`          | String        | Object storage path          |
| `filename`      | String        | Stored filename (UUID-based) |
| `original_name` | String        | Original upload name         |
| `extension`     | String        | File extension               |
| `mime_type`     | String        | MIME type                    |
| `size`          | BigInt        | File size in bytes           |
| `checksum`      | String?       | SHA-256                      |
| `uploaded_by`   | String        | FK → users                   |
| `created_at`    | DateTime      | Creation timestamp           |
| `deleted_at`    | DateTime?     | Soft delete marker           |

**Relation to versions:** `versions file_versions[]` (line 1166)

### 2.3 Database State

| Table           | Row Count | Orphan Status |
| --------------- | --------- | ------------- |
| `file_versions` | **0**     | N/A           |
| `files`         | **0**     | N/A           |

**Conclusion:** Both tables are empty. No data migration or backfill is required.

---

## 3. Existing Code References

### 3.1 Storage Module (apps/api/src/modules/storage/)

| File                                                | Version References | Status                         |
| --------------------------------------------------- | ------------------ | ------------------------------ |
| `domain/entities/file.entity.ts`                    | None               | No version field on entity     |
| `domain/interfaces/storage.repository.interface.ts` | None               | No version methods             |
| `application/services/storage.service.ts`           | None               | No versioning logic            |
| `infrastructure/minio/minio.service.ts`             | None               | No version-specific operations |
| `infrastructure/repositories/storage.repository.ts` | None               | No version queries             |
| `presentation/controllers/storage.controller.ts`    | None               | No version endpoints           |
| `presentation/dtos/storage.dto.ts`                  | None               | No version DTO                 |
| `storage.module.ts`                                 | None               | No version provider            |

**Total: 0 references across 8 files.**

### 3.2 Other Modules

| Module                  | `file_versions` Reference        | Related                                      |
| ----------------------- | -------------------------------- | -------------------------------------------- |
| Knowledge Factory       | None                             | Uses `storage_path` string, not versions     |
| Project                 | None                             | `ProjectFile` links to `files`, not versions |
| Calculation Platform    | `version_id` on results/formulas | Different domain, not file versioning        |
| Enterprise Intelligence | `createVersion()` methods        | Prompt/skill versioning, not file versioning |
| Knowledge               | `_createVersionSnapshot()`       | Document snapshots, not file versioning      |

### 3.3 Documentation References

| Document                              | References file_versions                                 | Context               |
| ------------------------------------- | -------------------------------------------------------- | --------------------- |
| `storage-platform-architecture.md`    | Designed FileVersion model (Section 2.2)                 | Architecture proposal |
| `ADR-021`                             | "Application-level versioning using file_versions table" | Decision record       |
| `storage-phase1-decomposition-v2.md`  | Phase 1D section (lines 361-467)                         | Implementation plan   |
| `storage-engineering-order-phase1.md` | API design + SQL enhancement (lines 142-156, 321-322)    | Original order        |
| `storage-current-state-audit.md`      | Dead schema flagged (lines 80-95)                        | Audit finding         |
| `storage-executive-summary.md`        | Dead schema confirmed (lines 74-76)                      | Executive report      |
| `storage-gap-registry.md`             | Gap entry (lines 68-69)                                  | Gap tracking          |
| `storage-phase1a-decision-log.md`     | D9: Do NOT activate in Phase 1A                          | Decision              |

---

## 4. Domain Decisions

### A. Version Identity

| #   | Question                             | Decision                                                       | Rationale                                                                 |
| --- | ------------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------- |
| A1  | Independent entity or part of File?  | **Independent entity** (separate row)                          | Existing schema design; flexible metadata per version                     |
| A2  | Each version has independent object? | **YES** — separate MinIO object per version                    | Path stored in `file_versions.path`; enables independent download         |
| A3  | Version immutable?                   | **YES** — version row never updated after creation             | Simplicity; audit integrity; prevents accidental corruption               |
| A4  | Active version indicator?            | **Derived** — `MAX(version)` is current; no `is_active` column | Simplicity; avoids update contention; explicit revert creates new version |
| A5  | Version numbering strategy?          | **Sequential per file** — `MAX(version) + 1`                   | Deterministic; no gaps in normal operation                                |

### B. Object Storage

| #   | Question                      | Decision                                            | Rationale                                                                              |
| --- | ----------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------- |
| B1  | Object key pattern?           | `{workspace_id}/{year}/{month}/{uuid}_v{N}.{ext}`   | Consistent with file pattern; version suffix prevents collision                        |
| B2  | Previous versions in MinIO?   | **YES** — remain until explicit delete              | Immutability; audit trail; enables restore                                             |
| B3  | Version deletion?             | **Hard delete** — remove from DB + MinIO object     | Individual versions don't need soft delete; file-level soft delete covers full removal |
| B4  | Restore from deleted version? | **Create new version** from source version's object | Consistent with revert model; no in-place mutations                                    |

### C. Version Creation

| #   | Question                     | Decision                                                   | Rationale                                                        |
| --- | ---------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------- |
| C1  | Auto-create on upload?       | **NO** — first upload creates File; versioning is explicit | Keeps upload path simple; versioning is opt-in per file          |
| C2  | Explicit endpoint?           | **YES** — `POST /files/:id/versions` with new file content | Clear API boundary; explicit user intent                         |
| C3  | Metadata-only version?       | **NO** — each version must have new content                | Prevents metadata-only noise; version = new object state         |
| C4  | Duplicate checksum behavior? | **Still creates version** — different path, different time | Checksum collision is valid; version is a point-in-time snapshot |
| C5  | What triggers version?       | Explicit `POST` with new file content                      | User initiates; system does not auto-version                     |

### D. Revert

| #   | Question                     | Decision                                                              | Rationale                                  |
| --- | ---------------------------- | --------------------------------------------------------------------- | ------------------------------------------ |
| D1  | Revert creates new version?  | **YES** — always creates version N+1 with content from target version | Immutability preserved; audit trail intact |
| D2  | Revert changes pointer?      | **N/A** — no explicit pointer; latest version = current               | Simplicity                                 |
| D3  | Previous versions immutable? | **YES** — never modified                                              | Audit integrity                            |
| D4  | Revert audited?              | **YES** — `file_version_reverted` event with metadata                 | Traceability                               |

### E. Access Control

| #   | Question                     | Decision                                                                           | Rationale                                   |
| --- | ---------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------- |
| E1  | Permission inheritance?      | **YES** — version inherits parent file permission                                  | Simplifies model; no per-version ACL        |
| E2  | ProjectFile on all versions? | **YES** — ProjectFile attachment covers all versions of the file                   | Attachment is file-level, not version-level |
| E3  | ProjectMemberGuard?          | **Applies** — via parent file's workspace/project chain                            | Guard already enforces on file access       |
| E4  | Workspace isolation?         | **Enforced** — version access requires file access, which requires workspace match | `_getFile()` already blocks cross-workspace |

### F. Quota and Retention

| #   | Question                    | Decision                                                   | Rationale                              |
| --- | --------------------------- | ---------------------------------------------------------- | -------------------------------------- |
| F1  | Versions in quota?          | **YES** — each version occupies storage space              | Accurate quota tracking                |
| F2  | Archived versions in quota? | **YES** — until explicitly deleted                         | Space is consumed regardless of status |
| F3  | Retention policy?           | **None in Phase 1D** — all versions retained indefinitely  | Simplest initial implementation        |
| F4  | Old version cleanup?        | **Manual only** — explicit delete per version              | User control; no automatic data loss   |
| F5  | Retention job?              | **Phase 1G** — deferred to dedicated quota/retention phase | Out of scope for versioning activation |

### G. Audit Events

| Event                     | Trigger                                          | Metadata                               |
| ------------------------- | ------------------------------------------------ | -------------------------------------- |
| `file_version_created`    | `POST /files/:id/versions` succeeds              | `file_id, version, size, checksum`     |
| `file_version_downloaded` | `GET /files/:id/versions/:vid/download` succeeds | `file_id, version`                     |
| `file_version_reverted`   | `POST /files/:id/versions/:vid/revert` succeeds  | `file_id, source_version, new_version` |
| `file_version_deleted`    | `DELETE /files/:id/versions/:vid` succeeds       | `file_id, version, size`               |
| `file_version_restored`   | Implicit in revert (same as revert)              | Covered by `file_version_reverted`     |

---

## 5. API Design

### 5.1 Endpoints

| #   | Method   | Path                                                         | Auth            | Permission     | Purpose            |
| --- | -------- | ------------------------------------------------------------ | --------------- | -------------- | ------------------ |
| 1   | `POST`   | `/api/v1/storage/files/:fileId/versions`                     | JWT + Workspace | `files.upload` | Create new version |
| 2   | `GET`    | `/api/v1/storage/files/:fileId/versions`                     | JWT + Workspace | `files.read`   | List all versions  |
| 3   | `GET`    | `/api/v1/storage/files/:fileId/versions/:versionId`          | JWT + Workspace | `files.read`   | Get version info   |
| 4   | `GET`    | `/api/v1/storage/files/:fileId/versions/:versionId/download` | JWT + Workspace | `files.read`   | Download version   |
| 5   | `POST`   | `/api/v1/storage/files/:fileId/versions/:versionId/revert`   | JWT + Workspace | `files.upload` | Revert to version  |
| 6   | `DELETE` | `/api/v1/storage/files/:fileId/versions/:versionId`          | JWT + Workspace | `files.delete` | Delete version     |

### 5.2 Request/Response Contracts

**POST /files/:fileId/versions**

```
Request: multipart/form-data { file: Binary }
Response 201: { success, data: FileVersionDto }
Errors: 400 (invalid file), 403 (no access), 404 (file not found), 413 (too large)
Idempotency: NO — always creates new version
```

**GET /files/:fileId/versions**

```
Query: ?page=1&limit=20
Response 200: { success, data: FileVersionDto[], meta: PaginationMeta }
Errors: 403 (no access), 404 (file not found)
```

**GET /files/:fileId/versions/:versionId**

```
Response 200: { success, data: FileVersionDto + downloadUrl }
Errors: 403 (no access), 404 (version not found)
```

**GET /files/:fileId/versions/:versionId/download**

```
Response 200: Binary stream (Content-Type from file, Content-Disposition attachment)
Errors: 403 (no access), 404 (version not found)
```

**POST /files/:fileId/versions/:versionId/revert**

```
Request: {} (empty body)
Response 201: { success, data: FileVersionDto } (new version created)
Errors: 403 (no access), 404 (version not found)
Idempotency: NO — creates new version each time
```

**DELETE /files/:fileId/versions/:versionId**

```
Response 204: No content
Errors: 403 (no access), 404 (version not found), 409 (cannot delete latest version)
```

---

## 6. Migration Analysis

### 6.1 Required Schema Changes

| Change                               | Type       | Risk | Notes                                             |
| ------------------------------------ | ---------- | ---- | ------------------------------------------------- |
| Add `@@unique([file_id, version])`   | Constraint | LOW  | Table empty, no conflicts                         |
| Add `size` column (BigInt)           | Column     | LOW  | Nullable initially, backfill from MinIO if needed |
| Add `created_by` column (String)     | Column     | LOW  | FK → users; nullable initially                    |
| Add `mime_type` column (String)      | Column     | LOW  | Inherited from parent; nullable                   |
| Add `original_name` column (String)  | Column     | LOW  | Inherited from parent; nullable                   |
| Add `change_reason` column (String?) | Column     | LOW  | Nullable; optional audit field                    |
| Add `@@index([file_id, created_at])` | Index      | LOW  | Composite for ordered listing                     |

### 6.2 Migration Safety

- Table is **empty** — all changes are safe
- No data backfill required
- New columns are nullable — backward compatible
- Unique constraint can be added without lock (empty table)
- All changes are additive (no drops, no renames)

### 6.3 Migration SQL

```sql
-- Phase 1D: File Versioning Schema Enhancement
ALTER TABLE "file_versions" ADD COLUMN "size" BIGINT;
ALTER TABLE "file_versions" ADD COLUMN "created_by" TEXT;
ALTER TABLE "file_versions" ADD COLUMN "mime_type" TEXT;
ALTER TABLE "file_versions" ADD COLUMN "original_name" TEXT;
ALTER TABLE "file_versions" ADD COLUMN "change_reason" TEXT;

ALTER TABLE "file_versions" ADD CONSTRAINT "file_versions_file_id_version_key"
  UNIQUE ("file_id", "version");

ALTER TABLE "file_versions" ADD CONSTRAINT "file_versions_created_by_fkey"
  FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "file_versions_file_id_created_at_idx"
  ON "file_versions"("file_id", "created_at");
```

---

## 7. Security Review

### 7.1 Threat Analysis

| #   | Threat                         | Severity | Mitigation                                                                           |
| --- | ------------------------------ | -------- | ------------------------------------------------------------------------------------ |
| S1  | Cross-workspace version access | HIGH     | Inherited from parent file; `StorageService._getFile()` enforces workspace match     |
| S2  | Cross-project version access   | HIGH     | `ProjectMemberGuard` on parent file covers all versions                              |
| S3  | Deleted file version access    | MEDIUM   | `findById` filters `deleted_at IS NULL`; versions cascade on file delete             |
| S4  | Signed URL exposure            | MEDIUM   | Presigned URLs have expiry (3600s default); workspace-scoped                         |
| S5  | Version enumeration            | LOW      | Sequential version IDs not exposed; UUIDs used for version IDs                       |
| S6  | Authorization inheritance      | LOW      | Versions don't have own permissions; parent file permissions apply                   |
| S7  | Audit completeness             | MEDIUM   | All 5 operations logged; Phase 1E activates audit_logs                               |
| S8  | Retention/legal deletion       | LOW      | No automatic deletion; manual delete available; Phase 1G handles retention           |
| S9  | Object key predictability      | LOW      | UUID-based keys; version suffix is predictable but non-guessable without file access |
| S10 | Checksum disclosure            | LOW      | Checksum stored in DB only; not exposed in download URLs                             |
| S11 | Metadata leakage               | LOW      | Version metadata requires file access; workspace-scoped                              |

### 7.2 Critical Risks

**None identified.** All HIGH risks are mitigated by existing file access controls.

### 7.3 High Risks

- **S1, S2:** Mitigated by inheritance model — no new access control code needed
- **S3:** Mitigated by CASCADE DELETE on file — orphan versions impossible

---

## 8. Performance Review

### 8.1 Assumptions (Unverified)

| #   | Assumption                                | Verification Required              |
| --- | ----------------------------------------- | ---------------------------------- |
| P1  | Average versions per file < 10            | Production usage data needed       |
| P2  | Version creation latency < 500ms          | Baseline measurement needed        |
| P3  | Version list query < 100ms                | EXPLAIN ANALYZE on populated table |
| P4  | Download throughput matches file download | MinIO performance baseline         |

### 8.2 Performance Characteristics

| Operation        | Complexity                       | Index Support               | Notes                      |
| ---------------- | -------------------------------- | --------------------------- | -------------------------- |
| Create version   | O(1) DB + O(n) upload            | —                           | Upload time dominates      |
| List versions    | O(v) where v = versions per file | `file_id, created_at` index | Paginated                  |
| Get version      | O(1)                             | Primary key                 | Fast                       |
| Download version | O(1) DB + O(s) transfer          | —                           | Transfer time dominates    |
| Revert           | O(1) DB + O(s) copy              | —                           | Copies content from source |
| Delete version   | O(1) DB + O(1) MinIO             | Primary key                 | Fast                       |

### 8.3 Performance Risks

| Risk                                | Severity | Mitigation                                               |
| ----------------------------------- | -------- | -------------------------------------------------------- |
| Large file versioning (100MB+)      | MEDIUM   | Upload streaming; no in-memory buffer                    |
| Storage duplication                 | MEDIUM   | Each version is independent object; quota enforced       |
| Concurrent version creation         | LOW      | Unique constraint prevents duplicate (file_id, version)  |
| Checksum calculation on large files | LOW      | SHA-256 streaming; already implemented in StorageService |

### 8.4 Baseline

**NOT VERIFIED** — no production data or performance baseline exists. All performance claims are design-level estimates.

---

## 9. Test Strategy

### 9.1 Unit Tests

| #   | Test                                   | Method                             | Expected                      |
| --- | -------------------------------------- | ---------------------------------- | ----------------------------- |
| U1  | createVersion creates row in DB        | FileVersionService.createVersion   | file_versions row exists      |
| U2  | createVersion uploads to MinIO         | FileVersionService.createVersion   | Object exists in bucket       |
| U3  | createVersion returns FileVersionDto   | FileVersionService.createVersion   | DTO has all fields            |
| U4  | listVersions returns paginated results | FileVersionService.listVersions    | Sorted by version ASC         |
| U5  | getVersion returns correct version     | FileVersionService.getVersion      | Matches requested version     |
| U6  | revertToVersion creates new version    | FileVersionService.revertToVersion | New row with MAX(version)+1   |
| U7  | revertToVersion copies content         | FileVersionService.revertToVersion | New version has same checksum |
| U8  | deleteVersion removes from DB + MinIO  | FileVersionService.deleteVersion   | Row and object gone           |
| U9  | deleteVersion blocks latest version    | FileVersionService.deleteVersion   | 409 Conflict                  |
| U10 | createVersion validates file exists    | FileVersionService.createVersion   | 404 if file not found         |

### 9.2 Integration Tests

| #   | Test                                                              | Setup                                  | Expected                   |
| --- | ----------------------------------------------------------------- | -------------------------------------- | -------------------------- |
| I1  | Full lifecycle: upload → version → list → revert                  | Create file, add version, list, revert | All operations succeed     |
| I2  | Version isolation: workspace A cannot access workspace B versions | Two workspaces, cross-access attempt   | 403 Forbidden              |
| I3  | Cascade: delete file removes all versions                         | File with versions, delete file        | All versions removed       |
| I4  | Concurrent version creation                                       | Parallel createVersion calls           | Unique constraint enforced |
| I5  | Large file versioning (1MB+)                                      | Upload 1MB file, create version        | Success within timeout     |

### 9.3 E2E Tests

| #   | Test                                                                | Flow                            |
| --- | ------------------------------------------------------------------- | ------------------------------- |
| E1  | Upload file → create version → download version → compare checksums | Full round-trip                 |
| E2  | Upload file → create 3 versions → list → verify ordering            | Pagination and ordering         |
| E3  | Upload file → revert to v1 → verify v3 still exists                 | Revert creates, doesn't destroy |

---

## 10. Quality Gate Status

| Gate                 | Status                 | Evidence                                                  |
| -------------------- | ---------------------- | --------------------------------------------------------- |
| Architecture Review  | **PASS**               | Decisions documented in Section 4; ADR-024 created        |
| Database Review      | **PASS**               | Schema facts verified (Section 2); DB empty (Section 2.3) |
| Security Review      | **NOT VERIFIED**       | Threat model complete; penetration testing deferred       |
| Performance Review   | **NOT VERIFIED**       | No baseline; all claims are estimates                     |
| API Review           | **DESIGN REVIEW ONLY** | No implementation yet                                     |
| Migration Review     | **NOT VERIFIED**       | Migration designed; not executed                          |
| Testing Review       | **DESIGN REVIEW ONLY** | Test strategy defined; no tests written                   |
| Documentation Review | **PASS**               | 7 documents created                                       |
| Acceptance Review    | **NOT VERIFIED**       | Pending implementation                                    |

---

## 11. Open Decisions

| #   | Decision                             | Status   | Blocker             |
| --- | ------------------------------------ | -------- | ------------------- |
| O1  | Auto-versioning on upload (future)   | DEFERRED | Phase 1G+           |
| O2  | Version comparison/diff              | DEFERRED | UI requirement      |
| O3  | Chunk-level diffing                  | DEFERRED | Out of scope        |
| O4  | MinIO bucket versioning vs app-level | RESOLVED | App-level (ADR-021) |
| O5  | Version retention policy             | DEFERRED | Phase 1G            |

---

## 12. Recommended Implementation Order

1. **Phase 1D-Migration:** Schema enhancement (add columns, constraints, indexes)
2. **Phase 1D-Repository:** `IFileVersionRepository` + `FileVersionRepository`
3. **Phase 1D-Service:** `FileVersionService` (create, list, get, revert, delete)
4. **Phase 1D-Controller:** `FileVersionController` (6 endpoints)
5. **Phase 1D-Tests:** Unit + Integration tests
6. **Phase 1D-Docs:** API docs, OpenAPI update

---

## 13. Confirmations

| Item                   | Confirmed                                      |
| ---------------------- | ---------------------------------------------- |
| No code changes        | YES — this is audit + design only              |
| No schema changes      | YES — no modifications to prisma/schema.prisma |
| No migrations executed | YES                                            |
| No commits             | YES                                            |
| No pushes              | YES                                            |
| No file deletions      | YES                                            |
| No branch changes      | YES                                            |

---

## Change Log

| Date       | Order | Change                                                                  | Status      |
| ---------- | ----- | ----------------------------------------------------------------------- | ----------- |
| 2026-07-25 | 034   | Initial review and architecture design                                  | COMPLETE    |
| 2026-07-25 | 035   | Schema foundation applied to prisma/schema.prisma                       | SCHEMA DONE |
| 2026-07-25 | 035   | Migration generation blocked by pre-existing drift (calculation tables) | BLOCKED     |

### Order 035 Migration Attempt

- **Migration name:** `storage_phase1d_versioning_foundation`
- **Status:** BLOCKED — drift detected (calculation tables outside migration history)
- **Schema change:** Applied to `prisma/schema.prisma` (validated OK)
- **Backup:** `/tmp/opencode/backups/xennic-pre-phase1d-20260725_102729.dump` (352K, sha256: 7e63d8c0)
- **Drift cause:** 11 calculation tables created outside Prisma migrations (pre-existing)
- **Recommended reconciliation:** XENNIC-DRIFT-RECONCILIATION order to resolve calculation table drift before Phase 1D migration can proceed

---

_End of Phase 1D Versioning Review_
