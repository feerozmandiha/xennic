# Storage Platform Architecture — Canonical Design

- **ID:** XENNIC-STORAGE-001-ARCH
- **Status:** PROPOSED
- **Date:** 2026-07-19
- **Owner:** Chief Executive AI — Xennic Platform
- **Scope:** Unified File, Document, Asset, Attachment platform
- **Dependencies:** ADR-021, Storage Audit, Prisma schema
- **Supersedes:** Current dual-abstraction storage

---

## 1. Design Principles

1. **Single Source of Truth** — One Storage Service, one MinIO client, one DB schema for all file-related operations
2. **Domain Separation** — File (raw object), Document (processable content), Asset (UI/brand media), Attachment (entity linkage) are distinct concepts
3. **Workspace Isolation** — Every file operation scoped to `workspace_id`
4. **Interface-Driven** — All consumers depend on interfaces, not implementations
5. **Auditability** — Every file operation logged to `audit_logs`
6. **Lifecycle Awareness** — Files have states (uploading → active → archived → deleted)
7. **Quota-Enforced** — Per-workspace storage limits
8. **Clean Separation** — Knowledge Factory consumes Storage Service; does not duplicate it

---

## 2. Canonical Domain Model

### 2.1 File (Object Representation)

Represents a physical object stored in MinIO.

```
File {
  id: UUID
  workspace_id: UUID (FK → workspaces)
  owner_user_id: UUID (FK → users)
  project_id: UUID? (FK → projects)

  object_key: String (MinIO path: {workspace_id}/{year}/{month}/{uuid}.{ext})
  bucket: FileBucket (enum: public|private|reports|documents|engineering|ai)

  original_name: String
  stored_name: String (UUID-based)
  extension: String
  mime_type: String
  size: BigInt
  checksum: String? (SHA-256)

  visibility: FileVisibility (enum: workspace|public|restricted)
  status: FileStatus (enum: uploading|active|archived|deleted)

  created_at: DateTime
  updated_at: DateTime
  deleted_at: DateTime?
}
```

### 2.2 FileVersion (Version Tracking)

Represents a version of a logical file.

```
FileVersion {
  id: UUID
  file_id: UUID (FK → files, CASCADE DELETE)
  version: Int
  object_key: String
  mime_type: String
  size: BigInt
  checksum: String?
  uploaded_by: UUID (FK → users)
  change_reason: String?
  created_at: DateTime
}
```

### 2.3 Document (Processable Content)

Represents content that undergoes processing (OCR, parsing, classification).

```
Document {
  id: UUID
  file_id: UUID (FK → files) — links to physical file
  workspace_id: UUID
  document_type: DocumentType (enum: pdf|receipt|nameplate|drawing|standard|report|technical|other)
  status: DocumentStatus (enum: uploaded|classified|parsing|extracted|chunking|embedding|publishing|published|failed)

  classification: Json?
  metadata: Json
  error_message: String?
  retry_count: Int
  published_knowledge_id: UUID? (FK → knowledge)

  created_by: UUID?
  created_at: DateTime
  updated_at: DateTime
  deleted_at: DateTime?
}
```

### 2.4 Asset (UI/Brand Media)

Represents files used in UI or branding.

```
Asset {
  id: UUID
  file_id: UUID (FK → files) — links to physical file
  workspace_id: UUID
  asset_type: AssetType (enum: logo|hero_image|favicon|avatar|product_image|brand_media|icon|banner)

  alt_text_fa: String?
  alt_text_en: String?
  caption_fa: String?
  caption_en: String?

  width: Int?
  height: Int?
  format: String?

  is_active: Boolean (default: true)
  sort_order: Int (default: 0)

  created_at: DateTime
  updated_at: DateTime
}
```

### 2.5 Attachment (Entity Linkage)

Polymorphic join table connecting files to domain entities.

```
Attachment {
  id: UUID
  file_id: UUID (FK → files, CASCADE DELETE)
  entity_type: String (workspace|project|calculation|knowledge_document|consultation|order|marketplace_product|knowledge)
  entity_id: UUID

  purpose: String? (e.g., "report", "evidence", "input", "output")
  sort_order: Int (default: 0)

  created_at: DateTime
  created_by: UUID?
}
```

### 2.6 Model Relationships

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   workspaces │────→│    files     │←────│    users     │
└─────────────┘     └──────┬───────┘     └──────────────┘
                           │
              ┌────────────┼────────────┐
              ↓            ↓            ↓
        ┌──────────┐ ┌──────────┐ ┌──────────────┐
        │ versions │ │attachments│ │  documents   │
        └──────────┘ └──────────┘ └──────┬───────┘
                                         │
                                    ┌────┴────┐
                                    ↓         ↓
                              ┌──────────┐ ┌────────────┐
                              │  chunks  │ │ extractions│
                              └──────────┘ └────────────┘

        ┌──────────────┐
        │   assets     │
        └──────────────┘
```

---

## 3. Service Architecture

### 3.1 StorageService (Core)

The single entry point for all file operations.

```typescript
interface IStorageService {
  // Upload
  upload(data: UploadCommand): Promise<File>;

  // Download
  download(fileId: string, workspaceId: string): Promise<DownloadResult>;
  getPresignedUrl(fileId: string, workspaceId: string, expiry?: number): Promise<string>;

  // CRUD
  findById(fileId: string, workspaceId: string): Promise<File | null>;
  findAll(workspaceId: string, filter: FileFilter): Promise<PaginatedResult<File>>;
  softDelete(fileId: string, workspaceId: string): Promise<void>;
  hardDelete(fileId: string, workspaceId: string): Promise<void>;

  // Versioning
  createVersion(fileId: string, data: UploadCommand): Promise<FileVersion>;
  getVersions(fileId: string): Promise<FileVersion[]>;

  // Stats
  getStats(workspaceId: string): Promise<StorageStats>;
  checkQuota(workspaceId: string, additionalBytes: number): Promise<QuotaCheck>;

  // Lifecycle
  archive(fileId: string, workspaceId: string): Promise<void>;
  restore(fileId: string, workspaceId: string): Promise<void>;
}
```

### 3.2 DocumentService (Knowledge Factory Integration)

Wraps StorageService for document-specific operations.

```typescript
interface IDocumentService {
  registerDocument(data: RegisterDocumentCommand): Promise<Document>;
  classifyDocument(documentId: string, result: ClassificationResult): Promise<Document>;
  recordExtraction(documentId: string, extraction: ExtractionData): Promise<Document>;
  publishDocument(documentId: string, knowledgeId: string): Promise<Document>;
  failDocument(documentId: string, error: string): Promise<Document>;
  retryDocument(documentId: string): Promise<Document>;
}
```

### 3.3 AssetService (UI/Brand Media)

Manages UI assets with image processing capabilities.

```typescript
interface IAssetService {
  uploadAsset(data: UploadAssetCommand): Promise<Asset>;
  getAsset(assetId: string, workspaceId: string): Promise<Asset>;
  updateAsset(assetId: string, data: UpdateAssetCommand): Promise<Asset>;
  deleteAsset(assetId: string, workspaceId: string): Promise<void>;
  getByType(workspaceId: string, type: AssetType): Promise<Asset[]>;
  getThumbnail(fileId: string, width: number, height: number): Promise<string>;
}
```

### 3.4 AttachmentService (Entity Linkage)

Manages polymorphic file-entity relationships.

```typescript
interface IAttachmentService {
  attach(data: AttachCommand): Promise<Attachment>;
  detach(attachmentId: string): Promise<void>;
  getByEntity(entityType: string, entityId: string): Promise<Attachment[]>;
  getByFile(fileId: string): Promise<Attachment[]>;
  deleteWithFile(fileId: string): Promise<void>;
}
```

---

## 4. API Design

### 4.1 File Endpoints

| Method   | Path                                 | Permission     | Description                   |
| -------- | ------------------------------------ | -------------- | ----------------------------- |
| `POST`   | `/api/v1/storage/upload`             | `files.upload` | Upload file                   |
| `GET`    | `/api/v1/storage/files`              | `files.read`   | List files (filterable)       |
| `GET`    | `/api/v1/storage/files/:id`          | `files.read`   | Get file info + presigned URL |
| `GET`    | `/api/v1/storage/files/:id/download` | `files.read`   | Download file stream          |
| `DELETE` | `/api/v1/storage/files/:id`          | `files.delete` | Soft delete                   |
| `POST`   | `/api/v1/storage/files/:id/archive`  | `files.write`  | Archive file                  |
| `POST`   | `/api/v1/storage/files/:id/restore`  | `files.write`  | Restore archived file         |
| `GET`    | `/api/v1/storage/files/:id/versions` | `files.read`   | List versions                 |
| `POST`   | `/api/v1/storage/files/:id/versions` | `files.upload` | Upload new version            |
| `GET`    | `/api/v1/storage/stats`              | `files.read`   | Storage statistics            |
| `GET`    | `/api/v1/storage/quota`              | `files.read`   | Quota check                   |
| `GET`    | `/api/v1/storage/health`             | —              | Health check                  |

### 4.2 Document Endpoints

| Method   | Path                          | Permission         | Description           |
| -------- | ----------------------------- | ------------------ | --------------------- |
| `POST`   | `/api/v1/documents/upload`    | `documents.upload` | Upload for processing |
| `GET`    | `/api/v1/documents`           | `documents.read`   | List documents        |
| `GET`    | `/api/v1/documents/:id`       | `documents.read`   | Get document          |
| `POST`   | `/api/v1/documents/:id/retry` | `documents.write`  | Retry processing      |
| `DELETE` | `/api/v1/documents/:id`       | `documents.delete` | Delete document       |

### 4.3 Asset Endpoints

| Method   | Path                        | Permission      | Description                       |
| -------- | --------------------------- | --------------- | --------------------------------- |
| `POST`   | `/api/v1/assets/upload`     | `assets.upload` | Upload asset                      |
| `GET`    | `/api/v1/assets`            | `assets.read`   | List assets                       |
| `GET`    | `/api/v1/assets/:id`        | `assets.read`   | Get asset                         |
| `PUT`    | `/api/v1/assets/:id`        | `assets.write`  | Update asset metadata             |
| `DELETE` | `/api/v1/assets/:id`        | `assets.delete` | Delete asset                      |
| `GET`    | `/api/v1/assets/type/:type` | `assets.read`   | Get by type (logo, favicon, etc.) |

### 4.4 Attachment Endpoints

| Method   | Path                                        | Permission    | Description                |
| -------- | ------------------------------------------- | ------------- | -------------------------- |
| `POST`   | `/api/v1/attachments`                       | `files.write` | Attach file to entity      |
| `GET`    | `/api/v1/attachments/:entityType/:entityId` | `files.read`  | Get attachments for entity |
| `DELETE` | `/api/v1/attachments/:id`                   | `files.write` | Detach file                |

---

## 5. Permission Matrix

| Operation       | files.upload | files.read | files.write | files.delete | documents.upload | documents.read | assets.upload | assets.read |
| --------------- | :----------: | :--------: | :---------: | :----------: | :--------------: | :------------: | :-----------: | :---------: |
| Upload file     |      ✅      |            |             |              |                  |                |               |             |
| List files      |              |     ✅     |             |              |                  |                |               |             |
| View file info  |              |     ✅     |             |              |                  |                |               |             |
| Download file   |              |     ✅     |             |              |                  |                |               |             |
| Soft delete     |              |            |             |      ✅      |                  |                |               |             |
| Archive/restore |              |            |     ✅      |              |                  |                |               |             |
| Upload document |              |            |             |              |        ✅        |                |               |             |
| List documents  |              |            |             |              |                  |       ✅       |               |             |
| Upload asset    |              |            |             |              |                  |                |      ✅       |             |
| List assets     |              |            |             |              |                  |                |               |     ✅      |

---

## 6. Migration Strategy

### Phase 1: Schema Foundation (No Breaking Changes)

1. Add new columns to `files` table: `owner_user_id`, `project_id`, `visibility`, `status`
2. Create `attachments` table
3. Create `assets` table
4. Add `file_id` FK columns to `knowledge_documents`, `users.avatar_file_id`, `project_reports.file_id`
5. Populate `file_id` references from existing `storage_path` / `avatar_file_id` / `file_id` strings

### Phase 2: Storage Service Enhancement

1. Add versioning support to `StorageService`
2. Add quota checking
3. Add archive/restore functionality
4. Add audit logging
5. Add attachment CRUD

### Phase 3: Knowledge Factory Integration

1. Modify `DocumentIntakeService` to use `StorageService` instead of `IStorageService`
2. Migrate `knowledge_documents.storage_path` to `file_id` FK
3. Remove `MinioStorageService` from Knowledge Factory
4. Remove duplicate `IStorageService` interface

### Phase 4: Asset Management

1. Create `AssetService`
2. Add image processing pipeline (thumbnail, resize)
3. Migrate brand settings to use `assets` table
4. Add avatar upload endpoint

### Phase 5: Cleanup

1. Remove `knowledge-factory` bucket (migrate to `documents` bucket)
2. Add MinIO lifecycle policies for soft-deleted files
3. Enable bucket versioning
4. Remove dead code (unused `file_versions` reads)

---

## 7. Implementation Phases

| Phase | Description         | Files Changed           | Risk   |
| ----- | ------------------- | ----------------------- | ------ |
| 1     | Schema additions    | Prisma schema           | Low    |
| 2     | Service enhancement | Storage module files    | Medium |
| 3     | KF integration      | Knowledge Factory files | High   |
| 4     | Asset management    | New module + frontend   | Medium |
| 5     | Cleanup             | Remove dead code        | Low    |

---

## 8. Open Decisions

| Decision                                                   | Options                                          | Recommendation                  |
| ---------------------------------------------------------- | ------------------------------------------------ | ------------------------------- |
| Should `file_versions` use MinIO versioning or app-level?  | App-level (current schema) vs MinIO versioning   | App-level (simpler, consistent) |
| Should quota be enforced at upload time or asynchronously? | Sync check vs async notification                 | Sync check                      |
| Should attachments support soft-delete or hard-delete?     | Soft (reversible) vs Hard (clean)                | Soft delete                     |
| Should assets have their own bucket or share `public`?     | Dedicated `assets` bucket vs `public` bucket     | Dedicated `assets` bucket       |
| Should Knowledge Factory documents use `documents` bucket? | Yes (unified) vs Keep `knowledge-factory` bucket | Yes (unified)                   |

---

## 9. Acceptance Criteria

| #   | Criterion                                           | Status      |
| --- | --------------------------------------------------- | ----------- |
| 1   | Single StorageService for all file operations       | ✅ Designed |
| 2   | File, Document, Asset, Attachment clearly separated | ✅ Designed |
| 3   | All file operations go through StorageService       | ✅ Designed |
| 4   | Workspace isolation maintained                      | ✅ Verified |
| 5   | Audit logging on all file operations                | ✅ Designed |
| 6   | Quota enforcement per workspace                     | ✅ Designed |
| 7   | File versioning supported                           | ✅ Designed |
| 8   | Knowledge Factory uses StorageService               | ✅ Designed |
| 9   | No duplicate MinIO clients                          | ✅ Designed |
| 10  | All orphan FK references resolved                   | ✅ Designed |

---

_Architecture version: 1.0.0_
_Next: ADR-021 for formal decision record_
