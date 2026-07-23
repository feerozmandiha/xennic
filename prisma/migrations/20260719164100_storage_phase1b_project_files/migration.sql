-- Storage Phase 1B: Project Files
-- Date: 2026-07-19
-- Order: XENNIC-STORAGE-EO-1B

-- Step 1: Create project_files junction table
CREATE TABLE "project_files" (
  "id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "file_id" TEXT NOT NULL,
  "added_by" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "project_files_pkey" PRIMARY KEY ("id")
);

-- Step 2: Add FK constraint on project_files.project_id → projects.id
ALTER TABLE "project_files" ADD CONSTRAINT "project_files_project_id_fkey"
  FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 3: Add FK constraint on project_files.file_id → files.id
ALTER TABLE "project_files" ADD CONSTRAINT "project_files_file_id_fkey"
  FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 4: Add FK constraint on project_files.added_by → users.id
ALTER TABLE "project_files" ADD CONSTRAINT "project_files_added_by_fkey"
  FOREIGN KEY ("added_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 5: Add unique constraint on (project_id, file_id)
ALTER TABLE "project_files" ADD CONSTRAINT "project_files_project_id_file_id_key"
  UNIQUE ("project_id", "file_id");

-- Step 6: Create indexes
CREATE INDEX "project_files_project_id_idx" ON "project_files"("project_id");
CREATE INDEX "project_files_file_id_idx" ON "project_files"("file_id");
