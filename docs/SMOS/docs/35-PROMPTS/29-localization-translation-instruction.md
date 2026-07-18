# Localization & Translation Instruction — دستورالعمل بومی‌سازی و ترجمه

> **شناسه:** PRM-206
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Content Producer
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-203](../35-PROMPTS/24-content-structuring-instruction.md), [PRM-204](../35-PROMPTS/26-metadata-generation-instruction.md), [PRM-402](../35-PROMPTS/42-content-taxonomy-context.md), [ARCH-003](../00-ARCHITECTURE/03-vocabulary.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                                  |
| ------------------ | -------------------------------------- |
| **id**             | PRM-206                                |
| **name_fa**        | دستورالعمل بومی‌سازی و ترجمه           |
| **name_en**        | Localization & Translation Instruction |
| **family**         | FAM-CON                                |
| **subfamily**      | CON-PRD                                |
| **type**           | PT-04                                  |
| **complexity**     | C-3                                    |
| **authority**      | A-3                                    |
| **owner**          | Content Producer                       |
| **version**        | 1.0.0-draft                            |
| **status**         | draft                                  |
| **security_level** | SL-02                                  |

---

## 2. Purpose

PRM-206 سیاست‌های تبدیل چندزبانه محتوای SMOS را تعریف می‌کند. این پرامپت تضمین می‌کند در فرایند ترجمه و بومی‌سازی، معنا، اصطلاحات، تاکسونومی، شناسه‌های دانش و ارجاعات متقابل حفظ می‌شوند.

### اصول بومی‌سازی

| ID    | اصل                                                              |
| ----- | ---------------------------------------------------------------- |
| LT-01 | معنا (meaning) در ترجمه اولویت دارد — نه ترجمه کلمه‌به‌کلمه      |
| LT-02 | اصطلاحات فنی و برند (terminology) باید ثابت بمانند               |
| LT-03 | شناسه‌های تاکسونومی (CT-ID) در همه زبان‌ها یکسان است             |
| LT-04 | ارجاعات متقابل (cross references) باید در ترجمه حفظ شوند         |
| LT-05 | زبان هر پلتفرم ممکن است متفاوت باشد — بومی‌سازی پلتفرمی مجاز است |

---

## 3. Scope

### Inside Scope

| حوزه              | توضیح                                   |
| ----------------- | --------------------------------------- |
| ترجمه محتوا       | تبدیل محتوای متعارف به زبان مقصد        |
| حفظ اصطلاحات      | تضمین ثبات اصطلاحات فنی و برند          |
| تطبیق تاکسونومی   | استفاده از CT-ID یکسان در همه زبان‌ها   |
| حفظ ارجاعات       | حفظ cross-references در ترجمه           |
| بومی‌سازی پلتفرمی | تطبیق زبان با فرهنگ و قواعد پلتفرم مقصد |

### Outside Scope

| حوزه               | دلیل         |
| ------------------ | ------------ |
| تولید محتوای اولیه | حوزه PRM-201 |
| تغییر ساختار محتوا | حوزه PRM-203 |
| تولید فراداده جدید | حوزه PRM-204 |

---

## 4. Consumers

| مصرف‌کننده                         | نقش                                     | نوع مصرف    |
| ---------------------------------- | --------------------------------------- | ----------- |
| AI-003 (Content Production)        | ترجمه محتوای متعارف به زبان‌های دیگر    | Instruction |
| AI-006 (Media Asset Production)    | بومی‌سازی متن جایگزین و caption         | Instruction |
| AI-008 (Publishing & Distribution) | توزیع نسخه‌های زبانی به پلتفرم‌های مقصد | Context     |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-203 Output",
        "scope": ["structured-document", "block-index", "semantic-relationships"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-04",
        "source": "PRM-204 Output",
        "scope": ["content-metadata", "taxonomy-references", "knowledge-graph-refs"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PRM-402",
        "scope": ["ct-id-matrix", "content-attributes"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "ARCH-003",
        "scope": ["canonical-vocabulary", "term-definitions"],
        "injection": "prepend",
        "required": true
      }
    ],
    "max_tokens": 3500,
    "priority": "high"
  }
}
```

---

## 6. Required Knowledge

| منبع     | دامنه         | کاربرد                                |
| -------- | ------------- | ------------------------------------- |
| ARCH-003 | واژگان رسمی   | اصطلاحات فنی و برند برای حفظ در ترجمه |
| EDT-002  | تاکسونومی     | شناسه‌های CT-ID که نباید ترجمه شوند   |
| BRD-002  | صدای برند     | لحن و سبک در زبان مقصد                |
| PLAT-\*  | مشخصات پلتفرم | نیازمندی‌های زبانی پلتفرم مقصد        |

---

## 7. Variables

| متغیر                | نوع    | اجباری | توضیح                         | اعتبارسنجی                                                                                    |
| -------------------- | ------ | ------ | ----------------------------- | --------------------------------------------------------------------------------------------- |
| `structured_content` | VAR-06 | بله    | محتوای ساختاریافته از PRM-203 | —                                                                                             |
| `content_metadata`   | VAR-06 | بله    | فراداده از PRM-204            | —                                                                                             |
| `source_language`    | VAR-04 | بله    | زبان مبدأ                     | members: [fa, en]                                                                             |
| `target_languages`   | VAR-07 | بله    | زبان(های) مقصد                | item_type: VAR-04, members: [fa, en, ar, tr, az], min_items: 1, max_items: 5                  |
| `localization_depth` | VAR-04 | خیر    | عمق بومی‌سازی                 | members: [translation_only, light_localization, full_localization], default: translation_only |

---

## 8. Constraints

| ID     | محدودیت                                                       |
| ------ | ------------------------------------------------------------- |
| CST-01 | شناسه‌های CT-ID و شناسه محتوا هرگز ترجمه نمی‌شوند             |
| CST-02 | اصطلاحات ثبت‌شده در ARCH-003 باید ثابت بمانند                 |
| CST-03 | ارجاعات به اسناد SMOS باید حفظ شوند — مسیر فایل تغییر نمی‌کند |
| CST-04 | حداکثر ۵ زبان مقصد در یک فراخوانی                             |
| CST-05 | full_localization نیازمند تأیید انسانی است                    |

---

## 9. Input Contract

| ورودی                | نوع    | منبع    | اجباری |
| -------------------- | ------ | ------- | ------ |
| `structured_content` | object | PRM-203 | بله    |
| `content_metadata`   | object | PRM-204 | بله    |
| `source_language`    | enum   | AI-014  | بله    |
| `target_languages`   | array  | AI-014  | بله    |
| `localization_depth` | enum   | AI-014  | خیر    |

---

## 10. Output Contract

| خروجی                            | نوع    | توضیح                                      |
| -------------------------------- | ------ | ------------------------------------------ |
| `localized_documents`            | object | اسناد ترجمه‌شده به زبان‌های مقصد           |
| `localized_metadata`             | object | فراداده ترجمه‌شده (به ازای هر زبان)        |
| `terminology_consistency_report` | object | گزارش انطباق اصطلاحات با ARCH-003          |
| `cross_reference_preservation`   | object | گزارش حفظ ارجاعات در ترجمه                 |
| `localization_notes`             | array  | یادداشت‌های بومی‌سازی (موارد نیازمند توجه) |

---

## 11. Validation Rules

| ID     | قاعده                              | سطح    | نقض     |
| ------ | ---------------------------------- | ------ | ------- |
| VAL-01 | CT-ID و شناسه محتوا ترجمه نشوند    | معماری | عدم ثبت |
| VAL-02 | اصطلاحات ARCH-003 ثابت بمانند      | معماری | عدم ثبت |
| VAL-03 | ارجاعات SMOS حفظ شوند              | معماری | عدم ثبت |
| VAL-04 | حداکثر ۵ زبان مقصد                 | معماری | هشدار   |
| VAL-05 | full_localization → human approval | معماری | عدم ثبت |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                                    | مسئول           |
| ----- | ----------------- | ---------------------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل، ورودی PRM-203 و PRM-204 معتبر | خودکار          |
| QG-02 | Review → Approved | انطباق با ARCH-003, EDT-002, PRM-000     | Prompt Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3)                | Registry Keeper |

---

## 13. Dependencies

| شناسه    | نوع               | نسخه   | دلیل                                    |
| -------- | ----------------- | ------ | --------------------------------------- |
| PRM-203  | DEP-01 (Requires) | ^1.0.0 | محتوای ساختاریافته منبع ترجمه           |
| PRM-204  | DEP-01 (Requires) | ^1.0.0 | فراداده منبع برای ترجمه                 |
| PRM-402  | DEP-01 (Requires) | ^1.0.0 | بافت تاکسونومی (CT-IDهای غیرقابل ترجمه) |
| ARCH-003 | DEP-05 (Provides) | ^1.0.0 | واژگان رسمی برای حفظ اصطلاحات           |

---

## 14. Human Override

| سناریو                              | اقدام                              |
| ----------------------------------- | ---------------------------------- |
| full_localization                   | تأیید انسانی الزامی                |
| اصطلاح برند در زبان مقصد وجود ندارد | تصمیم‌گیری توسط Brand Manager      |
| تعارض فرهنگی در بومی‌سازی           | Escalation به Localization Manager |

---

## 15. Governance Notes

| ID     | یادداشت                                               |
| ------ | ----------------------------------------------------- |
| GOV-01 | نسخه ترجمه‌شده باید نسخه اصلی را در فراداده ارجاع دهد |
| GOV-02 | تغییر در اصطلاحات برند در ترجمه نیازمند ADR است       |
| GOV-03 | ممیزی کیفیت ترجمه به صورت ماهانه انجام می‌شود         |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-206",
  "name": "Localization & Translation Instruction",
  "family": "FAM-CON",
  "subfamily": "CON-PRD",
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
    { "type": "CTX-04", "source": "PRM-203", "required": true },
    { "type": "CTX-04", "source": "PRM-204", "required": true },
    { "type": "CTX-02", "source": "PRM-402", "required": true },
    { "type": "CTX-02", "source": "ARCH-003", "required": true }
  ],
  "max_tokens": 3500,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "structured_content", "type": "VAR-06", "required": true },
    { "id": "content_metadata", "type": "VAR-06", "required": true },
    { "id": "source_language", "type": "VAR-04", "required": true, "members": ["fa", "en"] },
    {
      "id": "target_languages",
      "type": "VAR-07",
      "required": true,
      "min_items": 1,
      "max_items": 5
    },
    {
      "id": "localization_depth",
      "type": "VAR-04",
      "required": false,
      "members": ["translation_only", "light_localization", "full_localization"],
      "default": "translation_only"
    }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["structured_content", "content_metadata", "source_language", "target_languages"],
    "optional": ["localization_depth"]
  },
  "output": {
    "required": ["localized_documents", "terminology_consistency_report"],
    "optional": ["localized_metadata", "cross_reference_preservation", "localization_notes"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "CT-ID and content IDs not translated", "severity": "error" },
    { "id": "VAL-02", "description": "ARCH-003 terms preserved", "severity": "error" },
    { "id": "VAL-03", "description": "SMOS references preserved", "severity": "error" },
    { "id": "VAL-04", "description": "Max 5 target languages", "severity": "warning" },
    { "id": "VAL-05", "description": "Full localization → human approval", "severity": "error" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-003", "AI-006", "AI-008"],
  "dependencies": ["PRM-203", "PRM-204", "PRM-402", "ARCH-003"],
  "documentation_refs": ["ARCH-003", "EDT-002", "BRD-002"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                                      | توسط        |
| ----------- | ---------- | ------------------------------------------ | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — دستورالعمل بومی‌سازی و ترجمه | معمار سیستم |
