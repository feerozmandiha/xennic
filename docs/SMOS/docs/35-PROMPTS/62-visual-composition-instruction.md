# Visual Composition Instruction — قواعد ترکیب بصری

> **شناسه:** PRM-231
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Media Producer
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-230](./60-media-planning-instruction.md), [PRM-401](./40-brand-voice-context.md), [PRM-402](./42-content-taxonomy-context.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                          |
| ------------------ | ------------------------------ |
| **id**             | PRM-231                        |
| **name_fa**        | قواعد ترکیب بصری               |
| **name_en**        | Visual Composition Instruction |
| **family**         | FAM-CON                        |
| **subfamily**      | CON-MED                        |
| **type**           | PT-04                          |
| **complexity**     | C-3                            |
| **authority**      | A-3                            |
| **owner**          | Media Producer                 |
| **version**        | 1.0.0-draft                    |
| **status**         | draft                          |
| **security_level** | SL-02                          |

---

## 2. Purpose

PRM-231 قواعد ترکیب بصری سازمانی را برای تولید دارایی‌های رسانه تعریف می‌کند. این پرامپت ترکیب‌بندی، سلسله‌مراتب بصری، فاصله‌گذاری، تأکید، سازگاری و خوانایی را در سراسر دارایی‌های رسانه تضمین می‌کند.

### اصول ترکیب بصری

| ID    | اصل                                          |
| ----- | -------------------------------------------- |
| VC-01 | ترکیب بصری باید پیام اصلی محتوا را تقویت کند |
| VC-02 | سلسله‌مراتب بصری باید خواننده را هدایت کند   |
| VC-03 | فاصله‌گذاری باید سازگار و مبتنی بر گرید باشد |
| VC-04 | تأکید باید بر عناصر کلیدی متمرکز باشد        |
| VC-05 | خوانایی در همه ابعاد و وضوح‌ها تضمین شود     |

---

## 3. Scope

### Inside Scope

| حوزه             | توضیح                             |
| ---------------- | --------------------------------- |
| ترکیب‌بندی       | چیدمان عناصر در کادر              |
| سلسله‌مراتب بصری | ترتیب اهمیت و جریان بصری          |
| فاصله‌گذاری      | گرید، حاشیه، فاصله بین عناصر      |
| تأکید            | برجسته‌سازی عناصر کلیدی           |
| سازگاری          | یکنواختی بصری در سراسر دارایی‌ها  |
| خوانایی          | وضوح متن و عناصر در همه اندازه‌ها |

### Outside Scope

| حوزه              | دلیل         |
| ----------------- | ------------ |
| برنامه‌ریزی رسانه | حوزه PRM-230 |
| انطباق برند       | حوزه PRM-232 |
| دسترس‌پذیری       | حوزه PRM-233 |
| آمادگی تولید      | حوزه PRM-234 |

---

## 4. Consumers

| مصرف‌کننده                      | نقش                    | نوع مصرف |
| ------------------------------- | ---------------------- | -------- |
| AI-006 (Media Asset Production) | اجرای قواعد ترکیب بصری | Chain    |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-230 Output",
        "scope": ["media-plan", "asset-goals"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PRM-401",
        "scope": ["brand-voice-dimensions", "visual-tone"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "BRD-001",
        "scope": ["visual-identity", "design-principles"],
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

| منبع    | دامنه          | کاربرد                 |
| ------- | -------------- | ---------------------- |
| BRD-001 | هویت بصری برند | اصول طراحی و هویت بصری |
| BRD-002 | صدای برند      | لحن بصری متناسب با صدا |

---

## 7. Variables

| متغیر                | نوع    | اجباری | توضیح                   | اعتبارسنجی                                                                             |
| -------------------- | ------ | ------ | ----------------------- | -------------------------------------------------------------------------------------- |
| `media_plan`         | VAR-06 | بله    | برنامه رسانه از PRM-230 | —                                                                                      |
| `asset_type`         | VAR-04 | بله    | نوع دارایی رسانه        | members: [image, infographic, illustration, banner, social_card, presentation]         |
| `composition_intent` | VAR-04 | خیر    | هدف ترکیب‌بندی          | members: [informative, promotional, educational, brand_building], default: informative |

---

## 8. Constraints

| ID     | محدودیت                                                  |
| ------ | -------------------------------------------------------- |
| CST-01 | ترکیب بصری نباید با هویت برند (BRD-001) تناقض داشته باشد |
| CST-02 | سلسله‌مراتب بصری باید unambiguous باشد                   |
| CST-03 | فاصله‌گذاری باید مبتنی بر گرید سازمانی باشد              |
| CST-04 | خوانایی متن در کوچک‌ترین اندازه هدف تضمین شود            |

---

## 9. Input Contract

| ورودی                | نوع    | منبع    | اجباری |
| -------------------- | ------ | ------- | ------ |
| `media_plan`         | object | PRM-230 | بله    |
| `asset_type`         | enum   | AI-006  | بله    |
| `composition_intent` | enum   | AI-006  | خیر    |

---

## 10. Output Contract

| خروجی                   | نوع    | توضیح                        |
| ----------------------- | ------ | ---------------------------- |
| `composition_rules`     | object | قواعد ترکیب بصری برای دارایی |
| `visual_hierarchy`      | array  | سلسله‌مراتب عناصر بصری       |
| `grid_spec`             | object | مشخصات گرید و فاصله‌گذاری    |
| `emphasis_map`          | object | نقشه تأکید عناصر کلیدی       |
| `readability_checklist` | array  | چک‌لیست خوانایی              |

---

## 11. Validation Rules

| ID     | قاعده                                   | سطح    | نقض     |
| ------ | --------------------------------------- | ------ | ------- |
| VAL-01 | ترکیب بصری با BRD-001 همخوانی دارد      | معماری | عدم ثبت |
| VAL-02 | سلسله‌مراتب بصری تک‌معنایی است          | معماری | هشدار   |
| VAL-03 | فاصله‌گذاری مبتنی بر گرید است           | معماری | هشدار   |
| VAL-04 | خوانایی در همه اندازه‌های هدف تضمین شده | معماری | عدم ثبت |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                                  | مسئول           |
| ----- | ----------------- | -------------------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل, وابستگی به PRM-230, BRD-001 | خودکار          |
| QG-02 | Review → Approved | انطباق با BRD-001                      | Prompt Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3)              | Registry Keeper |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                               |
| ------- | ------------------- | ------ | ---------------------------------- |
| PRM-230 | DEP-01 (Requires)   | ^1.0.0 | برنامه رسانه برای تعیین نوع دارایی |
| BRD-001 | DEP-05 (Provides)   | ^1.0.0 | اصول طراحی و هویت بصری             |
| PRM-401 | DEP-03 (References) | ^1.0.0 | هماهنگی لحن بصری                   |

---

## 14. Human Override

| سناریو                                 | اقدام                         |
| -------------------------------------- | ----------------------------- |
| تعارض قواعد ترکیب با BRD-001           | Escalation به Brand Architect |
| readability_checklist دارای item ردشده | بازگشت به AI-006 برای اصلاح   |

---

## 15. Governance Notes

| ID     | یادداشت                                       |
| ------ | --------------------------------------------- |
| GOV-01 | A-3 (Strategic) — نیازمند ADR + تأیید مدیر    |
| GOV-02 | C-3 (Complex) — ترکیب قواعد بصری با هویت برند |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-231",
  "name": "Visual Composition Instruction",
  "family": "FAM-CON",
  "subfamily": "CON-MED",
  "type": "PT-04",
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
    { "type": "CTX-04", "source": "PRM-230", "required": true },
    { "type": "CTX-02", "source": "PRM-401", "required": true },
    { "type": "CTX-02", "source": "BRD-001", "required": true }
  ],
  "max_tokens": 4000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "media_plan", "type": "VAR-06", "required": true },
    {
      "id": "asset_type",
      "type": "VAR-04",
      "required": true,
      "members": ["image", "infographic", "illustration", "banner", "social_card", "presentation"]
    },
    {
      "id": "composition_intent",
      "type": "VAR-04",
      "required": false,
      "members": ["informative", "promotional", "educational", "brand_building"],
      "default": "informative"
    }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["media_plan", "asset_type"],
    "optional": ["composition_intent"]
  },
  "output": {
    "required": ["composition_rules", "visual_hierarchy"],
    "optional": ["grid_spec", "emphasis_map", "readability_checklist"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Composition consistent with BRD-001", "severity": "error" },
    { "id": "VAL-02", "description": "Visual hierarchy is unambiguous", "severity": "warning" },
    { "id": "VAL-03", "description": "Spacing follows enterprise grid", "severity": "warning" },
    {
      "id": "VAL-04",
      "description": "Readability ensured at all target sizes",
      "severity": "error"
    }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-006"],
  "dependencies": ["PRM-230", "BRD-001", "PRM-401"],
  "documentation_refs": ["BRD-001", "BRD-002"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                          | توسط        |
| ----------- | ---------- | ------------------------------ | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — قواعد ترکیب بصری | معمار سیستم |
