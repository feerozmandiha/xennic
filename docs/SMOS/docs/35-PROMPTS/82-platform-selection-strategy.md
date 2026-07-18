# Platform Selection Strategy — استراتژی انتخاب پلتفرم

> **شناسه:** PRM-303
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Operations Lead
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-302](./80-publishing-package-assembly.md), [PLAT-\*](../20-PLATFORMS/), [ARCH-020](../00-ARCHITECTURE/20-enterprise-multi-platform-strategy.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                       |
| ------------------ | --------------------------- |
| **id**             | PRM-303                     |
| **name_fa**        | استراتژی انتخاب پلتفرم      |
| **name_en**        | Platform Selection Strategy |
| **family**         | FAM-OPS                     |
| **subfamily**      | OPS-PUB                     |
| **type**           | PT-07                       |
| **complexity**     | C-3                         |
| **authority**      | A-3                         |
| **owner**          | Operations Lead             |
| **version**        | 1.0.0-draft                 |
| **status**         | draft                       |
| **security_level** | SL-02                       |

---

## 2. Purpose

PRM-303 استراتژی انتخاب پلتفرم انتشار را برای هر بسته محتوا تعریف می‌کند. این پرامپت با تحلیل ویژگی‌های محتوا، مخاطب هدف، نقش پلتفرم و اولویت‌های استراتژیک، مجموعه بهینه پلتفرم‌های انتشار را تعیین می‌کند.

### اصول انتخاب پلتفرم

| ID    | اصل                                                         |
| ----- | ----------------------------------------------------------- |
| PS-01 | انتخاب پلتفرم بر اساس ویژگی‌های محتوا (CT-ID) انجام شود     |
| PS-02 | نقش هر پلتفرم (Primary/Secondary/Backup) در انتخاب لحاظ شود |
| PS-03 | مخاطب هدف و جغرافیای انتشار تعیین‌کننده باشند               |
| PS-04 | اولویت‌های استراتژیک فصلی بر انتخاب اثر بگذارند             |

---

## 3. Scope

### Inside Scope

| حوزه           | توضیح                                  |
| -------------- | -------------------------------------- |
| تحلیل محتوا    | تطبیق CT-ID با پلتفرم‌های مناسب        |
| تعیین مخاطب    | شناسایی مخاطب هدف و پراکندگی جغرافیایی |
| وزن‌دهی پلتفرم | امتیازدهی به پلتفرم‌ها بر اساس اهداف   |
| خروجی انتخاب   | فهرست اولویت‌بندی‌شده پلتفرم‌ها        |

### Outside Scope

| حوزه            | دلیل         |
| --------------- | ------------ |
| قالب‌بندی محتوا | حوزه PRM-207 |
| زمان‌بندی       | حوزه PRM-304 |
| تطبیق پلتفرمی   | حوزه PRM-209 |

---

## 4. Consumers

| مصرف‌کننده            | نقش                     | نوع مصرف |
| --------------------- | ----------------------- | -------- |
| AI-008 (Publishing)   | تعیین پلتفرم‌های هدف    | Chain    |
| AI-014 (Orchestrator) | هماهنگی استراتژی انتشار | System   |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-302 Output",
        "scope": ["publication-package", "asset-manifest"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PLAT-*",
        "scope": ["platform-roles", "audience-profiles", "content-type-matrix"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "ARCH-020",
        "scope": ["multi-platform-strategy", "platform-priorities"],
        "injection": "append",
        "required": false
      }
    ],
    "max_tokens": 5000,
    "priority": "high"
  }
}
```

---

## 6. Required Knowledge

| منبع     | دامنه               | کاربرد                |
| -------- | ------------------- | --------------------- |
| PLAT-\*  | نقش و مشخصات پلتفرم | تطبیق محتوا با پلتفرم |
| ARCH-020 | استراتژی چندپلتفرمی | اولویت‌های استراتژیک  |

---

## 7. Variables

| متغیر                  | نوع    | اجباری | توضیح                            | اعتبارسنجی  |
| ---------------------- | ------ | ------ | -------------------------------- | ----------- |
| `publication_package`  | VAR-06 | بله    | بسته انتشار مونتاژشده از PRM-302 | —           |
| `strategic_priorities` | VAR-03 | خیر    | اولویت‌های فصلی برای وزن‌دهی     | —           |
| `geographic_targets`   | VAR-03 | خیر    | محدودیت‌های جغرافیایی            | —           |
| `exclude_platforms`    | VAR-07 | خیر    | پلتفرم‌های مستثنی                | default: [] |

---

## 8. Constraints

| ID     | محدودیت                                                          |
| ------ | ---------------------------------------------------------------- |
| CST-01 | انتخاب باید با نقش پلتفرم (Primary/Secondary/Backup) همخوان باشد |
| CST-02 | محتوای محرمانه (SL-03+) فقط در پلتفرم‌های مجاز                   |
| CST-03 | حداقل یک پلتفرم Primary باید انتخاب شود                          |

---

## 9. Input Contract

| ورودی                  | نوع    | منبع    | اجباری |
| ---------------------- | ------ | ------- | ------ |
| `publication_package`  | object | PRM-302 | بله    |
| `strategic_priorities` | object | AI-014  | خیر    |
| `geographic_targets`   | array  | AI-008  | خیر    |
| `exclude_platforms`    | array  | AI-008  | خیر    |

---

## 10. Output Contract

| خروجی                           | نوع    | توضیح                                 |
| ------------------------------- | ------ | ------------------------------------- |
| `selected_platforms`            | array  | فهرست پلتفرم‌های انتخاب‌شده با اولویت |
| `platform_selection_reasoning`  | object | دلایل انتخاب هر پلتفرم                |
| `platform_audience_overlap`     | object | تحلیل همپوشانی مخاطبان                |
| `strategic_alignment_score`     | number | امتیاز هم‌راستایی استراتژیک (۰–۱۰۰)   |
| `selection_coverage_percentage` | number | درصد پوشش مخاطب هدف                   |

---

## 11. Validation Rules

| ID     | قاعده                                       | سطح    | نقض     |
| ------ | ------------------------------------------- | ------ | ------- |
| VAL-01 | حداقل یک پلتفرم Primary انتخاب شده          | معماری | عدم ثبت |
| VAL-02 | CT-ID محتوا با پلتفرم‌های انتخاب‌شده همخوان | معماری | هشدار   |
| VAL-03 | محتوای SL-03+ در پلتفرم مجاز                | امنیت  | عدم ثبت |
| VAL-04 | overlap_score < ۳۰                          | معماری | هشدار   |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                     | مسئول           |
| ----- | ----------------- | ------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل, input معتبر    | خودکار          |
| QG-02 | Review → Approved | انطباق با PLAT-\*         | Prompt Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3) | Registry Keeper |

---

## 13. Dependencies

| شناسه    | نوع                 | نسخه   | دلیل                                 |
| -------- | ------------------- | ------ | ------------------------------------ |
| PRM-302  | DEP-01 (Requires)   | ^1.0.0 | بسته انتشار برای تحلیل انتخاب پلتفرم |
| PLAT-\*  | DEP-03 (References) | ^1.0.0 | مشخصات و نقش پلتفرم‌ها               |
| ARCH-020 | DEP-03 (References) | ^1.0.0 | استراتژی چندپلتفرمی                  |

---

## 14. Human Override

| سناریو                         | اقدام                                                |
| ------------------------------ | ---------------------------------------------------- |
| strategic_alignment_score < ۵۰ | Escalation به Operations Lead برای بازبینی اولویت‌ها |
| هیچ پلتفرم Primary مناسب نیست  | Escalation به Content Strategist برای بررسی CT-ID    |

---

## 15. Governance Notes

| ID     | یادداشت                                      |
| ------ | -------------------------------------------- |
| GOV-01 | A-3 (Strategic) — نیازمند ADR + تأیید مدیر   |
| GOV-02 | تغییر اولویت‌های فصلی نیازمند هماهنگی AI-014 |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-303",
  "name": "Platform Selection Strategy",
  "family": "FAM-OPS",
  "subfamily": "OPS-PUB",
  "type": "PT-07",
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
    { "type": "CTX-04", "source": "PRM-302", "required": true },
    { "type": "CTX-02", "source": "PLAT-*", "required": true },
    { "type": "CTX-02", "source": "ARCH-020", "required": false }
  ],
  "max_tokens": 5000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "publication_package", "type": "VAR-06", "required": true },
    { "id": "strategic_priorities", "type": "VAR-03", "required": false },
    { "id": "geographic_targets", "type": "VAR-03", "required": false },
    { "id": "exclude_platforms", "type": "VAR-07", "required": false, "default": [] }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["publication_package"],
    "optional": ["strategic_priorities", "geographic_targets", "exclude_platforms"]
  },
  "output": {
    "required": ["selected_platforms", "platform_selection_reasoning", "strategic_alignment_score"],
    "optional": ["platform_audience_overlap", "selection_coverage_percentage"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    {
      "id": "VAL-01",
      "description": "At least one Primary platform selected",
      "severity": "error"
    },
    { "id": "VAL-02", "description": "CT-ID matches selected platforms", "severity": "warning" },
    {
      "id": "VAL-03",
      "description": "SL-03+ content on authorized platforms only",
      "severity": "error"
    },
    { "id": "VAL-04", "description": "Audience overlap score < 30", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-008", "AI-014"],
  "dependencies": ["PRM-302"],
  "documentation_refs": ["PLAT-*", "ARCH-020"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                                | توسط        |
| ----------- | ---------- | ------------------------------------ | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — استراتژی انتخاب پلتفرم | معمار سیستم |
