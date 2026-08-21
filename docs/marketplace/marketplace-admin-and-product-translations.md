# بازارگاه — پنل ادمین و ترجمهٔ محصول (fa/en)

> **ماژول بک‌اند:** `apps/api/src/modules/marketplace/`
> **بخش فرانت‌اند:** `apps/web/src/features/admin/marketplace/`
> **جدول‌های دیتابیس:** `vendors`, `products`, `product_translations` (همگی از قبل در
> `prisma/schema.prisma` موجود بودند — مهاجرت جدیدی لازم نیست)

---

## ۱. خلاصه

پیش از این، جدول `product_translations` فقط در مسیر **فروشگاه عمومی** (`public-marketplace`)
خوانده می‌شد و هیچ مسیری برای **نوشتن** ترجمه وجود نداشت؛ همچنین پنل ادمین بخشی برای مدیریت
کاتالوگ بازارگاه نداشت. این تغییر:

1. ترجمهٔ محصول را به‌صورت کامل در بک‌اند پیاده می‌کند (Value Object، Entity، DTO، Service،
   Repository، Controller).
2. بخش «فروشگاه (بازارگاه)» را به پنل ادمین اضافه می‌کند: مدیریت محصولات (افزودن/ویرایش/حذف +
   مشخصات فنی + ترجمهٔ fa/en) و مدیریت فروشندگان.

---

## ۲. مدل دامنه

### `ProductTranslation` (Value Object)

`apps/api/src/modules/marketplace/domain/value-objects/product-translation.vo.ts`

تمام دغدغه‌های زبان در بازارگاه در همین شیء مقداری متمرکز است:

| مسئولیت               | توضیح                                                                    |
| --------------------- | ------------------------------------------------------------------------ |
| زبان‌های پشتیبانی‌شده | `fa` و `en` (`SUPPORTED_PRODUCT_LOCALES`) — زبان پیش‌فرض `fa`            |
| نرمال‌سازی            | `fa-IR` → `fa`، `EN` → `en`، `en_US` → `en`                              |
| اعتبارسنجی            | عنوان اجباری و ≤ ۲۰۰ کاراکتر، توضیحات ≤ ۴۰۰۰ کاراکتر، `trim` خودکار      |
| زنجیرهٔ fallback      | درخواستی → `fa` → `en` → اولین ترجمهٔ موجود                              |
| مسیر سخت‌گیر          | `create` / `collection` → ورودی کاربر، خطای `BadRequestException`        |
| مسیر بردبار           | `fromPersistence` → ردیف‌های نامعتبر دیتابیس نادیده گرفته می‌شوند نه خطا |

### `ProductEntity`

انتیتی حالا مجموعهٔ ترجمه‌ها را نگه می‌دارد و تنها از طریق API خودش تغییر می‌کند:

- `translations` — کپی دفاعی، همیشه به ترتیب `fa` سپس `en`
- `translationFor(locale)` — با زنجیرهٔ fallback
- `findTranslation(locale)` / `hasTranslation(locale)` — تطبیق دقیق، بدون fallback
- `upsertTranslation(...)` / `removeTranslation(locale)` / `replaceTranslations(list)`
- `titleFor(locale)` — در نبود ترجمه به `sku` برمی‌گردد

> **نکته:** `reconstitute` از مسیر بردبار استفاده می‌کند، بنابراین دادهٔ قدیمی (مثلاً locale
> پشتیبانی‌نشده) هرگز یک مسیر خواندن را نمی‌شکند.

---

## ۳. API

همهٔ مسیرها زیر `/api/v1` و پشت `JwtAuthGuard` هستند.

| متد      | مسیر                              | توضیح                                                       |
| -------- | --------------------------------- | ----------------------------------------------------------- |
| `GET`    | `/products?locale=fa`             | جستجو؛ `q` روی `sku` و عنوان/توضیح ترجمه‌ها هم اعمال می‌شود |
| `GET`    | `/products/:id?locale=en`         | دریافت محصول با عنوان resolve‌شده                           |
| `POST`   | `/products`                       | ایجاد + آرایهٔ اختیاری `translations`                       |
| `PATCH`  | `/products/:id`                   | بروزرسانی؛ ارسال `translations` کل مجموعه را جایگزین می‌کند |
| `DELETE` | `/products/:id`                   | حذف نرم (بایگانی)                                           |
| `GET`    | `/products/:id/translations`      | فهرست ترجمه‌ها                                              |
| `GET`    | `/products/:id/translations/:loc` | یک ترجمه (تطبیق دقیق، بدون fallback)                        |
| `PUT`    | `/products/:id/translations/:loc` | ایجاد یا جایگزینی ترجمهٔ یک زبان                            |
| `DELETE` | `/products/:id/translations/:loc` | حذف ترجمهٔ یک زبان                                          |
| `DELETE` | `/vendors/:id`                    | حذف فروشنده — تا وقتی محصولی دارد رد می‌شود (`409`)         |

### قرارداد پاسخ

انتیتی‌های دامنه حالت خود را در فیلدهای خصوصی نگه می‌دارند؛ بازگرداندن مستقیم آن‌ها از
کنترلر باعث می‌شد پاسخ به شکل `_sku` / `_price` سریالایز شود. حالا
`presentation/mappers/marketplace.mapper.ts` قرارداد عمومی را می‌سازد:

```jsonc
{
  "id": "…",
  "vendorId": "…",
  "sku": "CABLE-35",
  "price": 4900000,
  "currency": "IRR",
  "status": "active",
  "specifications": { "cable_size_mm2": 35 },
  "title": "کابل مسی ۳۵", // resolve‌شده با locale درخواستی
  "description": "عایق XLPE",
  "resolvedLocale": "fa", // زبانی که واقعاً استفاده شد (یا null)
  "translations": [{ "locale": "fa", "title": "…", "description": "…" }],
}
```

---

## ۴. لایهٔ Repository

- `findProductById` / `findProductBySku` / `searchProducts` / `suggestProducts` حالا
  `translations` را `include` می‌کنند.
- `saveProduct` مجموعهٔ ترجمهٔ انتیتی را روی جدول آینه می‌کند: زبان‌های غایب حذف و بقیه upsert
  می‌شوند (`_syncProductTranslations`).
- متدهای هدفمند برای نوشتن یک زبان: `upsertProductTranslation`، `deleteProductTranslation`،
  `findProductTranslations`.
- پشتیبانی از گارد حذف فروشنده: `countVendorProducts(vendorId, includeDeleted)` و `deleteVendor`.

---

## ۵. قواعد کسب‌وکار افزوده‌شده

| قاعده                                                         | خطا                 |
| ------------------------------------------------------------- | ------------------- |
| ایجاد محصول با `vendorId` ناموجود                             | `404 NotFound`      |
| ایجاد محصول با `sku` تکراری                                   | `409 Conflict`      |
| زبان پشتیبانی‌نشده در هر عملیات نوشتن                         | `400 BadRequest`    |
| گرفتن/حذف ترجمه‌ای که وجود ندارد                              | `404 NotFound`      |
| حذف فروشنده‌ای که هنوز محصول دارد                             | `409 Conflict`      |
| `VendorEntity.slugify` — همان slug در بررسی تکراری و در ذخیره | رفع ناسازگاری پیشین |

---

## ۶. پنل ادمین

بخش جدید **«فروشگاه (بازارگاه)»** در `admin-client.tsx` ثبت شده و مسیر مستقیم
`/{locale}/admin/marketplace` هم دارد.

```
apps/web/src/features/admin/marketplace/
├── marketplace-admin-section.tsx   # تب‌های محصولات / فروشندگان
├── products-panel.tsx              # جدول، فیلترها، CRUD محصول
├── product-editor.tsx              # مودال: فیلدهای پایه + مشخصات + ترجمه fa/en
├── spec-editor.tsx                 # ویرایشگر کلید/مقدار مشخصات فنی
├── vendors-panel.tsx               # CRUD فروشنده
├── marketplace-admin-api.ts        # لایهٔ فراخوانی API
└── types.ts                        # قرارداد تایپ‌ها، برچسب‌ها، پیش‌تنظیم مشخصات
```

نکات رفتاری:

- **ویرایشگر مشخصات فنی** مقدارهای عددی و بولی را تبدیل نوع می‌کند تا موتور پیشنهاد محصول
  (`SPEC_MATCH_RULES`) بتواند آن‌ها را با نتیجهٔ محاسبات مقایسه کند؛ دکمهٔ «کلیدهای پیشنهادی
  دسته» همان کلیدهای شناخته‌شدهٔ هر دسته را اضافه می‌کند.
- **تب‌های ترجمه** وضعیت پرشدن هر زبان را با نقطهٔ رنگی نشان می‌دهند. زبانی که عنوانش خالی
  بماند ارسال نمی‌شود؛ در حالت ویرایش یعنی آن ترجمه حذف می‌شود.
- دکمهٔ «حذف ترجمهٔ …» مستقیماً `DELETE /products/:id/translations/:locale` را صدا می‌زند.
- جدول محصولات با انتخاب‌گر زبان، عنوان resolve‌شده را در همان زبان نشان می‌دهد.

---

## ۷. تست

```bash
cd apps/api && npx jest --testPathPattern "modules/marketplace"   # 151 تست
pnpm validate:arch                                                # باید exit 0 بدهد
```

پوشش تست‌های جدید:

| فایل                             | محور                                                       |
| -------------------------------- | ---------------------------------------------------------- |
| `product-translation.vo.spec.ts` | نرمال‌سازی locale، اعتبارسنجی، مسیر سخت‌گیر/بردبار         |
| `product.entity.spec.ts`         | زنجیرهٔ fallback، upsert/remove/replace، کپی دفاعی         |
| `product.service.spec.ts`        | CRUD + قواعد ترجمه + گاردهای vendor/sku                    |
| `vendor.service.spec.ts`         | slugify، تکراری‌بودن slug، گارد حذف فروشنده                |
| `products.controller.spec.ts`    | قرارداد سریالایز، resolve بر اساس locale، مسیرهای ترجمه    |
| `marketplace.repository.spec.ts` | آینه‌کردن ترجمه‌ها، جستجوی چندزبانه، شمارش محصولات فروشنده |
