/**
 * لایه ۲ تحلیل — روایت زبانی اختیاری (سند ۰۶ بخش ۲).
 * سازگار با OpenAI Chat Completions. اعداد همیشه از موتور قطعی می‌آیند؛
 * LLM فقط توضیح می‌دهد. در هر خطا، بی‌سروصدا غیرفعال می‌شود.
 */

import type { ReportModel } from '../bill/types.ts';

const SYSTEM_PROMPT = `تو کارشناس انرژی و تعرفه برق ایران هستی. فقط بر اساس «داده‌های قطعی» ورودی برای مشترک خانگی تحلیل فارسی بنویس. هیچ عدد جدیدی تولید نکن؛ فقط اعداد داده‌شده را توضیح و مقایسه کن. لحن: محترمانه، ساده، امیدوارکننده. ساختار خروجی:
۱) خلاصه وضعیت (۲ خط)
۲) چرا این مبلغ؟ (توضیح پله‌ها)
۳) سه اقدام عملی اولویت‌دار
۴) جمع‌بندی یک‌خطی
حداکثر ۱۸۰ کلمه. بدون مارک‌داون سنگین؛ فقط متن و ایموجی محدود.`;

export interface LlmConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  timeoutMs: number;
}

function buildPayload(report: ReportModel): string {
  return JSON.stringify({
    consumption_kwh: report.bill.consumptionKwh,
    period_days: report.bill.periodDays,
    monthly_avg_kwh: Math.round(report.monthlyAvgKwh),
    zone: report.zone,
    season: report.season,
    pattern_limit_kwh: report.patternLimitKwh,
    relative_to_pattern: Number(report.relativeToPattern.toFixed(2)),
    tiers: report.tiers.map((t) => ({
      range: `${t.fromKwh}-${t.toKwh ?? '∞'}`,
      kwh: Math.round(t.kwh),
      rate_rials: t.rateRials,
      amount_rials: t.amountRials,
    })),
    effective_rate_rials: Math.round(report.effectiveRateRials),
    supply_cost_rials: report.supplyCostRials,
    computed_energy_rials: report.computedEnergyRials,
    bill_energy_charge_rials: report.bill.energyChargeRials ?? null,
    top_recommendations: report.recommendations.slice(0, 3).map((r) => r.id),
  });
}

/** گاردریل: حذف جملاتی که عدد تازه‌ای (>۴ رقم) خارج از داده ورودی تولید کرده‌اند. */
function guardrail(text: string, allowed: Set<string>): string {
  return text
    .split(/(?<=\.)\s+|(?<=\n)/)
    .filter((sentence) => {
      const nums = sentence.match(/\d{4,}/g) ?? [];
      return nums.every((n) => allowed.has(n));
    })
    .join(' ')
    .trim();
}

export async function llmNarrative(
  report: ReportModel,
  cfg: LlmConfig,
): Promise<string | undefined> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);
    const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: cfg.model,
        temperature: 0.3,
        max_tokens: 700,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildPayload(report) },
        ],
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return undefined;
    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    let text = json.choices?.[0]?.message?.content?.trim();
    if (!text) return undefined;
    // اعداد مجاز = همه ارقام موجود در داده ارسالی
    const allowed = new Set(buildPayload(report).match(/\d{4,}/g) ?? []);
    text = guardrail(text, allowed);
    if (text.split(/\s+/).length > 250) {
      const words = text.split(/\s+/).slice(0, 250);
      text = words.join(' ');
      const cut = text.lastIndexOf('.');
      if (cut > text.length * 0.7) text = text.slice(0, cut + 1);
    }
    return text || undefined;
  } catch {
    return undefined; // fallback خاموش
  }
}
