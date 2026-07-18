# Publication Readiness Validation — اعتبارسنجی آمادگی انتشار

> **شناسه:** PRM-214
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Content Producer
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-210](./40-review-preparation.md), [PRM-211](./42-structural-validation.md), [PRM-212](./44-terminology-validation.md), [PRM-213](./46-consistency-validation.md), [PRM-301](./30-publishing-instruction.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                            |
| ------------------ | -------------------------------- |
| **id**             | PRM-214                          |
| **name_fa**        | اعتبارسنجی آمادگی انتشار         |
| **name_en**        | Publication Readiness Validation |
| **family**         | FAM-CON                          |
| **subfamily**      | CON-RVW                          |
| **type**           | PT-06                            |
| **complexity**     | C-3                              |
| **authority**      | A-3                              |
| **owner**          | Content Producer                 |
| **version**        | 1.0.0-draft                      |
| **status**         | draft                            |
| **security_level** | SL-02                            |

---

## 2. Purpose

PRM-214 آمادگی محتوا برای انتشار را تعیین می‌کند. این پرامپت خروجی همه بازبینی‌های PRM-211 تا PRM-213 را تلفیق کرده و یک تصمیم نهایی درباره انتشار (Publish, Conditional, Blocked) به همراه امتیاز readiness، مسائل blocking، بهبودهای مورد نیاز و توصیه تأیید ارائه می‌دهد.

### اصول تعیین آمادگی انتشار

| ID    | اصل                                                                              |
| ----- | -------------------------------------------------------------------------------- |
| PR-01 | تصمیم انتشار بر اساس تلفیق همه بازبینی‌ها است — هیچ بازبینی نادیده گرفته نمی‌شود |
| PR-02 | امتیاز readiness باید شفاف، قابل ردیابی و مبتنی بر معیار باشد                    |
| PR-03 | مسائل blocking باید صریحاً اعلام شوند — ابهام ممنوع                              |
| PR-04 | توصیه تأیید باید قابل توضیح باشد — چرایی تصمیم مستند می‌شود                      |
| PR-05 | محتوای Blocked هرگز به انتشار نمی‌رسد مگر با override انسانی                     |

---

## 3. Scope

### Inside Scope

| حوزه                    | توضیح                                       |
| ----------------------- | ------------------------------------------- |
| تلفیق نتایج بازبینی     | جمع‌آوری و وزن‌دهی به خروجی PRM-211,212,213 |
| محاسبه امتیاز readiness | امتیاز وزنی از همه بازبینی‌ها               |
| شناسایی مسائل blocking  | مواردی که انتشار را متوقف می‌کنند           |
| ارائه توصیه انتشار      | Publish, Conditional, Blocked               |
| مستندسازی تصمیم         | گزارش نهایی قابل حسابرسی                    |

### Outside Scope

| حوزه                     | دلیل                    |
| ------------------------ | ----------------------- |
| اجرای بازبینی‌ها         | حوزه PRM-211 تا PRM-213 |
| آماده‌سازی زمینه بازبینی | حوزه PRM-210            |
| انتشار واقعی             | حوزه PRM-301            |
| تطبیق پلتفرمی            | حوزه PRM-207            |

---

## 4. Consumers

| مصرف‌کننده              | نقش                                       | نوع مصرف   |
| ----------------------- | ----------------------------------------- | ---------- |
| AI-004 (Content Review) | تصمیم نهایی بازبینی و توصیه انتشار        | Validation |
| AI-008 (Publishing)     | دریافت تأیید انتشار برای ارسال به PRM-301 | Validation |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-210 Output",
        "scope": ["review-context", "readiness-flag"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-04",
        "source": "PRM-211 Output",
        "scope": ["structure-report", "structural-score"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-04",
        "source": "PRM-212 Output",
        "scope": ["terminology-report", "terminology-score"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-04",
        "source": "PRM-213 Output",
        "scope": ["consistency-report", "consistency-score"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-06",
        "source": "ARCH-032",
        "scope": ["authority-level", "approval-rules"],
        "injection": "append",
        "required": true
      }
    ],
    "max_tokens": 5000,
    "priority": "high"
  }
}
```

---

## 6. Required Knowledge

| منبع     | دامنه         | کاربرد                          |
| -------- | ------------- | ------------------------------- |
| ARCH-032 | حکمرانی Agent | قواعد تأیید بر اساس سطح اختیار  |
| EDT-001  | ECOS          | الزامات انتشار در چرخه حیات     |
| BRD-002  | صدای برند     | حداقل معیارهای عبور برای انتشار |

---

## 7. Variables

| متغیر                | نوع    | اجباری | توضیح                        | اعتبارسنجی                                                             |
| -------------------- | ------ | ------ | ---------------------------- | ---------------------------------------------------------------------- |
| `review_context`     | VAR-06 | بله    | بافت بازبینی از PRM-210      | —                                                                      |
| `structure_report`   | VAR-06 | بله    | گزارش ساختار از PRM-211      | —                                                                      |
| `terminology_report` | VAR-06 | بله    | گزارش اصطلاحات از PRM-212    | —                                                                      |
| `consistency_report` | VAR-06 | بله    | گزارش سازگاری از PRM-213     | —                                                                      |
| `authority_level`    | VAR-04 | بله    | سطح اختیار محتوا             | members: [A-0, A-1, A-2, A-3, A-4]                                     |
| `publish_window`     | VAR-04 | خیر    | پنجره انتشار برنامه‌ریزی‌شده | members: [immediate, today, this-week, this-month], default: immediate |

---

## 8. Constraints

| ID     | محدودیت                                                                |
| ------ | ---------------------------------------------------------------------- |
| CST-01 | همه بازبینی‌ها (PRM-211,212,213) باید کامل شده باشند                   |
| CST-02 | امتیاز readiness = ترکیب وزنی: ساختار ۳۰٪ + اصطلاحات ۲۰٪ + سازگاری ۵۰٪ |
| CST-03 | یک issue blocking = وضعیت Blocked unconditionally                      |
| CST-04 | محتوای A-3 و A-4 نیازمند تأیید انسانی برای انتشار                      |
| CST-05 | توصیه Publish فقط در صورت score ≥ ۷۵ و بدون blocking issue             |

---

## 9. Input Contract

| ورودی                | نوع    | منبع    | اجباری |
| -------------------- | ------ | ------- | ------ |
| `review_context`     | object | PRM-210 | بله    |
| `structure_report`   | object | PRM-211 | بله    |
| `terminology_report` | object | PRM-212 | بله    |
| `consistency_report` | object | PRM-213 | بله    |
| `authority_level`    | enum   | AI-014  | بله    |
| `publish_window`     | enum   | AI-008  | خیر    |

---

## 10. Output Contract

| خروجی                     | نوع    | توضیح                                         |
| ------------------------- | ------ | --------------------------------------------- |
| `readiness_score`         | number | امتیاز آمادگی انتشار (۰–۱۰۰)                  |
| `blocking_issues`         | array  | مسائلی که انتشار را مسدود می‌کنند             |
| `required_improvements`   | array  | بهبودهای مورد نیاز پیش از انتشار              |
| `approval_recommendation` | enum   | توصیه: publish, conditional, blocked          |
| `approval_chain`          | array  | مراحل تأیید مورد نیاز بر اساس authority_level |
| `readiness_report`        | object | گزارش کامل آمادگی انتشار                      |

---

## 11. Validation Rules

| ID     | قاعده                                          | سطح     | نقض     |
| ------ | ---------------------------------------------- | ------- | ------- |
| VAL-01 | همه بازبینی‌ها کامل شده‌اند                    | معماری  | عدم ثبت |
| VAL-02 | امتیاز readiness بر اساس وزن‌دهی تعریف‌شده     | معماری  | هشدار   |
| VAL-03 | blocking issues صریحاً اعلام شده‌اند           | معماری  | هشدار   |
| VAL-04 | approval_recommendation قابل ردیابی به معیارها | معماری  | عدم ثبت |
| VAL-05 | A-3/A-4 نیازمند تأیید انسانی در approval_chain | حکمرانی | عدم ثبت |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                                     | مسئول           |
| ----- | ----------------- | ----------------------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل, وابستگی به PRM-210,211,212,213 | خودکار          |
| QG-02 | Review → Approved | انطباق با ARCH-032                        | Prompt Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3)                 | Registry Keeper |

---

## 13. Dependencies

| شناسه   | نوع               | نسخه   | دلیل                                      |
| ------- | ----------------- | ------ | ----------------------------------------- |
| PRM-210 | DEP-01 (Requires) | ^1.0.0 | بافت بازبینی                              |
| PRM-211 | DEP-01 (Requires) | ^1.0.0 | گزارش ساختار                              |
| PRM-212 | DEP-01 (Requires) | ^1.0.0 | گزارش اصطلاحات                            |
| PRM-213 | DEP-01 (Requires) | ^1.0.0 | گزارش سازگاری                             |
| PRM-301 | DEP-05 (Provides) | ^1.0.0 | توصیه انتشار به PRM-301 تحویل داده می‌شود |

---

## 14. Human Override

| سناریو                                     | اقدام                                                      |
| ------------------------------------------ | ---------------------------------------------------------- |
| readiness_score ≥ ۷۵ بدون blocking issue   | انتشار خودکار (برای A-0 تا A-2) / نیازمند تأیید (A-3, A-4) |
| readiness_score ۵۰–۷۴ یا ۱ blocking issue  | Conditional — نیازمند تأیید Content Editor                 |
| readiness_score < ۵۰ یا > ۱ blocking issue | Blocked — بازگشت به AI-003 برای اصلاح                      |
| authority_level A-4                        | تأیید مدیریت ارشد الزامی صرف‌نظر از score                  |

---

## 15. Governance Notes

| ID     | یادداشت                                             |
| ------ | --------------------------------------------------- |
| GOV-01 | A-3 (Strategic) — نیازمند ADR + تأیید مدیر          |
| GOV-02 | C-3 (Complex) — تلفیق ۴ منبع ورودی مستقل            |
| GOV-03 | تغییر در وزن‌دهی معیارها نیازمند Minor Version Bump |
| GOV-04 | تمام تصمیمات انتشار باید در Audit Log ثبت شوند      |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-214",
  "name": "Publication Readiness Validation",
  "family": "FAM-CON",
  "subfamily": "CON-RVW",
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
    { "type": "CTX-04", "source": "PRM-210", "required": true },
    { "type": "CTX-04", "source": "PRM-211", "required": true },
    { "type": "CTX-04", "source": "PRM-212", "required": true },
    { "type": "CTX-04", "source": "PRM-213", "required": true },
    { "type": "CTX-06", "source": "ARCH-032", "required": true }
  ],
  "max_tokens": 5000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "review_context", "type": "VAR-06", "required": true },
    { "id": "structure_report", "type": "VAR-06", "required": true },
    { "id": "terminology_report", "type": "VAR-06", "required": true },
    { "id": "consistency_report", "type": "VAR-06", "required": true },
    {
      "id": "authority_level",
      "type": "VAR-04",
      "required": true,
      "members": ["A-0", "A-1", "A-2", "A-3", "A-4"]
    },
    {
      "id": "publish_window",
      "type": "VAR-04",
      "required": false,
      "members": ["immediate", "today", "this-week", "this-month"],
      "default": "immediate"
    }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": [
      "review_context",
      "structure_report",
      "terminology_report",
      "consistency_report",
      "authority_level"
    ],
    "optional": ["publish_window"]
  },
  "output": {
    "required": [
      "readiness_score",
      "blocking_issues",
      "approval_recommendation",
      "readiness_report"
    ],
    "optional": ["required_improvements", "approval_chain"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "All reviews completed", "severity": "error" },
    {
      "id": "VAL-02",
      "description": "Readiness score uses defined weighting",
      "severity": "warning"
    },
    { "id": "VAL-03", "description": "Blocking issues explicitly declared", "severity": "warning" },
    {
      "id": "VAL-04",
      "description": "Approval recommendation traceable to criteria",
      "severity": "error"
    },
    {
      "id": "VAL-05",
      "description": "A-3/A-4 require human approval in chain",
      "severity": "error"
    }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-004", "AI-008"],
  "dependencies": ["PRM-210", "PRM-211", "PRM-212", "PRM-213", "PRM-301"],
  "documentation_refs": ["ARCH-032", "EDT-001", "BRD-002"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                                  | توسط        |
| ----------- | ---------- | -------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — اعتبارسنجی آمادگی انتشار | معمار سیستم |
