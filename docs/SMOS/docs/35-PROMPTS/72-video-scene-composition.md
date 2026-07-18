# Video Scene Composition — ترکیب صحنه ویدئو

> **شناسه:** PRM-241
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Video Producer
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-240](./70-video-storyboard-planning.md), [PRM-401](./40-brand-voice-context.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                   |
| ------------------ | ----------------------- |
| **id**             | PRM-241                 |
| **name_fa**        | ترکیب صحنه ویدئو        |
| **name_en**        | Video Scene Composition |
| **family**         | FAM-CON                 |
| **subfamily**      | CON-VID                 |
| **type**           | PT-04                   |
| **complexity**     | C-3                     |
| **authority**      | A-3                     |
| **owner**          | Video Producer          |
| **version**        | 1.0.0-draft             |
| **status**         | draft                   |
| **security_level** | SL-02                   |

---

## 2. Purpose

PRM-241 اصول ترکیب صحنه ویدئوی سازمانی را تعریف می‌کند. این پرامپت قاب‌بندی، ترکیب‌بندی، پیوستگی، جریان بصری، سازگاری صحنه و سلسله‌مراتب سینمایی را تضمین می‌کند.

### اصول ترکیب صحنه

| ID    | اصل                                      |
| ----- | ---------------------------------------- |
| SC-01 | هر صحنه باید دارای نقطه کانونی مشخص باشد |
| SC-02 | پیوستگی بصری بین صحنه‌های متوالی حفظ شود |
| SC-03 | قاب‌بندی باید از قانون یک‌سوم پیروی کند  |
| SC-04 | جریان بصری باید مخاطب را هدایت کند       |

---

## 3. Scope

### Inside Scope

| حوزه                | توضیح                           |
| ------------------- | ------------------------------- |
| قاب‌بندی            | positioning, angles, shot types |
| ترکیب‌بندی          | چیدمان عناصر در قاب             |
| پیوستگی             | continuity بین صحنه‌ها          |
| جریان بصری          | حرکت چشم و هدایت توجه           |
| سازگاری صحنه        | یکنواختی سبک بصری               |
| سلسله‌مراتب سینمایی | اهمیت بصری عناصر                |

### Outside Scope

| حوزه          | دلیل         |
| ------------- | ------------ |
| استوری‌بورد   | حوزه PRM-240 |
| صدا و روایت   | حوزه PRM-242 |
| انطباق برند   | حوزه PRM-243 |
| آمادگی انتشار | حوزه PRM-244 |

---

## 4. Consumers

| مصرف‌کننده                | نقش                   | نوع مصرف |
| ------------------------- | --------------------- | -------- |
| AI-007 (Video Production) | اجرای اصول ترکیب صحنه | Chain    |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-240 Output",
        "scope": ["storyboard-plan", "scene-hierarchy", "narrative-arc"],
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
        "scope": ["visual-identity", "motion-guidelines"],
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

| منبع    | دامنه          | کاربرد                      |
| ------- | -------------- | --------------------------- |
| BRD-001 | هویت بصری برند | اصول حرکت و هویت بصری ویدئو |
| BRD-002 | صدای برند      | لحن بصری در صحنه‌ها         |

---

## 7. Variables

| متغیر             | نوع    | اجباری | توضیح                         | اعتبارسنجی                                                                           |
| ----------------- | ------ | ------ | ----------------------------- | ------------------------------------------------------------------------------------ |
| `storyboard_plan` | VAR-06 | بله    | برنامه استوری‌بورد از PRM-240 | —                                                                                    |
| `scene_id`        | VAR-05 | بله    | شناسه صحنه هدف                | —                                                                                    |
| `shot_type`       | VAR-04 | خیر    | نوع شات ترجیحی                | members: [wide, medium, closeup, extreme_closeup, aerial, tracking], default: medium |

---

## 8. Constraints

| ID     | محدودیت                                               |
| ------ | ----------------------------------------------------- |
| CST-01 | قاب‌بندی باید با هویت بصری برند همخوان باشد           |
| CST-02 | پیوستگی بصری بین صحنه‌ها باید بدون discontinuity باشد |
| CST-03 | تغییر shot type باید با ریتم ویدئو هماهنگ باشد        |
| CST-04 | سلسله‌مراتب سینمایی باید unambiguous باشد             |

---

## 9. Input Contract

| ورودی             | نوع    | منبع    | اجباری |
| ----------------- | ------ | ------- | ------ |
| `storyboard_plan` | object | PRM-240 | بله    |
| `scene_id`        | string | AI-007  | بله    |
| `shot_type`       | enum   | AI-007  | خیر    |

---

## 10. Output Contract

| خروجی                  | نوع    | توضیح                       |
| ---------------------- | ------ | --------------------------- |
| `scene_composition`    | object | ترکیب کامل صحنه             |
| `framing_spec`         | object | مشخصات قاب‌بندی و shot type |
| `composition_elements` | array  | عناصر ترکیبی در صحنه        |
| `continuity_check`     | object | بررسی پیوستگی با صحنه قبلی  |
| `visual_flow_map`      | object | نقشه جریان بصری             |
| `composition_score`    | number | امتیاز ترکیب (۰–۱۰۰)        |

---

## 11. Validation Rules

| ID     | قاعده                            | سطح    | نقض     |
| ------ | -------------------------------- | ------ | ------- |
| VAL-01 | قاب‌بندی با BRD-001 همخوانی دارد | معماری | عدم ثبت |
| VAL-02 | پیوستگی با صحنه قبلی تضمین شده   | معماری | هشدار   |
| VAL-03 | ترکیب عناصر غیرمبهم است          | معماری | هشدار   |
| VAL-04 | جریان بصری مخاطب را هدایت می‌کند | معماری | عدم ثبت |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                         | مسئول           |
| ----- | ----------------- | ----------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل, وابستگی به PRM-240 | خودکار          |
| QG-02 | Review → Approved | انطباق با BRD-001             | Prompt Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3)     | Registry Keeper |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                               |
| ------- | ------------------- | ------ | ---------------------------------- |
| PRM-240 | DEP-01 (Requires)   | ^1.0.0 | برنامه استوری‌بورد برای ترکیب صحنه |
| BRD-001 | DEP-05 (Provides)   | ^1.0.0 | هویت بصری و اصول حرکت              |
| PRM-401 | DEP-03 (References) | ^1.0.0 | هماهنگی لحن بصری                   |

---

## 14. Human Override

| سناریو                   | اقدام                                           |
| ------------------------ | ----------------------------------------------- |
| composition_score < ۶۰   | Escalation به Video Producer برای بازنگری ترکیب |
| discontinuity در پیوستگی | بازگشت به AI-007 برای اصلاح                     |

---

## 15. Governance Notes

| ID     | یادداشت                                           |
| ------ | ------------------------------------------------- |
| GOV-01 | A-3 (Strategic) — نیازمند ADR + تأیید مدیر        |
| GOV-02 | C-3 (Complex) — ترکیب استوری‌بورد با اصول سینمایی |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-241",
  "name": "Video Scene Composition",
  "family": "FAM-CON",
  "subfamily": "CON-VID",
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
    { "type": "CTX-04", "source": "PRM-240", "required": true },
    { "type": "CTX-02", "source": "PRM-401", "required": true },
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
    { "id": "storyboard_plan", "type": "VAR-06", "required": true },
    { "id": "scene_id", "type": "VAR-05", "required": true },
    {
      "id": "shot_type",
      "type": "VAR-04",
      "required": false,
      "members": ["wide", "medium", "closeup", "extreme_closeup", "aerial", "tracking"],
      "default": "medium"
    }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["storyboard_plan", "scene_id"],
    "optional": ["shot_type"]
  },
  "output": {
    "required": ["scene_composition", "framing_spec"],
    "optional": ["composition_elements", "continuity_check", "visual_flow_map", "composition_score"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Framing consistent with BRD-001", "severity": "error" },
    { "id": "VAL-02", "description": "Continuity with previous scene", "severity": "warning" },
    { "id": "VAL-03", "description": "Composition unambiguous", "severity": "warning" },
    { "id": "VAL-04", "description": "Visual flow guides audience", "severity": "error" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-007"],
  "dependencies": ["PRM-240", "BRD-001", "PRM-401"],
  "documentation_refs": ["BRD-001", "BRD-002"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                          | توسط        |
| ----------- | ---------- | ------------------------------ | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — ترکیب صحنه ویدئو | معمار سیستم |
