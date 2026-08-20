ALTER TABLE "knowledge"
  ADD COLUMN IF NOT EXISTS "access_tier" TEXT NOT NULL DEFAULT 'free';
CREATE INDEX IF NOT EXISTS "knowledge_access_tier_idx" ON "knowledge"("access_tier");
