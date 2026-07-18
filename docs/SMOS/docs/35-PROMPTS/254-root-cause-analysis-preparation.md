# Root Cause Analysis Preparation — تحلیل علت ریشه‌ای

> **شناسه:** PRM-432
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Improvement Analyst
> **وابستگی:** PRM-431
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                           |
| ------------------ | ------------------------------- |
| **id**             | PRM-432                         |
| **name_fa**        | تحلیل علت ریشه‌ای               |
| **name_en**        | Root Cause Analysis Preparation |
| **family**         | FAM-KNW                         |
| **subfamily**      | KNW-LRN                         |
| **type**           | PT-04                           |
| **complexity**     | C-3                             |
| **authority**      | A-3                             |
| **owner**          | Improvement Analyst             |
| **version**        | 1.0.0-draft                     |
| **status**         | draft                           |
| **security_level** | SL-02                           |

---

## 2. Purpose

PRM-432 سومین گام زنجیره KNW-LRN. برای هر فرصت بهبود از PRM-431 تحلیل علت ریشه‌ای انجام می‌دهد تا عوامل اصلی را شناسایی کند.

### اصول تحلیل علت

| ID    | اصل                         |
| ----- | --------------------------- |
| RC-01 | علت‌ها مبتنی بر شواهد باشند |
| RC-02 | زنجیره علت‌ها مستند شود     |

---

## 3. Scope

### Inside Scope

| حوزه                   | توضیح               |
| ---------------------- | ------------------- |
| تحلیل علت برای فرصت‌ها | شناسایی علل ریشه‌ای |
| مستندسازی زنجیره علت   | علت → معلول         |

### Outside Scope

| حوزه                   | دلیل         |
| ---------------------- | ------------ |
| ترکیب یادگیری سازمانی  | حوزه PRM-433 |
| برنامه‌ریزی تکامل دانش | حوزه PRM-434 |

---

## 4. Consumers

| مصرف‌کننده           | نقش        | نوع مصرف  |
| -------------------- | ---------- | --------- |
| AI-012 (Improvement) | تحلیل علت  | Chain     |
| AI-011 (Knowledge)   | مصرف تحلیل | Secondary |

---

## 5. Inputs

| ورودی                       | نوع    | منبع             | اجباری |
| --------------------------- | ------ | ---------------- | ------ |
| `improvement_opportunities` | array  | PRM-431          | بله    |
| `evidence_data`             | object | PRM-422, PRM-423 | بله    |

---

## 6. Outputs

| خروجی          | نوع   | توضیح                       |
| -------------- | ----- | --------------------------- |
| `root_causes`  | array | علت‌های ریشه‌ای شناسایی‌شده |
| `cause_chains` | array | زنجیره علت‌ها               |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "PRM-431-output",
        "scope": ["opportunities"],
        "injection": "prepend",
        "required": true
      }
    ],
    "max_tokens": 4000,
    "priority": "high"
  }
}
```

---

## 8. Knowledge Requirements

| منبع           | دامنه   | کاربرد    |
| -------------- | ------- | --------- |
| فرصت‌های بهبود | فرصت‌ها | تحلیل علت |

---

## 9. Prompt Structure

PRM-432 سومین گام زنجیره KNW-LRN. علت‌های ریشه‌ای را تحلیل می‌کند.

```
improvement_opportunities + evidence_data → PRM-432 → root_causes → PRM-433
```

---

## 10. Variable Definitions

| متغیر                       | نوع    | اجباری | توضیح          |
| --------------------------- | ------ | ------ | -------------- |
| `improvement_opportunities` | VAR-03 | بله    | فرصت‌های بهبود |
| `evidence_data`             | VAR-06 | بله    | شواهد پشتیبان  |

---

## 11. Execution Constraints

| ID     | محدودیت                                |
| ------ | -------------------------------------- |
| CST-01 | هر علت ریشه‌ای به شواهد ارجاع دهد      |
| CST-02 | زنجیره علت‌ها مستند و قابل ردیابی باشد |

---

## 12. Validation Rules

| ID     | قاعده                       | سطح    | نقض   |
| ------ | --------------------------- | ------ | ----- |
| VAL-01 | علت‌ها به شواهد ارجاع دارند | معماری | خطا   |
| VAL-02 | زنجیره علت‌ها کامل است      | معماری | هشدار |

---

## 13. Failure Conditions

| شرط                            | اقدام                                        |
| ------------------------------ | -------------------------------------------- |
| شواهد کافی برای تحلیل علت نیست | بازگشت warning + پیشنهاد جمع‌آوری داده بیشتر |

---

## 14. Quality Gates

| گیت   | مکان              | معیار      | مسئول               |
| ----- | ----------------- | ---------- | ------------------- |
| QG-01 | Draft → Review    | هویت کامل  | خودکار              |
| QG-02 | Review → Approved | تحلیل کامل | Improvement Analyst |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                           | توسط        |
| ----------- | ---------- | ------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — تحلیل علت ریشه‌ای | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-432",
  "name": "Root Cause Analysis Preparation",
  "family": "FAM-KNW",
  "subfamily": "KNW-LRN",
  "type": "PT-04",
  "complexity": "C-3",
  "authority": "A-3",
  "version": "1.0.0-draft",
  "status": "draft"
}
```

### Block 2 — Context

```json
{
  "sources": [{ "type": "CTX-02", "source": "PRM-431-output", "required": true }],
  "max_tokens": 4000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "improvement_opportunities", "type": "VAR-03", "required": true },
    { "id": "evidence_data", "type": "VAR-06", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["improvement_opportunities", "evidence_data"],
    "optional": []
  },
  "output": {
    "required": ["root_causes", "cause_chains"],
    "optional": []
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Root causes reference evidence", "severity": "error" },
    { "id": "VAL-02", "description": "Cause chain is complete", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-012", "AI-011"],
  "dependencies": ["PRM-431"],
  "documentation_refs": []
}
```
