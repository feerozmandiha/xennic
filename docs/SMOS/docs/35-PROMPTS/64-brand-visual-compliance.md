# Brand Visual Compliance — انطباق بصری برند

> **شناسه:** PRM-232
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Media Producer
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-231](./62-visual-composition-instruction.md), [PRM-401](./40-brand-voice-context.md), [BRD-001](../22-BRAND/10-brand-identity.md), [BRD-002](../22-BRAND/20-brand-voice.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                   |
| ------------------ | ----------------------- |
| **id**             | PRM-232                 |
| **name_fa**        | انطباق بصری برند        |
| **name_en**        | Brand Visual Compliance |
| **family**         | FAM-CON                 |
| **subfamily**      | CON-MED                 |
| **type**           | PT-06                   |
| **complexity**     | C-2                     |
| **authority**      | A-3                     |
| **owner**          | Media Producer          |
| **version**        | 1.0.0-draft             |
| **status**         | draft                   |
| **security_level** | SL-02                   |

---

## 2. Purpose

PRM-232 سازگاری همه دارایی‌های رسانه با هویت بصری برند را تضمین می‌کند. این پرامپت هویت، تایپوگرافی، حاکمیت رنگ، آیکونوگرافی، سازگاری تصویرسازی و زبان بصری را در سراسر دارایی‌ها اعتبارسنجی می‌کند.

### اصول انطباق بصری

| ID    | اصل                                                |
| ----- | -------------------------------------------------- |
| BC-01 | همه دارایی‌ها باید با BRD-001 مطابقت داشته باشند   |
| BC-02 | تایپوگرافی باید از سامانه تایپ برند پیروی کند      |
| BC-03 | پالت رنگ باید محدود به پالت اصلی برند باشد         |
| BC-04 | آیکونوگرافی باید از کتابخانه رسمی برند استفاده کند |

---

## 3. Scope

### Inside Scope

| حوزه        | توضیح                           |
| ----------- | ------------------------------- |
| هویت برند   | بررسی انطباق با BRD-001         |
| تایپوگرافی  | بررسی فونت، وزن، اندازه و فاصله |
| حاکمیت رنگ  | بررسی محدودیت‌های پالت رنگ      |
| آیکونوگرافی | بررسی انطباق با کتابخانه آیکون  |
| تصویرسازی   | بررسی سازگاری سبک تصویرسازی     |
| زبان بصری   | بررسی یکپارچگی زبان بصری        |

### Outside Scope

| حوزه         | دلیل         |
| ------------ | ------------ |
| ترکیب بصری   | حوزه PRM-231 |
| دسترس‌پذیری  | حوزه PRM-233 |
| آمادگی تولید | حوزه PRM-234 |

---

## 4. Consumers

| مصرف‌کننده                      | نقش                               | نوع مصرف |
| ------------------------------- | --------------------------------- | -------- |
| AI-006 (Media Asset Production) | اعتبارسنجی انطباق بصری دارایی‌ها  | Chain    |
| AI-004 (Content Review)         | اعتبارسنجی نهایی انطباق بصری برند | Chain    |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-231 Output",
        "scope": ["composition-rules", "visual-hierarchy", "grid-spec"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "BRD-001",
        "scope": [
          "brand-identity",
          "visual-guidelines",
          "color-palette",
          "typography-system",
          "icon-library"
        ],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PRM-401",
        "scope": ["brand-dimensions", "visual-tone"],
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

## 6. Required Knowledge

| منبع    | دامنه     | کاربرد                                     |
| ------- | --------- | ------------------------------------------ |
| BRD-001 | هویت برند | پالت رنگ، سیستم تایپوگرافی، کتابخانه آیکون |
| BRD-002 | صدای برند | هماهنگی لحن بصری با صدا                    |

---

## 7. Variables

| متغیر                | نوع    | اجباری | توضیح                       | اعتبارسنجی    |
| -------------------- | ------ | ------ | --------------------------- | ------------- |
| `composition_output` | VAR-06 | بله    | خروجی ترکیب بصری از PRM-231 | —             |
| `strict_mode`        | VAR-03 | خیر    | اعمال سخت‌گیرانه قواعد برند | default: true |

---

## 8. Constraints

| ID     | محدودیت                                       |
| ------ | --------------------------------------------- |
| CST-01 | همه رنگ‌ها باید در پالت اصلی برند باشند       |
| CST-02 | تایپوگرافی باید از خانواده فونت برند باشد     |
| CST-03 | آیکون‌ها باید از کتابخانه رسمی باشند          |
| CST-04 | انطباق برند نباید قواعد ترکیب بصری را نقض کند |

---

## 9. Input Contract

| ورودی                | نوع     | منبع           | اجباری |
| -------------------- | ------- | -------------- | ------ |
| `composition_output` | object  | PRM-231        | بله    |
| `strict_mode`        | boolean | AI-006, AI-004 | خیر    |

---

## 10. Output Contract

| خروجی                      | نوع     | توضیح                             |
| -------------------------- | ------- | --------------------------------- |
| `compliance_report`        | object  | گزارش کامل انطباق بصری            |
| `identity_score`           | number  | امتیاز انطباق هویتی (۰–۱۰۰)       |
| `typography_score`         | number  | امتیاز انطباق تایپوگرافی (۰–۱۰۰)  |
| `color_score`              | number  | امتیاز انطباق رنگ (۰–۱۰۰)         |
| `iconography_score`        | number  | امتیاز انطباق آیکونوگرافی (۰–۱۰۰) |
| `overall_compliance_score` | number  | امتیاز کلی انطباق (۰–۱۰۰)         |
| `violations`               | array   | موارد نقض به تفکیک severity       |
| `pass_visual_audit`        | boolean | عبور از ممیزی بصری                |

---

## 11. Validation Rules

| ID     | قاعده                                     | سطح    | نقض     |
| ------ | ----------------------------------------- | ------ | ------- |
| VAL-01 | همه رنگ‌ها در پالت اصلی برند              | معماری | عدم ثبت |
| VAL-02 | تایپوگرافی از خانواده فونت برند           | معماری | عدم ثبت |
| VAL-03 | overall_compliance_score ≥ ۸۰             | معماری | عدم ثبت |
| VAL-04 | violations دارای severity بالا وجود ندارد | معماری | عدم ثبت |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                                  | مسئول           |
| ----- | ----------------- | -------------------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل, وابستگی به PRM-231, BRD-001 | خودکار          |
| QG-02 | Review → Approved | انطباق با BRD-001, BRD-002             | Prompt Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3)              | Registry Keeper |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                   |
| ------- | ------------------- | ------ | ---------------------- |
| PRM-231 | DEP-01 (Requires)   | ^1.0.0 | خروجی ترکیب بصری       |
| BRD-001 | DEP-05 (Provides)   | ^1.0.0 | هویت بصری و قواعد برند |
| BRD-002 | DEP-03 (References) | ^1.0.0 | هماهنگی لحن بصری       |

---

## 14. Human Override

| سناریو                      | اقدام                                           |
| --------------------------- | ----------------------------------------------- |
| pass_visual_audit = false   | Escalation به AI-006 + Brand Architect برای رفع |
| violations با severity بالا | مسدود شدن انتشار تا رفع تخلف                    |

---

## 15. Governance Notes

| ID     | یادداشت                                                       |
| ------ | ------------------------------------------------------------- |
| GOV-01 | A-3 (Strategic) — نیازمند ADR + تأیید مدیر                    |
| GOV-02 | strict_mode=true برای محتوای عمومی، false برای internal draft |
| GOV-03 | تغییر در BRD-001 نیازمند بازبینی قواعد انطباق                 |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-232",
  "name": "Brand Visual Compliance",
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
    { "type": "CTX-04", "source": "PRM-231", "required": true },
    { "type": "CTX-02", "source": "BRD-001", "required": true },
    { "type": "CTX-02", "source": "PRM-401", "required": true }
  ],
  "max_tokens": 4000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "composition_output", "type": "VAR-06", "required": true },
    { "id": "strict_mode", "type": "VAR-03", "required": false, "default": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["composition_output"],
    "optional": ["strict_mode"]
  },
  "output": {
    "required": ["compliance_report", "overall_compliance_score", "pass_visual_audit"],
    "optional": [
      "identity_score",
      "typography_score",
      "color_score",
      "iconography_score",
      "violations"
    ]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "All colors within brand palette", "severity": "error" },
    { "id": "VAL-02", "description": "Typography from brand font family", "severity": "error" },
    { "id": "VAL-03", "description": "Overall compliance score ≥ 80", "severity": "error" },
    { "id": "VAL-04", "description": "No high-severity violations", "severity": "error" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-006", "AI-004"],
  "dependencies": ["PRM-231", "BRD-001", "BRD-002"],
  "documentation_refs": ["BRD-001", "BRD-002", "PRM-401"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                          | توسط        |
| ----------- | ---------- | ------------------------------ | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — انطباق بصری برند | معمار سیستم |
