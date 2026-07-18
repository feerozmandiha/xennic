# Lessons Learned Capture — ثبت درس‌آموخته‌ها

> **شناسه:** PRM-430
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Improvement Lead
> **وابستگی:** PRM-401, PRM-402, PRM-420
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                   |
| ------------------ | ----------------------- |
| **id**             | PRM-430                 |
| **name_fa**        | ثبت درس‌آموخته‌ها       |
| **name_en**        | Lessons Learned Capture |
| **family**         | FAM-KNW                 |
| **subfamily**      | KNW-LRN                 |
| **type**           | PT-04                   |
| **complexity**     | C-2                     |
| **authority**      | A-3                     |
| **owner**          | Improvement Lead        |
| **version**        | 1.0.0-draft             |
| **status**         | draft                   |
| **security_level** | SL-02                   |

---

## 2. Purpose

PRM-430 نخستین گام زنجیره KNW-LRN. درس‌آموخته‌های سازمانی را از خروجی‌های پیشین (پژوهش، تحلیل، بازبینی) استخراج و ساختاریافته ثبت می‌کند تا مبنای یادگیری سازمانی شود.

### اصول ثبت درس‌آموخته

| ID    | اصل                                    |
| ----- | -------------------------------------- |
| LC-01 | هر درس‌آموخته منبع مشخصی داشته باشد    |
| LC-02 | درس‌آموخته‌ها قابل اقدام و مستند باشند |

---

## 3. Scope

### Inside Scope

| حوزه                           | توضیح                 |
| ------------------------------ | --------------------- |
| استخراج درس‌آموخته از خروجی‌ها | پژوهش، تحلیل، بازبینی |
| ساختاریابی درس‌آموخته          | دسته‌بندی و اولویت    |

### Outside Scope

| حوزه               | دلیل         |
| ------------------ | ------------ |
| شناسایی فرصت بهبود | حوزه PRM-431 |
| تحلیل علت ریشه‌ای  | حوزه PRM-432 |

---

## 4. Consumers

| مصرف‌کننده           | نقش                | نوع مصرف  |
| -------------------- | ------------------ | --------- |
| AI-012 (Improvement) | ثبت درس‌آموخته‌ها  | Chain     |
| AI-011 (Knowledge)   | مصرف درس‌آموخته‌ها | Secondary |

---

## 5. Inputs

| ورودی              | نوع    | منبع              | اجباری |
| ------------------ | ------ | ----------------- | ------ |
| `performance_data` | object | AI-010 (Reports)  | بله    |
| `research_results` | object | AI-013 (Research) | بله    |
| `review_findings`  | object | AI-004 (Review)   | خیر    |

---

## 6. Outputs

| خروجی             | نوع    | توضیح                  |
| ----------------- | ------ | ---------------------- |
| `lessons_learned` | array  | درس‌آموخته‌های ثبت‌شده |
| `lessons_summary` | object | خلاصه و دسته‌بندی      |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "KNW-*",
        "scope": ["existing-knowledge"],
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

| منبع        | دامنه                | کاربرد           |
| ----------- | -------------------- | ---------------- |
| پایگاه دانش | درس‌آموخته‌های پیشین | جلوگیری از تکرار |

---

## 9. Prompt Structure

PRM-430 نخستین گام زنجیره KNW-LRN. درس‌آموخته‌ها را ثبت می‌کند.

```
performance_data + research_results + review_findings → PRM-430 → lessons_learned → PRM-431
```

---

## 10. Variable Definitions

| متغیر              | نوع    | اجباری | توضیح             |
| ------------------ | ------ | ------ | ----------------- |
| `performance_data` | VAR-06 | بله    | داده‌های عملکرد   |
| `research_results` | VAR-06 | بله    | نتایج پژوهش       |
| `review_findings`  | VAR-06 | خیر    | یافته‌های بازبینی |

---

## 11. Execution Constraints

| ID     | محدودیت                         |
| ------ | ------------------------------- |
| CST-01 | هر درس‌آموخته به منبع ارجاع دهد |
| CST-02 | درس‌آموخته‌ها دسته‌بندی شوند    |

---

## 12. Validation Rules

| ID     | قاعده                           | سطح    | نقض   |
| ------ | ------------------------------- | ------ | ----- |
| VAL-01 | درس‌آموخته‌ها منبع دارند        | معماری | خطا   |
| VAL-02 | درس‌آموخته‌ها دسته‌بندی شده‌اند | معماری | هشدار |

---

## 13. Failure Conditions

| شرط                                    | اقدام                                |
| -------------------------------------- | ------------------------------------ |
| داده کافی برای استخراج درس‌آموخته نیست | بازگشت warning + پیشنهاد اجرای پژوهش |

---

## 14. Quality Gates

| گیت   | مکان              | معیار                  | مسئول            |
| ----- | ----------------- | ---------------------- | ---------------- |
| QG-01 | Draft → Review    | هویت کامل              | خودکار           |
| QG-02 | Review → Approved | درس‌آموخته‌ها ثبت شدند | Improvement Lead |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                           | توسط        |
| ----------- | ---------- | ------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — ثبت درس‌آموخته‌ها | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-430",
  "name": "Lessons Learned Capture",
  "family": "FAM-KNW",
  "subfamily": "KNW-LRN",
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
  "sources": [{ "type": "CTX-02", "source": "KNW-*", "required": true }],
  "max_tokens": 3500,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "performance_data", "type": "VAR-06", "required": true },
    { "id": "research_results", "type": "VAR-06", "required": true },
    { "id": "review_findings", "type": "VAR-06", "required": false }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["performance_data", "research_results"],
    "optional": ["review_findings"]
  },
  "output": {
    "required": ["lessons_learned", "lessons_summary"],
    "optional": []
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Lessons learned have source", "severity": "error" },
    { "id": "VAL-02", "description": "Lessons learned are categorized", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-012", "AI-011"],
  "dependencies": [],
  "documentation_refs": ["KNW-*"]
}
```
