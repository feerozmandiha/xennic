#!/bin/bash
# ============================================================
# Xennic Database Baseline Script
# وقتی دیتابیس از قبل جداول دارد و P3005 می‌دهد
# اجرا از ریشه monorepo: bash scripts/db-baseline.sh
# ============================================================

set -e

echo "🔧 Xennic Database Baseline"
echo "============================"
echo ""
echo "⚠️  این دستور وضعیت فعلی دیتابیس را به‌عنوان baseline ثبت می‌کند"
echo "    سپس migration جدید را اعمال می‌کند"
echo ""

# ─── Step 1: Baseline migration اولیه ────────────────────────────────────────
echo "📌 Step 1: Marking initial migration as already applied..."
npx prisma migrate resolve --applied "20260602080333_init"
echo "✅ Initial migration marked as applied"
echo ""

# ─── Step 2: Apply new migration ─────────────────────────────────────────────
echo "🔄 Step 2: Applying new migration..."
npx prisma migrate deploy
echo "✅ New migration applied"
echo ""

# ─── Step 3: Generate Prisma Client ──────────────────────────────────────────
echo "⚙️  Step 3: Generating Prisma client..."
npx prisma generate
echo "✅ Prisma client generated"
echo ""

# ─── Step 4: Seed ────────────────────────────────────────────────────────────
echo "🌱 Step 4: Seeding database..."
npx tsx prisma/seed.ts
echo "✅ Seed complete"
echo ""

echo "🎉 Database setup complete!"
