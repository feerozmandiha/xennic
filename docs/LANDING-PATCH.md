# Landing Page Patch

## فایل‌های جدید

```
apps/web/src/features/landing/components/landing-page.tsx   ← کامپوننت اصلی
apps/web/src/app/[locale]/(landing)/page.tsx                ← route
apps/web/src/app/[locale]/(landing)/layout.tsx              ← layout بدون sidebar
apps/web/src/app/globals.css                                ← smooth-scroll اضافه شد
```

## دستورات اعمال

```bash
cd ~/xennic

# ۱. ساخت دایرکتوری‌های جدید
mkdir -p "apps/web/src/app/[locale]/(landing)"
mkdir -p apps/web/src/features/landing/components

# ۲. کپی فایل‌های جدید
cp xennic-patch/apps/web/src/features/landing/components/landing-page.tsx \
   apps/web/src/features/landing/components/landing-page.tsx

cp "xennic-patch/apps/web/src/app/[locale]/(landing)/page.tsx" \
   "apps/web/src/app/[locale]/(landing)/page.tsx"

cp "xennic-patch/apps/web/src/app/[locale]/(landing)/layout.tsx" \
   "apps/web/src/app/[locale]/(landing)/layout.tsx"

cp xennic-patch/apps/web/src/app/globals.css \
   apps/web/src/app/globals.css

# ۳. حذف page.tsx قدیمی (مهم — conflict می‌دهد)
rm "apps/web/src/app/[locale]/page.tsx"
```

## نتیجه

- `/fa` → Landing Page (Dark Premium)
- `/fa/login` → صفحه ورود
- `/fa/register` → صفحه ثبت‌نام
- `/fa/dashboard` → داشبورد (نیاز به login)

## بخش‌های Landing

1. **Navbar** — fixed، blur، mobile drawer
2. **Hero** — headline gradient، terminal typewriter، CTA
3. **Features** — ۶ کارت با آیکون و glow
4. **Stats** — ۴ عدد با IntersectionObserver
5. **Calculator Catalog** — ۴ دسته‌بندی
6. **Pricing** — ۳ پلن (Free / Pro / Enterprise)
7. **CTA Banner** — دکمه ثبت‌نام
8. **Footer** — لینک‌ها و status
