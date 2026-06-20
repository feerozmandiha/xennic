/*
  Warnings:

  - Added the required column `workspace_id` to the `knowledge` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "knowledge" ADD COLUMN     "workspace_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "knowledge_workspace_id_idx" ON "knowledge"("workspace_id");

-- AddForeignKey
ALTER TABLE "knowledge" ADD CONSTRAINT "knowledge_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
