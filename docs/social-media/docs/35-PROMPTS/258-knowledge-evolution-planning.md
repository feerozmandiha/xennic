# Knowledge Evolution Planning — برنامه‌ریزی تکامل دانش

> **شناسه:** PRM-434
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Knowledge Architect
> **وابستگی:** PRM-433
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                        |
| ------------------ | ---------------------------- |
| **id**             | PRM-434                      |
| **name_fa**        | برنامه‌ریزی تکامل دانش       |
| **name_en**        | Knowledge Evolution Planning |
| **family**         | FAM-KNW                      |
| **subfamily**      | KNW-LRN                      |
| **type**           | PT-04                        |
| **complexity**     | C-3                          |
| **authority**      | A-3                          |
| **owner**          | Knowledge Architect          |
| **version**        | 1.0.0-draft                  |
| **status**         | draft                        |
| **security_level** | SL-02                        |

---

## 2. Purpose

PRM-434 پنجمین گام زنجیره KNW-LRN. بر اساس ترکیب یادگیری PRM-433، برنامه تکامل پایگاه دانش سازمانی را تعریف می‌کند.

### اصول تکامل

| ID    | اصل                                      |
| ----- | ---------------------------------------- |
| KE-01 | تکامل دانش مبتنی بر نیازهای سازمانی باشد |
| KE-02 | اولویت‌های تکامل مستند باشند             |

---

## 3. Scope

### Inside Scope

| حوزه                      | توضیح                |
| ------------------------- | -------------------- |
| تعریف مسیر تکامل دانش     | به‌روزرسانی KNW-\*   |
| اولویت‌بندی شکاف‌های دانش | شکاف‌های شناسایی‌شده |

### Outside Scope

| حوزه                  | دلیل         |
| --------------------- | ------------ |
| ترکیب یادگیری         | حوزه PRM-433 |
| بسته توصیه بهینه‌سازی | حوزه PRM-435 |

---

## 4. Consumers

| مصرف‌کننده           | نقش               | نوع مصرف  |
| -------------------- | ----------------- | --------- |
| AI-012 (Improvement) | برنامه‌ریزی تکامل | Chain     |
| AI-011 (Knowledge)   | مصرف برنامه تکامل | Secondary |

---

## 5. Inputs

| ورودی                | نوع    | منبع    | اجباری |
| -------------------- | ------ | ------- | ------ |
| `learning_synthesis` | object | PRM-433 | بله    |
| `knowledge_index`    | object | PRM-001 | بله    |

---

## 6. Outputs

| خروجی            | نوع    | توضیح                     |
| ---------------- | ------ | ------------------------- |
| `evolution_plan` | object | برنامه تکامل دانش         |
| `knowledge_gaps` | array  | شکاف‌های دانش شناسایی‌شده |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "PRM-433-output",
        "scope": ["synthesis"],
        "injection": "prepend",
        "required": true
      }
    ],
    "max_tokens": 3500,
    "priority": "high"
  }
}
```

---

## 8. Knowledge Requirements

| منبع    | دامنه      | کاربرد          |
| ------- | ---------- | --------------- |
| PRM-001 | نمایه دانش | شناسایی شکاف‌ها |

---

## 9. Prompt Structure

PRM-434 پنجمین گام زنجیره KNW-LRN. تکامل دانش را برنامه‌ریزی می‌کند.

```
learning_synthesis + knowledge_index → PRM-434 → evolution_plan → PRM-435
```

---

## 10. Variable Definitions

| متغیر                | نوع    | اجباری | توضیح         |
| -------------------- | ------ | ------ | ------------- |
| `learning_synthesis` | VAR-06 | بله    | ترکیب یادگیری |
| `knowledge_index`    | VAR-03 | بله    | نمایه دانش    |

---

## 11. Execution Constraints

| ID     | محدودیت                               |
| ------ | ------------------------------------- |
| CST-01 | برنامه با نیازهای سازمانی همخوان باشد |
| CST-02 | شکاف‌های دانش اولویت‌بندی شوند        |

---

## 12. Validation Rules

| ID     | قاعده                         | سطح    | نقض   |
| ------ | ----------------------------- | ------ | ----- |
| VAL-01 | شکاف‌های دانش شناسایی شده‌اند | معماری | خطا   |
| VAL-02 | اولویت‌بندی شده‌اند           | معماری | هشدار |

---

## 13. Failure Conditions

| شرط            | اقدام                  |
| -------------- | ---------------------- |
| شکافی یافت نشد | بازگشت status: no_gaps |

---

## 14. Quality Gates

| گیت   | مکان              | معیار       | مسئول               |
| ----- | ----------------- | ----------- | ------------------- |
| QG-01 | Draft → Review    | هویت کامل   | خودکار              |
| QG-02 | Review → Approved | برنامه کامل | Knowledge Architect |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                                | توسط        |
| ----------- | ---------- | ------------------------------------ | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — برنامه‌ریزی تکامل دانش | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-434",
  "name": "Knowledge Evolution Planning",
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
  "sources": [{ "type": "CTX-02", "source": "PRM-433-output", "required": true }],
  "max_tokens": 3500,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "learning_synthesis", "type": "VAR-06", "required": true },
    { "id": "knowledge_index", "type": "VAR-03", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["learning_synthesis", "knowledge_index"],
    "optional": []
  },
  "output": {
    "required": ["evolution_plan", "knowledge_gaps"],
    "optional": []
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Knowledge gaps identified", "severity": "error" },
    { "id": "VAL-02", "description": "Gaps are prioritized", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-012", "AI-011"],
  "dependencies": ["PRM-433"],
  "documentation_refs": ["PRM-001"]
}
```
