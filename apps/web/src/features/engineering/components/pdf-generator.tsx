'use client';

import { Document, Page, View, Text, StyleSheet, pdf } from '@react-pdf/renderer';
import type { ReportData } from './pdf-report';

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

function formatValue(key: string, val: any, units: Record<string, string>): string {
  if (val === null || val === undefined || val === 'undefined') return '-';
  if (typeof val === 'boolean') return val ? 'بله' : 'خیر';
  if (typeof val === 'number') {
    if (!isFinite(val)) return '-';
    return val.toFixed(4);
  }
  if (typeof val === 'object') {
    try {
      return JSON.stringify(val);
    } catch {
      return '[Object]';
    }
  }
  const unit = units[key] ?? '';
  return `${String(val)}${unit ? ` ${unit}` : ''}`;
}

// ── ثبت فونت ──────────────────────────────────────────────────────────────────
let fontRegistered = false;

async function registerFonts() {
  if (fontRegistered) return;
  try {
    const { Font } = await import('@react-pdf/renderer');
    Font.register({
      family: 'IRANSansX',
      fonts: [
        { src: '/fonts/iran-sans/IRANSansXFaNum-Regular.woff2', fontWeight: 400 },
        { src: '/fonts/iran-sans/IRANSansXFaNum-Bold.woff2', fontWeight: 700 },
      ],
    });
    Font.registerHyphenationCallback((word: string) => [word]);
    fontRegistered = true;
  } catch {
    fontRegistered = true;
  }
}

// ── ایجاد استایل ──────────────────────────────────────────────────────────────
function createStyles() {
  return StyleSheet.create({
    page: {
      padding: 40,
      fontFamily: 'IRANSansX',
      fontSize: 9,
      textAlign: 'right',
      color: colors.foreground,
      backgroundColor: '#ffffff',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: 12,
      borderBottom: `1pt solid ${colors.border}`,
      marginBottom: 16,
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: 700,
      color: colors.primary,
    },
    headerMeta: {
      fontSize: 8,
      color: colors.muted,
      textAlign: 'left',
    },
    section: {
      marginBottom: 14,
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: 700,
      color: colors.accent,
      paddingBottom: 4,
      borderBottom: `0.5pt solid ${colors.accent}`,
      marginBottom: 8,
    },
    row: {
      flexDirection: 'row',
      paddingVertical: 3,
      borderBottom: `0.5pt solid ${colors.border}`,
    },
    label: {
      width: '40%',
      fontSize: 8,
      color: colors.muted,
    },
    value: {
      width: '60%',
      fontSize: 8,
      fontWeight: 700,
    },
    table: {
      borderWidth: 0.5,
      borderColor: colors.border,
      borderRadius: 4,
      overflow: 'hidden',
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: colors.primary,
      paddingVertical: 4,
      paddingHorizontal: 6,
    },
    tableHeaderCell: {
      fontSize: 7,
      fontWeight: 700,
      color: '#ffffff',
    },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: 3,
      paddingHorizontal: 6,
      borderBottom: `0.5pt solid ${colors.border}`,
    },
    tableCell: {
      fontSize: 7,
    },
    warningBox: {
      backgroundColor: '#fef3c7',
      border: `0.5pt solid ${colors.warning}`,
      borderRadius: 4,
      padding: 8,
      marginBottom: 8,
    },
    warningText: {
      fontSize: 8,
      color: '#92400e',
    },
    noteBox: {
      backgroundColor: '#f0f9ff',
      border: `0.5pt solid ${colors.accent}`,
      borderRadius: 4,
      padding: 8,
      marginBottom: 8,
    },
    noteText: {
      fontSize: 8,
      color: '#1e40af',
    },
    footer: {
      position: 'absolute',
      bottom: 20,
      left: 40,
      right: 40,
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderTop: `0.5pt solid ${colors.border}`,
      paddingTop: 6,
      fontSize: 7,
      color: colors.muted,
    },
  });
}

// ── تابع اصلی دانلود PDF ────────────────────────────────────────────────────
export async function downloadPDF(data: ReportData): Promise<void> {
  try {
    await registerFonts();
    const styles = createStyles();

    const now = new Date().toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const inputEntries = Object.entries(data.inputs || {}).filter(
      ([, v]) => v !== null && v !== undefined && typeof v !== 'object'
    );
    const resultEntries = Object.entries(data.results || {}).filter(
      ([k, v]) => v !== null && v !== undefined && typeof v !== 'object' && !k.startsWith('_')
    );

    // ── ایجاد Document ──────────────────────────────────────────────────────
    const Doc = () => (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Xennic Engineering Report</Text>
              <Text style={{ fontSize: 7, color: colors.muted, marginTop: 2 }}>
                گزارش محاسبات مهندسی
              </Text>
            </View>
            <View style={styles.headerMeta}>
              <Text>{data.calculationCode || 'N/A'}</Text>
              <Text>{data.timestamp || now}</Text>
            </View>
          </View>

          {/* Specification */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>مشخصات محاسبه</Text>
            <View style={styles.row}>
              <Text style={styles.label}>نوع محاسبه</Text>
              <Text style={styles.value}>{data.calculationName || 'نامشخص'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>استاندارد</Text>
              <Text style={styles.value}>{data.standard || 'نامشخص'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>ورژن موتور</Text>
              <Text style={styles.value}>{data.engineVersion || 'نامشخص'}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>تاریخ</Text>
              <Text style={styles.value}>{now}</Text>
            </View>
          </View>

          {/* Inputs */}
          {inputEntries.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>پارامترهای ورودی</Text>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, { width: '50%' }]}>پارامتر</Text>
                  <Text style={[styles.tableHeaderCell, { width: '50%' }]}>مقدار</Text>
                </View>
                {inputEntries.map(([key, val]) => (
                  <View key={key} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { width: '50%', color: colors.muted }]}>
                      {data.fieldLabels?.[key] ?? key}
                    </Text>
                    <Text style={[styles.tableCell, { width: '50%', fontWeight: 700 }]}>
                      {formatValue(key, val, data.units || {})}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Results */}
          {resultEntries.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>نتایج محاسبه</Text>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, { width: '50%' }]}>پارامتر</Text>
                  <Text style={[styles.tableHeaderCell, { width: '50%' }]}>مقدار</Text>
                </View>
                {resultEntries.map(([key, val]) => (
                  <View key={key} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { width: '50%', color: colors.muted }]}>
                      {data.fieldLabels?.[key] ?? key}
                    </Text>
                    <Text style={[styles.tableCell, { width: '50%', fontWeight: 700, color: colors.success }]}>
                      {formatValue(key, val, data.units || {})}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Warnings */}
          {data.warnings && data.warnings.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.warning }]}>هشدارها</Text>
              <View style={styles.warningBox}>
                {data.warnings.map((w, i) => (
                  <Text key={i} style={styles.warningText}>{i + 1}. {w}</Text>
                ))}
              </View>
            </View>
          )}

          {/* Recommendations */}
          {data.recommendations && data.recommendations.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.accent }]}>توصیه‌ها</Text>
              <View style={styles.noteBox}>
                {data.recommendations.map((r, i) => (
                  <Text key={i} style={styles.noteText}>{i + 1}. {r}</Text>
                ))}
              </View>
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer} fixed>
            <Text>Xennic Engineering Platform v{data.engineVersion || '1.0'}</Text>
            <Text render={({ pageNumber, totalPages }: any) => `${pageNumber} / ${totalPages}`} />
          </View>
        </Page>
      </Document>
    );

    const blob = await pdf(<Doc />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xennic-report-${data.calculationCode || 'calc'}-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('PDF Download Error:', error);
    alert('خطا در تولید PDF. لطفاً دوباره تلاش کنید.');
  }
}

// ── کامپوننت برای dynamic import ────────────────────────────────────────────
export function PDFGenerator({ data }: { data: ReportData }) {
  return null; // این کامپوننت فقط برای dynamic import استفاده می‌شود
}