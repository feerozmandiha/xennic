/**
 * استخراج فیلدهای قبض برق از متن OCR با الگوهای regex فارسی (سند ۰۴ بخش ۳)
 * همراه با امتیاز اطمینان هر فیلد و cross-check سازگاری.
 * این ماژول fallback محلی است؛ مسیر اصلی vision-service است (vision-client.ts).
 */

import { normalizeFa, toNumber } from './normalize.ts';
import type { BillData, ZoneId } from './types.ts';

const BASE_CONF = 0.75;

function firstMatch(text: string, re: RegExp): string | null {
  const m = text.match(re);
  return m && m[1] !== undefined ? m[1] : null;
}

function amountAfter(text: string, labelRe: RegExp): number | null {
  const raw = firstMatch(text, labelRe);
  return toNumber(raw);
}

const ZONE_MAP: Record<string, ZoneId> = {
  '1': 'tropical1',
  '2': 'tropical2',
  '3': 'tropical3',
  '4': 'tropical4',
};

/** استخراج کامل فیلدها از متن خام (پیش از فراخوانی نرمال می‌شود). */
export function extractBillFields(rawText: string): BillData {
  const t = normalizeFa(rawText);
  const bill: BillData = { confidence: {} };
  const conf: Record<string, number> = {};

  const set = (key: keyof BillData, value: unknown, c = BASE_CONF) => {
    if (value === null || value === undefined || value === '') return;
    (bill as Record<string, unknown>)[key] = value;
    conf[key as string] = c;
  };

  // ── شناسه‌ها ────────────────────────────────────────────────
  set('billId', firstMatch(t, /شناسه\s*قبض[:\s.]*\s*(\d{13})/), 0.9);
  set('paymentId', firstMatch(t, /شناسه\s*پرداخت[:\s.]*\s*(\d{13})/), 0.9);
  set('fileNo', firstMatch(t, /شماره\s*پرونده[:\s.]*\s*(\d{4,12})/));
  set('billNumber', firstMatch(t, /شماره\s*قبض[:\s.]*\s*(\d{4,14})/));
  set('customerName', firstMatch(t, /نام\s*مشترک[:\s.]*\s*([^\n]+?)(?:\s{2,}|\n|$)/), 0.7);
  set('address', firstMatch(t, /(?:نشانی|آدرس)[:\s.]*\s*([^\n]+?)(?:\n|$)/), 0.6);
  set('postalCode', firstMatch(t, /کد\s*پستی[:\s.]*\s*(\d{10})/), 0.85);
  set('mobile', firstMatch(t, /(?:تلفن\s*همراه|همراه|موبایل)[:\s.]*\s*(0?9\d{9})/)
    ?? firstMatch(t, /(0?9\d{9})/), 0.65);

  // ── تعرفه و منطقه ───────────────────────────────────────────
  const tariff = firstMatch(
    t,
    /(?:نوع\s*(?:مصرف|اشتراک)|تعرفه)[:\s.]*\s*(خانگی|تجاری|صنعتی|کشاورزی|عمومی|روشنایی)/,
  );
  if (tariff) set('tariffType', tariff === 'روشنایی' ? 'عمومی' : tariff, 0.8);

  const zoneDigit = firstMatch(t, /گرمسیر\s*([1-4])/);
  if (zoneDigit) set('region', ZONE_MAP[zoneDigit], 0.85);
  else if (/منطقه\s*عادی/.test(t)) set('region', 'normal', 0.8);

  // ── دوره و قرائت ────────────────────────────────────────────
  const periodRe =
    /از\s*(1[34]\d\d[\/.\-]\d{1,2}[\/.\-]\d{1,2})\s*تا\s*(1[34]\d\d[\/.\-]\d{1,2}[\/.\-]\d{1,2})/;
  const pm = t.match(periodRe);
  if (pm) {
    set('periodFrom', pm[1].replace(/[\/.]/g, '-'), 0.85);
    set('periodTo', pm[2].replace(/[\/.]/g, '-'), 0.85);
  }
  const days =
    amountAfter(t, /روزهای?\s*(?:دوره|قرائت)[:\s.]*\s*(\d{2,3})/) ??
    amountAfter(t, /(?:دوره|قرائت)[^\n]{0,20}?(\d{2,3})\s*روز/) ??
    amountAfter(t, /^روز[:\s.]*\s*(\d{2,3})(?!\d)/m) ??
    amountAfter(t, /روز[:\s.]+(\d{2,3})(?!\d)/);
  if (days && days >= 10 && days <= 120) set('periodDays', days, 0.8);

  const prev = amountAfter(t, /شاخص\s*قبلی[:\s.]*\s*(\d{1,8})/);
  const cur = amountAfter(t, /شاخص\s*فعلی[:\s.]*\s*(\d{1,8})/);
  if (prev !== null) set('prevReading', prev);
  if (cur !== null) set('curReading', cur);

  const mult = amountAfter(t, /ضریب[:\s.]*\s*(\d{1,3})/);
  if (mult && mult >= 1 && mult <= 1000) set('multiplier', mult, 0.7);

  // ── مصرف (مهم‌ترین فیلد) ─────────────────────────────────────
  let consumption = amountAfter(
    t,
    /(?:مصرف|کارکرد)\s*(?:دوره)?[^\d\n]{0,25}?(\d{1,6})\s*(?:کیلووات|kWh|kwh)/i,
  );
  if (consumption === null) {
    consumption = amountAfter(t, /(?:مصرف|کارکرد)[:\s.]*\s*(\d{1,6})\b/);
  }
  if (consumption !== null && consumption <= 100000) {
    set('consumptionKwh', consumption, 0.8);
  }

  // سه‌زمانه
  const low = amountAfter(t, /کم\s*باری[^\d\n]{0,20}(\d{1,6})/);
  const mid = amountAfter(t, /میان\s*باری[^\d\n]{0,20}(\d{1,6})/);
  const peak = amountAfter(t, /اوج\s*باری?[^\d\n]{0,20}(\d{1,6})/);
  if (low !== null || mid !== null || peak !== null) {
    bill.tou = {
      ...(low !== null ? { low } : {}),
      ...(mid !== null ? { mid } : {}),
      ...(peak !== null ? { peak } : {}),
    };
    conf['tou'] = 0.7;
  }

  const demand = amountAfter(t, /(?:قدرت|دیماند)[^\d\n]{0,15}(\d{1,4})/);
  if (demand && demand <= 1000) set('demandKw', demand, 0.65);
  const amp = amountAfter(t, /آمپراژ[^\d\n]{0,10}(\d{1,3})/);
  if (amp && amp <= 400) set('ampere', amp, 0.65);

  // ── مبالغ (ریال) ─────────────────────────────────────────────
  const energy = amountAfter(t, /بهای\s*انرژی[^\d\n]{0,20}(\d{3,12})/);
  if (energy !== null) set('energyChargeRials', energy, 0.85);
  const note14 = amountAfter(t, /تبصره\s*14[^\d\n]{0,20}(\d{2,12})/);
  if (note14 !== null) set('note14Rials', note14, 0.8);
  const levies = amountAfter(t, /عوارض[^\d\n]{0,25}(\d{3,12})/);
  if (levies !== null) set('leviesRials', levies, 0.75);
  const vat = amountAfter(
    t,
    /(?:مالیات\s*)?ارزش\s*افزوده[^\d\n]{0,20}(\d{3,12})/,
  );
  if (vat !== null) set('vatRials', vat, 0.8);
  const ins = amountAfter(t, /بیمه[^\d\n]{0,15}(\d{3,12})/);
  if (ins !== null) set('insuranceRials', ins, 0.7);
  const sub = amountAfter(
    t,
    /(?:آبونمان|خدمات\s*مشترک)[^\d\n]{0,20}(\d{3,12})/,
  );
  if (sub !== null) set('subscriptionRials', sub, 0.7);
  const total = amountAfter(
    t,
    /(?:مبلغ\s*قابل\s*پرداخت|جمع\s*کل|مبلغ\s*نهایی)[^\d\n]{0,25}(\d{4,14})/,
  );
  if (total !== null) set('totalRials', total, 0.85);

  if (/پرداخت\s*شده/.test(t)) set('paymentStatus', 'paid', 0.8);
  else if (/پرداخت\s*نشده|قابل\s*پرداخت/.test(t)) set('paymentStatus', 'unpaid', 0.8);

  // ── cross-checkها (افزایش/کاهش اطمینان) ──────────────────────
  if (
    bill.consumptionKwh !== undefined &&
    bill.prevReading !== undefined &&
    bill.curReading !== undefined
  ) {
    const diff = (bill.curReading - bill.prevReading) * (bill.multiplier ?? 1);
    if (Math.abs(diff - bill.consumptionKwh) <= Math.max(2, bill.consumptionKwh * 0.02)) {
      conf['consumptionKwh'] = Math.min(0.98, (conf['consumptionKwh'] ?? 0.7) + 0.15);
      conf['prevReading'] = Math.min(0.98, (conf['prevReading'] ?? 0.7) + 0.15);
      conf['curReading'] = Math.min(0.98, (conf['curReading'] ?? 0.7) + 0.15);
    } else {
      conf['consumptionKwh'] = Math.max(0.4, (conf['consumptionKwh'] ?? 0.7) - 0.2);
    }
  }
  if (bill.totalRials && bill.energyChargeRials) {
    const parts =
      bill.energyChargeRials +
      (bill.note14Rials ?? 0) +
      (bill.leviesRials ?? 0) +
      (bill.vatRials ?? 0) +
      (bill.insuranceRials ?? 0) +
      (bill.subscriptionRials ?? 0);
    if (Math.abs(parts - bill.totalRials) <= bill.totalRials * 0.05) {
      conf['totalRials'] = Math.min(0.98, (conf['totalRials'] ?? 0.7) + 0.1);
    }
  }

  // پیش‌فرض‌ها
  if (!bill.region) {
    bill.region = 'normal';
    conf['region'] = 0.5; // نیازمند تأیید کاربر
  }
  if (!bill.tariffType) {
    bill.tariffType = 'خانگی';
    conf['tariffType'] = 0.5;
  }

  bill.confidence = conf;
  return bill;
}

/** آیا فیلد نیازمند تأیید/اصلاح است؟ */
export function needsReview(bill: BillData, key: string): boolean {
  return (bill.confidence?.[key] ?? 0) < 0.7;
}

/** امتیاز اطمینان کلی سند (میانگین فیلدهای کلیدی). */
export function overallConfidence(bill: BillData): number {
  const keys = [
    'billId',
    'consumptionKwh',
    'periodDays',
    'region',
    'energyChargeRials',
    'totalRials',
  ];
  const vals = keys.map((k) => bill.confidence?.[k] ?? 0);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}
