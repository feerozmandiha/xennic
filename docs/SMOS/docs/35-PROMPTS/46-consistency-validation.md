# Consistency Validation — اعتبارسنجی سازگاری

> **شناسه:** PRM-213
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Content Producer
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-210](./40-review-preparation.md), [PRM-211](./42-structural-validation.md), [PRM-212](./44-terminology-validation.md), [PRM-401](./40-brand-voice-context.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                  |
| ------------------ | ---------------------- |
| **id**             | PRM-213                |
| **name_fa**        | اعتبارسنجی سازگاری     |
| **name_en**        | Consistency Validation |
| **family**         | FAM-CON                |
| **subfamily**      | CON-RVW                |
| **type**           | PT-06                  |
| **complexity**     | C-3                    |
| **authority**      | A-3                    |
| **owner**          | Content Producer       |
| **version**        | 1.0.0-draft            |
| **status**         | draft                  |
| **security_level** | SL-02                  |

---

## 2. Purpose

PRM-213 ناسازگاری‌های میان‌بخشی، میان‌سندی و میان‌ارجاعی را در محتوای تولیدشده تشخیص می‌دهد. این پرامپت تضمین می‌کند محتوا از نظر پیام، لحن، اصطلاحات و ارجاعات در سراسر سند و در ارتباط با اسناد دیگر یکپارچه است.

### اصول اعتبارسنجی سازگاری

| ID    | اصل                                             |
| ----- | ----------------------------------------------- |
| CV-01 | پیام کلیدی باید در همه بخش‌های سند یکسان باشد   |
| CV-02 | لحن و سبک نگارش نباید بین بخش‌ها تغییر کند      |
| CV-03 | اصطلاحات تکراری باید یکسان تعریف شوند           |
| CV-04 | ارجاعات به دانش‌های مشابه باید یکسان باشند      |
| CV-05 | داده‌های تکراری باید سازگار باشند — تناقض ممنوع |

---

## 3. Scope

### Inside Scope

| حوزه                      | توضیح                                        |
| ------------------------- | -------------------------------------------- |
| تشخیص ناسازگاری میان‌بخشی | پیام، لحن، اصطلاحات بین بخش‌های مختلف یک سند |
| تشخیص ناسازگاری میان‌سندی | تطابق با محتوای منتشرشده قبلی (KNW-\*)       |
| تشخیص ناسازگاری ارجاعی    | شناسه‌های تکراری با معانی متفاوت             |
| تشخیص تناقض داده‌ای       | اعداد، تاریخ‌ها، نام‌های متناقض              |
| تشخیص تکرار محتوایی       | محتوای تکراری با بیان متفاوت                 |

### Outside Scope

| حوزه                | دلیل         |
| ------------------- | ------------ |
| اعتبارسنجی ساختار   | حوزه PRM-211 |
| اعتبارسنجی اصطلاحات | حوزه PRM-212 |
| تعیین آمادگی انتشار | حوزه PRM-214 |
| اصلاح ناسازگاری     | حوزه AI-003  |

---

## 4. Consumers

| مصرف‌کننده                    | نقش                                  | نوع مصرف   |
| ----------------------------- | ------------------------------------ | ---------- |
| AI-004 (Content Review)       | اعتبارسنجی سازگاری محتوا در گذر عمیق | Validation |
| AI-011 (Knowledge Management) | اعتبارسنجی سازگاری با دانش سازمانی   | Validation |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-210 Output",
        "scope": ["review-context", "criteria-priority"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-04",
        "source": "PRM-203 Output",
        "scope": ["structured-document", "block-index", "semantic-relationships"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-04",
        "source": "PRM-211 Output",
        "scope": ["structure-report", "heading-tree"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-04",
        "source": "PRM-212 Output",
        "scope": ["terminology-report", "term-violations"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PRM-401",
        "scope": ["brand-voice-dimensions", "tone-consistency-rules"],
        "injection": "append",
        "required": true
      }
    ],
    "max_tokens": 5000,
    "priority": "high"
  }
}
```

---

## 6. Required Knowledge

| منبع    | دامنه        | کاربرد                         |
| ------- | ------------ | ------------------------------ |
| BRD-002 | صدای برند    | معیارهای ثبات لحن در سراسر سند |
| EDT-001 | ECOS         | معیارهای انسجام محتوایی        |
| KNW-\*  | دانش سازمانی | تطابق با محتوای منتشرشده قبلی  |

---

## 7. Variables

| متغیر                  | نوع    | اجباری | توضیح                       | اعتبارسنجی                                   |
| ---------------------- | ------ | ------ | --------------------------- | -------------------------------------------- |
| `structured_document`  | VAR-06 | بله    | سند ساختاریافته از PRM-203  | —                                            |
| `review_context`       | VAR-06 | بله    | بافت بازبینی از PRM-210     | —                                            |
| `structure_report`     | VAR-06 | بله    | گزارش ساختار از PRM-211     | —                                            |
| `terminology_report`   | VAR-06 | بله    | گزارش اصطلاحات از PRM-212   | —                                            |
| `cross_document_check` | VAR-03 | خیر    | بررسی سازگاری با اسناد دیگر | default: false                               |
| `consistency_depth`    | VAR-04 | خیر    | عمق بررسی سازگاری           | members: [standard, deep], default: standard |

---

## 8. Constraints

| ID     | محدودیت                                           |
| ------ | ------------------------------------------------- |
| CST-01 | پیام کلیدی باید در همه بخش‌های سند یکسان باشد     |
| CST-02 | لحن نباید بیش از ۱۵٪ بین بخش‌ها تغییر کند         |
| CST-03 | اصطلاحات تکراری باید تعریف یکسان داشته باشند      |
| CST-04 | cross_document_check نیازمند دسترسی به KNW-\* است |
| CST-05 | حداکثر ۳ ناسازگاری مجاز پیش از Return to AI-003   |

---

## 9. Input Contract

| ورودی                  | نوع     | منبع           | اجباری |
| ---------------------- | ------- | -------------- | ------ |
| `structured_document`  | object  | PRM-203        | بله    |
| `review_context`       | object  | PRM-210        | بله    |
| `structure_report`     | object  | PRM-211        | بله    |
| `terminology_report`   | object  | PRM-212        | بله    |
| `cross_document_check` | boolean | AI-004, AI-011 | خیر    |
| `consistency_depth`    | enum    | AI-004         | خیر    |

---

## 10. Output Contract

| خروجی                     | نوع    | توضیح                                          |
| ------------------------- | ------ | ---------------------------------------------- |
| `consistency_report`      | object | گزارش کامل اعتبارسنجی سازگاری                  |
| `message_consistency`     | object | تحلیل سازگاری پیام کلیدی در بخش‌ها             |
| `tone_consistency`        | object | تحلیل ثبات لحن در سراسر سند                    |
| `cross_section_conflicts` | array  | ناسازگاری‌های شناسایی‌شده بین بخش‌ها           |
| `knowledge_conflicts`     | array  | تناقض با دانش سازمانی (در صورت cross_document) |
| `consistency_score`       | number | امتیاز سازگاری کلی (۰–۱۰۰)                     |

---

## 11. Validation Rules

| ID     | قاعده                           | سطح     | نقض     |
| ------ | ------------------------------- | ------- | ------- |
| VAL-01 | پیام کلیدی در همه بخش‌ها یکسان  | معماری  | عدم ثبت |
| VAL-02 | تغییر لحن ≤ ۱۵٪ بین بخش‌ها      | معماری  | هشدار   |
| VAL-03 | اصطلاحات تکراری تعریف‌شده یکسان | معماری  | عدم ثبت |
| VAL-04 | داده‌های تکراری بدون تناقض      | معماری  | عدم ثبت |
| VAL-05 | ناسازگاری ≤ ۳ قبل از بازگشت     | عملیاتی | هشدار   |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                                 | مسئول           |
| ----- | ----------------- | ------------------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل, وابستگی به PRM-210,211,212 | خودکار          |
| QG-02 | Review → Approved | انطباق با BRD-002, EDT-001            | Prompt Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3)             | Registry Keeper |

---

## 13. Dependencies

| شناسه   | نوع               | نسخه   | دلیل                               |
| ------- | ----------------- | ------ | ---------------------------------- |
| PRM-210 | DEP-01 (Requires) | ^1.0.0 | بافت بازبینی                       |
| PRM-211 | DEP-01 (Requires) | ^1.0.0 | گزارش ساختار برای تحلیل میان‌بخشی  |
| PRM-212 | DEP-01 (Requires) | ^1.0.0 | گزارش اصطلاحات برای تحلیل سازگاری  |
| PRM-401 | DEP-01 (Requires) | ^1.0.0 | بافت صدای برند برای تحلیل ثبات لحن |

---

## 14. Human Override

| سناریو                                          | اقدام                                   |
| ----------------------------------------------- | --------------------------------------- |
| consistency_score < ۵۰                          | بازگشت به AI-003 برای بازبینی و اصلاح   |
| ناسازگاری در داده‌های کلیدی (اعداد، تاریخ‌ها)   | Escalation فوری به Content Editor       |
| cross_document_check=true بدون دسترسی به KNW-\* | ادامه بدون cross_document — اطلاع‌رسانی |

---

## 15. Governance Notes

| ID     | یادداشت                                               |
| ------ | ----------------------------------------------------- |
| GOV-01 | A-3 (Strategic) — نیازمند ADR + تأیید مدیر            |
| GOV-02 | C-3 (Complex) — ترکیب خروجی ۳ پرامپت بالادست          |
| GOV-03 | cross_document_check برای محتوای A-3 و A-4 اجباری است |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-213",
  "name": "Consistency Validation",
  "family": "FAM-CON",
  "subfamily": "CON-RVW",
  "type": "PT-06",
  "complexity": "C-3",
  "authority": "A-3",
  "version": "1.0.0-draft",
  "status": "draft"
}
```

### Block 2 — Context

```json
{
  "sources": [
    { "type": "CTX-04", "source": "PRM-210", "required": true },
    { "type": "CTX-04", "source": "PRM-203", "required": true },
    { "type": "CTX-04", "source": "PRM-211", "required": true },
    { "type": "CTX-04", "source": "PRM-212", "required": true },
    { "type": "CTX-02", "source": "PRM-401", "required": true }
  ],
  "max_tokens": 5000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "structured_document", "type": "VAR-06", "required": true },
    { "id": "review_context", "type": "VAR-06", "required": true },
    { "id": "structure_report", "type": "VAR-06", "required": true },
    { "id": "terminology_report", "type": "VAR-06", "required": true },
    { "id": "cross_document_check", "type": "VAR-03", "required": false, "default": false },
    {
      "id": "consistency_depth",
      "type": "VAR-04",
      "required": false,
      "members": ["standard", "deep"],
      "default": "standard"
    }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["structured_document", "review_context", "structure_report", "terminology_report"],
    "optional": ["cross_document_check", "consistency_depth"]
  },
  "output": {
    "required": [
      "consistency_report",
      "message_consistency",
      "tone_consistency",
      "consistency_score"
    ],
    "optional": ["cross_section_conflicts", "knowledge_conflicts"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    {
      "id": "VAL-01",
      "description": "Key message consistent across sections",
      "severity": "error"
    },
    {
      "id": "VAL-02",
      "description": "Tone variation ≤ 15% between sections",
      "severity": "warning"
    },
    { "id": "VAL-03", "description": "Repeated terms have same definition", "severity": "error" },
    { "id": "VAL-04", "description": "Repeated data without contradiction", "severity": "error" },
    { "id": "VAL-05", "description": "Max 3 inconsistencies before return", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-004", "AI-011"],
  "dependencies": ["PRM-210", "PRM-211", "PRM-212", "PRM-401"],
  "documentation_refs": ["BRD-002", "EDT-001", "KNW-*"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                            | توسط        |
| ----------- | ---------- | -------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — اعتبارسنجی سازگاری | معمار سیستم |
