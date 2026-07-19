import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractBillFields,
  needsReview,
  overallConfidence,
} from '../src/bill/extract.ts';

const SAMPLE_BILL_TEXT = `
شرکت توزیع نیروی برق استان تهران
صورتحساب برق مشترکین خانگی
شناسه قبض: ۱۱۱۷۵۴۰۶۰۱۰۲۳
شناسه پرداخت: ۲۲۱۷۵۴۰۶۰۱۰۲۴
شماره پرونده: ۳۳۴۴۵۵۶
نام مشترک: محمد رضایی
نشانی: تهران، خیابان ولیعصر، پلاک ۱۰
کد پستی: ۱۴۳۵۸۶۷۹۱۰
نوع تعرفه: خانگی
دوره از ۱۴۰۵/۰۲/۱۵ تا ۱۴۰۵/۰۴/۱۴
روزهای دوره: ۶۱
شاخص قبلی: ۱۲۳۴۵
شاخص فعلی: ۱۲۶۱۰
مصرف دوره: ۲۶۵ کیلووات ساعت
کم باری: ۹۲   میان باری: ۱۲۱   اوج باری: ۵۲
آمپراژ: ۲۵
بهای انرژی: ۴٬۱۲۰٬۰۰۰
تبصره ۱۴: ۱٬۳۰۰٬۰۰۰
عوارض: ۴۱۲٬۰۰۰
ارزش افزوده: ۵۸۳٬۲۰۰
جمع کل قابل پرداخت: ۶٬۴۱۵٬۲۰۰
پرداخت نشده
`;

test('استخراج کامل فیلدها از متن نمونه قبض', () => {
  const bill = extractBillFields(SAMPLE_BILL_TEXT);

  assert.equal(bill.billId, '1117540601023');
  assert.equal(bill.paymentId, '2217540601024');
  assert.equal(bill.fileNo, '3344556');
  assert.equal(bill.customerName?.startsWith('محمد رضایی'), true);
  assert.equal(bill.postalCode, '1435867910');
  assert.equal(bill.tariffType, 'خانگی');
  assert.equal(bill.periodFrom, '1405-02-15');
  assert.equal(bill.periodTo, '1405-04-14');
  assert.equal(bill.periodDays, 61);
  assert.equal(bill.prevReading, 12345);
  assert.equal(bill.curReading, 12610);
  assert.equal(bill.consumptionKwh, 265);
  assert.equal(bill.tou?.low, 92);
  assert.equal(bill.tou?.mid, 121);
  assert.equal(bill.tou?.peak, 52);
  assert.equal(bill.ampere, 25);
  assert.equal(bill.energyChargeRials, 4120000);
  assert.equal(bill.note14Rials, 1300000);
  assert.equal(bill.leviesRials, 412000);
  assert.equal(bill.vatRials, 583200);
  assert.equal(bill.totalRials, 6415200);
  assert.equal(bill.paymentStatus, 'unpaid');
});

test('cross-check شاخص‌ها اطمینان مصرف را بالا می‌برد', () => {
  const bill = extractBillFields(SAMPLE_BILL_TEXT);
  // 12610 − 12345 = 265 → سازگار
  assert.ok((bill.confidence?.['consumptionKwh'] ?? 0) >= 0.9);
  assert.equal(needsReview(bill, 'consumptionKwh'), false);
});

test('منطقه نامشخص با اطمینان پایین علامت‌گذاری می‌شود', () => {
  const bill = extractBillFields('مصرف: ۲۶۵ کیلووات ساعت');
  assert.equal(bill.region, 'normal');
  assert.equal(needsReview(bill, 'region'), true);
});

test('شناسایی منطقه گرمسیر از متن', () => {
  const bill = extractBillFields('منطقه گرمسیر ۲ — مصرف: ۱۲۰۰ کیلووات ساعت');
  assert.equal(bill.region, 'tropical2');
});

test('ورودی مینیمال برای مسیر دستی', () => {
  const bill = extractBillFields('مصرف: ۷۶۰\nروز: ۳۰\nبهای انرژی: ۲۷۱۷۴۸۰۰');
  assert.equal(bill.consumptionKwh, 760);
  assert.equal(bill.periodDays, 30);
  assert.equal(bill.energyChargeRials, 27174800);
  assert.ok(overallConfidence(bill) > 0);
});
