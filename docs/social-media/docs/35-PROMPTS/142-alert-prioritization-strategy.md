# Alert Prioritization Strategy — استراتژی اولویت‌بندی هشدار

> **شناسه:** PRM-331
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Operations Lead
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-330](./140-operational-event-classification.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                         |
| ------------------ | ----------------------------- |
| **id**             | PRM-331                       |
| **name_fa**        | استراتژی اولویت‌بندی هشدار    |
| **name_en**        | Alert Prioritization Strategy |
| **family**         | FAM-OPS                       |
| **subfamily**      | OPS-MON                       |
| **type**           | PT-07                         |
| **complexity**     | C-3                           |
| **authority**      | A-3                           |
| **owner**          | Operations Lead               |
| **version**        | 1.0.0-draft                   |
| **status**         | draft                         |
| **security_level** | SL-02                         |

---

## 2. Purpose

PRM-331 هشدارهای طبقه‌بندی‌شده از PRM-330 را دریافت کرده و با اعمال قواعد اولویت‌بندی، ترتیب رسیدگی به هر هشدار را تعیین می‌کند.

### اصول اولویت‌بندی

| ID    | اصل                                     |
| ----- | --------------------------------------- |
| AP-01 | اولویت بر اساس شدت و تأثیر تعیین شود    |
| AP-02 | هشدارهای بحرانی همیشه اولویت بالا دارند |
| AP-03 | اولویت‌بندی قابل بازبینی باشد           |

---

## 3. Scope

### Inside Scope

| حوزه         | توضیح                 |
| ------------ | --------------------- |
| تعیین اولویت | تخصیص اولویت P0-P3    |
| قواعد اولویت | اعمال قواعد کسب‌وکار  |
| توجیه اولویت | مستندسازی دلیل اولویت |

### Outside Scope

| حوزه      | دلیل         |
| --------- | ------------ |
| طبقه‌بندی | حوزه PRM-330 |
| همبستگی   | حوزه PRM-332 |

---

## 4. Consumers

| مصرف‌کننده         | نقش                 | نوع مصرف |
| ------------------ | ------------------- | -------- |
| AI-010 (Analytics) | اولویت‌بندی هشدارها | Chain    |

---

## 5. Inputs

| ورودی               | نوع   | منبع    | اجباری |
| ------------------- | ----- | ------- | ------ |
| `classified_events` | array | PRM-330 | بله    |

---

## 6. Outputs

| خروجی                     | نوع     | توضیح                          |
| ------------------------- | ------- | ------------------------------ |
| `prioritized_alerts`      | array   | هشدارهای اولویت‌بندی‌شده       |
| `priority_matrix`         | object  | ماتریس اولویت                  |
| `escalation_path`         | object  | مسیر escalation برای هر اولویت |
| `prioritization_complete` | boolean | وضعیت تکمیل                    |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-330 Output",
        "scope": ["classified-events", "event-summary"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "ARCH-030",
        "scope": ["escalation-paths", "severity-definitions"],
        "injection": "append",
        "required": false
      }
    ],
    "max_tokens": 3000,
    "priority": "high"
  }
}
```

---

## 8. Knowledge Requirements

| منبع     | دامنه              | کاربرد       |
| -------- | ------------------ | ------------ |
| ARCH-030 | مسیرهای escalation | تعیین اولویت |

---

## 9. Prompt Structure

PRM-331 دومین گام زنجیره OPS-MON. خروجی طبقه‌بندی‌شده از PRM-330 را دریافت و اولویت‌بندی می‌کند.

```
PRM-330 → classified_events → PRM-331 → prioritized_alerts → PRM-332
```

---

## 10. Variable Definitions

| متغیر                | نوع    | اجباری | توضیح                              | اعتبارسنجی    |
| -------------------- | ------ | ------ | ---------------------------------- | ------------- |
| `classified_events`  | VAR-06 | بله    | رویدادهای طبقه‌بندی‌شده از PRM-330 | —             |
| `include_escalation` | VAR-03 | خیر    | تعیین مسیر escalation              | default: true |

---

## 11. Execution Constraints

| ID     | محدودیت                              |
| ------ | ------------------------------------ |
| CST-01 | هر هشدار دقیقاً یک اولویت داشته باشد |
| CST-02 | هشدارهای بحرانی (critical) همیشه P0  |

---

## 12. Validation Rules

| ID     | قاعده                          | سطح    | نقض     |
| ------ | ------------------------------ | ------ | ------- |
| VAL-01 | همه هشدارها اولویت داشته باشند | معماری | عدم ثبت |
| VAL-02 | اولویت با شدت همخوان باشد      | معماری | هشدار   |

---

## 13. Failure Conditions

| شرط                          | اقدام                         |
| ---------------------------- | ----------------------------- |
| هشدار بدون اولویت قابل تخصیص | Escalation به Operations Lead |
| تضاد اولویت                  | بازبینی با قواعد优先级        |

---

## 14. Quality Gates

| گیت   | مکان              | معیار                     | مسئول           |
| ----- | ----------------- | ------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل, input معتبر    | خودکار          |
| QG-02 | Review → Approved | اولویت‌بندی کامل          | Operations Lead |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3) | Registry Keeper |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                                    | توسط        |
| ----------- | ---------- | ---------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — استراتژی اولویت‌بندی هشدار | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-331",
  "name": "Alert Prioritization Strategy",
  "family": "FAM-OPS",
  "subfamily": "OPS-MON",
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
  "sources": [
    { "type": "CTX-04", "source": "PRM-330", "required": true },
    { "type": "CTX-02", "source": "ARCH-030", "required": false }
  ],
  "max_tokens": 3000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "classified_events", "type": "VAR-06", "required": true },
    { "id": "include_escalation", "type": "VAR-03", "required": false, "default": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["classified_events"],
    "optional": ["include_escalation"]
  },
  "output": {
    "required": ["prioritized_alerts", "prioritization_complete"],
    "optional": ["priority_matrix", "escalation_path"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "All alerts have priority", "severity": "error" },
    { "id": "VAL-02", "description": "Priority aligns with severity", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-010"],
  "dependencies": ["PRM-330"],
  "documentation_refs": ["ARCH-030"]
}
```
