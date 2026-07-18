# Structural Validation — اعتبارسنجی ساختاری

> **شناسه:** PRM-211
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Content Producer
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-210](./40-review-preparation.md), [PRM-402](./42-content-taxonomy-context.md), [EDT-001](../24-EDITORIAL/10-content-guidelines.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                 |
| ------------------ | --------------------- |
| **id**             | PRM-211               |
| **name_fa**        | اعتبارسنجی ساختاری    |
| **name_en**        | Structural Validation |
| **family**         | FAM-CON               |
| **subfamily**      | CON-RVW               |
| **type**           | PT-06                 |
| **complexity**     | C-2                   |
| **authority**      | A-2                   |
| **owner**          | Content Producer      |
| **version**        | 1.0.0-draft           |
| **status**         | draft                 |
| **security_level** | SL-02                 |

---

## 2. Purpose

PRM-211 ساختار سند محتوا را بر اساس استانداردهای سازمانی EDT-001 اعتبارسنجی می‌کند. این پرامپت تضمین می‌کند سند دارای سلسله‌مراتب تیتربندی صحیح، بلوک‌بندی معنایی، شناسه‌گذاری یکتا و انطباق با قالب استاندارد است.

### اصول اعتبارسنجی ساختاری

| ID    | اصل                                                         |
| ----- | ----------------------------------------------------------- |
| SV-01 | ساختار سند باید با قالب استاندارد EDT-001 مطابقت داشته باشد |
| SV-02 | سلسله‌مراتب تیتربندی باید منطقی و بدون شکاف باشد            |
| SV-03 | هر بلوک محتوا باید شناسه یکتا داشته باشد                    |
| SV-04 | ترتیب بلوک‌ها باید با هدف محتوا همخوانی داشته باشد          |

---

## 3. Scope

### Inside Scope

| حوزه                          | توضیح                               |
| ----------------------------- | ----------------------------------- |
| اعتبارسنجی سلسله‌مراتب تیترها | بررسی H1→H4, وجود شکاف یا تکرار     |
| اعتبارسنجی بلوک‌بندی          | بررسی شناسه‌های یکتا, ترتیب بلوک‌ها |
| اعتبارسنجی فراداده            | بررسی کامل بودن فیلدهای فراداده     |
| اعتبارسنجی طول                | بررسی طول کل و طول بخش‌ها           |
| اعتبارسنجی ارجاعات            | بررسی صحت ارجاعات داخلی             |

### Outside Scope

| حوزه                     | دلیل         |
| ------------------------ | ------------ |
| آماده‌سازی زمینه بازبینی | حوزه PRM-210 |
| اعتبارسنجی اصطلاحات      | حوزه PRM-212 |
| اعتبارسنجی سازگاری       | حوزه PRM-213 |
| تعیین آمادگی انتشار      | حوزه PRM-214 |

---

## 4. Consumers

| مصرف‌کننده              | نقش                                      | نوع مصرف   |
| ----------------------- | ---------------------------------------- | ---------- |
| AI-004 (Content Review) | اعتبارسنجی ساختار سند در گذر اول بازبینی | Validation |

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
        "scope": ["structured-document", "block-index"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "EDT-001",
        "scope": ["document-template", "structure-rules"],
        "injection": "prepend",
        "required": true
      }
    ],
    "max_tokens": 3000,
    "priority": "high"
  }
}
```

---

## 6. Required Knowledge

| منبع    | دامنه     | کاربرد                            |
| ------- | --------- | --------------------------------- |
| EDT-001 | ECOS      | قالب استاندارد سند, قواعد ساختاری |
| EDT-002 | تاکسونومی | تطابق ساختار با نوع محتوا         |

---

## 7. Variables

| متغیر                 | نوع    | اجباری | توضیح                          | اعتبارسنجی     |
| --------------------- | ------ | ------ | ------------------------------ | -------------- |
| `structured_document` | VAR-06 | بله    | سند ساختاریافته از PRM-203     | —              |
| `review_context`      | VAR-06 | بله    | بافت بازبینی از PRM-210        | —              |
| `strict_mode`         | VAR-03 | خیر    | اعمال سخت‌گیرانه قواعد ساختاری | default: false |

---

## 8. Constraints

| ID     | محدودیت                                                   |
| ------ | --------------------------------------------------------- |
| CST-01 | سلسله‌مراتب تیترها حداکثر ۴ سطح (H1→H4)                   |
| CST-02 | هر بلوک باید شناسه یکتا داشته باشد                        |
| CST-03 | فراداده سند باید همه فیلدهای اجباری EDT-001 را داشته باشد |
| CST-04 | ارجاعات داخلی باید به بلوک‌های موجود اشاره کنند           |

---

## 9. Input Contract

| ورودی                 | نوع     | منبع    | اجباری |
| --------------------- | ------- | ------- | ------ |
| `structured_document` | object  | PRM-203 | بله    |
| `review_context`      | object  | PRM-210 | بله    |
| `strict_mode`         | boolean | AI-004  | خیر    |

---

## 10. Output Contract

| خروجی                   | نوع    | توضیح                                |
| ----------------------- | ------ | ------------------------------------ |
| `structure_report`      | object | گزارش کامل اعتبارسنجی ساختاری        |
| `heading_tree`          | object | درخت تیتربندی با شناسایی ناهنجاری‌ها |
| `block_validation`      | array  | اعتبارسنجی هر بلوک با شناسه و وضعیت  |
| `metadata_completeness` | number | درصد کامل بودن فراداده (۰–۱۰۰)       |
| `structural_score`      | number | امتیاز ساختار (۰–۱۰۰)                |

---

## 11. Validation Rules

| ID     | قاعده                        | سطح    | نقض     |
| ------ | ---------------------------- | ------ | ------- |
| VAL-01 | سلسله‌مراتب تیترها بدون شکاف | معماری | هشدار   |
| VAL-02 | همه بلوک‌ها شناسه یکتا دارند | معماری | هشدار   |
| VAL-03 | فراداده ≥ ۸۰٪ کامل           | معماری | هشدار   |
| VAL-04 | ارجاعات داخلی معتبر          | معماری | عدم ثبت |
| VAL-05 | طول بخش‌ها در محدوده EDT-001 | معماری | هشدار   |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                         | مسئول           |
| ----- | ----------------- | ----------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل, وابستگی به PRM-210 | خودکار          |
| QG-02 | Review → Approved | انطباق با EDT-001             | Prompt Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001                | Registry Keeper |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                                          |
| ------- | ------------------- | ------ | --------------------------------------------- |
| PRM-210 | DEP-01 (Requires)   | ^1.0.0 | بافت بازبینی از PRM-210 ورودی الزامی          |
| PRM-402 | DEP-03 (References) | ^1.0.0 | بافت تاکسونومی برای تطابق ساختار با نوع محتوا |

---

## 14. Human Override

| سناریو                        | اقدام                              |
| ----------------------------- | ---------------------------------- |
| structural_score < ۵۰         | بازگشت به AI-003 برای اصلاح ساختار |
| strict_mode=true و score < ۷۰ | Escalation به Content Editor       |

---

## 15. Governance Notes

| ID     | یادداشت                                                        |
| ------ | -------------------------------------------------------------- |
| GOV-01 | A-2 (Operational) — نیازمند تأیید ناظر                         |
| GOV-02 | تغییر در قالب استاندارد EDT-001 نیازمند به‌روزرسانی این پرامپت |
| GOV-03 | strict_mode برای محتوای A-3 و A-4 همیشه true                   |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-211",
  "name": "Structural Validation",
  "family": "FAM-CON",
  "subfamily": "CON-RVW",
  "type": "PT-06",
  "complexity": "C-2",
  "authority": "A-2",
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
    { "type": "CTX-02", "source": "EDT-001", "required": true }
  ],
  "max_tokens": 3000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "structured_document", "type": "VAR-06", "required": true },
    { "id": "review_context", "type": "VAR-06", "required": true },
    { "id": "strict_mode", "type": "VAR-03", "required": false, "default": false }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["structured_document", "review_context"],
    "optional": ["strict_mode"]
  },
  "output": {
    "required": ["structure_report", "heading_tree", "block_validation"],
    "optional": ["metadata_completeness", "structural_score"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Heading hierarchy without gaps", "severity": "warning" },
    { "id": "VAL-02", "description": "All blocks have unique IDs", "severity": "warning" },
    { "id": "VAL-03", "description": "Metadata ≥ 80% complete", "severity": "warning" },
    { "id": "VAL-04", "description": "All internal references valid", "severity": "error" },
    { "id": "VAL-05", "description": "Section lengths within EDT-001 range", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-004"],
  "dependencies": ["PRM-210", "PRM-402"],
  "documentation_refs": ["EDT-001", "EDT-002"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                            | توسط        |
| ----------- | ---------- | -------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — اعتبارسنجی ساختاری | معمار سیستم |
