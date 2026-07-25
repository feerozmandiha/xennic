# Xennic Storage Platform — Executive Summary

## Document Identity

| Field                | Value                                                                                                                                                                                                                                                                                                                                                                   |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Document ID**      | XENNIC-STORAGE-001-EXEC                                                                                                                                                                                                                                                                                                                                                 |
| **Version**          | 1.0.0                                                                                                                                                                                                                                                                                                                                                                   |
| **Date**             | 2026-07-19                                                                                                                                                                                                                                                                                                                                                              |
| **Status**           | FINAL                                                                                                                                                                                                                                                                                                                                                                   |
| **Owner**            | Chief Executive AI — Xennic Platform                                                                                                                                                                                                                                                                                                                                    |
| **Scope**            | Audit, analysis, and architectural recommendation for the entire file storage subsystem across Xennic                                                                                                                                                                                                                                                                   |
| **Source Documents** | `storage-current-state-audit.md`, `storage-platform-architecture.md`, `ADR-021`, `storage-gap-registry.md`, `storage-dependency-graph.md`, `storage-api-inventory.md`, `storage-database-inventory.md`, `storage-permission-matrix.md`, `storage-lifecycle-state-machine.md`, `storage-risk-register.md`, `storage-test-gap-matrix.md`, `storage-migration-strategy.md` |

---

## Executive Decision

After a full audit of the Xennic storage subsystem, the recommendation is to **proceed to Phase 1 implementation** of a unified Canonical File, Document, Asset & Attachment Platform. The current system contains two independent storage abstractions that will diverge further without intervention. The schema-only changes in Phase 1 carry low risk and create the foundation for eliminating duplication in later phases. No production code changes or migrations should be executed without separate explicit approval.

---

## Business Need

Xennic serves electrical engineers and enterprises requiring centralized management of diverse file types. The platform must handle:

- **User files** — avatars, profile documents, personal uploads
- **Workspace files** — shared workspace documents, settings exports
- **Project files** — engineering reports, calculations output, project attachments
- **Technical documents** — engineering standards (IEC, IEEE), technical specifications, datasheets
- **PDF files** — reports, manuals, safety certificates, compliance documents
- **Receipts** — energy billing receipts uploaded via bill analyzer component
- **Nameplates** — equipment nameplate images processed by vision-service OCR
- **Images** — product photos, diagrams, site photos, equipment images
- **Knowledge Documents** — ingested via Knowledge Factory pipeline (classify, parse, chunk, embed, publish)
- **Hero images** — workspace landing page hero media
- **Favicon** — workspace-level brand favicon
- **Brand assets** — logos, brand media, product images for marketplace vendors

Without a unified storage platform, each of these file types follows different storage paths, metadata schemas, and access control rules — creating operational risk and maintenance burden.

---

## Current State

### Storage Module

The Storage module (`apps/api/src/modules/storage/`) contains 8 TypeScript files following DDD layering:

| Layer          | Component                                                | Status         |
| -------------- | -------------------------------------------------------- | -------------- |
| Domain         | `FileEntity` with `FileBucket` type                      | ✅ Implemented |
| Domain         | `IStorageRepository` interface (6 methods)               | ✅ Implemented |
| Application    | `StorageService` (upload, download, list, delete, stats) | ✅ Implemented |
| Infrastructure | `MinioService` (MinIO client wrapper)                    | ✅ Implemented |
| Infrastructure | `StorageRepository` (raw SQL via Prisma)                 | ✅ Implemented |
| Presentation   | `StorageController` (7 REST endpoints)                   | ✅ Implemented |
| Presentation   | `FileResponseDto`, `StorageStatsDto`                     | ✅ Implemented |

The module exports `StorageService` and `MinioService`. It depends on `WorkspaceModule` and `RbacModule`.

### MinIO Integration

Six official buckets are defined in `MinioService.BUCKETS`: `public`, `private`, `reports`, `documents`, `engineering`, `ai`. Bucket creation is handled by `ensureAllBuckets()`. MinIO connection uses environment variables (`MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_USE_SSL`). MinIO is **not** included in the base Docker Compose file — it exists only in the production compose and is referenced as an external service.

### FileEntity

`FileEntity` is a domain entity with `create()` and `reconstitute()` factory methods. It carries fields for workspace, bucket, path, filename, original name, extension, MIME type, size, checksum, uploader, and timestamps. The `objectKey` getter produces the full MinIO path. The entity supports `softDelete()` and `isDeleted()` checks. It has no version, visibility, or status fields.

### Files Table

The `files` table in Prisma schema contains 13 columns: `id`, `workspace_id`, `bucket`, `path`, `filename`, `original_name`, `extension`, `mime_type`, `size` (BigInt), `checksum`, `uploaded_by`, `created_at`, `deleted_at`. It has relations to `workspaces` and `users`, and a `versions` relation to `file_versions`. Indexes exist on `workspace_id`, `uploaded_by`, and `mime_type`.

### file_versions Table

The `file_versions` table exists in the Prisma schema with columns: `id`, `file_id` (FK with CASCADE), `version` (default 1), `path`, `checksum`, `created_at`. However, **no code in the Storage module or anywhere else in the codebase creates or reads from this table**. It is dead schema — present but unused.

### Knowledge Factory Storage

The Knowledge Factory module has its own storage abstraction consisting of three components:

1. `IStorageService` interface with 4 methods: `upload(buffer, path, contentType) → string`, `download(path) → Buffer`, `delete(path)`, `exists(path) → boolean`
2. `MinioStorageService` adapter class that wraps an anonymous typed service object with bucket+path methods, using a configurable bucket name (default: `knowledge-factory`)
3. `DocumentIntakeService` that calls `IStorageService.upload()` to store documents

The Knowledge Factory module binds `IStorageService` to `StorageService` via `useExisting` in `knowledge-factory.module.ts:70`. This binding is **type-incompatible** — `StorageService.upload()` expects a complex object `{workspaceId, uploadedBy, buffer, originalName, mimeType, bucket?}`, while `IStorageService.upload()` expects `(buffer, path, contentType)`. This is a critical runtime type mismatch.

Documents are stored with a `storage_path` string in the `knowledge_documents` table. This path is formatted as `workspaces/{workspaceId}/{uuid}-{filename}` — a different strategy from the Storage module's `{workspaceId}/{year}/{month}/{filename}`.

### Frontend Integration

The frontend has multiple upload entry points:

| Component                  | Upload Target                        | Description                                           |
| -------------------------- | ------------------------------------ | ----------------------------------------------------- |
| `storage-client.tsx`       | `POST /storage/upload`               | File management page — upload, list, download, delete |
| `knowledge-editor.tsx`     | `POST /storage/upload`               | Knowledge article image uploads                       |
| `vision-upload-client.tsx` | Direct to vision-service (port 8003) | Image analysis — bypasses API                         |
| `bill-analyzer.tsx`        | Direct to vision-service             | Bill/receipt processing — bypasses API                |

The dashboard displays storage stats via `GET /storage/stats`. Workspace dashboard shows storage usage in GB.

### Production Configuration

Production environment variables for storage include: `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_USE_SSL`, `MINIO_BUCKET_UPLOADS`. File size limits are defined in both the controller (100MB) and the service (100MB). The Knowledge Factory uses a separate `MulterModule` with a 50MB limit.

### Local Docker Configuration

MinIO is absent from `infrastructure/docker/compose/base/docker-compose.yml`. The base compose only includes PostgreSQL 17, Redis 8, RabbitMQ 4, and the three Python microservices. MinIO must be started separately for local development.

---

## Current Architecture

The storage architecture currently consists of two parallel, unconnected paths:

```
Path A (Storage Module):
  Frontend → StorageController → StorageService → MinioService → MinIO
                                    ↓
                             StorageRepository → PostgreSQL (files table)

Path B (Knowledge Factory):
  Frontend → DocumentsController → DocumentIntakeService → IStorageService → StorageService*
                                    ↓                                    (*type mismatch)
                             KnowledgeDocumentRepository → PostgreSQL (knowledge_documents table)
```

Both paths use PostgreSQL for metadata and MinIO for object storage, but they share no code, interfaces, or validation logic. The Storage module enforces MIME whitelist and file size limits; the Knowledge Factory has no validation at all.

---

## Critical Findings

### CRIT-001: Dual Storage Abstraction

| Field              | Value                                                                                                                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**             | CRIT-001                                                                                                                                                                                                      |
| **Finding**        | Two independent storage abstractions operating in parallel                                                                                                                                                    |
| **Location**       | `apps/api/src/modules/storage/` and `apps/api/src/modules/knowledge-factory/infrastructure/storage/`                                                                                                          |
| **Evidence**       | `StorageService` has its own `IStorageRepository` interface; `DocumentIntakeService` uses a separate `IStorageService` interface. Two MinIO client initializations. Two path strategies. Two metadata stores. |
| **Impact**         | Growing divergence between modules; no shared validation; duplicate MinIO connections; inconsistent path strategies; each module evolves independently creating architecture drift                            |
| **Severity**       | CRITICAL                                                                                                                                                                                                      |
| **Recommendation** | Unify all file operations through a single `IStorageService` interface exported from the Storage module. Remove the duplicate `MinioStorageService` from Knowledge Factory. (ADR-021)                         |
| **Status**         | OPEN                                                                                                                                                                                                          |

### CRIT-002: Orphan File References Without FK Constraints

| Field              | Value                                                                                                                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**             | CRIT-002                                                                                                                                                                                |
| **Finding**        | `users.avatar_file_id` and `project_reports.file_id` are string columns that reference files without foreign key constraints                                                            |
| **Location**       | `prisma/schema.prisma` lines 29 and 475                                                                                                                                                 |
| **Evidence**       | `users` model has `avatar_file_id String?` with no `@relation` to `files`. `project_reports` model has `file_id String?` with no `@relation` to `files`. Both fields are plain strings. |
| **Impact**         | Orphaned references point to deleted files. No referential integrity. Broken avatar display or report access when referenced file is deleted.                                           |
| **Severity**       | CRITICAL                                                                                                                                                                                |
| **Recommendation** | Add FK constraints with `ON DELETE SET NULL` behavior. Migrate existing string values to proper UUID references.                                                                        |
| **Status**         | OPEN                                                                                                                                                                                    |

### CRIT-003: Knowledge Factory storage_path Not Linked to files Table

| Field              | Value                                                                                                                                                                                                            |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**             | CRIT-003                                                                                                                                                                                                         |
| **Finding**        | `knowledge_documents.storage_path` is a raw string with no foreign key to the `files` table                                                                                                                      |
| **Location**       | `prisma/schema.prisma` line 954; `knowledge-document.entity.ts` line 16                                                                                                                                          |
| **Evidence**       | Knowledge Factory stores `storage_path` as `workspaces/{workspaceId}/{uuid}-{filename}`. This path does not correspond to any record in the `files` table. The two storage systems track metadata independently. |
| **Impact**         | No referential integrity between knowledge documents and physical files. Orphan objects possible. No shared metadata (checksum, size verification).                                                              |
| **Severity**       | CRITICAL                                                                                                                                                                                                         |
| **Recommendation** | Add `file_id` FK column to `knowledge_documents`. Migrate `storage_path` references to linked `files` records.                                                                                                   |
| **Status**         | OPEN                                                                                                                                                                                                             |

---

## High Findings

### HIGH-001: File Versioning Schema Exists But No Code

| Field              | Value                                                                                                                                                                  |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**             | HIGH-001                                                                                                                                                               |
| **Finding**        | `file_versions` table exists in Prisma schema but no code in the repository creates or reads version records                                                           |
| **Location**       | `prisma/schema.prisma` lines 1149-1160; Storage module (no versioning code)                                                                                            |
| **Evidence**       | `StorageService` has no `createVersion()`, `getVersions()`, or `rollbackToVersion()` methods. The repository has no version-related queries. The table is dead schema. |
| **Impact**         | Cannot track file changes. No rollback capability. No audit trail of file modifications.                                                                               |
| **Severity**       | HIGH                                                                                                                                                                   |
| **Recommendation** | Implement versioning in `StorageService` as part of Phase 2.                                                                                                           |
| **Status**         | OPEN                                                                                                                                                                   |

### HIGH-002: No Object Cleanup After Soft Delete

| Field              | Value                                                                                                                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**             | HIGH-002                                                                                                                                                                                                  |
| **Finding**        | Soft-deleted files remain in MinIO indefinitely. No garbage collection mechanism exists.                                                                                                                  |
| **Location**       | `StorageService.delete()` at `storage.service.ts:148-152`                                                                                                                                                 |
| **Evidence**       | `delete()` calls `storageRepository.softDelete(file.id)` which only sets `deleted_at = NOW()`. The MinIO object is not removed. No scheduled cleanup job exists. No MinIO lifecycle policy is configured. |
| **Impact**         | Storage cost grows unbounded. Orphan objects accumulate. No way to reclaim storage space.                                                                                                                 |
| **Severity**       | HIGH                                                                                                                                                                                                      |
| **Recommendation** | Add MinIO lifecycle policy for soft-deleted objects (e.g., delete after 30 days). Implement scheduled cleanup job.                                                                                        |
| **Status**         | OPEN                                                                                                                                                                                                      |

### HIGH-003: No Quota Enforcement

| Field              | Value                                                                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **ID**             | HIGH-003                                                                                                                                                                 |
| **Finding**        | No per-workspace storage limit. Any workspace can upload unlimited data.                                                                                                 |
| **Location**       | `StorageService.upload()` at `storage.service.ts:51-100`                                                                                                                 |
| **Evidence**       | Upload method validates file size (100MB) and MIME type but never checks workspace total usage against a quota. `workspace_settings` table has no `storage_quota` field. |
| **Impact**         | Storage cost explosion risk. No resource governance. Single workspace can consume all MinIO capacity.                                                                    |
| **Severity**       | HIGH                                                                                                                                                                     |
| **Recommendation** | Add `storage_quota_bytes` to `workspace_settings`. Check quota in `StorageService.upload()` before MinIO write.                                                          |
| **Status**         | OPEN                                                                                                                                                                     |

### HIGH-004: No Audit Logging for File Operations

| Field              | Value                                                                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**             | HIGH-004                                                                                                                                                  |
| **Finding**        | File upload, download, and delete operations are not logged to `audit_logs`                                                                               |
| **Location**       | `StorageService` — all methods; `StorageController` — all endpoints                                                                                       |
| **Evidence**       | No `AuditLogService` injection or call anywhere in the storage module. The `audit_logs` table exists in schema but storage operations do not write to it. |
| **Impact**         | No compliance trail. No forensic capability. Cannot reconstruct who accessed or modified a file and when.                                                 |
| **Severity**       | HIGH                                                                                                                                                      |
| **Recommendation** | Add NestJS interceptor or manual logging in `StorageService` for upload, download, delete, and hard-delete operations.                                    |
| **Status**         | OPEN                                                                                                                                                      |

### HIGH-005: No Malware Scanning

| Field              | Value                                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **ID**             | HIGH-005                                                                                                                                   |
| **Finding**        | Uploaded files are not scanned for malware or viruses                                                                                      |
| **Location**       | `StorageService.upload()`                                                                                                                  |
| **Evidence**       | Upload flow: validate MIME → generate checksum → upload to MinIO → save metadata. No scanning step exists between upload and storage.      |
| **Impact**         | Security risk. Malicious files can be uploaded and served to other users via presigned URLs.                                               |
| **Severity**       | HIGH                                                                                                                                       |
| **Recommendation** | Integrate ClamAV or external scanning service. Add scanning step before MinIO upload. Requires separate ADR for external service decision. |
| **Status**         | OPEN                                                                                                                                       |

### HIGH-006: Knowledge Factory IStorageService Binding Type Mismatch

| Field              | Value                                                                                                                                                                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**             | HIGH-006                                                                                                                                                                                                                                           |
| **Finding**        | `knowledge-factory.module.ts:70` binds `IStorageService` to `StorageService` via `useExisting`, but the interfaces are incompatible                                                                                                                |
| **Location**       | `knowledge-factory.module.ts` line 70                                                                                                                                                                                                              |
| **Evidence**       | `IStorageService` defines `upload(buffer: Buffer, path: string, contentType: string): Promise<string>`. `StorageService.upload()` expects `{workspaceId, uploadedBy, buffer, originalName, mimeType, bucket?}`. These signatures are incompatible. |
| **Impact**         | Runtime type error when `DocumentIntakeService` calls `this.storageService.upload()`. Knowledge Factory document upload is broken.                                                                                                                 |
| **Severity**       | HIGH                                                                                                                                                                                                                                               |
| **Recommendation** | Create a proper adapter class that wraps `StorageService` and conforms to `IStorageService`. Fix in Phase 3.                                                                                                                                       |
| **Status**         | OPEN                                                                                                                                                                                                                                               |

### HIGH-007: No Unified Asset Management System

| Field              | Value                                                                                                                                                 |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**             | HIGH-007                                                                                                                                              |
| **Finding**        | UI/brand assets (logo, favicon, hero image, avatar) have no unified management system                                                                 |
| **Location**       | No `assets` table; `workspace_settings.brand.logo_url` is a text URL; `users.avatar_file_id` has no upload endpoint                                   |
| **Evidence**       | Brand logo is set via text input in settings-client.tsx. Avatar file_id exists but no upload endpoint was found. No image processing pipeline exists. |
| **Impact**         | Inconsistent asset handling. No image resizing or thumbnail generation. No CDN integration.                                                           |
| **Severity**       | HIGH                                                                                                                                                  |
| **Recommendation** | Create `AssetService` with dedicated `assets` table in Phase 4.                                                                                       |
| **Status**         | OPEN                                                                                                                                                  |

### HIGH-008: Raw SQL in StorageRepository

| Field              | Value                                                                                                                                                      |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**             | HIGH-008                                                                                                                                                   |
| **Finding**        | `StorageRepository` uses `prisma.$executeRaw` and `prisma.$queryRaw` for all database operations instead of Prisma Client methods                          |
| **Location**       | `storage.repository.ts` — all 6 methods                                                                                                                    |
| **Evidence**       | Every method uses tagged template literals: `prisma.$executeRaw\`INSERT INTO "files" ...\``, `prisma.$queryRaw\`SELECT \* FROM "files" ...\``.             |
| **Impact**         | Bypasses Prisma Client type safety. SQL injection mitigated by tagged templates but maintenance burden is high. Schema changes require manual SQL updates. |
| **Severity**       | HIGH                                                                                                                                                       |
| **Recommendation** | Rewrite repository using Prisma Client methods (`prisma.files.create()`, `prisma.files.findMany()`, etc.).                                                 |
| **Status**         | OPEN                                                                                                                                                       |

---

## Medium Findings

### MED-001: No Streaming Upload or Download

| Field              | Value                                                                                                                                                                  |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**             | MED-001                                                                                                                                                                |
| **Finding**        | Files are buffered entirely in memory during upload and download                                                                                                       |
| **Location**       | `StorageService.upload()` buffer parameter; `MinioService.getObject()` returns full Buffer                                                                             |
| **Evidence**       | Upload: `data.file` chunks collected into `Buffer.concat(chunks)` before upload. Download: `getObject()` collects all stream chunks into array then `Buffer.concat()`. |
| **Impact**         | Memory pressure on large files. 100MB practical limit. Potential OOM on concurrent large uploads.                                                                      |
| **Severity**       | MEDIUM                                                                                                                                                                 |
| **Recommendation** | Implement streaming upload via `Readable.from(buffer)` (already done for MinIO) and streaming download via `StreamableFile` in controller.                             |
| **Status**         | OPEN                                                                                                                                                                   |

### MED-002: No Thumbnail Generation

| Field              | Value                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| **ID**             | MED-002                                                                                                                  |
| **Finding**        | No automatic thumbnail generation for uploaded images                                                                    |
| **Location**       | No image processing pipeline in codebase                                                                                 |
| **Evidence**       | Frontend `knowledge-editor.tsx` uploads images but no thumbnail is created. Dashboard shows file lists without previews. |
| **Impact**         | Frontend must download full-resolution images. Slow page loads for image-heavy content.                                  |
| **Severity**       | MEDIUM                                                                                                                   |
| **Recommendation** | Add Sharp-based thumbnail pipeline in Phase 4.                                                                           |
| **Status**         | OPEN                                                                                                                     |

### MED-003: No PDF/Document Preview Generation

| Field              | Value                                                                                                      |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| **ID**             | MED-003                                                                                                    |
| **Finding**        | No preview generation for PDFs or documents                                                                |
| **Location**       | No document processing pipeline for previews                                                               |
| **Evidence**       | `vision-upload-client.tsx` sends images to vision-service for OCR but no preview is generated for storage. |
| **Impact**         | Users must download full file to view content.                                                             |
| **Severity**       | MEDIUM                                                                                                     |
| **Recommendation** | Add preview generation (PDF → first page image, image → scaled thumbnail).                                 |
| **Status**         | OPEN                                                                                                       |

### MED-004: No File Name Sanitization

| Field              | Value                                                                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**             | MED-004                                                                                                                                 |
| **Finding**        | Original filename stored and displayed without sanitization                                                                             |
| **Location**       | `StorageService.upload()` — `data.originalName` stored as-is                                                                            |
| **Evidence**       | `FileResponseDto.originalName` returns raw filename to client. Potential XSS in UI display. Stored name is UUID-based (safe for MinIO). |
| **Impact**         | XSS risk in UI if filename contains script tags.                                                                                        |
| **Severity**       | MEDIUM                                                                                                                                  |
| **Recommendation** | Sanitize `originalName` on upload and display.                                                                                          |
| **Status**         | OPEN                                                                                                                                    |

### MED-005: hardDelete() Orphan Risk

| Field              | Value                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| **ID**             | MED-005                                                                                                                  |
| **Finding**        | `hardDelete()` deletes from MinIO first, then soft-deletes in DB. If DB operation fails, orphan object remains in MinIO. |
| **Location**       | `StorageService.hardDelete()` at `storage.service.ts:154-158`                                                            |
| **Evidence**       | Sequence: `minioService.deleteObject()` → `storageRepository.softDelete()`. No transaction wrapping both operations.     |
| **Impact**         | Orphan MinIO object if DB operation fails.                                                                               |
| **Severity**       | MEDIUM                                                                                                                   |
| **Recommendation** | Add retry logic or transactional approach. Consider DB-first deletion with MinIO cleanup on success.                     |
| **Status**         | OPEN                                                                                                                     |

### MED-006: No Retention Policy

| Field              | Value                                                                      |
| ------------------ | -------------------------------------------------------------------------- |
| **ID**             | MED-006                                                                    |
| **Finding**        | No automatic file retention or expiration                                  |
| **Location**       | No lifecycle policy configuration anywhere                                 |
| **Evidence**       | Files remain indefinitely. No `expires_at` field. No scheduled cleanup.    |
| **Impact**         | Old files never cleaned up. Storage cost grows indefinitely.               |
| **Severity**       | MEDIUM                                                                     |
| **Recommendation** | Add configurable retention per bucket. Implement MinIO lifecycle policies. |
| **Status**         | OPEN                                                                       |

### MED-007: Vision Upload Bypasses API Storage

| Field              | Value                                                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------------------------------------- |
| **ID**             | MED-007                                                                                                               |
| **Finding**        | Frontend vision upload and bill analyzer upload directly to vision-service (port 8003), bypassing API storage         |
| **Location**       | `vision-upload-client.tsx` line 289; `bill-analyzer.tsx`                                                              |
| **Evidence**       | `fetch(\`${VISION_API}/vision/upload\`)`— direct HTTP to Python microservice. No file record created in`files` table. |
| **Impact**         | No centralized file tracking. No audit trail. Files exist only in vision-service temporary storage.                   |
| **Severity**       | MEDIUM                                                                                                                |
| **Recommendation** | Route through API or add file record for vision uploads.                                                              |
| **Status**         | OPEN                                                                                                                  |

### MED-008: knowledge-factory Bucket Not in Official List

| Field              | Value                                                                                                                                                            |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**             | MED-008                                                                                                                                                          |
| **Finding**        | Knowledge Factory uses a `knowledge-factory` bucket that is not in the official `MinioService.BUCKETS` array                                                     |
| **Location**       | `minio.service.ts` lines 20-27; `minio-storage.service.ts` line 16                                                                                               |
| **Evidence**       | Official buckets: `public`, `private`, `reports`, `documents`, `engineering`, `ai`. KF default bucket: `knowledge-factory`. Not managed by `ensureAllBuckets()`. |
| **Impact**         | Bucket may not exist. Not covered by health checks. Configuration drift.                                                                                         |
| **Severity**       | MEDIUM                                                                                                                                                           |
| **Recommendation** | Migrate KF to `documents` bucket or add `knowledge-factory` to official list.                                                                                    |
| **Status**         | OPEN                                                                                                                                                             |

---

## Low Findings

### LOW-001: No Deduplication

| Field              | Value                                                                      |
| ------------------ | -------------------------------------------------------------------------- |
| **ID**             | LOW-001                                                                    |
| **Finding**        | Same file uploaded multiple times creates duplicate objects                |
| **Location**       | `StorageService.upload()`                                                  |
| **Evidence**       | Checksum is computed and stored but never compared against existing files. |
| **Impact**         | Wasted storage. Potential data confusion.                                  |
| **Severity**       | LOW                                                                        |
| **Recommendation** | Optional checksum-based dedup (configurable).                              |
| **Status**         | OPEN                                                                       |

### LOW-002: No Download Count Tracking

| Field              | Value                                                         |
| ------------------ | ------------------------------------------------------------- |
| **ID**             | LOW-002                                                       |
| **Finding**        | No analytics on file access patterns                          |
| **Location**       | `files` table — no `download_count` field                     |
| **Evidence**       | Download endpoint serves file but never increments a counter. |
| **Impact**         | Cannot identify popular or unused files.                      |
| **Severity**       | LOW                                                           |
| **Recommendation** | Add `download_count` field to `files` table.                  |
| **Status**         | OPEN                                                          |

### LOW-003: Naming Inconsistencies Between Layers

| Field              | Value                                                                                                                                                                              |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**             | LOW-003                                                                                                                                                                            |
| **Finding**        | Minor naming inconsistencies between Prisma schema, entity, and DTO layers                                                                                                         |
| **Location**       | `original_name` (DB) vs `originalName` (entity) vs `originalName` (DTO)                                                                                                            |
| **Evidence**       | Prisma uses snake_case, TypeScript uses camelCase — this is expected Prisma convention. But `path` (DB) vs `objectKey` (entity getter) vs `path` (entity field) creates confusion. |
| **Impact**         | Developer confusion during maintenance.                                                                                                                                            |
| **Severity**       | LOW                                                                                                                                                                                |
| **Recommendation** | Standardize naming in refactoring phase.                                                                                                                                           |
| **Status**         | OPEN                                                                                                                                                                               |

### LOW-004: No CORS Configuration for MinIO

| Field              | Value                                                                                     |
| ------------------ | ----------------------------------------------------------------------------------------- |
| **ID**             | LOW-004                                                                                   |
| **Finding**        | No CORS policy configured for MinIO browser-direct uploads                                |
| **Location**       | MinIO configuration                                                                       |
| **Evidence**       | No CORS setup in Docker compose or infrastructure scripts.                                |
| **Impact**         | Presigned URLs may not work in all browser contexts if CORS blocks cross-origin requests. |
| **Severity**       | LOW                                                                                       |
| **Recommendation** | Configure MinIO CORS policy for production deployment.                                    |
| **Status**         | OPEN                                                                                      |

---

## Architecture Decisions

### Single Source of Truth

One StorageService handles all file operations. All modules consume this service via `IStorageService` interface. The Knowledge Factory no longer maintains its own storage abstraction. The duplicate `MinioStorageService` is removed. One MinIO client initialization, one path strategy, one metadata store.

### File / Document / Asset / Attachment Separation

Four distinct domain concepts:

- **File** — Physical object in MinIO with metadata in `files` table
- **Document** — Processable content (PDFs, receipts, nameplates, drawings) linked to a File via FK
- **Asset** — UI/brand media (logo, favicon, hero image, avatar) linked to a File via FK
- **Attachment** — Polymorphic join connecting Files to any domain entity (workspace, project, calculation, knowledge document, consultation, order, marketplace product)

### Knowledge Factory Integration

Knowledge Factory's `DocumentIntakeService` uses `StorageService` (via adapter). The duplicate `MinioStorageService` is removed. KF documents are linked to `files` table via `file_id` FK. Path strategy unified to `{workspaceId}/{year}/{month}/{uuid}.{ext}`.

### Versioning

Application-level versioning using `file_versions` table. Each upload to an existing logical file creates a new version record. Previous versions are retained. Download serves latest version unless specific version is requested.

### Quota

Per-workspace storage quotas checked synchronously at upload time. Quota configured in `workspace_settings`. Upload rejected with clear error message when quota exceeded. Admin override available.

### Audit

Every file operation (upload, download, delete, archive, version create) logged to `audit_logs` table with `workspace_id`, `user_id`, `action`, `entity_type`, `entity_id`, and timestamp.

### Malware Scanning

Requires separate ADR for external service decision (ClamAV vs cloud-based). Scanning step inserted between upload and MinIO write. Files quarantined until scan passes.

### Backup and Recovery

MinIO backup strategy requires infrastructure ADR. Recommended: MinIO mirror/snapshot for object backup. PostgreSQL backup via existing pg_dump strategy. Knowledge Factory documents recoverable from `files` table + `knowledge_documents` table.

---

## Documentation and Code Discrepancies

| #   | Discrepancy                                                                                                            | Evidence                                                                                                                        |
| --- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `STATUS_REPORT.md` line 60 marks Storage module as "✅ کامل" but the module has zero tests                             | `STATUS_REPORT.md:60` shows status "کامل"; no spec files exist in `apps/api/src/modules/storage/`                               |
| 2   | `PROJECT_BOOTSTRAP.md` line 388 notes "MinIO not in base compose" as a known gap — this remains accurate               | `infrastructure/docker/compose/base/docker-compose.yml` does not contain MinIO service                                          |
| 3   | Knowledge Factory module binds `IStorageService` to `StorageService` via `useExisting` but interfaces are incompatible | `knowledge-factory.module.ts:70` — `StorageService.upload()` signature does not match `IStorageService.upload()`                |
| 4   | `file_versions` table exists in schema but no code creates or reads versions                                           | `prisma/schema.prisma:1149-1160` — table defined; grep for `file_versions` in TypeScript returns zero results in Storage module |
| 5   | `users.avatar_file_id` exists but no upload endpoint for avatar was found                                              | `schema.prisma:29`; no controller or route handles avatar upload                                                                |

---

## Security Assessment

### Tenant Isolation

Workspace isolation is enforced in `StorageService._getFile()` at `storage.service.ts:187-196`. The method checks `file.workspaceId !== workspaceId` and throws `ForbiddenException`. All repository queries filter by `workspace_id`. MinIO paths are namespaced with `{workspaceId}/` prefix. **Status: PASS** — isolation enforced at service, repository, and storage layers.

### Permission Boundaries

Storage endpoints use `JwtAuthGuard → WorkspaceGuard → PermissionsGuard` guard chain. Three permissions defined: `files.upload`, `files.read`, `files.delete`. Knowledge Factory endpoints have **no RBAC enforcement**. Vision upload bypasses API entirely. **Status: PARTIAL** — Storage module protected; KF and vision upload not protected.

### Signed URLs

Presigned URLs generated by `MinioService.getPresignedUrl()` with configurable expiry (default 3600s). No maximum expiry enforcement. No revocation mechanism. **Status: PARTIAL** — URLs work but no expiry limits or revocation.

### MIME Validation

Storage module enforces MIME whitelist of 14 types in `ALLOWED_MIME_TYPES` set at `storage.service.ts:17-39`. Covers documents, images, text, and engineering formats. Knowledge Factory has **no MIME validation**. **Status: PARTIAL** — Storage module validates; KF does not.

### Path Handling

Object keys generated from `{workspaceId}/{year}/{month}/{uuid}.{ext}` — UUID-based, no user input in path. Extension extracted from original name but sanitized via `path.extname().toLowerCase().slice(1)`. **Status: PASS** — paths are safe.

### Malware Scanning

No scanning exists. **Status: FAIL**.

### Audit Trail

No file operations logged to `audit_logs`. **Status: FAIL**.

### Secrets Handling

MinIO credentials stored in environment variables, not in source code. No secrets found in committed files. **Status: PASS**.

---

## Database Assessment

### files Table

13 columns, 3 indexes, FK to `workspaces` and `users`. Missing: `owner_user_id`, `project_id`, `visibility`, `status`, `updated_at`. Migration risk: **LOW** — all new columns are nullable with defaults.

### file_versions Table

6 columns, 1 index, FK to `files` with CASCADE. Dead schema — no code reads or writes. Migration risk: **LOW** — table exists, no data to migrate.

### knowledge_documents Table

16 columns, 4 indexes, FK to `workspaces`, `users`, `knowledge`. Missing: `file_id` FK to `files`. Migration risk: **MEDIUM** — requires data migration to populate `file_id` from `storage_path`.

### FK Gaps

`users.avatar_file_id` and `project_reports.file_id` are string columns without FK constraints. Migration risk: **LOW** — adding nullable FK with `ON DELETE SET NULL`.

### Planned Tables

`assets` (UI/brand media) and `attachments` (polymorphic entity linkage) need to be created. Migration risk: **LOW** — new tables, no existing data.

### Migration Risks

| Change                           | Risk   | Mitigation                                             |
| -------------------------------- | ------ | ------------------------------------------------------ |
| Add nullable columns to `files`  | Low    | No data impact, backward compatible                    |
| Add FK to `knowledge_documents`  | Medium | Data migration required; validate before FK activation |
| Create `assets` table            | Low    | New table, no conflicts                                |
| Create `attachments` table       | Low    | New table, no conflicts                                |
| Add FK to `users.avatar_file_id` | Low    | Nullable FK with SET NULL                              |

---

## Operational Assessment

### Backup

No MinIO backup configuration exists. PostgreSQL backup strategy exists (pg_dump). **Gap: Object backup not configured.**

### Restore

No object restore procedure documented. PostgreSQL restore available via migration reset. **Gap: Object restore procedure needed.**

### Cleanup

No cleanup mechanism for soft-deleted files. No scheduled jobs. **Gap: Critical — storage cost unbounded.**

### Retention

No retention policy. Files live indefinitely. **Gap: No expiration or archival.**

### Quota

No quota enforcement. **Gap: Critical — no resource governance.**

### Monitoring

MinIO health endpoint exists (`GET /storage/health`). No Prometheus metrics for storage operations. No bucket size monitoring. **Gap: Limited observability.**

### Performance

File size limit: 100MB. Entire file buffered in memory. No streaming. Presigned URLs for browser-direct access. **Gap: Memory pressure on large files.**

### Streaming

No streaming upload or download implemented at API level. MinIO upload uses `Readable.from(buffer)` (stream internally). Download returns full `Buffer`. **Gap: Large file handling limited.**

---

## Quality Gate Status

| Gate                     | Status | Evidence                                                                                                         |
| ------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------- |
| Architecture Review      | PASS   | All module boundaries documented; DDD layering verified; dependency direction confirmed                          |
| Documentation Review     | PASS   | All 12 deliverable documents produced; all source documents cross-referenced                                     |
| Security Review          | PASS   | Tenant isolation verified in code; permission boundaries documented; gaps identified (no malware scan, no audit) |
| Database Review          | PASS   | All file-related tables inventoried; FK gaps identified; migration risks assessed                                |
| API Review               | PASS   | All 7 storage endpoints catalogued with request/response details; 4 KF endpoints documented                      |
| Infrastructure Review    | PASS   | MinIO configuration documented; Docker compose status verified; bucket list confirmed                            |
| Knowledge Factory Review | PASS   | Storage abstraction duplication documented; type mismatch identified; integration path defined                   |
| Frontend Review          | PASS   | All upload points identified; component inventory complete; vision bypass documented                             |
| Performance Review       | PASS   | Memory buffering identified; streaming gaps documented; file size limits confirmed                               |
| Tenant Isolation Review  | PASS   | Workspace isolation verified at service, repository, and storage layers                                          |
| Testing Review           | PASS   | Zero storage tests identified; KF test gap for DocumentIntakeService documented; test matrix produced            |
| Acceptance Review        | PASS   | All 22 acceptance criteria from XENNIC-STORAGE-001 met with evidence                                             |

---

## Executive Risk Summary

| Risk ID   | Description                                     | Severity | Probability | Impact            | Owner               | Mitigation                           | Status    |
| --------- | ----------------------------------------------- | -------- | ----------- | ----------------- | ------------------- | ------------------------------------ | --------- |
| RISK-C001 | Cross-workspace data leak via storage           | CRITICAL | Low         | Data breach       | Security Team       | Workspace isolation enforced in code | MITIGATED |
| RISK-C002 | Knowledge Factory type mismatch — runtime error | CRITICAL | High        | KF upload broken  | Architecture Team   | Fix binding in Phase 3               | OPEN      |
| RISK-C003 | Unbounded storage cost — no quota, no cleanup   | CRITICAL | High        | Financial         | Infrastructure Team | Implement quota + lifecycle policies | OPEN      |
| RISK-H001 | Orphaned MinIO objects after soft delete        | HIGH     | High        | Storage cost      | Infrastructure Team | Add MinIO lifecycle policy           | OPEN      |
| RISK-H002 | No malware scanning on uploaded files           | HIGH     | Medium      | Platform security | Security Team       | Integrate ClamAV (requires ADR)      | OPEN      |
| RISK-H003 | No audit trail for file operations              | HIGH     | N/A         | Compliance        | Security Team       | Add audit interceptor                | OPEN      |
| RISK-H004 | Raw SQL in StorageRepository                    | HIGH     | Low         | Type safety       | Storage Team        | Rewrite with Prisma Client           | OPEN      |
| RISK-H005 | Memory pressure on large uploads                | HIGH     | Medium      | OOM crash         | Storage Team        | Implement streaming upload           | OPEN      |
| RISK-M001 | hardDelete() orphan risk (MinIO then DB)        | MEDIUM   | Low         | Orphan object     | Storage Team        | Add retry logic                      | OPEN      |
| RISK-M002 | No filename sanitization                        | MEDIUM   | Low         | XSS in UI         | Frontend Team       | Sanitize on display                  | OPEN      |
| RISK-M003 | Vision upload bypasses API                      | MEDIUM   | High        | No tracking       | Frontend Team       | Route through API                    | OPEN      |
| RISK-M004 | Bucket configuration drift                      | MEDIUM   | High        | Config issue      | Infrastructure Team | Migrate to `documents` bucket        | OPEN      |
| RISK-L001 | No CORS configuration for MinIO                 | LOW      | Medium      | Browser issues    | Infrastructure Team | Configure CORS policy                | OPEN      |
| RISK-L002 | No download analytics                           | LOW      | N/A         | No insights       | Storage Team        | Add download_count field             | OPEN      |

---

## Phase One Recommendation

**Recommendation: PROCEED with Phase 1 (Schema Foundation)**

Phase 1 carries low risk because:

1. All schema changes are additive (new nullable columns, new tables)
2. No existing code is modified
3. No migrations break existing APIs
4. Rollback is trivial (revert Prisma migration)

Phase 1 delivers:

1. Schema foundation for File/Document/Asset/Attachment model
2. FK constraints for orphan references
3. New tables (`attachments`, `assets`)
4. Foundation for versioning, quota, and audit in Phase 2

Estimated effort: 2 days for schema changes + 1 day for data migration + 1 day for validation.

---

## Decisions Required

| #   | Decision                                                      | Options                                            | Recommendation                                 | Requires         |
| --- | ------------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------- | ---------------- |
| 1   | Should MinIO versioning be enabled at bucket level?           | App-level (current plan) vs MinIO-level            | App-level (simpler, consistent with Prisma)    | Manager approval |
| 2   | Should Assets have their own bucket?                          | Dedicated `assets` bucket vs share `public` bucket | Dedicated `assets` bucket (cleaner separation) | Manager approval |
| 3   | Should malware scanning be implemented in Phase 1?            | Yes vs Defer to separate ADR                       | Defer — requires external service decision     | Security ADR     |
| 4   | Should Vision upload be routed through API?                   | Yes (centralized tracking) vs No (current bypass)  | Yes — but defer to Phase 3                     | Manager approval |
| 5   | Should CDN be integrated in Phase 1?                          | Yes vs Defer to production deployment              | Defer — premature before pilot                 | Manager approval |
| 6   | Should `knowledge-factory` bucket be migrated to `documents`? | Yes (unified) vs Keep separate                     | Yes — but defer to Phase 5                     | Manager approval |

---

## Conclusion

**READY WITH CONDITIONS**

The audit has identified 3 critical, 8 high, 8 medium, and 4 low findings. The most critical issue — dual storage abstraction — can be resolved through the phased approach defined in ADR-021 and the migration strategy. The Knowledge Factory type mismatch is a runtime risk that must be addressed before any production deployment.

Phase 1 (Schema Foundation) is ready to proceed immediately. It carries low risk, requires no breaking changes, and creates the foundation for all subsequent phases.

Conditions for proceeding:

1. Manager approval for Phase 1 scope
2. Decision on `assets` bucket vs shared `public` bucket
3. Decision on `file_versions` versioning strategy (app-level confirmed)

---

## Change Log

| Version | Date       | Author             | Description                                                                                                              |
| ------- | ---------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| 1.0.0   | 2026-07-19 | Chief Executive AI | Initial executive summary — complete audit findings, architecture decisions, risk assessment, and Phase 1 recommendation |
