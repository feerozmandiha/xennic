-- Marketplace order payment (Zarinpal) fields
ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "authority"         TEXT,
  ADD COLUMN IF NOT EXISTS "gateway"           TEXT DEFAULT 'zarinpal',
  ADD COLUMN IF NOT EXISTS "gateway_reference" TEXT,
  ADD COLUMN IF NOT EXISTS "paid_at"           TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS "orders_authority_idx" ON "orders"("authority");
