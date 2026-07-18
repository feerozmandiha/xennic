# Monitoring Completion Validation — اعتبارسنجی تکمیل نظارت

> **شناسه:** PRM-339
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Operations Lead
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-338](./156-monitoring-quality-assessment.md), [PLAT-\*](../20-PLATFORMS/)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                            |
| ------------------ | -------------------------------- |
| **id**             | PRM-339                          |
| **name_fa**        | اعتبارسنجی تکمیل نظارت           |
| **name_en**        | Monitoring Completion Validation |
| **family**         | FAM-OPS                          |
| **subfamily**      | OPS-MON                          |
| **type**           | PT-06                            |
| **complexity**     | C-3                              |
| **authority**      | A-3                              |
| **owner**          | Operations Lead                  |
| **version**        | 1.0.0-draft                      |
| **status**         | draft                            |
| **security_level** | SL-02                            |

---

## 2. Purpose

PRM-339 آخرین گیت در زنجیره OPS-MON است که تکمیل کامل فرآیند نظارت عملیاتی را تأیید می‌کند. این پرامپت تضمین می‌کند که همه خروجی‌های PRM-330 تا PRM-338 کامل، معتبر و برای مصرف توسط Agentهای پایین‌دست (AI-010, AI-011, AI-012, AI-014) آماده هستند.

### اصول تکمیل

| ID    | اصل                                               |
| ----- | ------------------------------------------------- |
| MC-01 | همه خروجی‌های زنجیره باید کامل باشند              |
| MC-02 | بسته تحویلی باید قابل مصرف توسط Agentهای هدف باشد |
| MC-03 | خطاهای باقی‌مانده باید مستند شوند                 |

---

## 3. Scope

### Inside Scope

| حوزه            | توضیح                               |
| --------------- | ----------------------------------- |
| بررسی کامل بودن | تأیید وجود همه خروجی‌ها             |
| یکپارچگی بسته   | انسجام خروجی‌های زنجیره             |
| مستندسازی خطاها | ثبت خطاهای باقی‌مانده               |
| تحویل           | آماده‌سازی برای Agentهای مصرف‌کننده |

### Outside Scope

| حوزه        | دلیل         |
| ----------- | ------------ |
| کیفیت نظارت | حوزه PRM-338 |
| بهبود       | حوزه AI-012  |

---

## 4. Consumers

| مصرف‌کننده            | نقش                | نوع مصرف  |
| --------------------- | ------------------ | --------- |
| AI-010 (Analytics)    | تأیید تکمیل        | Chain     |
| AI-011 (Knowledge)    | دریافت خروجی نهایی | System    |
| AI-012 (Improvement)  | دریافت ارزیابی     | Strategic |
| AI-014 (Orchestrator) | نظارت بر وضعیت     | Strategic |

---

## 5. Inputs

| ورودی           | نوع    | منبع         | اجباری |
| --------------- | ------ | ------------ | ------ |
| `chain_outputs` | object | PRM-330..338 | بله    |
| `quality_score` | number | PRM-338      | بله    |

---

## 6. Outputs

| خروجی                    | نوع     | توضیح                                |
| ------------------------ | ------- | ------------------------------------ |
| `completion_result`      | string  | نتیجه (completed/partial/incomplete) |
| `completeness_checklist` | object  | چک‌لیست کامل بودن                    |
| `remaining_errors`       | array   | خطاهای باقی‌مانده                    |
| `delivery_package`       | object  | بسته تحویلی به Agentها               |
| `monitoring_completed`   | boolean | وضعیت نهایی (true/false)             |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-338 Output",
        "scope": ["quality-result", "quality-score"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-05",
        "source": "PLAT-*",
        "scope": ["monitoring-requirements", "completion-criteria"],
        "injection": "append",
        "required": false
      }
    ],
    "max_tokens": 4000,
    "priority": "high"
  }
}
```

---

## 8. Knowledge Requirements

| منبع         | دامنه            | کاربرد          |
| ------------ | ---------------- | --------------- |
| PRM-330..338 | خروجی‌های زنجیره | بررسی کامل بودن |

---

## 9. Prompt Structure

PRM-339 دهمین و آخرین گام زنجیره OPS-MON. تکمیل نظارت را تأیید و خروجی نهایی را تحویل می‌دهد.

```
PRM-338 → quality_score → PRM-339 → monitoring_completed → تحویل به AI-010, AI-011, AI-012, AI-014
```

---

## 10. Variable Definitions

| متغیر           | نوع    | اجباری | توضیح                            | اعتبارسنجی                                        |
| --------------- | ------ | ------ | -------------------------------- | ------------------------------------------------- |
| `chain_outputs` | VAR-06 | بله    | همه خروجی‌های PRM-330 تا PRM-338 | —                                                 |
| `quality_score` | VAR-01 | بله    | امتیاز کیفیت از PRM-338          | range: 0-100                                      |
| `target_agents` | VAR-07 | خیر    | Agentهای هدف برای تحویل          | default: ["AI-010", "AI-011", "AI-012", "AI-014"] |

---

## 11. Execution Constraints

| ID     | محدودیت                                         |
| ------ | ----------------------------------------------- |
| CST-01 | همه خروجی‌های اجباری زنجیره وجود داشته باشند    |
| CST-02 | امتیاز کیفیت ≥ ۷۰٪ (از PRM-338)                 |
| CST-03 | بسته تحویلی به همه Agentهای هدف قابل تحویل باشد |

---

## 12. Validation Rules

| ID     | قاعده                            | سطح    | نقض     |
| ------ | -------------------------------- | ------ | ------- |
| VAL-01 | همه خروجی‌های اجباری موجود باشند | معماری | عدم ثبت |
| VAL-02 | quality_score ≥ ۷۰٪              | معماری | عدم ثبت |
| VAL-03 | completion_result = completed    | معماری | عدم ثبت |

---

## 13. Failure Conditions

| شرط                 | اقدام                                 |
| ------------------- | ------------------------------------- |
| quality_score < ۷۰٪ | مسدود — Escalation به Operations Lead |
| partial completion  | مسدود — Escalation با چک‌لیست         |
| خروجی缺失           | مسدود — Escalation با جزئیات          |

---

## 14. Quality Gates

| گیت   | مکان              | معیار                     | مسئول           |
| ----- | ----------------- | ------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل, input معتبر    | خودکار          |
| QG-02 | Review → Approved | چک‌لیست کامل              | Operations Lead |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3) | Registry Keeper |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                                | توسط        |
| ----------- | ---------- | ------------------------------------ | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — اعتبارسنجی تکمیل نظارت | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-339",
  "name": "Monitoring Completion Validation",
  "family": "FAM-OPS",
  "subfamily": "OPS-MON",
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
  "sources": [
    { "type": "CTX-04", "source": "PRM-338", "required": true },
    { "type": "CTX-05", "source": "PLAT-*", "required": false }
  ],
  "max_tokens": 4000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "chain_outputs", "type": "VAR-06", "required": true },
    { "id": "quality_score", "type": "VAR-01", "required": true },
    {
      "id": "target_agents",
      "type": "VAR-07",
      "required": false,
      "default": ["AI-010", "AI-011", "AI-012", "AI-014"]
    }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["chain_outputs", "quality_score"],
    "optional": ["target_agents"]
  },
  "output": {
    "required": ["completion_result", "completeness_checklist", "monitoring_completed"],
    "optional": ["remaining_errors", "delivery_package"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "All required outputs present", "severity": "error" },
    { "id": "VAL-02", "description": "Quality score >= 70%", "severity": "error" },
    { "id": "VAL-03", "description": "Completion result = completed", "severity": "error" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-010", "AI-011", "AI-012", "AI-014"],
  "dependencies": ["PRM-338"],
  "documentation_refs": ["PLAT-*"]
}
```
