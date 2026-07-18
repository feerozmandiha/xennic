# Accessibility Enhancement Instruction — دستورالعمل دسترس‌پذیری محتوا

> **شناسه:** PRM-205
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Content Producer
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-203](../35-PROMPTS/24-content-structuring-instruction.md), [BRD-002](../22-BRAND/20-brand-voice.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                                 |
| ------------------ | ------------------------------------- |
| **id**             | PRM-205                               |
| **name_fa**        | دستورالعمل دسترس‌پذیری محتوا          |
| **name_en**        | Accessibility Enhancement Instruction |
| **family**         | FAM-CON                               |
| **subfamily**      | CON-PRD                               |
| **type**           | PT-06                                 |
| **complexity**     | C-2                                   |
| **authority**      | A-3                                   |
| **owner**          | Content Producer                      |
| **version**        | 1.0.0-draft                           |
| **status**         | draft                                 |
| **security_level** | SL-02                                 |

---

## 2. Purpose

PRM-205 الزامات دسترس‌پذیری سازمانی را برای دارایی‌های محتوایی SMOS تعریف می‌کند. این پرامپت از نوع Validation (PT-06) است و تضمین می‌کند همه محتوای تولیدی برای همه مخاطبان (از جمله افراد با محدودیت‌های دسترسی) قابل استفاده است.

### اصول دسترس‌پذیری

| ID    | اصل                                                        |
| ----- | ---------------------------------------------------------- |
| AC-01 | همه محتوا باید برای همه مخاطبان قابل دسترس باشد            |
| AC-02 | دسترس‌پذیری یک ویژگی اضافی نیست — بخشی از فرایند تولید است |
| AC-03 | همه تصاویر باید دارای متن جایگزین (alt text) باشند         |
| AC-04 | همه ویدئوها باید دارای زیرنویس (caption) باشند             |
| AC-05 | زبان باید فراگیر (inclusive) و بدون تبعیض باشد             |

---

## 3. Scope

### Inside Scope

| حوزه                             | توضیح                                              |
| -------------------------------- | -------------------------------------------------- |
| متن جایگزین (Alt Text)           | تولید متن جایگزین برای همه تصاویر و اینفوگرافیک‌ها |
| زیرنویس (Caption)                | زیرنویس برای ویدئوها و محتوای صوتی                 |
| سلسله‌مراتب معنایی               | ساختار H1-H4 با قواعد دسترس‌پذیری                  |
| فراداده دسترس‌پذیری              | برچسب‌های ARIA، role، landmark                     |
| خوانایی (Readability)            | اطمینان از سطح خوانایی مناسب                       |
| زبان فراگیر (Inclusive Language) | عدم استفاده از واژگان تبعیض‌آمیز                   |

### Outside Scope

| حوزه         | دلیل         |
| ------------ | ------------ |
| محتوای اصلی  | حوزه PRM-201 |
| ساختار محتوا | حوزه PRM-203 |
| تولید ویدئو  | حوزه AI-007  |

---

## 4. Consumers

| مصرف‌کننده                      | نقش                                           | نوع مصرف    |
| ------------------------------- | --------------------------------------------- | ----------- |
| AI-006 (Media Asset Production) | افزودن alt text و caption به دارایی‌های رسانه | Instruction |
| AI-007 (Video Production)       | افزودن زیرنویس و شرح ویدئو                    | Instruction |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-203 Output",
        "scope": ["structured-document", "block-index", "semantic-relationships"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-04",
        "source": "AI-006/AI-007 Input",
        "scope": ["media-assets", "video-metadata", "image-list"],
        "injection": "prepend",
        "required": true
      }
    ],
    "max_tokens": 2500,
    "priority": "high"
  }
}
```

---

## 6. Required Knowledge

| منبع            | دامنه          | کاربرد                                 |
| --------------- | -------------- | -------------------------------------- |
| BRD-002         | صدای برند      | زبان فراگیر و قواعد نگارش              |
| WCAG Guidelines | دسترس‌پذیری وب | استانداردهای بین‌المللی (ارجاع معماری) |

---

## 7. Variables

| متغیر                 | نوع    | اجباری | توضیح                                     | اعتبارسنجی                                                |
| --------------------- | ------ | ------ | ----------------------------------------- | --------------------------------------------------------- |
| `structured_content`  | VAR-06 | بله    | محتوای ساختاریافته از PRM-203             | —                                                         |
| `media_assets`        | VAR-07 | بله    | لیست دارایی‌های رسانه‌ای                  | item_type: VAR-06, min_items: 1                           |
| `accessibility_level` | VAR-04 | خیر    | سطح دسترس‌پذیری هدف                       | members: [standard, enhanced, maximum], default: standard |
| `target_platforms`    | VAR-07 | خیر    | پلتفرم‌های هدف (برای alt text خاص پلتفرم) | item_type: VAR-04                                         |

---

## 8. Constraints

| ID     | محدودیت                                                |
| ------ | ------------------------------------------------------ |
| CST-01 | هر تصویر باید alt text داشته باشد (حداکثر ۱۲۵ کاراکتر) |
| CST-02 | هر ویدئو باید caption داشته باشد (همزمان با صدا)       |
| CST-03 | ساختار H1-H4 باید معنایی و ترتیبی باشد                 |
| CST-04 | کلمات تبعیض‌آمیز (بر اساس BRD-002 §۱۱) ممنوع           |
| CST-05 | سطح خوانایی (RL) باید با مخاطب هدف همخوانی داشته باشد  |

---

## 9. Input Contract

| ورودی                 | نوع    | منبع          | اجباری |
| --------------------- | ------ | ------------- | ------ |
| `structured_content`  | object | PRM-203       | بله    |
| `media_assets`        | array  | AI-006/AI-007 | بله    |
| `accessibility_level` | enum   | AI-014        | خیر    |
| `target_platforms`    | array  | AI-014        | خیر    |

---

## 10. Output Contract

| خروجی                           | نوع    | توضیح                                     |
| ------------------------------- | ------ | ----------------------------------------- |
| `accessibility_report`          | object | گزارش دسترس‌پذیری — وضعیت انطباق هر معیار |
| `alt_text_map`                  | object | نگاشت تصاویر به متن جایگزین               |
| `caption_map`                   | object | نگاشت ویدئوها به زیرنویس                  |
| `semantic_hierarchy_validation` | object | اعتبارسنجی سلسله‌مراتب معنایی             |
| `compliance_score`              | number | امتیاز دسترس‌پذیری (۰–۱۰۰)                |

---

## 11. Validation Rules

| ID     | قاعده                          | سطح    | نقض     |
| ------ | ------------------------------ | ------ | ------- |
| VAL-01 | همه تصاویر دارای alt text      | معماری | عدم ثبت |
| VAL-02 | همه ویدئوها دارای caption      | معماری | عدم ثبت |
| VAL-03 | ساختار H ترتیبی (بدون پرش سطح) | معماری | هشدار   |
| VAL-04 | زبان فراگیر                    | معماری | هشدار   |
| VAL-05 | امتیاز دسترس‌پذیری ≥ ۸۰        | معماری | هشدار   |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                             | مسئول           |
| ----- | ----------------- | --------------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل، media_assets معتبر     | خودکار          |
| QG-02 | Review → Approved | انطباق با PRM-000, WCAG standards | Prompt Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3)         | Registry Keeper |

---

## 13. Dependencies

| شناسه   | نوع               | نسخه   | دلیل                                           |
| ------- | ----------------- | ------ | ---------------------------------------------- |
| PRM-203 | DEP-01 (Requires) | ^1.0.0 | محتوای ساختاریافته برای اعتبارسنجی سلسله‌مراتب |
| BRD-002 | DEP-05 (Provides) | ^2.0.0 | قواعد زبان فراگیر و واژگان ممنوع               |

---

## 14. Human Override

| سناریو                      | اقدام                         |
| --------------------------- | ----------------------------- |
| alt text خودکار غیردقیق     | ویرایش دستی توسط Human Editor |
| caption با محتوای فنی تخصصی | تأیید توسط متخصص حوزه         |
| امتیاز دسترس‌پذیری < ۸۰     | بازگشت به Agent برای اصلاح    |

---

## 15. Governance Notes

| ID     | یادداشت                                                    |
| ------ | ---------------------------------------------------------- |
| GOV-01 | دسترس‌پذیری یک نیاز قانونی است — عدم رعایت ریسک حقوقی دارد |
| GOV-02 | حداقل سطح standard برای همه محتوا اجباری است               |
| GOV-03 | ممیزی دسترس‌پذیری به صورت فصلی انجام می‌شود                |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-205",
  "name": "Accessibility Enhancement Instruction",
  "family": "FAM-CON",
  "subfamily": "CON-PRD",
  "type": "PT-06",
  "complexity": "C-2",
  "authority": "A-3",
  "version": "1.0.0-draft",
  "status": "draft"
}
```

### Block 2 — Context

```json
{
  "sources": [
    { "type": "CTX-04", "source": "PRM-203", "required": true },
    { "type": "CTX-04", "source": "AI-006/AI-007", "required": true }
  ],
  "max_tokens": 2500,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "structured_content", "type": "VAR-06", "required": true },
    { "id": "media_assets", "type": "VAR-07", "required": true, "min_items": 1 },
    {
      "id": "accessibility_level",
      "type": "VAR-04",
      "required": false,
      "members": ["standard", "enhanced", "maximum"],
      "default": "standard"
    },
    { "id": "target_platforms", "type": "VAR-07", "required": false }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["structured_content", "media_assets"],
    "optional": ["accessibility_level", "target_platforms"]
  },
  "output": {
    "required": ["accessibility_report", "alt_text_map", "compliance_score"],
    "optional": ["caption_map", "semantic_hierarchy_validation"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "All images have alt text", "severity": "error" },
    { "id": "VAL-02", "description": "All videos have caption", "severity": "error" },
    { "id": "VAL-03", "description": "Sequential H structure (no skips)", "severity": "warning" },
    { "id": "VAL-04", "description": "Inclusive language", "severity": "warning" },
    { "id": "VAL-05", "description": "Accessibility score ≥ 80", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-006", "AI-007"],
  "dependencies": ["PRM-203", "BRD-002"],
  "documentation_refs": ["WCAG", "BRD-002"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                                      | توسط        |
| ----------- | ---------- | ------------------------------------------ | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — دستورالعمل دسترس‌پذیری محتوا | معمار سیستم |
