# Cross-Source Correlation — همبستگی میان منابع

> **شناسه:** PRM-424
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Research Analyst
> **وابستگی:** PRM-423
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                    |
| ------------------ | ------------------------ |
| **id**             | PRM-424                  |
| **name_fa**        | همبستگی میان منابع       |
| **name_en**        | Cross-Source Correlation |
| **family**         | FAM-KNW                  |
| **subfamily**      | KNW-RSR                  |
| **type**           | PT-04                    |
| **complexity**     | C-3                      |
| **authority**      | A-3                      |
| **owner**          | Research Analyst         |
| **version**        | 1.0.0-draft              |
| **status**         | draft                    |
| **security_level** | SL-02                    |

---

## 2. Purpose

PRM-424 پنجمین گام زنجیره KNW-RSR. شواهد ارزیابی‌شده از چند منبع را مقایسه، تطبیق و همبستگی می‌دهد تا الگوها، توافق‌ها و تضادها را شناسایی کند.

### اصول همبستگی

| ID    | اصل                                     |
| ----- | --------------------------------------- |
| CC-01 | توافق میان منابع مستند شود              |
| CC-02 | تضاد میان منابع بدون جانبداری گزارش شود |

---

## 3. Scope

### Inside Scope

| حوزه                   | توضیح                      |
| ---------------------- | -------------------------- |
| تطبیق شواهد میان منابع | توافق و تضاد               |
| شناسایی الگوها         | روندهای مشترک و نقاط واگرا |

### Outside Scope

| حوزه          | دلیل         |
| ------------- | ------------ |
| ارزیابی شواهد | حوزه PRM-423 |
| تولید بینش    | حوزه PRM-425 |

---

## 4. Consumers

| مصرف‌کننده         | نقش             | نوع مصرف  |
| ------------------ | --------------- | --------- |
| AI-013 (Research)  | همبستگی شواهد   | Chain     |
| AI-010 (Analytics) | مصرف برای تحلیل | Secondary |

---

## 5. Inputs

| ورودی                 | نوع    | منبع    | اجباری |
| --------------------- | ------ | ------- | ------ |
| `evidence_evaluation` | array  | PRM-423 | بله    |
| `evaluation_summary`  | object | PRM-423 | بله    |

---

## 6. Outputs

| خروجی                | نوع    | توضیح                    |
| -------------------- | ------ | ------------------------ |
| `correlation_result` | object | نتایج همبستگی میان منابع |
| `agreements`         | array  | نقاط توافق               |
| `contradictions`     | array  | نقاط تضاد                |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "PRM-423-output",
        "scope": ["evaluated-evidence"],
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

| منبع              | دامنه      | کاربرد  |
| ----------------- | ---------- | ------- |
| شواهد ارزیابی‌شده | تمام شواهد | همبستگی |

---

## 9. Prompt Structure

PRM-424 پنجمین گام زنجیره KNW-RSR. شواهد را همبستگی می‌دهد.

```
evidence_evaluation + evaluation_summary → PRM-424 → correlation_result → PRM-425
```

---

## 10. Variable Definitions

| متغیر                 | نوع    | اجباری | توضیح                        |
| --------------------- | ------ | ------ | ---------------------------- |
| `evidence_evaluation` | VAR-03 | بله    | شواهد ارزیابی‌شده از PRM-423 |
| `evaluation_summary`  | VAR-03 | بله    | خلاصه ارزیابی از PRM-423     |

---

## 11. Execution Constraints

| ID     | محدودیت                         |
| ------ | ------------------------------- |
| CST-01 | توافق‌ها با شواهد پشتیبانی شوند |
| CST-02 | تضادها بی‌طرفانه گزارش شوند     |

---

## 12. Validation Rules

| ID     | قاعده                        | سطح    | نقض   |
| ------ | ---------------------------- | ------ | ----- |
| VAL-01 | توافق‌ها به شواهد ارجاع دهند | معماری | خطا   |
| VAL-02 | تضادها مستند شده‌اند         | معماری | هشدار |

---

## 13. Failure Conditions

| شرط                     | اقدام                        |
| ----------------------- | ---------------------------- |
| شواهد کافی برای همبستگی | بازگشت warning + گزارش موجود |

---

## 14. Quality Gates

| گیت   | مکان              | معیار        | مسئول            |
| ----- | ----------------- | ------------ | ---------------- |
| QG-01 | Draft → Review    | هویت کامل    | خودکار           |
| QG-02 | Review → Approved | همبستگی کامل | Research Analyst |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                            | توسط        |
| ----------- | ---------- | -------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — همبستگی میان منابع | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-424",
  "name": "Cross-Source Correlation",
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
  "sources": [{ "type": "CTX-02", "source": "PRM-423-output", "required": true }],
  "max_tokens": 4000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "evidence_evaluation", "type": "VAR-03", "required": true },
    { "id": "evaluation_summary", "type": "VAR-03", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["evidence_evaluation", "evaluation_summary"],
    "optional": []
  },
  "output": {
    "required": ["correlation_result", "agreements", "contradictions"],
    "optional": []
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Agreements reference evidence", "severity": "error" },
    { "id": "VAL-02", "description": "Contradictions are documented", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-013", "AI-010"],
  "dependencies": ["PRM-423"],
  "documentation_refs": []
}
```
