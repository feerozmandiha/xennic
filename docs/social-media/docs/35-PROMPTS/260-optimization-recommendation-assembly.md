# Optimization Recommendation Assembly — مونتاژ توصیه‌های بهینه‌سازی

> **شناسه:** PRM-435
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Improvement Lead
> **وابستگی:** PRM-434
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                                |
| ------------------ | ------------------------------------ |
| **id**             | PRM-435                              |
| **name_fa**        | مونتاژ توصیه‌های بهینه‌سازی          |
| **name_en**        | Optimization Recommendation Assembly |
| **family**         | FAM-KNW                              |
| **subfamily**      | KNW-LRN                              |
| **type**           | PT-07                                |
| **complexity**     | C-3                                  |
| **authority**      | A-3                                  |
| **owner**          | Improvement Lead                     |
| **version**        | 1.0.0-draft                          |
| **status**         | draft                                |
| **security_level** | SL-02                                |

---

## 2. Purpose

PRM-435 ششمین گام زنجیره KNW-LRN. بر اساس برنامه تکامل دانش PRM-434، بسته توصیه‌های بهینه‌سازی عملیاتی و استراتژیک را مونتاژ می‌کند.

### اصول توصیه

| ID    | اصل                                            |
| ----- | ---------------------------------------------- |
| OR-01 | هر توصیه به شکاف دانش یا فرصت بهبود مرتبط باشد |
| OR-02 | توصیه‌ها اولویت‌بندی و قابل اقدام باشند        |

---

## 3. Scope

### Inside Scope

| حوزه                    | توضیح               |
| ----------------------- | ------------------- |
| مونتاژ توصیه‌ها         | عملیاتی و استراتژیک |
| اولویت‌بندی و دسته‌بندی | تأثیر، فوریت        |

### Outside Scope

| حوزه               | دلیل         |
| ------------------ | ------------ |
| برنامه تکامل دانش  | حوزه PRM-434 |
| اعتبارسنجی سازگاری | حوزه PRM-436 |

---

## 4. Consumers

| مصرف‌کننده           | نقش                   | نوع مصرف  |
| -------------------- | --------------------- | --------- |
| AI-012 (Improvement) | مونتاژ توصیه‌ها       | Chain     |
| AI-001 (Strategy)    | مصرف برای استراتژی    | Secondary |
| AI-002 (Planning)    | مصرف برای برنامه‌ریزی | Secondary |

---

## 5. Inputs

| ورودی                       | نوع    | منبع    | اجباری |
| --------------------------- | ------ | ------- | ------ |
| `evolution_plan`            | object | PRM-434 | بله    |
| `improvement_opportunities` | array  | PRM-431 | بله    |
| `learning_insights`         | array  | PRM-433 | بله    |

---

## 6. Outputs

| خروجی                       | نوع    | توضیح                     |
| --------------------------- | ------ | ------------------------- |
| `recommendation_package`    | object | بسته توصیه‌های بهینه‌سازی |
| `recommendation_priorities` | array  | اولویت‌بندی               |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "PRM-434-output",
        "scope": ["evolution"],
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

| منبع         | دامنه       | کاربرد          |
| ------------ | ----------- | --------------- |
| برنامه تکامل | تمام مسیرها | مونتاژ توصیه‌ها |

---

## 9. Prompt Structure

PRM-435 ششمین گام زنجیره KNW-LRN. توصیه‌های بهینه‌سازی را مونتاژ می‌کند.

```
evolution_plan + improvement_opportunities + learning_insights → PRM-435 → recommendation_package → PRM-436
```

---

## 10. Variable Definitions

| متغیر                       | نوع    | اجباری | توضیح             |
| --------------------------- | ------ | ------ | ----------------- |
| `evolution_plan`            | VAR-06 | بله    | برنامه تکامل دانش |
| `improvement_opportunities` | VAR-03 | بله    | فرصت‌های بهبود    |
| `learning_insights`         | VAR-03 | بله    | بینش‌های یادگیری  |

---

## 11. Execution Constraints

| ID     | محدودیت                             |
| ------ | ----------------------------------- |
| CST-01 | توصیه‌ها به فرصت یا شکاف مرتبط شوند |
| CST-02 | اولویت‌بندی مستند باشد              |

---

## 12. Validation Rules

| ID     | قاعده                             | سطح    | نقض   |
| ------ | --------------------------------- | ------ | ----- |
| VAL-01 | توصیه‌ها به فرصت‌ها مرتبط شده‌اند | معماری | خطا   |
| VAL-02 | اولویت‌بندی موجود است             | معماری | هشدار |

---

## 13. Failure Conditions

| شرط                       | اقدام                                |
| ------------------------- | ------------------------------------ |
| داده کافی برای توصیه نیست | بازگشت warning + پیشنهاد تحلیل بیشتر |

---

## 14. Quality Gates

| گیت   | مکان              | معیار           | مسئول            |
| ----- | ----------------- | --------------- | ---------------- |
| QG-01 | Draft → Review    | هویت کامل       | خودکار           |
| QG-02 | Review → Approved | بسته توصیه کامل | Improvement Lead |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                                     | توسط        |
| ----------- | ---------- | ----------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — مونتاژ توصیه‌های بهینه‌سازی | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-435",
  "name": "Optimization Recommendation Assembly",
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
  "sources": [{ "type": "CTX-02", "source": "PRM-434-output", "required": true }],
  "max_tokens": 4000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "evolution_plan", "type": "VAR-06", "required": true },
    { "id": "improvement_opportunities", "type": "VAR-03", "required": true },
    { "id": "learning_insights", "type": "VAR-03", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["evolution_plan", "improvement_opportunities", "learning_insights"],
    "optional": []
  },
  "output": {
    "required": ["recommendation_package", "recommendation_priorities"],
    "optional": []
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    {
      "id": "VAL-01",
      "description": "Recommendations linked to opportunities",
      "severity": "error"
    },
    { "id": "VAL-02", "description": "Prioritization present", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-012", "AI-001", "AI-002"],
  "dependencies": ["PRM-434"],
  "documentation_refs": []
}
```
