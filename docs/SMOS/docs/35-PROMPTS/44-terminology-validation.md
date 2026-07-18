# Terminology Validation — اعتبارسنجی اصطلاحات

> **شناسه:** PRM-212
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Content Producer
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-210](./40-review-preparation.md), [ARCH-003](../00-ARCHITECTURE/03-enterprise-vocabulary.md), [GOV-004](../10-GOVERNANCE/04-cross-references.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                  |
| ------------------ | ---------------------- |
| **id**             | PRM-212                |
| **name_fa**        | اعتبارسنجی اصطلاحات    |
| **name_en**        | Terminology Validation |
| **family**         | FAM-CON                |
| **subfamily**      | CON-RVW                |
| **type**           | PT-06                  |
| **complexity**     | C-2                    |
| **authority**      | A-2                    |
| **owner**          | Content Producer       |
| **version**        | 1.0.0-draft            |
| **status**         | draft                  |
| **security_level** | SL-02                  |

---

## 2. Purpose

PRM-212 اصطلاحات، نام‌گذاری‌ها و ارجاعات استفاده‌شده در محتوا را بر اساس واژه‌نامه رسمی SMOS (ARCH-003)، استانداردهای نام‌گذاری (GOV-003)، نظام ارجاع متقابل (GOV-004) و تاکسونومی محتوا (EDT-002) اعتبارسنجی می‌کند.

### اصول اعتبارسنجی اصطلاحات

| ID    | اصل                                                           |
| ----- | ------------------------------------------------------------- |
| TV-01 | همه اصطلاحات تخصصی باید با ARCH-003 مطابقت داشته باشند        |
| TV-02 | شناسه‌های ارجاعی (PRM-_, AI-_, PLAT-\*, ...) باید معتبر باشند |
| TV-03 | نام‌گذاری‌ها باید از GOV-003 پیروی کنند                       |
| TV-04 | ارجاعات متقابل باید به موجودیت‌های موجود اشاره کنند           |

---

## 3. Scope

### Inside Scope

| حوزه                      | توضیح                                   |
| ------------------------- | --------------------------------------- |
| اعتبارسنجی واژگان         | تطابق با ARCH-003 (واژه‌نامه رسمی)      |
| اعتبارسنجی شناسه‌ها       | بررسی PRM-_, AI-_, AUT-_, PLAT-_, CT-\* |
| اعتبارسنجی نام‌گذاری      | انطباق با GOV-003                       |
| اعتبارسنجی ارجاعات متقابل | انطباق با GOV-004                       |
| اعتبارسنجی تاکسونومی      | تطابق اصطلاحات با EDT-002               |

### Outside Scope

| حوزه                     | دلیل         |
| ------------------------ | ------------ |
| آماده‌سازی زمینه بازبینی | حوزه PRM-210 |
| اعتبارسنجی ساختار        | حوزه PRM-211 |
| اعتبارسنجی سازگاری       | حوزه PRM-213 |
| تعیین آمادگی انتشار      | حوزه PRM-214 |

---

## 4. Consumers

| مصرف‌کننده              | نقش                                    | نوع مصرف   |
| ----------------------- | -------------------------------------- | ---------- |
| AI-004 (Content Review) | اعتبارسنجی اصطلاحات در گذر دوم بازبینی | Validation |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-210 Output",
        "scope": ["review-context", "criteria-priority"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-04",
        "source": "PRM-203 Output",
        "scope": ["structured-document", "block-index"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "ARCH-003",
        "scope": ["canonical-vocabulary", "term-definitions"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "GOV-004",
        "scope": ["cross-reference-rules"],
        "injection": "prepend",
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

| منبع     | دامنه          | کاربرد                          |
| -------- | -------------- | ------------------------------- |
| ARCH-003 | واژه‌نامه رسمی | اعتبارسنجی اصطلاحات تخصصی       |
| GOV-003  | نام‌گذاری      | اعتبارسنجی قراردادهای نام‌گذاری |
| GOV-004  | ارجاع متقابل   | اعتبارسنجی ارجاعات بین اسناد    |
| EDT-002  | تاکسونومی      | اعتبارسنجی اصطلاحات تاکسونومی   |

---

## 7. Variables

| متغیر                 | نوع    | اجباری | توضیح                      | اعتبارسنجی    |
| --------------------- | ------ | ------ | -------------------------- | ------------- |
| `structured_document` | VAR-06 | بله    | سند ساختاریافته از PRM-203 | —             |
| `review_context`      | VAR-06 | بله    | بافت بازبینی از PRM-210    | —             |
| `strict_terminology`  | VAR-03 | خیر    | اعمال سخت‌گیرانه واژه‌نامه | default: true |

---

## 8. Constraints

| ID     | محدودیت                                                 |
| ------ | ------------------------------------------------------- |
| CST-01 | اصطلاحات خارج از ARCH-003 باید با توضیح همراه باشند     |
| CST-02 | شناسه‌های ارجاعی باید به موجودیت‌های ثبت‌شده اشاره کنند |
| CST-03 | نام‌گذاری‌های سفارشی باید از GOV-003 پیروی کنند         |
| CST-04 | حداکثر ۵٪ از اصطلاحات می‌توانند خارج از واژه‌نامه باشند |

---

## 9. Input Contract

| ورودی                 | نوع     | منبع    | اجباری |
| --------------------- | ------- | ------- | ------ |
| `structured_document` | object  | PRM-203 | بله    |
| `review_context`      | object  | PRM-210 | بله    |
| `strict_terminology`  | boolean | AI-004  | خیر    |

---

## 10. Output Contract

| خروجی                   | نوع    | توضیح                                         |
| ----------------------- | ------ | --------------------------------------------- |
| `terminology_report`    | object | گزارش کامل اعتبارسنجی اصطلاحات                |
| `term_violations`       | array  | نقض‌های واژگانی با severity و پیشنهاد جایگزین |
| `identifier_validation` | array  | اعتبارسنجی شناسه‌ها با وضعیت معتبر/نامعتبر    |
| `cross_reference_check` | array  | اعتبارسنجی ارجاعات متقابل                     |
| `terminology_score`     | number | امتیاز انطباق اصطلاحات (۰–۱۰۰)                |

---

## 11. Validation Rules

| ID     | قاعده                                             | سطح    | نقض     |
| ------ | ------------------------------------------------- | ------ | ------- |
| VAL-01 | اصطلاحات تخصصی با ARCH-003 مطابقت دارند           | معماری | هشدار   |
| VAL-02 | شناسه‌های ارجاعی معتبر هستند                      | معماری | عدم ثبت |
| VAL-03 | نام‌گذاری‌ها از GOV-003 پیروی می‌کنند             | معماری | هشدار   |
| VAL-04 | ارجاعات متقابل به موجودیت‌های موجود اشاره می‌کنند | معماری | عدم ثبت |
| VAL-05 | حداکثر ۵٪ اصطلاحات خارج از واژه‌نامه              | معماری | هشدار   |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                                   | مسئول           |
| ----- | ----------------- | --------------------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل, وابستگی به PRM-210, ARCH-003 | خودکار          |
| QG-02 | Review → Approved | انطباق با GOV-003, GOV-004              | Prompt Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001                          | Registry Keeper |

---

## 13. Dependencies

| شناسه    | نوع               | نسخه   | دلیل                                 |
| -------- | ----------------- | ------ | ------------------------------------ |
| PRM-210  | DEP-01 (Requires) | ^1.0.0 | بافت بازبینی از PRM-210 ورودی الزامی |
| ARCH-003 | DEP-05 (Provides) | ^1.0.0 | واژه‌نامه رسمی — منبع اصطلاحات معتبر |
| GOV-004  | DEP-05 (Provides) | ^1.0.0 | قواعد ارجاع متقابل                   |

---

## 14. Human Override

| سناریو                                 | اقدام                                        |
| -------------------------------------- | -------------------------------------------- |
| اصطلاح خارج از ARCH-003 با کاربرد موجه | تأیید انسانی + پیشنهاد به‌روزرسانی واژه‌نامه |
| شناسه نامعتبر متعدد (بیش از ۳)         | بازگشت به AI-003 برای اصلاح                  |
| strict_terminology=false و score < ۶۰  | Escalation به Content Editor                 |

---

## 15. Governance Notes

| ID     | یادداشت                                                        |
| ------ | -------------------------------------------------------------- |
| GOV-01 | A-2 (Operational) — نیازمند تأیید ناظر                         |
| GOV-02 | هر مورد اصطلاح خارج از واژه‌نامه باید در Issue Tracker ثبت شود |
| GOV-03 | به‌روزرسانی ARCH-003 نیازمند بازبینی این پرامپت                |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-212",
  "name": "Terminology Validation",
  "family": "FAM-CON",
  "subfamily": "CON-RVW",
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
    { "type": "CTX-04", "source": "PRM-210", "required": true },
    { "type": "CTX-04", "source": "PRM-203", "required": true },
    { "type": "CTX-02", "source": "ARCH-003", "required": true },
    { "type": "CTX-02", "source": "GOV-004", "required": true }
  ],
  "max_tokens": 4000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "structured_document", "type": "VAR-06", "required": true },
    { "id": "review_context", "type": "VAR-06", "required": true },
    { "id": "strict_terminology", "type": "VAR-03", "required": false, "default": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["structured_document", "review_context"],
    "optional": ["strict_terminology"]
  },
  "output": {
    "required": ["terminology_report", "term_violations", "terminology_score"],
    "optional": ["identifier_validation", "cross_reference_check"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Specialist terms match ARCH-003", "severity": "warning" },
    { "id": "VAL-02", "description": "All reference IDs are valid", "severity": "error" },
    { "id": "VAL-03", "description": "Naming follows GOV-003", "severity": "warning" },
    {
      "id": "VAL-04",
      "description": "Cross-references point to existing entities",
      "severity": "error"
    },
    { "id": "VAL-05", "description": "Max 5% terms outside vocabulary", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-004"],
  "dependencies": ["PRM-210", "ARCH-003", "GOV-004"],
  "documentation_refs": ["ARCH-003", "GOV-003", "GOV-004", "EDT-002"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                             | توسط        |
| ----------- | ---------- | --------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — اعتبارسنجی اصطلاحات | معمار سیستم |
