#!/bin/bash
# ============================================================
# Fix existing database constraints before db push
# اجرا از ریشه monorepo: bash scripts/db-fix-constraints.sh
# ============================================================

set -e

# DATABASE_URL را از .env بخوان
if [ -f ".env" ]; then
  export $(grep -v '^#' .env | grep DATABASE_URL | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not found in .env"
  exit 1
fi

echo "🔧 Fixing database constraints..."
echo ""

# اجرای SQL مستقیم برای حذف constraint های مزاحم
psql "$DATABASE_URL" <<'SQL'
-- حذف constraint های phone که در schema جدید وجود ندارند
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_phone_key";
DROP INDEX IF EXISTS "users_phone_key";

-- حذف جدول قدیمی Tenant اگر وجود داشته باشد
DROP TABLE IF EXISTS "Tenant";

-- حذف index های مزاحم دیگر
DROP INDEX IF EXISTS "users_email_idx";

COMMIT;
SQL

echo "✅ Constraints fixed"
echo ""

echo "🔄 Applying schema..."
npx prisma db push --accept-data-loss
echo "✅ Schema applied"
echo ""

echo "⚙️  Generating Prisma client..."
npx prisma generate
echo "✅ Client generated"
echo ""

echo "🌱 Seeding database..."
npx tsx prisma/seed.ts
echo "✅ Seed complete"
echo ""

echo "🎉 Done!"
