/**
 * موتور تحلیل قاعده‌محور (لایه ۱ — سند ۰۶).
 * ورودی: BillData استخراج‌شده → خروجی: ReportModel قطعی و حسابرسی‌پذیر.
 */

import type {
  BillData,
  PatternStatus,
  Recommendation,
  ReportModel,
  Season,
  ZoneId,
} from '../bill/types.ts';
import { faNumber } from '../bill/normalize.ts';
import { PATTERN_LIMITS, SUPPLY_COST_RIALS_PER_KWH } from '../tariff/tavanir1405.ts';
import {
  computeTieredEnergy,
  offpeakDiscount3,
  peakSurcharge,
  selectProfile,
} from '../tariff/calculator.ts';
import { jalaliDaysBetween, jalaliMonthsCovered, parseJalali } from '../jalali.ts';

const HOT_MONTHS = new Set([3, 4, 5, 6]); // خرداد تا شهریور

export interface AnalyzeOptions {
  tariffYear?: number;
  supplyCostOverrideRials?: number | null;
}

function patternStatusOf(rel: number): PatternStatus {
  if (rel <= 1) return 'under';
  if (rel <= 1.5) return 'tier2';
  if (rel <= 2.5) return 'tier3';
  return 'tier4';
}

export const STATUS_LABEL: Record<PatternStatus, string> = {
  under: '✅ زیر الگوی مصرف',
  tier2: '⚠️ بین الگو تا ۱٫۵ برابر الگو',
  tier3: '🔴 بین ۱٫۵ تا ۲٫۵ برابر الگو',
  tier4: '🚨 بیش از ۲٫۵ برابر الگو (نرخ تنبیهی ۵ برابر هزینه تأمین)',
};

/** تحلیل کامل قبض. در نبود داده کافی خطا پرتاب می‌شود (فیلدهای کلیدی). */
export function analyzeBill(bill: BillData, opts: AnalyzeOptions = {}): ReportModel {
  const warnings: string[] = [];
  const year = opts.tariffYear ?? 1405;
  const supplyCostRials =
    opts.supplyCostOverrideRials ??
    SUPPLY_COST_RIALS_PER_KWH[year] ??
    SUPPLY_COST_RIALS_PER_KWH[1405];

  if (!SUPPLY_COST_RIALS_PER_KWH[year]) {
    warnings.push(`داده تعرفه سال ${faNumber(year)} موجود نیست؛ مبنای محاسبه ۱۴۰۵ قرار گرفت.`);
  }
  if (bill.consumptionKwh === undefined || bill.consumptionKwh <= 0) {
    throw new Error('مصرف دوره (کیلووات‌ساعت) برای تحلیل لازم است.');
  }
  if (bill.tariffType && bill.tariffType !== 'خانگی') {
    warnings.push(
      `این قبض از نوع «${bill.tariffType}» است؛ تحلیل کامل پلکانی فقط برای تعرفه خانگی فعال است و نتیجه تقریبی است.`,
    );
  }

  const zone: ZoneId = bill.region ?? 'normal';

  // ── فصل و طول دوره ────────────────────────────────────────────
  const from = bill.periodFrom ? parseJalali(bill.periodFrom) : null;
  const to = bill.periodTo ? parseJalali(bill.periodTo) : null;
  let periodDays = bill.periodDays;
  if ((!periodDays || periodDays <= 0) && from && to) {
    periodDays = jalaliDaysBetween(from, to);
  }
  if (!periodDays || periodDays <= 0) periodDays = 30;

  const months = from && to ? jalaliMonthsCovered(from, to) : [];
  const season: Season = months.some((m) => HOT_MONTHS.has(m)) ? 'hot' : 'normal';
  const startMonth = from?.[1] ?? 1;

  const periodMonths = Math.max(periodDays / 30, 0.5);
  const monthlyAvgKwh = bill.consumptionKwh / periodMonths;

  const patternLimitKwh = PATTERN_LIMITS[zone][season];
  const relativeToPattern = monthlyAvgKwh / patternLimitKwh;
  const patternStatus = patternStatusOf(relativeToPattern);
  const overPattern = patternStatus !== 'under';

  // ── محاسبه پلکانی ──────────────────────────────────────────────
  const profile = selectProfile({
    zone,
    season,
    monthlyAvgKwh,
    overPattern,
    startMonth,
  });
  const { tiers, totalRials: computedEnergyRials } = computeTieredEnergy(
    bill.consumptionKwh,
    profile,
    supplyCostRials,
  );
  const effectiveRateRials = computedEnergyRials / bill.consumptionKwh;

  const deviationPct =
    bill.energyChargeRials && bill.energyChargeRials > 0
      ? ((computedEnergyRials - bill.energyChargeRials) / bill.energyChargeRials) * 100
      : null;
  if (deviationPct !== null && Math.abs(deviationPct) > 5) {
    warnings.push(
      `انحراف محاسبه ربات (${faNumber(computedEnergyRials)} ریال) نسبت به بهای انرژی روی قبض (${faNumber(bill.energyChargeRials)} ریال) بیش از ۵٪ است. علل محتمل: تبصره‌ها/عوارض محلی، گردکردن شرکت توزیع، یا خطای استخراج.`,
    );
  }

  // ── اوج‌بار ────────────────────────────────────────────────────
  let peakSurchargeRials: number | null = null;
  let offpeakDiscountRials: number | null = null;
  if (bill.tou?.peak) {
    peakSurchargeRials = peakSurcharge(bill.tou.peak, overPattern, zone, season, supplyCostRials);
  }
  if (bill.tou?.low) {
    offpeakDiscountRials = offpeakDiscount3(
      bill.tou.low,
      overPattern,
      zone,
      season,
      supplyCostRials,
    );
  }

  // ── توصیه‌ها ───────────────────────────────────────────────────
  const recommendations = buildRecommendations({
    bill,
    monthlyAvgKwh,
    patternLimitKwh,
    relativeToPattern,
    patternStatus,
    supplyCostRials,
    effectiveRateRials,
    computedEnergyRials,
  });

  for (const key of ['consumptionKwh', 'periodDays', 'region', 'energyChargeRials']) {
    const c = bill.confidence?.[key];
    if (c !== undefined && c < 0.7) {
      warnings.push(
        `اطمینان استخراج فیلد «${key}» پایین است (${Math.round(c * 100)}٪) — در صورت نادرستی، با دکمه اصلاح آن را ویرایش کنید.`,
      );
    }
  }

  return {
    bill,
    tariffYear: year,
    supplyCostRials,
    zone,
    season,
    monthlyAvgKwh,
    periodMonths,
    patternLimitKwh,
    relativeToPattern,
    patternStatus,
    profileId: profile.id,
    tiers,
    computedEnergyRials,
    effectiveRateRials,
    deviationPct,
    peakSurchargeRials,
    offpeakDiscountRials,
    recommendations,
    warnings,
  };
}

interface RecCtx {
  bill: BillData;
  monthlyAvgKwh: number;
  patternLimitKwh: number;
  relativeToPattern: number;
  patternStatus: PatternStatus;
  supplyCostRials: number;
  effectiveRateRials: number;
  computedEnergyRials: number;
}

function buildRecommendations(ctx: RecCtx): Recommendation[] {
  const recs: Recommendation[] = [];
  const { bill, monthlyAvgKwh, patternLimitKwh, supplyCostRials } = ctx;

  // R1 — عبور از الگو
  if (monthlyAvgKwh > patternLimitKwh) {
    const excessKwh =
      ((monthlyAvgKwh - patternLimitKwh) * ctx.bill.consumptionKwh!) / Math.max(monthlyAvgKwh, 1);
    const save = Math.round(
      excessKwh * Math.max(ctx.effectiveRateRials - supplyCostRials * 0.5, 0),
    );
    recs.push({
      id: 'R1',
      title: 'بازگشت به زیر الگوی مصرف',
      detail: `مصرف ماهانه شما ${faNumber(monthlyAvgKwh)} کیلووات‌ساعت است؛ ${faNumber(Math.max(monthlyAvgKwh - patternLimitKwh, 0))} کیلووات‌ساعت بالاتر از الگو (${faNumber(patternLimitKwh)}). با تنظیم کولر روی ۲۴–۲۵ درجه، استفاده از سایه‌بان و تجمیع بارهای سنگین، به زیر الگو برگردید.`,
      saveRialsPerPeriod: save,
    });
  }

  // R2 — جابه‌جایی اوج‌بار
  if (bill.tou?.peak && bill.consumptionKwh) {
    const peakShare = bill.tou.peak / bill.consumptionKwh;
    if (peakShare > 0.2) {
      const shiftKwh = bill.tou.peak * 0.5;
      const save = Math.round(
        shiftKwh * (ctx.patternStatus === 'under' ? 0.146 : 0.305) * supplyCostRials,
      );
      recs.push({
        id: 'R2',
        title: 'جابه‌جایی مصرف از ساعات اوج (۱۲–۲۳) به شب',
        detail: `${Math.round(peakShare * 100)}٪ مصرف شما در ساعات اوج است. ماشین لباسشویی/ظرفشویی، اتو و شارژرها را به ساعات ۲۳ تا ۷ منتقل کنید.`,
        saveRialsPerPeriod: save,
      });
    }
  }

  // R4 — نرخ مؤثر بالا → ممیزی لوازم
  if (ctx.effectiveRateRials > 2 * supplyCostRials) {
    recs.push({
      id: 'R4',
      title: 'ممیزی لوازم پرمصرف',
      detail:
        'نرخ مؤثر هر کیلووات‌ساعت شما بیش از ۲ برابر هزینه تأمین است. یخچال قدیمی، کولر گازی بدون سرویس و آبگرمکن برقی را بررسی کنید؛ تعویض یخچال فرسوده با رده A تا ۳۰٪ مصرف سرمایش/برودت را کم می‌کند.',
    });
  }

  // R5 — دوره بلند
  if ((bill.periodDays ?? 0) > 45) {
    recs.push({
      id: 'R5',
      title: 'درخواست قرائت منظم / کنتور هوشمند',
      detail: `دوره این قبض ${faNumber(bill.periodDays ?? 0)} روز است. دوره‌های بلند باعث پرش پله و محاسبه با نرخ بالاتر می‌شوند؛ قرائت ماهانه یا کنتور هوشمند درخواست کنید.`,
    });
  }

  // R6 — پاداش کم‌باری
  if (ctx.patternStatus === 'under' && bill.tou?.low && bill.consumptionKwh) {
    const lowShare = bill.tou.low / bill.consumptionKwh;
    if (lowShare > 0.3) {
      recs.push({
        id: 'R6',
        title: 'درخواست کنتور سه‌زمانه برای پاداش کم‌باری',
        detail:
          'سهم مصرف کم‌باری شما بالاست؛ با کنتور سه‌زمانه بابت این الگو پاداش دریافت می‌کنید.',
        saveRialsPerPeriod: Math.round(bill.tou.low * 0.073 * supplyCostRials),
      });
    }
  }

  // R3 — سرمایش (توصیه عمومی)
  recs.push({
    id: 'R3',
    title: 'بهینه‌سازی سرمایش',
    detail:
      'سرویس سالانه کولر، تعویض پوشال/پد سلولزی، سایه‌بان روی کولر و پنجره دوجداره در مجموع ۸ تا ۱۵٪ مصرف دوره گرم را کاهش می‌دهد.',
  });

  // R7 — همیشه
  recs.push({
    id: 'R7',
    title: 'پاداش صرفه‌جویی «برق امید»',
    detail:
      'با کاهش مصرف نسبت به دوره مشابه پارسال، مشمول پاداش صرفه‌جویی توانیر می‌شوید؛ جزئیات در سامانه «برق من».',
  });

  // مرتب‌سازی: بیشترین صرفه‌جویی اول
  return recs.sort((a, b) => (b.saveRialsPerPeriod ?? 0) - (a.saveRialsPerPeriod ?? 0)).slice(0, 5);
}
