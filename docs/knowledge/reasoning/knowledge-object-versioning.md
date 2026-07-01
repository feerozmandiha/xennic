# نسخه‌بندی شئ دانش — Knowledge Object Versioning

**Version:** 1.0.0 | **Status:** Draft | **Last Updated:** Tir 1405

---

## Version Scheme — طرح نسخه‌بندی

هر EKO از سیستم **SemVer** (MAJOR.MINOR.PATCH) پیروی می‌کند:

| بخش | سطح تغییر | مثال‌ها |
|-----|----------|---------|
| **MAJOR** | تغییر محتوای اساسی | ویرایش جدید استاندارد، تصحیح اساسی محاسبات، جایگزینی کامل منبع |
| **MINOR** | افزودن غیرشکننده | ترجمه جدید، ابرداده اضافی، شواهد تکمیلی، ارجاعات مفهومی جدید |
| **PATCH** | اصلاح | اشتباه تایپی، قالب‌بندی، تصحیح ابرداده، رفع خطای هش |

**فرمت:** `MAJOR.MINOR.PATCH` (مثال: `2.1.3`)

نسخه `۱.۰.۰` اولین نسخه انتشار یافته یک EKO است. نسخه `۰.x.x` برای پیش‌نمایش داخلی استفاده می‌شود.

---

## Version Identity — هویت نسخه

| مفهوم | توضیح |
|-------|-------|
| `eko_id` | شناسه یکتای EKO — در طول نسخه‌ها پایدار می‌ماند |
| `eko_id + version` | ترکیب یکتا — هر نسخه را به صورت منحصربه‌فرد شناسایی می‌کند |
| دسترسی | همه نسخه‌های قبلی همیشه قابل دسترسی و جستجو هستند |

```
XEN-EKO-1405-000042  ─── version 1.0.0 (first edition)
                    ├── version 1.1.0 (added translation)
                    ├── version 1.1.1 (fixed typo)
                    └── version 2.0.0 (new edition)
```

---

## Version Relationships — روابط نسخه‌ای

| فیلد | نوع | توضیح |
|------|-----|-------|
| `supersedes` | UUID (eko_id + version) | اشاره به نسخه قبلی که این نسخه جایگزین آن شده است |
| `superseded_by` | UUID (eko_id + version) | اشاره به نسخه بعدی که این نسخه را جایگزین کرده است |
| `derived_from` | UUID (eko_id + version) | اگر این EKO از EKO دیگری مشتق شده است (مثلاً استخراج از یک استاندارد) |

این روابط یک زنجیره نسخه‌ای تشکیل می‌دهند که امکان ردیابی کامل تحول دانش را فراهم می‌کند:

```
EKO-A v1.0.0 ──supersedes──→ EKO-A v2.0.0 ──supersedes──→ EKO-A v3.0.0
                                        │
                               derived_from
                                        │
                                        ▼
                               EKO-B v1.0.0 (subset extraction)
```

---

## Version Storage — ذخیره‌سازی نسخه‌ها

| ویژگی | مقدار | توضیح |
|--------|-------|-------|
| Storage Model | Append-Only | همه نسخه‌ها ذخیره می‌شوند، هیچ نسخه‌ای حذف نمی‌گردد |
| Active Version | Latest Only | فقط آخرین نسخه برای بازیابی AI فعال است |
| Historical Access | Read-Only | نسخه‌های قبلی فقط برای حسابرسی و ردیابی در دسترس هستند |
| Retention | Unlimited | هیچ سیاست حذف خودکاری برای نسخه‌ها وجود ندارد |

---

## Version Conflicts — تعارضات نسخه‌ای

| سناریو | راهکار |
|--------|--------|
| دو نسخه با timestamp همپوشان | نسخه با `pipeline_version` بالاتر اولویت دارد |
| دو نسخه با MAJOR متفاوت و timestamp یکسان | هر دو نگهداری می‌شوند، جدیدترین `created_at` تعیین‌کننده است |
| ورود دستی نسخه بدون pipeline | `pipeline_version` = `0.0.0` در نظر گرفته می‌شود |

### Conflict Resolution Order — ترتیب حل تعارض

1. `version` (SemVer مقایسه)
2. `pipeline_version` (نسخه خط لوله ایجادکننده)
3. `created_at` (زمان ایجاد)
4. `confidence_score` (امتیاز اطمینان)

---

## Chunk Versioning — نسخه‌بندی تکه‌ها

| رویداد | اقدام |
|--------|-------|
| تغییر محتوای EKO | تکه‌های بخش‌های تغییریافته بازتولید می‌شوند |
| عدم تغییر بخش | تکه‌های بخش‌های بدون تغییر نسخه قبلی خود را حفظ می‌کنند |
| افزودن بخش جدید | تکه‌های جدید با نسخه جدید ایجاد می‌شوند |
| حذف بخش | تکه‌های حذف‌شده بایگانی می‌شوند (حذف فیزیکی نمی‌شوند) |

`chunk_version` برابر با `version` EKO در زمان ایجاد تکه است. این امکان ردیابی دقیق تغییرات در سطح تکه را فراهم می‌کند.

---

## Embedding Versioning — نسخه‌بندی بردارها

| رویداد | اقدام |
|--------|-------|
| تغییر محتوای EKO | بردارهای تکه‌های تغییریافته بازتولید می‌شوند |
| تغییر مدل embedding | همه بردارهای EKO بازتولید می‌شوند |
| به‌روزرسانی مدل | `model_version` جدید در metadata بردار ثبت می‌شود |

هر بردار دارای `model_name` و `model_version` است تا در صورت تغییر مدل، امکان بازتولید هدفمند فراهم باشد:

| فیلد | مثال |
|------|-------|
| `embedding.model_name` | xen-embed-v3 |
| `embedding.model_version` | 3.1.0 |
| `embedding.dimension` | 1536 |

---

## Version Metadata — ابرداده نسخه

هر نسخه EKO ابرداده نسخه‌ای زیر را حمل می‌کند:

| فیلد | توضیح |
|------|-------|
| `version` | شماره نسخه (SemVer) |
| `version_summary` | خلاصه یک خطی از تغییرات این نسخه |
| `change_log` | لیست تغییرات دقیق |
| `version_author` | عامل ایجاد نسخه (pipeline name / user ID / system) |
| `version_timestamp` | زمان ایجاد نسخه |
| `version_status` | draft / published / superseded / archived |

### Change Log Entry — ورود تغییرات

| فیلد | نوع | توضیح |
|------|-----|-------|
| `type` | Enum | added, modified, removed, corrected, deprecated |
| `section` | String | بخش تغییریافته (evidence, metadata, concepts, ...) |
| `description` | String | شرح تغییر |
| `reason` | String | دلیل تغییر |

---

## Version API — API نسخه (فقط منطق، بدون پیاده‌سازی)

عملیات‌های پشتیبانی‌شده:

| عملیات | ورودی | خروجی |
|--------|-------|-------|
| List Versions | eko_id | لیست همه نسخه‌ها با metadata |
| Get Version | eko_id + version | EKO کامل آن نسخه |
| Diff Versions | eko_id + v1 + v2 | تفاوت ساختاری بین دو نسخه |
| Activate Version | eko_id + version | تغییر active version (با احتیاط) |

**Diff Format:** نمایش تغییرات در سطح بخش‌های EKO با نشان‌دادن added, modified, removed برای هر بخش.
