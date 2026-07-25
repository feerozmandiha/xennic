# ADR-023: Storage Project Attachment Model

**Status:** PROPOSED
**Date:** 2026-07-19
**Deciders:** Chief Executive AI, OpenCode
**Order:** XENNIC-STORAGE-EO-1B-REVIEW-009

---

## Context

The Xennic platform has a Storage Module (`apps/api/src/modules/storage/`) that manages files at the workspace level. Engineering projects (`apps/api/src/modules/project/`) need to associate multiple files with projects (CAD drawings, specifications, calculation reports, photos, standards references).

### Current State

```
files.workspace_id ──FK──▶ workspaces.id
files.uploaded_by ──FK──▶ users.id
project_reports.file_id ──FK──▶ files.id
knowledge_documents.storage_file_id ──FK──▶ files.id
users.avatar_file_id ──FK──▶ files.id
```

### Problem

1. `project_reports.file_id` is semantically limited to report files
2. No direct project → files relationship exists
3. No way to "list all files for project X"
4. No way to "upload file for project" directly
5. Option A (use existing relations) does NOT cover "multiple files per project"

---

## Decision

### **We will create a `project_files` junction table (Option B).**

---

## Rationale

### Why NOT Option A (Use Existing Relations)

Option A was previously selected but found to be INSUFFICIENT because:

- `project_reports` is designed for report metadata, not generic file association
- Using it for CAD drawings, photos, specs is semantically wrong
- No direct query path from project → files
- Each file would need a dummy "report" row just to create the association

### Why NOT Option C (Generic attachments)

Option C (generic `attachments` table with `entity_type` + `entity_id`) is:

- Over-engineered for the current use case
- Polymorphic queries are complex and error-prone
- Type safety is weaker (entity_type is a string)
- No other entity currently needs generic file attachment
- Can be considered for future phases if needed

### Why Option B (project_files)

Option B is:

- **Direct** — clear many-to-many between projects and files
- **Simple** — standard junction table, no polymorphic complexity
- **Type-safe** — strong FK constraints
- **Performant** — simple JOINs, standard indexes
- **Auditable** — `attached_by` field for audit trail
- **Compatible** — works with existing workspace isolation
- **Extensible** — can add `role String?` later for file categorization

---

## Consequences

### Positive

1. Engineering projects can have multiple files directly
2. Files can be queried by project_id efficiently
3. File-project associations are explicit and auditable
4. Workspace isolation is inherited through project_id → projects.workspace_id
5. Knowledge Factory and other modules remain unaffected

### Negative

1. One new table in database
2. Migration required (simple CREATE TABLE)
3. One more JOIN in project file queries
4. Slight increase in schema complexity

### Neutral

1. `project_reports.file_id` remains for report-specific file linking
2. `knowledge_documents.storage_file_id` remains for document-specific file linking
3. `users.avatar_file_id` remains for avatar file linking
4. No API changes required (association is additive)

---

## Schema

```prisma
model project_files {
  id          String   @id @default(uuid())
  project_id  String
  file_id     String
  attached_by String
  created_at  DateTime @default(now())

  project  projects @relation(fields: [project_id], references: [id], onDelete: Cascade)
  file     files    @relation(fields: [file_id], references: [id], onDelete: Restrict)
  attacher users    @relation(fields: [attached_by], references: [id])

  @@unique([project_id, file_id])
  @@index([project_id])
  @@index([file_id])
}
```

### Design Decisions

| Decision           | Choice                | Rationale                                             |
| ------------------ | --------------------- | ----------------------------------------------------- |
| onDelete (project) | Cascade               | Deleting project removes associations; files survive  |
| onDelete (file)    | Restrict              | Prevents deletion of files still attached to projects |
| Unique constraint  | (project_id, file_id) | Prevents duplicate associations                       |
| attached_by        | Required              | Audit trail for who attached the file                 |
| role column        | Not in Phase 1B       | Can be added later for file categorization            |

---

## Compatibility

| Module             | Compatible | Notes                                     |
| ------------------ | ---------- | ----------------------------------------- |
| Storage Module     | ✅         | No changes needed                         |
| Knowledge Factory  | ✅         | Uses storage_file_id independently        |
| Engineering Module | ✅         | Similar pattern to calculation.project_id |
| Frontend           | ✅         | Additive — can show project files section |
| RBAC               | ✅         | Uses projects.update permission           |
| Audit Logs         | ✅         | Can track attach/detach operations        |

---

## Alternatives Considered

### Alternative 1: Add project_id to files

Rejected because:

- Files can be shared across projects
- Adding project_id makes files project-scoped, not workspace-scoped
- Would break existing workspace-level file management

### Alternative 2: Use metadata JSON on files

Rejected because:

- No FK constraint — data integrity issues
- Complex queries — JSON parsing required
- No standard indexes — performance issues

### Alternative 3: Extend project_reports

Rejected because:

- Semantically wrong — a CAD drawing is not a "report"
- Limited to one file per report
- Would require restructuring existing report logic

---

## References

- `prisma/schema.prisma:1130-1155` — files model
- `prisma/schema.prisma:420-444` — projects model
- `prisma/schema.prisma:473-483` — project_reports model
- `apps/api/src/modules/storage/` — Storage Module
- `apps/api/src/modules/project/` — Project Module
- XENNIC-STORAGE-EO-1B-REVIEW-009 — Engineering Order

---

_Change Log_

- 2026-07-19: Initial ADR created (PROPOSED)
