# Storage File Versioning — Schema Audit

- **Document ID:** XENNIC-STORAGE-VERSIONING-SCHEMA-AUDIT
- **Date:** 2026-07-25
- **Version:** 1.0.0
- **Status:** COMPLETE
- **Owner:** Chief Executive AI — Xennic Platform
- **Order:** XENNIC-STORAGE-EO-1D-REVIEW-034

---

## 1. Current Schema: `file_versions` (schema.prisma:1176-1187)

| #   | Column       | Type          | Nullable | Default  | Constraint                | Verified |
| --- | ------------ | ------------- | -------- | -------- | ------------------------- | -------- |
| 1   | `id`         | String (UUID) | NO       | `uuid()` | PRIMARY KEY               | YES      |
| 2   | `file_id`    | String        | NO       | —        | FK → `files.id` (CASCADE) | YES      |
| 3   | `version`    | Int           | NO       | `1`      | —                         | YES      |
| 4   | `path`       | String        | NO       | —        | —                         | YES      |
| 5   | `checksum`   | String?       | YES      | —        | —                         | YES      |
| 6   | `created_at` | DateTime      | NO       | `now()`  | —                         | YES      |

### Relations

| Name   | Target  | Fields    | References | OnDelete | OnUpdate           |
| ------ | ------- | --------- | ---------- | -------- | ------------------ |
| `file` | `files` | `file_id` | `id`       | CASCADE  | CASCADE (implicit) |

### Indexes

| Columns   | Type  | Name                        |
| --------- | ----- | --------------------------- |
| `file_id` | INDEX | `file_versions_file_id_idx` |

### Unique Constraints

**NONE** — this is a gap. Version duplication is possible.

---

## 2. Current Schema: `files` (schema.prisma:1148-1174)

| #   | Column          | Type          | Nullable | Default  | Notes           |
| --- | --------------- | ------------- | -------- | -------- | --------------- |
| 1   | `id`            | String (UUID) | NO       | `uuid()` | PK              |
| 2   | `workspace_id`  | String        | NO       | —        | FK → workspaces |
| 3   | `bucket`        | String        | NO       | —        | MinIO bucket    |
| 4   | `path`          | String        | NO       | —        | Object key      |
| 5   | `filename`      | String        | NO       | —        | UUID-based name |
| 6   | `original_name` | String        | NO       | —        | Upload name     |
| 7   | `extension`     | String        | NO       | —        | File extension  |
| 8   | `mime_type`     | String        | NO       | —        | MIME type       |
| 9   | `size`          | BigInt        | NO       | —        | Bytes           |
| 10  | `checksum`      | String?       | YES      | —        | SHA-256         |
| 11  | `uploaded_by`   | String        | NO       | —        | FK → users      |
| 12  | `created_at`    | DateTime      | NO       | `now()`  | Timestamp       |
| 13  | `deleted_at`    | DateTime?     | YES      | —        | Soft delete     |

### Relations (from files → versions)

```
versions file_versions[]  (line 1166)
```

---

## 3. Database State

| Table           | Row Count | Verified                     |
| --------------- | --------- | ---------------------------- |
| `file_versions` | **0**     | YES — `psql SELECT COUNT(*)` |
| `files`         | **0**     | YES — `psql SELECT COUNT(*)` |

**Conclusion:** Both tables empty. No data migration or backfill required for any schema changes.

---

## 4. Gap Analysis

### 4.1 Missing Unique Constraint

**Gap:** No `@@unique([file_id, version])` constraint exists.

**Impact:** Application code could theoretically insert duplicate `(file_id, version)` rows. Currently prevented only by application logic (if implemented).

**Required:** Add `@@unique([file_id, version])` in Phase 1D migration.

### 4.2 Missing Columns

| Column          | Purpose                   | Priority | Notes                                    |
| --------------- | ------------------------- | -------- | ---------------------------------------- |
| `size`          | Per-version size tracking | HIGH     | Each version may differ in size          |
| `created_by`    | User attribution          | HIGH     | FK → users; who created this version     |
| `mime_type`     | Per-version MIME override | MEDIUM   | Inherited from parent; can be overridden |
| `original_name` | Per-version name          | MEDIUM   | Inherited from parent; can be overridden |
| `change_reason` | Audit trail               | LOW      | Optional; why this version was created   |

### 4.3 Missing Index

**Gap:** No composite index for ordered listing.

**Impact:** `ORDER BY created_at` on version list queries will be slow with many versions per file.

**Required:** Add `@@index([file_id, created_at])` in Phase 1D migration.

### 4.4 Missing Relation

**Gap:** `created_by` has no FK → `users` relation.

**Impact:** No referential integrity for user attribution.

**Required:** Add FK constraint when adding `created_by` column.

---

## 5. Target Schema (After Phase 1D Migration)

```prisma
model file_versions {
  id            String    @id @default(uuid())
  file_id       String
  version       Int       @default(1)
  path          String
  size          BigInt
  mime_type     String
  original_name String
  checksum      String?
  change_reason String?
  created_by    String
  created_at    DateTime  @default(now())

  file  files @relation(fields: [file_id], references: [id], onDelete: Cascade)
  user  users @relation(fields: [created_by], references: [id], onDelete: SetNull)

  @@unique([file_id, version])
  @@index([file_id])
  @@index([file_id, created_at])
}
```

---

## 6. Migration SQL

```sql
-- Phase 1D: File Versioning Schema Enhancement
-- Safe on empty table (0 rows in file_versions)

-- Step 1: Add missing columns
ALTER TABLE "file_versions" ADD COLUMN "size" BIGINT;
ALTER TABLE "file_versions" ADD COLUMN "created_by" TEXT;
ALTER TABLE "file_versions" ADD COLUMN "mime_type" TEXT;
ALTER TABLE "file_versions" ADD COLUMN "original_name" TEXT;
ALTER TABLE "file_versions" ADD COLUMN "change_reason" TEXT;

-- Step 2: Add unique constraint
ALTER TABLE "file_versions" ADD CONSTRAINT "file_versions_file_id_version_key"
  UNIQUE ("file_id", "version");

-- Step 3: Add FK constraint for created_by
ALTER TABLE "file_versions" ADD CONSTRAINT "file_versions_created_by_fkey"
  FOREIGN KEY ("created_by") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 4: Add composite index for ordered listing
CREATE INDEX "file_versions_file_id_created_at_idx"
  ON "file_versions"("file_id", "created_at");
```

---

## 7. Verification Queries (Post-Migration)

```sql
-- Verify columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'file_versions'
ORDER BY ordinal_position;

-- Verify unique constraint
SELECT conname, contype
FROM pg_constraint
WHERE conrelid = 'file_versions'::regclass AND contype = 'u';

-- Verify indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'file_versions';

-- Verify FK constraints
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'file_versions'::regclass AND contype = 'f';
```

---

## 8. Backward Compatibility

| Change                     | Backward Compatible | Notes                     |
| -------------------------- | ------------------- | ------------------------- |
| Add `size` column          | YES                 | Nullable initially        |
| Add `created_by` column    | YES                 | Nullable, FK optional     |
| Add `mime_type` column     | YES                 | Nullable                  |
| Add `original_name` column | YES                 | Nullable                  |
| Add `change_reason` column | YES                 | Nullable                  |
| Add unique constraint      | YES                 | Empty table, no conflicts |
| Add index                  | YES                 | Instant on empty table    |
| Add FK constraint          | YES                 | No rows to validate       |

**All changes are backward compatible.**

---

## 9. Data Impact

- **Rows in file_versions:** 0
- **Rows in files:** 0
- **Backfill required:** NO
- **Destructive operations:** NONE
- **Lock required:** Minimal (empty table)

---

## 10. Change Log

| Date       | Author             | Change                                                                     |
| ---------- | ------------------ | -------------------------------------------------------------------------- |
| 2026-07-25 | Chief Executive AI | Initial schema audit                                                       |
| 2026-07-25 | Order 035          | Schema changes applied to prisma/schema.prisma; migration blocked by drift |

### Order 035 Status

- **Schema edit:** APPLIED — file_versions model updated with 5 new columns, unique constraint, composite index, FK relation
- **Prisma validate:** PASS
- **Migration generation:** BLOCKED — pre-existing drift (calculation tables)
- **Database state:** Unchanged (migration not applied)
- **Backup:** `/tmp/opencode/backups/xennic-pre-phase1d-20260725_102729.dump`

---

_End of Schema Audit_
