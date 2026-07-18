# Research Quality Assessment — ارزیابی کیفیت پژوهش

> **شناسه:** PRM-427
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Research Validator
> **وابستگی:** PRM-426
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                       |
| ------------------ | --------------------------- |
| **id**             | PRM-427                     |
| **name_fa**        | ارزیابی کیفیت پژوهش         |
| **name_en**        | Research Quality Assessment |
| **family**         | FAM-KNW                     |
| **subfamily**      | KNW-RSR                     |
| **type**           | PT-06                       |
| **complexity**     | C-3                         |
| **authority**      | A-3                         |
| **owner**          | Research Validator          |
| **version**        | 1.0.0-draft                 |
| **status**         | draft                       |
| **security_level** | SL-02                       |

---

## 2. Purpose

PRM-427 هشتمین گام زنجیره KNW-RSR. کیفیت کلی پژوهش را بر اساس معیارهای اعتبار، دقت، شفافیت، تکامل‌پذیری و سودمندی ارزیابی می‌کند.

### اصول ارزیابی کیفیت

| ID    | اصل                               |
| ----- | --------------------------------- |
| QA-01 | کیفیت پژوهش قابل اندازه‌گیری باشد |
| QA-02 | معیارها عینی و قابل تکرار باشند   |

---

## 3. Scope

### Inside Scope

| حوزه                  | توضیح       |
| --------------------- | ----------- |
| ارزیابی کیفیت بینش‌ها | دقت، اعتبار |
| ارزیابی کیفیت شواهد   | صحت، شفافیت |

### Outside Scope

| حوزه         | دلیل         |
| ------------ | ------------ |
| سازگاری      | حوزه PRM-426 |
| مونتاژ گزارش | حوزه PRM-428 |

---

## 4. Consumers

| مصرف‌کننده        | نقش           | نوع مصرف |
| ----------------- | ------------- | -------- |
| AI-013 (Research) | ارزیابی کیفیت | Chain    |
| AI-004 (Review)   | اعتبارسنجی    | Quality  |

---

## 5. Inputs

| ورودی                 | نوع    | منبع    | اجباری |
| --------------------- | ------ | ------- | ------ |
| `consistency_report`  | object | PRM-426 | بله    |
| `insights`            | array  | PRM-425 | بله    |
| `evidence_evaluation` | array  | PRM-423 | بله    |

---

## 6. Outputs

| خروجی            | نوع    | توضیح               |
| ---------------- | ------ | ------------------- |
| `quality_report` | object | گزارش کیفیت پژوهش   |
| `quality_score`  | number | امتیاز کیفیت (۰–۱۰) |
| `quality_issues` | array  | مسائل کیفیت         |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "PRM-426-output",
        "scope": ["consistency"],
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

| منبع          | دامنه         | کاربرد        |
| ------------- | ------------- | ------------- |
| گزارش سازگاری | وضعیت سازگاری | ارزیابی کیفیت |

---

## 9. Prompt Structure

PRM-427 هشتمین گام زنجیره KNW-RSR. کیفیت پژوهش را ارزیابی می‌کند.

```
consistency_report + insights + evidence_evaluation → PRM-427 → quality_report → PRM-428
```

---

## 10. Variable Definitions

| متغیر                 | نوع    | اجباری | توضیح             |
| --------------------- | ------ | ------ | ----------------- |
| `consistency_report`  | VAR-06 | بله    | گزارش سازگاری     |
| `insights`            | VAR-03 | بله    | بینش‌های تولیدشده |
| `evidence_evaluation` | VAR-03 | بله    | شواهد ارزیابی‌شده |

---

## 11. Execution Constraints

| ID     | محدودیت                                |
| ------ | -------------------------------------- |
| CST-01 | امتیاز کیفیت مستند و شفاف باشد         |
| CST-02 | هر مسئله کیفیت یک منبع مشخص داشته باشد |

---

## 12. Validation Rules

| ID     | قاعده                            | سطح    | نقض   |
| ------ | -------------------------------- | ------ | ----- |
| VAL-01 | امتیاز کیفیت محاسبه شده است      | معماری | خطا   |
| VAL-02 | مسائل کیفیت به شواهد ارجاع دارند | معماری | هشدار |

---

## 13. Failure Conditions

| شرط                        | اقدام                          |
| -------------------------- | ------------------------------ |
| کیفیت زیر آستانه قابل قبول | بازگشت error + پیشنهاد بازبینی |

---

## 14. Quality Gates

| گیت   | مکان              | معیار       | مسئول              |
| ----- | ----------------- | ----------- | ------------------ |
| QG-01 | Draft → Review    | هویت کامل   | خودکار             |
| QG-02 | Review → Approved | کیفیت تأیید | Research Validator |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                             | توسط        |
| ----------- | ---------- | --------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — ارزیابی کیفیت پژوهش | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-427",
  "name": "Research Quality Assessment",
  "family": "FAM-KNW",
  "subfamily": "KNW-RSR",
  "type": "PT-06",
  "complexity": "C-3",
  "authority": "A-3",
  "version": "1.0.0-draft",
  "status": "draft"
}
```

### Block 2 — Context

```json
{
  "sources": [{ "type": "CTX-02", "source": "PRM-426-output", "required": true }],
  "max_tokens": 3500,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "consistency_report", "type": "VAR-06", "required": true },
    { "id": "insights", "type": "VAR-03", "required": true },
    { "id": "evidence_evaluation", "type": "VAR-03", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["consistency_report", "insights", "evidence_evaluation"],
    "optional": []
  },
  "output": {
    "required": ["quality_report", "quality_score"],
    "optional": ["quality_issues"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Quality score is calculated", "severity": "error" },
    { "id": "VAL-02", "description": "Quality issues reference evidence", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-013", "AI-004"],
  "dependencies": ["PRM-426"],
  "documentation_refs": []
}
```
