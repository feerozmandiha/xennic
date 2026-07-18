# Response Draft Preparation — تهیه پیش‌نویس پاسخ

> **شناسه:** PRM-312
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Community Manager
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-311](./102-response-strategy-selection.md), [BRD-002](../22-BRAND/20-brand-voice.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                      |
| ------------------ | -------------------------- |
| **id**             | PRM-312                    |
| **name_fa**        | تهیه پیش‌نویس پاسخ         |
| **name_en**        | Response Draft Preparation |
| **family**         | FAM-OPS                    |
| **subfamily**      | OPS-CMG                    |
| **type**           | PT-04                      |
| **complexity**     | C-2                        |
| **authority**      | A-2                        |
| **owner**          | Community Manager          |
| **version**        | 1.0.0-draft                |
| **status**         | draft                      |
| **security_level** | SL-01                      |

---

## 2. Purpose

PRM-312 تهیه پیش‌نویس پاسخ به نظرات طبقه‌بندی‌شده را بر اساس استراتژی انتخاب‌شده تعریف می‌کند. این پرامپت با رعایت صدای برند، قواعد پلتفرم و بافت تعامل، پاسخی متناسب و مؤثر تولید می‌کند.

### اصول تهیه پیش‌نویس

| ID    | اصل                                                  |
| ----- | ---------------------------------------------------- |
| DP-01 | پاسخ باید با صدای برند (BRD-002) همخوان باشد         |
| DP-02 | لحن پاسخ متناسب با لحن نظر و استراتژی انتخاب‌شده است |
| DP-03 | پاسخ باید مختصر، مفید و غیرتکراری باشد               |
| DP-04 | پاسخ‌های بحرانی نیازمند تأیید انسانی هستند           |

---

## 3. Scope

### Inside Scope

| حوزه           | توضیح                       |
| -------------- | --------------------------- |
| تولید پیش‌نویس | نگارش پاسخ بر اساس استراتژی |
| تطبیق لحن      | تنظیم لحن با نظر و برند     |
| رعایت محدودیت  | تطبیق با محدودیت طول پلتفرم |
| نشانه‌گذاری    | درج متغیرهای قابل شخصی‌سازی |

### Outside Scope

| حوزه            | دلیل         |
| --------------- | ------------ |
| انتخاب استراتژی | حوزه PRM-311 |
| مدیتیشن و تأیید | حوزه PRM-313 |
| ثبت تعامل       | حوزه PRM-315 |

---

## 4. Consumers

| مصرف‌کننده         | نقش                | نوع مصرف |
| ------------------ | ------------------ | -------- |
| AI-009 (Community) | تهیه پیش‌نویس پاسخ | Chain    |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-311 Output",
        "scope": ["selected-strategy", "strategy-reasoning"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "BRD-002",
        "scope": ["voice-rules", "tone-guidelines", "response-templates"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-05",
        "source": "PLAT-*",
        "scope": ["character-limits", "format-constraints"],
        "injection": "append",
        "required": false
      }
    ],
    "max_tokens": 3000,
    "priority": "high"
  }
}
```

---

## 6. Required Knowledge

| منبع    | دامنه              | کاربرد             |
| ------- | ------------------ | ------------------ |
| BRD-002 | قواعد صدا و لحن    | تطبیق پاسخ با برند |
| PLAT-\* | محدودیت‌های پلتفرم | رعایت محدودیت طول  |

---

## 7. Variables

| متغیر               | نوع    | اجباری | توضیح                          | اعتبارسنجی |
| ------------------- | ------ | ------ | ------------------------------ | ---------- |
| `selected_strategy` | VAR-01 | بله    | استراتژی انتخاب‌شده از PRM-311 | —          |
| `comment_text`      | VAR-01 | بله    | متن نظر اصلی                   | —          |
| `author_name`       | VAR-01 | خیر    | نام نویسنده (در صورت نیاز)     | —          |

---

## 8. Constraints

| ID     | محدودیت                              |
| ------ | ------------------------------------ |
| CST-01 | پاسخ باید در محدودیت طول پلتفرم باشد |
| CST-02 | لحن پاسخ متناسب با استراتژی و نظر    |
| CST-03 | پاسخ نباید حاوی اطلاعات محرمانه باشد |

---

## 9. Input Contract

| ورودی               | نوع    | منبع    | اجباری |
| ------------------- | ------ | ------- | ------ |
| `selected_strategy` | string | PRM-311 | بله    |
| `comment_text`      | string | PRM-310 | بله    |
| `author_name`       | string | AI-009  | خیر    |

---

## 10. Output Contract

| خروجی                 | نوع     | توضیح                                         |
| --------------------- | ------- | --------------------------------------------- |
| `response_draft`      | string  | پیش‌نویس پاسخ                                 |
| `response_tone`       | string  | لحن پاسخ (formal/friendly/empathetic/neutral) |
| `character_count`     | number  | تعداد کاراکترها                               |
| `platform_compliance` | boolean | انطباق با محدودیت پلتفرم                      |
| `draft_quality_score` | number  | امتیاز کیفیت پیش‌نویس (۰–۱۰۰)                 |

---

## 11. Validation Rules

| ID     | قاعده                      | سطح    | نقض     |
| ------ | -------------------------- | ------ | ------- |
| VAL-01 | پاسخ در محدودیت طول پلتفرم | معماری | عدم ثبت |
| VAL-02 | پاسخ با BRD-002 همخوان     | برند   | عدم ثبت |
| VAL-03 | draft_quality_score ≥ ۷۰   | معماری | هشدار   |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                  | مسئول              |
| ----- | ----------------- | ---------------------- | ------------------ |
| QG-01 | Draft → Review    | هویت کامل, input معتبر | خودکار             |
| QG-02 | Review → Approved | تطبیق با BRD-002       | Community Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001         | Registry Keeper    |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                             |
| ------- | ------------------- | ------ | -------------------------------- |
| PRM-311 | DEP-01 (Requires)   | ^1.0.0 | استراتژی پاسخ برای تهیه پیش‌نویس |
| BRD-002 | DEP-03 (References) | ^1.0.0 | قواعد صدا و لحن                  |
| PLAT-\* | DEP-03 (References) | ^1.0.0 | محدودیت‌های پلتفرم               |

---

## 14. Human Override

| سناریو                       | اقدام                                |
| ---------------------------- | ------------------------------------ |
| draft_quality_score < ۶۰     | بازنویسی دستی توسط Community Manager |
| عدم انطباق با محدودیت پلتفرم | اصلاح و کوتاه‌سازی پیش‌نویس          |

---

## 15. Governance Notes

| ID     | یادداشت                                          |
| ------ | ------------------------------------------------ |
| GOV-01 | A-2 (Tactical) — نیازمند تأیید Community Manager |
| GOV-02 | پیش‌نویس‌های بحرانی نیازمند امضای انسانی         |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-312",
  "name": "Response Draft Preparation",
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
    { "type": "CTX-04", "source": "PRM-311", "required": true },
    { "type": "CTX-02", "source": "BRD-002", "required": true },
    { "type": "CTX-05", "source": "PLAT-*", "required": false }
  ],
  "max_tokens": 3000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "selected_strategy", "type": "VAR-01", "required": true },
    { "id": "comment_text", "type": "VAR-01", "required": true },
    { "id": "author_name", "type": "VAR-01", "required": false }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["selected_strategy", "comment_text"],
    "optional": ["author_name"]
  },
  "output": {
    "required": ["response_draft", "response_tone", "character_count", "platform_compliance"],
    "optional": ["draft_quality_score"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Response within platform length limit", "severity": "error" },
    { "id": "VAL-02", "description": "Response conforms to BRD-002", "severity": "error" },
    { "id": "VAL-03", "description": "Draft quality score >= 70", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-01",
  "consumers": ["AI-009"],
  "dependencies": ["PRM-311"],
  "documentation_refs": ["BRD-002", "PLAT-*"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                            | توسط        |
| ----------- | ---------- | -------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — تهیه پیش‌نویس پاسخ | معمار سیستم |
