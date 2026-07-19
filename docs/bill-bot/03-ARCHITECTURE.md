# ۰۳ — معماری سیستم

## ۱. نمای کلان

```
┌───────────────┐        ┌───────────────┐
│   Telegram    │        │   Bale (بله)  │
│ api.telegram  │        │  tapi.bale.ai │  ← API سازگار با تلگرام [docs.bale.ai]
└──────┬────────┘        └──────┬────────┘
       │ getUpdates/sendX      │
       ▼                        ▼
┌─────────────────────────────────────────┐
│        Platform Adapters Layer          │
│  TelegramAdapter      BaleAdapter       │  ( BotApi مشترک + capability flags )
└──────────────────┬──────────────────────┘
                   ▼
┌─────────────────────────────────────────┐
│        Bot Core (state machine)         │
│  flow.ts — نشست‌ها، صف، دکمه‌ها، ادمین   │
└───┬──────────────┬──────────────┬───────┘
    ▼              ▼              ▼
┌────────┐  ┌────────────┐  ┌──────────────┐
│  Bill  │  │  Tariff    │  │  Analysis    │
│Extract │→ │ Calculator │→ │   Engine     │
│        │  │ (۱۴۰۵)     │  │ قواعد + LLM? │
└───┬────┘  └────────────┘  └──────┬───────┘
    │                              ▼
    │                        ┌───────────┐
    │                        │  Report   │──→ PDF → sendDocument
    └──→ vision-service ←────│  (HTML/   │
         POST /vision/       │   RTL)    │
         bill/read           └─────┬─────┘
                                   ▼
                            ┌─────────────┐
                            │ Consultation│──→ اعلان ادمین + کد پیگیری
                            │  Store (SQLite)
                            └─────────────┘
```

## ۲. اجزای سرویس `services/bill-bot`

| فایل | مسئولیت |
|------|---------|
| `src/config.ts` | خواندن env، پیش‌فرض‌ها، اعتبارسنجی پیکربندی |
| `src/platform/bot-api.ts` | کلاینت HTTP عمومی Bot API با `fetch`: getMe، getUpdates، sendMessage، sendPhoto، sendDocument (multipart)، answerCallbackQuery، getFile/download — پارامتر `baseUrl` سکو را تعیین می‌کند |
| `src/platform/telegram.ts` / `bale.ts` | پیکربندی هر سکو (آدرس پایه، نام، قابلیت‌ها، محدودیت‌ها) |
| `src/bill/normalize.ts` | نرمال‌سازی متن فارسی: اعداد ۰-۹/٠-٩→لاتین، ی/ك عربی، جداکننده‌های هزارگان، نیم‌فاصله |
| `src/bill/extract.ts` | استخراج فیلدها با regex از متن OCR + امتیاز اطمینان هر فیلد |
| `src/vision-client.ts` | کلاینت `POST {VISION_SERVICE_URL}/vision/bill/read` (multipart) و نگاشت `VisionResponse.data` → `BillData` |
| `src/tariff/tavanir1405.ts` | **داده** جداول تعرفه ۱۴۰۵ (سند ۰۵) — تنها نقطه تغییر سالانه |
| `src/tariff/calculator.ts` | محاسبه پلکانی، انتخاب پروفایل بر اساس منطقه/فصل/میانگین ماهانه، جریمه/پاداش اوج‌بار |
| `src/analysis/analyzer.ts` | تبدیل نتایج به گزارش تحلیلی + توصیه‌ها + بررسی صحت قبض |
| `src/analysis/llm.ts` | آداپتور اختیاری LLM (سازگار با OpenAI Chat Completions) برای روایت فارسی |
| `src/report/report-html.ts` | ساخت HTML/RTL گزارش (جدول‌ها + استایل چاپ) |
| `src/report/pdf.ts` | تبدیل HTML → PDF (pdfmake + فونت وزیرمتن از مسیر env؛ در نبود فونت، ارسال HTML) |
| `src/store/sqlite.ts` | ذخیره نشست‌ها و درخواست‌های مشاوره (SQLite بدون وابستگی — better-sqlite3 اختیاری؛ جایگزین JSON file) |
| `src/bot/flow.ts` | ماشین حالت مکالمه + هندلرهای پیام/فایل/callback |
| `src/bot/keyboards.ts` | تعریف همه کیبوردها و callback data |
| `src/index.ts` | راه‌اندازی، حلقه long-polling هر سکو، خاموش‌سازی ایمن |

## ۳. آداپتور پلتفرم — چرا دو سکو با یک کد؟

مستندات رسمی بازوی بله نشان می‌دهد API ربات بله همان مدل Bot API تلگرام است (getUpdates، sendMessage، InlineKeyboardMarkup، callback_query و …) با پایه `https://tapi.bale.ai/bot{token}/{method}`. [1](https://docs.bale.ai/) بنابراین:

- یک کلاس `BotApi(baseUrl, token)` همه متدها را پیاده‌سازی می‌کند.
- هر سکو فقط `baseUrl` و `capabilities` متفاوت دارد:

| قابلیت | تلگرام | بله | رفتار fallback |
|--------|:---:|:---:|----------------|
| getUpdates (long polling) | ✅ | ✅ | — |
| InlineKeyboard / callback | ✅ | ✅ | — |
| sendDocument / sendPhoto | ✅ | ✅ | — |
| request_contact در دکمه | ✅ | ✅ (contact) | در نبود: ورود دستی شماره |
| parse_mode HTML | ✅ | ⚠️ محدود | سقوط به متن ساده با ایموجی |
| Webhook | ✅ | ✅ | فاز اول: فقط long-polling |

> نکته عملی: اگر متدی در بله خطای `404/400` داد، آداپتور آن را لاگ کرده و از fallback استفاده می‌کند؛ هیچ‌وقت کل جریان متوقف نمی‌شود.

## ۴. پایپ‌لاین پردازش قبض

```
فایل ورودی
  │
  ├─ مسیر A (پیش‌فرض): vision-service
  │    multipart → POST /vision/bill/read → {success, confidence, data}
  │    data: BillData (اسکیمای موجود ریپازیتوری: bill_number, customer_id,
  │    consumption_kwh, energy_charge, tax, line_items, …)
  │
  ├─ مسیر B (fallback): OCR عمومی + استخراج محلی
  │    1) PDF → تصویر (اگر سمت سرور ممکن باشد؛ وگرنی از کاربر عکس خواسته می‌شود)
  │    2) OCR متن خام (Tesseract CLI یا OCR ابری اختیاری)
  │    3) extract.ts → فیلدها + اطمینان هر فیلد
  │
  └─ مسیر C: ورود دستی (فرم مرحله‌ای در چت) — فقط فیلدهای گمشده

→ ادغام نتایج (merge + confidence) → BillData نهایی
→ تأیید کاربر (دکمه «تأیید» یا «اصلاح»)
→ calculator + analyzer → ReportModel
→ جدول چت / PDF / مشاوره
```

## ۵. یکپارچه‌سازی با Xennic

| سرویس ریپازیتوری | نقش در ربات | وضعیت فاز اول |
|------------------|-------------|---------------|
| `workspace/services/vision-service` (:8003) | OCR + استخراج قبض (`/vision/bill/read`) | اتصال اختیاری؛ در نبودش fallback محلی |
| `workspace/services/ai-service` (:8002) | تحلیل عمیق/معنایی (RAG دانش تعرفه) | فاز ۲ — در فاز اول LLM مستقیم یا قواعد |
| `apps/api` (NestJS) | وبهوک مدیریت، داشبورد ادمین، API عمومی گزارش‌ها | فاز ۲ |
| `packages/database` (Prisma) | اگر ربات به DB اصلی بخواهد وصل شود | فعلاً نه — SQLite مستقل برای خودکفایی |

> ربات به‌عنوان عضو workspace (`services/*` در `pnpm-workspace.yaml`) تعریف می‌شود اما **وابستگی اجباری** به بسته‌های دیگر ندارد تا مستقل قابل استقرار باشد.

## ۶. جریان داده و قراردادها

### BillData (هم‌شکل با vision-service)
```ts
interface BillData {
  billId?: string;          // شناسه قبض ۱۳ رقمی
  paymentId?: string;       // شناسه پرداخت
  fileNo?: string;          // شماره پرونده
  customerName?: string;
  address?: string;
  postalCode?: string;
  tariffType?: 'خانگی' | 'تجاری' | 'صنعتی' | 'کشاورزی' | 'عمومی' | string;
  region?: ZoneId;          // normal | tropical1..4
  periodFrom?: string;      // 1405-02-15 (ISO شمسی)
  periodTo?: string;
  periodDays?: number;
  prevReading?: number;
  curReading?: number;
  consumptionKwh?: number;
  tou?: { low?: number; mid?: number; peak?: number }; // سه‌زمانه
  demandKw?: number;
  ampere?: number;
  energyChargeRials?: number;
  note14Rials?: number;     // تبصره ۱۴
  leviesRials?: number;     // عوارض (ماده ۵/شهرداری)
  vatRials?: number;        // ارزش افزوده
  insuranceRials?: number;
  totalRials?: number;
  paymentStatus?: 'paid' | 'unpaid' | string;
  rawText?: string;         // متن OCR (موقتی، ≤۲۴ ساعت)
  confidence?: Record<string, number>; // اطمینان هر فیلد 0..1
}
```

### ReportModel (خروجی تحلیل)
```ts
interface ReportModel {
  bill: BillData;
  tariffYear: number;               // 1405
  supplyCostRials: number;          // 13256
  zone: ZoneId; season: 'hot'|'normal';
  monthlyAvgKwh: number;
  patternLimitKwh: number;
  relativeToPattern: number;        // 0.43 → ۴۳٪ الگو
  tierBreakdown: { fromKwh:number; toKwh:number|null; kwh:number;
                   factor:number; rateRials:number; amountRials:number }[];
  computedEnergyRials: number;
  deviationPct: number | null;      // در برابر مبلغ روی قبض
  peakSurchargeRials?: number;
  offpeakDiscountRials?: number;
  recommendations: { title:string; detail:string; saveRialsPerPeriod?:number }[];
  llmNarrative?: string;
  warnings: string[];
}
```

## ۷. مقیاس‌پذیری و صف‌بندی

- فاز اول: یک پردازشگر در هر سکو (long-polling) + `Map<chatId, Session>` در حافظه.
- گلوگاه OCR: حداکثر ۳ پردازش هم‌زمان (`p-limit`-مانند دست‌ساز)؛ پیام «در صف هستید… موقعیت n».
- فاز ۲: انتقال پردازش به RabbitMQ موجود ریپازیتوری + worker مستقل.

## ۸. استقرار

| حالت | توضیح |
|------|-------|
| Docker (پیشنهادی) | `Dockerfile` سبک node:22-slim؛ فقط `node --experimental-strip-types src/index.ts` |
| PM2 | مطابق `ecosystem.config.js` الگوی ریپازیتوری |
| Bare | `pnpm --filter @xennic/bill-bot start` |

متغیرهای محیطی کلیدی در `services/bill-bot/.env.example` (توکن‌ها، آدرس vision-service، ادمین‌ها، فونت PDF، کلید LLM اختیاری).
