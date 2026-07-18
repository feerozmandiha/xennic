# Video Brand Compliance — انطباق برند ویدئو

> **شناسه:** PRM-243
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Video Producer
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-241](./72-video-scene-composition.md), [PRM-242](./74-audio-narration-guidance.md), [PRM-401](./40-brand-voice-context.md), [BRD-001](../22-BRAND/10-brand-identity.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                  |
| ------------------ | ---------------------- |
| **id**             | PRM-243                |
| **name_fa**        | انطباق برند ویدئو      |
| **name_en**        | Video Brand Compliance |
| **family**         | FAM-CON                |
| **subfamily**      | CON-VID                |
| **type**           | PT-06                  |
| **complexity**     | C-2                    |
| **authority**      | A-3                    |
| **owner**          | Video Producer         |
| **version**        | 1.0.0-draft            |
| **status**         | draft                  |
| **security_level** | SL-02                  |

---

## 2. Purpose

PRM-243 انطباق همه ویدئوهای سازمانی با هویت برند را تضمین می‌کند. این پرامپت هویت بصری، هویت حرکتی، تایپوگرافی، خط‌مشی intro/outro، استفاده از لوگو و سازگاری برند را اعتبارسنجی می‌کند.

### اصول انطباق برند ویدئو

| ID    | اصل                                                             |
| ----- | --------------------------------------------------------------- |
| VB-01 | همه ویدئوها باید با هویت بصری برند (BRD-001) مطابقت داشته باشند |
| VB-02 | هویت حرکتی باید از اصول motion brand پیروی کند                  |
| VB-03 | intro/outro باید از قالب رسمی برند باشد                         |
| VB-04 | استفاده از لوگو باید مطابق guidelines برند باشد                 |

---

## 3. Scope

### Inside Scope

| حوزه            | توضیح                             |
| --------------- | --------------------------------- |
| هویت بصری       | بررسی انطباق ویدئو با BRD-001     |
| هویت حرکتی      | بررسی اصول motion و animation     |
| تایپوگرافی      | بررسی فونت و انیمیشن متن در ویدئو |
| intro/outro     | بررسی انطباق با قالب رسمی         |
| استفاده از لوگو | بررسی جانمایی و انیمیشن لوگو      |
| سازگاری برند    | یکپارچگی بصری و محتوایی           |

### Outside Scope

| حوزه          | دلیل                 |
| ------------- | -------------------- |
| ترکیب صحنه    | حوزه PRM-241         |
| صدا و روایت   | حوزه PRM-242         |
| دسترس‌پذیری   | حوزه PRM-233 (رسانه) |
| آمادگی انتشار | حوزه PRM-244         |

---

## 4. Consumers

| مصرف‌کننده                | نقش                          | نوع مصرف |
| ------------------------- | ---------------------------- | -------- |
| AI-007 (Video Production) | اعتبارسنجی انطباق برند ویدئو | Chain    |
| AI-004 (Content Review)   | اعتبارسنجی نهایی انطباق برند | Chain    |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-241 Output",
        "scope": ["scene-composition", "framing-spec"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-04",
        "source": "PRM-242 Output",
        "scope": ["narration-script", "audio-spec"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "BRD-001",
        "scope": ["brand-identity", "motion-guidelines", "video-templates", "logo-usage"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PRM-401",
        "scope": ["brand-voice-dimensions"],
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

| منبع    | دامنه     | کاربرد                                         |
| ------- | --------- | ---------------------------------------------- |
| BRD-001 | هویت برند | motion guidelines, video templates, logo usage |
| BRD-002 | صدای برند | سازگاری لحن روایت با برند                      |

---

## 7. Variables

| متغیر               | نوع    | اجباری | توضیح                       | اعتبارسنجی    |
| ------------------- | ------ | ------ | --------------------------- | ------------- |
| `scene_composition` | VAR-06 | بله    | ترکیب صحنه از PRM-241       | —             |
| `narration_script`  | VAR-06 | بله    | متن روایت از PRM-242        | —             |
| `strict_mode`       | VAR-03 | خیر    | اعمال سخت‌گیرانه قواعد برند | default: true |

---

## 8. Constraints

| ID     | محدودیت                                           |
| ------ | ------------------------------------------------- |
| CST-01 | intro/outro باید از قالب رسمی BRD-001 باشد        |
| CST-02 | لوگو باید در موقعیت استاندارد قرار گیرد           |
| CST-03 | motion باید با اصول brand motion سازگار باشد      |
| CST-04 | انیمیشن متن باید از کتابخانه تایپوگرافی برند باشد |

---

## 9. Input Contract

| ورودی               | نوع     | منبع           | اجباری |
| ------------------- | ------- | -------------- | ------ |
| `scene_composition` | object  | PRM-241        | بله    |
| `narration_script`  | object  | PRM-242        | بله    |
| `strict_mode`       | boolean | AI-007, AI-004 | خیر    |

---

## 10. Output Contract

| خروجی                            | نوع     | توضیح                          |
| -------------------------------- | ------- | ------------------------------ |
| `video_compliance_report`        | object  | گزارش کامل انطباق برند ویدئو   |
| `visual_identity_score`          | number  | امتیاز هویت بصری (۰–۱۰۰)       |
| `motion_identity_score`          | number  | امتیاز هویت حرکتی (۰–۱۰۰)      |
| `intro_outro_score`              | number  | امتیاز intro/outro (۰–۱۰۰)     |
| `logo_compliance_score`          | number  | امتیاز استفاده از لوگو (۰–۱۰۰) |
| `overall_video_compliance_score` | number  | امتیاز کلی انطباق (۰–۱۰۰)      |
| `violations`                     | array   | موارد نقض                      |
| `pass_video_audit`               | boolean | عبور از ممیزی ویدئو            |

---

## 11. Validation Rules

| ID     | قاعده                               | سطح    | نقض     |
| ------ | ----------------------------------- | ------ | ------- |
| VAL-01 | intro/outro از قالب رسمی            | معماری | عدم ثبت |
| VAL-02 | motion با brand motion سازگار       | معماری | عدم ثبت |
| VAL-03 | overall_video_compliance_score ≥ ۸۰ | معماری | عدم ثبت |
| VAL-04 | no high-severity violations         | معماری | عدم ثبت |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                                           | مسئول           |
| ----- | ----------------- | ----------------------------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل, وابستگی به PRM-241, PRM-242, BRD-001 | خودکار          |
| QG-02 | Review → Approved | انطباق با BRD-001                               | Prompt Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3)                       | Registry Keeper |

---

## 13. Dependencies

| شناسه   | نوع               | نسخه   | دلیل                          |
| ------- | ----------------- | ------ | ----------------------------- |
| PRM-241 | DEP-01 (Requires) | ^1.0.0 | ترکیب صحنه برای ممیزی بصری    |
| PRM-242 | DEP-01 (Requires) | ^1.0.0 | روایت برای ممیزی محتوایی      |
| BRD-001 | DEP-05 (Provides) | ^1.0.0 | هویت بصری و motion guidelines |

---

## 14. Human Override

| سناریو                      | اقدام                                  |
| --------------------------- | -------------------------------------- |
| pass_video_audit = false    | Escalation به AI-007 + Brand Architect |
| violations با severity بالا | مسدود شدن انتشار تا رفع                |

---

## 15. Governance Notes

| ID     | یادداشت                                                 |
| ------ | ------------------------------------------------------- |
| GOV-01 | A-3 (Strategic) — نیازمند ADR + تأیید مدیر              |
| GOV-02 | تغییر در BRD-001 نیازمند بازبینی video compliance rules |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-243",
  "name": "Video Brand Compliance",
  "family": "FAM-CON",
  "subfamily": "CON-VID",
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
    { "type": "CTX-04", "source": "PRM-241", "required": true },
    { "type": "CTX-04", "source": "PRM-242", "required": true },
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
    { "id": "scene_composition", "type": "VAR-06", "required": true },
    { "id": "narration_script", "type": "VAR-06", "required": true },
    { "id": "strict_mode", "type": "VAR-03", "required": false, "default": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["scene_composition", "narration_script"],
    "optional": ["strict_mode"]
  },
  "output": {
    "required": ["video_compliance_report", "overall_video_compliance_score", "pass_video_audit"],
    "optional": [
      "visual_identity_score",
      "motion_identity_score",
      "intro_outro_score",
      "logo_compliance_score",
      "violations"
    ]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Intro/outro from official template", "severity": "error" },
    { "id": "VAL-02", "description": "Motion consistent with brand motion", "severity": "error" },
    { "id": "VAL-03", "description": "Overall compliance score ≥ 80", "severity": "error" },
    { "id": "VAL-04", "description": "No high-severity violations", "severity": "error" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-007", "AI-004"],
  "dependencies": ["PRM-241", "PRM-242", "BRD-001"],
  "documentation_refs": ["BRD-001", "BRD-002", "PRM-401"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                           | توسط        |
| ----------- | ---------- | ------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — انطباق برند ویدئو | معمار سیستم |
