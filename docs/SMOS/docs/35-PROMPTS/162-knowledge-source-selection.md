# Knowledge Source Selection — انتخاب منبع دانش

> **شناسه:** PRM-404
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Knowledge Architect
> **وابستگی:** PRM-403, [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [ARCH-012](../00-ARCHITECTURE/12-knowledge-model.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                      |
| ------------------ | -------------------------- |
| **id**             | PRM-404                    |
| **name_fa**        | انتخاب منبع دانش           |
| **name_en**        | Knowledge Source Selection |
| **family**         | FAM-KNW                    |
| **subfamily**      | KNW-RTR                    |
| **type**           | PT-07                      |
| **complexity**     | C-3                        |
| **authority**      | A-3                        |
| **owner**          | Knowledge Architect        |
| **version**        | 1.0.0-draft                |
| **status**         | draft                      |
| **security_level** | SL-02                      |

---

## 2. Purpose

PRM-404 دومین پرامپت زنجیره KNW-RTR. استراتژی بازیابی (PRM-403) را به انتخاب منابع دانشی مشخص تبدیل می‌کند: تعیین منبع اصلی، منابع مکمل و اولویت دسترسی.

### اصول انتخاب

| ID    | اصل                                                 |
| ----- | --------------------------------------------------- |
| KS-01 | منبع اصلی باید بیش‌ترین تطابق با نیاز را داشته باشد |
| KS-02 | منابع مکمل باید شکاف‌های منبع اصلی را پوشش دهند     |
| KS-03 | اولویت دسترسی باید با اختیار مصرف‌کننده همخوان باشد |

---

## 3. Scope

### Inside Scope

| حوزه              | توضیح                       |
| ----------------- | --------------------------- |
| انتخاب منبع اصلی  | تعیین منبع اولیه دانش       |
| انتخاب منابع مکمل | تعیین منابع پشتیبان         |
| اولویت دسترسی     | تعیین توالی مراجعه به منابع |

### Outside Scope

| حوزه                   | دلیل         |
| ---------------------- | ------------ |
| تعریف استراتژی بازیابی | حوزه PRM-403 |
| استخراج دانش           | حوزه PRM-405 |

---

## 4. Consumers

| مصرف‌کننده         | نقش                | نوع مصرف  |
| ------------------ | ------------------ | --------- |
| AI-011 (Knowledge) | انتخاب منابع دانشی | Chain     |
| AI-010 (Analytics) | مصرف انتخاب منابع  | Secondary |

---

## 5. Inputs

| ورودی                        | نوع    | منبع    | اجباری |
| ---------------------------- | ------ | ------- | ------ |
| `retrieval_strategy`         | object | PRM-403 | بله    |
| `enterprise_knowledge_index` | object | AI-011  | بله    |
| `domain_constraints`         | object | AI-011  | خیر    |

---

## 6. Outputs

| خروجی                       | نوع     | توضیح                  |
| --------------------------- | ------- | ---------------------- |
| `primary_source`            | object  | منبع اصلی دانش         |
| `supplementary_sources`     | array   | منابع مکمل             |
| `access_priority`           | array   | اولویت دسترسی به منابع |
| `source_selection_complete` | boolean | وضعیت تکمیل            |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "ARCH-012",
        "scope": ["knowledge-index", "knowledge-domains"],
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

## 8. Knowledge Requirements

| منبع     | دامنه              | کاربرد      |
| -------- | ------------------ | ----------- |
| ARCH-012 | فهرست دانش سازمانی | انتخاب منبع |

---

## 9. Prompt Structure

PRM-404 دومین گام زنجیره KNW-RTR. استراتژی بازیابی را به انتخاب منابع تبدیل می‌کند.

```
retrieval_strategy → PRM-404 → source_selection → PRM-405
```

---

## 10. Variable Definitions

| متغیر                        | نوع    | اجباری | توضیح                     | اعتبارسنجی     |
| ---------------------------- | ------ | ------ | ------------------------- | -------------- |
| `retrieval_strategy`         | VAR-06 | بله    | خروجی استراتژی از PRM-403 | منطبق با KR-01 |
| `enterprise_knowledge_index` | VAR-06 | بله    | فهرست رسمی دانش سازمانی   | —              |
| `domain_constraints`         | VAR-04 | خیر    | محدودیت‌های دامنه دانش    | —              |

---

## 11. Execution Constraints

| ID     | محدودیت                          |
| ------ | -------------------------------- |
| CST-01 | منبع اصلی منطبق با استراتژی باشد |
| CST-02 | منابع مکمل شکاف‌ها را پوشش دهند  |

---

## 12. Validation Rules

| ID     | قاعده                                | سطح    | نقض     |
| ------ | ------------------------------------ | ------ | ------- |
| VAL-01 | منبع اصلی مشخص شده است               | معماری | عدم ثبت |
| VAL-02 | اولویت دسترسی معتبر است              | معماری | بازگشت  |
| VAL-03 | منابع مکمل با استراتژی همخوانی دارند | معماری | هشدار   |

---

## 13. Failure Conditions

| شرط                             | اقدام                             |
| ------------------------------- | --------------------------------- |
| هیچ منبع اصلی قابل انتخاب نیست  | Escalation به Knowledge Architect |
| تناقض بین استراتژی و فهرست دانش | بازگشت error + درخواست بازبینی    |

---

## 14. Quality Gates

| گیت   | مکان              | معیار                          | مسئول               |
| ----- | ----------------- | ------------------------------ | ------------------- |
| QG-01 | Draft → Review    | هویت کامل, ورودی PRM-403 معتبر | خودکار              |
| QG-02 | Review → Approved | انتخاب منبع کامل               | Knowledge Architect |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3)      | Registry Keeper     |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                          | توسط        |
| ----------- | ---------- | ------------------------------ | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — انتخاب منبع دانش | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-404",
  "name": "Knowledge Source Selection",
  "family": "FAM-KNW",
  "subfamily": "KNW-RTR",
  "type": "PT-07",
  "complexity": "C-3",
  "authority": "A-3",
  "version": "1.0.0-draft",
  "status": "draft"
}
```

### Block 2 — Context

```json
{
  "sources": [{ "type": "CTX-02", "source": "ARCH-012", "required": true }],
  "max_tokens": 3000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "retrieval_strategy", "type": "VAR-06", "required": true },
    { "id": "enterprise_knowledge_index", "type": "VAR-06", "required": true },
    { "id": "domain_constraints", "type": "VAR-04", "required": false }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["retrieval_strategy", "enterprise_knowledge_index"],
    "optional": ["domain_constraints"]
  },
  "output": {
    "required": ["primary_source", "source_selection_complete"],
    "optional": ["supplementary_sources", "access_priority"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Primary source is specified", "severity": "error" },
    { "id": "VAL-02", "description": "Access priority is valid", "severity": "error" },
    {
      "id": "VAL-03",
      "description": "Supplementary sources align with strategy",
      "severity": "warning"
    }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-011", "AI-010"],
  "dependencies": ["PRM-403"],
  "documentation_refs": ["ARCH-012"]
}
```
