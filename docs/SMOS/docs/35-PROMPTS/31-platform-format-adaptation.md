# Platform Format Adaptation — تطبیق قالب پلتفرمی

> **شناسه:** PRM-207
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Content Producer
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-203](../35-PROMPTS/24-content-structuring-instruction.md), [PRM-401](../35-PROMPTS/40-brand-voice-context.md), [PRM-402](../35-PROMPTS/42-content-taxonomy-context.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                      |
| ------------------ | -------------------------- |
| **id**             | PRM-207                    |
| **name_fa**        | تطبیق قالب پلتفرمی         |
| **name_en**        | Platform Format Adaptation |
| **family**         | FAM-CON                    |
| **subfamily**      | CON-PRD                    |
| **type**           | PT-03                      |
| **complexity**     | C-2                        |
| **authority**      | A-1                        |
| **owner**          | Content Producer           |
| **version**        | 1.0.0-draft                |
| **status**         | draft                      |
| **security_level** | SL-02                      |

---

## 2. Purpose

PRM-207 محتوای متعارف (Canonical Content) را به قالب و الزامات نمایشی یک پلتفرم مشخص تطبیق می‌دهد. این پرامپت تضمین می‌کند محتوای خروجی با مشخصات فنی، محدودیت‌های طول، قواعد بصری و انتظارات هر پلتفرم اجتماعی همخوانی دارد.

### اصول تطبیق

| ID    | اصل                                                                       |
| ----- | ------------------------------------------------------------------------- |
| FA-01 | تطبیق فقط لایه نمایش را تغییر می‌دهد — معنای محتوا حفظ می‌شود             |
| FA-02 | هر پلتفرم یک قالب خروجی مشخص دارد — قالب‌ها در PLAT-\* ثبت شده‌اند        |
| FA-03 | فراداده پلتفرمی (هشتگ، منشن، لینک) در لایه تطبیق افزوده می‌شود            |
| FA-04 | تطبیق برگشت‌پذیر است — محتوای متعارف از خروجی پلتفرمی قابل استخراج است    |
| FA-05 | محدودیت‌های پلتفرم (کاراکتر، ابعاد رسانه) هرگز محتوای اصلی را نقض نمی‌کند |

---

## 3. Scope

### Inside Scope

| حوزه                 | توضیح                                      |
| -------------------- | ------------------------------------------ |
| تطبیق ساختار محتوا   | تبدیل سلسله‌مراتب متعارف به ساختار پلتفرمی |
| تطبیق طول محتوا      | رعایت محدودیت‌های کاراکتری هر پلتفرم       |
| افزودن عناصر پلتفرمی | هشتگ، منشن، CTA متناسب با پلتفرم           |
| تطبیق لحن ظاهری      | تنظیم فاصله، پاراگراف‌بندی، تأکیدهای بصری  |
| فراداده انتشار       | استخراج metadata مورد نیاز پلتفرم          |

### Outside Scope

| حوزه                | دلیل                  |
| ------------------- | --------------------- |
| تولید محتوای متعارف | حوزه PRM-201, PRM-203 |
| بازبینی کیفیت       | حوزه PRM-208          |
| زمان‌بندی انتشار    | حوزه PRM-301          |
| ترجمه محتوا         | حوزه PRM-206          |
| زنجیره چندپلتفرمی   | حوزه PRM-209          |

---

## 4. Consumers

| مصرف‌کننده                   | نقش                                  | نوع مصرف |
| ---------------------------- | ------------------------------------ | -------- |
| AI-003 (Content Production)  | تطبیق محتوای تولیدشده به قالب پلتفرم | Template |
| AI-005 (Search Optimization) | تطبیق ساختار SEO برای پلتفرم         | Context  |
| AI-008 (Publishing)          | آماده‌سازی قالب نهایی برای انتشار    | Template |

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
        "source": "PLAT-*",
        "scope": ["platform-format", "character-limits", "media-constraints"],
        "injection": "prepend",
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
    "max_tokens": 4000,
    "priority": "high"
  }
}
```

---

## 6. Required Knowledge

| منبع    | دامنه         | کاربرد                                      |
| ------- | ------------- | ------------------------------------------- |
| PLAT-\* | کتابچه پلتفرم | مشخصات قالب، محدودیت‌ها، قواعد هر پلتفرم    |
| BRD-002 | صدای برند     | تطبیق لحن با پلتفرم بدون نقض هویت برند      |
| EDT-001 | ECOS          | جایگاه محتوا در چرخه حیات و الزامات پلتفرمی |
| EDT-002 | تاکسونومی     | تطابق قالب با نوع محتوا (CT-ID)             |

---

## 7. Variables

| متغیر               | نوع    | اجباری | توضیح                                | اعتبارسنجی                                                                          |
| ------------------- | ------ | ------ | ------------------------------------ | ----------------------------------------------------------------------------------- |
| `canonical_content` | VAR-06 | بله    | محتوای متعارف ساختاریافته از PRM-203 | —                                                                                   |
| `target_platform`   | VAR-04 | بله    | پلتفرم هدف برای تطبیق قالب           | members: [instagram, linkedin, telegram, bale, youtube, aparat, x-twitter, website] |
| `format_preset`     | VAR-04 | خیر    | پیکربندی قالب از پیش تعیین‌شده       | members: [standard, rich, minimal], default: standard                               |
| `include_metadata`  | VAR-03 | خیر    | افزودن فراداده پلتفرمی به خروجی      | default: true                                                                       |

---

## 8. Constraints

| ID     | محدودیت                                                                  |
| ------ | ------------------------------------------------------------------------ |
| CST-01 | محتوای متعارف هرگز حذف یا بازنویسی نمی‌شود — فقط لایه نمایش تغییر می‌کند |
| CST-02 | محتوای کوتاه‌شده (truncated) فقط با تأیید صریح مجاز است                  |
| CST-03 | تطبیق لحن پلتفرمی نباید BRD-002 را نقض کند                               |
| CST-04 | عناصر پلتفرمی (هشتگ، منشن) حداکثر ۱۵٪ حجم محتوا                          |
| CST-05 | خروجی باید حداقل ۷۰٪ از محتوای متعارف را حفظ کند                         |

---

## 9. Input Contract

| ورودی               | نوع     | منبع           | اجباری |
| ------------------- | ------- | -------------- | ------ |
| `canonical_content` | object  | PRM-203        | بله    |
| `target_platform`   | enum    | AI-014, AI-003 | بله    |
| `format_preset`     | enum    | AI-003, AI-008 | خیر    |
| `include_metadata`  | boolean | AI-008         | خیر    |

---

## 10. Output Contract

| خروجی                    | نوع    | توضیح                                         |
| ------------------------ | ------ | --------------------------------------------- |
| `adapted_content`        | object | محتوای تطبیق‌یافته با قالب پلتفرم             |
| `platform_metadata`      | object | فراداده اختصاصی پلتفرم (هشتگ‌ها، دسته‌بندی)   |
| `adaptation_report`      | object | گزارش تغییرات اعمال‌شده نسبت به محتوای متعارف |
| `content_fidelity_score` | number | درصد وفاداری به محتوای متعارف (۰–۱۰۰)         |

---

## 11. Validation Rules

| ID     | قاعده                                      | سطح    | نقض     |
| ------ | ------------------------------------------ | ------ | ------- |
| VAL-01 | تطبیق فقط لایه نمایش — معنای محتوا حفظ شود | معماری | عدم ثبت |
| VAL-02 | محدودیت کاراکتری پلتفرم رعایت شود          | معماری | هشدار   |
| VAL-03 | BRD-002 در تطبیق لحن نقض نشود              | معماری | عدم ثبت |
| VAL-04 | عناصر پلتفرمی ≤ ۱۵٪ حجم محتوا              | معماری | هشدار   |
| VAL-05 | وفاداری محتوا ≥ ۷۰٪                        | معماری | هشدار   |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                                   | مسئول           |
| ----- | ----------------- | --------------------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل، context معتبر، ورودی‌ها مشخص | خودکار          |
| QG-02 | Review → Approved | انطباق با PLAT-\*, BRD-002              | Prompt Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001                          | Registry Keeper |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                                         |
| ------- | ------------------- | ------ | -------------------------------------------- |
| PRM-203 | DEP-01 (Requires)   | ^1.0.0 | محتوای ساختاریافته از PRM-203 ورودی اصلی است |
| PRM-401 | DEP-03 (References) | ^1.0.0 | بافت صدای برند برای تطبیق لحن پلتفرمی        |
| PRM-402 | DEP-03 (References) | ^1.0.0 | بافت تاکسونومی برای تطابق قالب با نوع محتوا  |

---

## 14. Human Override

| سناریو                             | اقدام                             |
| ---------------------------------- | --------------------------------- |
| وفاداری محتوا زیر ۷۰٪              | Escalation به Content Editor      |
| تعارض بین محدودیت پلتفرم و BRD-002 | Escalation به Brand Manager       |
| قالب پلتفرم در PLAT-\* ثبت نشده    | Escalation به Platform Strategist |

---

## 15. Governance Notes

| ID     | یادداشت                                                      |
| ------ | ------------------------------------------------------------ |
| GOV-01 | تغییر در قالب‌های پلتفرمی نیازمند به‌روزرسانی PLAT-\*        |
| GOV-02 | تطبیق خودکار فقط برای پلتفرم‌های ثبت‌شده در PLAT-\* مجاز است |
| GOV-03 | A-1 (Tactical) — تأیید خودکار با محدودیت‌های تعریف‌شده       |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-207",
  "name": "Platform Format Adaptation",
  "family": "FAM-CON",
  "subfamily": "CON-PRD",
  "type": "PT-03",
  "complexity": "C-2",
  "authority": "A-1",
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
  "max_tokens": 4000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "canonical_content", "type": "VAR-06", "required": true },
    {
      "id": "target_platform",
      "type": "VAR-04",
      "required": true,
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
    {
      "id": "format_preset",
      "type": "VAR-04",
      "required": false,
      "members": ["standard", "rich", "minimal"],
      "default": "standard"
    },
    { "id": "include_metadata", "type": "VAR-03", "required": false, "default": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["canonical_content", "target_platform"],
    "optional": ["format_preset", "include_metadata"]
  },
  "output": {
    "required": ["adapted_content", "adaptation_report", "content_fidelity_score"],
    "optional": ["platform_metadata"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Semantic meaning preserved", "severity": "error" },
    { "id": "VAL-02", "description": "Platform character limits respected", "severity": "warning" },
    { "id": "VAL-03", "description": "BRD-002 brand voice preserved", "severity": "error" },
    {
      "id": "VAL-04",
      "description": "Platform elements ≤ 15% content volume",
      "severity": "warning"
    },
    { "id": "VAL-05", "description": "Content fidelity ≥ 70%", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-003", "AI-005", "AI-008"],
  "dependencies": ["PRM-203", "PRM-401", "PRM-402"],
  "documentation_refs": ["PLAT-*", "BRD-002", "EDT-001"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                            | توسط        |
| ----------- | ---------- | -------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — تطبیق قالب پلتفرمی | معمار سیستم |
