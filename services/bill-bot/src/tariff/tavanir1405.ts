/**
 * داده تعرفه برق خانگی ۱۴۰۵ — منبع: docs/bill-bot/05-TARIFF-ENGINE-1405.md
 *
 * این فایل «تنها نقطه تغییر سالانه» است: با ابلاغ تعرفه جدید، فقط داده‌های
 * این فایل (و افزودن فایل tavanir14xx.ts) تغییر می‌کند و انتخاب از طریق
 * TARIFF_YEAR در env انجام می‌شود.
 */

import type { Season, ZoneId } from '../bill/types.ts';

export interface TariffTier {
  uptoKwh: number | null; // null = بدون سقف (مازاد بر …)
  factor: number; // ضریب نسبت به هزینه تأمین
  applyCoeff?: number; // ضریب اعمال تعرفه (پیش‌فرض ۱)
}

export interface TariffProfile {
  id: string;
  title: string;
  /** الگوی مصرف ماهانه این پروفایل (kWh) — برای وضعیت‌سنجی مشترک */
  patternLimitKwh: number | null;
  tiers: TariffTier[];
}

/** هزینه تأمین برق (ریال بر کیلووات‌ساعت) — [منبع: fannimag، ابلاغ ۲۷ اردیبهشت ۱۴۰۵] */
export const SUPPLY_COST_RIALS_PER_KWH: Record<number, number> = {
  1404: 9537,
  1405: 13256,
};

/** الگوی مصرف ماهانه (kWh) بر اساس منطقه و فصل */
export const PATTERN_LIMITS: Record<ZoneId, Record<Season, number>> = {
  normal: { normal: 300, hot: 300 },
  tropical1: { normal: 300, hot: 2500 },
  tropical2: { normal: 300, hot: 1500 },
  tropical3: { normal: 300, hot: 600 },
  tropical4: { normal: 300, hot: 450 },
};

// ── جدول الف: تعرفه «طبق الگو» ──────────────────────────────────
export const WITHIN_PATTERN: Record<ZoneId, Record<Season, TariffProfile>> = {
  normal: {
    normal: {
      id: 'WP-NORMAL',
      title: 'منطقه عادی — طبق الگو',
      patternLimitKwh: 300,
      tiers: [
        { uptoKwh: 100, factor: 0.146 },
        { uptoKwh: 200, factor: 0.17 },
        { uptoKwh: 300, factor: 0.365 },
      ],
    },
    hot: {
      id: 'WP-NORMAL-HOT',
      title: 'منطقه عادی — ماه‌های گرم — طبق الگو',
      patternLimitKwh: 300,
      tiers: [
        { uptoKwh: 100, factor: 0.146 },
        { uptoKwh: 200, factor: 0.17 },
        { uptoKwh: 300, factor: 0.365 },
      ],
    },
  },
  tropical1: {
    normal: {
      id: 'WP-T1-COOL',
      title: 'گرمسیر ۱ — ماه‌های غیرگرم — طبق الگو',
      patternLimitKwh: 300,
      tiers: [
        { uptoKwh: 100, factor: 0.146 },
        { uptoKwh: 200, factor: 0.17 },
        { uptoKwh: 300, factor: 0.365 },
      ],
    },
    hot: {
      id: 'WP-T1-HOT',
      title: 'گرمسیر ۱ — ماه‌های گرم — طبق الگو',
      patternLimitKwh: 2500,
      tiers: [
        { uptoKwh: 1000, factor: 0.048 },
        { uptoKwh: 2000, factor: 0.054 },
        { uptoKwh: 2500, factor: 0.06 },
      ],
    },
  },
  tropical2: {
    normal: {
      id: 'WP-T2-COOL',
      title: 'گرمسیر ۲ — ماه‌های غیرگرم — طبق الگو',
      patternLimitKwh: 300,
      tiers: [
        { uptoKwh: 100, factor: 0.146 },
        { uptoKwh: 200, factor: 0.17 },
        { uptoKwh: 300, factor: 0.365 },
      ],
    },
    hot: {
      id: 'WP-T2-HOT',
      title: 'گرمسیر ۲ — ماه‌های گرم — طبق الگو',
      patternLimitKwh: 1500,
      tiers: [
        { uptoKwh: 1000, factor: 0.107 },
        { uptoKwh: 1500, factor: 0.25 },
      ],
    },
  },
  tropical3: {
    normal: {
      id: 'WP-T3-COOL',
      title: 'گرمسیر ۳ — ماه‌های غیرگرم — طبق الگو',
      patternLimitKwh: 300,
      tiers: [
        { uptoKwh: 100, factor: 0.146 },
        { uptoKwh: 200, factor: 0.17 },
        { uptoKwh: 300, factor: 0.365 },
      ],
    },
    hot: {
      id: 'WP-T3-HOT',
      title: 'گرمسیر ۳ — ماه‌های گرم — طبق الگو',
      patternLimitKwh: 600,
      tiers: [{ uptoKwh: 600, factor: 0.122 }],
    },
  },
  tropical4: {
    normal: {
      id: 'WP-T4-COOL',
      title: 'گرمسیر ۴ — ماه‌های غیرگرم — طبق الگو',
      patternLimitKwh: 300,
      tiers: [
        { uptoKwh: 100, factor: 0.146 },
        { uptoKwh: 200, factor: 0.17 },
        { uptoKwh: 300, factor: 0.365 },
      ],
    },
    hot: {
      id: 'WP-T4-HOT',
      title: 'گرمسیر ۴ — ماه‌های گرم — طبق الگو',
      patternLimitKwh: 450,
      tiers: [
        { uptoKwh: 100, factor: 0.128 },
        { uptoKwh: 200, factor: 0.151 },
        { uptoKwh: 300, factor: 0.26 },
        { uptoKwh: 450, factor: 0.42 },
      ],
    },
  },
};

// ── جدول ب: تعرفه «مازاد بر الگو» ───────────────────────────────
export const OVER_PATTERN: Record<string, TariffProfile> = {
  // ب-۱: منطقه عادی غیرگرم، میانگین ۲۰۰–۳۰۰
  'P1-NORMAL-COOL-200-300': {
    id: 'P1-NORMAL-COOL-200-300',
    title: 'منطقه عادی — غیرگرم — میانگین ۲۰۰ تا ۳۰۰',
    patternLimitKwh: 200,
    tiers: [
      { uptoKwh: 200, factor: 0.5, applyCoeff: 0.876 },
      { uptoKwh: 300, factor: 1.5, applyCoeff: 1 },
    ],
  },
  // ب-۲: منطقه عادی غیرگرم، میانگین بیش از ۳۰۰
  'P2-NORMAL-COOL-300+': {
    id: 'P2-NORMAL-COOL-300+',
    title: 'منطقه عادی — غیرگرم — میانگین بیش از ۳۰۰',
    patternLimitKwh: 300,
    tiers: [
      { uptoKwh: 200, factor: 0.5 },
      { uptoKwh: 300, factor: 1.5 },
      { uptoKwh: 500, factor: 2.5 },
      { uptoKwh: null, factor: 5 },
    ],
  },
  // ب-۳: ماه‌های گرم منطقه عادی و غیرگرم گرمسیر۱، میانگین بیش از ۳۰۰
  'P3-NORMAL-HOT-300+': {
    id: 'P3-NORMAL-HOT-300+',
    title: 'ماه‌های گرم منطقه عادی — میانگین بیش از ۳۰۰',
    patternLimitKwh: 300,
    tiers: [
      { uptoKwh: 300, factor: 0.5 },
      { uptoKwh: 450, factor: 1.5 },
      { uptoKwh: 750, factor: 2.5 },
      { uptoKwh: null, factor: 5 },
    ],
  },
  // ب-۴: ماه‌های گرم گرمسیر ۴
  'P4-T4-HOT': {
    id: 'P4-T4-HOT',
    title: 'گرمسیر ۴ — ماه‌های گرم — مازاد بر الگو',
    patternLimitKwh: 450,
    tiers: [
      { uptoKwh: 450, factor: 0.4 },
      { uptoKwh: 675, factor: 1.2 },
      { uptoKwh: 1125, factor: 2 },
      { uptoKwh: null, factor: 4 },
    ],
  },
  // ب-۵: ماه‌های گرم گرمسیر ۳
  'P5-T3-HOT': {
    id: 'P5-T3-HOT',
    title: 'گرمسیر ۳ — ماه‌های گرم — مازاد بر الگو',
    patternLimitKwh: 600,
    tiers: [
      { uptoKwh: 600, factor: 0.4, applyCoeff: 0.533 },
      { uptoKwh: 900, factor: 1.2, applyCoeff: 0.202 },
      { uptoKwh: 1000, factor: 2, applyCoeff: 0.288 },
      { uptoKwh: 1500, factor: 2 },
      { uptoKwh: null, factor: 4 },
    ],
  },
  // ب-۶: ماه‌های گرم گرمسیر ۲
  'P6-T2-HOT': {
    id: 'P6-T2-HOT',
    title: 'گرمسیر ۲ — ماه‌های گرم — مازاد بر الگو',
    patternLimitKwh: 1500,
    tiers: [
      { uptoKwh: 1500, factor: 0.4, applyCoeff: 0.648 },
      { uptoKwh: 2000, factor: 1.2, applyCoeff: 0.576 },
      { uptoKwh: 2250, factor: 2 },
      { uptoKwh: 3750, factor: 2 },
      { uptoKwh: null, factor: 4 },
    ],
  },
  // ب-۷: ماه‌های گرم گرمسیر ۱، میانگین ۲۵۰۰–۳۰۰۰
  'P7-T1-HOT-2500-3000': {
    id: 'P7-T1-HOT-2500-3000',
    title: 'گرمسیر ۱ — ماه‌های گرم — میانگین ۲۵۰۰ تا ۳۰۰۰',
    patternLimitKwh: 2500,
    tiers: [
      { uptoKwh: 2500, factor: 0.25, applyCoeff: 0.36 },
      { uptoKwh: 3000, factor: 0.75, applyCoeff: 0.23 },
    ],
  },
  // ب-۸: ماه‌های گرم گرمسیر ۱، میانگین بیش از ۳۰۰۰
  'P8-T1-HOT-3000+': {
    id: 'P8-T1-HOT-3000+',
    title: 'گرمسیر ۱ — ماه‌های گرم — میانگین بیش از ۳۰۰۰',
    patternLimitKwh: 3000,
    tiers: [
      { uptoKwh: 2500, factor: 0.25, applyCoeff: 0.36 },
      { uptoKwh: 3000, factor: 0.75, applyCoeff: 0.72 },
      { uptoKwh: 3750, factor: 0.75 },
      { uptoKwh: 6250, factor: 1.25 },
      { uptoKwh: null, factor: 2.5 },
    ],
  },
  // ب-۹: گرمسیر ۱، مهر تا آذر، میانگین ۲۰۰۰–۲۵۰۰
  'P9-T1-AUTUMN-2000-2500': {
    id: 'P9-T1-AUTUMN-2000-2500',
    title: 'گرمسیر ۱ — مهر تا آذر — میانگین ۲۰۰۰ تا ۲۵۰۰',
    patternLimitKwh: 2000,
    tiers: [
      { uptoKwh: 2000, factor: 0.5, applyCoeff: 0.36 },
      { uptoKwh: 2500, factor: 1.5, applyCoeff: 0.23 },
    ],
  },
  // ب-۱۰: گرمسیر ۱، مهر تا آذر، میانگین بیش از ۲۵۰۰
  'P10-T1-AUTUMN-2500+': {
    id: 'P10-T1-AUTUMN-2500+',
    title: 'گرمسیر ۱ — مهر تا آذر — میانگین بیش از ۲۵۰۰',
    patternLimitKwh: 2500,
    tiers: [
      { uptoKwh: 2000, factor: 0.25, applyCoeff: 0.36 },
      { uptoKwh: 2500, factor: 0.75, applyCoeff: 0.72 },
      { uptoKwh: 3000, factor: 0.75 },
      { uptoKwh: 5000, factor: 1.25 },
      { uptoKwh: null, factor: 2.5 },
    ],
  },
};

// ── جدول پ: خوش‌نشین‌ها و سکونتگاه‌های غیردائم ───────────────────
export const TEMPORARY_RESIDENCE: Record<string, TariffProfile> = {
  'TEMP-COOL': {
    id: 'TEMP-COOL',
    title: 'خوش‌نشین — منطقه عادی و غیرگرم',
    patternLimitKwh: 50,
    tiers: [
      { uptoKwh: 50, factor: 0.5 },
      { uptoKwh: 75, factor: 1.5 },
      { uptoKwh: 125, factor: 2.5 },
      { uptoKwh: null, factor: 5 },
    ],
  },
  'TEMP-T12-HOT': {
    id: 'TEMP-T12-HOT',
    title: 'خوش‌نشین — ماه‌های گرم گرمسیر ۱ و ۲',
    patternLimitKwh: 250,
    tiers: [
      { uptoKwh: 250, factor: 0.5 },
      { uptoKwh: 375, factor: 1.5 },
      { uptoKwh: 625, factor: 2.5 },
      { uptoKwh: null, factor: 5 },
    ],
  },
  'TEMP-T34-HOT': {
    id: 'TEMP-T34-HOT',
    title: 'خوش‌نشین — ماه‌های گرم گرمسیر ۳ و ۴',
    patternLimitKwh: 100,
    tiers: [
      { uptoKwh: 100, factor: 0.5 },
      { uptoKwh: 150, factor: 1.5 },
      { uptoKwh: 250, factor: 2.5 },
      { uptoKwh: null, factor: 5 },
    ],
  },
};

/** ضرایب تبصره اوج‌بار برای مناطق گرمسیر */
export function peakZoneFactor(zone: ZoneId, season: Season): number {
  if (season !== 'hot') return 1;
  if (zone === 'tropical1') return 1 / 3;
  if (zone === 'tropical2' || zone === 'tropical3' || zone === 'tropical4') {
    return 2 / 3;
  }
  return 1;
}

/** عوارض و مالیات ۱۴۰۵ */
export const CHARGES_1405 = {
  /** عوارض ماده ۵ قانون حمایت از صنعت برق — ۱۰٪ برای ۱۴۰۵ */
  article5LevyPct: 0.1,
  /** مالیات بر ارزش افزوده (قابل بازنویسی) */
  vatPct: 0.1,
};

export interface TariffBook {
  year: number;
  supplyCostRials: number;
  withinPattern: typeof WITHIN_PATTERN;
  overPattern: typeof OVER_PATTERN;
  temporary: typeof TEMPORARY_RESIDENCE;
}

export function getTariffBook(year: number): TariffBook {
  if (year !== 1405 && year !== 1404) {
    // در نبود داده سال جدید، از ۱۴۰۵ استفاده می‌شود + هشدار در لایه تحلیل
    return {
      year: 1405,
      supplyCostRials: SUPPLY_COST_RIALS_PER_KWH[1405],
      withinPattern: WITHIN_PATTERN,
      overPattern: OVER_PATTERN,
      temporary: TEMPORARY_RESIDENCE,
    };
  }
  return {
    year,
    supplyCostRials: SUPPLY_COST_RIALS_PER_KWH[year],
    withinPattern: WITHIN_PATTERN,
    overPattern: OVER_PATTERN,
    temporary: TEMPORARY_RESIDENCE,
  };
}
