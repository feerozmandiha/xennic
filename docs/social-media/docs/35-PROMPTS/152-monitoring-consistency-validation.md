# Monitoring Consistency Validation — اعتبارسنجی سازگاری نظارت

> **شناسه:** PRM-336
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Operations Lead
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-335](./150-operational-risk-validation.md), [PLAT-\*](../20-PLATFORMS/)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                             |
| ------------------ | --------------------------------- |
| **id**             | PRM-336                           |
| **name_fa**        | اعتبارسنجی سازگاری نظارت          |
| **name_en**        | Monitoring Consistency Validation |
| **family**         | FAM-OPS                           |
| **subfamily**      | OPS-MON                           |
| **type**           | PT-06                             |
| **complexity**     | C-2                               |
| **authority**      | A-2                               |
| **owner**          | Operations Lead                   |
| **version**        | 1.0.0-draft                       |
| **status**         | draft                             |
| **security_level** | SL-02                             |

---

## 2. Purpose

PRM-336 سازگاری داده‌های نظارت در سراسر زنجیره OPS-MON را بررسی می‌کند. این پرامپت اطمینان حاصل می‌کند که همه خروجی‌های PRM-330 تا PRM-335 با یکدیگر سازگار و هماهنگ هستند.

### اصول سازگاری

| ID    | اصل                                              |
| ----- | ------------------------------------------------ |
| MC-01 | داده‌های نظارت باید در سراسر زنجیره سازگار باشند |
| MC-02 | نام‌گذاری رویدادها و ریسک‌ها یکسان باشد          |
| MC-03 | مقیاس‌ها و واحدها در همه خروجی‌ها یکسان باشند    |

---

## 3. Scope

### Inside Scope

| حوزه            | توضیح                   |
| --------------- | ----------------------- |
| بررسی نام‌گذاری | یکسان‌سازی نام رویدادها |
| بررسی واحدها    | تطبیق مقیاس‌ها و واحدها |
| سازگاری زنجیره  | انسجام خروجی‌ها         |

### Outside Scope

| حوزه              | دلیل         |
| ----------------- | ------------ |
| خلاصه هوش عملیاتی | حوزه PRM-337 |
| کیفیت نظارت       | حوزه PRM-338 |

---

## 4. Consumers

| مصرف‌کننده         | نقش                | نوع مصرف |
| ------------------ | ------------------ | -------- |
| AI-010 (Analytics) | اعتبارسنجی سازگاری | Chain    |
| AI-011 (Knowledge) | تأیید انطباق دانشی | System   |

---

## 5. Inputs

| ورودی           | نوع    | منبع         | اجباری |
| --------------- | ------ | ------------ | ------ |
| `chain_outputs` | object | PRM-330..335 | بله    |

---

## 6. Outputs

| خروجی                             | نوع     | توضیح                           |
| --------------------------------- | ------- | ------------------------------- |
| `consistency_result`              | string  | نتیجه (consistent/inconsistent) |
| `consistency_score`               | number  | امتیاز سازگاری (۰–۱۰۰)          |
| `inconsistencies`                 | array   | ناسازگاری‌های شناسایی‌شده       |
| `consistency_validation_complete` | boolean | وضعیت تکمیل                     |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-335 Output",
        "scope": ["risk-assessment", "risk-score"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-04",
        "source": "PRM-334..330 Output",
        "scope": ["all-chain-outputs"],
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

| منبع    | دامنه                  | کاربرد        |
| ------- | ---------------------- | ------------- |
| PLAT-\* | استانداردهای نام‌گذاری | بررسی سازگاری |

---

## 9. Prompt Structure

PRM-336 هفتمین گام زنجیره OPS-MON. سازگاری کل زنجیره را بررسی می‌کند.

```
PRM-335 → risk_assessment → PRM-336 → consistency_score → PRM-337
```

---

## 10. Variable Definitions

| متغیر           | نوع    | اجباری | توضیح                        | اعتبارسنجی |
| --------------- | ------ | ------ | ---------------------------- | ---------- |
| `chain_outputs` | VAR-06 | بله    | خروجی‌های PRM-330 تا PRM-335 | —          |

---

## 11. Execution Constraints

| ID     | محدودیت                         |
| ------ | ------------------------------- |
| CST-01 | همه خروجی‌های زنجیره بررسی شوند |
| CST-02 | ناسازگاری‌ها مستند شوند         |

---

## 12. Validation Rules

| ID     | قاعده                    | سطح    | نقض     |
| ------ | ------------------------ | ------ | ------- |
| VAL-01 | consistency_score ≥ ۸۵٪  | معماری | عدم ثبت |
| VAL-02 | همه خروجی‌ها موجود باشند | معماری | عدم ثبت |

---

## 13. Failure Conditions

| شرط                     | اقدام                         |
| ----------------------- | ----------------------------- |
| consistency_score < ۸۵٪ | Escalation به Operations Lead |
| خروجی زنجیره缺失        | مسدود — Escalation با جزئیات  |

---

## 14. Quality Gates

| گیت   | مکان              | معیار                     | مسئول           |
| ----- | ----------------- | ------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل, input معتبر    | خودکار          |
| QG-02 | Review → Approved | سازگاری ≥ ۸۵٪             | Operations Lead |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-2) | Registry Keeper |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                                  | توسط        |
| ----------- | ---------- | -------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — اعتبارسنجی سازگاری نظارت | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-336",
  "name": "Monitoring Consistency Validation",
  "family": "FAM-OPS",
  "subfamily": "OPS-MON",
  "type": "PT-06",
  "complexity": "C-2",
  "authority": "A-2",
  "version": "1.0.0-draft",
  "status": "draft"
}
```

### Block 2 — Context

```json
{
  "sources": [
    { "type": "CTX-04", "source": "PRM-335", "required": true },
    { "type": "CTX-04", "source": "PRM-330..334", "required": true }
  ],
  "max_tokens": 3000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [{ "id": "chain_outputs", "type": "VAR-06", "required": true }]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["chain_outputs"],
    "optional": []
  },
  "output": {
    "required": ["consistency_result", "consistency_score", "consistency_validation_complete"],
    "optional": ["inconsistencies"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Consistency score >= 85%", "severity": "error" },
    { "id": "VAL-02", "description": "All chain outputs present", "severity": "error" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-010", "AI-011"],
  "dependencies": [],
  "documentation_refs": ["PLAT-*"]
}
```
