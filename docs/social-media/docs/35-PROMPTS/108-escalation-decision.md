# Escalation Decision — تصمیم ارجاع

> **شناسه:** PRM-314
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Community Manager
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-313](./106-moderation-validation.md), [BRD-001](../22-BRAND/10-brand-identity.md), [ARCH-030](../00-ARCHITECTURE/30-governance-architecture.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار               |
| ------------------ | ------------------- |
| **id**             | PRM-314             |
| **name_fa**        | تصمیم ارجاع         |
| **name_en**        | Escalation Decision |
| **family**         | FAM-OPS             |
| **subfamily**      | OPS-CMG             |
| **type**           | PT-07               |
| **complexity**     | C-3                 |
| **authority**      | A-3                 |
| **owner**          | Community Manager   |
| **version**        | 1.0.0-draft         |
| **status**         | draft               |
| **security_level** | SL-02               |

---

## 2. Purpose

PRM-314 تصمیم ارجاع موارد بحرانی یا نیازمند مداخله انسانی را تعریف می‌کند. این پرامپت با تحلیل شدت موضوع، سطح خطر برند، نوع تعامل و سابقه کاربر، تصمیم می‌گیرد که آیا و به چه کسی ارجاع شود.

### اصول ارجاع

| ID    | اصل                                          |
| ----- | -------------------------------------------- |
| ED-01 | ارجاع باید متناسب با شدت و حساسیت موضوع باشد |
| ED-02 | سطح خطر برند تعیین‌کننده مسیر ارجاع است      |
| ED-03 | ارجاع باید شامل زمینه کامل تعامل باشد        |
| ED-04 | تصمیم ارجاع باید قابل ممیزی باشد             |

---

## 3. Scope

### Inside Scope

| حوزه       | توضیح                                                                 |
| ---------- | --------------------------------------------------------------------- |
| تحلیل شدت  | تعیین شدت موضوع بر اساس محتوا و زمینه                                 |
| سطح خطر    | محاسبه ریسک برند                                                      |
| تعیین مسیر | انتخاب دریافت‌کننده ارجاع (Community Manager / Brand Manager / Legal) |
| بسته ارجاع | مونتاژ اطلاعات کامل برای ارجاع                                        |

### Outside Scope

| حوزه                | دلیل         |
| ------------------- | ------------ |
| مدیتیشن             | حوزه PRM-313 |
| اعتبارسنجی تعامل    | حوزه PRM-315 |
| Incident Assessment | حوزه PRM-318 |

---

## 4. Consumers

| مصرف‌کننده            | نقش                      | نوع مصرف |
| --------------------- | ------------------------ | -------- |
| AI-009 (Community)    | تصمیم ارجاع موارد بحرانی | Chain    |
| AI-014 (Orchestrator) | هماهنگی ارجاع بین‌Agent  | System   |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-313 Output",
        "scope": ["moderation-result", "moderation-status"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "BRD-001",
        "scope": ["brand-crisis-levels", "risk-thresholds"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "ARCH-030",
        "scope": ["escalation-paths", "decision-authority"],
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

## 6. Required Knowledge

| منبع     | دامنه                  | کاربرد            |
| -------- | ---------------------- | ----------------- |
| BRD-001  | سطوح بحران برند        | تعیین شدت ارجاع   |
| ARCH-030 | مسیرهای ارجاع و اختیار | انتخاب مسیر ارجاع |

---

## 7. Variables

| متغیر                  | نوع    | اجباری | توضیح                       | اعتبارسنجی  |
| ---------------------- | ------ | ------ | --------------------------- | ----------- |
| `moderation_result`    | VAR-06 | بله    | نتیجه مدیتیشن از PRM-313    | —           |
| `author_history`       | VAR-06 | خیر    | سابقه کاربر در تعاملات قبلی | —           |
| `brand_risk_threshold` | VAR-04 | خیر    | آستانه ریسک برند            | default: 70 |

---

## 8. Constraints

| ID     | محدودیت                               |
| ------ | ------------------------------------- |
| CST-01 | ارجاع باید شامل زمینه کامل تعامل باشد |
| CST-02 | سطح خطر ≥ ۷۰ نیازمند ارجاع فوری       |
| CST-03 | هر ارجاع باید مسیر مشخص داشته باشد    |

---

## 9. Input Contract

| ورودی                  | نوع    | منبع    | اجباری |
| ---------------------- | ------ | ------- | ------ |
| `moderation_result`    | object | PRM-313 | بله    |
| `author_history`       | array  | AI-009  | خیر    |
| `brand_risk_threshold` | number | AI-009  | خیر    |

---

## 10. Output Contract

| خروجی                 | نوع     | توضیح               |
| --------------------- | ------- | ------------------- |
| `escalation_decision` | object  | تصمیم ارجاع         |
| `escalation_required` | boolean | آیا ارجاع لازم است  |
| `escalation_target`   | string  | دریافت‌کننده ارجاع  |
| `escalation_reason`   | string  | دلیل ارجاع          |
| `escalation_package`  | object  | بسته اطلاعاتی ارجاع |
| `risk_score`          | number  | امتیاز ریسک (۰–۱۰۰) |

---

## 11. Validation Rules

| ID     | قاعده                               | سطح    | نقض     |
| ------ | ----------------------------------- | ------ | ------- |
| VAL-01 | ارجاع شامل زمینه کامل               | معماری | عدم ثبت |
| VAL-02 | risk_score ≥ threshold → escalation | معماری | عدم ثبت |
| VAL-03 | escalation_target مشخص              | معماری | عدم ثبت |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                     | مسئول               |
| ----- | ----------------- | ------------------------- | ------------------- |
| QG-01 | Draft → Review    | هویت کامل, input معتبر    | خودکار              |
| QG-02 | Review → Approved | مسیرهای ارجاع کامل        | Governance Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3) | Registry Keeper     |

---

## 13. Dependencies

| شناسه    | نوع                 | نسخه   | دلیل                           |
| -------- | ------------------- | ------ | ------------------------------ |
| PRM-313  | DEP-01 (Requires)   | ^1.0.0 | نتیجه مدیتیشن برای تصمیم ارجاع |
| BRD-001  | DEP-03 (References) | ^1.0.0 | سطوح بحران برند                |
| ARCH-030 | DEP-03 (References) | ^1.0.0 | مسیرهای ارجاع                  |

---

## 14. Human Override

| سناریو                              | اقدام                                   |
| ----------------------------------- | --------------------------------------- |
| escalation_required اما مسیر نامشخص | Escalation به Operations Lead           |
| False escalation                    | ثبت false positive + به‌روزرسانی آستانه |

---

## 15. Governance Notes

| ID     | یادداشت                                          |
| ------ | ------------------------------------------------ |
| GOV-01 | A-3 (Strategic) — نیازمند ADR برای مسیرهای ارجاع |
| GOV-02 | ارجاع‌های Legal نیازمند رعایت حریم خصوصی         |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-314",
  "name": "Escalation Decision",
  "family": "FAM-OPS",
  "subfamily": "OPS-CMG",
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
    { "type": "CTX-04", "source": "PRM-313", "required": true },
    { "type": "CTX-02", "source": "BRD-001", "required": true },
    { "type": "CTX-02", "source": "ARCH-030", "required": false }
  ],
  "max_tokens": 4000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "moderation_result", "type": "VAR-06", "required": true },
    { "id": "author_history", "type": "VAR-06", "required": false },
    { "id": "brand_risk_threshold", "type": "VAR-04", "required": false, "default": 70 }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["moderation_result"],
    "optional": ["author_history", "brand_risk_threshold"]
  },
  "output": {
    "required": ["escalation_decision", "escalation_required", "escalation_target", "risk_score"],
    "optional": ["escalation_reason", "escalation_package"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Escalation includes full context", "severity": "error" },
    {
      "id": "VAL-02",
      "description": "Risk score >= threshold triggers escalation",
      "severity": "error"
    },
    { "id": "VAL-03", "description": "Escalation target specified", "severity": "error" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-009", "AI-014"],
  "dependencies": ["PRM-313"],
  "documentation_refs": ["BRD-001", "ARCH-030"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                     | توسط        |
| ----------- | ---------- | ------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — تصمیم ارجاع | معمار سیستم |
