/**
 * Xennic Platform — Prisma Seed (ESM JavaScript)
 * این فایل نسخه JS خالص seed.ts است — بدون نیاز به tsx
 */

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

function newId() {
  return crypto.randomUUID();
}

async function upsertRaw(table, uniqueCol, uniqueVal, allCols, values) {
  const existing = await db.$queryRawUnsafe(
    `SELECT id FROM "${table}" WHERE "${uniqueCol}" = $1 LIMIT 1`,
    uniqueVal,
  );
  if (existing.length > 0) {
    return existing[0].id;
  }
  const id = newId();
  const cols = ['id', ...allCols].map(c => `"${c}"`).join(', ');
  const params = [id, ...values];
  const placeholders = params.map((_, i) => `$${i + 1}`).join(', ');
  await db.$executeRawUnsafe(
    `INSERT INTO "${table}" (${cols}) VALUES (${placeholders})`,
    ...params,
  );
  return id;
}

async function main() {
  console.log('🌱 Starting Xennic seed...\n');

  // ── 1. PLANS ──────────────────────────────────────────────────────────────
  console.log('📋 Seeding plans...');

  const plansData = [
    {
      slug: 'free', name: 'Free', monthly_price: 0, yearly_price: 0,
      features: JSON.stringify({ projects: 3, calculations_month: 100, ai_requests_month: 50, storage_gb: 1, api_access: false, report_formats: ['pdf'] }),
    },
    {
      slug: 'pro', name: 'Pro', monthly_price: 49, yearly_price: 490,
      features: JSON.stringify({ projects: -1, calculations_month: -1, ai_requests_month: 10000, storage_gb: 100, api_access: true, api_level: 1, report_formats: ['pdf', 'docx', 'xlsx'] }),
    },
    {
      slug: 'enterprise', name: 'Enterprise', monthly_price: 0, yearly_price: 0,
      features: JSON.stringify({ projects: -1, calculations_month: -1, ai_requests_month: -1, storage_gb: -1, api_access: true, api_level: 3, sso: true, custom_agents: true, dedicated_support: true, report_formats: ['pdf', 'docx', 'xlsx'] }),
    },
  ];

  for (const plan of plansData) {
    await upsertRaw('plans', 'slug', plan.slug,
      ['name', 'slug', 'monthly_price', 'yearly_price', 'features', 'is_active', 'created_at', 'updated_at'],
      [plan.name, plan.slug, plan.monthly_price, plan.yearly_price, plan.features, true, new Date(), new Date()]);
    console.log(`  ✅ Plan: ${plan.name}`);
  }

  // ── 2. ROLES ──────────────────────────────────────────────────────────────
  console.log('\n👥 Seeding roles...');

  const rolesData = [
    { slug: 'SUPER_ADMIN',    name: 'Super Admin',    description: 'Full platform access' },
    { slug: 'PLATFORM_ADMIN', name: 'Platform Admin', description: 'Platform management' },
    { slug: 'SUPPORT_ADMIN',  name: 'Support Admin',  description: 'Support operations — read-only' },
    { slug: 'OWNER',          name: 'Owner',          description: 'Workspace owner' },
    { slug: 'ADMIN',          name: 'Admin',          description: 'Workspace admin' },
    { slug: 'ENGINEER',       name: 'Engineer',       description: 'Engineering features' },
    { slug: 'CONSULTANT',     name: 'Consultant',     description: 'Consultation & analysis' },
    { slug: 'MEMBER',         name: 'Member',         description: 'Standard usage' },
    { slug: 'VIEWER',         name: 'Viewer',         description: 'Read-only access' },
  ];

  const roleIds = {};
  for (const role of rolesData) {
    const id = await upsertRaw('roles', 'slug', role.slug,
      ['name', 'slug', 'description', 'created_at', 'updated_at'],
      [role.name, role.slug, role.description, new Date(), new Date()]);
    roleIds[role.slug] = id;
    console.log(`  ✅ Role: ${role.slug}`);
  }

  // ── 3. PERMISSIONS ────────────────────────────────────────────────────────
  console.log('\n🔑 Seeding permissions...');

  const permsData = [
    { slug: 'users.read',               name: 'Read Users',              domain: 'identity' },
    { slug: 'users.create',             name: 'Create Users',            domain: 'identity' },
    { slug: 'users.update',             name: 'Update Users',            domain: 'identity' },
    { slug: 'users.delete',             name: 'Delete Users',            domain: 'identity' },
    { slug: 'roles.read',               name: 'Read Roles',              domain: 'identity' },
    { slug: 'roles.create',             name: 'Create Roles',            domain: 'identity' },
    { slug: 'roles.update',             name: 'Update Roles',            domain: 'identity' },
    { slug: 'roles.delete',             name: 'Delete Roles',            domain: 'identity' },
    { slug: 'permissions.create',       name: 'Create Permissions',      domain: 'identity' },
    { slug: 'permissions.delete',       name: 'Delete Permissions',      domain: 'identity' },
    { slug: 'roles.permissions.assign', name: 'Assign Permissions',      domain: 'identity' },
    { slug: 'workspace.read',           name: 'Read Workspace',          domain: 'workspace' },
    { slug: 'workspace.update',         name: 'Update Workspace',        domain: 'workspace' },
    { slug: 'workspace.delete',         name: 'Delete Workspace',        domain: 'workspace' },
    { slug: 'workspace.members.manage', name: 'Manage Members',          domain: 'workspace' },
    { slug: 'workspace.settings.manage',name: 'Manage Settings',         domain: 'workspace' },
    { slug: 'projects.read',   name: 'Read Projects',   domain: 'projects' },
    { slug: 'projects.create', name: 'Create Projects', domain: 'projects' },
    { slug: 'projects.update', name: 'Update Projects', domain: 'projects' },
    { slug: 'projects.delete', name: 'Delete Projects', domain: 'projects' },
    { slug: 'projects.export', name: 'Export Projects', domain: 'projects' },
    { slug: 'projects.share',  name: 'Share Projects',  domain: 'projects' },
    { slug: 'engineering.read',             name: 'Read Calculations',   domain: 'engineering' },
    { slug: 'engineering.calculate',        name: 'Run Calculations',    domain: 'engineering' },
    { slug: 'engineering.export',           name: 'Export Calculations', domain: 'engineering' },
    { slug: 'engineering.templates.manage', name: 'Manage Templates',    domain: 'engineering' },
    { slug: 'engineering.reports.generate', name: 'Generate Reports',    domain: 'engineering' },
    { slug: 'engineering.reports.approve',  name: 'Approve Reports',     domain: 'engineering' },
    { slug: 'ai.chat',              name: 'AI Chat',              domain: 'ai' },
    { slug: 'ai.document_analysis', name: 'AI Document Analysis', domain: 'ai' },
    { slug: 'ai.drawing_analysis',  name: 'AI Drawing Analysis',  domain: 'ai' },
    { slug: 'ai.agent_access',      name: 'AI Agent Access',      domain: 'ai' },
    { slug: 'ai.export',            name: 'AI Export',            domain: 'ai' },
    { slug: 'products.read',   name: 'Read Products',   domain: 'marketplace' },
    { slug: 'products.create', name: 'Create Products', domain: 'marketplace' },
    { slug: 'products.update', name: 'Update Products', domain: 'marketplace' },
    { slug: 'products.delete', name: 'Delete Products', domain: 'marketplace' },
    { slug: 'orders.read',     name: 'Read Orders',     domain: 'marketplace' },
    { slug: 'orders.create',   name: 'Create Orders',   domain: 'marketplace' },
    { slug: 'orders.manage',   name: 'Manage Orders',   domain: 'marketplace' },
    { slug: 'vendors.manage',  name: 'Manage Vendors',  domain: 'marketplace' },
    { slug: 'files.read',   name: 'Read Files',   domain: 'storage' },
    { slug: 'files.upload', name: 'Upload Files', domain: 'storage' },
    { slug: 'files.update', name: 'Update Files', domain: 'storage' },
    { slug: 'files.delete', name: 'Delete Files', domain: 'storage' },
    { slug: 'files.share',  name: 'Share Files',  domain: 'storage' },
    { slug: 'api_keys.read',   name: 'Read API Keys',   domain: 'api' },
    { slug: 'api_keys.create', name: 'Create API Keys', domain: 'api' },
    { slug: 'api_keys.delete', name: 'Delete API Keys', domain: 'api' },
    { slug: 'webhooks.manage', name: 'Manage Webhooks', domain: 'api' },
    { slug: 'admin.dashboard',       name: 'Admin Dashboard',       domain: 'admin' },
    { slug: 'admin.users',           name: 'Admin Users',           domain: 'admin' },
    { slug: 'admin.billing',         name: 'Admin Billing',         domain: 'admin' },
    { slug: 'admin.audit_logs',      name: 'Admin Audit Logs',      domain: 'admin' },
    { slug: 'admin.system_settings', name: 'Admin System Settings', domain: 'admin' },
  ];

  const permIds = {};
  for (const perm of permsData) {
    const id = await upsertRaw('permissions', 'slug', perm.slug,
      ['name', 'slug', 'domain', 'created_at'],
      [perm.name, perm.slug, perm.domain, new Date()]);
    permIds[perm.slug] = id;
  }
  console.log(`  ✅ ${permsData.length} permissions seeded`);

  // ── 4. ROLE-PERMISSION ASSIGNMENTS ────────────────────────────────────────
  console.log('\n🔗 Assigning permissions to roles...');

  const allSlugs = permsData.map(p => p.slug);

  const assignments = [
    { roleSlug: 'SUPER_ADMIN',    perms: allSlugs },
    { roleSlug: 'PLATFORM_ADMIN', perms: ['admin.dashboard','admin.users','admin.billing','admin.audit_logs','admin.system_settings'] },
    { roleSlug: 'SUPPORT_ADMIN',  perms: ['admin.dashboard','admin.audit_logs','users.read'] },
    { roleSlug: 'OWNER', perms: [
      'workspace.read','workspace.update','workspace.delete','workspace.members.manage','workspace.settings.manage',
      'projects.read','projects.create','projects.update','projects.delete','projects.export','projects.share',
      'engineering.read','engineering.calculate','engineering.export','engineering.reports.generate',
      'ai.chat','ai.document_analysis','ai.drawing_analysis','ai.agent_access','ai.export',
      'files.read','files.upload','files.update','files.delete','files.share',
      'api_keys.read','api_keys.create','api_keys.delete','webhooks.manage',
      'products.read','orders.read','orders.create','roles.read',
    ]},
    { roleSlug: 'ADMIN', perms: [
      'workspace.read','workspace.update','workspace.members.manage',
      'projects.read','projects.create','projects.update','projects.delete',
      'engineering.read','engineering.calculate','engineering.export','engineering.reports.generate',
      'ai.chat','ai.document_analysis',
      'files.read','files.upload','files.update','files.delete',
      'api_keys.read','api_keys.create',
      'products.read','orders.read','orders.create','roles.read',
    ]},
    { roleSlug: 'ENGINEER', perms: [
      'projects.read','projects.create','projects.update',
      'engineering.read','engineering.calculate','engineering.export','engineering.reports.generate',
      'ai.chat','ai.document_analysis','ai.drawing_analysis',
      'files.read','files.upload','products.read','orders.read',
    ]},
    { roleSlug: 'CONSULTANT', perms: [
      'projects.read','engineering.read',
      'ai.chat','ai.document_analysis','ai.drawing_analysis','ai.export',
      'files.read','files.upload','products.read','orders.read',
    ]},
    { roleSlug: 'MEMBER', perms: [
      'projects.read','engineering.read','engineering.calculate','ai.chat',
      'files.read','files.upload','products.read','orders.read','orders.create',
    ]},
    { roleSlug: 'VIEWER', perms: ['projects.read','engineering.read','files.read','products.read'] },
  ];

  for (const { roleSlug, perms } of assignments) {
    const roleId = roleIds[roleSlug];
    if (!roleId) continue;
    for (const permSlug of perms) {
      const permId = permIds[permSlug];
      if (!permId) continue;
      const exists = await db.$queryRawUnsafe(
        `SELECT id FROM "role_permissions" WHERE "role_id" = $1 AND "permission_id" = $2 LIMIT 1`,
        roleId, permId,
      );
      if (exists.length === 0) {
        await db.$executeRawUnsafe(
          `INSERT INTO "role_permissions" ("id","role_id","permission_id") VALUES ($1,$2,$3)`,
          newId(), roleId, permId,
        );
      }
    }
    console.log(`  ✅ ${roleSlug}: ${perms.length} permissions`);
  }

  // ── 5. SYSTEM SETTINGS ────────────────────────────────────────────────────
  console.log('\n⚙️  Seeding system settings...');
  const settingsData = [
    { key: 'platform.name',              value: 'Xennic' },
    { key: 'platform.version',           value: '1.0.0' },
    { key: 'platform.default_language',  value: 'fa' },
    { key: 'platform.supported_locales', value: 'fa,en' },
    { key: 'platform.maintenance_mode',  value: 'false' },
    { key: 'email.from_address',         value: 'noreply@xennic.com' },
    { key: 'email.from_name',            value: 'Xennic Platform' },
  ];
  for (const s of settingsData) {
    await upsertRaw('system_settings', 'key', s.key, ['key','value','updated_at'], [s.key, s.value, new Date()]);
  }
  console.log(`  ✅ ${settingsData.length} system settings seeded`);

  // ── 6. ENGINEERING STANDARDS ──────────────────────────────────────────────
  console.log('\n📐 Seeding engineering standards...');
  const standardsData = [
    { code: 'IEC 60364',    title: 'Electrical Installations of Buildings',               organization: 'IEC',   version: '2022' },
    { code: 'IEC 60287',    title: 'Electric Cables — Calculation of Current Rating',     organization: 'IEC',   version: '2023' },
    { code: 'IEC 60949',    title: 'Calculation of Short-Circuit Temperatures',           organization: 'IEC',   version: '1988' },
    { code: 'IEC 60909',    title: 'Short-Circuit Currents in Three-Phase AC Systems',    organization: 'IEC',   version: '2016' },
    { code: 'IEC 60076',    title: 'Power Transformers',                                  organization: 'IEC',   version: '2021' },
    { code: 'IEC 60947',    title: 'Low-Voltage Switchgear and Controlgear',              organization: 'IEC',   version: '2021' },
    { code: 'IEC 61000-3',  title: 'Electromagnetic Compatibility — Limits',              organization: 'IEC',   version: '2022' },
    { code: 'IEC 62548',    title: 'Design Requirements for PV Arrays',                   organization: 'IEC',   version: '2016' },
    { code: 'IEEE 519',     title: 'Harmonic Control in Electric Power Systems',          organization: 'IEEE',  version: '2022' },
    { code: 'IEEE 80',      title: 'Guide for Safety in AC Substation Grounding',         organization: 'IEEE',  version: '2013' },
    { code: 'IEEE 1584',    title: 'Guide for Performing Arc-Flash Hazard Calculations',  organization: 'IEEE',  version: '2018' },
    { code: 'IEEE C57.110', title: 'Transformer Compatibility with Non-Sinusoidal Loads', organization: 'IEEE',  version: '2018' },
    { code: 'NFPA 70E',     title: 'Standard for Electrical Safety in the Workplace',     organization: 'NFPA',  version: '2024' },
    { code: 'EN 12464',     title: 'Light and Lighting of Work Places',                   organization: 'CEN',   version: '2021' },
    { code: 'ISIRI 3558',   title: 'Electrical Installations — Iran National Standard',   organization: 'ISIRI', version: '2016' },
  ];
  for (const std of standardsData) {
    await upsertRaw('engineering_standards', 'code', std.code,
      ['code','title','organization','version','status'],
      [std.code, std.title, std.organization, std.version, 'active']);
  }
  console.log(`  ✅ ${standardsData.length} engineering standards seeded`);

  // ── 7. AI AGENTS ──────────────────────────────────────────────────────────
  console.log('\n🤖 Seeding AI agents...');
  const agentsData = [
    { slug: 'electrical-engineer', name: 'Electrical Engineer Agent', version: '1.0', is_active: true },
    { slug: 'solar-consultant',    name: 'Solar Consultant Agent',    version: '1.0', is_active: true },
    { slug: 'protection-engineer', name: 'Protection Engineer Agent', version: '1.0', is_active: true },
    { slug: 'power-quality',       name: 'Power Quality Agent',       version: '1.0', is_active: true },
    { slug: 'researcher',          name: 'Research Agent',            version: '1.0', is_active: true },
    { slug: 'document-analyst',    name: 'Document Analyst Agent',    version: '1.0', is_active: true },
    { slug: 'drawing-analyst',     name: 'Drawing Analyst Agent',     version: '1.0', is_active: false },
  ];
  for (const agent of agentsData) {
    await upsertRaw('agents', 'slug', agent.slug,
      ['name','slug','version','is_active','created_at'],
      [agent.name, agent.slug, agent.version, agent.is_active, new Date()]);
  }
  console.log(`  ✅ ${agentsData.length} AI agents seeded`);

  console.log('\n✅ Xennic seed completed successfully!');
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
