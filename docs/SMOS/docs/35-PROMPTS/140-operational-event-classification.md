# Operational Event Classification — طبقه‌بندی رویداد عملیاتی

> **شناسه:** PRM-330
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Operations Lead
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PLAT-\*](../20-PLATFORMS/)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                            |
| ------------------ | -------------------------------- |
| **id**             | PRM-330                          |
| **name_fa**        | طبقه‌بندی رویداد عملیاتی         |
| **name_en**        | Operational Event Classification |
| **family**         | FAM-OPS                          |
| **subfamily**      | OPS-MON                          |
| **type**           | PT-04                            |
| **complexity**     | C-2                              |
| **authority**      | A-2                              |
| **owner**          | Operations Lead                  |
| **version**        | 1.0.0-draft                      |
| **status**         | draft                            |
| **security_level** | SL-02                            |

---

## 2. Purpose

PRM-330 نخستین پرامپت در زنجیره OPS-MON است. رویدادهای عملیاتی دریافت‌شده از پلتفرم‌ها و Agentها را بر اساس نوع، شدت و منبع طبقه‌بندی می‌کند و خروجی ساختاریافته‌ای برای مراحل بعدی زنجیره فراهم می‌آورد.

### اصول طبقه‌بندی

| ID    | اصل                                           |
| ----- | --------------------------------------------- |
| EC-01 | هر رویداد باید به یک نوع مشخص تعلق داشته باشد |
| EC-02 | شدت رویداد باید مبتنی بر تأثیر عملیاتی باشد   |
| EC-03 | منبع رویداد باید قابل ردیابی باشد             |

---

## 3. Scope

### Inside Scope

| حوزه          | توضیح                          |
| ------------- | ------------------------------ |
| دریافت رویداد | ورودی از پلتفرم‌ها و Agentها   |
| طبقه‌بندی نوع | error, warning, info, critical |
| تعیین شدت     | low, medium, high, critical    |
| منبع‌یابی     | شناسایی پلتفرم/Agent مبدأ      |

### Outside Scope

| حوزه        | دلیل         |
| ----------- | ------------ |
| اولویت‌بندی | حوزه PRM-331 |
| همبستگی     | حوزه PRM-332 |

---

## 4. Consumers

| مصرف‌کننده         | نقش                | نوع مصرف |
| ------------------ | ------------------ | -------- |
| AI-010 (Analytics) | طبقه‌بندی رویدادها | Chain    |

---

## 5. Inputs

| ورودی        | نوع   | منبع                | اجباری |
| ------------ | ----- | ------------------- | ------ |
| `raw_events` | array | AI-010 (از PLAT-\*) | بله    |

---

## 6. Outputs

| خروجی                     | نوع     | توضیح                             |
| ------------------------- | ------- | --------------------------------- |
| `classified_events`       | array   | رویدادهای طبقه‌بندی‌شده           |
| `event_summary`           | object  | خلاصه رویدادها به تفکیک نوع و شدت |
| `classification_complete` | boolean | وضعیت تکمیل                       |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-05",
        "source": "PLAT-*",
        "scope": ["event-types", "error-codes"],
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

| منبع    | دامنه                 | کاربرد         |
| ------- | --------------------- | -------------- |
| PLAT-\* | انواع رویداد و کد خطا | طبقه‌بندی صحیح |

---

## 9. Prompt Structure

PRM-330 به عنوان اولین گام زنجیره OPS-MON، ورودی خام رویدادها را دریافت کرده و پس از طبقه‌بندی، خروجی را به PRM-331 تحویل می‌دهد.

```
raw_events → PRM-330 → classified_events → PRM-331
```

---

## 10. Variable Definitions

| متغیر             | نوع    | اجباری | توضیح                 | اعتبارسنجی    |
| ----------------- | ------ | ------ | --------------------- | ------------- |
| `raw_events`      | VAR-06 | بله    | رویدادهای خام عملیاتی | —             |
| `include_summary` | VAR-03 | خیر    | تولید خلاصه طبقه‌بندی | default: true |

---

## 11. Execution Constraints

| ID     | محدودیت                                  |
| ------ | ---------------------------------------- |
| CST-01 | هر رویداد دقیقاً یک نوع و شدت داشته باشد |
| CST-02 | منبع رویداد قابل ردیابی باشد             |

---

## 12. Validation Rules

| ID     | قاعده                            | سطح    | نقض     |
| ------ | -------------------------------- | ------ | ------- |
| VAL-01 | همه رویدادها طبقه‌بندی شده باشند | معماری | عدم ثبت |
| VAL-02 | نوع و شدت معتبر باشند            | معماری | عدم ثبت |

---

## 13. Failure Conditions

| شرط                    | اقدام                                      |
| ---------------------- | ------------------------------------------ |
| رویداد با نوع ناشناخته | علامت‌گذاری به عنوان unknown + اطلاع‌رسانی |
| ورودی خالی             | بازگشت empty + هشدار به AI-010             |

---

## 14. Quality Gates

| گیت   | مکان              | معیار                     | مسئول           |
| ----- | ----------------- | ------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل, input معتبر    | خودکار          |
| QG-02 | Review → Approved | طبقه‌بندی کامل            | Operations Lead |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-2) | Registry Keeper |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                                  | توسط        |
| ----------- | ---------- | -------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — طبقه‌بندی رویداد عملیاتی | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-330",
  "name": "Operational Event Classification",
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
  "sources": [{ "type": "CTX-05", "source": "PLAT-*", "required": true }],
  "max_tokens": 3000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "raw_events", "type": "VAR-06", "required": true },
    { "id": "include_summary", "type": "VAR-03", "required": false, "default": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["raw_events"],
    "optional": ["include_summary"]
  },
  "output": {
    "required": ["classified_events", "classification_complete"],
    "optional": ["event_summary"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "All events classified", "severity": "error" },
    { "id": "VAL-02", "description": "Valid type and severity", "severity": "error" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-010"],
  "dependencies": [],
  "documentation_refs": ["PLAT-*"]
}
```
