# Publishing Package Assembly — مونتاژ بسته انتشار

> **شناسه:** PRM-302
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Operations Lead
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-301](./30-publishing-instruction.md), [PRM-402](./42-content-taxonomy-context.md), [PLAT-\*](../20-PLATFORMS/)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                       |
| ------------------ | --------------------------- |
| **id**             | PRM-302                     |
| **name_fa**        | مونتاژ بسته انتشار          |
| **name_en**        | Publishing Package Assembly |
| **family**         | FAM-OPS                     |
| **subfamily**      | OPS-PUB                     |
| **type**           | PT-04                       |
| **complexity**     | C-2                         |
| **authority**      | A-3                         |
| **owner**          | Operations Lead             |
| **version**        | 1.0.0-draft                 |
| **status**         | draft                       |
| **security_level** | SL-02                       |

---

## 2. Purpose

PRM-302 مونتاژ بسته انتشار سازمانی را تعریف می‌کند. این پرامپت گردآوری دارایی‌های محتوا، فراداده، پیوست‌ها و فرادستورالعمل‌های انتشار را در یک بسته قابل توزیع تضمین می‌کند.

### اصول مونتاژ بسته انتشار

| ID    | اصل                                                          |
| ----- | ------------------------------------------------------------ |
| PA-01 | هر بسته انتشار باید شامل محتوا، فراداده و فرادستورالعمل باشد |
| PA-02 | دارایی‌های بسته باید از SSOT استخراج شوند                    |
| PA-03 | بسته باید برای همه پلتفرم‌های هدف قابل مصرف باشد             |
| PA-04 | فرادستورالعمل‌ها باید غیرمبهم و قابل اجرا باشند              |

---

## 3. Scope

### Inside Scope

| حوزه            | توضیح                                  |
| --------------- | -------------------------------------- |
| گردآوری دارایی  | جمع‌آوری محتوا، تصاویر، ویدئو، فراداده |
| مونتاژ فراداده  | تلفیق فراداده از PRM-204, PRM-223      |
| پیوست‌ها        | ضمیمه‌سازی اسناد مرتبط                 |
| فرادستورالعمل   | بسته‌بندی دستورالعمل‌های انتشار        |
| اعتبارسنجی بسته | بررسی کامل بودن بسته                   |

### Outside Scope

| حوزه             | دلیل         |
| ---------------- | ------------ |
| انتخاب پلتفرم    | حوزه PRM-303 |
| زمان‌بندی انتشار | حوزه PRM-304 |
| اجرای انتشار     | حوزه PRM-306 |

---

## 4. Consumers

| مصرف‌کننده          | نقش                | نوع مصرف |
| ------------------- | ------------------ | -------- |
| AI-008 (Publishing) | مونتاژ بسته انتشار | Chain    |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-301 Output",
        "scope": ["publishing-instructions", "platform-requirements"],
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
        "source": "PLAT-*",
        "scope": ["publishing-specifications", "asset-requirements"],
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

| منبع    | دامنه     | کاربرد                       |
| ------- | --------- | ---------------------------- |
| PLAT-\* | پلتفرم‌ها | الزامات دارایی و قالب انتشار |

---

## 7. Variables

| متغیر                     | نوع    | اجباری | توضیح                              | اعتبارسنجی    |
| ------------------------- | ------ | ------ | ---------------------------------- | ------------- |
| `publishing_instructions` | VAR-06 | بله    | دستورالعمل انتشار از PRM-301       | —             |
| `target_platforms`        | VAR-07 | بله    | پلتفرم‌های هدف برای قالب‌بندی بسته |
| `include_metadata`        | VAR-03 | خیر    | گنجاندن فراداده کامل در بسته       | default: true |

---

## 8. Constraints

| ID     | محدودیت                                          |
| ------ | ------------------------------------------------ |
| CST-01 | همه دارایی‌ها باید از SSOT استخراج شوند          |
| CST-02 | بسته باید برای همه پلتفرم‌های هدف قابل مصرف باشد |
| CST-03 | فراداده باید با استانداردهای PLAT-\* همخوان باشد |

---

## 9. Input Contract

| ورودی                     | نوع     | منبع           | اجباری |
| ------------------------- | ------- | -------------- | ------ |
| `publishing_instructions` | object  | PRM-301        | بله    |
| `target_platforms`        | array   | AI-008, AI-014 | بله    |
| `include_metadata`        | boolean | AI-008         | خیر    |

---

## 10. Output Contract

| خروجی                       | نوع    | توضیح                                   |
| --------------------------- | ------ | --------------------------------------- |
| `publication_package`       | object | بسته کامل انتشار                        |
| `asset_manifest`            | array  | فهرست دارایی‌های بسته                   |
| `metadata_bundle`           | object | فراداده تلفیقی همه دارایی‌ها            |
| `platform_formatted_assets` | array  | دارایی‌های قالب‌بندی‌شده به ازای پلتفرم |
| `publishing_directives`     | object | فرادستورالعمل‌های اجرایی                |
| `package_integrity_score`   | number | امتیاز یکپارچگی بسته (۰–۱۰۰)            |

---

## 11. Validation Rules

| ID     | قاعده                                  | سطح    | نقض     |
| ------ | -------------------------------------- | ------ | ------- |
| VAL-01 | همه دارایی‌ها از SSOT مبدأ             | معماری | عدم ثبت |
| VAL-02 | بسته برای همه پلتفرم‌های هدف قابل مصرف | معماری | عدم ثبت |
| VAL-03 | فراداده با PLAT-\* همخوان              | معماری | هشدار   |
| VAL-04 | فرادستورالعمل‌ها غیرمبهم               | معماری | هشدار   |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                     | مسئول           |
| ----- | ----------------- | ------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل, context معتبر  | خودکار          |
| QG-02 | Review → Approved | انطباق با PLAT-\*         | Prompt Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3) | Registry Keeper |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                               |
| ------- | ------------------- | ------ | ---------------------------------- |
| PRM-301 | DEP-01 (Requires)   | ^1.0.0 | دستورالعمل انتشار برای مونتاژ بسته |
| PRM-402 | DEP-03 (References) | ^1.0.0 | بافت تاکسونومی                     |

---

## 14. Human Override

| سناریو                        | اقدام                                           |
| ----------------------------- | ----------------------------------------------- |
| package_integrity_score < ۷۰  | Escalation به Operations Lead برای رفع نقص بسته |
| missing asset برای پلتفرم هدف | حذف پلتفرم از بسته + اطلاع‌رسانی                |

---

## 15. Governance Notes

| ID     | یادداشت                                                |
| ------ | ------------------------------------------------------ |
| GOV-01 | A-3 (Strategic) — نیازمند ADR + تأیید مدیر             |
| GOV-02 | تغییر در استانداردهای بسته نیازمند به‌روزرسانی PLAT-\* |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-302",
  "name": "Publishing Package Assembly",
  "family": "FAM-OPS",
  "subfamily": "OPS-PUB",
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
    { "type": "CTX-04", "source": "PRM-301", "required": true },
    { "type": "CTX-02", "source": "PRM-402", "required": true },
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
    { "id": "publishing_instructions", "type": "VAR-06", "required": true },
    { "id": "target_platforms", "type": "VAR-07", "required": true },
    { "id": "include_metadata", "type": "VAR-03", "required": false, "default": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["publishing_instructions", "target_platforms"],
    "optional": ["include_metadata"]
  },
  "output": {
    "required": [
      "publication_package",
      "asset_manifest",
      "publishing_directives",
      "package_integrity_score"
    ],
    "optional": ["metadata_bundle", "platform_formatted_assets"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "All assets from SSOT", "severity": "error" },
    {
      "id": "VAL-02",
      "description": "Package consumable by all target platforms",
      "severity": "error"
    },
    { "id": "VAL-03", "description": "Metadata conforms to PLAT-*", "severity": "warning" },
    { "id": "VAL-04", "description": "Directives unambiguous", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-008"],
  "dependencies": ["PRM-301", "PRM-402"],
  "documentation_refs": ["PLAT-*"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                            | توسط        |
| ----------- | ---------- | -------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — مونتاژ بسته انتشار | معمار سیستم |
