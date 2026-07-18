# Comment Classification — طبقه‌بندی نظر

> **شناسه:** PRM-310
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Community Manager
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-301](./30-publishing-instruction.md), [BRD-002](../22-BRAND/20-brand-voice.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                  |
| ------------------ | ---------------------- |
| **id**             | PRM-310                |
| **name_fa**        | طبقه‌بندی نظر          |
| **name_en**        | Comment Classification |
| **family**         | FAM-OPS                |
| **subfamily**      | OPS-CMG                |
| **type**           | PT-04                  |
| **complexity**     | C-2                    |
| **authority**      | A-2                    |
| **owner**          | Community Manager      |
| **version**        | 1.0.0-draft            |
| **status**         | draft                  |
| **security_level** | SL-01                  |

---

## 2. Purpose

PRM-310 طبقه‌بندی نظرات دریافتی در پلتفرم‌های اجتماعی را تعریف می‌کند. این پرامپت با تحلیل محتوا، لحن، موضوع و ارتباط با برند، هر نظر را در دسته‌بندی مشخصی قرار می‌دهد تا مسیر پردازش بعدی تعیین شود.

### اصول طبقه‌بندی نظر

| ID    | اصل                                                     |
| ----- | ------------------------------------------------------- |
| CC-01 | هر نظر باید دقیقاً به یک دسته اصلی تعلق داشته باشد      |
| CC-02 | دسته‌بندی بر اساس محتوا، لحن و ارتباط با برند انجام شود |
| CC-03 | نظرات بحرانی (Critical) باید با اولویت بالا پردازش شوند |
| CC-04 | دسته‌بندی باید قابل ممیزی و بازبینی باشد                |

---

## 3. Scope

### Inside Scope

| حوزه        | توضیح                                  |
| ----------- | -------------------------------------- |
| تحلیل محتوا | بررسی متن نظر و تشخیص موضوع اصلی       |
| تشخیص لحن   | شناسایی لحن مثبت، منفی، خنثی یا تهاجمی |
| دسته‌بندی   | تخصیص نظر به یکی از دسته‌های تعریف‌شده |
| اولویت‌بندی | تعیین اولویت پردازش بر اساس دسته و لحن |

### Outside Scope

| حوزه                 | دلیل         |
| -------------------- | ------------ |
| استراتژی پاسخ        | حوزه PRM-311 |
| تهیه پیش‌نویس پاسخ   | حوزه PRM-312 |
| مدیتیشن (Moderation) | حوزه PRM-313 |

---

## 4. Consumers

| مصرف‌کننده         | نقش                     | نوع مصرف |
| ------------------ | ----------------------- | -------- |
| AI-009 (Community) | طبقه‌بندی نظرات دریافتی | Chain    |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-05",
        "source": "PLAT-*",
        "scope": ["platform-engagement-rules", "comment-formats"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "BRD-002",
        "scope": ["voice-boundaries", "brand-topics"],
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

| منبع    | دامنه              | کاربرد                         |
| ------- | ------------------ | ------------------------------ |
| PLAT-\* | قواعد تعامل پلتفرم | تطبیق با محدودیت‌های هر پلتفرم |
| BRD-002 | مرزهای صدای برند   | تشخیص انحراف از برند           |

---

## 7. Variables

| متغیر             | نوع    | اجباری | توضیح                     | اعتبارسنجی     |
| ----------------- | ------ | ------ | ------------------------- | -------------- |
| `comment_text`    | VAR-01 | بله    | متن نظر دریافت‌شده        | —              |
| `platform_source` | VAR-01 | بله    | پلتفرم مبدأ نظر           | valid platform |
| `author_context`  | VAR-03 | خیر    | زمینه کاربر (سابقه تعامل) | —              |

---

## 8. Constraints

| ID     | محدودیت                                       |
| ------ | --------------------------------------------- |
| CST-01 | هر نظر به یک دسته اصلی تعلق دارد              |
| CST-02 | نظرات بحرانی باید درجه اولویت ۱ داشته باشند   |
| CST-03 | تشخیص لحن نباید مبتنی بر کلمات کلیدی صرف باشد |

---

## 9. Input Contract

| ورودی             | نوع    | منبع   | اجباری |
| ----------------- | ------ | ------ | ------ |
| `comment_text`    | string | AI-009 | بله    |
| `platform_source` | string | AI-009 | بله    |
| `author_context`  | object | AI-009 | خیر    |

---

## 10. Output Contract

| خروجی                       | نوع    | توضیح                                                     |
| --------------------------- | ------ | --------------------------------------------------------- |
| `classified_comment`        | object | نظر همراه با طبقه‌بندی                                    |
| `primary_category`          | string | دسته اصلی (question/complaint/praise/spam/critical/other) |
| `sentiment_label`           | string | برچسب احساسی (positive/neutral/negative/hostile)          |
| `priority_level`            | number | اولویت پردازش (۱–۵)                                       |
| `classification_confidence` | number | اطمینان طبقه‌بندی (۰–۱۰۰)                                 |

---

## 11. Validation Rules

| ID     | قاعده                                       | سطح    | نقض     |
| ------ | ------------------------------------------- | ------ | ------- |
| VAL-01 | هر نظر یک دسته اصلی دارد                    | معماری | عدم ثبت |
| VAL-02 | priority_level بر اساس دسته و لحن تعیین شود | معماری | هشدار   |
| VAL-03 | classification_confidence ≥ ۶۰              | معماری | هشدار   |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                    | مسئول              |
| ----- | ----------------- | ------------------------ | ------------------ |
| QG-01 | Draft → Review    | هویت کامل, context معتبر | خودکار             |
| QG-02 | Review → Approved | دسته‌بندی‌ها جامع        | Community Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001           | Registry Keeper    |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                               |
| ------- | ------------------- | ------ | ---------------------------------- |
| PRM-301 | DEP-03 (References) | ^1.0.0 | دستورالعمل انتشار برای بافت پلتفرم |
| PLAT-\* | DEP-03 (References) | ^1.0.0 | قواعد تعامل پلتفرم                 |
| BRD-002 | DEP-03 (References) | ^1.0.0 | مرزهای صدای برند                   |

---

## 14. Human Override

| سناریو                         | اقدام                                           |
| ------------------------------ | ----------------------------------------------- |
| classification_confidence < ۶۰ | Escalation به Community Manager برای بررسی دستی |
| نظر بدون دسته                  | تخصیص به «سایر» + اطلاع‌رسانی                   |

---

## 15. Governance Notes

| ID     | یادداشت                                          |
| ------ | ------------------------------------------------ |
| GOV-01 | A-2 (Tactical) — نیازمند تأیید Community Manager |
| GOV-02 | تغییر دسته‌بندی‌ها نیازمند ADR                   |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-310",
  "name": "Comment Classification",
  "family": "FAM-OPS",
  "subfamily": "OPS-CMG",
  "type": "PT-04",
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
    { "id": "comment_text", "type": "VAR-01", "required": true },
    { "id": "platform_source", "type": "VAR-01", "required": true },
    { "id": "author_context", "type": "VAR-03", "required": false }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["comment_text", "platform_source"],
    "optional": ["author_context"]
  },
  "output": {
    "required": ["classified_comment", "primary_category", "sentiment_label", "priority_level"],
    "optional": ["classification_confidence"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Each comment has one primary category", "severity": "error" },
    {
      "id": "VAL-02",
      "description": "Priority level based on category and sentiment",
      "severity": "warning"
    },
    { "id": "VAL-03", "description": "Classification confidence >= 60", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-01",
  "consumers": ["AI-009"],
  "dependencies": [],
  "documentation_refs": ["PLAT-*", "BRD-002"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                       | توسط        |
| ----------- | ---------- | --------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — طبقه‌بندی نظر | معمار سیستم |
