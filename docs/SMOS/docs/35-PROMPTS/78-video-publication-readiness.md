# Video Publication Readiness — آمادگی انتشار ویدئو

> **شناسه:** PRM-244
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Video Producer
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-243](./76-video-brand-compliance.md), [PRM-233](./66-accessibility-media-validation.md), [PRM-301](./30-publishing-instruction.md), [PRM-402](./42-content-taxonomy-context.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                       |
| ------------------ | --------------------------- |
| **id**             | PRM-244                     |
| **name_fa**        | آمادگی انتشار ویدئو         |
| **name_en**        | Video Publication Readiness |
| **family**         | FAM-CON                     |
| **subfamily**      | CON-VID                     |
| **type**           | PT-06                       |
| **complexity**     | C-3                         |
| **authority**      | A-3                         |
| **owner**          | Video Producer              |
| **version**        | 1.0.0-draft                 |
| **status**         | draft                       |
| **security_level** | SL-02                       |

---

## 2. Purpose

PRM-244 آمادگی ویدئوی سازمانی را برای انتشار تعیین می‌کند. این پرامپت امتیاز آمادگی، مسائل مسدودکننده، وضعیت دسترس‌پذیری، توصیه انتشار و خلاصه کیفیت را ارائه می‌دهد و آخرین گیت خروجی در زنجیره CON-VID است.

### اصول آمادگی انتشار ویدئو

| ID    | اصل                                                                         |
| ----- | --------------------------------------------------------------------------- |
| VR-01 | ویدئو فقط در صورت گذر از همه اعتبارسنجی‌ها قابل انتشار است                  |
| VR-02 | امتیاز آمادگی ترکیبی از compliance + accessibility + platform readiness است |
| VR-03 | هر مسأله مسدودکننده باید قابل ردیابی به upstream باشد                       |
| VR-04 | توصیه انتشار باید قابل اجرا و مشخص باشد                                     |

---

## 3. Scope

### Inside Scope

| حوزه              | توضیح                                    |
| ----------------- | ---------------------------------------- |
| امتیاز آمادگی     | محاسبه امتیاز کلی از ابعاد مختلف         |
| مسائل مسدودکننده  | شناسایی موارد جلوگیری از انتشار          |
| وضعیت دسترس‌پذیری | خلاصه وضعیت captions و audio description |
| توصیه انتشار      | approve, revise, reject                  |
| خلاصه کیفیت       | جمع‌بندی کیفیت از زنجیره CON-VID         |

### Outside Scope

| حوزه               | دلیل         |
| ------------------ | ------------ |
| انطباق برند ویدئو  | حوزه PRM-243 |
| دسترس‌پذیری رسانه  | حوزه PRM-233 |
| آماده‌سازی پلتفرمی | حوزه PRM-301 |

---

## 4. Consumers

| مصرف‌کننده                | نقش                                  | نوع مصرف |
| ------------------------- | ------------------------------------ | -------- |
| AI-007 (Video Production) | تعیین آمادگی بسته ویدئو              | Chain    |
| AI-008 (Publishing)       | دریافت بسته ویدئوی آماده انتشار      | Chain    |
| AI-010 (Analytics)        | دریافت داده‌های readiness برای تحلیل | Chain    |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-243 Output",
        "scope": ["video-compliance-report", "overall-video-compliance-score", "violations"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-04",
        "source": "PRM-233 Output",
        "scope": ["accessibility-report", "overall-accessibility-score", "blocking-issues"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PRM-301",
        "scope": ["publishing-requirements", "platform-constraints"],
        "injection": "append",
        "required": false
      },
      {
        "type": "CTX-02",
        "source": "PLAT-*",
        "scope": ["video-platform-requirements", "format-specifications"],
        "injection": "append",
        "required": false
      }
    ],
    "max_tokens": 4000,
    "priority": "high"
  }
}
```

---

## 6. Required Knowledge

| منبع    | دامنه     | کاربرد                        |
| ------- | --------- | ----------------------------- |
| PLAT-\* | پلتفرم‌ها | الزامات فنی ویدئو برای انتشار |

---

## 7. Variables

| متغیر                     | نوع    | اجباری | توضیح                             | اعتبارسنجی                    |
| ------------------------- | ------ | ------ | --------------------------------- | ----------------------------- |
| `video_compliance_report` | VAR-06 | بله    | گزارش انطباق از PRM-243           | —                             |
| `accessibility_report`    | VAR-06 | بله    | گزارش دسترس‌پذیری از PRM-233      | —                             |
| `target_platforms`        | VAR-07 | خیر    | پلتفرم‌های هدف برای تأیید سازگاری | —                             |
| `readiness_threshold`     | VAR-02 | خیر    | حدنصاب امتیاز آمادگی              | min: 0, max: 100, default: 75 |

---

## 8. Constraints

| ID     | محدودیت                                                                                |
| ------ | -------------------------------------------------------------------------------------- |
| CST-01 | امتیاز آمادگی = weighted ترکیب compliance (۴۰٪) + accessibility (۳۰٪) + platform (۳۰٪) |
| CST-02 | هر violation با severity بالا → مسدود شدن                                              |
| CST-03 | بسته بدون pass_video_audit قابل انتشار نیست                                            |

---

## 9. Input Contract

| ورودی                     | نوع    | منبع           | اجباری |
| ------------------------- | ------ | -------------- | ------ |
| `video_compliance_report` | object | PRM-243        | بله    |
| `accessibility_report`    | object | PRM-233        | بله    |
| `target_platforms`        | array  | AI-007, AI-008 | خیر    |
| `readiness_threshold`     | number | AI-007, AI-008 | خیر    |

---

## 10. Output Contract

| خروجی                        | نوع     | توضیح                                  |
| ---------------------------- | ------- | -------------------------------------- |
| `video_readiness_report`     | object  | گزارش کامل آمادگی انتشار               |
| `readiness_score`            | number  | امتیاز کلی آمادگی (۰–۱۰۰)              |
| `blocking_issues`            | array   | مسائل مسدودکننده با منبع upstream      |
| `accessibility_status`       | object  | وضعیت دسترس‌پذیری نهایی                |
| `publication_recommendation` | string  | توصیه انتشار (approve, revise, reject) |
| `quality_summary`            | object  | خلاصه کیفیت در ابعاد مختلف             |
| `video_package_ready`        | boolean | آمادگی بسته برای تحویل به AI-008       |

---

## 11. Validation Rules

| ID     | قاعده                                 | سطح    | نقض     |
| ------ | ------------------------------------- | ------ | ------- |
| VAL-01 | readiness_score ≥ حدنصاب              | معماری | عدم ثبت |
| VAL-02 | blocking_issues خالی برای approve     | معماری | عدم ثبت |
| VAL-03 | video_package_ready فقط true با عبور  | معماری | عدم ثبت |
| VAL-04 | publication_recommendation actionable | معماری | هشدار   |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                                  | مسئول           |
| ----- | ----------------- | -------------------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل, وابستگی به PRM-243, PRM-233 | خودکار          |
| QG-02 | Review → Approved | انطباق با PRM-301, PLAT-\*             | Prompt Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3)              | Registry Keeper |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                    |
| ------- | ------------------- | ------ | ----------------------- |
| PRM-243 | DEP-01 (Requires)   | ^1.0.0 | گزارش انطباق برند ویدئو |
| PRM-233 | DEP-01 (Requires)   | ^1.0.0 | گزارش دسترس‌پذیری       |
| PRM-301 | DEP-03 (References) | ^1.0.0 | الزامات انتشار          |

---

## 14. Human Override

| سناریو                           | اقدام                                  |
| -------------------------------- | -------------------------------------- |
| blocking_issues با severity بالا | Escalation به AI-007 + AI-008 برای رفع |
| video_package_ready = false      | بازگشت به ابتدای زنجیره CON-VID        |

---

## 15. Governance Notes

| ID     | یادداشت                                          |
| ------ | ------------------------------------------------ |
| GOV-01 | A-3 (Strategic) — نیازمند ADR + تأیید مدیر       |
| GOV-02 | C-3 (Complex) — ترکیب ۲ منبع ورودی + امتیاز وزنی |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-244",
  "name": "Video Publication Readiness",
  "family": "FAM-CON",
  "subfamily": "CON-VID",
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
    { "type": "CTX-04", "source": "PRM-243", "required": true },
    { "type": "CTX-04", "source": "PRM-233", "required": true },
    { "type": "CTX-02", "source": "PRM-301", "required": false },
    { "type": "CTX-02", "source": "PLAT-*", "required": false }
  ],
  "max_tokens": 4000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "video_compliance_report", "type": "VAR-06", "required": true },
    { "id": "accessibility_report", "type": "VAR-06", "required": true },
    { "id": "target_platforms", "type": "VAR-07", "required": false },
    {
      "id": "readiness_threshold",
      "type": "VAR-02",
      "required": false,
      "min": 0,
      "max": 100,
      "default": 75
    }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["video_compliance_report", "accessibility_report"],
    "optional": ["target_platforms", "readiness_threshold"]
  },
  "output": {
    "required": [
      "video_readiness_report",
      "readiness_score",
      "publication_recommendation",
      "video_package_ready"
    ],
    "optional": ["blocking_issues", "accessibility_status", "quality_summary"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Readiness score ≥ threshold", "severity": "error" },
    { "id": "VAL-02", "description": "Blocking issues empty for approve", "severity": "error" },
    {
      "id": "VAL-03",
      "description": "video_package_ready true only if all pass",
      "severity": "error"
    },
    {
      "id": "VAL-04",
      "description": "Publication recommendation actionable",
      "severity": "warning"
    }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-007", "AI-008", "AI-010"],
  "dependencies": ["PRM-243", "PRM-233", "PRM-301"],
  "documentation_refs": ["PRM-301", "PLAT-*"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                             | توسط        |
| ----------- | ---------- | --------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — آمادگی انتشار ویدئو | معمار سیستم |
