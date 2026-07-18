# Multi-Platform Adaptation Chain — زنجیره تطبیق چندپلتفرمی

> **شناسه:** PRM-209
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Content Producer
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-207](../35-PROMPTS/31-platform-format-adaptation.md), [PRM-301](../35-PROMPTS/30-publishing-instruction.md), [PRM-401](../35-PROMPTS/40-brand-voice-context.md), [PRM-402](../35-PROMPTS/42-content-taxonomy-context.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                           |
| ------------------ | ------------------------------- |
| **id**             | PRM-209                         |
| **name_fa**        | زنجیره تطبیق چندپلتفرمی         |
| **name_en**        | Multi-Platform Adaptation Chain |
| **family**         | FAM-CON                         |
| **subfamily**      | CON-PRD                         |
| **type**           | PT-04                           |
| **complexity**     | C-3                             |
| **authority**      | A-2                             |
| **owner**          | Content Producer                |
| **version**        | 1.0.0-draft                     |
| **status**         | draft                           |
| **security_level** | SL-02                           |

---

## 2. Purpose

PRM-209 تطبیق همزمان یک محتوای متعارف واحد به قالب‌های چند پلتفرم اجتماعی را orchestrate می‌کند. این پرامپت با ترکیب Sequential و Parallel (CP-01 + CP-03)، PRM-207 را برای هر پلتفرم هدف به صورت مجزا فراخوانی کرده و نتایج را در یک بسته انتشار چندپلتفرمی تلفیق می‌کند.

### اصول زنجیره چندپلتفرمی

| ID    | اصل                                                                |
| ----- | ------------------------------------------------------------------ |
| MP-01 | یک محتوای متعارف → چند خروجی پلتفرمی — SSOT محتوا حفظ می‌شود       |
| MP-02 | هر پلتفرم یک تطبیق مستقل دریافت می‌کند — تداخل بین پلتفرم‌ها ممنوع |
| MP-03 | تطبیق‌ها به صورت موازی (Parallel) اجرا می‌شوند — زمان اجرا بهینه   |
| MP-04 | خطا در یک پلتفرم بقیه را مسدود نمی‌کند — Fallback تعریف می‌شود     |
| MP-05 | بسته خروجی شامل همه تطبیق‌ها + نگاشت پلتفرم است                    |

---

## 3. Scope

### Inside Scope

| حوزه                           | توضیح                                              |
| ------------------------------ | -------------------------------------------------- |
| orchestration تطبیق چندپلتفرمی | فراخوانی PRM-207 برای هر پلتفرم                    |
| مدیریت خطا و Fallback          | ادامه پردازش در صورت خطای یک پلتفرم                |
| تلفیق خروجی‌ها                 | تجمیع همه تطبیق‌ها در یک بسته واحد                 |
| نگاشت پلتفرم به خروجی          | جدول تطبیق platform → adapted_content              |
| اعتبارسنجی کامل بودن           | اطمینان از وجود خروجی برای همه پلتفرم‌های درخواستی |

### Outside Scope

| حوزه                | دلیل                  |
| ------------------- | --------------------- |
| تطبیق تکی پلتفرم    | حوزه PRM-207          |
| انتشار و زمان‌بندی  | حوزه PRM-301          |
| ترجمه محتوا         | حوزه PRM-206          |
| بازبینی کیفیت       | حوزه PRM-208, PRM-202 |
| تولید محتوای متعارف | حوزه PRM-201, PRM-203 |

---

## 4. Consumers

| مصرف‌کننده                  | نقش                                     | نوع مصرف |
| --------------------------- | --------------------------------------- | -------- |
| AI-003 (Content Production) | orchestration تطبیق برای پلتفرم‌های هدف | Chain    |
| AI-008 (Publishing)         | تولید بسته انتشار چندپلتفرمی نهایی      | Chain    |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-203 Output",
        "scope": ["structured-document", "block-index"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-05",
        "source": "PLAT-* (all playbooks)",
        "scope": ["platform-format", "platform-capabilities"],
        "injection": "append",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PRM-401",
        "scope": ["brand-voice-platform-variants"],
        "injection": "append",
        "required": false
      }
    ],
    "max_tokens": 6000,
    "priority": "high"
  }
}
```

---

## 6. Required Knowledge

| منبع                    | دامنه         | کاربرد                                     |
| ----------------------- | ------------- | ------------------------------------------ |
| PLAT-\* (همه کتابچه‌ها) | مشخصات پلتفرم | آگاهی از قابلیت‌ها و محدودیت‌های هر پلتفرم |
| BRD-002                 | صدای برند     | تطبیق هماهنگ لحن در همه پلتفرم‌ها          |
| EDT-001                 | ECOS          | جایگاه محتوا و الزامات انتشار              |
| EDT-002                 | تاکسونومی     | تطابق نوع محتوا با پلتفرم‌های هدف          |

---

## 7. Variables

| متغیر                 | نوع    | اجباری | توضیح                                | اعتبارسنجی                                                                                                                     |
| --------------------- | ------ | ------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `canonical_content`   | VAR-06 | بله    | محتوای متعارف ساختاریافته از PRM-203 | —                                                                                                                              |
| `target_platforms`    | VAR-07 | بله    | فهرست پلتفرم‌های هدف برای تطبیق      | items: VAR-04, members: [instagram, linkedin, telegram, bale, youtube, aparat, x-twitter, website], min_items: 1, max_items: 8 |
| `parallel_execution`  | VAR-03 | خیر    | اجرای موازی تطبیق‌ها                 | default: true                                                                                                                  |
| `fail_on_first_error` | VAR-03 | خیر    | توقف در اولین خطا                    | default: false                                                                                                                 |

---

## 8. Constraints

| ID     | محدودیت                                                        |
| ------ | -------------------------------------------------------------- |
| CST-01 | حداقل ۱ و حداکثر ۸ پلتفرم در هر فراخوانی                       |
| CST-02 | خطا در یک پلتفرم بقیه را مسدود نمی‌کند                         |
| CST-03 | همه خروجی‌ها از یک محتوای متعارف واحد مشتق می‌شوند             |
| CST-04 | هر تطبیق مستقل از دیگران است — اشتراک حالت بین پلتفرم‌ها ممنوع |
| CST-05 | بسته خروجی باید شامل همه پلتفرم‌های درخواستی باشد              |

---

## 9. Input Contract

| ورودی                 | نوع     | منبع           | اجباری |
| --------------------- | ------- | -------------- | ------ |
| `canonical_content`   | object  | PRM-203        | بله    |
| `target_platforms`    | array   | AI-014         | بله    |
| `parallel_execution`  | boolean | AI-003, AI-008 | خیر    |
| `fail_on_first_error` | boolean | AI-003, AI-008 | خیر    |

---

## 10. Output Contract

| خروجی                      | نوع    | توضیح                                            |
| -------------------------- | ------ | ------------------------------------------------ |
| `multi_platform_package`   | object | بسته کامل شامل همه تطبیق‌های پلتفرمی             |
| `platform_map`             | object | نگاشت هر پلتفرم به adapted_content مربوطه        |
| `execution_report`         | object | گزارش اجرا شامل موفقیت/خطای هر پلتفرم            |
| `failed_platforms`         | array  | فهرست پلتفرم‌هایی که تطبیق آنها با خطا مواجه شده |
| `aggregate_fidelity_score` | number | میانگین وفاداری محتوا در همه پلتفرم‌ها (۰–۱۰۰)   |

---

## 11. Validation Rules

| ID     | قاعده                                              | سطح    | نقض     |
| ------ | -------------------------------------------------- | ------ | ------- |
| VAL-01 | همه پلتفرم‌های درخواستی باید خروجی داشته باشند     | معماری | هشدار   |
| VAL-02 | خطا در یک پلتفرم بقیه را مسدود نمی‌کند             | معماری | عدم ثبت |
| VAL-03 | همه خروجی‌ها از یک محتوای متعارف مشتق شده‌اند      | معماری | عدم ثبت |
| VAL-04 | حداکثر ۸ پلتفرم در هر فراخوانی                     | معماری | هشدار   |
| VAL-05 | نگاشت platform → adapted_content کامل و بدون ابهام | معماری | عدم ثبت |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                              | مسئول           |
| ----- | ----------------- | ---------------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل، composition model معتبر | خودکار          |
| QG-02 | Review → Approved | انطباق با PRM-000, CP-01/CP-03     | Prompt Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (C-3)          | Registry Keeper |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                                           |
| ------- | ------------------- | ------ | ---------------------------------------------- |
| PRM-207 | DEP-01 (Requires)   | ^1.0.0 | تطبیق تکی هر پلتفرم از طریق PRM-207            |
| PRM-301 | DEP-03 (References) | ^1.0.0 | بسته خروجی برای انتشار به PRM-301 تحویل می‌شود |
| PRM-401 | DEP-03 (References) | ^1.0.0 | بافت صدای برند برای تطبیق هماهنگ               |
| PRM-402 | DEP-03 (References) | ^1.0.0 | بافت تاکسونومی برای تطابق نوع محتوا            |

---

## 14. Human Override

| سناریو                              | اقدام                              |
| ----------------------------------- | ---------------------------------- |
| بیش از ۲ پلتفرم با خطا مواجه شدند   | Escalation به Content Strategist   |
| aggregate_fidelity_score < ۷۰       | Escalation به Content Editor       |
| پلتفرم درخواستی در PLAT-\* ثبت نشده | حذف پلتفرم از زنجیره + اطلاع‌رسانی |

---

## 15. Governance Notes

| ID     | یادداشت                                                       |
| ------ | ------------------------------------------------------------- |
| GOV-01 | A-2 (Operational) — نیازمند تأیید ناظر                        |
| GOV-02 | C-3 (Complex) — نیازمند ADR برای تغییر در composition pattern |
| GOV-03 | تغییر در حداکثر تعداد پلتفرم‌ها نیازمند Major Version Bump    |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-209",
  "name": "Multi-Platform Adaptation Chain",
  "family": "FAM-CON",
  "subfamily": "CON-PRD",
  "type": "PT-04",
  "complexity": "C-3",
  "authority": "A-2",
  "version": "1.0.0-draft",
  "status": "draft"
}
```

### Block 2 — Context

```json
{
  "sources": [
    { "type": "CTX-04", "source": "PRM-203", "required": true },
    { "type": "CTX-05", "source": "PLAT-*", "required": true },
    { "type": "CTX-02", "source": "PRM-401", "required": false }
  ],
  "max_tokens": 6000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "canonical_content", "type": "VAR-06", "required": true },
    {
      "id": "target_platforms",
      "type": "VAR-07",
      "required": true,
      "items": {
        "type": "VAR-04",
        "members": [
          "instagram",
          "linkedin",
          "telegram",
          "bale",
          "youtube",
          "aparat",
          "x-twitter",
          "website"
        ]
      },
      "min_items": 1,
      "max_items": 8
    },
    { "id": "parallel_execution", "type": "VAR-03", "required": false, "default": true },
    { "id": "fail_on_first_error", "type": "VAR-03", "required": false, "default": false }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["canonical_content", "target_platforms"],
    "optional": ["parallel_execution", "fail_on_first_error"]
  },
  "output": {
    "required": ["multi_platform_package", "platform_map", "execution_report"],
    "optional": ["failed_platforms", "aggregate_fidelity_score"]
  }
}
```

### Block 5 — Composition

```json
{
  "composition": {
    "pattern": "CP-01",
    "children": [
      {
        "id": "PRM-207",
        "order": 1,
        "condition": "for each platform in target_platforms",
        "fallback": "skip and report error"
      }
    ],
    "max_depth": 2,
    "output_aggregation": "merge"
  }
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-003", "AI-008"],
  "dependencies": ["PRM-207", "PRM-301", "PRM-401", "PRM-402"],
  "documentation_refs": ["PLAT-*", "BRD-002", "EDT-001"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                                 | توسط        |
| ----------- | ---------- | ------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — زنجیره تطبیق چندپلتفرمی | معمار سیستم |
