// لینک‌سازی هوشمند به فروشگاه از بخش‌های مختلف پلتفرم (محاسبات، AI، ...)

export const STORE_CATEGORIES = [
  'cable',
  'transformer',
  'mccb',
  'acb',
  'fuse',
  'switchgear',
  'lighting',
  'solar',
  'battery',
  'motor',
  'grounding',
  'ppe',
] as const;

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  cable: ['کابل', 'سایز کابل', 'مقطع کابل', 'cable'],
  transformer: ['ترانسفورماتور', 'ترانس', 'transformer'],
  mccb: ['mccb', 'کلید کامپکت', 'کامپکت', 'کلید قدرت'],
  acb: ['acb', 'کلید هوایی'],
  fuse: ['فیوز', 'fuse'],
  switchgear: ['تابلو برق', 'تابلوی برق', 'switchgear'],
  lighting: ['روشنایی', 'چراغ', 'lighting', 'لامپ'],
  solar: ['خورشیدی', 'پنل خورشیدی', 'solar', 'فتوولتائیک'],
  battery: ['باتری', 'battery'],
  motor: ['الکتروموتور', 'موتور', 'motor'],
  grounding: ['ارتینگ', 'چاه ارت', 'سیستم زمین', 'grounding', 'earthing'],
  ppe: ['تجهیزات ایمنی', 'ppe', 'کلاه ایمنی', 'دستکش ایمنی'],
};

export function detectCategories(text: string): string[] {
  const t = text.toLowerCase();
  const found: string[] = [];
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((k) => t.includes(k.toLowerCase()))) found.push(category);
  }
  return found;
}

export function storeLink(
  locale: string,
  params: { category?: string; q?: string; calc?: string; spec?: string } = {},
): string {
  const qs = new URLSearchParams();
  if (params.category) qs.set('category', params.category);
  if (params.q) qs.set('q', params.q);
  if (params.calc) qs.set('calc', params.calc);
  if (params.spec) qs.set('spec', params.spec);
  const query = qs.toString();
  return `/${locale}/marketplace${query ? `?${query}` : ''}`;
}
