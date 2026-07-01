#!/bin/bash
# ============================================================
<<<<<<< HEAD
# Xennic — Database Apply (migrate deploy + generate + seed)
# اجرا از ریشه monorepo: bash scripts/db-apply.sh
#
# این script migration‌های pending را اعمال کرده و seed را اجرا می‌کند
# برای reset کامل از pnpm db:reset استفاده کنید
=======
# Xennic — Full Database Reset & Apply
# اجرا از ریشه monorepo: bash scripts/db-reset-apply.sh
#
# ⚠️  این script همه داده‌های دیتابیس را پاک می‌کند
#     فقط در محیط development استفاده کنید
>>>>>>> 224dcab25526dff14bfe3eb02e4a18e7cb25853a
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

<<<<<<< HEAD
echo "🔄 Step 2: Applying migrations..."
npx prisma migrate deploy
echo "✅ Migrations applied"
=======
echo "🔄 Step 2: Applying full migration..."
# Drop قدیمی و apply جدید
npx prisma db push
echo "✅ Schema applied"
>>>>>>> 224dcab25526dff14bfe3eb02e4a18e7cb25853a
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
