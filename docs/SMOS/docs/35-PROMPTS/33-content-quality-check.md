# Content Quality Check — بررسی کیفیت محتوا

> **شناسه:** PRM-208
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Content Producer
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-401](../35-PROMPTS/40-brand-voice-context.md), [PRM-402](../35-PROMPTS/42-content-taxonomy-context.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                 |
| ------------------ | --------------------- |
| **id**             | PRM-208               |
| **name_fa**        | بررسی کیفیت محتوا     |
| **name_en**        | Content Quality Check |
| **family**         | FAM-CON               |
| **subfamily**      | CON-PRD               |
| **type**           | PT-06                 |
| **complexity**     | C-1                   |
| **authority**      | A-1                   |
| **owner**          | Content Producer      |
| **version**        | 1.0.0-draft           |
| **status**         | draft                 |
| **security_level** | SL-02                 |

---

## 2. Purpose

PRM-208 کیفیت محتوای تولیدشده را بر اساس معیارهای سازمانی اعتبارسنجی می‌کند. این پرامپت به‌عنوان یک گیت کیفیت سریع (fast quality gate) قبل از بازبینی عمیق PRM-202 عمل می‌کند.

### اصول بررسی کیفیت

| ID    | اصل                                                    |
| ----- | ------------------------------------------------------ |
| QC-01 | کیفیت قابل اندازه‌گیری است — هر معیار دارای آستانه کمی |
| QC-02 | بررسی خودکار، بازبینی عمیق را جایگزین نمی‌کند          |
| QC-03 | گزارش کیفیت باید شامل نقاط قوت و ضعف باشد              |
| QC-04 | محتوای مردود باید دلیل مشخص برای رد داشته باشد         |
| QC-05 | Quality Gate قابل تنظیم بر اساس سطح اختیار محتوا است   |

---

## 3. Scope

### Inside Scope

| حوزه                    | توضیح                                     |
| ----------------------- | ----------------------------------------- |
| بررسی املا و دستور زبان | تشخیص خطاهای املایی و نگارشی              |
| بررسی انطباق با برند    | تطابق با BRD-002 (لحن، واژگان، لحن)       |
| بررسی ساختار            | انطباق ساختار با استانداردهای EDT-001     |
| بررسی خوانایی           | امتیاز readability متن                    |
| بررسی انسجام            | پیوستگی منطقی بین بخش‌ها                  |
| بررسی طول               | انطباق طول محتوا با محدودیت‌های تعریف‌شده |

### Outside Scope

| حوزه                 | دلیل         |
| -------------------- | ------------ |
| بازبینی عمیق محتوا   | حوزه PRM-202 |
| بررسی انطباق حکمرانی | حوزه PRM-104 |
| بررسی دسترس‌پذیری    | حوزه PRM-205 |
| بررسی صحت سئو        | حوزه AI-005  |
| بررسی تطبیق پلتفرمی  | حوزه PRM-207 |

---

## 4. Consumers

| مصرف‌کننده              | نقش                                | نوع مصرف   |
| ----------------------- | ---------------------------------- | ---------- |
| AI-004 (Content Review) | گیت کیفیت سریع قبل از بازبینی عمیق | Validation |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-201 or PRM-203 Output",
        "scope": ["content-to-check", "content-type"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PRM-401",
        "scope": ["brand-voice-rules", "tone-guidelines"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PRM-402",
        "scope": ["content-attributes", "format-expectations"],
        "injection": "prepend",
        "required": false
      }
    ],
    "max_tokens": 3000,
    "priority": "medium"
  }
}
```

---

## 6. Required Knowledge

| منبع    | دامنه                | کاربرد                       |
| ------- | -------------------- | ---------------------------- |
| BRD-002 | صدای برند            | معیارهای انطباق لحن و واژگان |
| EDT-001 | ECOS                 | معیارهای ساختاری و چرخه حیات |
| GOV-001 | استانداردهای مستندات | معیارهای نگارشی              |

---

## 7. Variables

| متغیر              | نوع    | اجباری | توضیح                 | اعتبارسنجی                                                                                         |
| ------------------ | ------ | ------ | --------------------- | -------------------------------------------------------------------------------------------------- |
| `content`          | VAR-06 | بله    | محتوای مورد بررسی     | —                                                                                                  |
| `quality_criteria` | VAR-07 | خیر    | معیارهای سفارشی بررسی | items: VAR-04, members: [spelling, brand, structure, readability, coherence, length], default: همه |

---

## 8. Constraints

| ID     | محدودیت                                             |
| ------ | --------------------------------------------------- |
| CST-01 | بررسی صرفاً خودکار — جایگزین بازبینی انسانی نمی‌شود |
| CST-02 | امتیاز کیفیت باید قابل استناد و ردیابی باشد         |
| CST-03 | هر نقص باید دقیقاً به بخش محتوا ارجاع دهد           |
| CST-04 | حداکثر ۱۰ خطا در هر دسته گزارش می‌شود               |

---

## 9. Input Contract

| ورودی              | نوع    | منبع           | اجباری |
| ------------------ | ------ | -------------- | ------ |
| `content`          | object | AI-003, AI-004 | بله    |
| `quality_criteria` | array  | AI-004, AI-014 | خیر    |

---

## 10. Output Contract

| خروجی             | نوع    | توضیح                               |
| ----------------- | ------ | ----------------------------------- |
| `quality_report`  | object | گزارش کامل کیفیت شامل همه دسته‌ها   |
| `quality_score`   | number | امتیاز کلی کیفیت (۰–۱۰۰)            |
| `issues_list`     | array  | فهرست خطاها با ارجاع دقیق به موقعیت |
| `recommendations` | array  | پیشنهادات بهبود                     |
| `verdict`         | enum   | نتیجه: passed, conditional, failed  |

---

## 11. Validation Rules

| ID     | قاعده                             | سطح    | نقض     |
| ------ | --------------------------------- | ------ | ------- |
| VAL-01 | املا و دستور زبان بدون خطا        | معماری | هشدار   |
| VAL-02 | انطباق کامل با BRD-002            | معماری | هشدار   |
| VAL-03 | ساختار مطابق EDT-001              | معماری | هشدار   |
| VAL-04 | امتیاز readability ≥ ۶۰ از ۱۰۰    | معماری | هشدار   |
| VAL-05 | هر نقص دارای ارجاع دقیق به موقعیت | معماری | عدم ثبت |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                      | مسئول           |
| ----- | ----------------- | -------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل، context معتبر   | خودکار          |
| QG-02 | Review → Approved | انطباق با BRD-002, EDT-001 | Prompt Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001             | Registry Keeper |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                      |
| ------- | ------------------- | ------ | ------------------------- |
| PRM-401 | DEP-03 (References) | ^1.0.0 | معیارهای انطباق با برند   |
| PRM-402 | DEP-03 (References) | ^1.0.0 | معیارهای انطباق تاکسونومی |

---

## 14. Human Override

| سناریو                  | اقدام                                       |
| ----------------------- | ------------------------------------------- |
| quality_score < ۵۰      | محتوا مردود — بازگشت به AI-003 برای بازبینی |
| quality_score ۵۰–۷۰     | محتوا مشروط — نیازمند تأیید Content Editor  |
| تعارض در معیارهای کیفیت | Escalation به Quality Assurance Lead        |

---

## 15. Governance Notes

| ID     | یادداشت                                                         |
| ------ | --------------------------------------------------------------- |
| GOV-01 | A-1 (Tactical) — تأیید خودکار — گزارش برای حسابرسی ذخیره می‌شود |
| GOV-02 | معیارهای quality_criteria باید با Governance هماهنگ باشد        |
| GOV-03 | تغییر در آستانه‌های کیفیت نیازمند Minor Version Bump            |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-208",
  "name": "Content Quality Check",
  "family": "FAM-CON",
  "subfamily": "CON-PRD",
  "type": "PT-06",
  "complexity": "C-1",
  "authority": "A-1",
  "version": "1.0.0-draft",
  "status": "draft"
}
```

### Block 2 — Context

```json
{
  "sources": [
    { "type": "CTX-04", "source": "PRM-201 or PRM-203", "required": true },
    { "type": "CTX-02", "source": "PRM-401", "required": true },
    { "type": "CTX-02", "source": "PRM-402", "required": false }
  ],
  "max_tokens": 3000,
  "priority": "medium"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "content", "type": "VAR-06", "required": true },
    {
      "id": "quality_criteria",
      "type": "VAR-07",
      "required": false,
      "items": {
        "type": "VAR-04",
        "members": ["spelling", "brand", "structure", "readability", "coherence", "length"]
      }
    }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["content"],
    "optional": ["quality_criteria"]
  },
  "output": {
    "required": ["quality_report", "quality_score", "issues_list", "verdict"],
    "optional": ["recommendations"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Spelling and grammar error-free", "severity": "warning" },
    { "id": "VAL-02", "description": "Full BRD-002 compliance", "severity": "warning" },
    { "id": "VAL-03", "description": "Structure conforms to EDT-001", "severity": "warning" },
    { "id": "VAL-04", "description": "Readability score ≥ 60", "severity": "warning" },
    {
      "id": "VAL-05",
      "description": "Each issue has precise location reference",
      "severity": "error"
    }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-004"],
  "dependencies": ["PRM-401", "PRM-402"],
  "documentation_refs": ["BRD-002", "EDT-001"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                           | توسط        |
| ----------- | ---------- | ------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — بررسی کیفیت محتوا | معمار سیستم |
