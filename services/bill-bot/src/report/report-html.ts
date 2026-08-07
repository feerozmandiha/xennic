/**
 * قالب HTML/RTL گزارش (سند ۰۷).
 * بدون وابستگی؛ اگر فونت+pdfmake موجود باشد همین ساختار به PDF تبدیل می‌شود،
 * وگرنه همین HTML به‌عنوان گزارش قابل چاپ ارسال می‌شود.
 */

import { faDigits, faNumber } from '../bill/normalize.ts';
import { formatJalali, parseJalali } from '../jalali.ts';
import { STATUS_LABEL } from '../analysis/analyzer.ts';
import type { ReportModel } from '../bill/types.ts';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function faDate(iso?: string): string {
  if (!iso) return '—';
  const j = parseJalali(iso);
  return j ? formatJalali(j) : iso;
}

function row(label: string, value: string, warn = false): string {
  // رشته‌های تماماً عددی (شناسه قبض/کد پستی/…) با ارقام فارسی نمایش داده شوند
  const display = /^\d+$/.test(value) ? faDigits(value) : value;
  return `<tr${warn ? ' class="warn"' : ''}><th>${esc(label)}</th><td>${esc(display)}</td></tr>`;
}

export function buildHtmlReport(
  report: ReportModel,
  meta: { reportId: string; brandName: string; todayJalali: string },
): string {
  const b = report.bill;
  const conf = b.confidence ?? {};

  const billRows = [
    row('شناسه قبض', b.billId ?? '—', (conf['billId'] ?? 1) < 0.7),
    row('شناسه پرداخت', b.paymentId ? `****${b.paymentId.slice(-4)}` : '—'),
    row('شماره پرونده', b.fileNo ?? b.billNumber ?? '—'),
    row('نام مشترک', b.customerName ?? '—'),
    row('نشانی', b.address ?? '—'),
    row('کد پستی', b.postalCode ?? '—'),
    row('نوع تعرفه', b.tariffType ?? '—'),
    row('منطقه', zoneLabel(report.zone)),
    row(
      'دوره قبض',
      `${faDate(b.periodFrom)} تا ${faDate(b.periodTo)}${b.periodDays ? ` (${faNumber(b.periodDays)} روز)` : ''}`,
    ),
    row(
      'شاخص قبلی / فعلی',
      b.prevReading !== undefined && b.curReading !== undefined
        ? `${faNumber(b.prevReading)} / ${faNumber(b.curReading)}`
        : '—',
    ),
    row(
      'مصرف دوره',
      b.consumptionKwh !== undefined ? `${faNumber(b.consumptionKwh)} کیلووات‌ساعت` : '—',
      (conf['consumptionKwh'] ?? 1) < 0.7,
    ),
    row('میانگین ماهانه', `${faNumber(report.monthlyAvgKwh)} کیلووات‌ساعت`),
    row(
      'قدرت / آمپراژ',
      b.demandKw !== undefined || b.ampere !== undefined
        ? `${b.demandKw ? faNumber(b.demandKw) + ' کیلووات' : ''} ${b.ampere ? faNumber(b.ampere) + ' آمپر' : ''}`.trim()
        : '—',
    ),
    ...(b.tou
      ? [
          row(
            'کم‌باری / میان‌باری / اوج‌باری',
            `${faNumber(b.tou.low ?? 0)} / ${faNumber(b.tou.mid ?? 0)} / ${faNumber(b.tou.peak ?? 0)} کیلووات‌ساعت`,
          ),
        ]
      : []),
  ].join('');

  const moneyRows = [
    row(
      'بهای انرژی (روی قبض)',
      b.energyChargeRials !== undefined ? `${faNumber(b.energyChargeRials)} ریال` : '—',
    ),
    row('بهای انرژی (محاسبه ربات)', `${faNumber(report.computedEnergyRials)} ریال`),
    row('تبصره ۱۴', b.note14Rials !== undefined ? `${faNumber(b.note14Rials)} ریال` : '—'),
    row('عوارض', b.leviesRials !== undefined ? `${faNumber(b.leviesRials)} ریال` : '—'),
    row('مالیات بر ارزش افزوده', b.vatRials !== undefined ? `${faNumber(b.vatRials)} ریال` : '—'),
    row(
      'بیمه / آئونمان',
      b.insuranceRials !== undefined || b.subscriptionRials !== undefined
        ? `${faNumber((b.insuranceRials ?? 0) + (b.subscriptionRials ?? 0))} ریال`
        : '—',
    ),
    row('جمع کل قابل پرداخت', b.totalRials !== undefined ? `${faNumber(b.totalRials)} ریال` : '—'),
    row(
      'وضعیت پرداخت',
      b.paymentStatus === 'paid'
        ? 'پرداخت شده ✅'
        : b.paymentStatus === 'unpaid'
          ? 'پرداخت نشده ⏳'
          : '—',
    ),
  ].join('');

  const tierRows = report.tiers
    .map(
      (t) =>
        `<tr><td>${faNumber(t.fromKwh)} تا ${t.toKwh === null ? '∞' : faNumber(t.toKwh)}</td><td>${faNumber(t.kwh)}</td><td>${faNumber(t.rateRials)}</td><td>${faNumber(t.amountRials)}</td></tr>`,
    )
    .join('');

  const recRows = report.recommendations
    .map(
      (r, i) =>
        `<tr><td>${faNumber(i + 1)}</td><td><strong>${esc(r.title)}</strong><br/>${esc(r.detail)}${r.saveRialsPerPeriod ? `<br/><em>صرفه‌جویی تقریبی: ${faNumber(r.saveRialsPerPeriod)} ریال در دوره</em>` : ''}</td></tr>`,
    )
    .join('');

  const warningsHtml = report.warnings.length
    ? `<div class="warnings"><h2>هشدارها</h2><ul>${report.warnings.map((w) => `<li>${esc(w)}</li>`).join('')}</ul></div>`
    : '';

  const narrativeHtml = report.llmNarrative
    ? `<div class="narrative"><h2>🤖 روایت هوشمند</h2><p>${esc(report.llmNarrative)}</p></div>`
    : '';

  return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8"/>
<title>گزارش تحلیل قبض برق — ${esc(meta.reportId)}</title>
<style>
  @page { size: A4; margin: 12mm; }
  body { font-family: '${esc(meta.brandName)}', Vazirmatn, Tahoma, sans-serif; font-size: 11pt; color: #1f2937; }
  h1 { font-size: 15pt; margin: 0 0 4px; }
  h2 { font-size: 12pt; border-bottom: 2px solid #2563eb; padding-bottom: 3px; margin-top: 18px; color: #1d4ed8; }
  .meta { color: #6b7280; font-size: 9pt; margin-bottom: 10px; }
  table { width: 100%; border-collapse: collapse; margin: 6px 0 10px; }
  th, td { border: 1px solid #d1d5db; padding: 4px 8px; text-align: right; }
  th { background: #eff6ff; width: 32%; font-weight: 600; }
  tr.warn td, tr.warn th { background: #fef9c3; }
  .status { font-size: 12pt; font-weight: 700; padding: 8px 12px; border-radius: 8px; background: #f0fdf4; border: 1px solid #86efac; margin: 8px 0; }
  .status.over { background: #fef2f2; border-color: #fca5a5; }
  .warnings li { color: #92400e; }
  .footer { margin-top: 18px; font-size: 8.5pt; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 8px; }
</style>
</head>
<body>
<h1>⚡ گزارش تحلیل قبض برق</h1>
<div class="meta">${esc(meta.brandName)} · شماره گزارش ${esc(meta.reportId)} · تاریخ: ${esc(meta.todayJalali)} · مبتنی بر تعرفه ${faNumber(report.tariffYear)} توانیر (هزینه تأمین: ${faNumber(report.supplyCostRials)} ریال/kWh)</div>

<h2>۱. اطلاعات قبض</h2>
<table>${billRows}</table>

<h2>۲. صورت‌حساب</h2>
<table>${moneyRows}</table>

<h2>۳. محاسبه پلکانی (${esc(report.tiers.length > 0 ? profileTitle(report) : '')})</h2>
<table>
<tr><th>بازه (kWh)</th><th>مصرف</th><th>نرخ (ریال/kWh)</th><th>مبلغ (ریال)</th></tr>
${tierRows}
<tr><th colspan="3">جمع بهای انرژی</th><th>${faNumber(report.computedEnergyRials)}</th></tr>
</table>

<h2>۴. تحلیل</h2>
<div class="status ${report.patternStatus === 'under' ? '' : 'over'}">
وضعیت نسبت به الگو: ${esc(STATUS_LABEL[report.patternStatus])} —
میانگین ${faNumber(report.monthlyAvgKwh)} از ${faNumber(report.patternLimitKwh)} کیلووات‌ساعت
(${faNumber(report.relativeToPattern * 100)}٪ الگو) ·
نرخ مؤثر: ${faNumber(report.effectiveRateRials)} ریال/kWh
${report.peakSurchargeRials ? ` · برآورد جریمه اوج‌بار: ${faNumber(report.peakSurchargeRials)} ریال` : ''}
${report.offpeakDiscountRials ? ` · پاداش کم‌باری: ${faNumber(report.offpeakDiscountRials)} ریال` : ''}
</div>
${warningsHtml}
${narrativeHtml}

<h2>۵. توصیه‌های بهینه‌سازی</h2>
<table><tr><th>#</th><th>توصیه</th></tr>${recRows}</table>

<div class="footer">
این گزارش بر اساس اطلاعات استخراج‌شده از تصویر/PDF قبض و تعرفه رسمی ${faNumber(report.tariffYear)} تهیه شده و جنبه اطلاع‌رسانی دارد؛ مرجع نهایی، صورتحساب رسمی شرکت توزیع برق استان است.
</div>
</body>
</html>`;
}

export function zoneLabel(z: ReportModel['zone']): string {
  switch (z) {
    case 'normal':
      return 'عادی';
    case 'tropical1':
      return 'گرمسیر ۱';
    case 'tropical2':
      return 'گرمسیر ۲';
    case 'tropical3':
      return 'گرمسیر ۳';
    case 'tropical4':
      return 'گرمسیر ۴';
    default:
      return z;
  }
}

function profileTitle(report: ReportModel): string {
  return report.season === 'hot' ? 'ماه‌های گرم' : 'ماه‌های غیرگرم';
}
