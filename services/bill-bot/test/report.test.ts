import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeBill } from '../src/analysis/analyzer.ts';
import { buildHtmlReport } from '../src/report/report-html.ts';
import { formatAnalysis, formatBillTable } from '../src/bot/flow.ts';

const report = analyzeBill({
  tariffType: 'خانگی',
  region: 'normal',
  billId: '1117540601023',
  customerName: 'محمد رضایی',
  consumptionKwh: 265,
  periodDays: 30,
  periodFrom: '1405-01-05',
  periodTo: '1405-02-04',
  energyChargeRials: 733389,
  totalRials: 900000,
  confidence: { consumptionKwh: 0.95, periodDays: 0.9, region: 0.95, billId: 0.95 },
});

test('گزارش HTML راست‌چین و فارسی است', () => {
  const html = buildHtmlReport(report, {
    reportId: 'ABCD1234',
    brandName: 'تحلیل قبض برق',
    todayJalali: '۱۴۰۵/۰۴/۲۸',
  });
  assert.ok(html.includes('dir="rtl"'));
  assert.ok(html.includes('۲۶۵')); // مصرف با ارقام فارسی
  assert.ok(html.includes('۱۹۳٬۵۳۸')); // مبلغ پله اول
  assert.ok(html.includes('ABCD1234'));
  assert.ok(html.includes('۱۱۱۷۵۴۰۶۰۱۰۲۳'));
  assert.ok(html.includes('زیر الگو'));
});

test('پیام تحلیل چت شامل جدول پله‌ها و توصیه‌هاست', () => {
  const msg = formatAnalysis(report);
  assert.ok(msg.includes('تحلیل بر اساس تعرفه'));
  assert.ok(msg.includes('kWh'));
  assert.ok(msg.includes('توصیه'));
  assert.ok(msg.includes('۷۳۳٬۳۸۹')); // جمع بهای انرژی
});

test('جدول چت شامل بخش‌های سه‌گانه است', () => {
  const msg = formatBillTable(report.bill, 90);
  assert.ok(msg.includes('شناسه قبض'));
  assert.ok(msg.includes('مصرف دوره'));
  assert.ok(msg.includes('بهای انرژی'));
  assert.ok(msg.includes('۹۰')); // اطمینان کل
});
