# Accessibility Media Validation — اعتبارسنجی دسترس‌پذیری رسانه

> **شناسه:** PRM-233
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Media Producer
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-232](./64-brand-visual-compliance.md), [PRM-205](./28-accessibility-enhancement-instruction.md), [PRM-402](./42-content-taxonomy-context.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                          |
| ------------------ | ------------------------------ |
| **id**             | PRM-233                        |
| **name_fa**        | اعتبارسنجی دسترس‌پذیری رسانه   |
| **name_en**        | Accessibility Media Validation |
| **family**         | FAM-CON                        |
| **subfamily**      | CON-MED                        |
| **type**           | PT-06                          |
| **complexity**     | C-2                            |
| **authority**      | A-3                            |
| **owner**          | Media Producer                 |
| **version**        | 1.0.0-draft                    |
| **status**         | draft                          |
| **security_level** | SL-02                          |

---

## 2. Purpose

PRM-233 دسترس‌پذیری دارایی‌های رسانه سازمانی را بر اساس استانداردهای WCAG و الزامات SMOS اعتبارسنجی می‌کند. این پرامپت متن جایگزین، دسترس‌پذیری بصری، کنتراست، زیرنویس، برچسب‌گذاری معنایی و فراداده دسترس‌پذیری را ارزیابی می‌کند.

### اصول دسترس‌پذیری رسانه

| ID    | اصل                                                      |
| ----- | -------------------------------------------------------- |
| AM-01 | همه دارایی‌های رسانه باید دارای متن جایگزین معنایی باشند |
| AM-02 | کنتراست باید حداقل WCAG AA را برآورده کند                |
| AM-03 | دارایی‌های ویدئویی باید دارای زیرنویس باشند              |
| AM-04 | همه عناصر باید دارای برچسب‌گذاری معنایی باشند            |

---

## 3. Scope

### Inside Scope

| حوزه                | توضیح                                  |
| ------------------- | -------------------------------------- |
| متن جایگزین         | اعتبارسنجی وجود و کیفیت alt text       |
| دسترس‌پذیری بصری    | بررسی کنتراست، وضوح، قابلیت درک        |
| کنتراست             | اندازه‌گیری نسبت کنتراست (WCAG AA/AAA) |
| زیرنویس             | بررسی وجود و کیفیت captions            |
| برچسب‌گذاری معنایی  | بررسی aria-label و نقش‌های ARIA        |
| فراداده دسترس‌پذیری | بررسی فراداده a11y                     |

### Outside Scope

| حوزه                    | دلیل         |
| ----------------------- | ------------ |
| دسترس‌پذیری محتوای متنی | حوزه PRM-205 |
| ترکیب بصری              | حوزه PRM-231 |
| انطباق برند             | حوزه PRM-232 |
| آمادگی تولید            | حوزه PRM-234 |

---

## 4. Consumers

| مصرف‌کننده                      | نقش                                       | نوع مصرف |
| ------------------------------- | ----------------------------------------- | -------- |
| AI-006 (Media Asset Production) | اعتبارسنجی دسترس‌پذیری دارایی‌های رسانه   | Chain    |
| AI-007 (Video Production)       | اعتبارسنجی دسترس‌پذیری دارایی‌های ویدئویی | Chain    |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-232 Output",
        "scope": ["compliance-report", "violations"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PRM-205",
        "scope": ["accessibility-standards", "alt-text-rules", "contrast-requirements"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PRM-402",
        "scope": ["semantic-labels", "aria-mapping"],
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

| منبع     | دامنه                    | کاربرد                         |
| -------- | ------------------------ | ------------------------------ |
| PRM-205  | استانداردهای دسترس‌پذیری | معیارهای WCAG و قواعد alt text |
| WCAG 2.2 | استاندارد خارجی          | سطوح AA/AAA برای کنتراست       |

---

## 7. Variables

| متغیر                    | نوع    | اجباری | توضیح                        | اعتبارسنجی                      |
| ------------------------ | ------ | ------ | ---------------------------- | ------------------------------- |
| `compliance_report`      | VAR-06 | بله    | گزارش انطباق بصری از PRM-232 | —                               |
| `wcag_level`             | VAR-04 | خیر    | سطح WCAG هدف                 | members: [AA, AAA], default: AA |
| `include_captions_check` | VAR-03 | خیر    | فعال‌سازی بررسی زیرنویس      | default: true                   |

---

## 8. Constraints

| ID     | محدودیت                                      |
| ------ | -------------------------------------------- |
| CST-01 | همه تصاویر باید alt text غیرخالی داشته باشند |
| CST-02 | نسبت کنتراست ≥ 4.5:1 برای متن عادی (WCAG AA) |
| CST-03 | دارایی‌های ویدئویی باید captions داشته باشند |
| CST-04 | aria-labelها باید معنادار و غیر تکراری باشند |

---

## 9. Input Contract

| ورودی                    | نوع     | منبع           | اجباری |
| ------------------------ | ------- | -------------- | ------ |
| `compliance_report`      | object  | PRM-232        | بله    |
| `wcag_level`             | enum    | AI-006, AI-007 | خیر    |
| `include_captions_check` | boolean | AI-006, AI-007 | خیر    |

---

## 10. Output Contract

| خروجی                         | نوع     | توضیح                             |
| ----------------------------- | ------- | --------------------------------- |
| `accessibility_report`        | object  | گزارش کامل دسترس‌پذیری            |
| `alt_text_score`              | number  | امتیاز متن جایگزین (۰–۱۰۰)        |
| `contrast_score`              | number  | امتیاز کنتراست (۰–۱۰۰)            |
| `captions_score`              | number  | امتیاز زیرنویس (۰–۱۰۰)            |
| `semantic_label_score`        | number  | امتیاز برچسب‌گذاری معنایی (۰–۱۰۰) |
| `overall_accessibility_score` | number  | امتیاز کلی دسترس‌پذیری (۰–۱۰۰)    |
| `blocking_issues`             | array   | مسائل مسدودکننده                  |
| `pass_accessibility`          | boolean | عبور از آستانه دسترس‌پذیری        |

---

## 11. Validation Rules

| ID     | قاعده                            | سطح    | نقض     |
| ------ | -------------------------------- | ------ | ------- |
| VAL-01 | همه تصاویر alt text دارند        | معماری | عدم ثبت |
| VAL-02 | کنتراست ≥ WCAG مورد نظر          | معماری | عدم ثبت |
| VAL-03 | overall_accessibility_score ≥ ۷۰ | معماری | عدم ثبت |
| VAL-04 | blocking_issues خالی برای pass   | معماری | عدم ثبت |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                                  | مسئول           |
| ----- | ----------------- | -------------------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل, وابستگی به PRM-232, PRM-205 | خودکار          |
| QG-02 | Review → Approved | انطباق با WCAG 2.2                     | Prompt Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3)              | Registry Keeper |

---

## 13. Dependencies

| شناسه   | نوع               | نسخه   | دلیل                     |
| ------- | ----------------- | ------ | ------------------------ |
| PRM-232 | DEP-01 (Requires) | ^1.0.0 | گزارش انطباق بصری        |
| PRM-205 | DEP-05 (Provides) | ^1.0.0 | استانداردهای دسترس‌پذیری |

---

## 14. Human Override

| سناریو                             | اقدام                           |
| ---------------------------------- | ------------------------------- |
| pass_accessibility = false         | Escalation به AI-006 برای اصلاح |
| blocking_issues شامل alt text خالی | بازگشت به AI-006 + اطلاع‌رسانی  |

---

## 15. Governance Notes

| ID     | یادداشت                                    |
| ------ | ------------------------------------------ |
| GOV-01 | A-3 (Strategic) — نیازمند ADR + تأیید مدیر |
| GOV-02 | سطح WCAG قابل تنظیم در هر Release          |
| GOV-03 | captions_check فقط برای دارایی‌های ویدئویی |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-233",
  "name": "Accessibility Media Validation",
  "family": "FAM-CON",
  "subfamily": "CON-MED",
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
    { "type": "CTX-04", "source": "PRM-232", "required": true },
    { "type": "CTX-02", "source": "PRM-205", "required": true },
    { "type": "CTX-02", "source": "PRM-402", "required": false }
  ],
  "max_tokens": 3000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "compliance_report", "type": "VAR-06", "required": true },
    {
      "id": "wcag_level",
      "type": "VAR-04",
      "required": false,
      "members": ["AA", "AAA"],
      "default": "AA"
    },
    { "id": "include_captions_check", "type": "VAR-03", "required": false, "default": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["compliance_report"],
    "optional": ["wcag_level", "include_captions_check"]
  },
  "output": {
    "required": ["accessibility_report", "overall_accessibility_score", "pass_accessibility"],
    "optional": [
      "alt_text_score",
      "contrast_score",
      "captions_score",
      "semantic_label_score",
      "blocking_issues"
    ]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "All images have alt text", "severity": "error" },
    { "id": "VAL-02", "description": "Contrast meets target WCAG level", "severity": "error" },
    { "id": "VAL-03", "description": "Overall accessibility score ≥ 70", "severity": "error" },
    { "id": "VAL-04", "description": "Blocking issues empty for pass", "severity": "error" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-006", "AI-007"],
  "dependencies": ["PRM-232", "PRM-205"],
  "documentation_refs": ["PRM-205", "WCAG 2.2"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                                      | توسط        |
| ----------- | ---------- | ------------------------------------------ | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — اعتبارسنجی دسترس‌پذیری رسانه | معمار سیستم |
