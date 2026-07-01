# Knowledge Management System — سیستم مدیریت دانش

**نسخه**: ۱.۰.۰ | **وضعیت**: فعال | **دامنه**: NestJS API (ماژول `knowledge`)

---

## نمای کلی

سیستم مدیریت دانش Xennic یک پلتفرم کامل برای ایجاد، ویرایش، ترجمه، نسخه‌گذاری و انتشار محتوای فنی مهندسی است. این سیستم از **محتوای بلاکی** (block-based content) استفاده می‌کند و از طبقه‌بندی چندبعدی (taxonomy) پشتیبانی می‌کند.

---

## دیتابیس — ۱۶ مدل Prisma

### Taxonomy (طبقه‌بندی چندبعدی)

| مدل | توضیح |
|------|--------|
| `categories` | دسته‌بندی سلسله‌مراتبی (parent-child) |
| `topics` | موضوعات |
| `tags` | برچسب‌ها |
| `disciplines` | رشته‌های مهندسی (برق، مکانیک و ...) |
| `audiences` | مخاطبان هدف (مبتدی، حرفه‌ای و ...) |

### Core Knowledge

| مدل | توضیح |
|------|--------|
| `knowledge` | مقاله اصلی با محتوای بلاکی (JSON) |
| `knowledge_translations` | ترجمه مقاله به زبان‌های دیگر |
| `knowledge_taxonomy` | اتصال مقاله به طبقه‌بندی (many-to-many) |
| `knowledge_media` | فایل‌های ضمیمه (تصویر، PDF، ویدئو، CAD) |
| `knowledge_formulas` | فرمول‌های LaTeX قابل اتصال به ماشین‌حساب |
| `knowledge_examples` | مثال‌های گام‌به‌گام |
| `knowledge_standards` | اتصال به استانداردهای مهندسی |

### Versioning & Workflow

| مدل | توضیح |
|------|--------|
| `knowledge_versions` | نسخه‌های مختلف مقاله (snapshot کامل) |
| `knowledge_comments` | نظرات با قابلیت reply |
| `knowledge_workflows` | گردش کار تأیید (draft→review→published) |
| `knowledge_workflow_history` | تاریخچه گردش کار |
| `knowledge_analytics` | آمار بازدید، لایک، بوکمارک |

---

## محتوای بلاکی (Block-based Content)

محتوای هر مقاله به صورت JSON با ساختار بلاکی ذخیره می‌شود:

```json
{
  "blocks": [
    { "type": "heading", "level": 2, "content": "محاسبه سطح مقطع کابل" },
    { "type": "paragraph", "content": "برای محاسبه سطح مقطع کابل..." },
    { "type": "formula", "latex": "A = \\frac{I \\times L}{K \\times \\Delta V}" },
    { "type": "calculator", "code": "CABLE-001" },
    { "type": "example", "id": "ex-001" },
    { "type": "image", "url": "...", "caption": "نحوه نصب کابل" },
    { "type": "table", "headers": ["مورد", "مقدار"], "rows": [...] },
    { "type": "code", "language": "python", "content": "..." }
  ]
}
```

**انواع بلاک‌ها**: heading, paragraph, formula, calculator, example, image, table, code, video, quote, list, alert, divider

---

## Workflow (گردش کار)

```
Draft → Submitted → In Review → Approved → Published
                              ↘ Rejected ↗
```

- **Draft**: پیش‌نویس (فقط نویسنده می‌بیند)
- **Submitted**: ارسال برای بررسی
- **In Review**: در حال بازبینی
- **Approved**: تأیید شده (آماده انتشار)
- **Published**: منتشر شده (قابل مشاهده همه)
- **Rejected**: رد شده (با نظر بازبین)

---

## API Endpoints (NestJS)

| مسیر | متد | توضیح |
|------|------|-------|
| `/api/v1/knowledge` | GET | لیست مقالات |
| `/api/v1/knowledge` | POST | ایجاد مقاله جدید |
| `/api/v1/knowledge/:id` | GET | جزئیات مقاله |
| `/api/v1/knowledge/:id` | PUT | ویرایش مقاله |
| `/api/v1/knowledge/:id` | DELETE | حذف مقاله |
| `/api/v1/knowledge/:id/translate` | POST | افزودن ترجمه |
| `/api/v1/knowledge/:id/version` | POST | ایجاد نسخه جدید |
| `/api/v1/knowledge/:id/workflow` | POST | به‌روزرسانی workflow |
| `/api/v1/knowledge/taxonomy/categories` | GET | لیست دسته‌بندی‌ها |
| `/api/v1/knowledge/taxonomy/topics` | GET | لیست موضوعات |
| `/api/v1/knowledge/taxonomy/tags` | GET | لیست برچسب‌ها |

---

## ویژگی‌های کلیدی

- **چندزبانه**: هر مقاله می‌تواند ترجمه‌های مجزا داشته باشد
- **نسخه‌گذاری**: snapshot کامل از هر نسخه با قابلیت بازگشت
- **گردش کار تأیید**: فرآیند review قبل از انتشار
- **اتصال به ماشین‌حساب**: فرمول‌های LaTeX می‌توانند به calculators لینک شوند
- **رسانه**: پشتیبانی از تصویر، PDF, CAD, ویدئو
- **آمار**: بازدید، لایک، بوکمارک، اشتراک‌گذاری
