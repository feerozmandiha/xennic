/**
 * Standards Data — Derived from docs/engineering-standards-matrix.md and docs/electrical-plugin-guide.md
 * Modern, typed, ready for UI consumption.
 */

export interface StandardDef {
  code: string;
  titleFa: string;
  titleEn: string;
  organization: string; // IEC, IEEE, NEMA, NEC, etc.
  scope: string;
  category: string[]; // foundation, cable, transformer, etc.
  descriptionFa: string;
  descriptionEn: string;
  relatedCalculations: string[];
  year?: string;
}

export const STANDARDS_REGISTRY: StandardDef[] = [
  {
    code: 'IEC 60027',
    titleFa: 'نمادهای حرفی برای کمیت‌های الکتریکی',
    titleEn: 'Letter symbols for electrical quantities',
    organization: 'IEC',
    scope: 'Fundamentals, SI units, symbols',
    category: ['foundation'],
    descriptionFa: 'استاندارد پایه برای نمادهای الکتریکی و واحدها',
    descriptionEn: 'Base standard for electrical symbols and units',
    relatedCalculations: [
      'ohms-law',
      'power-calculation',
      'energy-calculation',
      'three-phase-power',
    ],
  },
  {
    code: 'IEC 60034-1',
    titleFa: 'ماشین‌های الکتریکی دوار - مشخصات و عملکرد',
    titleEn: 'Rotating electrical machines — rating and performance',
    organization: 'IEC',
    scope: 'Motor rating, efficiency',
    category: ['foundation', 'motor'],
    descriptionFa: 'استاندارد اصلی برای موتور و ژنراتور',
    descriptionEn: 'Core standard for motors and generators',
    relatedCalculations: ['efficiency', 'motor-current', 'motor-starting-method'],
  },
  {
    code: 'IEC 60038',
    titleFa: 'ولتاژهای استاندارد',
    titleEn: 'Standard voltages',
    organization: 'IEC',
    scope: 'Voltage levels',
    category: ['power_quality'],
    descriptionFa: 'سطوح ولتاژ استاندارد شبکه',
    descriptionEn: 'Standard voltage levels for networks',
    relatedCalculations: ['pq-voltage-regulation'],
  },
  {
    code: 'IEC 60076',
    titleFa: 'ترانسفورماتورهای قدرت',
    titleEn: 'Power transformers',
    organization: 'IEC',
    scope: 'Transformer design, testing, loading',
    category: ['transformer'],
    descriptionFa: 'خانواده کامل استانداردهای ترانسفورماتور',
    descriptionEn: 'Complete family of transformer standards',
    relatedCalculations: [
      'transformer-sizing',
      'transformer-efficiency',
      'transformer-losses',
      'transformer-regulation',
      'transformer-impedance',
      'transformer-temperature-rise',
      'transformer-loading',
      'transformer-parallel-operation',
    ],
    year: '2011-2020',
  },
  {
    code: 'IEC 60364-5-52',
    titleFa: 'تأسیسات برقی ولتاژ پایین - انتخاب کابل',
    titleEn: 'Low-voltage electrical installations — selection and erection of cables',
    organization: 'IEC',
    scope: 'Cable sizing, derating',
    category: ['cable'],
    descriptionFa: 'مهم‌ترین استاندارد سایزینگ کابل فشار ضعیف',
    descriptionEn: 'Most important LV cable sizing standard',
    relatedCalculations: [
      'cable-sizing',
      'cable-voltage-drop',
      'cable-ampacity',
      'cable-derating-grouping',
      'cable-derating-ambient',
      'cable-derating-soil',
    ],
  },
  {
    code: 'IEC 60364-5-54',
    titleFa: 'سیستم‌های زمین',
    titleEn: 'Earthing arrangements and protective conductors',
    organization: 'IEC',
    scope: 'Grounding',
    category: ['grounding'],
    descriptionFa: 'طراحی سیستم زمین فشار ضعیف',
    descriptionEn: 'LV grounding design',
    relatedCalculations: [
      'grounding-earth-resistance',
      'grounding-touch-voltage',
      'grounding-step-voltage',
    ],
  },
  {
    code: 'IEC 60909',
    titleFa: 'جریان‌های اتصال کوتاه در سیستم سه فاز',
    titleEn: 'Short-circuit currents in three-phase AC systems',
    organization: 'IEC',
    scope: 'Short-circuit calculations',
    category: ['foundation', 'short_circuit', 'protection'],
    descriptionFa: 'روش ولتاژ معادل برای محاسبه اتصال کوتاه',
    descriptionEn: 'Equivalent voltage source method for SC',
    relatedCalculations: [
      'fault-current-base',
      'sc-three-phase',
      'sc-line-line',
      'sc-single-line-ground',
      'sc-peak-current',
      'sc-breaking-current',
      'sc-making-current',
      'sc-thermal-equivalent',
      'protection-coordination',
    ],
    year: '2016',
  },
  {
    code: 'IEEE 80',
    titleFa: 'راهنمای ایمنی زمین پست',
    titleEn: 'Guide for Safety in AC Substation Grounding',
    organization: 'IEEE',
    scope: 'Substation grounding safety',
    category: ['grounding'],
    descriptionFa: 'تحلیل ولتاژ تماس و گام در پست',
    descriptionEn: 'Touch and step voltage analysis in substations',
    relatedCalculations: [
      'grounding-earth-resistance',
      'grounding-grid-resistance',
      'grounding-touch-voltage',
      'grounding-step-voltage',
      'grounding-conductor-sizing',
      'grounding-rod-sizing',
    ],
  },
  {
    code: 'IEEE 519',
    titleFa: 'کنترل هارمونیک در سیستم قدرت',
    titleEn: 'Harmonic control in electric power systems',
    organization: 'IEEE',
    scope: 'Power quality, THD limits',
    category: ['power_quality'],
    descriptionFa: 'محدودیت‌های اعوجاج هارمونیکی ولتاژ و جریان',
    descriptionEn: 'Voltage and current harmonic distortion limits',
    relatedCalculations: ['pq-harmonic-estimation'],
    year: '2022',
  },
  {
    code: 'IEEE 1459',
    titleFa: 'تعاریف اندازه‌گیری توان',
    titleEn: 'Definitions for the Measurement of Power',
    organization: 'IEEE',
    scope: 'Power definitions under non-sinusoidal',
    category: ['foundation', 'power_quality'],
    descriptionFa: 'توان اکتیو، راکتیو، اعوجاجی در شرایط غیرسینوسی',
    descriptionEn: 'Active, reactive, distortion power under non-sinusoidal',
    relatedCalculations: ['power-factor', 'pq-power-factor-correction', 'pq-reactive-power'],
  },
  {
    code: 'NEC 2023',
    titleFa: 'کد ملی برق آمریکا',
    titleEn: 'National Electrical Code',
    organization: 'NEC',
    scope: 'US installation code',
    category: ['cable', 'grounding', 'protection'],
    descriptionFa: 'مقررات نصب تجهیزات برقی آمریکا، مقالات 240 و 250',
    descriptionEn: 'US installation regulations, Articles 240 & 250',
    relatedCalculations: [
      'cable-sizing',
      'cable-ampacity',
      'grounding-conductor-sizing',
      'protection-fuse-sizing',
    ],
  },
  {
    code: 'IEC 60831',
    titleFa: 'خازن‌های قدرت - شنت',
    titleEn: 'Shunt power capacitors',
    organization: 'IEC',
    scope: 'Capacitor banks',
    category: ['power_quality'],
    descriptionFa: 'طراحی و حفاظت بانک خازنی',
    descriptionEn: 'Capacitor bank design and protection',
    relatedCalculations: ['pq-capacitor-bank', 'pq-power-factor-correction'],
  },
  {
    code: 'IEC 60947-2',
    titleFa: 'کلید اتوماتیک فشار ضعیف',
    titleEn: 'Low-voltage circuit-breakers',
    organization: 'IEC',
    scope: 'CB selection',
    category: ['protection'],
    descriptionFa: 'مشخصات کلیدهای MCCB و ACB',
    descriptionEn: 'MCCB and ACB specifications',
    relatedCalculations: [
      'protection-mccb-selection',
      'protection-acb-selection',
      'protection-breaking-capacity',
    ],
  },
  {
    code: 'IEEE 242',
    titleFa: 'حفاظت و هماهنگی',
    titleEn: 'Protection and Coordination',
    organization: 'IEEE',
    scope: 'Buff Book',
    category: ['protection'],
    descriptionFa: 'کتاب باف - راهنمای جامع حفاظت',
    descriptionEn: 'Buff Book - comprehensive protection guide',
    relatedCalculations: [
      'protection-coordination',
      'protection-mcb-selection',
      'protection-fuse-sizing',
    ],
  },
];

export const ORGANIZATIONS = ['IEC', 'IEEE', 'NEC', 'NEMA'] as const;

export function getStandardByCode(code: string): StandardDef | undefined {
  return STANDARDS_REGISTRY.find(
    (s) =>
      s.code.toLowerCase() === code.toLowerCase() ||
      s.code.replace(/\s/g, '').toLowerCase() === code.replace(/\s/g, '').toLowerCase(),
  );
}

export function getStandardsByCategory(category: string): StandardDef[] {
  return STANDARDS_REGISTRY.filter((s) => s.category.includes(category));
}

export function getStandardsByCalculation(calcId: string): StandardDef[] {
  return STANDARDS_REGISTRY.filter((s) => s.relatedCalculations.includes(calcId));
}
