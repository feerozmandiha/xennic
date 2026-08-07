/*
  Warnings:

  - A unique constraint covering the columns `[file_id,version]` on the table `file_versions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mime_type` to the `file_versions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `original_name` to the `file_versions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `file_versions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "file_versions" ADD COLUMN     "change_reason" TEXT,
ADD COLUMN     "created_by" TEXT,
ADD COLUMN     "mime_type" TEXT NOT NULL,
ADD COLUMN     "original_name" TEXT NOT NULL,
ADD COLUMN     "size" BIGINT NOT NULL;

-- CreateIndex
CREATE INDEX "file_versions_file_id_created_at_idx" ON "file_versions"("file_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "file_versions_file_id_version_key" ON "file_versions"("file_id", "version");

-- AddForeignKey
ALTER TABLE "file_versions" ADD CONSTRAINT "file_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
