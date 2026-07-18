# Content Production Instruction — دستورالعمل تولید محتوای متعارف

> **شناسه:** PRM-201
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Content Producer
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-401](./40-brand-voice-context.md), [PRM-402](./42-content-taxonomy-context.md), [BRD-002](../22-BRAND/20-brand-voice.md), [EDT-002](../24-EDITORIAL/20-content-taxonomy.md), [ECOS-001](../24-EDITORIAL/10-content-guidelines.md)
> **مخاطب:** ai-agent, workflow-engine

---

## ۱. Purpose

PRM-201 دستورالعمل تولید **محتوای متعارف (Canonical Content Asset)** را برای AI-003 (Content Production Agent) تعریف می‌کند. خروجی این پرامپت یک دارایی محتوای مستقل از پلتفرم است که توسط Agentهای下游 (AI-004, AI-005, AI-006, AI-007, AI-008) پردازش می‌شود.

### اصول تولید

| ID    | اصل                          | توضیح                                                                      |
| ----- | ---------------------------- | -------------------------------------------------------------------------- |
| CP-01 | **Canonical First**          | محتوا ابتدا به صورت مستقل از پلتفرم تولید می‌شود — تطبیق پلتفرمی در AI-008 |
| CP-02 | **Structure Before Content** | ساختار محتوا (نوع، قالب، هدف) پیش از نگارش تعیین می‌شود                    |
| CP-03 | **Brand-Aligned**            | همه محتوا مطابق BRD-002 و با بافت PRM-401 تولید می‌شود                     |
| CP-04 | **Taxonomy-Driven**          | نوع محتوا (CT-ID) از EDT-002 و بافت PRM-402 انتخاب می‌شود                  |
| CP-05 | **Self-Contained**           | هر محتوای تولیدشده شامل فراداده کامل، هدف، و معیارهای کیفیت است            |

### مصرف‌کننده اصلی

| مصرف‌کننده                  | نوع مصرف                            |
| --------------------------- | ----------------------------------- |
| AI-003 (Content Production) | Instruction — دستورالعمل اصلی تولید |

---

## ۲. Context Definition

### منابع بافت

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "PRM-401",
        "scope": ["brand-voice-dimensions", "tone-mode", "writing-rules", "language-constraints"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PRM-402",
        "scope": ["ct-id-selection", "format-constraints", "lifecycle-guidance", "ai-autonomy"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-04",
        "source": "AI-002 Output",
        "scope": ["content-brief", "editorial-direction", "target-audience", "key-message"],
        "injection": "prepend",
        "required": true
      }
    ],
    "max_tokens": 4000,
    "priority": "high"
  }
}
```

### متغیرهای ورودی

| متغیر               | نوع    | اجباری | توضیح                 | اعتبارسنجی                                                            |
| ------------------- | ------ | ------ | --------------------- | --------------------------------------------------------------------- |
| `ct_id`             | VAR-04 | بله    | نوع محتوای هدف        | members: [CT-001..CT-042]                                             |
| `content_brief`     | VAR-01 | بله    | خلاصه محتوای درخواستی | min_length: 50, max_length: 2000                                      |
| `target_audience`   | VAR-01 | بله    | مخاطب هدف             | min_length: 10, max_length: 500                                       |
| `key_message`       | VAR-01 | بله    | پیام کلیدی محتوا      | min_length: 10, max_length: 500                                       |
| `tone_mode`         | VAR-04 | خیر    | حالت لحن برند         | members: [MODE-EDU, MODE-PRO, MODE-NEW, MODE-ANL, MODE-INS, MODE-NAR] |
| `primary_keyword`   | VAR-01 | خیر    | کلمه کلیدی اصلی (SEO) | max_length: 100                                                       |
| `word_count_target` | VAR-02 | خیر    | تعداد کلمات هدف       | min_value: 50, max_value: 5000                                        |
| `call_to_action`    | VAR-01 | خیر    | فراخوان به اقدام      | max_length: 200                                                       |
| `reference_links`   | VAR-07 | خیر    | منابع و ارجاعات       | item_type: VAR-01, max_items: 10                                      |

### متغیرهای خروجی

| خروجی                 | نوع    | توضیح                                        |
| --------------------- | ------ | -------------------------------------------- |
| `canonical_title`     | VAR-01 | تیتر اصلی محتوا                              |
| `canonical_body`      | VAR-01 | بدنه اصلی محتوا                              |
| `canonical_summary`   | VAR-01 | خلاصه محتوا (حداکثر ۳۰۰ کاراکتر)             |
| `suggested_headlines` | VAR-07 | تیترهای پیشنهادی (۳–۵ گزینه)                 |
| `content_metadata`    | VAR-06 | فراداده کامل شامل CT-ID, هدف, مخاطب, KPI     |
| `seo_metadata`        | VAR-06 | فراداده SEO شامل عنوان، توضیحات، کلمات کلیدی |

---

## ۳. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                                                 |
| ------- | ------------------- | ------ | ---------------------------------------------------- |
| PRM-401 | DEP-01 (Requires)   | ^1.0.0 | بافت صدای برند — تطبیق لحن و قواعد نگارش             |
| PRM-402 | DEP-01 (Requires)   | ^1.0.0 | بافت تاکسونومی — تعیین نوع، قالب و محدودیت‌های محتوا |
| BRD-002 | DEP-05 (Provides)   | ^2.0.0 | منبع دانش معماری صدای برند                           |
| EDT-002 | DEP-05 (Provides)   | ^1.0.0 | منبع دانش تاکسونومی محتوا                            |
| EDT-001 | DEP-03 (References) | ^1.0.0 | چرخه حیات محتوا (ECOS)                               |

---

## ۴. Instruction Body

### نقش Agent

Agent تولید محتوای متعارف SMOS است. این Agent محتوای مستقل از پلتفرم تولید می‌کند که توسط Agentهای下游 برای پلتفرم‌های مختلف تطبیق داده می‌شود.

### ورودی

ورودی این پرامپت شامل موارد زیر است:

- خلاصه محتوا (content_brief) از AI-002 (Content Planning)
- نوع محتوا (ct_id) از AI-002
- بافت صدای برند از PRM-401
- بافت تاکسونومی از PRM-402

### فرایند تولید

Agent باید محتوا را در ۵ مرحله تولید کند:

**مرحله ۱ — تحلیل ورودی:**

- تحلیل content_brief و استخراج اهداف
- تطبیق ct_id با دسته‌بندی EDT-002
- تعیین حالت لحن (tone_mode) بر اساس نوع محتوا و مخاطب
- شناسایی کلمات کلیدی و ساختار SEO

**مرحله ۲ — طراحی ساختار:**

- انتخاب ساختار روایی مناسب از BRD-002 (Narrative Architecture)
- تعیین تیتر اصلی و زیرتیترها
- طراحی پاراگراف‌بندی مطابق قواعد BRD-002
- تعیین نقاط CTA در ساختار

**مرحله ۳ — نگارش بدنه:**

- رعایت ابعاد صدای برند (۵ بعد با وزن پیش‌فرض)
- رعایت قواعد نگارش (WR-01 تا WR-08)
- رعایت محدودیت‌های زبانی (forbidden/preferred language)
- رعایت سطح خوانایی متناسب با مخاطب
- استفاده از الگوهای جملات مجاز (ST-DC, ST-EX, ST-Q, ST-CN, ST-QT)

**مرحله ۴ — بهینه‌سازی:**

- بررسی انطباق با برند (Brand Compliance)
- بررسی خوانایی (Reading Level)
- بهینه‌سازی برای SEO (در صورت وجود primary_keyword)
- بررسی یکپارچگی ساختار

**مرحله ۵ — بسته‌بندی خروجی:**

- تولید تیتر نهایی و تیترهای جایگزین
- تولید خلاصه (summary)
- تولید فراداده کامل (content_metadata)
- تولید فراداده SEO (seo_metadata)
- آماده‌سازی برای تحویل به AI-004 (Review)

### قواعد تولید

| ID      | قاعده                                                                     |
| ------- | ------------------------------------------------------------------------- |
| PROD-01 | محتوا باید مستقل از پلتفرم تولید شود — اشاره به پلتفرم خاص ممنوع          |
| PROD-02 | هر ادعا باید مستند باشد — منبع در فراداده ثبت شود                         |
| PROD-03 | تیتر اصلی حداکثر ۱۵ کلمه                                                  |
| PROD-04 | خلاصه (summary) حداکثر ۳۰۰ کاراکتر                                        |
| PROD-05 | محتوای تولیدشده باید حداقل ۶۰٪ امتیاز Brand Compliance داشته باشد         |
| PROD-06 | ساختار باید شامل حداقل ۳ بخش (مقدمه، بدنه، نتیجه‌گیری) باشد               |
| PROD-07 | CTA در صورت وجود باید با نوع محتوا همخوانی داشته باشد                     |
| PROD-08 | محتوای تولیدشده باید قابلیت تطبیق به همه پلتفرم‌های PLAT-\* را داشته باشد |
| PROD-09 | فراداده خروجی باید شامل KPIهای قابل اندازه‌گیری باشد                      |
| PROD-10 | طول محتوا نباید بیش از ۲۰٪ از word_count_target انحراف داشته باشد         |

---

## ۵. Quality Gates

| گیت   | مکان              | معیار                                                 | مسئول           |
| ----- | ----------------- | ----------------------------------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل، متغیرها تعریف‌شده، وابستگی‌ها مشخص         | خودکار          |
| QG-02 | Review → Approved | انطباق با PRM-000، PRM-401, PRM-402, BRD-002, EDT-002 | Prompt Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001                                        | Registry Keeper |

---

## ۶. Machine Readable Block

```json
{
  "prompt_metadata": {
    "id": "PRM-201",
    "name_fa": "دستورالعمل تولید محتوای متعارف",
    "name_en": "Content Production Instruction",
    "version": "1.0.0-draft",
    "family": "FAM-CON",
    "type": "PT-02",
    "complexity": "C-2",
    "authority": "A-2",
    "owner": "Content Producer",
    "consumers": ["AI-003"],
    "dependencies": ["PRM-401", "PRM-402", "BRD-002", "EDT-002", "EDT-001"],
    "context_sources": ["CTX-02", "CTX-04"],
    "variables": [
      "ct_id",
      "content_brief",
      "target_audience",
      "key_message",
      "tone_mode",
      "primary_keyword",
      "word_count_target",
      "call_to_action",
      "reference_links"
    ],
    "security_level": "SL-02",
    "status": "draft"
  }
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                                        | توسط        |
| ----------- | ---------- | -------------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — دستورالعمل تولید محتوای متعارف | معمار سیستم |
