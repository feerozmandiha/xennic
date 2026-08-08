Landing CMS — ویرایش محتوای صفحه فرود
به ادمین اجازه می‌دهد پوسته صفحه لندینگ (لوگو، فاوآیکون، متادیتا، هدر، هرو،
محاسبات، ویژگی‌ها، CTA، فوتر) را از مسیر مستقل /fa/admin/landing ویرایش،
ذخیره و منتشر کند.

پرهیز از کد تکراری
برای جلوگیری از پیاده‌سازی موازی، این قابلیت از endpointها و کامپوننت‌های موجود
استفاده می‌کند:

مقالات در CMS ذخیره نمی‌شوند؛ همان ArticlesSection از
GET /public/knowledge?limit=3 استفاده می‌کند.
پلن‌های قیمت‌گذاری در CMS ذخیره نمی‌شوند؛ همان PricingSection از
GET /subscriptions/plans (یا داده ثابت فعلی) استفاده می‌کند.
آپلود فایل از MinioService و جدول files در ماژول storage استفاده
می‌کند (باکت public، workspace سیستمی با کد XENNIC).
تنظیمات کلی سیستم همچنان از GET/PUT /admin/settings می‌آید و دست‌نخورده است.
بخش‌های قابل ویرایش در CMS
برندینگ: نام، شعار، لوگو، فاوآیکون
سئو: title، description، keywords، og:image
هدر: لینک‌ها، نمایش تغییر زبان/تم، دکمه CTA
هرو: badge، عنوان، کلمه هایلایت، زیرعنوان، دو دکمه، تصویر پس‌زمینه، آمار
محاسبات: فهرست محاسبات نمایشی (کد، عنوان، فرمول)
ویژگی‌ها: کارت‌ها (آیکون، عنوان، توضیح)
CTA و فوتر
دسترسی
دو راه برای باز کردن ویرایشگر:

مستقیم: /{locale}/admin/landing
پنل ادمین /{locale}/admin ← آیتم منوی «صفحه فرود (CMS)» (در یک iframe باز می‌شود)
این صفحه مانند admin/page.tsx با JwtAuthGuard و AdminGuard محافظت می‌شود
و قبل از بارگذاری، دسترسی ادمین را با GET /admin/check بررسی می‌کند.

API
GET /api/v1/landing/content?locale=fa — محتوای منتشرشده (عمومی)
GET /api/v1/admin/landing/content — پیش‌نویس
PUT /api/v1/admin/landing/content — ذخیره پیش‌نویس
POST /api/v1/admin/landing/publish — انتشار
POST /api/v1/admin/landing/reset — بازنشانی
POST /api/v1/admin/landing/assets (multipart file) — آپلود تصویر
اعمال تغییرات
Bash

# به‌جای prisma migrate dev (که روی shadow DB قدیمی گیر می‌کند):

pnpm db:apply # = prisma db push + prisma generate + seed
pnpm dev
یا مستقیم:

Bash

psql "$DATABASE_URL" -f prisma/migrations/20260808120000_landing_cms/migration.sql
pnpm db:generate
pnpm db:seed # برای اطمینان از workspace با کد XENNIC
pnpm dev
صفحه لندینگ هنگام در دسترس نبودن API، با مقادیر پیش‌فرض رندر می‌شود.
