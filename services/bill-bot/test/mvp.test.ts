import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from '../src/config.ts';
import { CB, mvpKeyboard } from '../src/bot/keyboards.ts';
import { formatBillTable } from '../src/bot/flow.ts';
import type { BillData } from '../src/bill/types.ts';

function withEnv(key: string, value: string | undefined, fn: () => void): void {
  const prev = process.env[key];
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
  try {
    fn();
  } finally {
    if (prev === undefined) delete process.env[key];
    else process.env[key] = prev;
  }
}

test('حالت پیش‌فرض پیکربندی mvp است (بدون ذخیره‌سازی)', () => {
  withEnv('BILL_BOT_MODE', undefined, () => {
    assert.equal(loadConfig().mode, 'mvp');
  });
});

test('با BILL_BOT_MODE=full حالت کامل فعال می‌شود', () => {
  withEnv('BILL_BOT_MODE', 'full', () => {
    assert.equal(loadConfig().mode, 'full');
  });
});

test('کیبورد mvp همیشه «قبض جدید» دارد و هرگز تحلیل/PDF/مشاوره ندارد', () => {
  const k = mvpKeyboard(false);
  const data = k.inline_keyboard!.flat().map((b) => b.callback_data);
  assert.ok(data.includes(CB.newBill));
  assert.ok(!data.includes(CB.fix));
  assert.ok(!data.includes(CB.analyze));
  assert.ok(!data.includes(CB.pdf));
  assert.ok(!data.includes(CB.consult));
});

test('با فیلدهای کم‌اطمینان، دکمه «اصلاح اطلاعات» در کیبورد mvp ظاهر می‌شود', () => {
  const k = mvpKeyboard(true);
  const data = k.inline_keyboard!.flat().map((b) => b.callback_data);
  assert.ok(data.includes(CB.fix));
  assert.ok(data.includes(CB.newBill));
});

test('جدول mvp فقط اطلاعات قبض را با ارقام فارسی نمایش می‌دهد (بدون تحلیل)', () => {
  const bill: BillData = {
    billId: '1117540601023',
    paymentId: '2217540601024',
    customerName: 'محمد رضایی',
    tariffType: 'خانگی',
    consumptionKwh: 265,
    periodDays: 61,
    energyChargeRials: 4120000,
    vatRials: 583200,
    totalRials: 6415200,
    confidence: { consumptionKwh: 0.95, periodDays: 0.9, energyChargeRials: 0.9 },
  };
  const msg = formatBillTable(bill, 92);

  // بخش‌های سه‌گانه جدول
  assert.ok(msg.includes('اطلاعات شناسه‌ای'));
  assert.ok(msg.includes('دوره و قرائت'));
  assert.ok(msg.includes('ریز مبالغ'));

  // فیلدهای کلیدی با ارقام فارسی (شناسه‌ها بدون تبدیل نمایش داده می‌شوند)
  assert.ok(msg.includes('شناسه قبض'));
  assert.ok(msg.includes('1117540601023'));
  assert.ok(msg.includes('۲۶۵'));
  assert.ok(msg.includes('۴٬۱۲۰٬۰۰۰'));
  assert.ok(msg.includes('۶٬۴۱۵٬۲۰۰'));

  // در نسخه mvp نباید تحلیل در پیام جدول باشد
  assert.ok(!msg.includes('تحلیل بر اساس تعرفه'));
});
