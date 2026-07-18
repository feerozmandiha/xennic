# Response Strategy Selection — انتخاب استراتژی پاسخ

> **شناسه:** PRM-311
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Community Manager
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-310](./100-comment-classification.md), [BRD-002](../22-BRAND/20-brand-voice.md), [BRD-001](../22-BRAND/10-brand-identity.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                       |
| ------------------ | --------------------------- |
| **id**             | PRM-311                     |
| **name_fa**        | انتخاب استراتژی پاسخ        |
| **name_en**        | Response Strategy Selection |
| **family**         | FAM-OPS                     |
| **subfamily**      | OPS-CMG                     |
| **type**           | PT-07                       |
| **complexity**     | C-3                         |
| **authority**      | A-3                         |
| **owner**          | Community Manager           |
| **version**        | 1.0.0-draft                 |
| **status**         | draft                       |
| **security_level** | SL-02                       |

---

## 2. Purpose

PRM-311 استراتژی پاسخ به هر نظر طبقه‌بندی‌شده را تعیین می‌کند. این پرامپت با تحلیل دسته نظر، لحن، زمینه و قواعد برند، بهترین رویکرد پاسخ (پاسخ مستقیم، پیگیری، ارجاع، حذف یا نادیده‌گرفتن) را انتخاب می‌کند.

### اصول انتخاب استراتژی

| ID    | اصل                                             |
| ----- | ----------------------------------------------- |
| RS-01 | استراتژی پاسخ با دسته و اولویت نظر تعیین می‌شود |
| RS-02 | پاسخ باید با صدای برند (BRD-002) همخوان باشد    |
| RS-03 | استراتژی‌های بحرانی نیازمند تأیید انسانی        |
| RS-04 | هر نظر حداقل یک استراتژی پاسخ دارد              |

---

## 3. Scope

### Inside Scope

| حوزه            | توضیح                               |
| --------------- | ----------------------------------- |
| تحلیل دسته      | تطبیق دسته نظر با استراتژی‌های ممکن |
| انتخاب استراتژی | تعیین بهترین رویکرد پاسخ            |
| هماهنگی برند    | تطبیق استراتژی با BRD-001, BRD-002  |
| سطح اختیار      | تعیین خودکار یا نیازمند تأیید       |

### Outside Scope

| حوزه               | دلیل         |
| ------------------ | ------------ |
| طبقه‌بندی نظر      | حوزه PRM-310 |
| تهیه پیش‌نویس پاسخ | حوزه PRM-312 |
| مدیتیشن            | حوزه PRM-313 |

---

## 4. Consumers

| مصرف‌کننده            | نقش                    | نوع مصرف |
| --------------------- | ---------------------- | -------- |
| AI-009 (Community)    | انتخاب استراتژی پاسخ   | Chain    |
| AI-014 (Orchestrator) | هماهنگی استراتژی تعامل | System   |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-310 Output",
        "scope": ["classified-comment", "primary-category", "sentiment-label"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "BRD-002",
        "scope": ["voice-rules", "response-guidelines"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "BRD-001",
        "scope": ["brand-values", "crisis-boundaries"],
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

| منبع    | دامنه                  | کاربرد                   |
| ------- | ---------------------- | ------------------------ |
| BRD-002 | قواعد پاسخ و صدای برند | تطبیق استراتژی با برند   |
| BRD-001 | مرزهای بحران برند      | تشخیص نیاز به Escalation |

---

## 7. Variables

| متغیر                | نوع    | اجباری | توضیح                         | اعتبارسنجی     |
| -------------------- | ------ | ------ | ----------------------------- | -------------- |
| `classified_comment` | VAR-06 | بله    | نظر طبقه‌بندی‌شده از PRM-310  | —              |
| `engagement_history` | VAR-06 | خیر    | تاریخچه تعامل با نویسنده نظر  | —              |
| `auto_respond`       | VAR-03 | خیر    | پاسخ خودکار بدون تأیید انسانی | default: false |

---

## 8. Constraints

| ID     | محدودیت                                           |
| ------ | ------------------------------------------------- |
| CST-01 | استراتژی پاسخ با دسته نظر همخوان باشد             |
| CST-02 | پاسخ‌های بحرانی (priority 1) نیازمند تأیید انسانی |
| CST-03 | استراتژی نباید با BRD-002 مغایرت داشته باشد       |

---

## 9. Input Contract

| ورودی                | نوع     | منبع    | اجباری |
| -------------------- | ------- | ------- | ------ |
| `classified_comment` | object  | PRM-310 | بله    |
| `engagement_history` | array   | AI-009  | خیر    |
| `auto_respond`       | boolean | AI-009  | خیر    |

---

## 10. Output Contract

| خروجی                   | نوع     | توضیح                                                          |
| ----------------------- | ------- | -------------------------------------------------------------- |
| `selected_strategy`     | string  | استراتژی انتخاب‌شده (respond/follow_up/escalate/ignore/remove) |
| `strategy_reasoning`    | string  | دلیل انتخاب استراتژی                                           |
| `required_approval`     | boolean | نیاز به تأیید انسانی                                           |
| `strategy_confidence`   | number  | اطمینان از استراتژی (۰–۱۰۰)                                    |
| `brand_alignment_check` | object  | نتیجه تطبیق با برند                                            |

---

## 11. Validation Rules

| ID     | قاعده                           | سطح    | نقض     |
| ------ | ------------------------------- | ------ | ------- |
| VAL-01 | استراتژی با دسته نظر همخوان     | معماری | عدم ثبت |
| VAL-02 | priority=۱ نیازمند تأیید انسانی | معماری | عدم ثبت |
| VAL-03 | brand_alignment مثبت            | برند   | هشدار   |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                     | مسئول           |
| ----- | ----------------- | ------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل, input معتبر    | خودکار          |
| QG-02 | Review → Approved | انطباق با BRD-002         | Brand Reviewer  |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3) | Registry Keeper |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                                   |
| ------- | ------------------- | ------ | -------------------------------------- |
| PRM-310 | DEP-01 (Requires)   | ^1.0.0 | نظر طبقه‌بندی‌شده برای انتخاب استراتژی |
| BRD-002 | DEP-03 (References) | ^1.0.0 | قواعد صدای برند                        |
| BRD-001 | DEP-03 (References) | ^1.0.0 | هویت برند برای مرزهای بحران            |

---

## 14. Human Override

| سناریو                         | اقدام                           |
| ------------------------------ | ------------------------------- |
| priority=۱ + auto_respond=true | Escalation به Community Manager |
| strategy_confidence < ۵۰       | بازبینی دستی استراتژی           |

---

## 15. Governance Notes

| ID     | یادداشت                                              |
| ------ | ---------------------------------------------------- |
| GOV-01 | A-3 (Strategic) — نیازمند ADR برای استراتژی‌های جدید |
| GOV-02 | تغییر در قواعد استراتژی نیازمند هماهنگی AI-014       |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-311",
  "name": "Response Strategy Selection",
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
    { "type": "CTX-04", "source": "PRM-310", "required": true },
    { "type": "CTX-02", "source": "BRD-002", "required": true },
    { "type": "CTX-02", "source": "BRD-001", "required": false }
  ],
  "max_tokens": 4000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "classified_comment", "type": "VAR-06", "required": true },
    { "id": "engagement_history", "type": "VAR-06", "required": false },
    { "id": "auto_respond", "type": "VAR-03", "required": false, "default": false }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["classified_comment"],
    "optional": ["engagement_history", "auto_respond"]
  },
  "output": {
    "required": ["selected_strategy", "strategy_reasoning", "required_approval"],
    "optional": ["strategy_confidence", "brand_alignment_check"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Strategy matches comment category", "severity": "error" },
    { "id": "VAL-02", "description": "Priority 1 requires human approval", "severity": "error" },
    { "id": "VAL-03", "description": "Brand alignment positive", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-009", "AI-014"],
  "dependencies": ["PRM-310"],
  "documentation_refs": ["BRD-002", "BRD-001"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                              | توسط        |
| ----------- | ---------- | ---------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — انتخاب استراتژی پاسخ | معمار سیستم |
