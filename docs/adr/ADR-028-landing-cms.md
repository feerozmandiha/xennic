# ADR-028: Landing CMS

- **ID:** ADR-028
- **Title:** Landing CMS — ویرایش هدر/فوتر/بخش‌های صفحه‌ی فرود از پنل ادمین
- **Status:** ACCEPTED
- **Date:** 2026-08-16
- **Decision makers:** Arena Agent, Owner
- **Related:** ADR-020 (Architecture Governance), ADR-021 (File/Document/Asset Platform), `docs/governance/arena-development-branch-kickoff.md`

---

## Context

صفحه‌ی فرود و هدر/فوتر سایت به‌صورت hard-code در `apps/web/src/features/landing/`
نگهداری می‌شدند و هر تغییر نیازمند انتشار مجدد فرانت بود. مالک محصول می‌خواهد:

- هدر، فوتر و بخش‌های داخلی صفحه‌ی فرود از پنل ادمین قابل ویرایش باشند.
- رسانه‌ها (تصاویر) در **فضای ذخیره فایل محلی** نگه‌داری شوند.
- ساختار مدرن، قابل توسعه و هم‌خوان با DDD پروژه باشد.

## Decision

ایجاد یک ماژول اختصاصی CMS در `apps/api/src/modules/cms/` با مدل بلوکی (Block-based):

1. **جدول دیتابیس** `cms_content` با کلید یکتای `(slot, locale)` و یک ستون
   `document JSONB` که کل سند بلوک‌ها را نگه می‌دارد.
2. **ساختار سند** `xennic-cms/v1`:
   ```json
   { "schema": "xennic-cms/v1", "meta": {}, "blocks": [ { "type", "id", "props", "children" } ] }
   ```
3. **سه slot رسمی**:
   - `site/header` — منو و دکمه‌های نوار بالا
   - `site/footer` — ستون‌ها و لینک‌های پاورقی
   - `landing/page` — کل صفحه‌ی فرود (hero, features, pricing, cta, faq, ...)
4. **ذخیره‌سازی فایل محلی**: `LocalBlobStorage` در
   `infrastructure/storage/local-blob.storage.ts` که فایل‌های رسانه را در
   `CMS_STORAGE_PATH` (پیش‌فرض `./storage/cms`) می‌ریزد و از طریق
   `GET /api/v1/cms/media/*` سرو می‌کند.
5. **اندپوینت‌های عمومی** (بدون احراز هویت):
   - `GET /cms/content/:slot?locale=fa`
   - `GET /cms/media/*`
6. **اندپوینت‌های ادمین** با `JwtAuthGuard + AdminGuard`:
   - CRUD روی `admin/cms/content`
   - publish/unpublish
   - آپلود رسانه `admin/cms/media`
7. **فرانت**:
   - `CmsLandingPage` صفحه‌ی فرود را data-driven می‌کند.
   - `CmsHeader` و `CmsFooter` در layout همه‌ی صفحات public جایگذاری می‌شوند.
   - پنل ویرایش در مسیر `/[locale]/admin/cms` با کتابخانه‌ی بلوک‌ها و ویرایشگر پراپرتی.
8. **پیش‌فرض‌های محتوایی** در `default-content.ts` تا در نبود رکورد، سایت خالی نماند.

## Consequences

### مثبت

- ✅ ویرایش هدر/فوتر/صفحه‌ی فرود بدون نیاز به انتشار مجدد کد.
- ✅ ساختار بلوکی قابل توسعه (افزودن نوع بلوک جدید فقط با ثبت در رجیستری).
- ✅ رسانه‌ها در فایل‌سیستم محلی ذخیره می‌شوند (مطابق درخواست) و در آینده می‌توان
  `LocalBlobStorage` را با پیاده‌سازی MinIO/S3 هم‌ساختار جایگزین کرد.
- ✅ چندزبانه (`locale`) و نسخه‌بندی خودکار اسناد.
- ✅ بدون وابستگی جدید سنگین (ادیتور از DOM بومی استفاده می‌کند).

### منفی / هزینه

- ⚠️ JSON schema به‌صورت دستی در DTO اعتبارسنجی می‌شود؛ در آینده می‌توان از Zod استفاده کرد.
- ⚠️ در صورت نبود MinIO در محیط توسعه، رسانه‌ها فقط local هستند (عمدی).
- ⚠️ صفحه‌ی فرود قدیمی (`features/landing/...`) با محتوای CMS جایگزین شد؛ کامپوننت‌های
  قدیمی به‌عنوان مرجع در درخت باقی ماندند اما استفاده نمی‌شوند.

## Alternatives Considered

1. **استفاده از یک CMS آماده (Strapi/Payload)**: رد شد — وابستگی سنگین و جدا بودن از
   مدل احراز هویت پروژه.
2. **ذخیره در `system_settings` به‌صورت کلید/مقدار**: رد شد — نیاز به version و
   publish state و slot/locale جداگانه.
3. **ادامه‌ی hard-code**: رد شد — هدف اصلی قابلیت ویرایش توسط غیرتوسعه‌دهندگان.
