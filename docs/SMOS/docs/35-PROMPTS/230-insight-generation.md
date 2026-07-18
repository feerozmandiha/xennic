# Insight Generation — تولید بینش

> **شناسه:** PRM-425
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Research Lead
> **وابستگی:** PRM-424
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار              |
| ------------------ | ------------------ |
| **id**             | PRM-425            |
| **name_fa**        | تولید بینش         |
| **name_en**        | Insight Generation |
| **family**         | FAM-KNW            |
| **subfamily**      | KNW-RSR            |
| **type**           | PT-07              |
| **complexity**     | C-3                |
| **authority**      | A-3                |
| **owner**          | Research Lead      |
| **version**        | 1.0.0-draft        |
| **status**         | draft              |
| **security_level** | SL-02              |

---

## 2. Purpose

PRM-425 ششمین گام زنجیره KNW-RSR. از نتایج همبستگی PRM-424 بینش‌های قابل اقدام و نتیجه‌گیری‌های پژوهشی تولید می‌کند.

### اصول تولید بینش

| ID    | اصل                               |
| ----- | --------------------------------- |
| IG-01 | هر بینش از شواهد پشتیبانی شود     |
| IG-02 | بینش‌ها به سؤالات پژوهش پاسخ دهند |

---

## 3. Scope

### Inside Scope

| حوزه                       | توضیح         |
| -------------------------- | ------------- |
| استخراج بینش از همبستگی‌ها | نتیجه‌گیری    |
| اولویت‌بندی بینش‌ها        | اهمیت و قطعیت |

### Outside Scope

| حوزه         | دلیل         |
| ------------ | ------------ |
| همبستگی      | حوزه PRM-424 |
| مونتاژ گزارش | حوزه PRM-428 |

---

## 4. Consumers

| مصرف‌کننده           | نقش                     | نوع مصرف  |
| -------------------- | ----------------------- | --------- |
| AI-013 (Research)    | تولید بینش              | Chain     |
| AI-001 (Strategy)    | مصرف بینش برای استراتژی | Secondary |
| AI-002 (Planning)    | مصرف برای برنامه‌ریزی   | Secondary |
| AI-012 (Improvement) | مصرف برای بهبود         | Secondary |

---

## 5. Inputs

| ورودی                | نوع    | منبع    | اجباری |
| -------------------- | ------ | ------- | ------ |
| `correlation_result` | object | PRM-424 | بله    |
| `research_questions` | array  | PRM-420 | بله    |

---

## 6. Outputs

| خروجی             | نوع   | توضیح                |
| ----------------- | ----- | -------------------- |
| `insights`        | array | بینش‌های تولیدشده    |
| `recommendations` | array | توصیه‌های قابل اقدام |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "PRM-424-output",
        "scope": ["correlation"],
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

| منبع          | دامنه        | کاربرد     |
| ------------- | ------------ | ---------- |
| نتایج همبستگی | شواهد همبسته | تولید بینش |

---

## 9. Prompt Structure

PRM-425 ششمین گام زنجیره KNW-RSR. بینش‌های قابل اقدام تولید می‌کند.

```
correlation_result + research_questions → PRM-425 → insights → PRM-426
```

---

## 10. Variable Definitions

| متغیر                | نوع    | اجباری | توضیح                    |
| -------------------- | ------ | ------ | ------------------------ |
| `correlation_result` | VAR-06 | بله    | نتیجه همبستگی از PRM-424 |
| `research_questions` | VAR-03 | بله    | سؤالات پژوهش از PRM-420  |

---

## 11. Execution Constraints

| ID     | محدودیت                          |
| ------ | -------------------------------- |
| CST-01 | بینش‌ها به شواهد ارجاع دهند      |
| CST-02 | توصیه‌ها مشخص و قابل اقدام باشند |

---

## 12. Validation Rules

| ID     | قاعده                      | سطح    | نقض   |
| ------ | -------------------------- | ------ | ----- |
| VAL-01 | هر بینش پشتوانه شواهد دارد | معماری | خطا   |
| VAL-02 | توصیه‌ها قابل اقدام هستند  | معماری | هشدار |

---

## 13. Failure Conditions

| شرط                  | اقدام                                 |
| -------------------- | ------------------------------------- |
| شواهد کافی برای بینش | بازگشت warning + پیشنهاد پژوهش تکمیلی |

---

## 14. Quality Gates

| گیت   | مکان              | معیار         | مسئول         |
| ----- | ----------------- | ------------- | ------------- |
| QG-01 | Draft → Review    | هویت کامل     | خودکار        |
| QG-02 | Review → Approved | بینش‌های کامل | Research Lead |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                    | توسط        |
| ----------- | ---------- | ------------------------ | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — تولید بینش | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-425",
  "name": "Insight Generation",
  "family": "FAM-KNW",
  "subfamily": "KNW-RSR",
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
  "sources": [{ "type": "CTX-02", "source": "PRM-424-output", "required": true }],
  "max_tokens": 4000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "correlation_result", "type": "VAR-06", "required": true },
    { "id": "research_questions", "type": "VAR-03", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["correlation_result", "research_questions"],
    "optional": []
  },
  "output": {
    "required": ["insights", "recommendations"],
    "optional": []
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Insights are evidence-backed", "severity": "error" },
    { "id": "VAL-02", "description": "Recommendations are actionable", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-013", "AI-001", "AI-002", "AI-012"],
  "dependencies": ["PRM-424"],
  "documentation_refs": []
}
```
