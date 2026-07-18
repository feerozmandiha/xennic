# Improvement Package Assembly — مونتاژ بسته بهبود

> **شناسه:** PRM-438
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Improvement Lead
> **وابستگی:** PRM-437
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                        |
| ------------------ | ---------------------------- |
| **id**             | PRM-438                      |
| **name_fa**        | مونتاژ بسته بهبود            |
| **name_en**        | Improvement Package Assembly |
| **family**         | FAM-KNW                      |
| **subfamily**      | KNW-LRN                      |
| **type**           | PT-04                        |
| **complexity**     | C-3                          |
| **authority**      | A-3                          |
| **owner**          | Improvement Lead             |
| **version**        | 1.0.0-draft                  |
| **status**         | draft                        |
| **security_level** | SL-02                        |

---

## 2. Purpose

PRM-438 نهمین گام زنجیره KNW-LRN. تمام خروجی‌های زنجیره یادگیری را در یک بسته بهبود سازمانی یکپارچه مونتاژ می‌کند.

### اصول مونتاژ

| ID    | اصل                                |
| ----- | ---------------------------------- |
| PA-01 | بسته شامل همه گام‌های زنجیره باشد  |
| PA-02 | بسته بهبود قابل ارائه و اقدام باشد |

---

## 3. Scope

### Inside Scope

| حوزه                  | توضیح                    |
| --------------------- | ------------------------ |
| یکپارچه‌سازی خروجی‌ها | PRM-430 تا PRM-437       |
| ساختاردهی بسته بهبود  | درس‌ها، علت‌ها، توصیه‌ها |

### Outside Scope

| حوزه             | دلیل         |
| ---------------- | ------------ |
| ارزیابی یادگیری  | حوزه PRM-437 |
| اعتبارسنجی تکمیل | حوزه PRM-439 |

---

## 4. Consumers

| مصرف‌کننده           | نقش                | نوع مصرف  |
| -------------------- | ------------------ | --------- |
| AI-012 (Improvement) | مونتاژ بسته بهبود  | Chain     |
| AI-010 (Analytics)   | مصرف برای تحلیل    | Secondary |
| AI-001 (Strategy)    | مصرف برای استراتژی | Secondary |

---

## 5. Inputs

| ورودی                       | نوع    | منبع    | اجباری |
| --------------------------- | ------ | ------- | ------ |
| `lessons_learned`           | array  | PRM-430 | بله    |
| `improvement_opportunities` | array  | PRM-431 | بله    |
| `root_causes`               | array  | PRM-432 | بله    |
| `learning_synthesis`        | object | PRM-433 | بله    |
| `evolution_plan`            | object | PRM-434 | بله    |
| `recommendation_package`    | object | PRM-435 | بله    |
| `learning_assessment`       | object | PRM-437 | بله    |

---

## 6. Outputs

| خروجی                 | نوع    | توضیح           |
| --------------------- | ------ | --------------- |
| `improvement_package` | object | بسته بهبود کامل |
| `executive_summary`   | object | خلاصه اجرایی    |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "PRM-430-through-437",
        "scope": ["all-outputs"],
        "injection": "prepend",
        "required": true
      }
    ],
    "max_tokens": 5000,
    "priority": "high"
  }
}
```

---

## 8. Knowledge Requirements

| منبع                  | دامنه       | کاربرد      |
| --------------------- | ----------- | ----------- |
| خروجی‌های PRM-430–437 | تمام گام‌ها | مونتاژ بسته |

---

## 9. Prompt Structure

PRM-438 نهمین گام زنجیره KNW-LRN. بسته بهبود را مونتاژ می‌کند.

```
lessons_learned + improvement_opportunities + root_causes + learning_synthesis + evolution_plan + recommendation_package + learning_assessment → PRM-438 → improvement_package → PRM-439
```

---

## 10. Variable Definitions

| متغیر                       | نوع    | اجباری | توضیح           |
| --------------------------- | ------ | ------ | --------------- |
| `lessons_learned`           | VAR-03 | بله    | درس‌آموخته‌ها   |
| `improvement_opportunities` | VAR-03 | بله    | فرصت‌های بهبود  |
| `root_causes`               | VAR-03 | بله    | علت‌های ریشه‌ای |
| `learning_synthesis`        | VAR-06 | بله    | ترکیب یادگیری   |
| `evolution_plan`            | VAR-06 | بله    | برنامه تکامل    |
| `recommendation_package`    | VAR-06 | بله    | بسته توصیه‌ها   |
| `learning_assessment`       | VAR-06 | بله    | ارزیابی یادگیری |

---

## 11. Execution Constraints

| ID     | محدودیت                             |
| ------ | ----------------------------------- |
| CST-01 | بسته همه گام‌های زنجیره را پوشش دهد |
| CST-02 | خلاصه اجرایی مستقل باشد             |

---

## 12. Validation Rules

| ID     | قاعده                             | سطح    | نقض |
| ------ | --------------------------------- | ------ | --- |
| VAL-01 | تمام گام‌های زنجیره در بسته هستند | معماری | خطا |
| VAL-02 | خلاصه اجرایی موجود است            | معماری | خطا |

---

## 13. Failure Conditions

| شرط       | اقدام                             |
| --------- | --------------------------------- |
| گامی ناقص | بازگشت error + مشخص کردن گام ناقص |

---

## 14. Quality Gates

| گیت   | مکان              | معیار     | مسئول            |
| ----- | ----------------- | --------- | ---------------- |
| QG-01 | Draft → Review    | هویت کامل | خودکار           |
| QG-02 | Review → Approved | بسته کامل | Improvement Lead |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                           | توسط        |
| ----------- | ---------- | ------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — مونتاژ بسته بهبود | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-438",
  "name": "Improvement Package Assembly",
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
  "sources": [{ "type": "CTX-02", "source": "PRM-430-through-437", "required": true }],
  "max_tokens": 5000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "lessons_learned", "type": "VAR-03", "required": true },
    { "id": "improvement_opportunities", "type": "VAR-03", "required": true },
    { "id": "root_causes", "type": "VAR-03", "required": true },
    { "id": "learning_synthesis", "type": "VAR-06", "required": true },
    { "id": "evolution_plan", "type": "VAR-06", "required": true },
    { "id": "recommendation_package", "type": "VAR-06", "required": true },
    { "id": "learning_assessment", "type": "VAR-06", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": [
      "lessons_learned",
      "improvement_opportunities",
      "root_causes",
      "learning_synthesis",
      "evolution_plan",
      "recommendation_package",
      "learning_assessment"
    ],
    "optional": []
  },
  "output": {
    "required": ["improvement_package", "executive_summary"],
    "optional": []
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "All chain steps in package", "severity": "error" },
    { "id": "VAL-02", "description": "Executive summary present", "severity": "error" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-012", "AI-010", "AI-001"],
  "dependencies": ["PRM-430", "PRM-431", "PRM-432", "PRM-433", "PRM-434", "PRM-435", "PRM-437"],
  "documentation_refs": []
}
```
