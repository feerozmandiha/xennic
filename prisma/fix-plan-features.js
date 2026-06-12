'use strict';
/**
 * Fix plan features — update to use correct key names
 * اجرا: node prisma/fix-plan-features.js
 */
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

async function main() {
  console.log('🔧 Fixing plan features...\n');

  const plans = [
    {
      slug: 'free',
      features: JSON.stringify({
        projects: 3, calculations_month: 100, ai_requests_month: 50,
        storage_gb: 1, api_access: false, report_formats: ['pdf'],
      }),
    },
    {
      slug: 'pro',
      features: JSON.stringify({
        projects: -1, calculations_month: -1, ai_requests_month: 10000,
        storage_gb: 100, api_access: true, api_level: 1,
        report_formats: ['pdf', 'docx', 'xlsx'],
      }),
    },
    {
      slug: 'enterprise',
      features: JSON.stringify({
        projects: -1, calculations_month: -1, ai_requests_month: -1,
        storage_gb: -1, api_access: true, api_level: 3,
        sso: true, custom_agents: true, dedicated_support: true,
        report_formats: ['pdf', 'docx', 'xlsx'],
      }),
    },
  ];

  for (const plan of plans) {
    await db.$executeRawUnsafe(
      `UPDATE "plans" SET features = $1::jsonb, updated_at = NOW() WHERE slug = $2`,
      plan.features, plan.slug
    );
    console.log(`  ✅ Fixed: ${plan.slug}`);
  }

  console.log('\n✅ Plan features fixed!');
}

main()
  .catch(e => { console.error('❌ Failed:', e.message); process.exit(1); })
  .finally(() => db.$disconnect());
