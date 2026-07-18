# Evidence Evaluation — ارزیابی شواهد

> **شناسه:** PRM-423
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Research Analyst
> **وابستگی:** PRM-422
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار               |
| ------------------ | ------------------- |
| **id**             | PRM-423             |
| **name_fa**        | ارزیابی شواهد       |
| **name_en**        | Evidence Evaluation |
| **family**         | FAM-KNW             |
| **subfamily**      | KNW-RSR             |
| **type**           | PT-06               |
| **complexity**     | C-2                 |
| **authority**      | A-3                 |
| **owner**          | Research Analyst    |
| **version**        | 1.0.0-draft         |
| **status**         | draft               |
| **security_level** | SL-02               |

---

## 2. Purpose

PRM-423 چهارمین گام زنجیره KNW-RSR. شواهد جمع‌آوری‌شده در PRM-422 را بر اساس معیارهای اعتبار، تازگی، ارتباط و بی‌طرفی ارزیابی می‌کند.

### اصول ارزیابی

| ID    | اصل                                      |
| ----- | ---------------------------------------- |
| EE-01 | شواهد از نظر اعتبار منبع ارزیابی شوند    |
| EE-02 | شواهد از نظر ارتباط با سؤال ارزیابی شوند |

---

## 3. Scope

### Inside Scope

| حوزه                 | توضیح            |
| -------------------- | ---------------- |
| ارزیابی اعتبار شواهد | منبع، تاریخ، دقت |
| درجه‌بندی شواهد      | قوی، متوسط، ضعیف |

### Outside Scope

| حوزه           | دلیل         |
| -------------- | ------------ |
| جمع‌آوری شواهد | حوزه PRM-422 |
| همبستگی        | حوزه PRM-424 |

---

## 4. Consumers

| مصرف‌کننده        | نقش           | نوع مصرف |
| ----------------- | ------------- | -------- |
| AI-013 (Research) | ارزیابی شواهد | Chain    |
| AI-004 (Review)   | اعتبارسنجی    | Quality  |

---

## 5. Inputs

| ورودی                 | نوع   | منبع    | اجباری |
| --------------------- | ----- | ------- | ------ |
| `evidence_collection` | array | PRM-422 | بله    |
| `research_questions`  | array | PRM-420 | بله    |

---

## 6. Outputs

| خروجی                 | نوع    | توضیح                |
| --------------------- | ------ | -------------------- |
| `evidence_evaluation` | array  | شواهد با درجه اعتبار |
| `evaluation_summary`  | object | خلاصه ارزیابی        |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "PRM-422-output",
        "scope": ["evidence"],
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

| منبع  | دامنه                   | کاربرد  |
| ----- | ----------------------- | ------- |
| شواهد | تمام شواهد جمع‌آوری‌شده | ارزیابی |

---

## 9. Prompt Structure

PRM-423 چهارمین گام زنجیره KNW-RSR. شواهد را ارزیابی و درجه‌بندی می‌کند.

```
evidence_collection → PRM-423 → evidence_evaluation → PRM-424
```

---

## 10. Variable Definitions

| متغیر                 | نوع    | اجباری | توضیح            |
| --------------------- | ------ | ------ | ---------------- |
| `evidence_collection` | VAR-03 | بله    | شواهد از PRM-422 |
| `research_questions`  | VAR-03 | بله    | سؤالات پژوهش     |

---

## 11. Execution Constraints

| ID     | محدودیت                           |
| ------ | --------------------------------- |
| CST-01 | هر شاهد یک درجه اعتبار داشته باشد |
| CST-02 | ارزیابی مستند و قابل ردیابی باشد  |

---

## 12. Validation Rules

| ID     | قاعده                | سطح    | نقض   |
| ------ | -------------------- | ------ | ----- |
| VAL-01 | هر شاهد ارزیابی شود  | معماری | خطا   |
| VAL-02 | دلیل ارزیابی ثبت شود | معماری | هشدار |

---

## 13. Failure Conditions

| شرط                          | اقدام                                 |
| ---------------------------- | ------------------------------------- |
| شواهد برای ارزیابی کافی نیست | بازگشت warning + دستور جمع‌آوری بیشتر |

---

## 14. Quality Gates

| گیت   | مکان              | معیار        | مسئول            |
| ----- | ----------------- | ------------ | ---------------- |
| QG-01 | Draft → Review    | هویت کامل    | خودکار           |
| QG-02 | Review → Approved | ارزیابی کامل | Research Analyst |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                       | توسط        |
| ----------- | ---------- | --------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — ارزیابی شواهد | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-423",
  "name": "Evidence Evaluation",
  "family": "FAM-KNW",
  "subfamily": "KNW-RSR",
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
  "sources": [{ "type": "CTX-02", "source": "PRM-422-output", "required": true }],
  "max_tokens": 3000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "evidence_collection", "type": "VAR-03", "required": true },
    { "id": "research_questions", "type": "VAR-03", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["evidence_collection", "research_questions"],
    "optional": []
  },
  "output": {
    "required": ["evidence_evaluation", "evaluation_summary"],
    "optional": []
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Each evidence is evaluated", "severity": "error" },
    { "id": "VAL-02", "description": "Evaluation reason is recorded", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-013", "AI-004"],
  "dependencies": ["PRM-422"],
  "documentation_refs": []
}
```
