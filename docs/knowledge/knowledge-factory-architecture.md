# Knowledge Factory Architecture

**Document ID:** XEN-ARCH-KF-001  
**Date:** 2026-07-03  
**Status:** Approved  
**Phase:** PHASE A — Knowledge Factory

---

## 1. Purpose

The Knowledge Factory is the automated document ingestion and publishing pipeline for the Xennic platform. It bridges the gap between raw engineering documents (PDFs, CAD files, images, manuals) and the structured knowledge store.

The existing `knowledge` module is a **manual** knowledge management system (users create/edit/publish articles). The Knowledge Factory adds the **automated** side: ingest raw files, classify, extract text, normalize, chunk, embed, and publish.

---

## 2. Architecture Overview

```
┌─────────────┐    ┌──────────────┐    ┌────────────────┐    ┌──────────────────┐
│  Document    │───▶│  Intake      │───▶│  Classification│───▶│  Extraction      │
│  Upload      │    │  Workflow    │    │  Engine        │    │  Pipeline        │
└─────────────┘    └──────────────┘    └────────────────┘    └──────────────────┘
                                                                        │
                                                                        ▼
┌─────────────┐    ┌──────────────┐    ┌────────────────┐    ┌──────────────┐
│  ai-service │◀───│  Publishing  │◀───│  Normalization │◀───│  Chunking    │
│  (RAG)      │    │  Service     │    │  Engine        │    │  Engine      │
└─────────────┘    └──────────────┘    └────────────────┘    └──────────────┘
```

### Layers

| Layer              | Responsibility                                                  |
| ------------------ | --------------------------------------------------------------- |
| **Presentation**   | REST controllers, DTOs, validation                              |
| **Application**    | Orchestration workflows, use-case services                      |
| **Domain**         | Entities, value objects, repository interfaces                  |
| **Infrastructure** | Prisma repositories, MinIO storage, HTTP gateways to ai-service |

---

## 3. Domain Model

### 3.1 Aggregates

#### `KnowledgeDocument` (Aggregate Root)

Represents a raw uploaded document through its entire lifecycle.

| Field                  | Type           | Description                                  |
| ---------------------- | -------------- | -------------------------------------------- |
| `id`                   | UUID           | Unique identifier                            |
| `workspaceId`          | UUID           | Tenant isolation                             |
| `filename`             | string         | Stored filename (slugified)                  |
| `originalName`         | string         | Original user-facing filename                |
| `mimeType`             | string         | `application/pdf`, `image/png`, etc.         |
| `sizeBytes`            | int            | File size in bytes                           |
| `storagePath`          | string         | MinIO object path                            |
| `documentType`         | string         | `pdf`, `docx`, `image`, `txt`, `dwg`         |
| `status`               | DocumentStatus | Pipeline state                               |
| `classification`       | Json           | Domain, standard, equipment type, confidence |
| `metadata`             | Json           | Extra file metadata                          |
| `errorMessage`         | string         | Failure details if status = failed           |
| `retryCount`           | int            | Retry counter for error recovery             |
| `publishedKnowledgeId` | UUID?          | Link to `knowledge` when published           |
| `createdBy`            | UUID           | Uploading user                               |
| `createdAt`            | DateTime       | Upload timestamp                             |
| `updatedAt`            | DateTime       | Last status change                           |
| `deletedAt`            | DateTime?      | Soft delete                                  |

**Status Transitions:**

```
uploaded → classified → parsing → extracted → chunking → embedding → publishing → published
   │         │           │          │          │           │            │
   └─────────┴───────────┴──────────┴──────────┴───────────┴────────────┴──▶ failed (terminal)
```

#### `KnowledgeDocumentChunk`

A normalized text chunk extracted from a document with full provenance metadata.

| Field         | Type     | Description                 |
| ------------- | -------- | --------------------------- |
| `id`          | UUID     | Unique identifier           |
| `documentId`  | UUID     | Parent document             |
| `chunkIndex`  | int      | Sequential order            |
| `text`        | string   | Normalized text content     |
| `tokenCount`  | int      | Token count for chunking    |
| `pageNumber`  | int?     | Source page (if applicable) |
| `section`     | string?  | Document section name       |
| `metadata`    | Json     | Extra chunk metadata        |
| `embeddingId` | string?  | Qdrant point ID             |
| `createdAt`   | DateTime | When chunk was created      |

#### `KnowledgePipelineRun`

Tracks a pipeline execution for a single document.

| Field        | Type                | Description                    |
| ------------ | ------------------- | ------------------------------ |
| `id`         | UUID                | Unique identifier              |
| `documentId` | UUID                | Parent document                |
| `stage`      | string              | Current pipeline stage         |
| `status`     | PipelineStageStatus | `running`, `success`, `failed` |
| `input`      | Json                | Stage input                    |
| `output`     | Json?               | Stage output                   |
| `error`      | string?             | Error details                  |
| `startedAt`  | DateTime            | Execution start                |
| `finishedAt` | DateTime?           | Execution end                  |
| `durationMs` | int?                | Execution duration             |

#### `KnowledgeExtraction`

Stores raw extraction results per pipeline stage.

| Field        | Type     | Description                                     |
| ------------ | -------- | ----------------------------------------------- |
| `id`         | UUID     | Unique identifier                               |
| `documentId` | UUID     | Parent document                                 |
| `method`     | string   | `tesseract`, `paddle`, `llm_vision`, `textract` |
| `text`       | string   | Extracted raw text                              |
| `confidence` | float?   | OCR confidence 0-1                              |
| `language`   | string?  | Detected language                               |
| `metadata`   | Json     | Engine-specific metadata                        |
| `createdAt`  | DateTime | Extraction timestamp                            |

---

## 4. Module Structure

```
apps/api/src/modules/knowledge-factory/
├── application/
│   └── services/
│       ├── document-intake.service.ts        # Orchestrates upload, validation, registration
│       ├── document-classifier.service.ts    # Classifies documents by domain, standard, type
│       ├── document-parser.service.ts        # Routes to appropriate parser (PDF, DOCX, image)
│       ├── text-normalization.service.ts     # Normalizes extracted text
│       ├── chunking.service.ts               # Token-aware chunking with provenance
│       ├── publishing.service.ts             # Publishes chunks to knowledge module + Qdrant
│       └── pipeline-orchestrator.service.ts  # Coordinates background worker stages
├── domain/
│   ├── entities/
│   │   ├── knowledge-document.entity.ts
│   │   ├── knowledge-document-chunk.entity.ts
│   │   ├── knowledge-pipeline-run.entity.ts
│   │   └── knowledge-extraction.entity.ts
│   ├── value-objects/
│   │   ├── document-status.vo.ts
│   │   ├── document-type.vo.ts
│   │   ├── pipeline-stage-status.vo.ts
│   │   └── classification-result.vo.ts
│   └── interfaces/
│       ├── knowledge-document.repository.interface.ts
│       ├── knowledge-chunk.repository.interface.ts
│       ├── pipeline-run.repository.interface.ts
│       ├── extraction.repository.interface.ts
│       ├── embedding-gateway.interface.ts
│       └── storage-service.interface.ts
├── infrastructure/
│   ├── repositories/
│   │   ├── knowledge-document.repository.ts
│   │   ├── knowledge-chunk.repository.ts
│   │   ├── pipeline-run.repository.ts
│   │   └── extraction.repository.ts
│   ├── gateways/
│   │   └── embedding-gateway.service.ts
│   └── storage/
│       └── minio-storage.service.ts
├── presentation/
│   ├── controllers/
│   │   ├── documents.controller.ts
│   │   ├── pipeline.controller.ts
│   │   └── search.controller.ts
│   └── dtos/
│       ├── upload-document.dto.ts
│       ├── document-status.dto.ts
│       ├── classify-document.dto.ts
│       ├── pipeline-trigger.dto.ts
│       ├── search-query.dto.ts
│       └── search-result.dto.ts
└── knowledge-factory.module.ts
```

---

## 5. Background Processing

Documents are processed through a **background worker queue** to avoid blocking the main request thread.

### Queue Design

| Queue                        | Purpose                     | Retry Policy                   |
| ---------------------------- | --------------------------- | ------------------------------ |
| `knowledge-factory:classify` | Document classification     | 3 retries, exponential backoff |
| `knowledge-factory:parse`    | Text extraction             | 3 retries, exponential backoff |
| `knowledge-factory:chunk`    | Chunking + embedding        | 3 retries, exponential backoff |
| `knowledge-factory:publish`  | Publish to knowledge module | 3 retries, exponential backoff |

### Worker Processing

Each worker:

1. Fetches the `KnowledgeDocument` from DB
2. Updates `pipeline_run` to `running`
3. Executes the stage logic
4. Updates document status on success
5. Records failure in `pipeline_run` + increments `retry_count`
6. If max retries exceeded, marks document as `failed`

---

## 6. Search API

The Search API provides **hybrid search** over factory-processed content:

### Endpoints

| Method | Path                            | Description                                    |
| ------ | ------------------------------- | ---------------------------------------------- |
| `GET`  | `/documents`                    | List documents (paginated, workspace-scoped)   |
| `POST` | `/documents/upload`             | Upload a raw document for processing           |
| `GET`  | `/documents/:id`                | Get document details including pipeline status |
| `GET`  | `/documents/:id/chunks`         | Get chunks for a document                      |
| `POST` | `/pipeline/trigger/:documentId` | Manually trigger pipeline stage                |
| `GET`  | `/pipeline/runs/:documentId`    | Get all pipeline runs for a document           |
| `POST` | `/search`                       | Hybrid search (keyword + semantic)             |
| `GET`  | `/classifications`              | List classification configurations             |

### Search Strategy

1. **Keyword Search:** PostgreSQL full-text search on `search_text` field
2. **Semantic Search:** Query Qdrant via ai-service `POST /ai/search`
3. **Fusion:** Reciprocal Rank Fusion (RRF) to combine results
4. **Ranking:** Cross-encoder re-ranking via ai-service

---

## 7. Permissions

All endpoints are **workspace-scoped** and require authentication.

| Permission                           | Description                      |
| ------------------------------------ | -------------------------------- |
| `knowledge-factory:documents:create` | Upload new documents             |
| `knowledge-factory:documents:read`   | View documents                   |
| `knowledge-factory:documents:update` | Update metadata/classification   |
| `knowledge-factory:documents:delete` | Soft-delete documents            |
| `knowledge-factory:pipeline:trigger` | Manually trigger pipeline stages |
| `knowledge-factory:search`           | Search across processed content  |

Permissions are enforced via `PermissionsGuard` from the `rbac` module.

---

## 8. Audit Trail

Every state change in the Knowledge Factory is logged:

- Document creation, status transitions, deletion
- Pipeline run start/finish/failure
- Classification results
- Publishing events

Audit entries are stored in the existing `audit_logs` table with:

- `entity` = `knowledge_document`
- `entity_id` = document UUID
- `action` = `document.uploaded`, `document.classified`, `pipeline.chunked`, etc.

---

## 9. Error Recovery

### Retry Policy

| Stage          | Max Retries | Backoff    |
| -------------- | ----------- | ---------- |
| Classification | 3           | 1s, 2s, 4s |
| Parsing        | 3           | 2s, 4s, 8s |
| OCR            | 2           | 5s, 15s    |
| Chunking       | 3           | 1s, 2s, 4s |
| Embedding      | 3           | 2s, 4s, 8s |
| Publishing     | 3           | 1s, 2s, 4s |

### Dead Letter Queue

After max retries, the document is marked `failed` with `error_message` populated. Admin can:

1. View failed documents
2. Re-trigger pipeline from appropriate stage
3. Manually override classification
4. Discard and re-upload

---

## 10. Monitoring

### Metrics

| Metric                    | Type      | Description                         |
| ------------------------- | --------- | ----------------------------------- |
| `kf.documents.uploaded`   | Counter   | Documents uploaded per workspace    |
| `kf.documents.processed`  | Counter   | Documents successfully published    |
| `kf.documents.failed`     | Counter   | Documents that failed processing    |
| `kf.pipeline.duration_ms` | Histogram | Duration per pipeline stage         |
| `kf.ocr.confidence`       | Histogram | OCR confidence scores               |
| `kf.chunks.created`       | Counter   | Chunks created per document         |
| `kf.embeddings.generated` | Counter   | Embeddings generated via ai-service |

### Health Indicators

- Queue depth per stage
- Average pipeline duration
- Failure rate per stage
- OCR confidence distribution

---

## 11. Integration Points

| System         | Direction  | Protocol                   | Purpose                             |
| -------------- | ---------- | -------------------------- | ----------------------------------- |
| **MinIO**      | Read/Write | S3-compatible              | File storage                        |
| **ai-service** | Read/Write | HTTP (FastAPI)             | Embeddings, vector search, OCR      |
| **PostgreSQL** | Read/Write | Prisma                     | Metadata, chunks, pipeline tracking |
| **Qdrant**     | Write      | HTTP/GRPC (via ai-service) | Vector embeddings                   |
| **Redis**      | Read/Write | BullMQ                     | Background job queue                |

---

## 12. Data Flow

```
User upload PDF
    │
    ▼
KnowledgeDocument created (status: uploaded)
    │
    ▼
BullMQ: knowledge-factory:classify
    │
    ├──► Get file from MinIO
    ├──► Run classification (rules + LLM vision)
    ├──► Update document.classification
    ├──► Set status: parsed
    │
    ▼
BullMQ: knowledge-factory:parse
    │
    ├──► Route to parser (PDF → PDFParser, Image → OCR)
    ├──► Store raw text in knowledge_extractions
    ├──► Set status: extracted
    │
    ▼
BullMQ: knowledge-factory:chunk
    │
    ├──► Normalize text
    ├──► Token-aware chunking
    ├──► Store chunks in knowledge_document_chunks
    ├──► Generate embeddings via ai-service
    ├──► Store in Qdrant
    ├──► Set status: embedded
    │
    ▼
BullMQ: knowledge-factory:publish
    │
    ├──► Create knowledge article via KnowledgeService
    ├──► Link: document.published_knowledge_id = article.id
    ├──► Update status: published
    └──► Emit audit event: document.published
```

---

## 13. Implementation Order

Per the directive, implementation follows:

1. **Entities** — Domain entities + value objects
2. **Domain** — Repository interfaces, service interfaces
3. **Value Objects** — Status enums, type enums, classification VO
4. **Repositories** — Prisma implementations
5. **Services** — Application layer services
6. **Infrastructure** — Gateways, storage adapters
7. **Controllers** — REST endpoints
8. **DTOs** — Validation + Swagger
9. **Tests** — Unit tests for entities, services, repositories

---

## 14. Open Questions

1. **Vision Service vs ai-service OCR:** Should the factory call `vision-service` (port 8003) for OCR, or use `ai-service` LLM vision? Decision: dual-path — Tesseract/Paddle via vision-service for batch, LLM vision via ai-service for complex layouts.
2. **Queue implementation:** BullMQ vs. database-backed queue. Decision: BullMQ on Redis (Redis is already a infrastructure dependency).
3. **DWG Support:** AutoCAD DWG parsing requires specialized libraries. Decision: deferred to next phase; factory rejects DWG with clear error.

---

_End of Knowledge Factory Architecture v1.0_
