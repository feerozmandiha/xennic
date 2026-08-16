-- CMS content storage (landing/header/footer/sections)
CREATE TABLE IF NOT EXISTS "cms_content" (
  "id"           TEXT        NOT NULL PRIMARY KEY,
  "slot"         TEXT        NOT NULL,
  "locale"       TEXT        NOT NULL DEFAULT 'fa',
  "document"     JSONB       NOT NULL,
  "version"      INTEGER     NOT NULL DEFAULT 1,
  "published_at" TIMESTAMPTZ,
  "created_by"   TEXT,
  "updated_by"   TEXT,
  "created_at"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "cms_content_created_by_fkey"
    FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL,
  CONSTRAINT "cms_content_updated_by_fkey"
    FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "cms_content_slot_locale_key"
  ON "cms_content"("slot", "locale");

CREATE INDEX IF NOT EXISTS "cms_content_locale_idx" ON "cms_content"("locale");
CREATE INDEX IF NOT EXISTS "cms_content_slot_idx"   ON "cms_content"("slot");
CREATE INDEX IF NOT EXISTS "cms_content_published_idx" ON "cms_content"("published_at");
