import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeTieredEnergy, peakSurcharge, selectProfile } from '../src/tariff/calculator.ts';
import {
  SUPPLY_COST_RIALS_PER_KWH,
  WITHIN_PATTERN,
  OVER_PATTERN,
} from '../src/tariff/tavanir1405.ts';

const C = SUPPLY_COST_RIALS_PER_KWH[1405]; // 13256

test('هزینه تأمین ۱۴۰۵ برابر ۱۳٬۲۵۶ ریال است', () => {
  assert.equal(C, 13256);
});

test('محاسبه پلکانی منطقه عادی — زیر الگو (۲۶۵ kWh)', () => {
  const profile = WITHIN_PATTERN.normal.normal;
  const res = computeTieredEnergy(265, profile, C);
  // پله۱: 100×0.146×13256 = 193538
  // پله۲: 100×0.17×13256  = 225352
  // پله۳: 65×0.365×13256  = 314499
  assert.equal(res.tiers.length, 3);
  assert.equal(res.tiers[0].amountRials, 193538);
  assert.equal(res.tiers[1].amountRials, 225352);
  assert.equal(res.tiers[2].amountRials, 314499);
  assert.equal(res.totalRials, 733389);
});

test('محاسبه پرمصرف منطقه عادی (۷۰۰ kWh) — تا پله ۵ برابر', () => {
  const res = computeTieredEnergy(700, OVER_PATTERN['P2-NORMAL-COOL-300+'], C);
  assert.equal(res.tiers[0].amountRials, 200 * 6628); // 0.5×C
  assert.equal(res.tiers[1].amountRials, 100 * 19884); // 1.5×C
  assert.equal(res.tiers[2].amountRials, 200 * 33140); // 2.5×C
  assert.equal(res.tiers[3].amountRials, 200 * 66280); // 5×C
  assert.equal(res.totalRials, 23198000);
});

test('محاسبه گرمسیر۱ ماه‌های گرم — طبق الگو (۲۴۰۰ kWh)', () => {
  const res = computeTieredEnergy(2400, WITHIN_PATTERN.tropical1.hot, C);
  assert.equal(res.tiers[0].amountRials, Math.round(1000 * 0.048 * C)); // 636288
  assert.equal(res.tiers[1].amountRials, Math.round(1000 * 0.054 * C)); // 715824
  assert.equal(res.tiers[2].amountRials, Math.round(400 * 0.06 * C)); // 318144
  assert.equal(res.totalRials, 1670256);
});

test('انتخاب پروفایل بر اساس میانگین ماهانه', () => {
  assert.equal(
    selectProfile({ zone: 'normal', season: 'normal', monthlyAvgKwh: 130 }).id,
    'WP-NORMAL',
  );
  // عبور از الگو محرز اما میانگین هنوز ≤ ۳۰۰ → جدول انتقالی P1
  assert.equal(
    selectProfile({
      zone: 'normal',
      season: 'normal',
      monthlyAvgKwh: 250,
      overPattern: true,
    }).id,
    'P1-NORMAL-COOL-200-300',
  );
  assert.equal(
    selectProfile({ zone: 'normal', season: 'normal', monthlyAvgKwh: 400 }).id,
    'P2-NORMAL-COOL-300+',
  );
  assert.equal(
    selectProfile({ zone: 'normal', season: 'hot', monthlyAvgKwh: 400 }).id,
    'P3-NORMAL-HOT-300+',
  );
  assert.equal(
    selectProfile({ zone: 'tropical4', season: 'hot', monthlyAvgKwh: 500 }).id,
    'P4-T4-HOT',
  );
  assert.equal(
    selectProfile({ zone: 'tropical3', season: 'hot', monthlyAvgKwh: 700 }).id,
    'P5-T3-HOT',
  );
  assert.equal(
    selectProfile({ zone: 'tropical2', season: 'hot', monthlyAvgKwh: 1600 }).id,
    'P6-T2-HOT',
  );
  assert.equal(
    selectProfile({ zone: 'tropical1', season: 'hot', monthlyAvgKwh: 2800 }).id,
    'P7-T1-HOT-2500-3000',
  );
  assert.equal(
    selectProfile({ zone: 'tropical1', season: 'hot', monthlyAvgKwh: 3500 }).id,
    'P8-T1-HOT-3000+',
  );
  assert.equal(
    selectProfile({ zone: 'tropical1', season: 'normal', monthlyAvgKwh: 2200 }).id,
    'P9-T1-AUTUMN-2000-2500',
  );
  assert.equal(
    selectProfile({ zone: 'tropical1', season: 'normal', monthlyAvgKwh: 2600 }).id,
    'P10-T1-AUTUMN-2500+',
  );
});

test('نرخ آخرین پله ≈ ۵ برابر هزینه تأمین', () => {
  const res = computeTieredEnergy(700, OVER_PATTERN['P2-NORMAL-COOL-300+'], C);
  assert.equal(res.tiers.at(-1)?.rateRials, 5 * C); // 66280
});

test('جریمه اوج‌بار — پرمصرف در منطقه عادی', () => {
  // 50 kWh اوج × 0.305 × C
  assert.equal(peakSurcharge(50, true, 'normal', 'normal', C), Math.round(50 * 0.305 * C));
  // گرمسیر۱ ماه‌های گرم با ضریب ⅓
  assert.equal(
    peakSurcharge(50, true, 'tropical1', 'hot', C),
    Math.round(50 * 0.305 * C * (1 / 3)),
  );
});

test('ضریب اعمال تعرفه در P1 اعمال می‌شود', () => {
  const res = computeTieredEnergy(250, OVER_PATTERN['P1-NORMAL-COOL-200-300'], C);
  const rate0 = Math.round(0.5 * 0.876 * C);
  assert.equal(res.tiers[0].rateRials, rate0);
});
