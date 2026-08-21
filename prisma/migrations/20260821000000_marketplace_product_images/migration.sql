-- Marketplace product images (album / gallery)
CREATE TABLE IF NOT EXISTS "product_images" (
  "id"         TEXT         NOT NULL,
  "product_id" TEXT         NOT NULL,
  "url"        TEXT         NOT NULL,
  "alt_fa"     TEXT,
  "alt_en"     TEXT,
  "is_primary" BOOLEAN      NOT NULL DEFAULT false,
  "sort_order" INTEGER      NOT NULL DEFAULT 0,
  "mime_type"  TEXT,
  "file_size"  INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "product_images"
  DROP CONSTRAINT IF EXISTS "product_images_product_id_fkey";

ALTER TABLE "product_images"
  ADD CONSTRAINT "product_images_product_id_fkey"
  FOREIGN KEY ("product_id") REFERENCES "products"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS "product_images_product_id_url_key"
  ON "product_images"("product_id", "url");

CREATE INDEX IF NOT EXISTS "product_images_product_id_idx"
  ON "product_images"("product_id");

CREATE INDEX IF NOT EXISTS "product_images_product_id_sort_order_idx"
  ON "product_images"("product_id", "sort_order");
