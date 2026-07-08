# ADR-011: Knowledge Factory Architecture & Implementation

- **Status:** Accepted
- **Date:** 2026-07-03
- **Decision makers:** Engineering Lead, AI Architect, Security Engineer
- **Related RFC:** RFC-KF-001
- **Gaps addressed:** XEN-GAP-0057, XEN-GAP-0001, XEN-GAP-0016, XEN-GAP-0029, XEN-GAP-0031

---

## Context

The `knowledge-factory` module exists as an empty directory with DDD scaffolding but zero implementation. The existing `knowledge` module provides manual article creation/editing. There is no automated pipeline to ingest raw engineering documents (PDFs, images, DWGs) and convert them into searchable knowledge articles with RAG-ready vector embeddings.

The current state forces engineers to manually copy-paste content from standards and manuals into the system. This creates bottlenecks, data quality issues, and prevents scaling knowledge volume.

## Decision

Implement the Knowledge Factory as a **full DDD NestJS module** with the following architecture:

- **Domain:** `KnowledgeDocument`, `KnowledgeDocumentChunk`, `KnowledgePipelineRun`, `KnowledgeExtraction` as aggregates. Value objects for `DocumentStatus`, `DocumentType`, `PipelineStageStatus`, `ClassificationResult`.
- **Application:** Orchestration services for intake, classification, parsing, normalization, chunking, and publishing.
- **Infrastructure:** Prisma repositories, BullMQ background workers on Redis, MinIO file storage, ai-service HTTP gateway for embeddings and OCR.
- **Presentation:** REST controllers scoped per workspace with full RBAC enforcement.

### Key architectural decisions:

1. **Background processing via BullMQ:** All pipeline stages (classify, parse, chunk, embed, publish) run as background jobs. This keeps API responses fast and provides natural retry/backpressure handling.

2. **Dual-path OCR:** Vision-service (Tesseract/Paddle) handles high-volume batch OCR. ai-service LLM vision handles complex layouts where traditional OCR fails.

3. **Provenance chain:** Every chunk carries `source_document_id`, `page_number`, and `section` — enabling full traceability from RAG response back to original page.

4. **Integration with existing `knowledge` module:** Published documents create a `knowledge` article and link via `published_knowledge_id`. The factory does NOT duplicate the knowledge CRUD system.

5. **Workspace-scoped:** All documents, chunks, and pipeline runs belong to a `workspace_id`. Multi-tenant isolation is enforced at repository level.

## Consequences

### Benefits
- Automated ingestion removes manual entry bottleneck
- Source provenance enables citation and audit
- Background workers prevent API thread exhaustion on large files
- Factory output feeds both knowledge base and RAG index simultaneously
- Retry + dead-letter queue handles transient failures without data loss

### Tradeoffs
- BullMQ adds Redis dependency (already required by spec)
- OCR failures on poor-quality scans require manual intervention
- Complex documents need human classification override path
- Large documents increase queue processing time

### Risks
- Queue backlog if ai-service is slow/unavailable — mitigated by circuit breaker + fallback queues
- MinIO unavailability blocks all uploads — mitigated by graceful 503 with retry guidance

## Compliance

- Every pipeline stage transition updates `audit_logs` table
- All repository methods enforce `workspace_id` filtering
- `document.status` transitions validated by `DocumentStatus` value object
- Failed documents expose `error_message` without leaking system internals

## Related

- **Architecture doc:** `docs/knowledge/knowledge-factory-architecture.md`
- **Sprint:** `docs/implementation/sprint-plan.md` Sprint 13
- **Supersedes:** XEN-GAP-0057 (knowledge-factory empty module)

---

## Appendix: Model Schema

```prisma
model knowledge_documents {
  id                    String    @id @default(uuid())
  workspace_id          String
  filename              String
  original_name         String
  mime_type             String
  size_bytes            Int
  storage_path          String?
  document_type         String    @default("pdf")
  status                String    @default("uploaded")
  classification        Json?     @default("{}")
  metadata              Json      @default("{}")
  error_message         String?
  retry_count           Int       @default(0)
  published_knowledge_id String?
  created_by            String?
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt

  @relation("KnowledgeDocumentCreator", fields: [created_by])
}

model knowledge_document_chunks {
  id           String   @id @default(uuid())
  document_id  String
  chunk_index  Int
  text         String
  token_count  Int
  page_number  Int?
  section      String?
  metadata     Json     @default("{}")
  embedding_id String?
  created_at   DateTime @default(now())

  @relation(fields: [document_id])
}

model knowledge_pipeline_runs {
  id          String   @id @default(uuid())
  document_id String
  stage       String
  status      String
  input       Json
  output      Json?
  error       String?
  started_at  DateTime @default(now())
  finished_at DateTime?
  duration_ms Int?

  @relation(fields: [document_id])
}

model knowledge_extractions {
  id          String   @id @default(uuid())
  document_id String
  method      String
  text        String
  confidence  Float?
  language    String?
  metadata    Json     @default("{}")
  created_at  DateTime @default(now())

  @relation(fields: [document_id])
}
```
