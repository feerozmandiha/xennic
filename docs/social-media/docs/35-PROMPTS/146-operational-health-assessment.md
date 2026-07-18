# Operational Health Assessment — ارزیابی سلامت عملیاتی

> **شناسه:** PRM-333
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Operations Lead
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-332](./144-incident-correlation-analysis.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                         |
| ------------------ | ----------------------------- |
| **id**             | PRM-333                       |
| **name_fa**        | ارزیابی سلامت عملیاتی         |
| **name_en**        | Operational Health Assessment |
| **family**         | FAM-OPS                       |
| **subfamily**      | OPS-MON                       |
| **type**           | PT-04                         |
| **complexity**     | C-2                           |
| **authority**      | A-2                           |
| **owner**          | Operations Lead               |
| **version**        | 1.0.0-draft                   |
| **status**         | draft                         |
| **security_level** | SL-02                         |

---

## 2. Purpose

PRM-333 سلامت کلی عملیات پلتفرم‌های اجتماعی را بر اساس رویدادهای همبسته و الگوهای شناسایی‌شده ارزیابی می‌کند. امتیاز سلامت و شاخص‌های کلیدی وضعیت را برای تصمیم‌گیری فراهم می‌کند.

### اصول ارزیابی

| ID    | اصل                                         |
| ----- | ------------------------------------------- |
| OH-01 | سلامت بر اساس معیارهای عینی اندازه‌گیری شود |
| OH-02 | امتیاز سلامت قابل مقایسه بین دوره‌ها باشد   |
| OH-03 | شاخص‌های سلامت قابل تفکیک باشند             |

---

## 3. Scope

### Inside Scope

| حوزه         | توضیح                      |
| ------------ | -------------------------- |
| امتیاز سلامت | محاسبه امتیاز کلی سلامت    |
| شاخص‌ها      | تعریف شاخص‌های کلیدی وضعیت |
| روند سلامت   | مقایسه با دوره‌های قبل     |

### Outside Scope

| حوزه         | دلیل         |
| ------------ | ------------ |
| تخریب سرویس  | حوزه PRM-334 |
| ریسک عملیاتی | حوزه PRM-335 |

---

## 4. Consumers

| مصرف‌کننده           | نقش                 | نوع مصرف |
| -------------------- | ------------------- | -------- |
| AI-010 (Analytics)   | ارزیابی سلامت       | Chain    |
| AI-012 (Improvement) | مصرف شاخص‌های سلامت | System   |

---

## 5. Inputs

| ورودی                  | نوع    | منبع    | اجباری |
| ---------------------- | ------ | ------- | ------ |
| `correlated_incidents` | array  | PRM-332 | بله    |
| `health_thresholds`    | object | AI-010  | خیر    |

---

## 6. Outputs

| خروجی                        | نوع     | توضیح                                   |
| ---------------------------- | ------- | --------------------------------------- |
| `health_score`               | number  | امتیاز سلامت کلی (۰–۱۰۰)                |
| `health_indicators`          | object  | شاخص‌های کلیدی وضعیت                    |
| `health_trend`               | string  | روند سلامت (improving/stable/declining) |
| `health_assessment_complete` | boolean | وضعیت تکمیل                             |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-332 Output",
        "scope": ["correlated-incidents", "pattern-insights"],
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

| منبع    | دامنه                    | کاربرد        |
| ------- | ------------------------ | ------------- |
| PLAT-\* | شاخص‌های سلامت استاندارد | تعریف شاخص‌ها |

---

## 9. Prompt Structure

PRM-333 چهارمین گام زنجیره OPS-MON. سلامت عملیاتی را از رویدادهای همبسته ارزیابی می‌کند.

```
PRM-332 → correlated_incidents → PRM-333 → health_score → PRM-334
```

---

## 10. Variable Definitions

| متغیر                  | نوع    | اجباری | توضیح                   | اعتبارسنجی         |
| ---------------------- | ------ | ------ | ----------------------- | ------------------ |
| `correlated_incidents` | VAR-06 | بله    | خوشه‌های رویداد همبسته  | —                  |
| `health_thresholds`    | VAR-05 | خیر    | آستانه‌های سلامت سفارشی | default: استاندارد |

---

## 11. Execution Constraints

| ID     | محدودیت                        |
| ------ | ------------------------------ |
| CST-01 | امتیاز سلامت بین ۰ تا ۱۰۰ باشد |
| CST-02 | حداقل ۳ شاخص کلیدی محاسبه شود  |

---

## 12. Validation Rules

| ID     | قاعده                      | سطح    | نقض     |
| ------ | -------------------------- | ------ | ------- |
| VAL-01 | health_score در بازه ۰–۱۰۰ | معماری | عدم ثبت |
| VAL-02 | ≥ ۳ شاخص کلیدی             | معماری | هشدار   |

---

## 13. Failure Conditions

| شرط                  | اقدام                            |
| -------------------- | -------------------------------- |
| health_score < ۳۰    | Escalation به Operations Lead    |
| شاخص‌های کافی نداریم | بازگشت با هشدار + شاخص‌های موجود |

---

## 14. Quality Gates

| گیت   | مکان              | معیار                     | مسئول           |
| ----- | ----------------- | ------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل, input معتبر    | خودکار          |
| QG-02 | Review → Approved | شاخص‌ها کامل              | Operations Lead |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-2) | Registry Keeper |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                               | توسط        |
| ----------- | ---------- | ----------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — ارزیابی سلامت عملیاتی | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-333",
  "name": "Operational Health Assessment",
  "family": "FAM-OPS",
  "subfamily": "OPS-MON",
  "type": "PT-04",
  "complexity": "C-2",
  "authority": "A-2",
  "version": "1.0.0-draft",
  "status": "draft"
}
```

### Block 2 — Context

```json
{
  "sources": [{ "type": "CTX-04", "source": "PRM-332", "required": true }],
  "max_tokens": 3000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "correlated_incidents", "type": "VAR-06", "required": true },
    { "id": "health_thresholds", "type": "VAR-05", "required": false }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["correlated_incidents"],
    "optional": ["health_thresholds"]
  },
  "output": {
    "required": ["health_score", "health_assessment_complete"],
    "optional": ["health_indicators", "health_trend"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Health score in range 0-100", "severity": "error" },
    { "id": "VAL-02", "description": "At least 3 key indicators", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-010", "AI-012"],
  "dependencies": ["PRM-332"],
  "documentation_refs": ["PLAT-*"]
}
```
