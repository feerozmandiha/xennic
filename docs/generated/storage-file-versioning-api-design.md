# Storage File Versioning — API Design

- **Document ID:** XENNIC-STORAGE-VERSIONING-API-DESIGN
- **Date:** 2026-07-25
- **Version:** 1.0.0
- **Status:** DESIGN REVIEW ONLY
- **Owner:** Chief Executive AI — Xennic Platform
- **Order:** XENNIC-STORAGE-EO-1D-REVIEW-034

---

## 1. Overview

This document specifies the 6 API endpoints for file versioning. These are design-only — no implementation.

**Base Path:** `/api/v1/storage`
**Authentication:** Bearer JWT (all endpoints)
**Authorization:** WorkspaceGuard + PermissionsGuard + file-level access

---

## 2. Endpoints

### 2.1 POST /files/:fileId/versions

**Purpose:** Create a new version of an existing file.

| Field        | Value                                    |
| ------------ | ---------------------------------------- |
| Method       | POST                                     |
| Path         | `/api/v1/storage/files/:fileId/versions` |
| Content-Type | `multipart/form-data`                    |
| Permission   | `files.upload`                           |
| Workspace    | Required                                 |
| Project      | Optional (via ProjectFile)               |

**Request:**

```
 multipart/form-data
   file: Binary (required) — new version content
```

**Response 201:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fileId": "uuid",
    "version": 2,
    "path": "a1b2c3/2026/07/uuid_v2.pdf",
    "size": 1048576,
    "mimeType": "application/pdf",
    "originalName": "document.pdf",
    "checksum": "sha256hex",
    "changeReason": null,
    "createdBy": "user-uuid",
    "createdAt": "2026-07-25T10:30:00Z"
  }
}
```

**Error Responses:**
| Code | Condition |
|------|-----------|
| 400 | Invalid file or missing file field |
| 403 | No access to this file |
| 404 | File not found |
| 413 | File exceeds 100MB limit |
| 415 | Unsupported MIME type |

**Idempotency:** NO — always creates new version
**Audit Event:** `file_version_created`

---

### 2.2 GET /files/:fileId/versions

**Purpose:** List all versions of a file, ordered by version number.

| Field      | Value                                    |
| ---------- | ---------------------------------------- |
| Method     | GET                                      |
| Path       | `/api/v1/storage/files/:fileId/versions` |
| Permission | `files.read`                             |
| Workspace  | Required                                 |

**Query Parameters:**
| Param | Type | Default | Notes |
|-------|------|---------|-------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max 100) |

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "fileId": "uuid",
      "version": 1,
      "path": "a1b2c3/2026/07/uuid_v1.pdf",
      "size": 1048576,
      "mimeType": "application/pdf",
      "originalName": "document.pdf",
      "checksum": "sha256hex",
      "changeReason": null,
      "createdBy": "user-uuid",
      "createdAt": "2026-07-25T10:30:00Z"
    },
    {
      "id": "uuid2",
      "fileId": "uuid",
      "version": 2,
      "path": "a1b2c3/2026/07/uuid_v2.pdf",
      "size": 2097152,
      "mimeType": "application/pdf",
      "originalName": "document-v2.pdf",
      "checksum": "sha256hex2",
      "changeReason": "Updated header",
      "createdBy": "user-uuid",
      "createdAt": "2026-07-25T11:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "totalPages": 1
  }
}
```

**Error Responses:**
| Code | Condition |
|------|-----------|
| 403 | No access to this file |
| 404 | File not found |

**Idempotency:** YES (read-only)
**Audit Event:** None

---

### 2.3 GET /files/:fileId/versions/:versionId

**Purpose:** Get detailed information about a specific version, including a presigned download URL.

| Field      | Value                                               |
| ---------- | --------------------------------------------------- |
| Method     | GET                                                 |
| Path       | `/api/v1/storage/files/:fileId/versions/:versionId` |
| Permission | `files.read`                                        |
| Workspace  | Required                                            |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fileId": "uuid",
    "version": 1,
    "path": "a1b2c3/2026/07/uuid_v1.pdf",
    "size": 1048576,
    "mimeType": "application/pdf",
    "originalName": "document.pdf",
    "checksum": "sha256hex",
    "changeReason": null,
    "createdBy": "user-uuid",
    "createdAt": "2026-07-25T10:30:00Z",
    "downloadUrl": "https://minio.example.com/bucket/path?signature=..."
  }
}
```

**Error Responses:**
| Code | Condition |
|------|-----------|
| 403 | No access to this file |
| 404 | File or version not found |

**Idempotency:** YES (read-only)
**Audit Event:** None

---

### 2.4 GET /files/:fileId/versions/:versionId/download

**Purpose:** Download the content of a specific version as a binary stream.

| Field      | Value                                                        |
| ---------- | ------------------------------------------------------------ |
| Method     | GET                                                          |
| Path       | `/api/v1/storage/files/:fileId/versions/:versionId/download` |
| Permission | `files.read`                                                 |
| Workspace  | Required                                                     |

**Response 200:**

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="document.pdf"
Content-Length: 1048576

[binary content]
```

**Error Responses:**
| Code | Condition |
|------|-----------|
| 403 | No access to this file |
| 404 | File or version not found |

**Idempotency:** YES (read-only)
**Audit Event:** `file_version_downloaded`

---

### 2.5 POST /files/:fileId/versions/:versionId/revert

**Purpose:** Revert to a specified version. Creates a NEW version with the content of the target version.

| Field      | Value                                                      |
| ---------- | ---------------------------------------------------------- |
| Method     | POST                                                       |
| Path       | `/api/v1/storage/files/:fileId/versions/:versionId/revert` |
| Permission | `files.upload`                                             |
| Workspace  | Required                                                   |

**Request:**

```json
{
  "changeReason": "Reverting to stable version"
}
```

**Response 201:**

```json
{
  "success": true,
  "data": {
    "id": "uuid3",
    "fileId": "uuid",
    "version": 3,
    "path": "a1b2c3/2026/07/uuid_v3.pdf",
    "size": 1048576,
    "mimeType": "application/pdf",
    "originalName": "document.pdf",
    "checksum": "sha256hex",
    "changeReason": "Reverting to stable version",
    "createdBy": "user-uuid",
    "createdAt": "2026-07-25T12:00:00Z"
  }
}
```

**Error Responses:**
| Code | Condition |
|------|-----------|
| 403 | No access to this file |
| 404 | File or target version not found |

**Idempotency:** NO — creates new version each time
**Audit Event:** `file_version_reverted`

**Notes:**

- Revert always creates a new version (never in-place)
- The new version has the same content (size, checksum) as the target version
- The new version gets a new UUID and new object key
- Source version remains unchanged and accessible

---

### 2.6 DELETE /files/:fileId/versions/:versionId

**Purpose:** Delete a specific version. Removes both DB row and MinIO object.

| Field      | Value                                               |
| ---------- | --------------------------------------------------- |
| Method     | DELETE                                              |
| Path       | `/api/v1/storage/files/:fileId/versions/:versionId` |
| Permission | `files.delete`                                      |
| Workspace  | Required                                            |

**Response 204:** No content

**Error Responses:**
| Code | Condition |
|------|-----------|
| 403 | No access to this file |
| 404 | File or version not found |
| 409 | Cannot delete the latest version (use file delete instead) |

**Idempotency:** YES (after first delete, subsequent returns 404)
**Audit Event:** `file_version_deleted`

**Notes:**

- Cannot delete the latest (active) version — must delete the entire file
- Deleting a superseded version is safe and removes only that version's object
- The `file_versions` table has `ON DELETE CASCADE` from `file_id`, so deleting the file removes all versions

---

## 3. FileVersionDto

```typescript
class FileVersionDto {
  id: string;
  fileId: string;
  version: number;
  path: string;
  size: number;
  sizeHuman: string; // "1.0 MB"
  mimeType: string;
  originalName: string;
  checksum: string | null;
  changeReason: string | null;
  createdBy: string;
  createdAt: Date;
  downloadUrl?: string; // Only in GET single version
  isLatest: boolean; // version == MAX(version)
}
```

---

## 4. Error Response Format

All errors follow the standard Xennic format:

```json
{
  "success": false,
  "error": {
    "code": "VERSION_NOT_FOUND",
    "message": "Version not found",
    "statusCode": 404
  }
}
```

Error codes:
| Code | HTTP | Description |
|------|------|-------------|
| `FILE_NOT_FOUND` | 404 | Parent file not found |
| `VERSION_NOT_FOUND` | 404 | Specific version not found |
| `VERSION_DELETE_CONFLICT` | 409 | Cannot delete latest version |
| `FILE_ACCESS_DENIED` | 403 | No access to file workspace |
| `FILE_TOO_LARGE` | 413 | Version exceeds size limit |
| `UNSUPPORTED_MEDIA_TYPE` | 415 | MIME type not allowed |

---

## 5. Rate Limiting

| Endpoint                   | Rate Limit       | Notes                    |
| -------------------------- | ---------------- | ------------------------ |
| POST /versions             | 10/min per file  | Prevent version flooding |
| GET /versions              | 100/min per file | Standard read            |
| GET /versions/:id          | 100/min per file | Standard read            |
| GET /versions/:id/download | 30/min per file  | Bandwidth protection     |
| POST /versions/:id/revert  | 10/min per file  | Prevent revert flooding  |
| DELETE /versions/:id       | 10/min per file  | Destructive operation    |

---

## 6. Idempotency Analysis

| Endpoint                   | Idempotent | Notes                           |
| -------------------------- | ---------- | ------------------------------- |
| POST /versions             | NO         | Always creates new version      |
| GET /versions              | YES        | Read-only                       |
| GET /versions/:id          | YES        | Read-only                       |
| GET /versions/:id/download | YES        | Read-only                       |
| POST /versions/:id/revert  | NO         | Creates new version each time   |
| DELETE /versions/:id       | YES        | After first delete, returns 404 |

---

## 7. OpenAPI Impact

New paths to add:

- `POST /api/v1/storage/files/{fileId}/versions`
- `GET /api/v1/storage/files/{fileId}/versions`
- `GET /api/v1/storage/files/{fileId}/versions/{versionId}`
- `GET /api/v1/storage/files/{fileId}/versions/{versionId}/download`
- `POST /api/v1/storage/files/{fileId}/versions/{versionId}/revert`
- `DELETE /api/v1/storage/files/{fileId}/versions/{versionId}`

New schemas:

- `FileVersionDto`
- `FileVersionListResponse`
- `RevertVersionRequest`

---

## 8. Change Log

| Date       | Author             | Change             |
| ---------- | ------------------ | ------------------ |
| 2026-07-25 | Chief Executive AI | Initial API design |

---

_End of API Design_
