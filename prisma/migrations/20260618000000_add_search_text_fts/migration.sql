-- Add search_text column for full-text search
ALTER TABLE knowledge ADD COLUMN IF NOT EXISTS search_text TEXT;

-- GIN index on tsvector expression for fast full-text search
CREATE INDEX IF NOT EXISTS idx_knowledge_search_tsv
  ON knowledge
  USING GIN (to_tsvector('simple', COALESCE(search_text, '')));
