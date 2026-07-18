# Discoverability Validation — اعتبارسنجی قابلیت کشف

> **شناسه:** PRM-224
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Content Producer
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-220](./50-semantic-optimization.md), [PRM-221](./52-search-intent-alignment.md), [PRM-222](./54-internal-linking-strategy.md), [PRM-223](./56-structured-metadata-enhancement.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                      |
| ------------------ | -------------------------- |
| **id**             | PRM-224                    |
| **name_fa**        | اعتبارسنجی قابلیت کشف      |
| **name_en**        | Discoverability Validation |
| **family**         | FAM-CON                    |
| **subfamily**      | CON-SEO                    |
| **type**           | PT-06                      |
| **complexity**     | C-3                        |
| **authority**      | A-3                        |
| **owner**          | Content Reviewer           |
| **version**        | 1.0.0-draft                |
| **status**         | draft                      |
| **security_level** | SL-02                      |

---

## 2. Purpose

PRM-224 محتوای متعارف نهایی (خروجی PRM-220 تا PRM-223) را در برابر معیارهای قابلیت کشف سازمانی اعتبارسنجی می‌کند. این پرامپت تضمین می‌کند محتوا در موتورهای جستجو، پلتفرم‌های اجتماعی و سیستم‌های داخلی SMOS قابل کشف است.

### اصول اعتبارسنجی قابلیت کشف

| ID    | اصل                                                                  |
| ----- | -------------------------------------------------------------------- |
| DV-01 | قابلیت کشف باید در سه سطح سنجیده شود: داخلی SMOS, خارجی SEO, اجتماعی |
| DV-02 | محتوا باید حداقل امتیاز آستانه را در هر سطح کسب کند                  |
| DV-03 | هر شکاف کشف باید به یک نقص قابل ردیابی نگاشت شود                     |
| DV-04 | اعتبارسنجی باید غیرتخریبی باشد — محتوا تغییر نمی‌کند                 |

---

## 3. Scope

### Inside Scope

| حوزه               | توضیح                                     |
| ------------------ | ----------------------------------------- |
| قابلیت کشف معنایی  | بررسی تطابق محتوا با ساختار معنایی        |
| قابلیت کشف فنی     | بررسی فراداده، پیوندها، schema.org        |
| قابلیت کشف اجتماعی | بررسی Open Graph, Twitter Card, پلتفرم‌ها |
| قابلیت کشف سازمانی | بررسی قابلیت نمایه‌سازی در KNW-\*         |
| گزارش شکاف         | تولید گزارش کامل از نقاط ضعف و راهکار     |

### Outside Scope

| حوزه                     | دلیل                    |
| ------------------------ | ----------------------- |
| بهینه‌سازی (اصلاح) محتوا | حوزه PRM-220 تا PRM-223 |
| اعتبارسنجی کیفیت محتوا   | حوزه PRM-208            |
| اعتبارسنجی آمادگی انتشار | حوزه PRM-214            |
| بهینه‌شناسی سئوی فنی     | خارج از تکنولوژی-خنثایی |

---

## 4. Consumers

| مصرف‌کننده                   | نقش                                               | نوع مصرف |
| ---------------------------- | ------------------------------------------------- | -------- |
| AI-005 (Search Optimization) | دریافت گزارش اعتبارسنجی برای تکرار بهینه‌سازی     | Chain    |
| AI-008 (Publishing)          | دریافت تأیید قابلیت کشف پیش از انتشار             | Chain    |
| AI-010 (Analytics)           | دریافت داده‌های پایه قابلیت کشف برای تحلیل عملکرد | Chain    |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-220 Output",
        "scope": ["semantic-report", "semantic-fidelity-score"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-04",
        "source": "PRM-221 Output",
        "scope": ["intent-report", "alignment-score"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-04",
        "source": "PRM-222 Output",
        "scope": ["linking-report", "linking-score"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-04",
        "source": "PRM-223 Output",
        "scope": ["metadata-report", "metadata-coverage-score", "schema-jsonld"],
        "injection": "prepend",
        "required": true
      }
    ],
    "max_tokens": 6000,
    "priority": "high"
  }
}
```

---

## 6. Required Knowledge

| منبع    | دامنه     | کاربرد                            |
| ------- | --------- | --------------------------------- |
| EDT-002 | تاکسونومی | معیارهای قابلیت کشف به ازای CT-ID |
| PLAT-\* | پلتفرم‌ها | الزامات کشف پلتفرمی               |

---

## 7. Variables

| متغیر              | نوع    | اجباری | توضیح                      | اعتبارسنجی                                          |
| ------------------ | ------ | ------ | -------------------------- | --------------------------------------------------- |
| `semantic_report`  | VAR-06 | بله    | گزارش معنایی از PRM-220    | —                                                   |
| `intent_report`    | VAR-06 | بله    | گزارش قصد جستجو از PRM-221 | —                                                   |
| `linking_report`   | VAR-06 | بله    | گزارش پیوند از PRM-222     | —                                                   |
| `metadata_report`  | VAR-06 | بله    | گزارش فراداده از PRM-223   | —                                                   |
| `validation_level` | VAR-04 | خیر    | عمق اعتبارسنجی             | members: [quick, standard, deep], default: standard |

---

## 8. Constraints

| ID     | محدودیت                                     |
| ------ | ------------------------------------------- |
| CST-01 | اعتبارسنجی هرگز محتوا را تغییر نمی‌دهد      |
| CST-02 | فقط خروجی‌های PRM-220..223 ارزیابی می‌شوند  |
| CST-03 | محتوای عبورنکرده از حدنصاب قابل انتشار نیست |

---

## 9. Input Contract

| ورودی              | نوع    | منبع                   | اجباری |
| ------------------ | ------ | ---------------------- | ------ |
| `semantic_report`  | object | PRM-220                | بله    |
| `intent_report`    | object | PRM-221                | بله    |
| `linking_report`   | object | PRM-222                | بله    |
| `metadata_report`  | object | PRM-223                | بله    |
| `validation_level` | enum   | AI-005, AI-008, AI-010 | خیر    |

---

## 10. Output Contract

| خروجی                           | نوع     | توضیح                              |
| ------------------------------- | ------- | ---------------------------------- |
| `discoverability_report`        | object  | گزارش کامل اعتبارسنجی قابلیت کشف   |
| `semantic_dimension_score`      | number  | امتیاز بعد معنایی                  |
| `intent_dimension_score`        | number  | امتیاز بعد قصد جستجو               |
| `linking_dimension_score`       | number  | امتیاز بعد پیوند داخلی             |
| `metadata_dimension_score`      | number  | امتیاز بعد فراداده                 |
| `overall_discoverability_score` | number  | امتیاز کلی قابلیت کشف (۰–۱۰۰)      |
| `gap_analysis`                  | array   | تحلیل شکاف‌ها با severity و action |
| `pass_validation`               | boolean | عبور از آستانه انتشار              |
| `blockers`                      | array   | موارد مسدودکننده انتشار            |

---

## 11. Validation Rules

| ID     | قاعده                                            | سطح    | نقض     |
| ------ | ------------------------------------------------ | ------ | ------- |
| VAL-01 | تمام ۴ گزارش ورودی معتبر و کامل                  | معماری | عدم ثبت |
| VAL-02 | overall_discoverability_score ≥ ۷۰               | معماری | عدم ثبت |
| VAL-03 | هیچ dimensional score < ۵۰                       | معماری | عدم ثبت |
| VAL-04 | pass_validation فقط true اگر همه scores ≥ آستانه | معماری | عدم ثبت |
| VAL-05 | blockers باید null باشند برای publish=true       | معماری | عدم ثبت |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                              | مسئول           |
| ----- | ----------------- | ---------------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل, وابستگی به PRM-220..223 | خودکار          |
| QG-02 | Review → Approved | انطباق معیارها با EDT-002, PLAT-\* | Prompt Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3)          | Registry Keeper |

---

## 13. Dependencies

| شناسه   | نوع               | نسخه   | دلیل            |
| ------- | ----------------- | ------ | --------------- |
| PRM-220 | DEP-01 (Requires) | ^1.0.0 | گزارش معنایی    |
| PRM-221 | DEP-01 (Requires) | ^1.0.0 | گزارش قصد جستجو |
| PRM-222 | DEP-01 (Requires) | ^1.0.0 | گزارش پیوند     |
| PRM-223 | DEP-01 (Requires) | ^1.0.0 | گزارش فراداده   |

---

## 14. Human Override

| سناریو                             | اقدام                                                 |
| ---------------------------------- | ----------------------------------------------------- |
| pass_validation=false              | Escalation به AI-005 + AI-008 برای رفع blockers       |
| overall_discoverability_score < ۵۰ | Escalation به Content Architect برای بازنگری استراتژی |
| تعارض بین dimension scores         | بررسی دستی توسط Prompt Reviewer                       |

---

## 15. Governance Notes

| ID     | یادداشت                                           |
| ------ | ------------------------------------------------- |
| GOV-01 | A-3 (Strategic) — نیازمند ADR + تأیید مدیر        |
| GOV-02 | C-3 (Complex) — ترکیب ۴ منبع ورودی + تحلیل ۴ بعدی |
| GOV-03 | آستانه scores قابل تنظیم در هر Release Cycle      |
| GOV-04 | gap_analysis باید در Issue Tracker ثبت شود        |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-224",
  "name": "Discoverability Validation",
  "family": "FAM-CON",
  "subfamily": "CON-SEO",
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
    { "type": "CTX-04", "source": "PRM-220", "required": true },
    { "type": "CTX-04", "source": "PRM-221", "required": true },
    { "type": "CTX-04", "source": "PRM-222", "required": true },
    { "type": "CTX-04", "source": "PRM-223", "required": true }
  ],
  "max_tokens": 6000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "semantic_report", "type": "VAR-06", "required": true },
    { "id": "intent_report", "type": "VAR-06", "required": true },
    { "id": "linking_report", "type": "VAR-06", "required": true },
    { "id": "metadata_report", "type": "VAR-06", "required": true },
    {
      "id": "validation_level",
      "type": "VAR-04",
      "required": false,
      "members": ["quick", "standard", "deep"],
      "default": "standard"
    }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["semantic_report", "intent_report", "linking_report", "metadata_report"],
    "optional": ["validation_level"]
  },
  "output": {
    "required": ["discoverability_report", "overall_discoverability_score", "pass_validation"],
    "optional": [
      "semantic_dimension_score",
      "intent_dimension_score",
      "linking_dimension_score",
      "metadata_dimension_score",
      "gap_analysis",
      "blockers"
    ]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    {
      "id": "VAL-01",
      "description": "All 4 input reports valid and complete",
      "severity": "error"
    },
    { "id": "VAL-02", "description": "Overall score ≥ 70", "severity": "error" },
    { "id": "VAL-03", "description": "No dimensional score < 50", "severity": "error" },
    {
      "id": "VAL-04",
      "description": "pass_validation = true iff all thresholds met",
      "severity": "error"
    },
    { "id": "VAL-05", "description": "blockers must be null for publish=true", "severity": "error" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-005", "AI-008", "AI-010"],
  "dependencies": ["PRM-220", "PRM-221", "PRM-222", "PRM-223"],
  "documentation_refs": ["EDT-002", "PLAT-*"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                               | توسط        |
| ----------- | ---------- | ----------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — اعتبارسنجی قابلیت کشف | معمار سیستم |
