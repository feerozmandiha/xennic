# Knowledge Rich Content — Phase K5

> **نوع سند:** گزارش تاریخی تحویل K5، نه گزارش وضعیت کل سامانه. مسیرها و رفتارهای این سند در
> بازبینی منبع در ۲۰۲۶-۰۸-۱۹ دوباره تطبیق داده شده‌اند؛ تعداد تست‌ها و خروجی‌های بخش‌های ۶ و ۷
> snapshot زمان تحویل K5 هستند. برای وضعیت runtime فعلی CMS، Intelligence و Factory به
> [`knowledge-runtime-audit.md`](./knowledge-runtime-audit.md) مراجعه کنید.

> فعال‌سازی جداول دانشنامه که در `prisma/schema.prisma` تعریف شده بودند اما هیچ API نداشتند.

## ۱. مسئله

ماژول `knowledge` هستهٔ کاملی داشت (CRUD، workflow، نسخه‌ها، نظرات، آنالیتیکس، taxonomy، standards)
اما پنج قابلیت داده‌ای در schema تعریف شده و بدون استفاده مانده بودند:

| جدول                          | وضعیت پیش از K5                                          |
| ----------------------------- | -------------------------------------------------------- |
| `knowledge_translations`      | هیچ ارجاعی در کد نبود — چندزبانگی غیرفعال                |
| `knowledge_media`             | هیچ ارجاعی در کد نبود                                    |
| `knowledge_formulas`          | فقط خواندن `calculator_type` در `getRelatedCalculations` |
| `knowledge_examples`          | فقط خواندن `calculator_type` در `getRelatedCalculations` |
| `knowledge_comments.liked_by` | ستون وجود داشت، `likes` همیشه صفر می‌ماند                |

## ۲. معماری

لایه‌بندی DDD موجود ماژول حفظ شده و یک aggregate جدید اضافه نشده است: این جداول
فرزندان همان aggregate root یعنی `knowledge` هستند.

```
knowledge/
├── domain/
│   ├── interfaces/
│   │   └── knowledge-content.repository.interface.ts   ← قرارداد + رکوردهای دامنه
│   └── value-objects/
│       └── knowledge-locale.vo.ts                      ← قواعد زبان و fallback
├── application/services/
│   └── knowledge-content.service.ts                    ← منطق کسب‌وکار
├── infrastructure/repositories/
│   └── knowledge-content.repository.ts                 ← Prisma
└── presentation/
    ├── controllers/knowledge-content.controller.ts
    └── dtos/knowledge-content.dto.ts
```

### تصمیم‌های کلیدی

1. **بدون aggregate جدید** — همهٔ رکوردها از طریق `knowledge_id` به root وصل‌اند.
   `KnowledgeContentService` پیش از هر عملیات، root را با `KnowledgeService.findOne()`
   واکشی می‌کند که خودش ایزولاسیون `workspace_id` و soft-delete را اعمال می‌کند.

2. **بررسی دوگانهٔ مالکیت** — پس از احراز مالکیت root، سرویس بررسی می‌کند که رکورد فرزند
   واقعاً به همان مقاله تعلق دارد (`_assertOwnedBy`). این جلوی دسترسی افقی بین مقالات
   یک workspace را می‌گیرد.

3. **`KnowledgeLocale` به‌عنوان value object** — نرمال‌سازی (`FA`, `fa-IR`, `en_US` → `fa`/`en`)
   و زنجیرهٔ fallback در دامنه قرار گرفت تا سرویس و کنترلرهای عمومی رفتار یکسانی داشته باشند.

4. **بازسازی خودکار `search_text`** — فرمول‌ها و مثال‌ها محتوای قابل جست‌وجو هستند؛
   با هر تغییر، متن جست‌وجوی مقاله از محتوای اصلی + LaTeX + عنوان مثال‌ها بازسازی می‌شود
   (`KnowledgeService.updateSearchText`). این با جست‌وجوی tsvector موجود سازگار است.

5. **لایک idempotent** — لایک بر پایهٔ آرایهٔ `liked_by` است نه شمارندهٔ خام؛ لایک تکراری
   شمارش را تغییر نمی‌دهد و `likes` همیشه برابر `liked_by.length` است.

## ۳. زنجیرهٔ fallback زبان

```
درخواست 'en' → en → fa → (سایر زبان‌های پشتیبانی‌شده)
درخواست 'fa' → fa → en
زبان پشتیبانی‌نشده در endpoint عمومی → به‌جای خطا، زبان پیش‌فرض
```

پاسخ همیشه شفاف اعلام می‌کند چه چیزی سرو شده است:

```jsonc
{
  "requestedLocale": "en",
  "resolvedLocale": "fa",
  "isFallback": true,
  "availableLocales": ["en", "fa"],
}
```

اگر ترجمه‌ای برای زبان root وجود نداشته باشد، محتوای خود ردیف root سرو می‌شود.

## ۴. Endpointها

پایهٔ مسیرهای مدیریتی: `/api/v1/knowledge/:id` — همه با
`JwtAuthGuard + WorkspaceGuard + PermissionsGuard`. مسیر عمومی انتهای این بخش از این قاعده
مستثنا و عمداً بدون احراز هویت است.

### ترجمه‌ها

| Method | Path                      | Permission         |
| ------ | ------------------------- | ------------------ |
| GET    | `/translations`           | `knowledge.read`   |
| GET    | `/translations/:language` | `knowledge.read`   |
| PUT    | `/translations`           | `knowledge.update` |
| DELETE | `/translations/:language` | `knowledge.update` |
| GET    | `/localized?locale=`      | `knowledge.read`   |

`PUT` عملیات upsert است (کلید یکتا: `knowledge_id + language`).
حذف زبان اصلی مقاله با `400` رد می‌شود.

### رسانه / فرمول‌ها / مثال‌ها

| Method | Path                   | Permission         |
| ------ | ---------------------- | ------------------ |
| GET    | `/media`               | `knowledge.read`   |
| POST   | `/media`               | `knowledge.update` |
| PATCH  | `/media/:mediaId`      | `knowledge.update` |
| DELETE | `/media/:mediaId`      | `knowledge.update` |
| GET    | `/formulas`            | `knowledge.read`   |
| POST   | `/formulas`            | `knowledge.update` |
| PATCH  | `/formulas/:formulaId` | `knowledge.update` |
| DELETE | `/formulas/:formulaId` | `knowledge.update` |
| GET    | `/examples`            | `knowledge.read`   |
| POST   | `/examples`            | `knowledge.update` |
| PATCH  | `/examples/:exampleId` | `knowledge.update` |
| DELETE | `/examples/:exampleId` | `knowledge.update` |

فرمول‌ها و مثال‌ها می‌توانند با `calculatorType` به موتور محاسبات مهندسی وصل شوند —
همان چیزی که `GET /knowledge/by-calculator/:calculatorType` از قبل انتظارش را داشت.

### لایک نظرات

| Method | Path                        | Permission       |
| ------ | --------------------------- | ---------------- |
| POST   | `/comments/:commentId/like` | `knowledge.read` |
| DELETE | `/comments/:commentId/like` | `knowledge.read` |

پاسخ شامل `likes` و `likedByMe` است.

### عمومی (بدون احراز هویت)

| Method | Path                                        |
| ------ | ------------------------------------------- |
| GET    | `/public/knowledge/:slug/localized?locale=` |

فقط مقالات `published` + `public` را سرو می‌کند و از همان منطق fallback استفاده می‌کند.

> ⚠️ ترتیب مسیرها: `:slug/localized` پیش از `:slug` ثبت شده تا wildcard آن را نبلعد.

## ۵. اعتبارسنجی

چون API با `whitelist: true, forbidNonWhitelisted: true` اجرا می‌شود، همهٔ DTOها
با `class-validator` کاملاً پوشش داده شده‌اند:

- `language` در DTO ترجمه محدود به enum زبان‌های پشتیبانی‌شده است؛ پارامتر زبان مسیر نیز در
  service نرمال‌سازی و در صورت نامعتبر بودن با `400` رد می‌شود.
- `type` رسانه محدود به ۹ نوع مجاز schema است.
- `difficulty` مثال محدود به `basic | intermediate | advanced` است.
- `url` با `IsUrl({ require_tld: false })` اعتبارسنجی می‌شود تا آدرس‌های داخلی CDN هم پذیرفته شوند.
- برای فیلدهای متنی مرتبط کران طول تعریف شده است.

## ۶. تست‌ها (snapshot تحویل K5)

| فایل                                   | تعداد  |
| -------------------------------------- | ------ |
| `knowledge-locale.vo.spec.ts`          | ۲۱     |
| `knowledge-content.service.spec.ts`    | ۴۵     |
| `knowledge-content.controller.spec.ts` | ۲۰     |
| **مجموع جدید**                         | **۸۶** |
| مجموع ماژول Knowledge                  | ۱۵۸    |

پوشش شامل: نرمال‌سازی زبان، زنجیرهٔ fallback، ایزولاسیون workspace، رد رکورد متعلق به
مقالهٔ دیگر، ممانعت از حذف زبان اصلی، idempotent بودن لایک/آنلایک، و بازسازی `search_text`.

فرمان معادل در workspace فعلی:

```bash
corepack pnpm --filter @xennic/api exec jest --runInBand src/modules/knowledge
```

## ۷. اعتبارسنجی ثبت‌شده در زمان تحویل K5

در گزارش اولیهٔ K5، `validate:arch` بدون نقض، typecheck بدون خطا و lint ماژول Knowledge تمیز
ثبت شده بود. این موارد شواهد تاریخی همان تحویل‌اند و نباید به‌عنوان نتیجهٔ اجرای فعلی کل API
تفسیر شوند؛ محدودیت‌ها و نتایج اعتبارسنجی فعلی در
[`knowledge-runtime-audit.md`](./knowledge-runtime-audit.md) ثبت می‌شوند.

این فاز migration جدیدی نداشت؛ جداول مربوط از قبل در `prisma/schema.prisma` موجود بودند.
