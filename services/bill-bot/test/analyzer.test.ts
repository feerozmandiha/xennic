import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeBill, STATUS_LABEL } from '../src/analysis/analyzer.ts';
import type { BillData } from '../src/bill/types.ts';

function bill(over: Partial<BillData>): BillData {
  return {
    tariffType: 'خانگی',
    region: 'normal',
    ...over,
  };
}

test('مشترک زیر الگو — منطقه عادی، دوره غیرگرم', () => {
  const report = analyzeBill(
    bill({
      consumptionKwh: 265,
      periodDays: 30,
      periodFrom: '1405-01-05',
      periodTo: '1405-02-04',
      energyChargeRials: 733389,
      confidence: { consumptionKwh: 0.95, periodDays: 0.9, region: 0.95, energyChargeRials: 0.9 },
    }),
  );
  assert.equal(report.patternStatus, 'under');
  assert.equal(report.computedEnergyRials, 733389);
  assert.ok(Math.abs(report.monthlyAvgKwh - 265) < 1);
  assert.ok(report.relativeToPattern < 1); // 265/300
  assert.equal(report.profileId, 'WP-NORMAL');
  // انحراف صفر → بدون هشدار انحراف
  assert.equal(
    report.warnings.some((w) => w.includes('انحراف')),
    false,
  );
  assert.equal(typeof STATUS_LABEL[report.patternStatus], 'string');
});

test('مشترک بسیار پرمصرف — پله ۵ برابر هزینه تأمین', () => {
  const report = analyzeBill(
    bill({
      consumptionKwh: 760,
      periodDays: 30,
      periodFrom: '1405-01-05',
      periodTo: '1405-02-04',
      energyChargeRials: 27174800,
      confidence: { consumptionKwh: 0.95, periodDays: 0.9, region: 0.95 },
    }),
  );
  // 760/300 = 2.53 → tier4
  assert.equal(report.patternStatus, 'tier4');
  assert.equal(report.computedEnergyRials, 27174800);
  assert.equal(report.profileId, 'P2-NORMAL-COOL-300+');
  // توصیه کاهش مصرف و ممیزی لوازم باید فعال شود
  const ids = report.recommendations.map((r) => r.id);
  assert.ok(ids.includes('R1'), 'R1 missing');
  assert.ok(ids.includes('R4'), 'R4 missing');
});

test('ماه‌های گرم از روی بازه دوره تشخیص داده می‌شود', () => {
  const report = analyzeBill(
    bill({
      consumptionKwh: 400,
      periodFrom: '1405-03-01',
      periodTo: '1405-03-31',
    }),
  );
  assert.equal(report.season, 'hot');
  assert.equal(report.profileId, 'P3-NORMAL-HOT-300+');
});

test('گرمسیر۴ ماه‌های گرم — الگو ۴۵۰', () => {
  const report = analyzeBill(
    bill({
      region: 'tropical4',
      consumptionKwh: 400,
      periodFrom: '1405-04-01',
      periodTo: '1405-04-31',
    }),
  );
  assert.equal(report.patternLimitKwh, 450);
  assert.equal(report.patternStatus, 'under');
  assert.equal(report.profileId, 'WP-T4-HOT');
});

test('انحراف بیش از ۵٪ هشدار تولید می‌کند', () => {
  const report = analyzeBill(
    bill({
      consumptionKwh: 265,
      periodDays: 30,
      periodFrom: '1405-01-05',
      periodTo: '1405-02-04',
      energyChargeRials: 4120000,
      confidence: { consumptionKwh: 0.95, periodDays: 0.9, region: 0.95 },
    }),
  );
  assert.ok(report.deviationPct !== null);
  assert.ok(Math.abs(report.deviationPct!) > 5);
  assert.ok(report.warnings.some((w) => w.includes('انحراف')));
});

test('تعرفه غیرخانگی هشدار می‌دهد ولی تحلیل ادامه می‌یابد', () => {
  const report = analyzeBill(
    bill({
      tariffType: 'تجاری',
      consumptionKwh: 300,
      periodDays: 30,
      periodFrom: '1405-01-05',
      periodTo: '1405-02-04',
    }),
  );
  assert.ok(report.warnings.some((w) => w.includes('تجاری')));
});

test('نبود مصرف → خطا', () => {
  assert.throws(() => analyzeBill(bill({ periodDays: 30 })), /مصرف دوره/);
});

test('جریمه اوج‌بار برای مشترک پرمصرف محاسبه می‌شود', () => {
  const report = analyzeBill(
    bill({
      consumptionKwh: 760,
      periodDays: 30,
      periodFrom: '1405-01-05',
      periodTo: '1405-02-04',
      tou: { low: 200, mid: 360, peak: 200 },
    }),
  );
  // 200 × 0.305 × 13256 = 808,616
  assert.equal(report.peakSurchargeRials, 808616);
  assert.ok(report.offpeakDiscountRials !== null);
});
