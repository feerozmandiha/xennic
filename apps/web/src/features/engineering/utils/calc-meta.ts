export interface CalcMeta {
  name: string;
  standard: string;
  engineVersion: string;
}

export const CALC_META: Record<string, CalcMeta> = {
  'BASIC-001': { name: 'قانون اهم', standard: '—', engineVersion: '1.0' },
  'BASIC-002': { name: 'محاسبه توان الکتریکی', standard: 'IEC 60038', engineVersion: '1.0' },
  'BASIC-003': { name: 'محاسبه جریان', standard: 'IEC 60038', engineVersion: '1.0' },
  'BASIC-004': { name: 'ضریب قدرت', standard: '—', engineVersion: '1.0' },
  'BASIC-005': { name: 'زاویه فاز', standard: '—', engineVersion: '1.0' },

  'CABLE-001': { name: 'انتخاب کابل (جریان‌دهی)', standard: 'IEC 60364-5-52', engineVersion: '1.0' },
  'CABLE-002': { name: 'افت ولتاژ کابل', standard: 'IEC 60364-5-52', engineVersion: '1.0' },
  'CABLE-003': { name: 'مقاومت در برابر اتصال کوتاه', standard: 'IEC 60949', engineVersion: '1.0' },
  'CABLE-004': { name: 'سایزینگ هادی PE', standard: 'IEC 60364-5-54', engineVersion: '1.0' },
  'CABLE-005': { name: 'سایزینگ نردبان کابل', standard: 'IEC 61537', engineVersion: '1.0' },

  'TRF-001': { name: 'محاسبات ترانسفورماتور', standard: 'IEC 60076', engineVersion: '1.0' },
  'TRF-002': { name: 'تلفات ترانسفورماتور', standard: 'IEC 60076', engineVersion: '1.0' },
  'TRF-003': { name: 'تنظیم ولتاژ ترانس', standard: 'IEC 60076', engineVersion: '1.0' },
  'TRF-004': { name: 'ضریب K ترانس', standard: 'IEEE C57.110', engineVersion: '1.0' },
  'TRF-005': { name: 'بازده انرژی ترانس', standard: 'EU 548/2014', engineVersion: '1.0' },

  'PROT-001': { name: 'انتخاب کلید حفاظتی', standard: 'IEC 60947-2', engineVersion: '1.0' },
  'PROT-002': { name: 'قوس الکتریکی (Arc Flash)', standard: 'IEEE 1584-2018', engineVersion: '1.0' },
  'PROT-004': { name: 'انتخاب فیوز', standard: 'IEC 60269', engineVersion: '1.0' },
  'PROT-005': { name: 'هماهنگی حفاظتی (TCC)', standard: 'IEC 60255-151', engineVersion: '1.0' },

  'SC-001': { name: 'اتصال کوتاه', standard: 'IEC 60909', engineVersion: '1.0' },

  'PQ-001': { name: 'THD (هارمونیک)', standard: 'IEEE 519', engineVersion: '1.0' },
  'PQ-002': { name: 'TDD (هارمونیک)', standard: 'IEEE 519', engineVersion: '1.0' },
  'PQ-003': { name: 'ضریب K (هارمونیک)', standard: 'IEEE C57.110', engineVersion: '1.0' },
  'PQ-004': { name: 'تحلیل رزونانس', standard: 'IEEE 519', engineVersion: '1.0' },
  'PQ-005': { name: 'طراحی فیلتر پسیو', standard: 'IEC 61642', engineVersion: '1.0' },
  'PQ-006': { name: 'سایزینگ فیلتر اکتیو', standard: 'IEEE 519', engineVersion: '1.0' },

  'GND-001': { name: 'طراحی سیستم زمین', standard: 'IEC 60364 / IEEE 80', engineVersion: '1.0' },
  'GND-002': { name: 'شبکه زمین (Grid)', standard: 'IEEE Std 80-2013', engineVersion: '1.0' },

  'LIGHT-001': { name: 'محاسبه روشنایی (Lumen)', standard: 'CIE / EN 12464', engineVersion: '1.0' },
  'LIGHT-002': { name: 'روشنایی معابر', standard: 'EN 13201', engineVersion: '1.0' },

  'PV-001': { name: 'طراحی نیروگاه خورشیدی', standard: 'IEC 62548', engineVersion: '1.0' },
  'SOLAR-002': { name: 'سایزینگ اینورتر خورشیدی', standard: 'IEC 62548', engineVersion: '1.0' },
  'SOLAR-003': { name: 'سایزینگ باتری خورشیدی', standard: 'IEC 62548', engineVersion: '1.0' },

  'EA-001': { name: 'صورتحساب برق (Energy Audit)', standard: 'توانیر / وزارت نیرو', engineVersion: '1.0' },
  'ECO-001': { name: 'ROI (بازگشت سرمایه)', standard: '—', engineVersion: '1.0' },
  'ECO-002': { name: 'NPV (ارزش فعلی خالص)', standard: '—', engineVersion: '1.0' },
  'ECO-003': { name: 'IRR (نرخ بازده داخلی)', standard: '—', engineVersion: '1.0' },

  'MOT-001': { name: 'راه‌اندازی موتور', standard: 'IEC 60034', engineVersion: '1.0' },
  'MOT-002': { name: 'بازده موتور (IE)', standard: 'IEC 60034-30', engineVersion: '1.0' },

  'BAT-001': { name: 'محاسبه بانک باتری', standard: 'IEC 61427', engineVersion: '1.0' },
  'BAT-BU-001': { name: 'زمان پشتیبانی باتری', standard: 'IEC 61427', engineVersion: '1.0' },
  'BATTERY-002': { name: 'انتخاب شارژر باتری', standard: 'IEEE 485 / IEC 60146', engineVersion: '1.0' },

  'SWT-001': { name: 'انتخاب کلید ورودی', standard: 'IEC 60947-2', engineVersion: '1.0' },
  'PFC-001': { name: 'سایزینگ بانک خازنی', standard: 'IEC 60831', engineVersion: '1.0' },
  'CAP-001': { name: 'اصلاح ضریب قدرت', standard: 'IEC 60831', engineVersion: '1.0' },
  'ARC-001': { name: 'انرژی قوس (Arc Flash)', standard: 'IEEE 1584-2018', engineVersion: '1.0' },
  'HARM-001': { name: 'تحلیل پیشرفته هارمونیک', standard: 'IEEE 519', engineVersion: '1.0' },
};
