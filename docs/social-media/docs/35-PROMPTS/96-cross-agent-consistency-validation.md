# Cross-Agent Consistency Validation — اعتبارسنجی سازگاری بین عاملی

> **شناسه:** PRM-906
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Orchestrator Lead
> **وابستگی:** PRM-905
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                              |
| ------------------ | ---------------------------------- |
| **id**             | PRM-906                            |
| **name_fa**        | اعتبارسنجی سازگاری بین عاملی       |
| **name_en**        | Cross-Agent Consistency Validation |
| **family**         | FAM-SYS                            |
| **subfamily**      | SYS-ORC                            |
| **type**           | PT-06                              |
| **complexity**     | C-3                                |
| **authority**      | A-4                                |
| **owner**          | Orchestrator Lead                  |
| **version**        | 1.0.0-draft                        |
| **status**         | draft                              |
| **security_level** | SL-02                              |

---

## 2. Purpose

PRM-906 پنجمین گام زنجیره SYS-ORC. سازگاری میان خروجی‌های Agentهای مختلف در طول یک session اجرایی را اعتبارسنجی می‌کند.

### اصول اعتبارسنجی

| ID    | اصل                                                     |
| ----- | ------------------------------------------------------- |
| CV-01 | خروجی‌های Agentها از نظر ساختار و اصطلاحات سازگار باشند |
| CV-02 | تناقضات شناسایی و گزارش شوند                            |

---

## 3. Scope

### Inside Scope

| حوزه                     | توضیح                         |
| ------------------------ | ----------------------------- |
| اعتبارسنجی سازگاری خروجی | cross-agent output validation |
| تشخیص تناقض              | شناسایی و گزارش               |

### Outside Scope

| حوزه                  | دلیل         |
| --------------------- | ------------ |
| اعتبارسنجی فردی Agent | حوزه AI-004  |
| تکمیل نهایی           | حوزه PRM-907 |

---

## 4. Consumers

| مصرف‌کننده            | نقش                | نوع مصرف |
| --------------------- | ------------------ | -------- |
| AI-004 (Review)       | اعتبارسنجی محتوایی | مشارکتی  |
| AI-011 (Knowledge)    | اعتبارسنجی دانش    | مشارکتی  |
| AI-014 (Orchestrator) | اعتبارسنجی نهایی   | Chain    |

---

## 5. Inputs

| ورودی                 | نوع    | منبع               | اجباری |
| --------------------- | ------ | ------------------ | ------ |
| `agent_outputs`       | array  | تمام Agentهای فعال | بله    |
| `recovery_strategies` | object | PRM-905            | بله    |

---

## 6. Outputs

| خروجی                | نوع    | توضیح               |
| -------------------- | ------ | ------------------- |
| `consistency_report` | object | وضعیت سازگاری       |
| `inconsistencies`    | array  | تناقضات شناسایی‌شده |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-02",
        "source": "PRM-905",
        "scope": ["recovery-strategies"],
        "injection": "prepend",
        "required": true
      }
    ],
    "max_tokens": 6000,
    "priority": "high"
  }
}
```

---

## 8. Knowledge Requirements

| منبع   | دامنه        | کاربرد              |
| ------ | ------------ | ------------------- |
| AI-011 | دانش سازمانی | اعتبارسنجی اصطلاحات |

---

## 9. Prompt Structure

پنجمین گام — اعتبارسنجی سازگاری خروجی‌های Agentها.

```
agent_outputs + recovery_strategies → PRM-906 → consistency_report → PRM-907
```

---

## 10. Variable Definitions

| متغیر                 | نوع    | اجباری | توضیح              |
| --------------------- | ------ | ------ | ------------------ |
| `agent_outputs`       | VAR-03 | بله    | خروجی تمام Agentها |
| `recovery_strategies` | VAR-03 | بله    | استراتژی بازیابی   |

---

## 11. Execution Constraints

| ID     | محدودیت                                       |
| ------ | --------------------------------------------- |
| CST-01 | تمام خروجی‌های Agentها بررسی شوند             |
| CST-02 | تناقضات با ارجاع به دانش سازمانی ارزیابی شوند |

---

## 12. Validation Rules

| ID     | قاعده                                 | سطح     | نقض   |
| ------ | ------------------------------------- | ------- | ----- |
| VAL-01 | خروجی‌ها از نظر اصطلاحات سازگار هستند | محتوایی | اخطار |
| VAL-02 | تناقضات مستند شده‌اند                 | معماری  | خطا   |

---

## 13. Failure Conditions

| شرط          | اقدام                                           |
| ------------ | ----------------------------------------------- |
| تناقض بحرانی | بازگشت inconsistency + توقف زنجیره برای بازبینی |

---

## 14. Quality Gates

| گیت   | مکان              | معیار        | مسئول             |
| ----- | ----------------- | ------------ | ----------------- |
| QG-01 | Draft → Review    | هویت کامل    | خودکار            |
| QG-02 | Review → Approved | سازگاری کامل | Orchestrator Lead |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                                      | توسط        |
| ----------- | ---------- | ------------------------------------------ | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — اعتبارسنجی سازگاری بین عاملی | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-906",
  "name": "Cross-Agent Consistency Validation",
  "family": "FAM-SYS",
  "subfamily": "SYS-ORC",
  "type": "PT-06",
  "complexity": "C-3",
  "authority": "A-4",
  "version": "1.0.0-draft",
  "status": "draft"
}
```

### Block 2 — Context

```json
{
  "sources": [{ "type": "CTX-02", "source": "PRM-905", "required": true }],
  "max_tokens": 6000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "agent_outputs", "type": "VAR-03", "required": true },
    { "id": "recovery_strategies", "type": "VAR-03", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["agent_outputs", "recovery_strategies"],
    "optional": []
  },
  "output": {
    "required": ["consistency_report", "inconsistencies"],
    "optional": []
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Outputs consistent in terminology", "severity": "warning" },
    { "id": "VAL-02", "description": "Inconsistencies documented", "severity": "error" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-004", "AI-011", "AI-014"],
  "dependencies": ["PRM-905"],
  "documentation_refs": ["AI-000"]
}
```
