# Video Storyboard Planning — برنامه‌ریزی استوری‌بورد ویدئو

> **شناسه:** PRM-240
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Video Producer
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-230](./60-media-planning-instruction.md), [PRM-402](./42-content-taxonomy-context.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                         |
| ------------------ | ----------------------------- |
| **id**             | PRM-240                       |
| **name_fa**        | برنامه‌ریزی استوری‌بورد ویدئو |
| **name_en**        | Video Storyboard Planning     |
| **family**         | FAM-CON                       |
| **subfamily**      | CON-VID                       |
| **type**           | PT-04                         |
| **complexity**     | C-3                           |
| **authority**      | A-3                           |
| **owner**          | Video Producer                |
| **version**        | 1.0.0-draft                   |
| **status**         | draft                         |
| **security_level** | SL-02                         |

---

## 2. Purpose

PRM-240 برنامه‌ریزی استوری‌بورد متعارف برای تولید ویدئوی سازمانی را تعریف می‌کند. این پرامپت سلسله‌مراتب صحنه، ساختار روایت، توالی‌یابی، انتقال‌ها، ریتم و زمان‌بندی را مشخص می‌کند.

### اصول استوری‌بورد ویدئو

| ID    | اصل                                                          |
| ----- | ------------------------------------------------------------ |
| VS-01 | هر ویدئو دارای ساختار روایی سه‌بخشی (شروع، میانه، پایان) است |
| VS-02 | سلسله‌مراتب صحنه‌ها باید پیام اصلی را تقویت کند              |
| VS-03 | انتقال‌ها باید روان و غیرمخرب باشند                          |
| VS-04 | ریتم و زمان‌بندی باید با هدف محتوا هماهنگ باشد               |

---

## 3. Scope

### Inside Scope

| حوزه             | توضیح                       |
| ---------------- | --------------------------- |
| سلسله‌مراتب صحنه | ساختار سلسله‌مراتبی صحنه‌ها |
| ساختار روایت     | قوس روایی و ساختار داستانی  |
| توالی‌یابی       | ترتیب منطقی صحنه‌ها         |
| انتقال‌ها        | انواع انتقال بین صحنه‌ها    |
| ریتم و زمان‌بندی | سرعت و ضرب‌آهنگ ویدئو       |

### Outside Scope

| حوزه              | دلیل         |
| ----------------- | ------------ |
| ترکیب صحنه        | حوزه PRM-241 |
| صدا و روایت       | حوزه PRM-242 |
| انطباق برند ویدئو | حوزه PRM-243 |
| آمادگی انتشار     | حوزه PRM-244 |

---

## 4. Consumers

| مصرف‌کننده                | نقش                           | نوع مصرف |
| ------------------------- | ----------------------------- | -------- |
| AI-007 (Video Production) | برنامه‌ریزی استوری‌بورد ویدئو | Chain    |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-230 Output",
        "scope": ["media-plan", "asset-goals", "production-priorities"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PRM-402",
        "scope": ["content-attributes", "ct-id-rules"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PRM-401",
        "scope": ["brand-voice-dimensions", "narrative-tone"],
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

| منبع    | دامنه        | کاربرد                         |
| ------- | ------------ | ------------------------------ |
| PRM-230 | برنامه رسانه | اهداف و اولویت‌های تولید ویدئو |
| BRD-002 | صدای برند    | لحن روایت و سبک داستان‌گویی    |

---

## 7. Variables

| متغیر             | نوع    | اجباری | توضیح                   | اعتبارسنجی                                                                           |
| ----------------- | ------ | ------ | ----------------------- | ------------------------------------------------------------------------------------ |
| `media_plan`      | VAR-06 | بله    | برنامه رسانه از PRM-230 | —                                                                                    |
| `video_duration`  | VAR-02 | بله    | مدت زمان هدف (ثانیه)    | min: 15, max: 1800                                                                   |
| `narrative_style` | VAR-04 | خیر    | سبک روایت               | members: [linear, nonlinear, documentary, promotional, educational], default: linear |
| `scene_count`     | VAR-02 | خیر    | تعداد صحنه‌ها           | min: 1, max: 50, default: 8                                                          |

---

## 8. Constraints

| ID     | محدودیت                                                |
| ------ | ------------------------------------------------------ |
| CST-01 | ساختار روایی باید پیام اصلی محتوا را منتقل کند         |
| CST-02 | انتقال‌ها باید از کتابخانه انتقال سازمانی باشند        |
| CST-03 | مدت زمان کل باید با budget ثانیه‌ای همخوانی داشته باشد |
| CST-04 | ریتم باید با مخاطب هدف سازگار باشد                     |

---

## 9. Input Contract

| ورودی             | نوع    | منبع    | اجباری |
| ----------------- | ------ | ------- | ------ |
| `media_plan`      | object | PRM-230 | بله    |
| `video_duration`  | number | AI-007  | بله    |
| `narrative_style` | enum   | AI-007  | خیر    |
| `scene_count`     | number | AI-007  | خیر    |

---

## 10. Output Contract

| خروجی                       | نوع    | توضیح                           |
| --------------------------- | ------ | ------------------------------- |
| `storyboard_plan`           | object | برنامه کامل استوری‌بورد         |
| `scene_hierarchy`           | array  | سلسله‌مراتب صحنه‌ها با شناسه    |
| `narrative_arc`             | object | قوس روایی و ساختار داستانی      |
| `transition_map`            | array  | نگاشت انتقال‌های بین صحنه‌ها    |
| `pacing_schedule`           | object | برنامه ریتم و زمان‌بندی         |
| `storyboard_coverage_score` | number | امتیاز پوشش استوری‌بورد (۰–۱۰۰) |

---

## 11. Validation Rules

| ID     | قاعده                                  | سطح    | نقض     |
| ------ | -------------------------------------- | ------ | ------- |
| VAL-01 | ساختار روایی دارای شروع، میانه و پایان | معماری | هشدار   |
| VAL-02 | مدت زمان کل با budget همخوانی دارد     | معماری | عدم ثبت |
| VAL-03 | انتقال‌ها از کتابخانه مجاز             | معماری | هشدار   |
| VAL-04 | scene_hierarchy غیرچرخه‌ای             | معماری | عدم ثبت |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                                  | مسئول           |
| ----- | ----------------- | -------------------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل, وابستگی به PRM-230, PRM-402 | خودکار          |
| QG-02 | Review → Approved | انطباق با BRD-002                      | Prompt Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3)              | Registry Keeper |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                                |
| ------- | ------------------- | ------ | ----------------------------------- |
| PRM-230 | DEP-01 (Requires)   | ^1.0.0 | برنامه رسانه برای تعیین اهداف ویدئو |
| PRM-402 | DEP-03 (References) | ^1.0.0 | بافت تاکسونومی برای تطابق روایت     |
| PRM-401 | DEP-03 (References) | ^1.0.0 | هماهنگی لحن روایت                   |

---

## 14. Human Override

| سناریو                         | اقدام                                                 |
| ------------------------------ | ----------------------------------------------------- |
| storyboard_coverage_score < ۶۰ | Escalation به Video Producer برای بازنگری استوری‌بورد |
| تعارض narrative_style با CT-ID | Escalation به Content Strategist                      |

---

## 15. Governance Notes

| ID     | یادداشت                                            |
| ------ | -------------------------------------------------- |
| GOV-01 | A-3 (Strategic) — نیازمند ADR + تأیید مدیر         |
| GOV-02 | C-3 (Complex) — ترکیب برنامه رسانه با ساختار روایی |
| GOV-03 | کتابخانه انتقال سازمانی در BRD-001 تعریف می‌شود    |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-240",
  "name": "Video Storyboard Planning",
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
    { "type": "CTX-04", "source": "PRM-230", "required": true },
    { "type": "CTX-02", "source": "PRM-402", "required": true },
    { "type": "CTX-02", "source": "PRM-401", "required": false }
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
    { "id": "video_duration", "type": "VAR-02", "required": true, "min": 15, "max": 1800 },
    {
      "id": "narrative_style",
      "type": "VAR-04",
      "required": false,
      "members": ["linear", "nonlinear", "documentary", "promotional", "educational"],
      "default": "linear"
    },
    { "id": "scene_count", "type": "VAR-02", "required": false, "min": 1, "max": 50, "default": 8 }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["media_plan", "video_duration"],
    "optional": ["narrative_style", "scene_count"]
  },
  "output": {
    "required": ["storyboard_plan", "scene_hierarchy", "narrative_arc"],
    "optional": ["transition_map", "pacing_schedule", "storyboard_coverage_score"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    {
      "id": "VAL-01",
      "description": "Narrative has beginning, middle, end",
      "severity": "warning"
    },
    { "id": "VAL-02", "description": "Duration matches budget", "severity": "error" },
    { "id": "VAL-03", "description": "Transitions from allowed library", "severity": "warning" },
    { "id": "VAL-04", "description": "Scene hierarchy is acyclic", "severity": "error" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-007"],
  "dependencies": ["PRM-230", "PRM-402", "PRM-401"],
  "documentation_refs": ["BRD-002"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                                       | توسط        |
| ----------- | ---------- | ------------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — برنامه‌ریزی استوری‌بورد ویدئو | معمار سیستم |
