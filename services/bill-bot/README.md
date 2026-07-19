# services/bill-bot — ربات تحلیل قبض برق (تلگرام و بله)

> مستندات کامل پروژه: [`docs/bill-bot/`](../../docs/bill-bot/README.md)

ربات گفتگوگر برای دریافت قبض برق (PDF/تصویر)، استخراج اطلاعات، تحلیل بر اساس **تعرفه ۱۴۰۵ توانیر**، صدور گزارش PDF و ثبت درخواست مشاوره (پیام خصوصی/تماس تلفنی).

## پیش‌نیازها

- Node.js ≥ 22.6 (بدون نیاز به build یا نصب وابستگی اجباری)
- (اختیاری) توکن تلگرام از @BotFather و توکن بله از «آیدی‌بات» — [docs.bale.ai](https://docs.bale.ai)
- (اختیاری) `vision-service` ریپازیتوری برای OCR دقیق‌تر — بدون آن مسیر «ورود دستی» فعال است
- (اختیاری) فونت فارسی TTF (وزیرمتن) برای خروجی PDF — بدون آن گزارش HTML ارسال می‌شود

## اجرای سریع

```bash
cp .env.example .env   # توکن‌ها و تنظیمات را وارد کنید
node --experimental-strip-types src/index.ts
```

یا با اسکریپت‌های workspace (از ریشه ریپازیتوری):

```bash
pnpm --filter @xennic/bill-bot start
pnpm --filter @xennic/bill-bot dev     # حالت watch
pnpm --filter @xennic/bill-bot test    # تست‌های واحد هسته
```

## تست

```bash
pnpm --filter @xennic/bill-bot test
# یا مستقیم:
node --experimental-strip-types --test test/*.test.ts
```

تست‌ها شامل: نرمال‌سازی اعداد فارسی، استخراج فیلدهای قبض نمونه، محاسبه پلکانی
تعرفه ۱۴۰۵ (منطقه عادی/گرمسیر/پله ۵ برابر)، انتخاب پروفایل، موتور تحلیل و
قالب گزارش است — ارقام کلیدی تعرفه در تست‌ها قفل شده‌اند (رگرسیون‌گیر).

## استقرار با Docker

```bash
docker build -t xennic-bill-bot .
docker run --rm --env-file .env xennic-bill-bot
```

## ساختار

```
src/
├── index.ts               # ورودی + long-polling هر دو سکو
├── config.ts              # پیکربندی از env
├── jalali.ts              # تاریخ شمسی (اختلاف روز/فصل)
├── platform/              # آداپتور تلگرام + بله (API سازگار)
├── bill/                  # نرمال‌سازی فارسی، مدل داده، استخراج regex
├── vision-client.ts       # اتصال به vision-service (OCR اصلی)
├── tariff/                # داده تعرفه ۱۴۰۵ + ماشین‌حساب پلکانی
├── analysis/              # موتور تحلیل قاعده‌محور + لایه LLM اختیاری
├── report/                # گزارش HTML/RTL و PDF
├── store/                 # ذخیره درخواست‌های مشاوره (JSON + AES اختیاری)
└── bot/                   # ماشین حالت مکالمه، کیبوردها، قالب پیام‌ها
```

## نکته مهم درباره تعرفه

ارقام تعرفه ۱۴۰۵ (هزینه تأمین ۱۳٬۲۵۶ ریال/kWh و همه ضرایب پلکانی) در
`src/tariff/tavanir1405.ts` متمرکز است. با ابلاغ تعرفه سال جدید فقط همان فایل
را ویرایش کنید و `TARIFF_YEAR` را در env تغییر دهید؛ سپس تست‌ها را اجرا کنید.
مستند مرجع: [docs/bill-bot/05-TARIFF-ENGINE-1405.md](../../docs/bill-bot/05-TARIFF-ENGINE-1405.md)
