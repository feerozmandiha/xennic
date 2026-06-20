'use strict';
/**
 * Xennic Platform — Database Seed
 * Pure CJS — no TypeScript, no ESM, no tsx needed
 * Node.js v24 compatible
 */

const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');

const db = new PrismaClient();
const { randomUUID } = require('node:crypto');

async function main() {
  console.log('🌱 Starting Xennic seed...\n');

  // ── PLANS ─────────────────────────────────────────────────────────────────
  console.log('📋 Seeding plans...');
  const plans = [
    {
      slug: 'free', name: 'Free', m: 0, y: 0,
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
    await db.plans.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        monthly_price: p.m,
        yearly_price: p.y,
        features: p.f,
        is_active: true,
        updated_at: new Date(),
      },
      create: {
        id: randomUUID(),
        name: p.name,
        slug: p.slug,
        monthly_price: p.m,
        yearly_price: p.y,
        features: p.f,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
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
    ['EDITOR',         'Editor'],
    ['KNOWLEDGE_WRITER','Knowledge Writer'],
    ['REVIEWER',       'Senior Reviewer'],
    ['CONSULTANT',     'Consultant'],
    ['MEMBER',         'Member'],
    ['VIEWER',         'Viewer'],
  ];
  const roleIds = {};
  for (const [slug, name] of roles) {
    const role = await db.roles.upsert({
      where: { slug },
      update: { name, updated_at: new Date() },
      create: { id: randomUUID(), name, slug, created_at: new Date(), updated_at: new Date() },
    });
    roleIds[slug] = role.id;
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
    ['workspace.settings.read','Read Settings','workspace'],
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
    ['knowledge.read','Read Knowledge','knowledge'],['knowledge.create','Create Knowledge','knowledge'],
    ['knowledge.update','Update Knowledge','knowledge'],['knowledge.delete','Delete Knowledge','knowledge'],
    ['knowledge.publish','Publish Knowledge','knowledge'],['knowledge.review','Review Knowledge','knowledge'],
    ['admin.dashboard','Admin Dashboard','admin'],['admin.users','Admin Users','admin'],
    ['admin.billing','Admin Billing','admin'],['admin.audit_logs','Admin Audit Logs','admin'],
    ['admin.system_settings','Admin System Settings','admin'],
  ];
  const permIds = {};
  for (const [slug, name, domain] of perms) {
    const perm = await db.permissions.upsert({
      where: { slug },
      update: { name, domain },
      create: { id: randomUUID(), name, slug, domain, created_at: new Date() },
    });
    permIds[slug] = perm.id;
  }
  console.log(`  ✅ ${perms.length} permissions`);

  // ── ROLE-PERMISSION ASSIGNMENTS ───────────────────────────────────────────
  console.log('\n🔗 Assigning permissions...');
  const allSlugs = perms.map(p => p[0]);
  const assignments = {
    SUPER_ADMIN:    allSlugs,
    PLATFORM_ADMIN: ['admin.dashboard','admin.users','admin.billing','admin.audit_logs','admin.system_settings'],
    SUPPORT_ADMIN:  ['admin.dashboard','admin.audit_logs','users.read'],
    OWNER: ['workspace.read','workspace.update','workspace.delete','workspace.members.manage','workspace.settings.read','workspace.settings.manage',
            'projects.read','projects.create','projects.update','projects.delete','projects.export','projects.share',
            'engineering.read','engineering.calculate','engineering.export','engineering.reports.generate',
            'knowledge.read','knowledge.create','knowledge.update','knowledge.delete','knowledge.publish',
            'ai.chat','ai.document_analysis','ai.drawing_analysis','ai.agent_access','ai.export',
            'files.read','files.upload','files.update','files.delete','files.share',
            'api_keys.read','api_keys.create','api_keys.delete','webhooks.manage',
            'products.read','orders.read','orders.create','roles.read'],
    ADMIN: ['workspace.read','workspace.update','workspace.members.manage','workspace.settings.read',
            'projects.read','projects.create','projects.update','projects.delete',
            'engineering.read','engineering.calculate','engineering.export','engineering.reports.generate',
            'knowledge.read','knowledge.create','knowledge.update','knowledge.delete','knowledge.publish',
            'ai.chat','ai.document_analysis',
            'files.read','files.upload','files.update','files.delete',
            'api_keys.read','api_keys.create',
            'products.read','orders.read','orders.create','roles.read'],
    EDITOR: ['knowledge.read','knowledge.create','knowledge.update','knowledge.delete','knowledge.publish','knowledge.review',
             'engineering.read','projects.read','ai.chat','files.read','files.upload','products.read'],
    KNOWLEDGE_WRITER: ['knowledge.read','knowledge.create','knowledge.update','engineering.read','ai.chat','files.read'],
    REVIEWER: ['knowledge.read','knowledge.review',
               'engineering.read','engineering.calculate','engineering.export',
               'projects.read','ai.chat','ai.document_analysis',
               'files.read','files.upload','products.read'],
    ENGINEER: ['projects.read','projects.create','projects.update',
               'engineering.read','engineering.calculate','engineering.export','engineering.reports.generate',
               'knowledge.read','knowledge.create','knowledge.update',
               'ai.chat','ai.document_analysis','ai.drawing_analysis',
               'files.read','files.upload','products.read','orders.read'],
    CONSULTANT: ['projects.read','engineering.read',
                 'knowledge.read',
                 'ai.chat','ai.document_analysis','ai.drawing_analysis','ai.export',
                 'files.read','files.upload','products.read','orders.read'],
    MEMBER: ['projects.read','engineering.read','engineering.calculate',
             'knowledge.read',
             'ai.chat',
             'files.read','files.upload','products.read','orders.read','orders.create'],
    VIEWER: ['projects.read','engineering.read','knowledge.read','files.read','products.read'],
  };

  for (const [roleSlug, slugList] of Object.entries(assignments)) {
    const roleId = roleIds[roleSlug];
    if (!roleId) continue;
    let count = 0;
    for (const permSlug of slugList) {
      const permId = permIds[permSlug];
      if (!permId) continue;
      await db.role_permissions.upsert({
        where: {
          role_id_permission_id: { role_id: roleId, permission_id: permId },
        },
        update: {},
        create: { id: randomUUID(), role_id: roleId, permission_id: permId },
      });
      count++;
    }
    console.log(`  ✅ ${roleSlug}: ${count} perms`);
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
    await db.system_settings.upsert({
      where: { key },
      update: { value, updated_at: new Date() },
      create: { key, value, updated_at: new Date() },
    });
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
    await db.engineering_standards.upsert({
      where: { code },
      update: { title, organization: org, version: ver, status: 'active' },
      create: {
        id: randomUUID(), code, title, organization: org,
        version: ver, status: 'active',
      },
    });
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
    await db.agents.upsert({
      where: { slug },
      update: { name, version: '1.0', is_active: active, updated_at: new Date() },
      create: {
        id: randomUUID(), name, slug,
        version: '1.0', is_active: active, created_at: new Date(),
      },
    });
  }
  console.log(`  ✅ ${agents.length} agents`);

  // ── ADMIN USER & WORKSPACE ──────────────────────────────────────────────
  console.log('\n👤 Seeding admin user and workspace...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@xennic.ir';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

  const user = await db.users.upsert({
    where: { email: adminEmail },
    update: { is_admin: true, is_active: true, updated_at: new Date() },
    create: {
      id: randomUUID(),
      email: adminEmail,
      password: '',
      first_name: 'Admin',
      last_name: 'Xennic',
      is_admin: true,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });
  const userId = user.id;

  const hashedPassword = await argon2.hash(adminPassword, {
    memoryCost: 65536, timeCost: 3, parallelism: 4,
  });
  await db.users.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  const ws = await db.workspaces.upsert({
    where: { code: 'XENNIC' },
    update: { name: 'Xennic', updated_at: new Date() },
    create: {
      id: randomUUID(),
      name: 'Xennic',
      code: 'XENNIC',
      created_by: userId,
      updated_by: userId,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });
  const wsId = ws.id;

  await db.workspace_members.upsert({
    where: {
      workspace_id_user_id: { workspace_id: wsId, user_id: userId },
    },
    update: { role: 'OWNER' },
    create: {
      id: randomUUID(),
      workspace_id: wsId,
      user_id: userId,
      role: 'OWNER',
    },
  });

  if (roleIds['SUPER_ADMIN']) {
    await db.user_roles.upsert({
      where: {
        user_id_role_id_workspace_id: {
          user_id: userId,
          role_id: roleIds['SUPER_ADMIN'],
          workspace_id: wsId,
        },
      },
      update: {},
      create: {
        id: randomUUID(),
        user_id: userId,
        role_id: roleIds['SUPER_ADMIN'],
        workspace_id: wsId,
      },
    });
  }

  console.log(`  ✅ Admin: ${adminEmail} / Workspace: Xennic`);

  // ── MARKETPLACE VENDORS ──────────────────────────────────────────────────
  console.log('\n🏪 Seeding marketplace vendors...');
  const vendorData = [
    { name: 'سیمای الکتریک', slug: 'sima-electric' },
    { name: 'پارس کابل', slug: 'pars-kabel' },
    { name: 'ایران ترانسفو', slug: 'iran-transfo' },
    { name: 'نیرو محرک', slug: 'niroo-moharrek' },
    { name: 'ابزار سنجش', slug: 'abzar-sanjesh' },
    { name: 'آریا باتری', slug: 'arya-battery' },
    { name: 'تابلو گستر', slug: 'tablo-gostar' },
  ];
  const vendorIds = {};
  for (const v of vendorData) {
    const vendor = await db.vendors.upsert({
      where: { slug: v.slug },
      update: { name: v.name },
      create: { id: randomUUID(), name: v.name, slug: v.slug, status: 'active' },
    });
    vendorIds[v.slug] = vendor.id;
    console.log(`  ✅ Vendor: ${v.name}`);
  }

  // ── MARKETPLACE PRODUCTS ─────────────────────────────────────────────────
  console.log('\n📦 Seeding marketplace products...');

  const products = [
    // ── Cable (سیم و کابل) ──────────────────────────────────────────────────
    { vendor: 'pars-kabel', type: 'cable', category: 'cable', sku: 'CBL-NYY-1.5', price: 12.50, currency: 'EUR', translations: { fa: { title: 'کابل NYY 1.5mm² مسی', description: 'کابل برق مسی ۱.۵ میلیمتر مربع با عایق PVC' } }, specs: { cable_size_mm2: '1.5', current_rating_a: '18.5', voltage_rating_v: '1000', conductor_material: 'copper', insulation_type: 'PVC' } },
    { vendor: 'pars-kabel', type: 'cable', category: 'cable', sku: 'CBL-NYY-2.5', price: 16.80, currency: 'EUR', translations: { fa: { title: 'کابل NYY 2.5mm² مسی', description: 'کابل برق مسی ۲.۵ میلیمتر مربع با عایق PVC' } }, specs: { cable_size_mm2: '2.5', current_rating_a: '25', voltage_rating_v: '1000', conductor_material: 'copper', insulation_type: 'PVC' } },
    { vendor: 'pars-kabel', type: 'cable', category: 'cable', sku: 'CBL-NYY-4', price: 22.50, currency: 'EUR', translations: { fa: { title: 'کابل NYY 4mm² مسی', description: 'کابل برق مسی ۴ میلیمتر مربع با عایق PVC' } }, specs: { cable_size_mm2: '4', current_rating_a: '34', voltage_rating_v: '1000', conductor_material: 'copper', insulation_type: 'PVC' } },
    { vendor: 'pars-kabel', type: 'cable', category: 'cable', sku: 'CBL-NYY-6', price: 29.00, currency: 'EUR', translations: { fa: { title: 'کابل NYY 6mm² مسی', description: 'کابل برق مسی ۶ میلیمتر مربع با عایق PVC' } }, specs: { cable_size_mm2: '6', current_rating_a: '43', voltage_rating_v: '1000', conductor_material: 'copper', insulation_type: 'PVC' } },
    { vendor: 'pars-kabel', type: 'cable', category: 'cable', sku: 'CBL-NYY-10', price: 38.00, currency: 'EUR', translations: { fa: { title: 'کابل NYY 10mm² مسی', description: 'کابل برق مسی ۱۰ میلیمتر مربع با عایق PVC' } }, specs: { cable_size_mm2: '10', current_rating_a: '60', voltage_rating_v: '1000', conductor_material: 'copper', insulation_type: 'PVC' } },
    { vendor: 'pars-kabel', type: 'cable', category: 'cable', sku: 'CBL-NYY-16', price: 52.00, currency: 'EUR', translations: { fa: { title: 'کابل NYY 16mm² مسی', description: 'کابل برق مسی ۱۶ میلیمتر مربع با عایق PVC' } }, specs: { cable_size_mm2: '16', current_rating_a: '80', voltage_rating_v: '1000', conductor_material: 'copper', insulation_type: 'PVC' } },
    { vendor: 'pars-kabel', type: 'cable', category: 'cable', sku: 'CBL-NYY-25', price: 78.00, currency: 'EUR', translations: { fa: { title: 'کابل NYY 25mm² مسی', description: 'کابل برق مسی ۲۵ میلیمتر مربع با عایق PVC' } }, specs: { cable_size_mm2: '25', current_rating_a: '105', voltage_rating_v: '1000', conductor_material: 'copper', insulation_type: 'PVC' } },
    { vendor: 'pars-kabel', type: 'cable', category: 'cable', sku: 'CBL-NYY-35', price: 99.00, currency: 'EUR', translations: { fa: { title: 'کابل NYY 35mm² مسی', description: 'کابل برق مسی ۳۵ میلیمتر مربع با عایق PVC' } }, specs: { cable_size_mm2: '35', current_rating_a: '130', voltage_rating_v: '1000', conductor_material: 'copper', insulation_type: 'PVC' } },
    { vendor: 'pars-kabel', type: 'cable', category: 'cable', sku: 'CBL-NYY-50', price: 135.00, currency: 'EUR', translations: { fa: { title: 'کابل NYY 50mm² مسی', description: 'کابل برق مسی ۵۰ میلیمتر مربع با عایق PVC' } }, specs: { cable_size_mm2: '50', current_rating_a: '160', voltage_rating_v: '1000', conductor_material: 'copper', insulation_type: 'PVC' } },
    { vendor: 'pars-kabel', type: 'cable', category: 'cable', sku: 'CBL-NYY-70', price: 180.00, currency: 'EUR', translations: { fa: { title: 'کابل NYY 70mm² مسی', description: 'کابل برق مسی ۷۰ میلیمتر مربع با عایق PVC' } }, specs: { cable_size_mm2: '70', current_rating_a: '200', voltage_rating_v: '1000', conductor_material: 'copper', insulation_type: 'PVC' } },
    { vendor: 'pars-kabel', type: 'cable', category: 'cable', sku: 'CBL-NYY-95', price: 245.00, currency: 'EUR', translations: { fa: { title: 'کابل NYY 95mm² مسی', description: 'کابل برق مسی ۹۵ میلیمتر مربع با عایق PVC' } }, specs: { cable_size_mm2: '95', current_rating_a: '240', voltage_rating_v: '1000', conductor_material: 'copper', insulation_type: 'PVC' } },
    { vendor: 'pars-kabel', type: 'cable', category: 'cable', sku: 'CBL-NYY-120', price: 310.00, currency: 'EUR', translations: { fa: { title: 'کابل NYY 120mm² مسی', description: 'کابل برق مسی ۱۲۰ میلیمتر مربع با عایق PVC' } }, specs: { cable_size_mm2: '120', current_rating_a: '280', voltage_rating_v: '1000', conductor_material: 'copper', insulation_type: 'PVC' } },
    { vendor: 'sima-electric', type: 'cable', category: 'cable', sku: 'SIM-CBL-XLPE-35', price: 110.00, currency: 'EUR', translations: { fa: { title: 'کابل XLPE 35mm²', description: 'کابل افشان مسی با عایق XLPE ۳۵ میلیمتر مربع' } }, specs: { cable_size_mm2: '35', current_rating_a: '140', voltage_rating_v: '1000', conductor_material: 'copper', insulation_type: 'XLPE' } },
    { vendor: 'sima-electric', type: 'cable', category: 'cable', sku: 'SIM-CBL-XLPE-70', price: 195.00, currency: 'EUR', translations: { fa: { title: 'کابل XLPE 70mm²', description: 'کابل افشان مسی با عایق XLPE ۷۰ میلیمتر مربع' } }, specs: { cable_size_mm2: '70', current_rating_a: '215', voltage_rating_v: '1000', conductor_material: 'copper', insulation_type: 'XLPE' } },
    { vendor: 'sima-electric', type: 'cable', category: 'cable', sku: 'SIM-CBL-XLPE-150', price: 380.00, currency: 'EUR', translations: { fa: { title: 'کابل XLPE 150mm²', description: 'کابل افشان مسی با عایق XLPE ۱۵۰ میلیمتر مربع' } }, specs: { cable_size_mm2: '150', current_rating_a: '330', voltage_rating_v: '1000', conductor_material: 'copper', insulation_type: 'XLPE' } },

    // ── Transformer (ترانسفورماتور) ─────────────────────────────────────────
    { vendor: 'iran-transfo', type: 'equipment', category: 'transformer', sku: 'IT-TRF-100', price: 4500.00, currency: 'EUR', translations: { fa: { title: 'ترانسفورماتور 100 kVA', description: 'ترانسفورماتور توزیع ۱۰۰ کا‌وی‌آی ۲۰/۰.۴ کیلوولت' } }, specs: { rated_power_kva: '100', primary_voltage_v: '20000', secondary_voltage_v: '400', vector_group: 'Dyn11', impedance_pct: '4.5', cooling_type: 'ONAN' } },
    { vendor: 'iran-transfo', type: 'equipment', category: 'transformer', sku: 'IT-TRF-250', price: 8200.00, currency: 'EUR', translations: { fa: { title: 'ترانسفورماتور 250 kVA', description: 'ترانسفورماتور توزیع ۲۵۰ کا‌وی‌آی ۲۰/۰.۴ کیلوولت' } }, specs: { rated_power_kva: '250', primary_voltage_v: '20000', secondary_voltage_v: '400', vector_group: 'Dyn11', impedance_pct: '4.5', cooling_type: 'ONAN' } },
    { vendor: 'iran-transfo', type: 'equipment', category: 'transformer', sku: 'IT-TRF-630', price: 15800.00, currency: 'EUR', translations: { fa: { title: 'ترانسفورماتور 630 kVA', description: 'ترانسفورماتور توزیع ۶۳۰ کا‌وی‌آی ۲۰/۰.۴ کیلوولت' } }, specs: { rated_power_kva: '630', primary_voltage_v: '20000', secondary_voltage_v: '400', vector_group: 'Dyn11', impedance_pct: '5', cooling_type: 'ONAN' } },
    { vendor: 'iran-transfo', type: 'equipment', category: 'transformer', sku: 'IT-TRF-1000', price: 22500.00, currency: 'EUR', translations: { fa: { title: 'ترانسفورماتور 1000 kVA', description: 'ترانسفورماتور توزیع ۱۰۰۰ کا‌وی‌آی ۲۰/۰.۴ کیلوولت' } }, specs: { rated_power_kva: '1000', primary_voltage_v: '20000', secondary_voltage_v: '400', vector_group: 'Dyn11', impedance_pct: '5.5', cooling_type: 'ONAN' } },

    // ── MCCB (کلید کامپکت) ──────────────────────────────────────────────────
    { vendor: 'niroo-moharrek', type: 'protection', category: 'mccb', sku: 'NM-MCCB-160', price: 185.00, currency: 'EUR', translations: { fa: { title: 'کلید کامپکت 160A', description: 'کلید کامپکت ۱۶۰ آمپر ۳ پل با واحد حفاظت الکترونیکی' } }, specs: { rated_current_a: '160', poles: '3', breaking_capacity_ka: '36', voltage_rating_v: '415', trip_unit_type: 'electronic', curve_type: 'SI' } },
    { vendor: 'niroo-moharrek', type: 'protection', category: 'mccb', sku: 'NM-MCCB-250', price: 245.00, currency: 'EUR', translations: { fa: { title: 'کلید کامپکت 250A', description: 'کلید کامپکت ۲۵۰ آمپر ۳ پل با واحد حفاظت الکترونیکی' } }, specs: { rated_current_a: '250', poles: '3', breaking_capacity_ka: '50', voltage_rating_v: '415', trip_unit_type: 'electronic', curve_type: 'SI' } },
    { vendor: 'niroo-moharrek', type: 'protection', category: 'mccb', sku: 'NM-MCCB-630', price: 520.00, currency: 'EUR', translations: { fa: { title: 'کلید کامپکت 630A', description: 'کلید کامپکت ۶۳۰ آمپر ۳ پل با واحد حفاظت میکروپروسسوری' } }, specs: { rated_current_a: '630', poles: '3', breaking_capacity_ka: '65', voltage_rating_v: '415', trip_unit_type: 'microprocessor', curve_type: 'SI' } },

    // ── Fuse (فیوز) ─────────────────────────────────────────────────────────
    { vendor: 'niroo-moharrek', type: 'protection', category: 'fuse', sku: 'NM-FUSE-100', price: 12.00, currency: 'EUR', translations: { fa: { title: 'فیوز کارتریجی 100A', description: 'فیوز کارتریجی gG ۱۰۰ آمپر ۶۹۰ ولت' } }, specs: { rated_current_a: '100', voltage_rating_v: '690', breaking_capacity_ka: '120', fuse_type: 'gG', size: 'NH2' } },
    { vendor: 'niroo-moharrek', type: 'protection', category: 'fuse', sku: 'NM-FUSE-200', price: 18.50, currency: 'EUR', translations: { fa: { title: 'فیوز کارتریجی 200A', description: 'فیوز کارتریجی gG ۲۰۰ آمپر ۶۹۰ ولت' } }, specs: { rated_current_a: '200', voltage_rating_v: '690', breaking_capacity_ka: '120', fuse_type: 'gG', size: 'NH2' } },
    { vendor: 'niroo-moharrek', type: 'protection', category: 'fuse', sku: 'NM-FUSE-400', price: 28.00, currency: 'EUR', translations: { fa: { title: 'فیوز کارتریجی 400A', description: 'فیوز کارتریجی gG ۴۰۰ آمپر ۶۹۰ ولت' } }, specs: { rated_current_a: '400', voltage_rating_v: '690', breaking_capacity_ka: '120', fuse_type: 'gG', size: 'NH3' } },

    // ── Switchgear (تابلو برق) ──────────────────────────────────────────────
    { vendor: 'tablo-gostar', type: 'equipment', category: 'switchgear', sku: 'TG-MDB-01', price: 3500.00, currency: 'EUR', translations: { fa: { title: 'تابلو توزیع اصلی MDB', description: 'تابلو توزیع اصلی ۶۳۰ آمپر با باسبار مسی' } }, specs: { rated_current_a: '630', voltage_rating_v: '400', busbar_material: 'copper', enclosure_type: 'metalclad', ip_rating: 'IP54', form: '4b' } },
    { vendor: 'tablo-gostar', type: 'equipment', category: 'switchgear', sku: 'TG-DB-01', price: 1200.00, currency: 'EUR', translations: { fa: { title: 'تابلو توزیع فرعی', description: 'تابلو توزیع فرعی ۲۵۰ آمپر' } }, specs: { rated_current_a: '250', voltage_rating_v: '400', busbar_material: 'copper', enclosure_type: 'metalclad', ip_rating: 'IP54', form: '3b' } },

    // ── Lighting (روشنایی) ──────────────────────────────────────────────────
    { vendor: 'abzar-sanjesh', type: 'lighting', category: 'lighting', sku: 'AS-LED-100W', price: 85.00, currency: 'EUR', translations: { fa: { title: 'LED صنعتی 100W', description: 'چراغ LED سوله‌ای ۱۰۰ وات ۱۰۰۰۰ لومن IP65' } }, specs: { power_w: '100', luminous_flux_lm: '10000', color_temp_k: '5000', ip_rating: 'IP65', voltage_v: '220', beam_angle: '120' } },
    { vendor: 'abzar-sanjesh', type: 'lighting', category: 'lighting', sku: 'AS-LED-200W', price: 145.00, currency: 'EUR', translations: { fa: { title: 'LED صنعتی 200W', description: 'چراغ LED سوله‌ای ۲۰۰ وات ۲۰۰۰۰ لومن IP65' } }, specs: { power_w: '200', luminous_flux_lm: '20000', color_temp_k: '5000', ip_rating: 'IP65', voltage_v: '220', beam_angle: '120' } },

    // ── Solar (خورشیدی) ─────────────────────────────────────────────────────
    { vendor: 'sima-electric', type: 'equipment', category: 'solar', sku: 'SIM-PV-550W', price: 180.00, currency: 'EUR', translations: { fa: { title: 'پنل خورشیدی 550W', description: 'پنل خورشیدی مونوکریستال ۵۵۰ وات ۲۴ ولت' } }, specs: { rated_power_w: '550', voltage_vmp_v: '41.5', current_imp_a: '13.25', voltage_oc_v: '49.8', efficiency_pct: '21.3', cell_type: 'monocrystalline' } },
    { vendor: 'sima-electric', type: 'equipment', category: 'solar', sku: 'SIM-INV-10KW', price: 1200.00, currency: 'EUR', translations: { fa: { title: 'اینورتر خورشیدی 10kW', description: 'اینورتر هیبریدی ۱۰ کیلووات سه فاز MPPT' } }, specs: { rated_power_w: '10000', input_voltage_v: '600', mppt_trackers: '2', output_type: 'three_phase', efficiency_pct: '98.5' } },

    // ── Battery (باتری) ─────────────────────────────────────────────────────
    { vendor: 'arya-battery', type: 'equipment', category: 'battery', sku: 'AB-BAT-100AH', price: 320.00, currency: 'EUR', translations: { fa: { title: 'باتری لیتیومی 100Ah', description: 'باتری لیتیوم-آهن-فسفات ۱۰۰ آمپر ساعت ۴۸ ولت' } }, specs: { capacity_ah: '100', voltage_nominal_v: '48', chemistry: 'LiFePO4', cycle_life: '6000', max_discharge_a: '100', weight_kg: '35' } },
    { vendor: 'arya-battery', type: 'equipment', category: 'battery', sku: 'AB-BAT-200AH', price: 580.00, currency: 'EUR', translations: { fa: { title: 'باتری لیتیومی 200Ah', description: 'باتری لیتیوم-آهن-فسفات ۲۰۰ آمپر ساعت ۴۸ ولت' } }, specs: { capacity_ah: '200', voltage_nominal_v: '48', chemistry: 'LiFePO4', cycle_life: '6000', max_discharge_a: '200', weight_kg: '65' } },

    // ── Grounding (ارتینگ) ──────────────────────────────────────────────────
    { vendor: 'sima-electric', type: 'accessory', category: 'grounding', sku: 'SIM-GND-ROD', price: 45.00, currency: 'EUR', translations: { fa: { title: 'میله ارت مسی 1.5m', description: 'میله ارت تمام مسی ۱.۵ متر قطر ۱۶ میلیمتر' } }, specs: { length_m: '1.5', diameter_mm: '16', material: 'copper', coating: 'solid_copper' } },
    { vendor: 'sima-electric', type: 'accessory', category: 'grounding', sku: 'SIM-GND-CABLE-35', price: 95.00, currency: 'EUR', translations: { fa: { title: 'کابل ارت 35mm²', description: 'کابل ارت مسی افشان ۳۵ میلیمتر مربع' } }, specs: { cable_size_mm2: '35', material: 'copper', type: 'stranded', standard: 'IEC 60364-5-54' } },

    // ── Motor (الکتروموتور) ─────────────────────────────────────────────────
    { vendor: 'niroo-moharrek', type: 'equipment', category: 'motor', sku: 'NM-MOT-5.5', price: 680.00, currency: 'EUR', translations: { fa: { title: 'الکتروموتور 5.5kW', description: 'الکتروموتور سه فاز ۵.۵ کیلووات ۱۵۰۰ دور IE3' } }, specs: { rated_power_kw: '5.5', voltage_v: '400', current_a: '11.5', speed_rpm: '1450', efficiency_class: 'IE3', frame_size: '112M', poles: '4' } },
    { vendor: 'niroo-moharrek', type: 'equipment', category: 'motor', sku: 'NM-MOT-15', price: 1450.00, currency: 'EUR', translations: { fa: { title: 'الکتروموتور 15kW', description: 'الکتروموتور سه فاز ۱۵ کیلووات ۱۵۰۰ دور IE3' } }, specs: { rated_power_kw: '15', voltage_v: '400', current_a: '28.5', speed_rpm: '1460', efficiency_class: 'IE3', frame_size: '160L', poles: '4' } },
    { vendor: 'niroo-moharrek', type: 'equipment', category: 'motor', sku: 'NM-MOT-37', price: 2950.00, currency: 'EUR', translations: { fa: { title: 'الکتروموتور 37kW', description: 'الکتروموتور سه فاز ۳۷ کیلووات ۱۵۰۰ دور IE3' } }, specs: { rated_power_kw: '37', voltage_v: '400', current_a: '68', speed_rpm: '1475', efficiency_class: 'IE3', frame_size: '200L', poles: '4' } },
  ];

  let productCount = 0;
  for (const p of products) {
    const vendorId = vendorIds[p.vendor];
    if (!vendorId) continue;

    const product = await db.products.upsert({
      where: { sku: p.sku },
      update: {
        vendor_id: vendorId,
        type: p.type,
        category: p.category,
        specifications: p.specs,
        price: p.price,
        currency: p.currency,
        status: 'active',
      },
      create: {
        id: randomUUID(),
        vendor_id: vendorId,
        type: p.type,
        category: p.category,
        specifications: p.specs,
        sku: p.sku,
        price: p.price,
        currency: p.currency,
        status: 'active',
      },
    });

    // Insert translations
    for (const [locale, t] of Object.entries(p.translations)) {
      await db.product_translations.upsert({
        where: { product_id_locale: { product_id: product.id, locale } },
        update: { title: t.title, description: t.description },
        create: {
          id: randomUUID(),
          product_id: product.id,
          locale,
          title: t.title,
          description: t.description,
        },
      });
    }
    productCount++;
  }
  console.log(`  ✅ ${productCount} products`);

  console.log('\n✅ Xennic seed completed successfully!');
}

main()
  .catch(e => { console.error('❌ Seed failed:', e.message); process.exit(1); })
  .finally(() => db.$disconnect());
