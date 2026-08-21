# بازارگاه — تصویر شاخص و آلبوم تصاویر محصول

> **ماژول بک‌اند:** `apps/api/src/modules/marketplace/`
> **بخش‌های فرانت‌اند:** `apps/web/src/features/admin/marketplace/` و
> `apps/web/src/features/marketplace/`
> **جدول جدید دیتابیس:** `product_images`
> **مهاجرت:** `prisma/migrations/20260821000000_marketplace_product_images/`

---

## ۱. خلاصه

تا پیش از این محصولات بازارگاه هیچ تصویری نداشتند و همه‌جا با آیکن `Package` نمایش داده
می‌شدند. این تغییر یک **آلبوم تصاویر** به محصول اضافه می‌کند که اولین تصویر آن **تصویر
شاخص (کاور)** است:

1. جدول `product_images` با حذف آبشاری، ترتیب و متن جایگزین دو زبانه.
2. دو شیء مقداری جدید در دامنه (`ProductImage`, `ProductGallery`) که ثابت‌های آلبوم را
   تضمین می‌کنند.
3. مسیرهای اختصاصی API برای مدیریت آلبوم + پشتیبانی از `images` در ایجاد/ویرایش محصول.
4. نمایش تصویر در پنل ادمین، پنل مدیریت فروشنده و فروشگاه عمومی (کارت و صفحهٔ محصول).

---

## ۲. مدل داده

```prisma
model product_images {
  id         String   @id @default(uuid())
  product_id String
  url        String
  alt_fa     String?
  alt_en     String?
  is_primary Boolean  @default(false)
  sort_order Int      @default(0)
  mime_type  String?
  file_size  Int?
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  product products @relation(fields: [product_id], references: [id], onDelete: Cascade)

  @@unique([product_id, url])
  @@index([product_id])
  @@index([product_id, sort_order])
}
```

- **حذف آبشاری:** با حذف فیزیکی محصول، ردیف‌های تصویر هم حذف می‌شوند.
- **یکتایی `[product_id, url]`:** یک آدرس دو بار در آلبوم یک محصول ثبت نمی‌شود.
- محدودیت طول آدرس (۲۰۴۸) و متن جایگزین (۳۰۰) در لایهٔ دامنه و DTO اعمال می‌شود.

---

## ۳. مدل دامنه

### `ProductImage` (Value Object)

`domain/value-objects/product-image.vo.ts`

| مسئولیت      | توضیح                                                                      |
| ------------ | -------------------------------------------------------------------------- |
| آدرس         | مطلق `http(s)://…` یا نسبی از ریشه (`/api/v1/storage/files/…/download`)    |
| طول‌ها       | `url` ≤ ۲۰۴۸، `altFa`/`altEn` ≤ ۳۰۰ کاراکتر، `trim` خودکار                 |
| فرمت‌ها      | `image/jpeg, png, webp, gif, avif, svg+xml` (`SUPPORTED_IMAGE_MIME_TYPES`) |
| تغییرناپذیری | همهٔ فیلدها `readonly`؛ تغییر جزئی با `with(patch)`                        |
| متن جایگزین  | `altFor(locale)` با fallback به زبان دیگر                                  |

آدرس‌های `//cdn/…`، `ftp://…` و `javascript:…` رد می‌شوند.

### `ProductGallery` (Collection Value Object)

`domain/value-objects/product-gallery.vo.ts` — تنها جایی که ثابت‌های آلبوم اعمال می‌شود:

1. `sortOrder` همیشه پیوسته و از صفر است (`0..n-1`).
2. آلبوم غیرخالی دقیقاً **یک** تصویر شاخص دارد.
3. تصویر شاخص همیشه **اول** فهرست است.
4. آدرس تکراری پذیرفته نمی‌شود.
5. حداکثر `MAX_PRODUCT_IMAGES = 12` تصویر.

مانند ترجمه‌ها، دو مسیر ساخت دارد:

- `create(items)` — ورودی کاربر، خطای `BadRequestException`.
- `fromPersistence(items)` — ردیف‌های خراب/تکراری/مازاد دیتابیس بی‌صدا نادیده گرفته می‌شوند
  تا دادهٔ قدیمی هرگز یک مسیر خواندن را نشکند.

متدهای تغییردهنده (`add`, `update`, `remove`, `setPrimary`, `reorder`) همگی یک آلبوم
**جدید** برمی‌گردانند.

### `ProductEntity`

- `gallery` / `images` / `primaryImage` / `primaryImageUrl`
- `addImage`, `updateImage`, `removeImage`, `setPrimaryImage`, `reorderImages`,
  `replaceImages`, `findImage`
- هر تغییر آلبوم `updatedAt` را به‌روزرسانی می‌کند.

---

## ۴. API

همهٔ مسیرها زیر `/api/v1` و پشت `JwtAuthGuard` هستند.

| متد      | مسیر                                    | توضیح                                         |
| -------- | --------------------------------------- | --------------------------------------------- |
| `GET`    | `/products/:id/images`                  | آلبوم مرتب‌شده (شاخص در ابتدا)                |
| `POST`   | `/products/:id/images`                  | افزودن تصویر (اولین تصویر خودکار شاخص می‌شود) |
| `PATCH`  | `/products/:id/images/:imageId`         | ویرایش متن جایگزین / ترتیب / شاخص‌بودن        |
| `DELETE` | `/products/:id/images/:imageId`         | حذف تصویر از آلبوم                            |
| `PUT`    | `/products/:id/images/order`            | چیدمان مجدد؛ `imageIds[0]` شاخص می‌شود        |
| `PUT`    | `/products/:id/images/:imageId/primary` | انتخاب تصویر شاخص                             |

علاوه بر این، `POST /products` و `PATCH /products/:id` فیلد اختیاری `images` را می‌پذیرند.
**ارسال `images` در ویرایش یعنی جایگزینی کامل آلبوم** (همان قرارداد `translations`). برای
حفظ شناسهٔ ردیف‌های موجود، `id` تصویر را هم در آرایه بفرستید.

### بارگذاری و تحویل تصویر

آپلود از مسیر موجود `POST /storage/upload` انجام می‌شود (endpoint آپلود جدیدی اضافه نشده)،
اما **آدرسی که ذخیره می‌شود** آدرس تحویل عمومی است:

```
/api/v1/storage/public/images/:fileId
```

چرا نه دو گزینهٔ دیگر؟

| گزینه                                | مشکل                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------ |
| `downloadUrl` بازگشتی از آپلود       | URL امضاشدهٔ MinIO است و بعد از **یک ساعت** منقضی می‌شود                 |
| `/api/v1/storage/files/:id/download`  | پشت `JwtAuthGuard` + `files.read` است و تگ `<img>` هدر Authorization ندارد |

مسیر `GET /storage/public/images/:id` (کنترلر `StoragePublicController`) بدون احراز هویت
است ولی **فقط** فایل‌هایی را سرو می‌کند که هم‌زمان:

1. حذف نشده باشند،
2. در باکت `public` باشند (باکت پیش‌فرض آپلود),
3. mime آن‌ها `image/*` باشد.

پاسخ با `Content-Disposition: inline` و `Cache-Control: public, max-age=86400, immutable`
برمی‌گردد. اسناد و فایل‌های غیرتصویری از این مسیر قابل دریافت نیستند.

> **پیش‌نیاز محلی:** بارگذاری فایل به MinIO نیاز دارد. اگر MinIO بالا نباشد آپلود با
> `503 Storage service unavailable` شکست می‌خورد و رابط کاربری پیام «سرویس ذخیره‌سازی فایل
> (MinIO) در دسترس نیست» را نشان می‌دهد؛ در این حالت می‌توان تصویر را با **آدرس** اضافه کرد.

### قرارداد پاسخ

پاسخ محصول (ادمین و عمومی) دو فیلد جدید دارد:

```jsonc
{
  "id": "…",
  "sku": "CABLE-35",
  "primaryImageUrl": "https://cdn.example.com/a.jpg", // میان‌بر کاور، یا null
  "images": [
    {
      "id": "…",
      "url": "https://cdn.example.com/a.jpg",
      "altFa": "کابل مسی ۳۵",
      "altEn": "Copper cable 35",
      "isPrimary": true,
      "sortOrder": 0,
      "mimeType": "image/jpeg",
      "fileSize": 20481,
    },
  ],
}
```

---

## ۵. لایهٔ Repository

- همهٔ مسیرهای خواندن محصول (`findProductById`, `findProductBySku`, `searchProducts`,
  `suggestProducts` و سه مسیر عمومی) با `include: { images: true }` اجرا می‌شوند.
- `saveProductImages(productId, images)` کل آلبوم را در **یک `$transaction`** آینه می‌کند:
  ابتدا `deleteMany` روی ردیف‌هایی که در مجموعهٔ نگه‌داشته‌شده نیستند، سپس `upsert` تک‌تک
  تصاویر. این کار لازم است چون در چیدمان مجدد، `sort_order` و `is_primary` جابه‌جا می‌شوند
  و جدول کلید یکتای `[product_id, url]` دارد.
- `saveProduct` پس از ذخیرهٔ محصول، `saveProductImages` را صدا می‌زند.

---

## ۶. رابط کاربری

| محل                                 | رفتار                                                                 |
| ----------------------------------- | --------------------------------------------------------------------- |
| پنل ادمین → فروشگاه → محصولات       | ستون محصول بندانگشتی کاور و تعداد تصاویر را نشان می‌دهد               |
| ویرایشگر محصول ادمین                | بخش «تصاویر محصول»: بارگذاری فایل یا افزودن با آدرس، کاور، ترتیب، حذف |
| داشبورد → بازارگاه → مدیریت محصولات | کارت محصول با بندانگشتی کاور                                          |
| داشبورد → جزئیات محصول              | کاور + مدیریت زندهٔ آلبوم روی endpointهای اختصاصی                     |
| فروشگاه عمومی → کارت محصول          | کاور با نسبت ۴:۳، نشان `+n` برای تصاویر بیشتر، fallback به آیکن       |
| فروشگاه عمومی → صفحهٔ محصول         | نمایش‌گر آلبوم (تصویر بزرگ + نوار بندانگشتی)                          |

منطق مشترک سمت وب در `apps/web/src/features/marketplace/lib/product-images.ts` است
(`normalizeImages`, `setPrimaryImage`, `moveImage`, `removeImageAt`, `isValidImageUrl`,
`altFor`, `publicImageUrl`, `uploadErrorMessage`) و همان ثابت‌های دامنه را آینه می‌کند. تصاویر خراب با `onError` به حالت آیکن
جایگزین برمی‌گردند.

---

## ۷. تست

`cd apps/api && npx jest --testPathPattern "modules/marketplace"` → **۱۳ سوئیت / ۲۷۶ تست**

تست‌های افزوده‌شده:

| فایل                             | پوشش                                                           |
| -------------------------------- | -------------------------------------------------------------- |
| `product-image.vo.spec.ts`       | نرمال‌سازی آدرس/فرمت/متن جایگزین، `with`, `altFor`, `toJSON`   |
| `product-gallery.vo.spec.ts`     | ثابت‌های آلبوم، مسیر بردبار، add/update/remove/primary/reorder |
| `product.entity.spec.ts`         | متدهای آلبوم روی انتیتی و عدم تغییر جزئی هنگام خطا             |
| `product.service.spec.ts`        | ذخیره‌سازی آلبوم در create/update و شش عمل آلبوم               |
| `products.controller.spec.ts`    | شش مسیر جدید + `images`/`primaryImageUrl` در پاسخ              |
| `marketplace.repository.spec.ts` | هیدراسیون آلبوم، تراکنش ذخیره، حذف ردیف‌های خراب               |
| `product-image.dto.spec.ts`      | اعتبارسنجی DTOها شامل رد فیلدهای ناشناخته                      |
