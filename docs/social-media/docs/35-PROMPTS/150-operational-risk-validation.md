# Operational Risk Validation — اعتبارسنجی ریسک عملیاتی

> **شناسه:** PRM-335
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Operations Lead
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-334](./148-service-degradation-evaluation.md), [ARCH-030](../00-ARCHITECTURE/30-governance-architecture.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                       |
| ------------------ | --------------------------- |
| **id**             | PRM-335                     |
| **name_fa**        | اعتبارسنجی ریسک عملیاتی     |
| **name_en**        | Operational Risk Validation |
| **family**         | FAM-OPS                     |
| **subfamily**      | OPS-MON                     |
| **type**           | PT-06                       |
| **complexity**     | C-3                         |
| **authority**      | A-3                         |
| **owner**          | Operations Lead             |
| **version**        | 1.0.0-draft                 |
| **status**         | draft                       |
| **security_level** | SL-03                       |

---

## 2. Purpose

PRM-335 ریسک‌های عملیاتی ناشی از تخریب سرویس و الگوهای رویداد را اعتبارسنجی می‌کند. این پرامپت احتمال وقوع، شدت تأثیر و اولویت رسیدگی به هر ریسک را تعیین می‌کند.

### اصول اعتبارسنجی

| ID    | اصل                                      |
| ----- | ---------------------------------------- |
| OR-01 | ریسک بر اساس احتمال و تأثیر محاسبه شود   |
| OR-02 | ریسک‌های بحرانی نیازمند اقدام فوری هستند |
| OR-03 | ماتریس ریسک با ARCH-030 همخوان باشد      |

---

## 3. Scope

### Inside Scope

| حوزه             | توضیح                            |
| ---------------- | -------------------------------- |
| شناسایی ریسک     | استخراج ریسک از تخریب و رویدادها |
| امتیاز ریسک      | محاسبه احتمال × تأثیر            |
| اولویت‌بندی ریسک | تعیین ترتیب رسیدگی               |

### Outside Scope

| حوزه              | دلیل         |
| ----------------- | ------------ |
| سازگاری نظارت     | حوزه PRM-336 |
| خلاصه هوش عملیاتی | حوزه PRM-337 |

---

## 4. Consumers

| مصرف‌کننده         | نقش             | نوع مصرف |
| ------------------ | --------------- | -------- |
| AI-010 (Analytics) | اعتبارسنجی ریسک | Chain    |
| AI-004 (Review)    | تأیید ریسک      | Quality  |

---

## 5. Inputs

| ورودی                  | نوع    | منبع    | اجباری |
| ---------------------- | ------ | ------- | ------ |
| `degradation_level`    | string | PRM-334 | بله    |
| `platform_impact`      | object | PRM-334 | بله    |
| `correlated_incidents` | array  | PRM-332 | خیر    |

---

## 6. Outputs

| خروجی                      | نوع     | توضیح                   |
| -------------------------- | ------- | ----------------------- |
| `risk_assessment`          | object  | ارزیابی ریسک کامل       |
| `risk_score`               | number  | امتیاز ریسک کلی (۰–۱۰۰) |
| `risk_matrix`              | object  | ماتریس احتمال/تأثیر     |
| `critical_risks`           | array   | ریسک‌های بحرانی         |
| `risk_validation_complete` | boolean | وضعیت تکمیل             |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-334 Output",
        "scope": ["degradation-level", "platform-impact"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-04",
        "source": "PRM-332 Output",
        "scope": ["correlated-incidents", "pattern-insights"],
        "injection": "prepend",
        "required": false
      },
      {
        "type": "CTX-02",
        "source": "ARCH-030",
        "scope": ["risk-framework", "risk-matrix"],
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

## 8. Knowledge Requirements

| منبع     | دامنه                | کاربرد         |
| -------- | -------------------- | -------------- |
| ARCH-030 | چارچوب ریسک و ماتریس | انطباق ارزیابی |

---

## 9. Prompt Structure

PRM-335 ششمین گام زنجیره OPS-MON. ریسک عملیاتی را از تخریب سرویس اعتبارسنجی می‌کند.

```
PRM-334 → degradation_level → PRM-335 → risk_score → PRM-336
```

---

## 10. Variable Definitions

| متغیر               | نوع    | اجباری | توضیح                | اعتبارسنجی |
| ------------------- | ------ | ------ | -------------------- | ---------- |
| `degradation_level` | VAR-02 | بله    | سطح تخریب از PRM-334 | —          |
| `platform_impact`   | VAR-06 | بله    | تأثیر پلتفرمی        | —          |

---

## 11. Execution Constraints

| ID     | محدودیت                             |
| ------ | ----------------------------------- |
| CST-01 | risk_score = probability × impact   |
| CST-02 | ماتریس ریسک با ARCH-030 همخوان باشد |

---

## 12. Validation Rules

| ID     | قاعده                        | سطح    | نقض     |
| ------ | ---------------------------- | ------ | ------- |
| VAL-01 | risk_score در بازه ۰–۱۰۰     | معماری | عدم ثبت |
| VAL-02 | ریسک‌های بحرانی شناسایی شوند | معماری | عدم ثبت |

---

## 13. Failure Conditions

| شرط                | اقدام                              |
| ------------------ | ---------------------------------- |
| critical_risks > ۰ | Escalation فوری به Operations Lead |
| risk_score ≥ ۸۰    | مسدود — Escalation با مستندات      |

---

## 14. Quality Gates

| گیت   | مکان              | معیار                     | مسئول           |
| ----- | ----------------- | ------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل, input معتبر    | خودکار          |
| QG-02 | Review → Approved | ریسک‌ها شناسایی‌شده       | Operations Lead |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3) | Registry Keeper |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                                 | توسط        |
| ----------- | ---------- | ------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — اعتبارسنجی ریسک عملیاتی | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-335",
  "name": "Operational Risk Validation",
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
    { "type": "CTX-04", "source": "PRM-334", "required": true },
    { "type": "CTX-04", "source": "PRM-332", "required": false },
    { "type": "CTX-02", "source": "ARCH-030", "required": true }
  ],
  "max_tokens": 4000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "degradation_level", "type": "VAR-02", "required": true },
    { "id": "platform_impact", "type": "VAR-06", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["degradation_level", "platform_impact"],
    "optional": ["correlated_incidents"]
  },
  "output": {
    "required": ["risk_assessment", "risk_score", "risk_validation_complete"],
    "optional": ["risk_matrix", "critical_risks"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Risk score in range 0-100", "severity": "error" },
    { "id": "VAL-02", "description": "Critical risks identified", "severity": "error" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-03",
  "consumers": ["AI-010", "AI-004"],
  "dependencies": ["PRM-334"],
  "documentation_refs": ["ARCH-030"]
}
```
