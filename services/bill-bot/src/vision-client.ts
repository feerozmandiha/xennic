/**
 * کلاینت vision-service ریپازیتوری Xennic (مسیر اصلی OCR/استخراج — سند ۰۳ بخش ۴).
 * POST {VISION_SERVICE_URL}/vision/bill/read  →  VisionResponse{success, confidence, data}
 * خروجی به BillData ربات نگاشت می‌شود.
 */

import type { BillData } from './bill/types.ts';

interface VisionResponse {
  success: boolean;
  confidence: number;
  warnings: string[];
  errors: string[];
  data: Record<string, unknown>;
}

export interface VisionReadResult {
  bill: BillData;
  confidence: number;
  warnings: string[];
}

/** نگاشت اسکیمای BillData سرویس بینایی → مدل ربات. */
export function mapVisionData(data: Record<string, unknown>): BillData {
  const extra = (data['extra_fields'] ?? {}) as Record<string, string>;
  const bill: BillData = {};
  const s = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
  const n = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);

  bill.billId = s(data['customer_id']) ?? s(extra['bill_id']);
  bill.billNumber = s(data['bill_number']);
  bill.customerName = s(data['customer_name']);
  bill.address = s(data['address']);
  bill.periodFrom = undefined;
  bill.prevReading = n(data['previous_reading_kwh']);
  bill.curReading = n(data['current_reading_kwh']);
  bill.consumptionKwh = n(data['consumption_kwh']);
  bill.energyChargeRials = n(data['energy_charge']);
  bill.vatRials = n(data['tax']);
  bill.totalRials = n(data['total_amount']);
  bill.paymentStatus = s(data['payment_status']);
  if (extra['payment_id']) bill.paymentId = extra['payment_id'];
  if (extra['period_from']) bill.periodFrom = extra['period_from'];
  if (extra['period_to']) bill.periodTo = extra['period_to'];
  if (extra['period_days']) bill.periodDays = Number(extra['period_days']) || undefined;
  if (extra['region']) bill.region = extra['region'] as BillData['region'];
  if (extra['raw_text']) bill.rawText = extra['raw_text'];

  // line_items → شناسایی ردیف‌های مالی رایج
  const items = Array.isArray(data['line_items'])
    ? (data['line_items'] as { description?: string; amount?: number }[])
    : [];
  for (const it of items) {
    const d = it.description ?? '';
    if (/تبصره\s*۱۴|تبصره\s*14/.test(d) && typeof it.amount === 'number') {
      bill.note14Rials = it.amount;
    } else if (/عوارض/.test(d) && typeof it.amount === 'number') {
      bill.leviesRials = (bill.leviesRials ?? 0) + it.amount;
    } else if (/بیمه/.test(d) && typeof it.amount === 'number') {
      bill.insuranceRials = it.amount;
    }
  }
  return bill;
}

/** فراخوانی endpoint استخراج قبض. در هر خطا null برمی‌گرداند تا fallback فعال شود. */
export async function readBillViaVision(
  baseUrl: string,
  fileBytes: Uint8Array,
  filename: string,
): Promise<VisionReadResult | null> {
  try {
    const form = new FormData();
    form.append('file', new Blob([fileBytes]), filename);
    form.append('mode', 'read');
    const res = await fetch(`${baseUrl}/vision/bill/read`, {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as VisionResponse;
    if (!json.success) {
      return {
        bill: mapVisionData(json.data ?? {}),
        confidence: json.confidence,
        warnings: [...(json.warnings ?? []), ...(json.errors ?? [])],
      };
    }
    return {
      bill: mapVisionData(json.data ?? {}),
      confidence: json.confidence,
      warnings: json.warnings ?? [],
    };
  } catch {
    return null;
  }
}

/** ادغام نتیجه vision با استخراج محلی (محلی، جاهای خالی را پر می‌کند). */
export function mergeBills(primary: BillData, fallback: BillData): BillData {
  const merged: BillData = { ...fallback };
  for (const [k, v] of Object.entries(primary)) {
    if (v !== undefined && v !== null && v !== '') {
      (merged as Record<string, unknown>)[k] = v;
      if (merged.confidence && primary.confidence?.[k] !== undefined) {
        merged.confidence[k] = Math.max(merged.confidence[k] ?? 0, primary.confidence[k]);
      }
    }
  }
  merged.confidence = { ...fallback.confidence, ...primary.confidence, ...merged.confidence };
  return merged;
}
