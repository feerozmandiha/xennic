/** نرمال‌سازی متن فارسی پیش از استخراج (سند ۰۴ بخش ۲). */

export const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** تبدیل همه ارقام فارسی/عربی به لاتین. */
export function normalizeDigits(input: string): string {
  let out = '';
  for (const ch of input) {
    const fa = FA_DIGITS.indexOf(ch);
    if (fa >= 0) out += String(fa);
    else {
      const ar = AR_DIGITS.indexOf(ch);
      out += ar >= 0 ? String(ar) : ch;
    }
  }
  return out;
}

/**
 * نرمال‌سازی کامل متن OCR:
 * اعداد، ی/ك عربی، کشیده، نیم‌فاصله/فاصله‌های اضافی، جداکننده‌های هزارگان.
 */
export function normalizeFa(input: string): string {
  return (
    normalizeDigits(input)
      .replace(/ي/g, 'ی')
      .replace(/ك/g, 'ک')
      .replace(/[\u0640\u200e\u200f]/g, '') // کشیده و LTR/RTL mark
      .replace(/[\u200c\u200d]/g, ' ') // نیم‌فاصله → فاصله
      .replace(/[٬,]/g, '') // جداکننده هزارگان
      .replace(/٫/g, '.') // ممیز فارسی
      .replace(/[ \t]+/g, ' ')
      .replace(/ *\n */g, '\n')
  );
}

/** تبدیل توکن عددی نرمال‌شده به number؛ در صورت نامعتبر بودن null. */
export function toNumber(token: string | undefined | null): number | null {
  if (!token) return null;
  const cleaned = normalizeFa(token).replace(/\s/g, '');
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** قالب‌بندی عدد با ارقام فارسی و جداکننده هزارگان: ۱۲٬۳۴۵ */
export function faNumber(n: number, fractionDigits = 0): string {
  const fixed = n.toLocaleString('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  return fixed
    .replace(/,/g, '٬')
    .split('')
    .map((c) => (/\d/.test(c) ? FA_DIGITS[Number(c)] : c))
    .join('');
}

/** تبدیل ارقام لاتین یک رشته به فارسی — بدون جداکننده (مناسب شناسه‌ها). */
export function faDigits(input: string): string {
  return input
    .split('')
    .map((c) => (/\d/.test(c) ? FA_DIGITS[Number(c)] : c))
    .join('');
}

/** ماسک کردن شناسه‌های حساس برای لاگ: 221754***1024 */
export function maskId(id: string, visible = 6): string {
  if (id.length <= visible) return '***';
  return `${id.slice(0, visible)}***${id.slice(-4)}`;
}
