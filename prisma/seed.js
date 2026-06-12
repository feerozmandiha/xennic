'use strict';
/**
 * Xennic Platform — Database Seed
 * Pure CJS — no TypeScript, no ESM, no tsx needed
 * Node.js v24 compatible
 */

const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

function newId() {
  return require('crypto').randomUUID();
}

// کدام ستون‌ها JSONB هستند (نیاز به ::jsonb cast دارند)
const JSONB_COLS = new Set(['features', 'settings', 'inputs', 'results', 'metadata', 'events', 'payload']);

async function upsert(table, uniqueCol, uniqueVal, cols, vals) {
  const rows = await db.$queryRawUnsafe(
    `SELECT id FROM "${table}" WHERE "${uniqueCol}" = $1 LIMIT 1`,
    uniqueVal
  );
  if (rows.length > 0) return rows[0].id;

  const id = newId();
  const allCols = ['id', ...cols];
  const allVals = [id, ...vals];

  const colsSql = allCols.map(c => `"${c}"`).join(', ');
  // برای ستون‌های JSONB باید ::jsonb cast اضافه شود
  const phSql = allCols.map((col, i) =>
    JSONB_COLS.has(col) ? `$${i + 1}::jsonb` : `$${i + 1}`
  ).join(', ');

  await db.$executeRawUnsafe(
    `INSERT INTO "${table}" (${colsSql}) VALUES (${phSql})`,
    ...allVals
  );
  return id;
}

async function main() {
  console.log('🌱 Starting Xennic seed...\n');

  // ── PLANS ─────────────────────────────────────────────────────────────────
  console.log('📋 Seeding plans...');
  const plans = [
    {
      slug: 'free', name: 'Free', m: 0,  y: 0,
      f: {
        projects: 3, calculations_month: 100, ai_requests_month: 50,
        storage_gb: 1, api_access: false, report_formats: ['pdf'],
      },
    },
    {
      slug: 'pro', name: 'Pro', m: 49, y: 490,
      f: {
        projects: -1, calculations_month: -1, ai_requests_month: 10000,
        storage_gb: 100, api_access: true, api_level: 1,
        report_formats: ['pdf', 'docx', 'xlsx'],
      },
    },
    {
      slug: 'enterprise', name: 'Enterprise', m: 0, y: 0,
      f: {
        projects: -1, calculations_month: -1, ai_requests_month: -1,
        storage_gb: -1, api_access: true, api_level: 3,
        sso: true, custom_agents: true, dedicated_support: true,
        report_formats: ['pdf', 'docx', 'xlsx'],
      },
    },
  ];
  for (const p of plans) {
    await upsert('plans', 'slug', p.slug,
      ['name', 'slug', 'monthly_price', 'yearly_price', 'features', 'is_active', 'created_at', 'updated_at'],
      [p.name, p.slug, p.m, p.y, JSON.stringify(p.f), true, new Date(), new Date()]);
    console.log(`  ✅ Plan: ${p.name}`);
  }

  // ── ROLES ─────────────────────────────────────────────────────────────────
  console.log('\n👥 Seeding roles...');
  const roles = [
    ['SUPER_ADMIN',    'Super Admin'],
    ['PLATFORM_ADMIN', 'Platform Admin'],
    ['SUPPORT_ADMIN',  'Support Admin'],
    ['OWNER',          'Owner'],
    ['ADMIN',          'Admin'],
    ['ENGINEER',       'Engineer'],
    ['CONSULTANT',     'Consultant'],
    ['MEMBER',         'Member'],
    ['VIEWER',         'Viewer'],
  ];
  const roleIds = {};
  for (const [slug, name] of roles) {
    roleIds[slug] = await upsert('roles', 'slug', slug,
      ['name', 'slug', 'created_at', 'updated_at'],
      [name, slug, new Date(), new Date()]);
    console.log(`  ✅ ${slug}`);
  }

  // ── PERMISSIONS ───────────────────────────────────────────────────────────
  console.log('\n🔑 Seeding permissions...');
  const perms = [
    ['users.read','Read Users','identity'],['users.create','Create Users','identity'],
    ['users.update','Update Users','identity'],['users.delete','Delete Users','identity'],
    ['roles.read','Read Roles','identity'],['roles.create','Create Roles','identity'],
    ['roles.update','Update Roles','identity'],['roles.delete','Delete Roles','identity'],
    ['permissions.create','Create Permissions','identity'],['permissions.delete','Delete Permissions','identity'],
    ['roles.permissions.assign','Assign Permissions','identity'],
    ['workspace.read','Read Workspace','workspace'],['workspace.update','Update Workspace','workspace'],
    ['workspace.delete','Delete Workspace','workspace'],['workspace.members.manage','Manage Members','workspace'],
    ['workspace.settings.manage','Manage Settings','workspace'],
    ['projects.read','Read Projects','projects'],['projects.create','Create Projects','projects'],
    ['projects.update','Update Projects','projects'],['projects.delete','Delete Projects','projects'],
    ['projects.export','Export Projects','projects'],['projects.share','Share Projects','projects'],
    ['engineering.read','Read Calculations','engineering'],['engineering.calculate','Run Calculations','engineering'],
    ['engineering.export','Export Calculations','engineering'],
    ['engineering.templates.manage','Manage Templates','engineering'],
    ['engineering.reports.generate','Generate Reports','engineering'],
    ['engineering.reports.approve','Approve Reports','engineering'],
    ['ai.chat','AI Chat','ai'],['ai.document_analysis','AI Document Analysis','ai'],
    ['ai.drawing_analysis','AI Drawing Analysis','ai'],['ai.agent_access','AI Agent Access','ai'],
    ['ai.export','AI Export','ai'],
    ['products.read','Read Products','marketplace'],['products.create','Create Products','marketplace'],
    ['products.update','Update Products','marketplace'],['products.delete','Delete Products','marketplace'],
    ['orders.read','Read Orders','marketplace'],['orders.create','Create Orders','marketplace'],
    ['orders.manage','Manage Orders','marketplace'],['vendors.manage','Manage Vendors','marketplace'],
    ['files.read','Read Files','storage'],['files.upload','Upload Files','storage'],
    ['files.update','Update Files','storage'],['files.delete','Delete Files','storage'],
    ['files.share','Share Files','storage'],
    ['api_keys.read','Read API Keys','api'],['api_keys.create','Create API Keys','api'],
    ['api_keys.delete','Delete API Keys','api'],['webhooks.manage','Manage Webhooks','api'],
    ['admin.dashboard','Admin Dashboard','admin'],['admin.users','Admin Users','admin'],
    ['admin.billing','Admin Billing','admin'],['admin.audit_logs','Admin Audit Logs','admin'],
    ['admin.system_settings','Admin System Settings','admin'],
  ];
  const permIds = {};
  for (const [slug, name, domain] of perms) {
    permIds[slug] = await upsert('permissions', 'slug', slug,
      ['name', 'slug', 'domain', 'created_at'],
      [name, slug, domain, new Date()]);
  }
  console.log(`  ✅ ${perms.length} permissions`);

  // ── ROLE-PERMISSION ASSIGNMENTS ───────────────────────────────────────────
  console.log('\n🔗 Assigning permissions...');
  const allSlugs = perms.map(p => p[0]);
  const assignments = {
    SUPER_ADMIN:    allSlugs,
    PLATFORM_ADMIN: ['admin.dashboard','admin.users','admin.billing','admin.audit_logs','admin.system_settings'],
    SUPPORT_ADMIN:  ['admin.dashboard','admin.audit_logs','users.read'],
    OWNER: ['workspace.read','workspace.update','workspace.delete','workspace.members.manage','workspace.settings.manage',
            'projects.read','projects.create','projects.update','projects.delete','projects.export','projects.share',
            'engineering.read','engineering.calculate','engineering.export','engineering.reports.generate',
            'ai.chat','ai.document_analysis','ai.drawing_analysis','ai.agent_access','ai.export',
            'files.read','files.upload','files.update','files.delete','files.share',
            'api_keys.read','api_keys.create','api_keys.delete','webhooks.manage',
            'products.read','orders.read','orders.create','roles.read'],
    ADMIN: ['workspace.read','workspace.update','workspace.members.manage',
            'projects.read','projects.create','projects.update','projects.delete',
            'engineering.read','engineering.calculate','engineering.export','engineering.reports.generate',
            'ai.chat','ai.document_analysis',
            'files.read','files.upload','files.update','files.delete',
            'api_keys.read','api_keys.create','products.read','orders.read','orders.create','roles.read'],
    ENGINEER: ['projects.read','projects.create','projects.update',
               'engineering.read','engineering.calculate','engineering.export','engineering.reports.generate',
               'ai.chat','ai.document_analysis','ai.drawing_analysis',
               'files.read','files.upload','products.read','orders.read'],
    CONSULTANT: ['projects.read','engineering.read',
                 'ai.chat','ai.document_analysis','ai.drawing_analysis','ai.export',
                 'files.read','files.upload','products.read','orders.read'],
    MEMBER: ['projects.read','engineering.read','engineering.calculate','ai.chat',
             'files.read','files.upload','products.read','orders.read','orders.create'],
    VIEWER: ['projects.read','engineering.read','files.read','products.read'],
  };

  for (const [roleSlug, slugList] of Object.entries(assignments)) {
    const roleId = roleIds[roleSlug];
    if (!roleId) continue;
    for (const permSlug of slugList) {
      const permId = permIds[permSlug];
      if (!permId) continue;
      const ex = await db.$queryRawUnsafe(
        `SELECT id FROM "role_permissions" WHERE "role_id"=$1 AND "permission_id"=$2 LIMIT 1`,
        roleId, permId
      );
      if (ex.length === 0) {
        await db.$executeRawUnsafe(
          `INSERT INTO "role_permissions"("id","role_id","permission_id") VALUES($1,$2,$3)`,
          newId(), roleId, permId
        );
      }
    }
    console.log(`  ✅ ${roleSlug}: ${slugList.length} perms`);
  }

  // ── SYSTEM SETTINGS ───────────────────────────────────────────────────────
  console.log('\n⚙️  Seeding system settings...');
  const settings = [
    ['platform.name','Xennic'],['platform.version','1.0.0'],
    ['platform.default_language','fa'],['platform.supported_locales','fa,en'],
    ['platform.maintenance_mode','false'],
    ['email.from_address','noreply@xennic.com'],['email.from_name','Xennic Platform'],
  ];
  for (const [key, value] of settings) {
    await upsert('system_settings', 'key', key, ['key','value','updated_at'], [key, value, new Date()]);
  }
  console.log(`  ✅ ${settings.length} settings`);

  // ── ENGINEERING STANDARDS ─────────────────────────────────────────────────
  console.log('\n📐 Seeding engineering standards...');
  const standards = [
    ['IEC 60364','Electrical Installations of Buildings','IEC','2022'],
    ['IEC 60287','Electric Cables — Calculation of Current Rating','IEC','2023'],
    ['IEC 60949','Calculation of Short-Circuit Temperatures','IEC','1988'],
    ['IEC 60909','Short-Circuit Currents in Three-Phase AC Systems','IEC','2016'],
    ['IEC 60076','Power Transformers','IEC','2021'],
    ['IEC 60947','Low-Voltage Switchgear and Controlgear','IEC','2021'],
    ['IEC 61000-3','Electromagnetic Compatibility — Limits','IEC','2022'],
    ['IEC 62548','Design Requirements for PV Arrays','IEC','2016'],
    ['IEEE 519','Harmonic Control in Electric Power Systems','IEEE','2022'],
    ['IEEE 80','Guide for Safety in AC Substation Grounding','IEEE','2013'],
    ['IEEE 1584','Guide for Performing Arc-Flash Hazard Calculations','IEEE','2018'],
    ['IEEE C57.110','Transformer Compatibility with Non-Sinusoidal Loads','IEEE','2018'],
    ['NFPA 70E','Standard for Electrical Safety in the Workplace','NFPA','2024'],
    ['EN 12464','Light and Lighting of Work Places','CEN','2021'],
    ['ISIRI 3558','Electrical Installations — Iran National Standard','ISIRI','2016'],
  ];
  for (const [code, title, org, ver] of standards) {
    await upsert('engineering_standards', 'code', code,
      ['code','title','organization','version','status'],
      [code, title, org, ver, 'active']);
  }
  console.log(`  ✅ ${standards.length} standards`);

  // ── AI AGENTS ─────────────────────────────────────────────────────────────
  console.log('\n🤖 Seeding AI agents...');
  const agents = [
    ['electrical-engineer','Electrical Engineer Agent',true],
    ['solar-consultant','Solar Consultant Agent',true],
    ['protection-engineer','Protection Engineer Agent',true],
    ['power-quality','Power Quality Agent',true],
    ['researcher','Research Agent',true],
    ['document-analyst','Document Analyst Agent',true],
    ['drawing-analyst','Drawing Analyst Agent',false],
  ];
  for (const [slug, name, active] of agents) {
    await upsert('agents','slug',slug,
      ['name','slug','version','is_active','created_at'],
      [name, slug, '1.0', active, new Date()]);
  }
  console.log(`  ✅ ${agents.length} agents`);

  console.log('\n✅ Xennic seed completed successfully!');
}

main()
  .catch(e => { console.error('❌ Seed failed:', e.message); process.exit(1); })
  .finally(() => db.$disconnect());
