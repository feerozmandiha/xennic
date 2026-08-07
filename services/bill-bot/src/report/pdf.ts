/**
 * تولید فایل گزارش (سند ۰۷ بخش ۱).
 * مسیر اول: pdfmake + فونت فارسی TTF (REPORT_FONT_PATH).
 * مسیر جایگزین: همان HTML خودکفا که کاربر می‌تواند چاپ→PDF کند.
 */

import { readFile } from 'node:fs/promises';
import { buildHtmlReport } from './report-html.ts';
import type { ReportModel } from '../bill/types.ts';

export interface ReportFileResult {
  format: 'pdf' | 'html';
  bytes: Uint8Array;
  filename: string;
}

interface PdfOpts {
  reportId: string;
  brandName: string;
  todayJalali: string;
  fontPath?: string;
  fontName?: string;
}

export async function generateReportFile(
  report: ReportModel,
  opts: PdfOpts,
): Promise<ReportFileResult> {
  const html = buildHtmlReport(report, {
    reportId: opts.reportId,
    brandName: opts.brandName,
    todayJalali: opts.todayJalali,
  });
  const baseName = `گزارش-قبض-${report.bill.billId ?? opts.reportId}-${opts.todayJalali.replaceAll('/', '-')}`;

  if (opts.fontPath) {
    try {
      const pdfBytes = await renderPdfWithPdfmake(report, html, opts);
      if (pdfBytes) {
        return { format: 'pdf', bytes: pdfBytes, filename: `${baseName}.pdf` };
      }
    } catch {
      // fallback به HTML
    }
  }
  return {
    format: 'html',
    bytes: new TextEncoder().encode(html),
    filename: `${baseName}.html`,
  };
}

/**
 * رندر PDF با pdfmake — بارگذاری پویا و اختیاری.
 * نیازمند: npm i pdfmake + فونت TTF فارسی (وزیرمتن).
 */
async function renderPdfWithPdfmake(
  report: ReportModel,
  _html: string,
  opts: PdfOpts,
): Promise<Uint8Array | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfMakeModule: any = await import('pdfmake/build/pdfmake.js').catch(() => null);
  if (!pdfMakeModule) return null;
  const fontBuffer = await readFile(opts.fontPath!).catch(() => null);
  if (!fontBuffer) return null;
  const fontName = opts.fontName ?? 'Vazirmatn';

  const vfs: Record<string, string> = {
    [`${fontName}.ttf`]: Buffer.from(fontBuffer).toString('base64'),
  };
  const printer = new pdfMakeModule.default.createPdfKitDocument()
    ? new pdfMakeModule.default.createPdfKitDocument(
        {
          fonts: { [fontName]: { normal: `${fontName}.ttf` } },
        },
        { virtualfs: vfs },
      )
    : null;
  if (!printer) return null;

  const docDef = {
    defaultStyle: { font: fontName, fontSize: 10 },
    content: buildPdfContent(report, opts),
  };
  return await new Promise<Uint8Array>((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    const stream = printer.createPdfKitDocument(docDef);
    stream.on('data', (c: Uint8Array) => chunks.push(c));
    stream.on('end', () => resolve(Buffer.concat(chunks.map((c) => Buffer.from(c)))));
    stream.on('error', reject);
    stream.end();
  });
}

/** محتوای متنی PDF (فهرست‌وار) — جزئیات کامل در HTML است. */
function buildPdfContent(report: ReportModel, opts: PdfOpts): unknown[] {
  const b = report.bill;
  const lines: unknown[] = [
    { text: '⚡ گزارش تحلیل قبض برق', fontSize: 16, bold: true },
    {
      text: `${opts.brandName} · گزارش ${opts.reportId} · ${opts.todayJalali} · تعرفه ${report.tariffYear}`,
      fontSize: 9,
      margin: [0, 2, 0, 10],
    },
    {
      table: {
        widths: ['35%', '65%'],
        body: [
          ['شناسه قبض', b.billId ?? '—'],
          ['نام مشترک', b.customerName ?? '—'],
          ['دوره', `${b.periodFrom ?? '—'} تا ${b.periodTo ?? '—'} (${b.periodDays ?? '—'} روز)`],
          ['مصرف دوره', `${b.consumptionKwh ?? '—'} کیلووات‌ساعت`],
          ['میانگین ماهانه', `${Math.round(report.monthlyAvgKwh)} کیلووات‌ساعت`],
          ['الگوی مصرف', `${report.patternLimitKwh} کیلووات‌ساعت`],
          ['بهای انرژی (محاسبه)', `${report.computedEnergyRials.toLocaleString()} ریال`],
          ['جمع قبض', b.totalRials ? b.totalRials.toLocaleString() + ' ریال' : '—'],
        ],
      },
    },
    { text: 'پله‌های تعرفه:', bold: true, margin: [0, 10, 0, 4] },
    {
      table: {
        widths: ['25%', '20%', '25%', '30%'],
        body: [
          ['بازه kWh', 'مصرف', 'نرخ ریال', 'مبلغ ریال'],
          ...report.tiers.map((t) => [
            `${t.fromKwh}-${t.toKwh ?? '∞'}`,
            String(Math.round(t.kwh)),
            t.rateRials.toLocaleString(),
            t.amountRials.toLocaleString(),
          ]),
        ],
      },
    },
    {
      text: `وضعیت: ${report.patternStatus === 'under' ? 'زیر الگو ✅' : 'مازاد بر الگو ⚠️'} (${Math.round(report.relativeToPattern * 100)}٪ الگو)`,
      margin: [0, 10, 0, 4],
      bold: true,
    },
    { text: 'توصیه‌ها:', bold: true, margin: [0, 8, 0, 4] },
    ...report.recommendations.map((r, i) => ({
      text: `${i + 1}) ${r.title}${r.saveRialsPerPeriod ? ` (صرفه‌جویی ~${r.saveRialsPerPeriod.toLocaleString()} ریال/دوره)` : ''}`,
      margin: [10, 2, 0, 2],
    })),
    {
      text: 'این گزارش جنبه اطلاع‌رسانی دارد؛ مرجع نهایی صورتحساب رسمی شرکت توزیع است.',
      fontSize: 8,
      margin: [0, 14, 0, 0],
      color: '#666',
    },
  ];
  return lines;
}
