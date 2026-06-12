#!/bin/bash
# ============================================================
# Xennic — Full Database Reset & Apply
# اجرا از ریشه monorepo: bash scripts/db-reset-apply.sh
#
# ⚠️  این script همه داده‌های دیتابیس را پاک می‌کند
#     فقط در محیط development استفاده کنید
# ============================================================

set -e

echo "⚠️  This will DROP and recreate the database schema."
read -p "   Are you sure? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
  echo "❌ Aborted."
  exit 1
fi

echo ""
echo "🗑️  Step 1: Resetting database..."
npx prisma migrate reset --force --skip-seed
echo "✅ Database reset"
echo ""

echo "🔄 Step 2: Applying full migration..."
# Drop قدیمی و apply جدید
npx prisma db push
echo "✅ Schema applied"
echo ""

echo "⚙️  Step 3: Generating Prisma client..."
npx prisma generate
echo "✅ Client generated"
echo ""

echo "🌱 Step 4: Seeding database..."
npx tsx prisma/seed.ts
echo "✅ Seed complete"
echo ""

echo "🎉 Done! Database is ready."
