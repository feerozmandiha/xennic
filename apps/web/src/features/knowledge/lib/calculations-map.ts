/**
 * Calculations Map — links calculator plugin IDs to knowledge taxonomy, standards, equipment.
 * Derived from engineering-standards-matrix.md
 */

export interface CalculationLink {
  id: string;
  category: string;
  labelFa: string;
  labelEn: string;
  standard: string;
  secondaryStandards: string[];
  equipment: string[];
}

export const CALCULATIONS_MAP: Record<string, CalculationLink> = {
  'ohms-law': {
    id: 'ohms-law',
    category: 'foundation',
    labelFa: 'قانون اهم',
    labelEn: "Ohm's Law",
    standard: 'IEC 60027',
    secondaryStandards: [],
    equipment: ['cable', 'other'],
  },
  'power-calculation': {
    id: 'power-calculation',
    category: 'foundation',
    labelFa: 'محاسبه توان',
    labelEn: 'Power Calculation',
    standard: 'IEC 60027',
    secondaryStandards: [],
    equipment: ['other'],
  },
  'energy-calculation': {
    id: 'energy-calculation',
    category: 'foundation',
    labelFa: 'محاسبه انرژی',
    labelEn: 'Energy Calculation',
    standard: 'IEC 60027',
    secondaryStandards: [],
    equipment: ['other'],
  },
  efficiency: {
    id: 'efficiency',
    category: 'foundation',
    labelFa: 'راندمان',
    labelEn: 'Efficiency',
    standard: 'IEC 60034-1',
    secondaryStandards: [],
    equipment: ['transformer', 'motor'],
  },
  'power-factor': {
    id: 'power-factor',
    category: 'foundation',
    labelFa: 'ضریب توان',
    labelEn: 'Power Factor',
    standard: 'IEEE 1459',
    secondaryStandards: ['IEC 60027'],
    equipment: ['power_quality'],
  },
  'cable-sizing': {
    id: 'cable-sizing',
    category: 'cable',
    labelFa: 'سایزینگ کابل',
    labelEn: 'Cable Sizing',
    standard: 'IEC 60364-5-52',
    secondaryStandards: ['NEC 2023'],
    equipment: ['cable'],
  },
  'cable-voltage-drop': {
    id: 'cable-voltage-drop',
    category: 'cable',
    labelFa: 'افت ولتاژ کابل',
    labelEn: 'Cable Voltage Drop',
    standard: 'IEC 60364-5-52',
    secondaryStandards: ['NEC 2023'],
    equipment: ['cable'],
  },
  'cable-ampacity': {
    id: 'cable-ampacity',
    category: 'cable',
    labelFa: 'ظرفیت جریان کابل',
    labelEn: 'Cable Ampacity',
    standard: 'IEC 60364-5-52',
    secondaryStandards: ['IEEE 835', 'NEC 2023'],
    equipment: ['cable'],
  },
  'transformer-sizing': {
    id: 'transformer-sizing',
    category: 'transformer',
    labelFa: 'سایزینگ ترانسفورماتور',
    labelEn: 'Transformer Sizing',
    standard: 'IEC 60076',
    secondaryStandards: ['IEEE C57.12.00'],
    equipment: ['transformer'],
  },
  'transformer-efficiency': {
    id: 'transformer-efficiency',
    category: 'transformer',
    labelFa: 'راندمان ترانسفورماتور',
    labelEn: 'Transformer Efficiency',
    standard: 'IEC 60076-1',
    secondaryStandards: ['IEEE C57.12.90'],
    equipment: ['transformer'],
  },
  'sc-three-phase': {
    id: 'sc-three-phase',
    category: 'short_circuit',
    labelFa: 'اتصال کوتاه سه فاز',
    labelEn: 'Three-Phase Short Circuit',
    standard: 'IEC 60909',
    secondaryStandards: ['IEEE 141'],
    equipment: ['switchgear', 'protection'],
  },
  'grounding-earth-resistance': {
    id: 'grounding-earth-resistance',
    category: 'grounding',
    labelFa: 'مقاومت زمین',
    labelEn: 'Earth Resistance',
    standard: 'IEEE 80',
    secondaryStandards: ['IEC 60364-5-54'],
    equipment: ['grounding'],
  },
  'grounding-grid-resistance': {
    id: 'grounding-grid-resistance',
    category: 'grounding',
    labelFa: 'مقاومت شبکه زمین',
    labelEn: 'Grid Resistance',
    standard: 'IEEE 80',
    secondaryStandards: ['IEEE 665'],
    equipment: ['grounding'],
  },
  'protection-fuse-sizing': {
    id: 'protection-fuse-sizing',
    category: 'protection',
    labelFa: 'سایزینگ فیوز',
    labelEn: 'Fuse Sizing',
    standard: 'IEC 60269',
    secondaryStandards: ['NEC 240', 'IEEE 242'],
    equipment: ['protection', 'switchgear'],
  },
  'protection-mcb-selection': {
    id: 'protection-mcb-selection',
    category: 'protection',
    labelFa: 'انتخاب کلید مینیاتوری',
    labelEn: 'MCB Selection',
    standard: 'IEC 60898',
    secondaryStandards: ['IEEE 242'],
    equipment: ['switchgear'],
  },
  'motor-current': {
    id: 'motor-current',
    category: 'motor',
    labelFa: 'جریان موتور',
    labelEn: 'Motor Current',
    standard: 'IEC 60034-1',
    secondaryStandards: ['NEMA MG-1'],
    equipment: ['motor'],
  },
  'pq-power-factor-correction': {
    id: 'pq-power-factor-correction',
    category: 'power_quality',
    labelFa: 'اصلاح ضریب توان',
    labelEn: 'PF Correction',
    standard: 'IEEE 1459',
    secondaryStandards: ['IEC 61000', 'IEC 60831-1'],
    equipment: ['power_quality'],
  },
  'pq-capacitor-bank': {
    id: 'pq-capacitor-bank',
    category: 'power_quality',
    labelFa: 'بانک خازنی',
    labelEn: 'Capacitor Bank',
    standard: 'IEC 60831',
    secondaryStandards: ['IEEE 18'],
    equipment: ['power_quality'],
  },
  'pq-harmonic-estimation': {
    id: 'pq-harmonic-estimation',
    category: 'power_quality',
    labelFa: 'تخمین هارمونیک',
    labelEn: 'Harmonic Estimation',
    standard: 'IEEE 519',
    secondaryStandards: ['IEC 61000-2-4'],
    equipment: ['power_quality'],
  },
};

export function getCalculationLabel(id: string, locale: 'fa' | 'en' = 'fa'): string {
  const item = CALCULATIONS_MAP[id];
  if (!item) return id;
  return locale === 'fa' ? item.labelFa : item.labelEn;
}

export function getCalculationsByCategory(cat: string): CalculationLink[] {
  return Object.values(CALCULATIONS_MAP).filter((c) => c.category === cat);
}

export function getCalculationsByStandard(stdCode: string): CalculationLink[] {
  return Object.values(CALCULATIONS_MAP).filter(
    (c) => c.standard.includes(stdCode) || c.secondaryStandards.some((s) => s.includes(stdCode)),
  );
}
