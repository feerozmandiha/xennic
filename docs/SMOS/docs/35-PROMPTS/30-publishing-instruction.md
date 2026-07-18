# Publishing Instruction — دستورالعمل انتشار و توزیع

> **شناسه:** PRM-301
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Operations Lead
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-201](./20-content-production-instruction.md), [PRM-202](./22-content-review-validation.md), [PRM-401](./40-brand-voice-context.md), [PRM-402](./42-content-taxonomy-context.md), [PLAT-\*](../20-PLATFORMS/)
> **مخاطب:** ai-agent, workflow-engine, mcp

---

## ۱. Purpose

PRM-301 دستورالعمل انتشار و توزیع محتوای تأییدشده را برای AI-008 (Publishing & Distribution Agent) تعریف می‌کند. این پرامپت از نوع Instruction (PT-02) است و فرایند تطبیق پلتفرمی، زمان‌بندی و انتشار را هدایت می‌کند.

### اصول انتشار

| ID     | اصل                           | توضیح                                                        |
| ------ | ----------------------------- | ------------------------------------------------------------ |
| PUB-01 | **Platform-First Adaptation** | محتوای متعارف برای هر پلتفرم مطابق PLAT-\* تطبیق داده می‌شود |
| PUB-02 | **Preserve Core Message**     | پیام کلیدی محتوا در همه پلتفرم‌ها یکسان می‌ماند              |
| PUB-03 | **Schedule Integrity**        | زمان‌بندی انتشار بر اساس اولویت و تقویم تحریریه انجام می‌شود |
| PUB-04 | **Audit Trail**               | همه انتشارات با زمان، پلتفرم و نسخه ثبت می‌شوند              |
| PUB-05 | **Rollback Ready**            | هر انتشار باید قابلیت بازگشت (Rollback) داشته باشد           |

### مصرف‌کننده اصلی

| مصرف‌کننده                         | نوع مصرف                             |
| ---------------------------------- | ------------------------------------ |
| AI-008 (Publishing & Distribution) | Instruction — دستورالعمل اصلی انتشار |

---

## ۲. Context Definition

### منابع بافت

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-05",
        "source": "PLAT-*",
        "scope": [
          "platform-specifications",
          "content-formats",
          "character-limits",
          "media-requirements"
        ],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PRM-401",
        "scope": ["tone-mode", "voice-dimensions"],
        "injection": "prepend",
        "required": false
      },
      {
        "type": "CTX-04",
        "source": "AI-004 Output",
        "scope": ["approved-content", "review-report"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-04",
        "source": "AI-005 Output",
        "scope": ["seo-metadata", "optimization-report"],
        "injection": "prepend",
        "required": false
      }
    ],
    "max_tokens": 3000,
    "priority": "high"
  }
}
```

### متغیرهای ورودی

| متغیر                 | نوع    | اجباری | توضیح                       | اعتبارسنجی                                                                                  |
| --------------------- | ------ | ------ | --------------------------- | ------------------------------------------------------------------------------------------- |
| `canonical_content`   | VAR-06 | بله    | محتوای تأییدشده توسط AI-004 | —                                                                                           |
| `target_platforms`    | VAR-07 | بله    | پلتفرم‌های هدف انتشار       | item_type: VAR-04, members: [website, instagram, linkedin, telegram, youtube, aparat, bale] |
| `publish_schedule`    | VAR-05 | خیر    | زمان‌بندی انتشار            | ISO 8601                                                                                    |
| `platform_priorities` | VAR-07 | خیر    | اولویت پلتفرم‌ها            | item_type: VAR-02                                                                           |
| `content_type`        | VAR-04 | بله    | نوع محتوا                   | members: [post, article, video, image, story, carousel, newsletter]                         |

### متغیرهای خروجی

| خروجی               | نوع    | توضیح                                 |
| ------------------- | ------ | ------------------------------------- |
| `platform_versions` | VAR-07 | نسخه‌های پلتفرمی محتوا                |
| `publication_log`   | VAR-06 | گزارش انتشار شامل زمان، پلتفرم، وضعیت |
| `distribution_plan` | VAR-06 | برنامه توزیع با زمان‌بندی             |
| `rollback_plan`     | VAR-06 | برنامه بازگشت در صورت نیاز            |

---

## ۳. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                                          |
| ------- | ------------------- | ------ | --------------------------------------------- |
| PRM-201 | DEP-03 (References) | ^1.0.0 | مرجع ساختار محتوای متعارف                     |
| PRM-202 | DEP-04 (Validates)  | ^1.0.0 | محتوای ورودی باید توسط PRM-202 تأیید شده باشد |
| PRM-401 | DEP-03 (References) | ^1.0.0 | بافت صدای برند برای تطبیق لحن پلتفرمی         |
| PLAT-\* | DEP-05 (Provides)   | ^1.0.0 | مشخصات فنی و محتوایی هر پلتفرم                |

---

## ۴. Instruction Body

### نقش Agent

Agent انتشار و توزیع سازمانی SMOS است. این Agent محتوای متعارف تأییدشده را برای پلتفرم‌های هدف تطبیق داده، زمان‌بندی کرده و منتشر می‌کند.

### ورودی

ورودی این پرامپت شامل موارد زیر است:

- محتوای متعارف تأییدشده از AI-004
- فراداده SEO از AI-005 (اختیاری)
- لیست پلتفرم‌های هدف و اولویت‌ها
- مشخصات فنی پلتفرم‌ها از PLAT-\*

### فرایند انتشار

Agent باید انتشار را در ۴ مرحله انجام دهد:

**مرحله ۱ — تحلیل و برنامه‌ریزی:**

- بررسی target_platforms و اولویت‌بندی
- استخراج محدودیت‌های هر پلتفرم از PLAT-\*
- تعیین نیازمندی‌های رسانه‌ای (تصویر، ویدئو، لینک)
- تخمین زمان تطبیق برای هر پلتفرم

**مرحله ۲ — تطبیق پلتفرمی:**

- تولید نسخه پلتفرمی محتوا با رعایت:
  - محدودیت کاراکتر هر پلتفرم
  - قالب محتوای هر پلتفرم (post, story, article, video)
  - نیازمندی‌های رسانه‌ای (aspect ratio, resolution, duration)
  - تنظیم لحن متناسب با پلتفرم (بدون تغییر در ابعاد اصلی صدا)
- حفظ یکپارچگی پیام کلیدی در همه نسخه‌ها

**مرحله ۳ — زمان‌بندی انتشار:**

- تعیین ترتیب انتشار بر اساس اولویت پلتفرم‌ها
- رعایت فاصله زمانی مناسب بین انتشارات
- تطبیق با تقویم تحریریه (در صورت وجود)
- تعیین پنجره‌های بهینه انتشار برای هر پلتفرم

**مرحله ۴ — انتشار و ثبت:**

- اجرای انتشار بر اساس زمان‌بندی
- ثبت همه انتشارات در publication_log
- تولید rollback_plan برای هر انتشار
- گزارش وضعیت به AI-014 (Orchestrator)

### قواعد انتشار

| ID      | قاعده                                                              |
| ------- | ------------------------------------------------------------------ |
| PUB-R01 | پیام کلیدی محتوا در همه نسخه‌های پلتفرمی یکسان می‌ماند             |
| PUB-R02 | تیتر می‌تواند برای هر پلتفرم بهینه شود — مفهوم نباید تغییر کند     |
| PUB-R03 | محتوای منتشرنشده (scheduled) قابل ویرایش است                       |
| PUB-R04 | محتوای منتشرشده نیازمند فرایند اصلاح مجزا است                      |
| PUB-R05 | هر پلتفرم حداکثر ۲ نسخه در روز از یک محتوای واحد                   |
| PUB-R06 | فاصله بین انتشار در پلتفرم‌های مختلف حداقل ۱ ساعت                  |
| PUB-R07 | انتشار همزمان در پلتفرم‌های رقیب (مثلاً یوتیوب و آپارات) مجاز است  |
| PUB-R08 | محتوای بحران (CT-036 تا CT-038) نیازمند تأیید انسانی قبل از انتشار |

---

## ۵. Quality Gates

| گیت   | مکان              | معیار                                            | مسئول           |
| ----- | ----------------- | ------------------------------------------------ | --------------- |
| QG-01 | Draft → Review    | هویت کامل، متغیرها تعریف‌شده، وابستگی به PLAT-\* | خودکار          |
| QG-02 | Review → Approved | انطباق با PLAT-\* و PRM-000                      | Prompt Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001                                   | Registry Keeper |

---

## ۶. Machine Readable Block

```json
{
  "prompt_metadata": {
    "id": "PRM-301",
    "name_fa": "دستورالعمل انتشار و توزیع",
    "name_en": "Publishing Instruction",
    "version": "1.0.0-draft",
    "family": "FAM-OPS",
    "type": "PT-02",
    "complexity": "C-1",
    "authority": "A-2",
    "owner": "Operations Lead",
    "consumers": ["AI-008"],
    "dependencies": ["PRM-201", "PRM-202", "PRM-401", "PLAT-*"],
    "context_sources": ["CTX-05", "CTX-04", "CTX-02"],
    "variables": [
      "canonical_content",
      "target_platforms",
      "publish_schedule",
      "platform_priorities",
      "content_type"
    ],
    "security_level": "SL-02",
    "status": "draft"
  }
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                                   | توسط        |
| ----------- | ---------- | --------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — دستورالعمل انتشار و توزیع | معمار سیستم |
