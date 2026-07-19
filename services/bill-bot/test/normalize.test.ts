import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  faDigits,
  faNumber,
  maskId,
  normalizeDigits,
  normalizeFa,
  toNumber,
} from '../src/bill/normalize.ts';

test('faDigits بدون جداکننده — مناسب شناسه‌ها', () => {
  assert.equal(faDigits('1117540601023'), '۱۱۱۷۵۴۰۶۰۱۰۲۳');
  assert.equal(faDigits('abc-12'), 'abc-۱۲');
});

test('تبدیل ارقام فارسی و عربی به لاتین', () => {
  assert.equal(normalizeDigits('۰۱۲۳۴۵۶۷۸۹'), '0123456789');
  assert.equal(normalizeDigits('٠١٢٣٤٥٦٧٨٩'), '0123456789');
  assert.equal(normalizeDigits('abc۱۲۳'), 'abc123');
});

test('نرمال‌سازی کامل متن: جداکننده، ی/ك، نیم‌فاصله', () => {
  assert.equal(normalizeFa('۱۲٬۳۴۵٬۶۷۸'), '12345678');
  assert.equal(normalizeFa('12,345'), '12345');
  assert.equal(normalizeFa('ي ك'), 'ی ک');
  assert.equal(normalizeFa('کم\u200cباری'), 'کم باری');
  assert.equal(normalizeFa('۴٫۵'), '4.5');
});

test('toNumber با ورودی‌های فارسی', () => {
  assert.equal(toNumber('۱۲٬۳۴۵'), 12345);
  assert.equal(toNumber(' ۲۶۵ '), 265);
  assert.equal(toNumber('4.5'), 4.5);
  assert.equal(toNumber('abc'), null);
  assert.equal(toNumber(''), null);
});

test('faNumber با ارقام فارسی و جداکننده هزارگان', () => {
  assert.equal(faNumber(12345), '۱۲٬۳۴۵');
  assert.equal(faNumber(733389), '۷۳۳٬۳۸۹');
  assert.equal(faNumber(0), '۰');
});

test('maskId شناسه‌های حساس را می‌پوشاند', () => {
  assert.equal(maskId('2217540601024'), '221754***1024');
  assert.equal(maskId('12345'), '***');
});
