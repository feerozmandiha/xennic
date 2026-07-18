# Community Interaction Validation — اعتبارسنجی تعامل اجتماعی

> **شناسه:** PRM-315
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Community Manager
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-314](./108-escalation-decision.md), [BRD-002](../22-BRAND/20-brand-voice.md), [PLAT-\*](../20-PLATFORMS/)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                            |
| ------------------ | -------------------------------- |
| **id**             | PRM-315                          |
| **name_fa**        | اعتبارسنجی تعامل اجتماعی         |
| **name_en**        | Community Interaction Validation |
| **family**         | FAM-OPS                          |
| **subfamily**      | OPS-CMG                          |
| **type**           | PT-06                            |
| **complexity**     | C-2                              |
| **authority**      | A-2                              |
| **owner**          | Community Manager                |
| **version**        | 1.0.0-draft                      |
| **status**         | draft                            |
| **security_level** | SL-01                            |

---

## 2. Purpose

PRM-315 اعتبارسنجی نهایی تعامل اجتماعی پیش از ثبت و تحویل به Agentهای پساتعامل را انجام می‌دهد. این پرامپت یکپارچگی زنجیره تعامل، انطباق با برند و کیفیت پاسخ نهایی را تأیید می‌کند.

### اصول اعتبارسنجی تعامل

| ID    | اصل                                                                                        |
| ----- | ------------------------------------------------------------------------------------------ |
| IV-01 | هر تعامل باید دارای زنجیره کامل comment → strategy → response → moderation → decision باشد |
| IV-02 | پاسخ نهایی باید با برند و استراتژی همخوان باشد                                             |
| IV-03 | تعاملات ثبت‌شده باید قابل ممیزی باشند                                                      |
| IV-04 | کیفیت تعامل باید حداقل آستانه را داشته باشد                                                |

---

## 3. Scope

### Inside Scope

| حوزه            | توضیح                                     |
| --------------- | ----------------------------------------- |
| یکپارچگی زنجیره | بررسی کامل بودن زنجیره تعامل              |
| انطباق نهایی    | تأیید نهایی انطباق با برند                |
| کیفیت تعامل     | محاسبه امتیاز کیفیت                       |
| ثبت تعامل       | آماده‌سازی برای تحویل به Agent downstream |

### Outside Scope

| حوزه          | دلیل         |
| ------------- | ------------ |
| تحلیل احساسات | حوزه PRM-316 |
| تداوم مکالمه  | حوزه PRM-317 |
| Handoff       | حوزه PRM-319 |

---

## 4. Consumers

| مصرف‌کننده         | نقش                    | نوع مصرف |
| ------------------ | ---------------------- | -------- |
| AI-009 (Community) | اعتبارسنجی نهایی تعامل | Chain    |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-314 Output",
        "scope": ["escalation-decision", "escalation-package"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "BRD-002",
        "scope": ["voice-rules", "quality-standards"],
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

## 6. Required Knowledge

| منبع    | دامنه                   | کاربرد            |
| ------- | ----------------------- | ----------------- |
| BRD-002 | استانداردهای کیفیت برند | تأیید کیفیت نهایی |

---

## 7. Variables

| متغیر               | نوع    | اجباری | توضیح             | اعتبارسنجی  |
| ------------------- | ------ | ------ | ----------------- | ----------- |
| `interaction_chain` | VAR-06 | بله    | زنجیره کامل تعامل | —           |
| `quality_threshold` | VAR-04 | خیر    | آستانه کیفیت      | default: 70 |

---

## 8. Constraints

| ID     | محدودیت                     |
| ------ | --------------------------- |
| CST-01 | زنجیره تعامل باید کامل باشد |
| CST-02 | امتیاز کیفیت ≥ آستانه       |
| CST-03 | تعامل باید قابل ممیزی باشد  |

---

## 9. Input Contract

| ورودی               | نوع    | منبع         | اجباری |
| ------------------- | ------ | ------------ | ------ |
| `interaction_chain` | array  | PRM-310..314 | بله    |
| `quality_threshold` | number | AI-009       | خیر    |

---

## 10. Output Contract

| خروجی                       | نوع    | توضیح                             |
| --------------------------- | ------ | --------------------------------- |
| `validation_result`         | string | نتیجه (valid/incomplete/rejected) |
| `chain_completeness`        | number | درصد کامل بودن زنجیره (۰–۱۰۰)     |
| `brand_compliance_score`    | number | امتیاز انطباق با برند (۰–۱۰۰)     |
| `interaction_quality_score` | number | امتیاز کیفیت تعامل (۰–۱۰۰)        |
| `interaction_record`        | object | رکورد نهایی تعامل برای تحویل      |

---

## 11. Validation Rules

| ID     | قاعده                                 | سطح    | نقض     |
| ------ | ------------------------------------- | ------ | ------- |
| VAL-01 | chain_completeness = ۱۰۰٪             | معماری | عدم ثبت |
| VAL-02 | interaction_quality_score ≥ threshold | معماری | هشدار   |
| VAL-03 | brand_compliance_score ≥ ۸۰           | برند   | هشدار   |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                  | مسئول              |
| ----- | ----------------- | ---------------------- | ------------------ |
| QG-01 | Draft → Review    | هویت کامل, input معتبر | خودکار             |
| QG-02 | Review → Approved | معیارهای کیفیت مشخص    | Community Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001         | Registry Keeper    |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                              |
| ------- | ------------------- | ------ | --------------------------------- |
| PRM-314 | DEP-01 (Requires)   | ^1.0.0 | تصمیم ارجاع برای اعتبارسنجی نهایی |
| BRD-002 | DEP-03 (References) | ^1.0.0 | استانداردهای کیفیت برند           |

---

## 14. Human Override

| سناریو                      | اقدام                        |
| --------------------------- | ---------------------------- |
| chain_completeness < ۱۰۰٪   | Escalation برای تکمیل زنجیره |
| brand_compliance_score < ۸۰ | Escalation به Brand Manager  |

---

## 15. Governance Notes

| ID     | یادداشت                                          |
| ------ | ------------------------------------------------ |
| GOV-01 | A-2 (Tactical) — نیازمند تأیید Community Manager |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-315",
  "name": "Community Interaction Validation",
  "family": "FAM-OPS",
  "subfamily": "OPS-CMG",
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
    { "type": "CTX-04", "source": "PRM-314", "required": true },
    { "type": "CTX-02", "source": "BRD-002", "required": true }
  ],
  "max_tokens": 3000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "interaction_chain", "type": "VAR-06", "required": true },
    { "id": "quality_threshold", "type": "VAR-04", "required": false, "default": 70 }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["interaction_chain"],
    "optional": ["quality_threshold"]
  },
  "output": {
    "required": ["validation_result", "chain_completeness", "interaction_quality_score"],
    "optional": ["brand_compliance_score", "interaction_record"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Chain completeness = 100%", "severity": "error" },
    { "id": "VAL-02", "description": "Interaction quality >= threshold", "severity": "warning" },
    { "id": "VAL-03", "description": "Brand compliance score >= 80", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-01",
  "consumers": ["AI-009"],
  "dependencies": ["PRM-314"],
  "documentation_refs": ["BRD-002"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                                  | توسط        |
| ----------- | ---------- | -------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — اعتبارسنجی تعامل اجتماعی | معمار سیستم |
