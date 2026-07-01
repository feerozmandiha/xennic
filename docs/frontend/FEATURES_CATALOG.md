# Frontend Features Catalog — کاتالوگ ویژگی‌های فرانت‌اند

**نسخه**: ۱.۰.۰ | **تعداد صفحات**: ۴۴ | **تعداد featureها**: ۲۰

---

## صفحات (Pages/Routes)

### عمومی
| مسیر | توضیح |
|------|-------|
| `[locale]/(landing)/` | صفحه اصلی پلتفرم |
| `[locale]/(public)/about` | درباره ما |
| `[locale]/(public)/contact` | تماس با ما |
| `[locale]/(public)/knowledge` | دانش فنی عمومی |
| `[locale]/(public)/knowledge/[id]` | جزئیات مقاله دانش |

### احراز هویت
| مسیر | توضیح |
|------|-------|
| `[locale]/(auth)/login` | ورود |
| `[locale]/(auth)/register` | ثبت‌نام |
| `[locale]/(auth)/forgot-password` | فراموشی رمز |

### پیش‌نمایش عمومی
| مسیر | توضیح |
|------|-------|
| `public/calculations/sample/cable-sizing` | نمونه محاسبه کابل |
| `public/calculations/sample/transformer-load` | نمونه محاسبه ترانس |

### داشبورد
| مسیر | توضیح |
|------|-------|
| `dashboard` | داشبورد اصلی |
| `engineering` | محاسبات مهندسی |
| `power-system` | سیستم قدرت |
| `energy` | تحلیل انرژی/قبض |
| `ai` | هوش مصنوعی |
| `vision` | OCR و بینایی |
| `projects` | پروژه‌ها |
| `projects/[id]` | جزئیات پروژه |
| `marketplace` | بازارگاه |
| `marketplace/orders` | سفارش‌ها |
| `marketplace/products/[id]` | جزئیات محصول |
| `marketplace/products/new` | ثبت محصول جدید |
| `consultations` | مشاوره‌ها |
| `knowledge-manage` | مدیریت دانش |
| `knowledge-manage/new` | ایجاد مقاله جدید |
| `knowledge-manage/[id]` | ویرایش مقاله |
| `search` | جستجو |
| `storage` | مدیریت فایل‌ها |
| `billing` | صورتحساب |
| `billing/checkout` | پرداخت |
| `notifications` | اعلان‌ها |
| `settings` | تنظیمات |
| `workspace` | فضای کاری |
| `workspaces/new` | ایجاد workspace جدید |
| `admin` | پنل ادمین |

---

## کامپوننت‌های UI (مشترک)

| کامپوننت | کاربرد |
|----------|--------|
| `badge`, `button` | المان‌های پایه |
| `card` | کارت‌های نمایش |
| `command-palette` | جستجوی سریع (Cmd+K) |
| `dialog` | مودال‌ها |
| `input`, `link` | فرم‌ها |
| `page-header` | هدر صفحات |
| `separator` | جداکننده |
| `skeleton` | لودینگ |
| `toast` | نوتیفیکیشن |

## کامپوننت‌های Layout

| کامپوننت | توضیح |
|----------|--------|
| `auth-guard` | گارد احراز هویت |
| `language-switcher` | تغییر زبان |
| `sidebar` | نوار کناری |
| `theme-toggle` | تغییر تم |
| `topbar` | نوار بالا |
| `user-status` | وضعیت کاربر |

## Providers

| Provider | توضیح |
|----------|--------|
| `query-provider` | TanStack Query |
| `theme-provider` | تم (dark/light) |
| `toast-provider` | Toast notifications |

---

## کامپوننت‌های Feature

| Feature | کامپوننت‌ها |
|---------|-------------|
| `admin` | admin-client |
| `ai` | ai-chat-client |
| `auth` | login-form, register-form, forgot-password-form, brand-panel |
| `billing` | billing-client, checkout-client |
| `consultations` | consultations-client |
| `dashboard` | dashboard-client |
| `energy` | bill-analyzer |
| `engineering` | calculator-form, engineering-client, power-system-client, pdf-generator, pdf-report, charts (cable-chart, harmonic-chart, tcc-chart) |
| `guest` | guest-upgrade-modal, hooks/use-guest-quota |
| `knowledge` | knowledge-client, editor, form, taxonomy-select, standards-manager (۱۰ کامپوننت) |
| `landing` | landing-page, features-section, pricing-section, calculations-section, articles-section |
| `marketplace` | marketplace-client, order-list, product-form, product-list, vendor-manager |
| `notifications` | notifications-client |
| `projects` | projects-client, project-detail-client, new-project-modal |
| `search` | search-client |
| `settings` | settings-client |
| `storage` | storage-client |
| `subscription` | upgrade-prompt, hooks/use-plan |
| `vision` | vision-upload-client |
| `workspace` | workspace-dashboard, workspace-gate, workspace-new, workspace-selector, workspace-welcome |
