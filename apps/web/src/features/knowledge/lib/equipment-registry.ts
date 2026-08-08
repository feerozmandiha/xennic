/**
 * Equipment Registry — Electrical equipment taxonomy linked to calculations, standards, and knowledge.
 * Based on docs/electrical-plugin-guide.md, engineering-standards-matrix.md, calculation-catalog.md
 */

export interface EquipmentDef {
  id: string;
  slug: string;
  nameFa: string;
  nameEn: string;
  category:
    | 'transformer'
    | 'cable'
    | 'switchgear'
    | 'motor'
    | 'grounding'
    | 'power_quality'
    | 'protection'
    | 'lighting'
    | 'renewable'
    | 'busbar'
    | 'other';
  icon: string; // emoji or lucide name hint
  descriptionFa: string;
  descriptionEn: string;
  standards: string[]; // IEC codes
  calculations: string[]; // plugin IDs
  tags: string[];
  regulations: string[]; // NEC, IEC references
}

export const EQUIPMENT_REGISTRY: EquipmentDef[] = [
  {
    id: 'eq-transformer-power',
    slug: 'power-transformer',
    nameFa: 'ترانسفورماتور قدرت',
    nameEn: 'Power Transformer',
    category: 'transformer',
    icon: '⚡',
    descriptionFa: 'ترانسفورماتور قدرت برای انتقال و توزیع، بر اساس IEC 60076',
    descriptionEn: 'Power transformer for transmission & distribution, per IEC 60076',
    standards: ['IEC 60076', 'IEEE C57.12.00'],
    calculations: [
      'transformer-sizing',
      'transformer-efficiency',
      'transformer-losses',
      'transformer-regulation',
      'transformer-impedance',
      'transformer-loading',
    ],
    tags: ['ترانسفورماتور', 'قدرت', 'توزیع'],
    regulations: ['IEC 60076-1', 'IEC 60076-7 loading guide'],
  },
  {
    id: 'eq-cable-lv',
    slug: 'lv-cable',
    nameFa: 'کابل فشار ضعیف',
    nameEn: 'Low Voltage Cable',
    category: 'cable',
    icon: '🔌',
    descriptionFa: 'کابل‌های LV مطابق IEC 60364-5-52 و NEC',
    descriptionEn: 'LV cables per IEC 60364-5-52 and NEC',
    standards: ['IEC 60364-5-52', 'IEC 60287', 'NEC 2023'],
    calculations: [
      'cable-sizing',
      'cable-voltage-drop',
      'cable-ampacity',
      'cable-short-circuit-withstand',
      'cable-derating-grouping',
    ],
    tags: ['کابل', 'فشار ضعیف', 'سایزینگ'],
    regulations: ['NEC Table 310.15', 'IEC 60364-5-52'],
  },
  {
    id: 'eq-switchgear-mccb',
    slug: 'mccb',
    nameFa: 'کلید کامپکت MCCB',
    nameEn: 'Molded Case Circuit Breaker',
    category: 'switchgear',
    icon: '🔧',
    descriptionFa: 'کلید اتوماتیک کامپکت برای حفاظت اضافه جریان',
    descriptionEn: 'Molded case CB for overcurrent protection',
    standards: ['IEC 60947-2', 'IEEE 242'],
    calculations: [
      'protection-mccb-selection',
      'protection-breaking-capacity',
      'protection-coordination',
    ],
    tags: ['کلید', 'حفاظت', 'MCCB'],
    regulations: ['IEC 60947-2', 'NEC 240'],
  },
  {
    id: 'eq-switchgear-acb',
    slug: 'acb',
    nameFa: 'کلید هوایی ACB',
    nameEn: 'Air Circuit Breaker',
    category: 'switchgear',
    icon: '⚙️',
    descriptionFa: 'کلید هوایی فشار ضعیف برای جریان‌های بالا',
    descriptionEn: 'LV air CB for high currents',
    standards: ['IEC 60947-2', 'IEEE C37.13'],
    calculations: ['protection-acb-selection', 'protection-breaking-capacity'],
    tags: ['ACB', 'کلید هوایی'],
    regulations: ['IEC 60947-2'],
  },
  {
    id: 'eq-motor-induction',
    slug: 'induction-motor',
    nameFa: 'موتور القایی سه فاز',
    nameEn: 'Three-Phase Induction Motor',
    category: 'motor',
    icon: '🔄',
    descriptionFa: 'موتور القایی بر اساس IEC 60034 و NEMA MG-1',
    descriptionEn: 'Induction motor per IEC 60034 & NEMA MG-1',
    standards: ['IEC 60034-1', 'NEMA MG-1', 'IEEE 3002.2'],
    calculations: [
      'motor-current',
      'motor-starting-current',
      'motor-voltage-drop-starting',
      'motor-starting-method',
      'motor-cable-sizing',
      'motor-protection-sizing',
    ],
    tags: ['موتور', 'القایی', 'سه فاز'],
    regulations: ['NEMA MG-1', 'IEC 60034-1'],
  },
  {
    id: 'eq-grounding-grid',
    slug: 'grounding-grid',
    nameFa: 'شبکه زمین پست',
    nameEn: 'Substation Grounding Grid',
    category: 'grounding',
    icon: '🌍',
    descriptionFa: 'طراحی شبکه زمین بر اساس IEEE 80',
    descriptionEn: 'Grounding grid design per IEEE 80',
    standards: ['IEEE 80', 'IEC 60364-5-54', 'IEEE 665'],
    calculations: [
      'grounding-grid-resistance',
      'grounding-touch-voltage',
      'grounding-step-voltage',
      'grounding-conductor-sizing',
    ],
    tags: ['زمین', 'پست', 'ایمنی'],
    regulations: ['IEEE 80', 'NEC 250'],
  },
  {
    id: 'eq-capacitor-bank',
    slug: 'capacitor-bank',
    nameFa: 'بانک خازنی',
    nameEn: 'Capacitor Bank',
    category: 'power_quality',
    icon: '🔋',
    descriptionFa: 'جبران توان راکتیو و اصلاح ضریب توان',
    descriptionEn: 'Reactive compensation and PF correction',
    standards: ['IEC 60831', 'IEEE 18', 'IEEE 1459'],
    calculations: ['pq-capacitor-bank', 'pq-power-factor-correction', 'pq-reactive-power'],
    tags: ['خازن', 'توان راکتیو', 'PF'],
    regulations: ['IEEE 1036'],
  },
  {
    id: 'eq-busbar',
    slug: 'busbar',
    nameFa: 'شینه (باسبار)',
    nameEn: 'Busbar',
    category: 'busbar',
    icon: '📏',
    descriptionFa: 'شینه مسی/آلومینیومی برای تابلو برق',
    descriptionEn: 'Copper/Al busbar for switchgear',
    standards: ['IEC 61439-1', 'IEC 60865'],
    calculations: ['busbar-sizing'],
    tags: ['باسبار', 'شینه', 'تابلو'],
    regulations: ['IEC 61439'],
  },
  {
    id: 'eq-protection-relay',
    slug: 'protection-relay',
    nameFa: 'رله حفاظتی + CT',
    nameEn: 'Protection Relay + CT',
    category: 'protection',
    icon: '🛡️',
    descriptionFa: 'رله و ترانس جریان برای حفاظت',
    descriptionEn: 'Relay and CT for protection',
    standards: ['IEC 61869-2', 'IEEE C57.13', 'IEEE 242'],
    calculations: ['protection-relay-ct-sizing', 'protection-coordination'],
    tags: ['رله', 'CT', 'حفاظت'],
    regulations: ['IEC 61869-2'],
  },
  {
    id: 'eq-lighting',
    slug: 'lighting-system',
    nameFa: 'سیستم روشنایی',
    nameEn: 'Lighting System',
    category: 'lighting',
    icon: '💡',
    descriptionFa: 'طراحی روشنایی داخلی و خارجی',
    descriptionEn: 'Interior & exterior lighting design',
    standards: ['IEC 60598', 'IESNA'],
    calculations: ['lighting-calculation'],
    tags: ['روشنایی', 'لوکس'],
    regulations: ['IEC 60598'],
  },
];

export function getEquipmentByCategory(category: EquipmentDef['category']): EquipmentDef[] {
  return EQUIPMENT_REGISTRY.filter((e) => e.category === category);
}

export function getEquipmentByStandard(standardCode: string): EquipmentDef[] {
  return EQUIPMENT_REGISTRY.filter((e) =>
    e.standards.some((s) => s.toLowerCase().includes(standardCode.toLowerCase())),
  );
}

export function getEquipmentByCalculation(calcId: string): EquipmentDef[] {
  return EQUIPMENT_REGISTRY.filter((e) => e.calculations.includes(calcId));
}

export const EQUIPMENT_CATEGORIES: Record<
  EquipmentDef['category'],
  { fa: string; en: string; icon: string }
> = {
  transformer: { fa: 'ترانسفورماتور', en: 'Transformer', icon: '⚡' },
  cable: { fa: 'کابل', en: 'Cable', icon: '🔌' },
  switchgear: { fa: 'تابلو و کلید', en: 'Switchgear', icon: '🔧' },
  motor: { fa: 'موتور', en: 'Motor', icon: '🔄' },
  grounding: { fa: 'زمین', en: 'Grounding', icon: '🌍' },
  power_quality: { fa: 'کیفیت توان', en: 'Power Quality', icon: '📊' },
  protection: { fa: 'حفاظت', en: 'Protection', icon: '🛡️' },
  lighting: { fa: 'روشنایی', en: 'Lighting', icon: '💡' },
  renewable: { fa: 'تجدیدپذیر', en: 'Renewable', icon: '☀️' },
  busbar: { fa: 'باسبار', en: 'Busbar', icon: '📏' },
  other: { fa: 'سایر', en: 'Other', icon: '🔹' },
};
