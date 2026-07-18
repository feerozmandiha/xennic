# Distribution Completion Validation — اعتبارسنجی تکمیل توزیع

> **شناسه:** PRM-308
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Operations Lead
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-307](./90-publication-verification.md), [PRM-301](./30-publishing-instruction.md), [PLAT-\*](../20-PLATFORMS/)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                              |
| ------------------ | ---------------------------------- |
| **id**             | PRM-308                            |
| **name_fa**        | اعتبارسنجی تکمیل توزیع             |
| **name_en**        | Distribution Completion Validation |
| **family**         | FAM-OPS                            |
| **subfamily**      | OPS-PUB                            |
| **type**           | PT-06                              |
| **complexity**     | C-3                                |
| **authority**      | A-3                                |
| **owner**          | Operations Lead                    |
| **version**        | 1.0.0-draft                        |
| **status**         | draft                              |
| **security_level** | SL-02                              |

---

## 2. Purpose

PRM-308 اعتبارسنجی نهایی تکمیل توزیع را در سراسر پلتفرم‌های هدف انجام می‌دهد. این پرامپت به عنوان دروازه خروج OPS-PUB عمل می‌کند و وضعیت نهایی توزیع، انطباق با SLAها و آمادگی برای تحویل به Agentهای پساانتشار (AI-009, AI-010, AI-011) را تعیین می‌کند.

### اصول تکمیل توزیع

| ID    | اصل                                                       |
| ----- | --------------------------------------------------------- |
| DC-01 | توزیع زمانی تکمیل می‌شود که همه پلتفرم‌ها تأیید شده باشند |
| DC-02 | وضعیت نهایی باید unambiguous باشد                         |
| DC-03 | خروجی برای Agentهای پساانتشار قابل مصرف باشد              |
| DC-04 | SLAهای انتشار باید رعایت شده باشند                        |

---

## 3. Scope

### Inside Scope

| حوزه           | توضیح                                        |
| -------------- | -------------------------------------------- |
| تجمیع تأیید    | جمع‌آوری نتایج تأیید همه پلتفرم‌ها           |
| SLA compliance | بررسی رعایت SLAهای انتشار                    |
| وضعیت نهایی    | تعیین وضعیت distribution_completed           |
| بسته تحویلی    | آماده‌سازی خروجی برای AI-009, AI-010, AI-011 |

### Outside Scope

| حوزه           | دلیل         |
| -------------- | ------------ |
| تأیید انتشار   | حوزه PRM-307 |
| تعامل با جامعه | حوزه AI-009  |
| تحلیل عملکرد   | حوزه AI-010  |

---

## 4. Consumers

| مصرف‌کننده          | نقش                           | نوع مصرف |
| ------------------- | ----------------------------- | -------- |
| AI-008 (Publishing) | اعتبارسنجی نهایی توزیع        | Chain    |
| AI-009 (Community)  | دریافت وضعیت برای شروع تعامل  | System   |
| AI-010 (Analytics)  | دریافت داده برای تحلیل عملکرد | System   |
| AI-011 (Knowledge)  | ذخیره گزارش در مخزن دانش      | System   |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-307 Output",
        "scope": ["verification-report", "failed-platforms"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PRM-301",
        "scope": ["sla-requirements", "completion-criteria"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PLAT-*",
        "scope": ["sla-limits", "latency-bounds"],
        "injection": "append",
        "required": true
      }
    ],
    "max_tokens": 4000,
    "priority": "high"
  }
}
```

---

## 6. Required Knowledge

| منبع    | دامنه                      | کاربرد            |
| ------- | -------------------------- | ----------------- |
| PLAT-\* | SLAها و محدودیت‌های پلتفرم | بررسی انطباق SLA  |
| PRM-301 | معیارهای تکمیل             | تعیین وضعیت نهایی |

---

## 7. Variables

| متغیر                 | نوع    | اجباری | توضیح                  | اعتبارسنجی  |
| --------------------- | ------ | ------ | ---------------------- | ----------- |
| `verification_report` | VAR-06 | بله    | گزارش تأیید از PRM-307 | —           |
| `sla_threshold`       | VAR-04 | خیر    | آستانه SLA (دقیقه)     | default: 60 |

---

## 8. Constraints

| ID     | محدودیت                                     |
| ------ | ------------------------------------------- |
| CST-01 | همه پلتفرم‌های Primary باید تأیید شده باشند |
| CST-02 | SLA انتشار نباید نقض شده باشد               |
| CST-03 | وضعیت نهایی باید در PRM-301 ثبت شود         |

---

## 9. Input Contract

| ورودی                 | نوع    | منبع    | اجباری |
| --------------------- | ------ | ------- | ------ |
| `verification_report` | object | PRM-307 | بله    |
| `sla_threshold`       | number | AI-008  | خیر    |

---

## 10. Output Contract

| خروجی                     | نوع    | توضیح                                                   |
| ------------------------- | ------ | ------------------------------------------------------- |
| `distribution_status`     | string | وضعیت نهایی (distribution_completed / partial / failed) |
| `distribution_report`     | object | گزارش کامل توزیع                                        |
| `platform_status_summary` | object | خلاصه وضعیت به ازای پلتفرم                              |
| `sla_compliance`          | object | وضعیت انطباق با SLA                                     |
| `downstream_package`      | object | بسته تحویلی برای Agentهای پساانتشار                     |
| `completion_timestamp`    | string | برچسب زمانی تکمیل توزیع                                 |

---

## 11. Validation Rules

| ID     | قاعده                            | سطح    | نقض     |
| ------ | -------------------------------- | ------ | ------- |
| VAL-01 | همه پلتفرم‌های Primary تأیید شده | معماری | عدم ثبت |
| VAL-02 | SLA رعایت شده                    | معماری | عدم ثبت |
| VAL-03 | downstream_package کامل          | معماری | هشدار   |
| VAL-04 | وضعیت نهایی ثبت شده در PRM-301   | معماری | هشدار   |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                     | مسئول               |
| ----- | ----------------- | ------------------------- | ------------------- |
| QG-01 | Draft → Review    | هویت کامل, input معتبر    | خودکار              |
| QG-02 | Review → Approved | معیارهای SLA مشخص         | Operations Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3) | Registry Keeper     |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                              |
| ------- | ------------------- | ------ | --------------------------------- |
| PRM-307 | DEP-01 (Requires)   | ^1.0.0 | گزارش تأیید برای اعتبارسنجی نهایی |
| PRM-301 | DEP-03 (References) | ^1.0.0 | معیارهای تکمیل و SLA              |
| PLAT-\* | DEP-03 (References) | ^1.0.0 | SLAها و محدودیت‌های پلتفرم        |

---

## 14. Human Override

| سناریو                        | اقدام                                                   |
| ----------------------------- | ------------------------------------------------------- |
| distribution_status = partial | Escalation به Operations Lead + فهرست پلتفرم‌های ناموفق |
| SLA violation                 | ثبت نقض SLA + Escalation به Operations Lead             |

---

## 15. Governance Notes

| ID     | یادداشت                                                      |
| ------ | ------------------------------------------------------------ |
| GOV-01 | A-3 (Strategic) — نیازمند ADR برای وضعیت نهایی               |
| GOV-02 | downstream_package برای AI-009, AI-010, AI-011 الزامی است    |
| GOV-03 | این پرامپت آخرین گام OPS-PUB و دروازه Agentهای پساانتشار است |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-308",
  "name": "Distribution Completion Validation",
  "family": "FAM-OPS",
  "subfamily": "OPS-PUB",
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
    { "type": "CTX-04", "source": "PRM-307", "required": true },
    { "type": "CTX-02", "source": "PRM-301", "required": true },
    { "type": "CTX-02", "source": "PLAT-*", "required": true }
  ],
  "max_tokens": 4000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "verification_report", "type": "VAR-06", "required": true },
    { "id": "sla_threshold", "type": "VAR-04", "required": false, "default": 60 }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["verification_report"],
    "optional": ["sla_threshold"]
  },
  "output": {
    "required": [
      "distribution_status",
      "distribution_report",
      "sla_compliance",
      "completion_timestamp"
    ],
    "optional": ["platform_status_summary", "downstream_package"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "All Primary platforms verified", "severity": "error" },
    { "id": "VAL-02", "description": "SLA not violated", "severity": "error" },
    { "id": "VAL-03", "description": "Downstream package complete", "severity": "warning" },
    { "id": "VAL-04", "description": "Final status registered in PRM-301", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-008", "AI-009", "AI-010", "AI-011"],
  "dependencies": ["PRM-307"],
  "documentation_refs": ["PRM-301", "PLAT-*"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                                | توسط        |
| ----------- | ---------- | ------------------------------------ | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — اعتبارسنجی تکمیل توزیع | معمار سیستم |
