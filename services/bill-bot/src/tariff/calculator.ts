/**
 * ماشین‌حساب پلکانی تعرفه (سند ۰۵).
 * rate = factor × applyCoeff × C ؛ amount = round(kwh × rate)
 */

import type { Season, TierResult, ZoneId } from '../bill/types.ts';
import { OVER_PATTERN, PATTERN_LIMITS, WITHIN_PATTERN, peakZoneFactor } from './tavanir1405.ts';
import type { TariffProfile } from './tavanir1405.ts';

export interface ProfileSelection {
  zone: ZoneId;
  season: Season;
  /** میانگین مصرف ماهانه (kWh) — مبنای انتخاب جدول مازاد بر الگو */
  monthlyAvgKwh: number;
  /**
   * آیا مصرف از الگو عبور کرده است؟ اگر مشخص نباشد، از مقایسه میانگین با
   * الگو نتیجه گرفته می‌شود. جداول انتقالی (مانند P1) فقط وقتی فعال‌اند که
   * عبور از الگو محرز باشد اما میانگین هنوز در کران جدول بماند.
   */
  overPattern?: boolean;
  /** برای گرمسیر۱: ماه شروع دوره (تشخیص فروردین–شهریور در برابر مهر–آذر) */
  startMonth?: number;
}

/** انتخاب پروفایل تعرفه مطابق الگوریتم سند ۰۵ بخش ۷. */
export function selectProfile(sel: ProfileSelection): TariffProfile {
  const { zone, season, monthlyAvgKwh } = sel;
  const pattern = PATTERN_LIMITS[zone][season];
  const overPattern = sel.overPattern ?? monthlyAvgKwh > pattern;

  if (!overPattern) {
    return WITHIN_PATTERN[zone][season];
  }

  // ── مازاد بر الگو ────────────────────────────────────────────
  if (zone === 'normal') {
    if (season === 'hot') return OVER_PATTERN['P3-NORMAL-HOT-300+'];
    return monthlyAvgKwh <= 300
      ? OVER_PATTERN['P1-NORMAL-COOL-200-300']
      : OVER_PATTERN['P2-NORMAL-COOL-300+'];
  }
  if (zone === 'tropical1') {
    if (season === 'hot') {
      return monthlyAvgKwh <= 3000
        ? OVER_PATTERN['P7-T1-HOT-2500-3000']
        : OVER_PATTERN['P8-T1-HOT-3000+'];
    }
    // مهر تا آذر
    return monthlyAvgKwh <= 2500
      ? OVER_PATTERN['P9-T1-AUTUMN-2000-2500']
      : OVER_PATTERN['P10-T1-AUTUMN-2500+'];
  }
  if (zone === 'tropical2') {
    if (season === 'hot') return OVER_PATTERN['P6-T2-HOT'];
    return monthlyAvgKwh <= 300
      ? OVER_PATTERN['P1-NORMAL-COOL-200-300']
      : OVER_PATTERN['P2-NORMAL-COOL-300+'];
  }
  if (zone === 'tropical3') {
    if (season === 'hot') return OVER_PATTERN['P5-T3-HOT'];
    return monthlyAvgKwh <= 300
      ? OVER_PATTERN['P1-NORMAL-COOL-200-300']
      : OVER_PATTERN['P2-NORMAL-COOL-300+'];
  }
  // tropical4
  if (season === 'hot') return OVER_PATTERN['P4-T4-HOT'];
  return monthlyAvgKwh <= 300
    ? OVER_PATTERN['P1-NORMAL-COOL-200-300']
    : OVER_PATTERN['P2-NORMAL-COOL-300+'];
}

export interface TieredEnergyResult {
  profile: TariffProfile;
  tiers: TierResult[];
  totalRials: number;
}

/**
 * محاسبه پلکانی بهای انرژی برای «کل دوره».
 * توجه: جداول تعرفه ماهانه‌اند؛ برای دوره‌های چند‌ماهه، مصرف دوره مستقیماً
 * در پله‌های «مجموع دوره» اعمال می‌شود (رویه رایج صورت‌حساب‌های دومرحله‌ای
 * با میانگین ماهانه — انتخاب پروفایل از روی میانگین انجام شده است).
 */
export function computeTieredEnergy(
  consumptionKwh: number,
  profile: TariffProfile,
  supplyCostRials: number,
): TieredEnergyResult {
  const tiers: TierResult[] = [];
  let remaining = consumptionKwh;
  let from = 0;
  for (const tier of profile.tiers) {
    if (remaining <= 0) break;
    const upper = tier.uptoKwh ?? Number.POSITIVE_INFINITY;
    const width = upper - from;
    const kwh = Math.min(remaining, width);
    const applyCoeff = tier.applyCoeff ?? 1;
    const rate = tier.factor * applyCoeff * supplyCostRials;
    tiers.push({
      fromKwh: from,
      toKwh: tier.uptoKwh,
      kwh,
      factor: tier.factor,
      applyCoeff,
      rateRials: Math.round(rate),
      amountRials: Math.round(kwh * rate),
    });
    remaining -= kwh;
    from = upper;
  }
  return {
    profile,
    tiers,
    totalRials: tiers.reduce((s, t) => s + t.amountRials, 0),
  };
}

/**
 * جریمه مصرف در ساعات اوج‌بار (سند ۰۵ بخش ۶).
 * پرمصرف: 0.305×C ؛ طبق الگو: 0.146×C — با ضریب منطقه گرمسیر.
 */
export function peakSurcharge(
  peakKwh: number,
  overPattern: boolean,
  zone: ZoneId,
  season: Season,
  supplyCostRials: number,
): number {
  const coeff = overPattern ? 0.305 : 0.146;
  const zf = peakZoneFactor(zone, season);
  return Math.round(peakKwh * coeff * supplyCostRials * zf);
}

/** پاداش مصرف خارج از اوج — کنتور سه‌زمانه (کم‌باری) */
export function offpeakDiscount3(
  lowKwh: number,
  overPattern: boolean,
  zone: ZoneId,
  season: Season,
  supplyCostRials: number,
): number {
  const coeff = overPattern ? 0.1525 : 0.073;
  const zf = peakZoneFactor(zone, season);
  return Math.round(lowKwh * coeff * supplyCostRials * zf);
}

/** پاداش کنتور دو‌زمانه (غیراوج) */
export function offpeakDiscount2(
  offpeakKwh: number,
  overPattern: boolean,
  zone: ZoneId,
  season: Season,
  supplyCostRials: number,
): number {
  const coeff = overPattern ? 0.061 : 0.0292;
  const zf = peakZoneFactor(zone, season);
  return Math.round(offpeakKwh * coeff * supplyCostRials * zf);
}
