# Research Consistency Validation — اعتبارسنجی سازگاری پژوهش

> **شناسه:** PRM-426
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Research Validator
> **وابستگی:** PRM-425
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                           |
| ------------------ | ------------------------------- |
| **id**             | PRM-426                         |
| **name_fa**        | اعتبارسنجی سازگاری پژوهش        |
| **name_en**        | Research Consistency Validation |
| **family**         | FAM-KNW                         |
| **subfamily**      | KNW-RSR                         |
| **type**           | PT-06                           |
| **complexity**     | C-2                             |
| **authority**      | A-3                             |
| **owner**          | Research Validator              |
| **version**        | 1.0.0-draft                     |
| **status**         | draft                           |
| **security_level** | SL-02                           |

---

## 2. Purpose

PRM-426 هفتمین گام زنجیره KNW-RSR. سازگاری داخلی بینش‌های تولیدشده با سؤالات اولیه، شواهد و اهداف پژوهش را اعتبارسنجی می‌کند.

### اصول اعتبارسنجی سازگاری

| ID    | اصل                                  |
| ----- | ------------------------------------ |
| CV-01 | بینش‌ها با سؤالات پژوهش سازگار باشند |
| CV-02 | هیچ تضاد داخلی در بینش‌ها نباشد      |

---

## 3. Scope

### Inside Scope

| حوزه                         | توضیح      |
| ---------------------------- | ---------- |
| بررسی سازگاری بینش با سؤالات | تطابق پاسخ |
| تشخیص تضاد بین بینش‌ها       | ناسازگاری  |

### Outside Scope

| حوزه          | دلیل         |
| ------------- | ------------ |
| ارزیابی کیفیت | حوزه PRM-427 |
| مونتاژ گزارش  | حوزه PRM-428 |

---

## 4. Consumers

| مصرف‌کننده        | نقش                | نوع مصرف |
| ----------------- | ------------------ | -------- |
| AI-013 (Research) | اعتبارسنجی سازگاری | Chain    |
| AI-004 (Review)   | اعتبارسنجی         | Quality  |

---

## 5. Inputs

| ورودی                | نوع    | منبع    | اجباری |
| -------------------- | ------ | ------- | ------ |
| `insights`           | array  | PRM-425 | بله    |
| `research_questions` | array  | PRM-420 | بله    |
| `research_plan`      | object | PRM-420 | بله    |

---

## 6. Outputs

| خروجی                | نوع    | توضیح                       |
| -------------------- | ------ | --------------------------- |
| `consistency_report` | object | گزارش سازگاری               |
| `consistency_issues` | array  | ناسازگاری‌ها                |
| `consistency_status` | string | وضعیت (pass, warning, fail) |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "PRM-425-output",
        "scope": ["insights"],
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

| منبع    | دامنه       | کاربرد             |
| ------- | ----------- | ------------------ |
| بینش‌ها | همه بینش‌ها | اعتبارسنجی سازگاری |

---

## 9. Prompt Structure

PRM-426 هفتمین گام زنجیره KNW-RSR. سازگاری را بررسی می‌کند.

```
insights + research_questions + research_plan → PRM-426 → consistency_report → PRM-427
```

---

## 10. Variable Definitions

| متغیر                | نوع    | اجباری | توضیح             |
| -------------------- | ------ | ------ | ----------------- |
| `insights`           | VAR-03 | بله    | بینش‌های تولیدشده |
| `research_questions` | VAR-03 | بله    | سؤالات پژوهش      |
| `research_plan`      | VAR-06 | بله    | برنامه پژوهش      |

---

## 11. Execution Constraints

| ID     | محدودیت                            |
| ------ | ---------------------------------- |
| CST-01 | هر بینش حداقل با یک سؤال مرتبط شود |
| CST-02 | ناسازگاری‌ها مستند شوند            |

---

## 12. Validation Rules

| ID     | قاعده                          | سطح    | نقض   |
| ------ | ------------------------------ | ------ | ----- |
| VAL-01 | بینش‌ها با سؤالات مطابقت دارند | معماری | خطا   |
| VAL-02 | ناسازگاری داخلی وجود ندارد     | معماری | هشدار |

---

## 13. Failure Conditions

| شرط              | اقدام                             |
| ---------------- | --------------------------------- |
| ناسازگاری بحرانی | بازگشت error + ارجاع برای بازبینی |

---

## 14. Quality Gates

| گیت   | مکان              | معیار         | مسئول              |
| ----- | ----------------- | ------------- | ------------------ |
| QG-01 | Draft → Review    | هویت کامل     | خودکار             |
| QG-02 | Review → Approved | سازگاری تأیید | Research Validator |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                                  | توسط        |
| ----------- | ---------- | -------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — اعتبارسنجی سازگاری پژوهش | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-426",
  "name": "Research Consistency Validation",
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
  "sources": [{ "type": "CTX-02", "source": "PRM-425-output", "required": true }],
  "max_tokens": 3000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "insights", "type": "VAR-03", "required": true },
    { "id": "research_questions", "type": "VAR-03", "required": true },
    { "id": "research_plan", "type": "VAR-06", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["insights", "research_questions", "research_plan"],
    "optional": []
  },
  "output": {
    "required": ["consistency_report", "consistency_status"],
    "optional": ["consistency_issues"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    {
      "id": "VAL-01",
      "description": "Insights align with research questions",
      "severity": "error"
    },
    { "id": "VAL-02", "description": "No internal contradictions", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-013", "AI-004"],
  "dependencies": ["PRM-425"],
  "documentation_refs": []
}
```
