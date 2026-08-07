-- Storage Phase 1A: FK Foundation
-- Date: 2026-07-19
-- Order: XENNIC-STORAGE-EO-1A

-- Step 1: Add nullable storage_file_id column to knowledge_documents
ALTER TABLE "knowledge_documents" ADD COLUMN "storage_file_id" TEXT;

-- Step 2: Add FK constraint on knowledge_documents.storage_file_id → files.id
ALTER TABLE "knowledge_documents" ADD CONSTRAINT "knowledge_documents_storage_file_id_fkey"
  FOREIGN KEY ("storage_file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 3: Add FK constraint on project_reports.file_id → files.id
ALTER TABLE "project_reports" ADD CONSTRAINT "project_reports_file_id_fkey"
  FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 4: Add FK constraint on users.avatar_file_id → files.id
ALTER TABLE "users" ADD CONSTRAINT "users_avatar_file_id_fkey"
  FOREIGN KEY ("avatar_file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 5: Create index on knowledge_documents.storage_file_id
CREATE INDEX "knowledge_documents_storage_file_id_idx" ON "knowledge_documents"("storage_file_id");
