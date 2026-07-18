# Evidence Collection Instruction — دستورالعمل جمع‌آوری شواهد

> **شناسه:** PRM-422
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Research Analyst
> **وابستگی:** PRM-421
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                           |
| ------------------ | ------------------------------- |
| **id**             | PRM-422                         |
| **name_fa**        | دستورالعمل جمع‌آوری شواهد       |
| **name_en**        | Evidence Collection Instruction |
| **family**         | FAM-KNW                         |
| **subfamily**      | KNW-RSR                         |
| **type**           | PT-04                           |
| **complexity**     | C-3                             |
| **authority**      | A-3                             |
| **owner**          | Research Analyst                |
| **version**        | 1.0.0-draft                     |
| **status**         | draft                           |
| **security_level** | SL-02                           |

---

## 2. Purpose

PRM-422 سومین گام زنجیره KNW-RSR. از منابع انتخاب‌شده در PRM-421 شواهد مرتبط با سؤالات پژوهش را استخراج و مستند می‌کند.

### اصول جمع‌آوری

| ID    | اصل                            |
| ----- | ------------------------------ |
| EC-01 | شواهد عینی و قابل استناد باشند |
| EC-02 | هر شاهد منبع مشخص داشته باشد   |

---

## 3. Scope

### Inside Scope

| حوزه                   | توضیح              |
| ---------------------- | ------------------ |
| استخراج شواهد از منابع | متن، نقل‌قول، داده |
| مستندسازی شواهد        | با ارجاع به منبع   |

### Outside Scope

| حوزه          | دلیل         |
| ------------- | ------------ |
| ارزیابی شواهد | حوزه PRM-423 |
| همبستگی منابع | حوزه PRM-424 |

---

## 4. Consumers

| مصرف‌کننده         | نقش            | نوع مصرف  |
| ------------------ | -------------- | --------- |
| AI-013 (Research)  | جمع‌آوری شواهد | Chain     |
| AI-011 (Knowledge) | مصرف شواهد     | Secondary |

---

## 5. Inputs

| ورودی                | نوع    | منبع    | اجباری |
| -------------------- | ------ | ------- | ------ |
| `source_selection`   | object | PRM-421 | بله    |
| `research_questions` | array  | PRM-420 | بله    |

---

## 6. Outputs

| خروجی                 | نوع    | توضیح          |
| --------------------- | ------ | -------------- |
| `evidence_collection` | array  | شواهد مستندشده |
| `evidence_summary`    | object | خلاصه شواهد    |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "selected-sources",
        "scope": ["evidence"],
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

| منبع             | دامنه      | کاربرد        |
| ---------------- | ---------- | ------------- |
| منابع انتخاب‌شده | حوزه پژوهش | استخراج شواهد |

---

## 9. Prompt Structure

PRM-422 سومین گام زنجیره KNW-RSR. شواهد را از منابع انتخاب‌شده جمع‌آوری می‌کند.

```
source_selection + research_questions → PRM-422 → evidence_collection → PRM-423
```

---

## 10. Variable Definitions

| متغیر                | نوع    | اجباری | توضیح                       |
| -------------------- | ------ | ------ | --------------------------- |
| `source_selection`   | VAR-06 | بله    | منابع انتخاب‌شده از PRM-421 |
| `research_questions` | VAR-03 | بله    | سؤالات پژوهش از PRM-420     |

---

## 11. Execution Constraints

| ID     | محدودیت                           |
| ------ | --------------------------------- |
| CST-01 | هر شاهد به منبع ارجاع دهد         |
| CST-02 | شواهد با سؤالات پژوهش مرتبط باشند |

---

## 12. Validation Rules

| ID     | قاعده                         | سطح    | نقض   |
| ------ | ----------------------------- | ------ | ----- |
| VAL-01 | هر شاهد منبع دارد             | معماری | خطا   |
| VAL-02 | شواهد به سؤالات مرتبط شده‌اند | معماری | هشدار |

---

## 13. Failure Conditions

| شرط                 | اقدام                                  |
| ------------------- | -------------------------------------- |
| شواهد کافی یافت نشد | بازگشت warning + پیشنهاد منابع جایگزین |

---

## 14. Quality Gates

| گیت   | مکان              | معیار      | مسئول            |
| ----- | ----------------- | ---------- | ---------------- |
| QG-01 | Draft → Review    | هویت کامل  | خودکار           |
| QG-02 | Review → Approved | شواهد کامل | Research Analyst |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                                   | توسط        |
| ----------- | ---------- | --------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — دستورالعمل جمع‌آوری شواهد | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-422",
  "name": "Evidence Collection Instruction",
  "family": "FAM-KNW",
  "subfamily": "KNW-RSR",
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
  "sources": [{ "type": "CTX-02", "source": "selected-sources", "required": true }],
  "max_tokens": 4000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "source_selection", "type": "VAR-06", "required": true },
    { "id": "research_questions", "type": "VAR-03", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["source_selection", "research_questions"],
    "optional": []
  },
  "output": {
    "required": ["evidence_collection", "evidence_summary"],
    "optional": []
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Each evidence has a source reference", "severity": "error" },
    {
      "id": "VAL-02",
      "description": "Evidence mapped to research questions",
      "severity": "warning"
    }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-013", "AI-011"],
  "dependencies": ["PRM-421"],
  "documentation_refs": []
}
```
