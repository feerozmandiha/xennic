# Media Production Readiness — آمادگی تولید رسانه

> **شناسه:** PRM-234
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Media Producer
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-232](./64-brand-visual-compliance.md), [PRM-233](./66-accessibility-media-validation.md), [PRM-402](./42-content-taxonomy-context.md), [PRM-301](./30-publishing-instruction.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                      |
| ------------------ | -------------------------- |
| **id**             | PRM-234                    |
| **name_fa**        | آمادگی تولید رسانه         |
| **name_en**        | Media Production Readiness |
| **family**         | FAM-CON                    |
| **subfamily**      | CON-MED                    |
| **type**           | PT-06                      |
| **complexity**     | C-3                        |
| **authority**      | A-3                        |
| **owner**          | Media Producer             |
| **version**        | 1.0.0-draft                |
| **status**         | draft                      |
| **security_level** | SL-02                      |

---

## 2. Purpose

PRM-234 آمادگی بسته دارایی رسانه را برای تولید و انتشار تعیین می‌کند. این پرامپت امتیاز آمادگی، مسائل مسدودکننده، خلاصه کیفیت و توصیه تولید را ارائه می‌دهد و آخرین گیت خروجی در زنجیره CON-MED است.

### اصول آمادگی تولید

| ID    | اصل                                                             |
| ----- | --------------------------------------------------------------- |
| PR-01 | بسته رسانه فقط در صورت گذر از همه اعتبارسنجی‌ها قابل انتشار است |
| PR-02 | هر مسأله مسدودکننده باید قابل ردیابی به یک پرامپت upstream باشد |
| PR-03 | امتیاز آمادگی باید ترکیب موزونی از همه ابعاد باشد               |
| PR-04 | توصیه تولید باید قابل اجرا و مشخص باشد                          |

---

## 3. Scope

### Inside Scope

| حوزه             | توضیح                                |
| ---------------- | ------------------------------------ |
| امتیاز آمادگی    | محاسبه امتیاز کلی از ترکیب ابعاد     |
| مسائل مسدودکننده | شناسایی موارد جلوگیری از انتشار      |
| خلاصه کیفیت      | جمع‌بندی کیفیت از همه زنجیره CON-MED |
| توصیه تولید      | پیشنهاد下一步 اقدام                  |
| گزارش نهایی      | بسته کامل برای AI-008                |

### Outside Scope

| حوزه                   | دلیل         |
| ---------------------- | ------------ |
| اعتبارسنجی انطباق برند | حوزه PRM-232 |
| اعتبارسنجی دسترس‌پذیری | حوزه PRM-233 |
| آماده‌سازی برای انتشار | حوزه PRM-301 |

---

## 4. Consumers

| مصرف‌کننده                      | نقش                           | نوع مصرف |
| ------------------------------- | ----------------------------- | -------- |
| AI-006 (Media Asset Production) | تعیین آمادگی بسته رسانه       | Chain    |
| AI-007 (Video Production)       | تعیین آمادگی بسته ویدئویی     | Chain    |
| AI-008 (Publishing)             | دریافت بسته آماده برای انتشار | Chain    |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-232 Output",
        "scope": ["compliance-report", "overall-compliance-score", "violations"],
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
        "scope": ["publishing-requirements", "format-specifications"],
        "injection": "append",
        "required": false
      },
      {
        "type": "CTX-02",
        "source": "PLAT-*",
        "scope": ["platform-media-requirements"],
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

| منبع    | دامنه     | کاربرد                         |
| ------- | --------- | ------------------------------ |
| PLAT-\* | پلتفرم‌ها | الزامات فنی برای انتشار دارایی |

---

## 7. Variables

| متغیر                  | نوع    | اجباری | توضیح                             | اعتبارسنجی                    |
| ---------------------- | ------ | ------ | --------------------------------- | ----------------------------- |
| `compliance_report`    | VAR-06 | بله    | گزارش انطباق از PRM-232           | —                             |
| `accessibility_report` | VAR-06 | بله    | گزارش دسترس‌پذیری از PRM-233      | —                             |
| `target_platforms`     | VAR-07 | خیر    | پلتفرم‌های هدف برای تأیید سازگاری | —                             |
| `readiness_threshold`  | VAR-02 | خیر    | حدنصاب امتیاز آمادگی              | min: 0, max: 100, default: 75 |

---

## 8. Constraints

| ID     | محدودیت                                                                                         |
| ------ | ----------------------------------------------------------------------------------------------- |
| CST-01 | امتیاز آمادگی ترکیب weighted از compliance (۴۰٪), accessibility (۳۰٪), platform readiness (۳۰٪) |
| CST-02 | هر violation با severity بالا -> مسدود شدن                                                      |
| CST-03 | بسته بدون pass_accessibility=false قابل انتشار نیست                                             |

---

## 9. Input Contract

| ورودی                  | نوع    | منبع           | اجباری |
| ---------------------- | ------ | -------------- | ------ |
| `compliance_report`    | object | PRM-232        | بله    |
| `accessibility_report` | object | PRM-233        | بله    |
| `target_platforms`     | array  | AI-006, AI-008 | خیر    |
| `readiness_threshold`  | number | AI-006, AI-008 | خیر    |

---

## 10. Output Contract

| خروجی                       | نوع     | توضیح                                 |
| --------------------------- | ------- | ------------------------------------- |
| `readiness_report`          | object  | گزارش کامل آمادگی تولید               |
| `readiness_score`           | number  | امتیاز کلی آمادگی (۰–۱۰۰)             |
| `blocking_issues`           | array   | مسائل مسدودکننده با منبع upstream     |
| `quality_summary`           | object  | خلاصه کیفیت در ابعاد مختلف            |
| `production_recommendation` | string  | توصیه下一步 (approve, revise, reject) |
| `media_package_ready`       | boolean | آمادگی بسته برای تحویل به AI-008      |

---

## 11. Validation Rules

| ID     | قاعده                                     | سطح    | نقض     |
| ------ | ----------------------------------------- | ------ | ------- |
| VAL-01 | readiness_score ≥ حدنصاب                  | معماری | عدم ثبت |
| VAL-02 | blocking_issues خالی برای approve         | معماری | عدم ثبت |
| VAL-03 | media_package_ready فقط true در صورت عبور | معماری | عدم ثبت |
| VAL-04 | تولید recommendation باید actionable باشد | معماری | هشدار   |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                                  | مسئول           |
| ----- | ----------------- | -------------------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل, وابستگی به PRM-232, PRM-233 | خودکار          |
| QG-02 | Review → Approved | انطباق با PRM-301, PLAT-\*             | Prompt Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3)              | Registry Keeper |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل              |
| ------- | ------------------- | ------ | ----------------- |
| PRM-232 | DEP-01 (Requires)   | ^1.0.0 | گزارش انطباق بصری |
| PRM-233 | DEP-01 (Requires)   | ^1.0.0 | گزارش دسترس‌پذیری |
| PRM-301 | DEP-03 (References) | ^1.0.0 | الزامات انتشار    |

---

## 14. Human Override

| سناریو                           | اقدام                                  |
| -------------------------------- | -------------------------------------- |
| blocking_issues با severity بالا | Escalation به AI-006 + AI-008 برای رفع |
| media_package_ready = false      | بازگشت به ابتدای زنجیره CON-MED        |

---

## 15. Governance Notes

| ID     | یادداشت                                                 |
| ------ | ------------------------------------------------------- |
| GOV-01 | A-3 (Strategic) — نیازمند ADR + تأیید مدیر              |
| GOV-02 | C-3 (Complex) — ترکیب ۲ منبع ورودی + محاسبه امتیاز وزنی |
| GOV-03 | readiness_threshold قابل تنظیم در هر Release Cycle      |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-234",
  "name": "Media Production Readiness",
  "family": "FAM-CON",
  "subfamily": "CON-MED",
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
    { "type": "CTX-04", "source": "PRM-232", "required": true },
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
    { "id": "compliance_report", "type": "VAR-06", "required": true },
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
    "required": ["compliance_report", "accessibility_report"],
    "optional": ["target_platforms", "readiness_threshold"]
  },
  "output": {
    "required": [
      "readiness_report",
      "readiness_score",
      "production_recommendation",
      "media_package_ready"
    ],
    "optional": ["blocking_issues", "quality_summary"]
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
      "description": "media_package_ready true only if all pass",
      "severity": "error"
    },
    {
      "id": "VAL-04",
      "description": "Production recommendation is actionable",
      "severity": "warning"
    }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-006", "AI-007", "AI-008"],
  "dependencies": ["PRM-232", "PRM-233", "PRM-301"],
  "documentation_refs": ["PRM-301", "PLAT-*"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                            | توسط        |
| ----------- | ---------- | -------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — آمادگی تولید رسانه | معمار سیستم |
