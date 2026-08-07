/**
 * تبدیل تاریخ جلالی ↔ روز ژولینی (الگوریتم استاندارد jalaali-js، دامنه عمومی).
 * فقط برای محاسبه طول دوره قبض و تعیین فصل استفاده می‌شود.
 */

function div(a: number, b: number): number {
  return Math.floor(a / b);
}

function jalCal(jy: number): { leap: number; gy: number; march: number } {
  const breaks = [
    -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394,
    2456, 3178,
  ];
  const bl = breaks.length;
  const gy = jy + 621;
  let leapJ = -14;
  let jp = breaks[0];
  let jm = 0;
  let jump = 0;
  for (let i = 1; i < bl; i += 1) {
    jm = breaks[i];
    jump = jm - jp;
    if (jy < jm) break;
    leapJ = leapJ + div(jump, 33) * 8 + div(jump % 33, 4);
    jp = jm;
  }
  let n = jy - jp;
  leapJ = leapJ + div(n, 33) * 8 + div((n % 33) + 3, 4);
  if (jump % 33 === 4 && jump - n === 4) leapJ += 1;
  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;
  if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
  let leap = (((n + 1) % 33) - 1) % 4;
  if (leap === -1) leap = 4;
  return { leap, gy, march };
}

function g2d(gy: number, gm: number, gd: number): number {
  let d =
    div((gy + div(gm - 8, 6) + 100100) * 1461, 4) +
    div(153 * ((gm + 9) % 12) + 2, 5) +
    gd -
    34840408;
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}

function j2d(jy: number, jm: number, jd: number): number {
  const r = jalCal(jy);
  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
}

export type JalaliDate = [number, number, number]; // [jy, jm, jd]

/** تجزیه «1405/04/14» یا «1405-04-14» یا «1405.4.14» به تاریخ جلالی. */
export function parseJalali(text: string): JalaliDate | null {
  const m = text.match(/(1[34]\d\d)[\/.\-](\d{1,2})[\/.\-](\d{1,2})/);
  if (!m) return null;
  const [, y, mo, d] = m.map(Number);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return [y, mo, d];
}

/** اختلاف روز بین دو تاریخ جلالی (to − from). */
export function jalaliDaysBetween(from: JalaliDate, to: JalaliDate): number {
  return j2d(to[0], to[1], to[2]) - j2d(from[0], from[1], from[2]);
}

/** فهرست ماه‌های جلالیِ پوشش‌داده‌شده بین دو تاریخ (حداکثر ۴ ماه). */
export function jalaliMonthsCovered(from: JalaliDate, to: JalaliDate): number[] {
  const months: number[] = [];
  let [y, m] = [from[0], from[1]];
  const endY = to[0];
  const endM = to[1];
  for (let i = 0; i < 4; i += 1) {
    months.push(m);
    if (y === endY && m === endM) break;
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return months;
}

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

/** قالب‌بندی تاریخ جلالی با اعداد فارسی: ۱۴۰۵/۰۴/۲۸ */
export function formatJalali(d: JalaliDate): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d[0]}/${pad(d[1])}/${pad(d[2])}`
    .split('')
    .map((c) => (/\d/.test(c) ? FA_DIGITS[Number(c)] : c))
    .join('');
}
