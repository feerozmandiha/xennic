// نگاشت «نوع محاسبهٔ مهندسی» به «دستهٔ کالای بازارگاه».
// توسط سرویس پیشنهاد محصول (داخلی و عمومی) استفاده می‌شود.

export const CALC_TO_CATEGORY: Record<string, string> = {
  'CABLE-001': 'cable',
  'CABLE-002': 'cable',
  'CABLE-003': 'cable',
  'CABLE-004': 'cable',
  'CABLE-005': 'cable',
  'TRF-001': 'transformer',
  'TRF-002': 'transformer',
  'TRF-003': 'transformer',
  'TRF-004': 'transformer',
  'TRF-005': 'transformer',
  'PROT-001': 'mccb',
  'PROT-004': 'fuse',
  'PROT-005': 'mccb',
  'SC-001': 'mccb',
  'SWT-001': 'switchgear',
  'LIGHT-001': 'lighting',
  'LIGHT-002': 'lighting',
  'PV-001': 'solar',
  'SOLAR-002': 'solar',
  'SOLAR-003': 'solar',
  'BAT-001': 'battery',
  'BAT-BU-001': 'battery',
  'BATTERY-002': 'battery',
  'GND-001': 'grounding',
  'GND-002': 'grounding',
  'MOT-001': 'motor',
  'MOT-002': 'motor',
};

export function calcCategory(calculationType: string): string | undefined {
  return CALC_TO_CATEGORY[calculationType];
}
