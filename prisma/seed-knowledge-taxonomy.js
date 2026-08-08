/**
 * Seed Knowledge Taxonomy — Categories, Topics, Disciplines, Audiences, Tags
 */
const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');
const prisma = new PrismaClient();

const categories = [
  { slug: 'electrical-fundamentals', name: 'مبانی برق', name_en: 'Electrical Fundamentals', icon: '⚡', color: '#3B82F6', sort_order: 1 },
  { slug: 'cable-systems', name: 'سیستم‌های کابل', name_en: 'Cable Systems', icon: '🔌', color: '#10B981', sort_order: 2 },
  { slug: 'transformers', name: 'ترانسفورماتورها', name_en: 'Transformers', icon: '🔋', color: '#8B5CF6', sort_order: 3 },
  { slug: 'protection', name: 'حفاظت الکتریکی', name_en: 'Protection', icon: '🛡️', color: '#EF4444', sort_order: 4 },
  { slug: 'grounding', name: 'سیستم زمین', name_en: 'Grounding', icon: '🌍', color: '#84CC16', sort_order: 5 },
  { slug: 'power-quality', name: 'کیفیت توان', name_en: 'Power Quality', icon: '📊', color: '#F59E0B', sort_order: 6 },
  { slug: 'motors', name: 'موتورهای الکتریکی', name_en: 'Electric Motors', icon: '🔄', color: '#06B6D4', sort_order: 7 },
  { slug: 'switchgear', name: 'تابلو و کلید', name_en: 'Switchgear', icon: '🔧', color: '#6366F1', sort_order: 8 },
  { slug: 'lighting', name: 'روشنایی', name_en: 'Lighting', icon: '💡', color: '#EAB308', sort_order: 9 },
  { slug: 'renewable', name: 'انرژی تجدیدپذیر', name_en: 'Renewable Energy', icon: '☀️', color: '#22C55E', sort_order: 10 },
];

const topics = [
  { slug: 'cable-sizing', name: 'سایزینگ کابل', name_en: 'Cable Sizing', icon: '📏' },
  { slug: 'voltage-drop', name: 'افت ولتاژ', name_en: 'Voltage Drop', icon: '📉' },
  { slug: 'short-circuit', name: 'اتصال کوتاه', name_en: 'Short Circuit', icon: '💥' },
  { slug: 'load-flow', name: 'پخش بار', name_en: 'Load Flow', icon: '🔀' },
  { slug: 'harmonic-analysis', name: 'تحلیل هارمونیک', name_en: 'Harmonic Analysis', icon: '🎵' },
  { slug: 'earthing-design', name: 'طراحی زمین', name_en: 'Earthing Design', icon: '🌐' },
  { slug: 'transformer-sizing', name: 'سایزینگ ترانسفورماتور', name_en: 'Transformer Sizing', icon: '⚖️' },
  { slug: 'motor-starting', name: 'راه‌اندازی موتور', name_en: 'Motor Starting', icon: '🚀' },
  { slug: 'power-factor-correction', name: 'اصلاح ضریب توان', name_en: 'PF Correction', icon: '🔋' },
  { slug: 'protection-coordination', name: 'هماهنگی حفاظتی', name_en: 'Protection Coordination', icon: '🎯' },
];

const disciplines = [
  { slug: 'low-voltage', name: 'فشار ضعیف', name_en: 'Low Voltage' },
  { slug: 'medium-voltage', name: 'فشار متوسط', name_en: 'Medium Voltage' },
  { slug: 'high-voltage', name: 'فشار قوی', name_en: 'High Voltage' },
  { slug: 'power-systems', name: 'سیستم‌های قدرت', name_en: 'Power Systems' },
  { slug: 'protection-control', name: 'حفاظت و کنترل', name_en: 'Protection & Control' },
  { slug: 'renewable-energy', name: 'انرژی‌های نو', name_en: 'Renewable Energy' },
];

const audiences = [
  { slug: 'beginner', name: 'مبتدی', name_en: 'Beginner', description: 'دانشجویان و تازه‌کارها' },
  { slug: 'intermediate', name: 'متوسط', name_en: 'Intermediate', description: 'مهندسان با تجربه متوسط' },
  { slug: 'advanced', name: 'پیشرفته', name_en: 'Advanced', description: 'مهندسان ارشد' },
  { slug: 'expert', name: 'متخصص', name_en: 'Expert', description: 'متخصصین و مشاوران' },
];

const tags = [
  { slug: 'iec-60364', name: 'IEC 60364', name_en: 'IEC 60364' },
  { slug: 'iec-60909', name: 'IEC 60909', name_en: 'IEC 60909' },
  { slug: 'ieee-80', name: 'IEEE 80', name_en: 'IEEE 80' },
  { slug: 'ieee-519', name: 'IEEE 519', name_en: 'IEEE 519' },
  { slug: 'nec-2023', name: 'NEC 2023', name_en: 'NEC 2023' },
  { slug: 'transformer', name: 'ترانسفورماتور', name_en: 'Transformer' },
  { slug: 'cable', name: 'کابل', name_en: 'Cable' },
  { slug: 'grounding', name: 'ارتینگ', name_en: 'Grounding' },
  { slug: 'ai-assisted', name: 'هوش مصنوعی', name_en: 'AI Assisted' },
];

async function seedTable(table, items) {
  console.log(`\n📚 Seeding ${table}...`);
  for (const item of items) {
    await prisma[table].upsert({
      where: { slug: item.slug },
      update: { name: item.name, name_en: item.name_en, updated_at: new Date() },
      create: {
        id: randomUUID(),
        slug: item.slug,
        name: item.name,
        name_en: item.name_en,
        icon: item.icon || null,
        color: item.color || null,
        sort_order: item.sort_order ?? 0,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });
  }
  console.log(`  ✅ ${items.length} ${table}`);
}

async function main() {
  await seedTable('categories', categories);
  await seedTable('topics', topics);
  await seedTable('disciplines', disciplines);
  await seedTable('audiences', audiences);
  await seedTable('tags', tags);
  console.log('\n✅ All taxonomy seeded');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
