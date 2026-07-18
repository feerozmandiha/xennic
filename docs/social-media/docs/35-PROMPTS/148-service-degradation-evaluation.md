# Service Degradation Evaluation — ارزیابی تخریب سرویس

> **شناسه:** PRM-334
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Operations Lead
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-333](./146-operational-health-assessment.md), [PLAT-\*](../20-PLATFORMS/)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                          |
| ------------------ | ------------------------------ |
| **id**             | PRM-334                        |
| **name_fa**        | ارزیابی تخریب سرویس            |
| **name_en**        | Service Degradation Evaluation |
| **family**         | FAM-OPS                        |
| **subfamily**      | OPS-MON                        |
| **type**           | PT-06                          |
| **complexity**     | C-2                            |
| **authority**      | A-2                            |
| **owner**          | Operations Lead                |
| **version**        | 1.0.0-draft                    |
| **status**         | draft                          |
| **security_level** | SL-02                          |

---

## 2. Purpose

PRM-334 تخریب سرویس در پلتفرم‌های اجتماعی را بر اساس شاخص‌های سلامت و رویدادهای همبسته ارزیابی می‌کند. سطح تخریب، مدت و تأثیر بر هر پلتفرم را تعیین می‌کند.

### اصول ارزیابی

| ID    | اصل                                            |
| ----- | ---------------------------------------------- |
| SD-01 | تخریب بر اساس انحراف از آستانه سلامت تعریف شود |
| SD-02 | تأثیر تخریب به تفکیک پلتفرم اندازه‌گیری شود    |
| SD-03 | مدت تخریب مستند شود                            |

---

## 3. Scope

### Inside Scope

| حوزه          | توضیح                        |
| ------------- | ---------------------------- |
| سطح تخریب     | none, minor, major, critical |
| مدت تخریب     | بازه زمانی تخریب             |
| تأثیر پلتفرمی | تفکیک به ازای هر پلتفرم      |

### Outside Scope

| حوزه             | دلیل         |
| ---------------- | ------------ |
| ریسک عملیاتی     | حوزه PRM-335 |
| اعتبارسنجی نظارت | حوزه PRM-336 |

---

## 4. Consumers

| مصرف‌کننده         | نقش           | نوع مصرف |
| ------------------ | ------------- | -------- |
| AI-010 (Analytics) | ارزیابی تخریب | Chain    |
| AI-004 (Review)    | تأیید ارزیابی | Quality  |

---

## 5. Inputs

| ورودی               | نوع    | منبع    | اجباری |
| ------------------- | ------ | ------- | ------ |
| `health_score`      | number | PRM-333 | بله    |
| `health_indicators` | object | PRM-333 | بله    |

---

## 6. Outputs

| خروجی                             | نوع     | توضیح                 |
| --------------------------------- | ------- | --------------------- |
| `degradation_level`               | string  | سطح تخریب             |
| `degradation_duration`            | string  | مدت تخریب             |
| `platform_impact`                 | object  | تأثیر به تفکیک پلتفرم |
| `degradation_assessment_complete` | boolean | وضعیت تکمیل           |

---

## 7. Context Requirements

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-333 Output",
        "scope": ["health-score", "health-indicators", "health-trend"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-05",
        "source": "PLAT-*",
        "scope": ["platform-sla", "degradation-thresholds"],
        "injection": "append",
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

| منبع    | دامنه                  | کاربرد          |
| ------- | ---------------------- | --------------- |
| PLAT-\* | آستانه‌های تخریب و SLA | تعیین سطح تخریب |

---

## 9. Prompt Structure

PRM-334 پنجمین گام زنجیره OPS-MON. تخریب سرویس را از شاخص‌های سلامت ارزیابی می‌کند.

```
PRM-333 → health_score → PRM-334 → degradation_level → PRM-335
```

---

## 10. Variable Definitions

| متغیر               | نوع    | اجباری | توضیح                   | اعتبارسنجی   |
| ------------------- | ------ | ------ | ----------------------- | ------------ |
| `health_score`      | VAR-01 | بله    | امتیاز سلامت از PRM-333 | range: 0-100 |
| `health_indicators` | VAR-06 | بله    | شاخص‌های سلامت          | —            |

---

## 11. Execution Constraints

| ID     | محدودیت                                     |
| ------ | ------------------------------------------- |
| CST-01 | سطح تخریب با آستانه‌های PLAT-\* همخوان باشد |
| CST-02 | مدت تخریب تخمینی باشد                       |

---

## 12. Validation Rules

| ID     | قاعده                         | سطح    | نقض     |
| ------ | ----------------------------- | ------ | ------- |
| VAL-01 | سطح تخریب از مقادیر مجاز باشد | معماری | عدم ثبت |
| VAL-02 | تأثیر به تفکیک پلتفرم ثبت شود | معماری | هشدار   |

---

## 13. Failure Conditions

| شرط                     | اقدام                              |
| ----------------------- | ---------------------------------- |
| health_score موجود نیست | بازگشت error + Escalation          |
| تخریب بحرانی (critical) | Escalation فوری به Operations Lead |

---

## 14. Quality Gates

| گیت   | مکان              | معیار                     | مسئول           |
| ----- | ----------------- | ------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل, input معتبر    | خودکار          |
| QG-02 | Review → Approved | تخریب مستند               | Operations Lead |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-2) | Registry Keeper |

---

## 15. Version History

| نسخه        | تاریخ      | تغییر                             | توسط        |
| ----------- | ---------- | --------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — ارزیابی تخریب سرویس | معمار سیستم |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-334",
  "name": "Service Degradation Evaluation",
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
    { "type": "CTX-04", "source": "PRM-333", "required": true },
    { "type": "CTX-05", "source": "PLAT-*", "required": true }
  ],
  "max_tokens": 3000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "health_score", "type": "VAR-01", "required": true },
    { "id": "health_indicators", "type": "VAR-06", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["health_score", "health_indicators"],
    "optional": []
  },
  "output": {
    "required": ["degradation_level", "degradation_assessment_complete"],
    "optional": ["degradation_duration", "platform_impact"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Degradation level valid value", "severity": "error" },
    { "id": "VAL-02", "description": "Platform impact recorded", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-010", "AI-004"],
  "dependencies": ["PRM-333"],
  "documentation_refs": ["PLAT-*"]
}
```
