# Moderation Validation — اعتبارسنجی مدیتیشن

> **شناسه:** PRM-313
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Community Manager
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-312](./104-response-draft-preparation.md), [BRD-002](../22-BRAND/20-brand-voice.md), [PLAT-\*](../20-PLATFORMS/)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                 |
| ------------------ | --------------------- |
| **id**             | PRM-313               |
| **name_fa**        | اعتبارسنجی مدیتیشن    |
| **name_en**        | Moderation Validation |
| **family**         | FAM-OPS               |
| **subfamily**      | OPS-CMG               |
| **type**           | PT-06                 |
| **complexity**     | C-2                   |
| **authority**      | A-3                   |
| **owner**          | Community Manager     |
| **version**        | 1.0.0-draft           |
| **status**         | draft                 |
| **security_level** | SL-02                 |

---

## 2. Purpose

PRM-313 اعتبارسنجی مدیتیشن پیش‌نویس پاسخ و نظر اصلی را انجام می‌دهد. این پرامپت تضمین می‌کند که پاسخ از نظر محتوا، لحن و انطباق با قواعد پلتفرم و برند برای انتشار ایمن است.

### اصول مدیتیشن

| ID    | اصل                                                      |
| ----- | -------------------------------------------------------- |
| MV-01 | هر پیش‌نویس پاسخ قبل از انتشار باید اعتبارسنجی شود       |
| MV-02 | محتوای نامناسب (spam, hate speech, harassment) مسدود شود |
| MV-03 | انطباق با قواعد پلتفرم الزامی است                        |
| MV-04 | پاسخ‌های بحرانی نیازمند تأیید دوگانه هستند               |

---

## 3. Scope

### Inside Scope

| حوزه           | توضیح                              |
| -------------- | ---------------------------------- |
| بررسی محتوا    | تشخیص محتوای نامناسب در نظر و پاسخ |
| انطباق پلتفرم  | تطبیق با قواعد مدیتیشن پلتفرم      |
| انطباق برند    | بررسی عدم مغایرت با BRD-002        |
| امتیاز مدیتیشن | محاسبه امتیاز امنیت انتشار         |

### Outside Scope

| حوزه             | دلیل         |
| ---------------- | ------------ |
| استراتژی پاسخ    | حوزه PRM-311 |
| تهیه پیش‌نویس    | حوزه PRM-312 |
| تصمیم Escalation | حوزه PRM-314 |

---

## 4. Consumers

| مصرف‌کننده         | نقش                | نوع مصرف   |
| ------------------ | ------------------ | ---------- |
| AI-009 (Community) | اعتبارسنجی مدیتیشن | Chain      |
| AI-004 (Review)    | تأیید انطباق محتوا | Validation |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-312 Output",
        "scope": ["response-draft", "response-tone"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-05",
        "source": "PLAT-*",
        "scope": ["moderation-rules", "content-policies"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "BRD-002",
        "scope": ["prohibited-content", "voice-boundaries"],
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

| منبع    | دامنه                | کاربرد        |
| ------- | -------------------- | ------------- |
| PLAT-\* | قواعد مدیتیشن پلتفرم | بررسی انطباق  |
| BRD-002 | مرزهای محتوایی برند  | محتوای ممنوعه |

---

## 7. Variables

| متغیر                   | نوع    | اجباری | توضیح                   | اعتبارسنجی    |
| ----------------------- | ------ | ------ | ----------------------- | ------------- |
| `response_draft`        | VAR-01 | بله    | پیش‌نویس پاسخ           | —             |
| `platform_policy_check` | VAR-03 | خیر    | بررسی دقیق قواعد پلتفرم | default: true |

---

## 8. Constraints

| ID     | محدودیت                                       |
| ------ | --------------------------------------------- |
| CST-01 | هرگونه محتوای نامناسب مسدود می‌شود            |
| CST-02 | پاسخ باید با قواعد مدیتیشن پلتفرم همخوان باشد |
| CST-03 | محتوای بحرانی نیازمند تأیید AI-004 است        |

---

## 9. Input Contract

| ورودی                   | نوع     | منبع    | اجباری |
| ----------------------- | ------- | ------- | ------ |
| `response_draft`        | string  | PRM-312 | بله    |
| `platform_policy_check` | boolean | AI-009  | خیر    |

---

## 10. Output Contract

| خروجی               | نوع     | توضیح                             |
| ------------------- | ------- | --------------------------------- |
| `moderation_result` | object  | نتیجه مدیتیشن                     |
| `moderation_status` | string  | وضعیت (approved/flagged/rejected) |
| `flagged_reasons`   | array   | دلایل پرچم‌گذاری                  |
| `moderation_score`  | number  | امتیاز مدیتیشن (۰–۱۰۰)            |
| `review_required`   | boolean | نیاز به بازبینی انسانی            |

---

## 11. Validation Rules

| ID     | قاعده                  | سطح    | نقض     |
| ------ | ---------------------- | ------ | ------- |
| VAL-01 | محتوای نامناسب مسدود   | معماری | عدم ثبت |
| VAL-02 | انطباق با قواعد پلتفرم | معماری | عدم ثبت |
| VAL-03 | moderation_score ≥ ۷۰  | معماری | هشدار   |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                     | مسئول              |
| ----- | ----------------- | ------------------------- | ------------------ |
| QG-01 | Draft → Review    | هویت کامل, input معتبر    | خودکار             |
| QG-02 | Review → Approved | قواعد مدیتیشن جامع        | Community Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3) | Registry Keeper    |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                       |
| ------- | ------------------- | ------ | -------------------------- |
| PRM-312 | DEP-01 (Requires)   | ^1.0.0 | پیش‌نویس پاسخ برای مدیتیشن |
| PLAT-\* | DEP-03 (References) | ^1.0.0 | قواعد مدیتیشن پلتفرم       |
| BRD-002 | DEP-03 (References) | ^1.0.0 | مرزهای محتوایی برند        |

---

## 14. Human Override

| سناریو                              | اقدام                                           |
| ----------------------------------- | ----------------------------------------------- |
| review_required = true              | Escalation به Community Manager برای بررسی دستی |
| False positive (قانونی ولی flagged) | override + ثبت در Knowledge                     |

---

## 15. Governance Notes

| ID     | یادداشت                                          |
| ------ | ------------------------------------------------ |
| GOV-01 | A-3 (Strategic) — نیازمند ADR برای قواعد مدیتیشن |
| GOV-02 | تغییر قواعد پلتفرم نیازمند به‌روزرسانی PLAT-\*   |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-313",
  "name": "Moderation Validation",
  "family": "FAM-OPS",
  "subfamily": "OPS-CMG",
  "type": "PT-06",
  "complexity": "C-2",
  "authority": "A-3",
  "version": "1.0.0-draft",
  "status": "draft"
}
```

### Block 2 — Context

```json
{
  "sources": [
    { "type": "CTX-04", "source": "PRM-312", "required": true },
    { "type": "CTX-05", "source": "PLAT-*", "required": true },
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
    { "id": "response_draft", "type": "VAR-01", "required": true },
    { "id": "platform_policy_check", "type": "VAR-03", "required": false, "default": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["response_draft"],
    "optional": ["platform_policy_check"]
  },
  "output": {
    "required": ["moderation_result", "moderation_status", "moderation_score"],
    "optional": ["flagged_reasons", "review_required"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Inappropriate content blocked", "severity": "error" },
    { "id": "VAL-02", "description": "Conforms to platform moderation rules", "severity": "error" },
    { "id": "VAL-03", "description": "Moderation score >= 70", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-009", "AI-004"],
  "dependencies": ["PRM-312"],
  "documentation_refs": ["PLAT-*", "BRD-002"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                            | توسط        |
| ----------- | ---------- | -------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — اعتبارسنجی مدیتیشن | معمار سیستم |
