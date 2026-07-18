# Community Handoff Validation — اعتبارسنجی تحویل جامعه

> **شناسه:** PRM-319
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Community Manager
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-318](./116-community-incident-assessment.md), [PRM-301](./30-publishing-instruction.md), [PLAT-\*](../20-PLATFORMS/)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                        |
| ------------------ | ---------------------------- |
| **id**             | PRM-319                      |
| **name_fa**        | اعتبارسنجی تحویل جامعه       |
| **name_en**        | Community Handoff Validation |
| **family**         | FAM-OPS                      |
| **subfamily**      | OPS-CMG                      |
| **type**           | PT-06                        |
| **complexity**     | C-3                          |
| **authority**      | A-3                          |
| **owner**          | Community Manager            |
| **version**        | 1.0.0-draft                  |
| **status**         | draft                        |
| **security_level** | SL-02                        |

---

## 2. Purpose

PRM-319 به عنوان دروازه خروج OPS-CMG، اعتبارسنجی نهایی چرخه تعامل جامعه را انجام داده و وضعیت `community_interaction_completed` را ثبت می‌کند. این پرامپت تضمین می‌کند که همه تعاملات پردازش‌شده، مستند و برای تحویل به Agentهای پساتعامل (AI-010, AI-011, AI-012) آماده هستند.

### اصول تحویل جامعه

| ID    | اصل                                                     |
| ----- | ------------------------------------------------------- |
| CH-01 | همه تعاملات باید در بازه زمانی پردازش شده باشند         |
| CH-02 | بسته تحویلی باید برای همه Agentهای downstream کامل باشد |
| CH-03 | وضعیت نهایی باید unambiguous باشد                       |
| CH-04 | حلقه بازخورد به AI-012 برای بهبود مستمر الزامی است      |

---

## 3. Scope

### Inside Scope

| حوزه           | توضیح                                  |
| -------------- | -------------------------------------- |
| تجمیع تعاملات  | جمع‌آوری نتایج همه تعاملات بازه        |
| SLA compliance | بررسی رعایت SLAهای تعامل               |
| وضعیت نهایی    | تعیین community_interaction_completed  |
| بسته تحویلی    | آماده‌سازی برای AI-010, AI-011, AI-012 |

### Outside Scope

| حوزه                | دلیل                  |
| ------------------- | --------------------- |
| تعامل تکی           | حوزه PRM-310..PRM-315 |
| تحلیل احساسات       | حوزه PRM-316          |
| Incident Assessment | حوزه PRM-318          |

---

## 4. Consumers

| مصرف‌کننده           | نقش                             | نوع مصرف |
| -------------------- | ------------------------------- | -------- |
| AI-009 (Community)   | اعتبارسنجی نهایی تحویل          | Chain    |
| AI-010 (Analytics)   | دریافت داده برای تحلیل عملکرد   | System   |
| AI-011 (Knowledge)   | ذخیره گزارش در مخزن دانش        | System   |
| AI-012 (Improvement) | دریافت بازخورد برای بهبود مستمر | System   |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-318 Output",
        "scope": ["incident-report", "downstream-package"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PRM-301",
        "scope": ["sla-requirements", "handoff-criteria"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-05",
        "source": "PLAT-*",
        "scope": ["engagement-slas", "latency-bounds"],
        "injection": "append",
        "required": true
      }
    ],
    "max_tokens": 5000,
    "priority": "high"
  }
}
```

---

## 6. Required Knowledge

| منبع    | دامنه                | کاربرد            |
| ------- | -------------------- | ----------------- |
| PRM-301 | معیارهای تحویل و SLA | تعیین وضعیت نهایی |
| PLAT-\* | SLAهای تعامل پلتفرم  | بررسی انطباق SLA  |

---

## 7. Variables

| متغیر                   | نوع    | اجباری | توضیح                  | اعتبارسنجی  |
| ----------------------- | ------ | ------ | ---------------------- | ----------- |
| `incident_report`       | VAR-06 | بله    | گزارش حادثه از PRM-318 | —           |
| `interaction_summary`   | VAR-06 | بله    | خلاصه همه تعاملات بازه | —           |
| `sla_threshold_minutes` | VAR-04 | خیر    | آستانه SLA (دقیقه)     | default: 30 |

---

## 8. Constraints

| ID     | محدودیت                                                 |
| ------ | ------------------------------------------------------- |
| CST-01 | همه تعاملات بحرانی (priority ۱) باید پردازش شده باشند   |
| CST-02 | SLA تعامل نباید نقض شده باشد                            |
| CST-03 | بسته تحویلی باید برای همه Agentهای downstream کامل باشد |

---

## 9. Input Contract

| ورودی                   | نوع    | منبع         | اجباری |
| ----------------------- | ------ | ------------ | ------ |
| `incident_report`       | object | PRM-318      | بله    |
| `interaction_summary`   | array  | PRM-310..317 | بله    |
| `sla_threshold_minutes` | number | AI-009       | خیر    |

---

## 10. Output Contract

| خروجی                  | نوع    | توضیح                                  |
| ---------------------- | ------ | -------------------------------------- |
| `handoff_status`       | string | وضعیت نهایی (completed/partial/failed) |
| `handoff_report`       | object | گزارش کامل تحویل                       |
| `sla_compliance`       | object | وضعیت انطباق با SLA                    |
| `downstream_package`   | object | بسته تحویلی برای Agentهای پساتعامل     |
| `completion_timestamp` | string | برچسب زمانی تکمیل                      |
| `improvement_feedback` | object | بازخورد برای AI-012                    |

---

## 11. Validation Rules

| ID     | قاعده                            | سطح    | نقض     |
| ------ | -------------------------------- | ------ | ------- |
| VAL-01 | همه تعاملات بحرانی پردازش شده    | معماری | عدم ثبت |
| VAL-02 | SLA رعایت شده                    | معماری | عدم ثبت |
| VAL-03 | downstream_package کامل          | معماری | هشدار   |
| VAL-04 | improvement_feedback برای AI-012 | معماری | هشدار   |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                     | مسئول              |
| ----- | ----------------- | ------------------------- | ------------------ |
| QG-01 | Draft → Review    | هویت کامل, input معتبر    | خودکار             |
| QG-02 | Review → Approved | معیارهای تحویل کامل       | Community Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3) | Registry Keeper    |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                         |
| ------- | ------------------- | ------ | ---------------------------- |
| PRM-318 | DEP-01 (Requires)   | ^1.0.0 | گزارش حادثه برای تحویل نهایی |
| PRM-301 | DEP-03 (References) | ^1.0.0 | معیارهای تحویل و SLA         |
| PLAT-\* | DEP-03 (References) | ^1.0.0 | SLAهای تعامل پلتفرم          |

---

## 14. Human Override

| سناریو                   | اقدام                                   |
| ------------------------ | --------------------------------------- |
| handoff_status = partial | Escalation به Community Manager         |
| SLA violation            | ثبت نقض + Escalation به Operations Lead |

---

## 15. Governance Notes

| ID     | یادداشت                                                     |
| ------ | ----------------------------------------------------------- |
| GOV-01 | A-3 (Strategic) — نیازمند ADR برای وضعیت نهایی              |
| GOV-02 | downstream_package برای AI-010, AI-011, AI-012 الزامی است   |
| GOV-03 | این پرامپت آخرین گام OPS-CMG و دروازه Agentهای پساتعامل است |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-319",
  "name": "Community Handoff Validation",
  "family": "FAM-OPS",
  "subfamily": "OPS-CMG",
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
    { "type": "CTX-04", "source": "PRM-318", "required": true },
    { "type": "CTX-02", "source": "PRM-301", "required": true },
    { "type": "CTX-05", "source": "PLAT-*", "required": true }
  ],
  "max_tokens": 5000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "incident_report", "type": "VAR-06", "required": true },
    { "id": "interaction_summary", "type": "VAR-06", "required": true },
    { "id": "sla_threshold_minutes", "type": "VAR-04", "required": false, "default": 30 }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["incident_report", "interaction_summary"],
    "optional": ["sla_threshold_minutes"]
  },
  "output": {
    "required": ["handoff_status", "handoff_report", "sla_compliance", "completion_timestamp"],
    "optional": ["downstream_package", "improvement_feedback"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "All critical interactions processed", "severity": "error" },
    { "id": "VAL-02", "description": "SLA not violated", "severity": "error" },
    { "id": "VAL-03", "description": "Downstream package complete", "severity": "warning" },
    { "id": "VAL-04", "description": "Improvement feedback for AI-012", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-009", "AI-010", "AI-011", "AI-012"],
  "dependencies": ["PRM-318"],
  "documentation_refs": ["PRM-301", "PLAT-*"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                                | توسط        |
| ----------- | ---------- | ------------------------------------ | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — اعتبارسنجی تحویل جامعه | معمار سیستم |
