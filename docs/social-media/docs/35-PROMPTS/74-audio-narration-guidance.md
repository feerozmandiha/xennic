# Audio & Narration Guidance — راهنمای صدا و روایت

> **شناسه:** PRM-242
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Video Producer
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-240](./70-video-storyboard-planning.md), [PRM-401](./40-brand-voice-context.md), [PRM-205](./28-accessibility-enhancement-instruction.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                      |
| ------------------ | -------------------------- |
| **id**             | PRM-242                    |
| **name_fa**        | راهنمای صدا و روایت        |
| **name_en**        | Audio & Narration Guidance |
| **family**         | FAM-CON                    |
| **subfamily**      | CON-VID                    |
| **type**           | PT-04                      |
| **complexity**     | C-2                        |
| **authority**      | A-3                        |
| **owner**          | Video Producer             |
| **version**        | 1.0.0-draft                |
| **status**         | draft                      |
| **security_level** | SL-02                      |

---

## 2. Purpose

PRM-242 راهنمای روایت و صدای سازمانی برای تولید ویدئو را تعریف می‌کند. این پرامپت ساختار روایت، ریتم، هم‌زمانی، راهنمای تلفظ، دسترس‌پذیری و هم‌ترازی زیرنویس را تضمین می‌کند.

### اصول صدا و روایت

| ID    | اصل                                              |
| ----- | ------------------------------------------------ |
| AN-01 | روایت باید با لحن برند (BRD-002) همخوان باشد     |
| AN-02 | ریتم روایت باید با ریتم بصری هماهنگ باشد         |
| AN-03 | هم‌زمانی صدا و تصویر باید دقیق باشد              |
| AN-04 | زیرنویس باید با روایت هم‌تراز و قابل خواندن باشد |

---

## 3. Scope

### Inside Scope

| حوزه             | توضیح                             |
| ---------------- | --------------------------------- |
| ساختار روایت     | قالب و ساختار متن روایت           |
| ریتم             | سرعت و ضرب‌آهنگ گفتار             |
| هم‌زمانی         | تطابق صدا با تصویر                |
| راهنمای تلفظ     | تلفظ صحیح اصطلاحات تخصصی و برند   |
| دسترس‌پذیری      | قواعد caption و audio description |
| هم‌ترازی زیرنویس | تطابق زیرنویس با روایت            |

### Outside Scope

| حوزه              | دلیل         |
| ----------------- | ------------ |
| استوری‌بورد       | حوزه PRM-240 |
| ترکیب صحنه        | حوزه PRM-241 |
| انطباق برند ویدئو | حوزه PRM-243 |
| آمادگی انتشار     | حوزه PRM-244 |

---

## 4. Consumers

| مصرف‌کننده                | نقش                       | نوع مصرف |
| ------------------------- | ------------------------- | -------- |
| AI-007 (Video Production) | تولید و تطبیق روایت و صدا | Chain    |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-240 Output",
        "scope": ["storyboard-plan", "pacing-schedule"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PRM-401",
        "scope": ["brand-voice-dimensions", "speech-patterns"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PRM-205",
        "scope": ["accessibility-standards", "caption-rules"],
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

| منبع    | دامنه       | کاربرد                            |
| ------- | ----------- | --------------------------------- |
| PRM-401 | صدای برند   | الگوهای گفتار و لحن               |
| PRM-205 | دسترس‌پذیری | قواعد caption و audio description |

---

## 7. Variables

| متغیر                 | نوع    | اجباری | توضیح                         | اعتبارسنجی                             |
| --------------------- | ------ | ------ | ----------------------------- | -------------------------------------- |
| `storyboard_plan`     | VAR-06 | بله    | برنامه استوری‌بورد از PRM-240 | —                                      |
| `narration_language`  | VAR-04 | بله    | زبان روایت                    | members: [fa, en, ar, tr], default: fa |
| `generate_captions`   | VAR-03 | خیر    | تولید خودکار زیرنویس          | default: true                          |
| `pronunciation_guide` | VAR-07 | خیر    | اصطلاحات خاص با تلفظ صحیح     | —                                      |

---

## 8. Constraints

| ID     | محدودیت                                     |
| ------ | ------------------------------------------- |
| CST-01 | روایت باید با BRD-002 همخوان باشد           |
| CST-02 | هم‌زمانی صدا و تصویر ≤ ۱۰۰ms خطا            |
| CST-03 | زیرنویس باید با WCAG 2.2 مطابقت داشته باشد  |
| CST-04 | کلمات کلیدی برند باید با تلفظ رسمی ادا شوند |

---

## 9. Input Contract

| ورودی                 | نوع     | منبع    | اجباری |
| --------------------- | ------- | ------- | ------ |
| `storyboard_plan`     | object  | PRM-240 | بله    |
| `narration_language`  | enum    | AI-007  | بله    |
| `generate_captions`   | boolean | AI-007  | خیر    |
| `pronunciation_guide` | array   | AI-007  | خیر    |

---

## 10. Output Contract

| خروجی                   | نوع    | توضیح                        |
| ----------------------- | ------ | ---------------------------- |
| `narration_script`      | object | متن کامل روایت با timing     |
| `pacing_map`            | array  | نقشه ریتم با برچسب‌های زمانی |
| `synchronization_spec`  | object | مشخصات هم‌زمانی صدا و تصویر  |
| `pronunciation_lexicon` | array  | واژگان تلفظ با IPA           |
| `subtitle_tracks`       | object | زیرنویس‌های تولیدشده         |
| `audio_spec`            | object | مشخصات فنی صدا               |

---

## 11. Validation Rules

| ID     | قاعده                           | سطح    | نقض     |
| ------ | ------------------------------- | ------ | ------- |
| VAL-01 | لحن روایت با BRD-002 همخوان است | معماری | عدم ثبت |
| VAL-02 | هم‌زمانی ≤ ۱۰۰ms خطا            | معماری | عدم ثبت |
| VAL-03 | زیرنویس مطابق WCAG 2.2          | معماری | هشدار   |
| VAL-04 | تلفظ برند مطابق رسمی            | معماری | عدم ثبت |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                                  | مسئول           |
| ----- | ----------------- | -------------------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل, وابستگی به PRM-240, PRM-401 | خودکار          |
| QG-02 | Review → Approved | انطباق با PRM-401, PRM-205             | Prompt Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3)              | Registry Keeper |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                             |
| ------- | ------------------- | ------ | -------------------------------- |
| PRM-240 | DEP-01 (Requires)   | ^1.0.0 | برنامه استوری‌بورد برای هم‌زمانی |
| PRM-401 | DEP-05 (Provides)   | ^1.0.0 | صدای برند و الگوهای گفتار        |
| PRM-205 | DEP-03 (References) | ^1.0.0 | استانداردهای caption             |

---

## 14. Human Override

| سناریو           | اقدام                         |
| ---------------- | ----------------------------- |
| تلفظ نادرست برند | Escalation به Brand Architect |
| هم‌زمانی > ۱۰۰ms | بازگشت به AI-007 برای اصلاح   |

---

## 15. Governance Notes

| ID     | یادداشت                                             |
| ------ | --------------------------------------------------- |
| GOV-01 | A-3 (Strategic) — نیازمند ADR + تأیید مدیر          |
| GOV-02 | تغییر در تلفظ رسمی برند نیازمند به‌روزرسانی BRD-002 |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-242",
  "name": "Audio & Narration Guidance",
  "family": "FAM-CON",
  "subfamily": "CON-VID",
  "type": "PT-04",
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
    { "type": "CTX-04", "source": "PRM-240", "required": true },
    { "type": "CTX-02", "source": "PRM-401", "required": true },
    { "type": "CTX-02", "source": "PRM-205", "required": false }
  ],
  "max_tokens": 3000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "storyboard_plan", "type": "VAR-06", "required": true },
    {
      "id": "narration_language",
      "type": "VAR-04",
      "required": true,
      "members": ["fa", "en", "ar", "tr"],
      "default": "fa"
    },
    { "id": "generate_captions", "type": "VAR-03", "required": false, "default": true },
    { "id": "pronunciation_guide", "type": "VAR-07", "required": false }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["storyboard_plan", "narration_language"],
    "optional": ["generate_captions", "pronunciation_guide"]
  },
  "output": {
    "required": ["narration_script", "synchronization_spec"],
    "optional": ["pacing_map", "pronunciation_lexicon", "subtitle_tracks", "audio_spec"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Narration tone matches BRD-002", "severity": "error" },
    { "id": "VAL-02", "description": "Sync error ≤ 100ms", "severity": "error" },
    { "id": "VAL-03", "description": "Captions conform to WCAG 2.2", "severity": "warning" },
    { "id": "VAL-04", "description": "Brand pronunciation matches official", "severity": "error" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-007"],
  "dependencies": ["PRM-240", "PRM-401", "PRM-205"],
  "documentation_refs": ["PRM-401", "PRM-205", "BRD-002"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                             | توسط        |
| ----------- | ---------- | --------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — راهنمای صدا و روایت | معمار سیستم |
