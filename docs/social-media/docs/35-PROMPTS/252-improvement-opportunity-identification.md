# Improvement Opportunity Identification — شناسایی فرصت بهبود

> **شناسه:** PRM-431
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Improvement Lead
> **وابستگی:** PRM-430
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                                  |
| ------------------ | -------------------------------------- |
| **id**             | PRM-431                                |
| **name_fa**        | شناسایی فرصت بهبود                     |
| **name_en**        | Improvement Opportunity Identification |
| **family**         | FAM-KNW                                |
| **subfamily**      | KNW-LRN                                |
| **type**           | PT-07                                  |
| **complexity**     | C-3                                    |
| **authority**      | A-3                                    |
| **owner**          | Improvement Lead                       |
| **version**        | 1.0.0-draft                            |
| **status**         | draft                                  |
| **security_level** | SL-02                                  |

---

## 2. Purpose

PRM-431 دومین گام زنجیره KNW-LRN. از درس‌آموخته‌های PRM-430 فرصت‌های بهبود مشخص و اولویت‌بندی‌شده استخراج می‌کند.

### اصول شناسایی فرصت

| ID    | اصل                                    |
| ----- | -------------------------------------- |
| IO-01 | هر فرصت به درس‌آموخته مشخصی مرتبط باشد |
| IO-02 | فرصت‌ها اولویت‌بندی شوند               |

---

## 3. Scope

### Inside Scope

| حوزه                          | توضیح               |
| ----------------------------- | ------------------- |
| استخراج فرصت از درس‌آموخته‌ها | تحلیل درس‌آموخته‌ها |
| اولویت‌بندی فرصت‌ها           | تأثیر، فوریت، هزینه |

### Outside Scope

| حوزه              | دلیل         |
| ----------------- | ------------ |
| تحلیل علت ریشه‌ای | حوزه PRM-432 |
| ترکیب یادگیری     | حوزه PRM-433 |

---

## 4. Consumers

| مصرف‌کننده           | نقش             | نوع مصرف  |
| -------------------- | --------------- | --------- |
| AI-012 (Improvement) | شناسایی فرصت‌ها | Chain     |
| AI-010 (Analytics)   | مصرف برای تحلیل | Secondary |

---

## 5. Inputs

| ورودی             | نوع    | منبع    | اجباری |
| ----------------- | ------ | ------- | ------ |
| `lessons_learned` | array  | PRM-430 | بله    |
| `kpi_data`        | object | AI-010  | بله    |

---

## 6. Outputs

| خروجی                       | نوع   | توضیح               |
| --------------------------- | ----- | ------------------- |
| `improvement_opportunities` | array | فرصت‌های بهبود      |
| `opportunity_priorities`    | array | اولویت‌بندی فرصت‌ها |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "PRM-430-output",
        "scope": ["lessons"],
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

| منبع          | دامنه              | کاربرد       |
| ------------- | ------------------ | ------------ |
| درس‌آموخته‌ها | تمام درس‌آموخته‌ها | شناسایی فرصت |

---

## 9. Prompt Structure

PRM-431 دومین گام زنجیره KNW-LRN. فرصت‌های بهبود را شناسایی می‌کند.

```
lessons_learned + kpi_data → PRM-431 → improvement_opportunities → PRM-432
```

---

## 10. Variable Definitions

| متغیر             | نوع    | اجباری | توضیح                    |
| ----------------- | ------ | ------ | ------------------------ |
| `lessons_learned` | VAR-03 | بله    | درس‌آموخته‌ها از PRM-430 |
| `kpi_data`        | VAR-06 | بله    | داده‌های KPI             |

---

## 11. Execution Constraints

| ID     | محدودیت                          |
| ------ | -------------------------------- |
| CST-01 | فرصت‌ها به درس‌آموخته ارجاع دهند |
| CST-02 | اولویت‌بندی مستند باشد           |

---

## 12. Validation Rules

| ID     | قاعده                               | سطح    | نقض   |
| ------ | ----------------------------------- | ------ | ----- |
| VAL-01 | فرصت‌ها به درس‌آموخته مرتبط شده‌اند | معماری | خطا   |
| VAL-02 | اولویت‌بندی شده‌اند                 | معماری | هشدار |

---

## 13. Failure Conditions

| شرط            | اقدام                                |
| -------------- | ------------------------------------ |
| فرصتی یافت نشد | بازگشت warning + پیشنهاد تحقیق بیشتر |

---

## 14. Quality Gates

| گیت   | مکان              | معیار                | مسئول            |
| ----- | ----------------- | -------------------- | ---------------- |
| QG-01 | Draft → Review    | هویت کامل            | خودکار           |
| QG-02 | Review → Approved | فرصت‌ها شناسایی شدند | Improvement Lead |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                            | توسط        |
| ----------- | ---------- | -------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — شناسایی فرصت بهبود | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-431",
  "name": "Improvement Opportunity Identification",
  "family": "FAM-KNW",
  "subfamily": "KNW-LRN",
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
  "sources": [{ "type": "CTX-02", "source": "PRM-430-output", "required": true }],
  "max_tokens": 3500,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "lessons_learned", "type": "VAR-03", "required": true },
    { "id": "kpi_data", "type": "VAR-06", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["lessons_learned", "kpi_data"],
    "optional": []
  },
  "output": {
    "required": ["improvement_opportunities", "opportunity_priorities"],
    "optional": []
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Opportunities linked to lessons", "severity": "error" },
    { "id": "VAL-02", "description": "Opportunities are prioritized", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-012", "AI-010"],
  "dependencies": ["PRM-430"],
  "documentation_refs": []
}
```
