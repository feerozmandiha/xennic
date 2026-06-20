'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ArabicReshaper from 'arabic-reshaper';

export interface ReportData {
  title: string;
  calculationCode: string;
  calculationName: string;
  standard: string;
  engineVersion: string;
  timestamp: string;
  inputs: Record<string, any>;
  results: Record<string, any>;
  units: Record<string, string>;
  warnings?: string[];
  recommendations?: string[];
  fieldLabels?: Record<string, string>;
  chartImages?: string[];
}

const colors = {
  primary: '#1e40af',
  accent: '#2563eb',
  success: '#16a34a',
  warning: '#ca8a04',
  danger: '#dc2626',
  border: '#e2e8f0',
  muted: '#64748b',
  foreground: '#1e293b',
};

const fa = (s: string): string => ArabicReshaper.convertArabic(s);

function formatValue(key: string, val: any, units: Record<string, string>): string {
  if (val === null || val === undefined || val === 'undefined') return fa('-');
  if (typeof val === 'boolean') return val ? fa('بله') : fa('خیر');
  if (typeof val === 'number') {
    if (!isFinite(val)) return fa('-');
    return val.toFixed(4);
  }
  if (typeof val === 'object') {
    try {
      return JSON.stringify(val);
    } catch {
      return fa('[Object]');
    }
  }
  const unit = units[key] ?? '';
  return `${String(val)}${unit ? ` ${unit}` : ''}`;
}

let fontData: { regular: string; bold: string } | null = null;

function toBase64(buf: Uint8Array): string {
  let binary = '';
  const chunk = 8192;
  for (let i = 0; i < buf.length; i += chunk) {
    binary += String.fromCharCode(...buf.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function loadFontData(): Promise<{ regular: string; bold: string }> {
  if (!fontData) {
    const [regularRes, boldRes] = await Promise.all([
      fetch('/fonts/noto/NotoSansArabic-Regular.ttf'),
      fetch('/fonts/noto/NotoSansArabic-Bold.ttf'),
    ]);
    const [regularBuf, boldBuf] = await Promise.all([
      regularRes.arrayBuffer(),
      boldRes.arrayBuffer(),
    ]);
    fontData = {
      regular: toBase64(new Uint8Array(regularBuf)),
      bold: toBase64(new Uint8Array(boldBuf)),
    };
  }
  return fontData;
}

function ensureFont(doc: jsPDF): Promise<void> {
  return (async () => {
    try {
      const data = await loadFontData();
      doc.addFileToVFS('NotoSansArabic-Regular.ttf', data.regular);
      doc.addFileToVFS('NotoSansArabic-Bold.ttf', data.bold);
      doc.addFont('NotoSansArabic-Regular.ttf', 'NotoSansArabic', 'normal');
      doc.addFont('NotoSansArabic-Bold.ttf', 'NotoSansArabic', 'bold');
    } catch {
      // fallback to helvetica if font fails to load
    }
  })();
}

export async function downloadPdfReport(data: ReportData): Promise<void> {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 20;

    await ensureFont(doc);

    function usePersianFont(style: 'normal' | 'bold' = 'normal') {
      try { doc.setFont('NotoSansArabic', style); } catch { doc.setFont('helvetica', style); }
    }

    function useLatinFont(style: 'normal' | 'bold' = 'normal') {
      doc.setFont('helvetica', style);
    }

    function addLine(offset: number = 3) {
      y += offset;
      doc.setDrawColor(colors.border);
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;
    }

    function addTable(title: string, headers: string[], rows: string[][]) {
      if (y > 240) {
        doc.addPage();
        y = 20;
      }

      usePersianFont('bold');
      doc.setFontSize(11);
      doc.setTextColor(colors.accent);
      doc.text(fa(title), pageWidth - margin, y, { align: 'right' });
      y += 7;

      autoTable(doc, {
        startY: y,
        head: [headers.map(h => fa(h))],
        body: rows.map(r => r.map(c => fa(c))),
        headStyles: {
          fillColor: colors.primary,
          textColor: '#ffffff',
          fontStyle: 'bold',
          halign: 'center',
        },
        bodyStyles: {
          halign: 'center',
        },
        columnStyles: {
          0: { halign: 'right' },
          1: { halign: 'left' },
        },
        margin: { left: margin, right: margin },
        styles: {
          fontSize: 8,
          cellPadding: 3,
          font: 'NotoSansArabic',
        },
        tableWidth: pageWidth - margin * 2,
        // @ts-expect-error willReadFrequently not in UserOptions type but supported at runtime
        willReadFrequently: true,
        didParseCell: (data: any) => {
          if (data.section === 'body') {
            const text = data.cell.raw || '';
            const hasArabic = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
            data.cell.styles.font = hasArabic ? 'NotoSansArabic' : 'helvetica';
          }
        },
      });

      y = (doc as any).lastAutoTable.finalY + 8;
    }

    // ── Header ─────────────────────────────────────────────────────────────
    useLatinFont('bold');
    doc.setFontSize(18);
    doc.setTextColor(colors.primary);
    doc.text('Xennic Engineering Report', pageWidth - margin, y, { align: 'right' });
    y += 8;

    usePersianFont('normal');
    doc.setFontSize(9);
    doc.setTextColor(colors.muted);
    doc.text(fa('گزارش محاسبات مهندسی'), pageWidth - margin, y, { align: 'right' });
    y += 5;

    doc.text(
      fa(`شماره: ${data.calculationCode || 'N/A'}  |  تاریخ: ${new Date().toLocaleDateString('fa-IR')}`),
      pageWidth - margin,
      y,
      { align: 'right' }
    );
    y += 10;

    addLine(5);

    // ── Specification ───────────────────────────────────────────────────────
    usePersianFont('bold');
    doc.setFontSize(12);
    doc.setTextColor(colors.accent);
    doc.text(fa('مشخصات محاسبه'), pageWidth - margin, y, { align: 'right' });
    y += 7;

    const specRows = [
      [fa('نوع محاسبه'), fa(data.calculationName || 'نامشخص')],
      [fa('استاندارد'), fa(data.standard || 'نامشخص')],
      [fa('ورژن موتور'), fa(data.engineVersion || 'نامشخص')],
    ];

    for (const [label, value] of specRows) {
      usePersianFont('normal');
      doc.setFontSize(9);
      doc.setTextColor(colors.muted);
      doc.text(label, pageWidth - margin, y, { align: 'right' });
      usePersianFont('bold');
      doc.setTextColor(colors.foreground);
      doc.text(value, pageWidth - margin - 80, y, { align: 'right' });
      y += 6;
    }

    y += 4;
    addLine(5);

    // ── Inputs ──────────────────────────────────────────────────────────────
    const inputEntries = Object.entries(data.inputs || {}).filter(
      ([, v]) => v !== null && v !== undefined && typeof v !== 'object'
    );

    if (inputEntries.length > 0) {
      const headers = [fa('پارامتر'), fa('مقدار')];
      const rows = inputEntries.map(([key, val]) => [
        fa(data.fieldLabels?.[key] ?? key),
        formatValue(key, val, data.units || {}),
      ]);
      addTable('پارامترهای ورودی', headers, rows);
    }

    // ── Results ─────────────────────────────────────────────────────────────
    const resultEntries = Object.entries(data.results || {}).filter(
      ([k, v]) => v !== null && v !== undefined && typeof v !== 'object' && !k.startsWith('_')
    );

    if (resultEntries.length > 0) {
      const headers = [fa('پارامتر'), fa('مقدار')];
      const rows = resultEntries.map(([key, val]) => [
        fa(data.fieldLabels?.[key] ?? key),
        formatValue(key, val, data.units || {}),
      ]);
      addTable('نتایج محاسبه', headers, rows);
    }

    // ── Warnings ─────────────────────────────────────────────────────────────
    if (data.warnings && data.warnings.length > 0) {
      if (y > 230) {
        doc.addPage();
        y = 20;
      }

      usePersianFont('bold');
      doc.setFontSize(11);
      doc.setTextColor(colors.warning);
      doc.text(fa('هشدارها'), pageWidth - margin, y, { align: 'right' });
      y += 7;

      usePersianFont('normal');
      doc.setFontSize(9);
      doc.setTextColor('#92400e');
      for (const w of data.warnings) {
        doc.text(fa(`• ${w}`), pageWidth - margin, y, { align: 'right' });
        y += 6;
      }
      y += 4;
    }

    // ── Recommendations ─────────────────────────────────────────────────────
    if (data.recommendations && data.recommendations.length > 0) {
      if (y > 230) {
        doc.addPage();
        y = 20;
      }

      usePersianFont('bold');
      doc.setFontSize(11);
      doc.setTextColor(colors.accent);
      doc.text(fa('توصیه‌ها'), pageWidth - margin, y, { align: 'right' });
      y += 7;

      usePersianFont('normal');
      doc.setFontSize(9);
      doc.setTextColor('#1e40af');
      for (const r of data.recommendations) {
        doc.text(fa(`• ${r}`), pageWidth - margin, y, { align: 'right' });
        y += 6;
      }
      y += 4;
    }

    // ── Charts ────────────────────────────────────────────────────────────────
    if (data.chartImages && data.chartImages.length > 0) {
      const maxChartWidth = pageWidth - margin * 2;
      const maxChartHeight = 80;

      for (const imgData of data.chartImages) {
        if (y > 200) {
          doc.addPage();
          y = 20;
        }

        try {
          const imgProps = doc.getImageProperties(imgData);
          const ratio = imgProps.width / imgProps.height;
          let w = maxChartWidth;
          let h = w / ratio;
          if (h > maxChartHeight) {
            h = maxChartHeight;
            w = h * ratio;
          }

          doc.addImage(imgData, 'PNG', margin, y, w, h);
          y += h + 6;
        } catch {
          // skip corrupt image
        }
      }
    }

    // ── Footer ──────────────────────────────────────────────────────────────
    const pageCount = doc.internal.pages.length;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const footerY = doc.internal.pageSize.getHeight() - 15;

      useLatinFont('normal');
      doc.setFontSize(7);
      doc.setTextColor(colors.muted);
      doc.text(`Xennic Engineering Platform v${data.engineVersion || '1.0'}`, margin, footerY);

      usePersianFont('normal');
      doc.setFontSize(7);
      doc.text(fa(`صفحه ${i} از ${pageCount}`), pageWidth - margin, footerY, { align: 'right' });
    }

    // ── Save ────────────────────────────────────────────────────────────────
    doc.save(`xennic-report-${data.calculationCode || 'calc'}-${Date.now()}.pdf`);

  } catch (error) {
    console.error('PDF Download Error:', error);
    alert('خطا در تولید PDF. لطفاً دوباره تلاش کنید.');
  }
}