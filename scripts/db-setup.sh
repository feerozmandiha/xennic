#!/bin/bash
# ============================================================
# Xennic Database Setup Script
# اجرا از ریشه monorepo: bash scripts/db-setup.sh
# ============================================================

set -e

echo "🗄️  Xennic Database Setup"
echo "=========================="
echo ""

# ─── Step 1: Generate Prisma Client ──────────────────────────────────────────
echo "⚙️  Step 1: Generating Prisma client..."
npx prisma generate
echo "✅ Prisma client generated"
echo ""

# ─── Step 2: Run Migrations ──────────────────────────────────────────────────
echo "🔄 Step 2: Running migrations..."
npx prisma migrate deploy
echo "✅ Migrations applied"
echo ""

# ─── Step 3: Run Seed ────────────────────────────────────────────────────────
echo "🌱 Step 3: Seeding database..."
npx tsx prisma/seed.ts
echo "✅ Database seeded"
echo ""

echo "🎉 Database setup complete!"
