# Learning Completion Validation — اعتبارسنجی تکمیل یادگیری

> **شناسه:** PRM-439
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Improvement Validator
> **وابستگی:** PRM-438
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                          |
| ------------------ | ------------------------------ |
| **id**             | PRM-439                        |
| **name_fa**        | اعتبارسنجی تکمیل یادگیری       |
| **name_en**        | Learning Completion Validation |
| **family**         | FAM-KNW                        |
| **subfamily**      | KNW-LRN                        |
| **type**           | PT-06                          |
| **complexity**     | C-3                            |
| **authority**      | A-3                            |
| **owner**          | Improvement Validator          |
| **version**        | 1.0.0-draft                    |
| **status**         | draft                          |
| **security_level** | SL-02                          |

---

## 2. Purpose

PRM-439 دهمین و آخرین گام زنجیره KNW-LRN و آخرین پرامپت خانواده FAM-KNW. تکمیل کامل چرخه یادگیری سازمانی را با بررسی تمام خروجی‌های زنجیره و صدور رویداد نهایی اعتبارسنجی می‌کند.

### اصول اعتبارسنجی

| ID    | اصل                                  |
| ----- | ------------------------------------ |
| CV-01 | تمام گام‌های زنجیره تکمیل شده‌اند    |
| CV-02 | یادگیری سازمانی مستند و قابل ثبت است |

---

## 3. Scope

### Inside Scope

| حوزه                    | توضیح                             |
| ----------------------- | --------------------------------- |
| بررسی تکمیل PRM-430–438 | تمام گام‌های KNW-LRN              |
| صدور رویداد تکمیل       | organizational_learning_completed |

### Outside Scope

| حوزه        | دلیل         |
| ----------- | ------------ |
| مونتاژ بسته | حوزه PRM-438 |
| ثبت دانش    | حوزه PRM-408 |

---

## 4. Consumers

| مصرف‌کننده            | نقش              | نوع مصرف      |
| --------------------- | ---------------- | ------------- |
| AI-012 (Improvement)  | اعتبارسنجی تکمیل | Chain         |
| AI-011 (Knowledge)    | مصرف یادگیری     | Secondary     |
| AI-014 (Orchestrator) | نظارت بر تکمیل   | Orchestration |
| AI-004 (Review)       | اعتبارسنجی نهایی | Quality       |

---

## 5. Inputs

| ورودی                 | نوع    | منبع    | اجباری |
| --------------------- | ------ | ------- | ------ |
| `improvement_package` | object | PRM-438 | بله    |
| `learning_assessment` | object | PRM-437 | بله    |
| `evolution_plan`      | object | PRM-434 | بله    |

---

## 6. Outputs

| خروجی                               | نوع     | توضیح                                 |
| ----------------------------------- | ------- | ------------------------------------- |
| `completion_report`                 | object  | گزارش تکمیل یادگیری                   |
| `completion_status`                 | string  | وضعیت (completed, incomplete, failed) |
| `organizational_learning_completed` | boolean | رویداد پایان زنجیره                   |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "PRM-438-output",
        "scope": ["package"],
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

| منبع       | دامنه         | کاربرد           |
| ---------- | ------------- | ---------------- |
| بسته بهبود | تمام خروجی‌ها | اعتبارسنجی تکمیل |

---

## 9. Prompt Structure

PRM-439 آخرین گام زنجیره KNW-LRN و آخرین گام FAM-KNW. تکمیل یادگیری را تأیید می‌کند.

```
improvement_package + learning_assessment + evolution_plan → PRM-439 → completion_report → organizational_learning_completed
```

---

## 10. Variable Definitions

| متغیر                 | نوع    | اجباری | توضیح             |
| --------------------- | ------ | ------ | ----------------- |
| `improvement_package` | VAR-06 | بله    | بسته بهبود        |
| `learning_assessment` | VAR-06 | بله    | ارزیابی یادگیری   |
| `evolution_plan`      | VAR-06 | بله    | برنامه تکامل دانش |

---

## 11. Execution Constraints

| ID     | محدودیت                               |
| ------ | ------------------------------------- |
| CST-01 | تمام گام‌های PRM-430–438 اجرا شده‌اند |
| CST-02 | کیفیت یادگیری قابل قبول است           |

---

## 12. Validation Rules

| ID     | قاعده                             | سطح    | نقض   |
| ------ | --------------------------------- | ------ | ----- |
| VAL-01 | تمام گام‌های زنجیره تکمیل شده‌اند | معماری | خطا   |
| VAL-02 | اهداف یادگیری محقق شده‌اند        | معماری | خطا   |
| VAL-03 | کیفیت یادگیری قابل قبول           | معماری | هشدار |

---

## 13. Failure Conditions

| شرط              | اقدام                             |
| ---------------- | --------------------------------- |
| گامی ناقص        | بازگشت error + مشخص کردن گام ناقص |
| کیفیت زیر آستانه | بازگشت warning + پیشنهاد بازبینی  |

---

## 14. Quality Gates

| گیت   | مکان              | معیار                                            | مسئول                 |
| ----- | ----------------- | ------------------------------------------------ | --------------------- |
| QG-01 | Draft → Review    | هویت کامل                                        | خودکار                |
| QG-02 | Review → Approved | تکمیل یادگیری تأیید                              | Improvement Validator |
| QG-03 | Approved → Active | رویداد organizational_learning_completed صادر شد | AI-014                |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                                                         | توسط        |
| ----------- | ---------- | ------------------------------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — اعتبارسنجی تکمیل یادگیری — آخرین پرامپت FAM-KNW | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-439",
  "name": "Learning Completion Validation",
  "family": "FAM-KNW",
  "subfamily": "KNW-LRN",
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
  "sources": [{ "type": "CTX-02", "source": "PRM-438-output", "required": true }],
  "max_tokens": 3500,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "improvement_package", "type": "VAR-06", "required": true },
    { "id": "learning_assessment", "type": "VAR-06", "required": true },
    { "id": "evolution_plan", "type": "VAR-06", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["improvement_package", "learning_assessment", "evolution_plan"],
    "optional": []
  },
  "output": {
    "required": ["completion_report", "completion_status", "organizational_learning_completed"],
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
      "description": "All chain steps (PRM-430-438) completed",
      "severity": "error"
    },
    { "id": "VAL-02", "description": "Learning objectives achieved", "severity": "error" },
    { "id": "VAL-03", "description": "Learning quality acceptable", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-012", "AI-011", "AI-014", "AI-004"],
  "dependencies": ["PRM-438"],
  "documentation_refs": []
}
```
