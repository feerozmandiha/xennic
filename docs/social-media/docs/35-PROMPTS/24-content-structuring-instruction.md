# Content Structuring Instruction — دستورالعمل ساختاردهی محتوا

> **شناسه:** PRM-203
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Content Producer
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-201](../35-PROMPTS/20-content-production-instruction.md), [PRM-202](../35-PROMPTS/22-content-review-validation.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                           |
| ------------------ | ------------------------------- |
| **id**             | PRM-203                         |
| **name_fa**        | دستورالعمل ساختاردهی محتوا      |
| **name_en**        | Content Structuring Instruction |
| **family**         | FAM-CON                         |
| **subfamily**      | CON-PRD                         |
| **type**           | PT-04                           |
| **complexity**     | C-2                             |
| **authority**      | A-3                             |
| **owner**          | Content Producer                |
| **version**        | 1.0.0-draft                     |
| **status**         | draft                           |
| **security_level** | SL-02                           |

---

## 2. Purpose

PRM-203 قواعد ساختاردهی محتوای تأییدشده به اسناد متعارف سازمانی را تعریف می‌کند. این پرامپت تضمین می‌کند محتوای تولیدشده توسط Agentهای مختلف دارای ساختار یکسان، معنای پایدار و قابلیت پردازش توسط Agentهای پایین‌دست است.

### اصول ساختاردهی

| ID    | اصل                                                                |
| ----- | ------------------------------------------------------------------ |
| CS-01 | ساختار باید معنای محتوا را حفظ کند — بازآرایی ممنوع                |
| CS-02 | هر سند متعارف باید دارای ساختار سلسله‌مراتب (H1, H2, H3, ...) باشد |
| CS-03 | بخش‌های محتوا باید قابل شناسایی و ارجاع (anchorable) باشند         |
| CS-04 | ساختار باید مستقل از پلتفرم باشد — وابستگی به پلتفرم ممنوع         |
| CS-05 | فراداده ساختاری باید در سطح بلوک (block-level) ثبت شود             |

---

## 3. Scope

### Inside Scope

| حوزه                     | توضیح                                      |
| ------------------------ | ------------------------------------------ |
| تعیین ساختار سلسله‌مراتب | H1 تا H4 با قواعد سطح‌بندی                 |
| بلوک‌بندی محتوا          | تقسیم به بلوک‌های معنایی (semantic blocks) |
| شناسه‌گذاری بلوک‌ها      | اختصاص شناسه یکتا به هر بلوک               |
| حفظ معنای محتوا          | تضمین یکپارچگی معنایی در بازآرایی ساختار   |
| تعریف روابط بلوک‌ها      | روابط ترتیبی، سلسله‌مراتبی و ارجاعی        |

### Outside Scope

| حوزه               | دلیل         |
| ------------------ | ------------ |
| تولید محتوای اولیه | حوزه PRM-201 |
| بازبینی محتوا      | حوزه PRM-202 |
| تولید فراداده      | حوزه PRM-204 |
| تطبیق پلتفرمی      | حوزه PRM-207 |

---

## 4. Consumers

| مصرف‌کننده                      | نقش                          | نوع مصرف    |
| ------------------------------- | ---------------------------- | ----------- |
| AI-003 (Content Production)     | ساختاردهی محتوای تولیدشده    | Instruction |
| AI-005 (Search Optimization)    | بهینه‌سازی ساختار برای جستجو | Context     |
| AI-006 (Media Asset Production) | تطبیق ساختار با نیاز رسانه   | Reference   |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-202 Output",
        "scope": ["approved-content", "review-report"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PRM-402",
        "scope": ["content-attributes", "format-constraints"],
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

| منبع    | دامنه     | کاربرد                     |
| ------- | --------- | -------------------------- |
| EDT-001 | ECOS      | چرخه حیات و مراحل تولید    |
| EDT-002 | تاکسونومی | تطابق ساختار با نوع محتوا  |
| BRD-002 | صدای برند | ساختار جملات و پاراگراف‌ها |

---

## 7. Variables

| متغیر                     | نوع    | اجباری | توضیح                     | اعتبارسنجی                                                   |
| ------------------------- | ------ | ------ | ------------------------- | ------------------------------------------------------------ |
| `approved_content`        | VAR-06 | بله    | محتوای تأییدشده از AI-004 | —                                                            |
| `structure_depth`         | VAR-04 | خیر    | عمق ساختار سلسله‌مراتب    | members: [2, 3, 4], default: 3                               |
| `block_naming_convention` | VAR-04 | خیر    | قرارداد نام‌گذاری بلوک‌ها | members: [sequential, semantic, hybrid], default: sequential |

---

## 8. Constraints

| ID     | محدودیت                                            |
| ------ | -------------------------------------------------- |
| CST-01 | ساختار سلسله‌مراتب حداکثر ۴ سطح (H1→H4)            |
| CST-02 | هر بلوک محتوا دارای شناسه منحصربه‌فرد              |
| CST-03 | تغییر ترتیب بلوک‌ها فقط در صورت عدم وابستگی معنایی |
| CST-04 | حداکثر ۱۰۰۰ کلمه بین دو تیتر متوالی                |
| CST-05 | حفظ references و cross-links در ساختار نهایی       |

---

## 9. Input Contract

| ورودی                     | نوع    | منبع    | اجباری |
| ------------------------- | ------ | ------- | ------ |
| `approved_content`        | object | PRM-202 | بله    |
| `structure_depth`         | enum   | AI-014  | خیر    |
| `block_naming_convention` | enum   | AI-014  | خیر    |

---

## 10. Output Contract

| خروجی                    | نوع    | توضیح                                |
| ------------------------ | ------ | ------------------------------------ |
| `structured_document`    | object | سند ساختاریافته شامل بلوک‌های معنایی |
| `block_index`            | array  | نمایه بلوک‌ها با شناسه و سطح         |
| `heading_hierarchy`      | object | درخت تیتربندی (heading tree)         |
| `semantic_relationships` | array  | روابط معنایی بین بلوک‌ها             |

---

## 11. Validation Rules

| ID     | قاعده                       | سطح    | نقض     |
| ------ | --------------------------- | ------ | ------- |
| VAL-01 | ساختار ≤ ۴ سطح H            | معماری | هشدار   |
| VAL-02 | هر بلوک دارای شناسه یکتا    | معماری | هشدار   |
| VAL-03 | حفظ معنای محتوا             | معماری | عدم ثبت |
| VAL-04 | حداکثر ۱۰۰۰ کلمه بین تیترها | معماری | هشدار   |
| VAL-05 | فراداده بلوک ثبت‌شده        | معماری | هشدار   |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                          | مسئول           |
| ----- | ----------------- | ------------------------------ | --------------- |
| QG-01 | Draft → Review    | هویت کامل، ورودی PRM-202 معتبر | خودکار          |
| QG-02 | Review → Approved | انطباق با PRM-000، EDT-001     | Prompt Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001، ADR (A-3)      | Registry Keeper |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                                  |
| ------- | ------------------- | ------ | ------------------------------------- |
| PRM-201 | DEP-04 (Validates)  | ^1.0.0 | خروجی تولید محتوا را ساختاردهی می‌کند |
| PRM-202 | DEP-01 (Requires)   | ^1.0.0 | محتوای تأییدشده ورودی است             |
| PRM-402 | DEP-03 (References) | ^1.0.0 | بافت تاکسونومی برای تطابق ساختار      |

---

## 14. Human Override

| سناریو                                     | اقدام                               |
| ------------------------------------------ | ----------------------------------- |
| ساختار پیشنهادی با هدف محتوا همخوانی ندارد | بازگشت به AI-002 برای بازنگری brief |
| بلوک‌های محتوا دارای وابستگی چرخه‌ای       | Escalation به Human Editor          |
| ساختار مورد نیاز بیش از ۴ سطح عمق          | تأیید انسانی الزامی                 |

---

## 15. Governance Notes

| ID     | یادداشت                                                         |
| ------ | --------------------------------------------------------------- |
| GOV-01 | تغییر در ساختار سلسله‌مراتب نیازمند Minor Version Bump          |
| GOV-02 | همه بلوک‌های محتوا باید قابل حسابرسی باشند                      |
| GOV-03 | ساختار باید با استاندارد GOV-004 (Cross References) سازگار باشد |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-203",
  "name": "Content Structuring Instruction",
  "family": "FAM-CON",
  "subfamily": "CON-PRD",
  "type": "PT-04",
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
    { "type": "CTX-04", "source": "PRM-202", "required": true },
    { "type": "CTX-02", "source": "PRM-402", "required": true }
  ],
  "max_tokens": 3000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "approved_content", "type": "VAR-06", "required": true },
    {
      "id": "structure_depth",
      "type": "VAR-04",
      "required": false,
      "members": [2, 3, 4],
      "default": 3
    },
    {
      "id": "block_naming_convention",
      "type": "VAR-04",
      "required": false,
      "members": ["sequential", "semantic", "hybrid"],
      "default": "sequential"
    }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["approved_content"],
    "optional": ["structure_depth", "block_naming_convention"]
  },
  "output": {
    "required": ["structured_document", "block_index", "heading_hierarchy"],
    "optional": ["semantic_relationships"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Structure ≤ 4 heading levels", "severity": "warning" },
    { "id": "VAL-02", "description": "Each block has unique ID", "severity": "warning" },
    { "id": "VAL-03", "description": "Semantic meaning preserved", "severity": "error" },
    { "id": "VAL-04", "description": "Max 1000 words between headings", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-003", "AI-005", "AI-006"],
  "dependencies": ["PRM-201", "PRM-202", "PRM-402"],
  "documentation_refs": ["EDT-001", "EDT-002"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                                    | توسط        |
| ----------- | ---------- | ---------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — دستورالعمل ساختاردهی محتوا | معمار سیستم |
