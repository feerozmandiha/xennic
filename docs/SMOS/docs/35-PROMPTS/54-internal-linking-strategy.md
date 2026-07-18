# Internal Linking Strategy — استراتژی پیوندهای داخلی

> **شناسه:** PRM-222
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Content Producer
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-220](./50-semantic-optimization.md), [PRM-221](./52-search-intent-alignment.md), [PRM-402](./42-content-taxonomy-context.md), [ARCH-012](../00-ARCHITECTURE/12-knowledge-model.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                     |
| ------------------ | ------------------------- |
| **id**             | PRM-222                   |
| **name_fa**        | استراتژی پیوندهای داخلی   |
| **name_en**        | Internal Linking Strategy |
| **family**         | FAM-CON                   |
| **subfamily**      | CON-SEO                   |
| **type**           | PT-04                     |
| **complexity**     | C-3                       |
| **authority**      | A-3                       |
| **owner**          | Content Producer          |
| **version**        | 1.0.0-draft               |
| **status**         | draft                     |
| **security_level** | SL-02                     |

---

## 2. Purpose

PRM-222 پیوندهای داخلی سازمانی (پیوندهای معنایی، سلسله‌مراتبی، ارجاعی و لبه‌های گراف دانش) را برای محتوای متعارف تولید می‌کند. این پرامپت تضمین می‌کند محتوا در شبکه دانش سازمانی قابل کشف و دارای روابط غنی با سایر اسناد است.

### اصول پیوند داخلی

| ID    | اصل                                                      |
| ----- | -------------------------------------------------------- |
| IL-01 | هر پیوند باید دارای توجیه معنایی مشخص باشد               |
| IL-02 | پیوندها باید به موجودیت‌های ثبت‌شده در KNW-\* اشاره کنند |
| IL-03 | سلسله‌مراتب پیوندها باید با ARCH-012 همخوانی داشته باشد  |
| IL-04 | پیوندهای پیش‌نیاز و پس‌نیاز باید صریح باشند              |
| IL-05 | لبه‌های گراف دانش باید غیرچرخه‌ای باشند                  |

---

## 3. Scope

### Inside Scope

| حوزه                  | توضیح                                     |
| --------------------- | ----------------------------------------- |
| پیوندهای معنایی       | پیوند بر اساس رابطه معنایی بین موجودیت‌ها |
| پیوندهای سلسله‌مراتبی | parent/child, broader/narrower            |
| ارجاعات پیش‌نیاز      | اسناد مورد نیاز برای درک محتوای جاری      |
| پیوند به اسناد مرتبط  | محتوای مرتبط موضوعی                       |
| لبه‌های گراف دانش     | روابط قابل پردازش توسط AI-011             |

### Outside Scope

| حوزه                | دلیل                      |
| ------------------- | ------------------------- |
| پیوندهای خارجی      | خارج از حوزه دانش سازمانی |
| پیوندهای پلتفرمی    | حوزه PRM-207              |
| پیوندهای ناوبری UI  | خارج از معماری محتوا      |
| بهینه‌سازی سئوی فنی | خارج از تکنولوژی-خنثایی   |

---

## 4. Consumers

| مصرف‌کننده                    | نقش                                        | نوع مصرف |
| ----------------------------- | ------------------------------------------ | -------- |
| AI-005 (Search Optimization)  | تولید پیوندهای داخلی برای محتوای بهینه‌شده | Chain    |
| AI-011 (Knowledge Management) | دریافت لبه‌های گراف دانش برای نمایه‌سازی   | Chain    |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-220 Output",
        "scope": ["semantic-report", "entity-map"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-04",
        "source": "PRM-221 Output",
        "scope": ["intent-report", "intent-classification"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "ARCH-012",
        "scope": ["knowledge-model", "relationship-types", "edge-definitions"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "KNW-*",
        "scope": ["existing-knowledge-assets", "published-content-index"],
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

| منبع     | دامنه           | کاربرد                          |
| -------- | --------------- | ------------------------------- |
| ARCH-012 | مدل دانش        | انواع روابط و لبه‌های گراف دانش |
| KNW-\*   | دارایی‌های دانش | شناسایی اسناد موجود برای پیوند  |
| EDT-002  | تاکسونومی       | تطابق پیوند با نوع محتوا        |

---

## 7. Variables

| متغیر                      | نوع    | اجباری | توضیح                        | اعتبارسنجی                   |
| -------------------------- | ------ | ------ | ---------------------------- | ---------------------------- |
| `semantic_report`          | VAR-06 | بله    | گزارش معنایی از PRM-220      | —                            |
| `intent_report`            | VAR-06 | بله    | گزارش قصد جستجو از PRM-221   | —                            |
| `existing_knowledge_index` | VAR-07 | خیر    | نمایه اسناد موجود برای پیوند | —                            |
| `max_links_per_document`   | VAR-02 | خیر    | حداکثر پیوند در هر سند       | min: 1, max: 20, default: 10 |

---

## 8. Constraints

| ID     | محدودیت                                              |
| ------ | ---------------------------------------------------- |
| CST-01 | همه پیوندها باید به موجودیت‌های ثبت‌شده اشاره کنند   |
| CST-02 | پیوندهای چرخه‌ای ممنوع                               |
| CST-03 | حداکثر ۲۰ پیوند خروجی در هر سند                      |
| CST-04 | هر پیوند باید دارای type رابطه مشخص از ARCH-012 باشد |

---

## 9. Input Contract

| ورودی                      | نوع    | منبع    | اجباری |
| -------------------------- | ------ | ------- | ------ |
| `semantic_report`          | object | PRM-220 | بله    |
| `intent_report`            | object | PRM-221 | بله    |
| `existing_knowledge_index` | array  | AI-011  | خیر    |
| `max_links_per_document`   | number | AI-005  | خیر    |

---

## 10. Output Contract

| خروجی                   | نوع    | توضیح                                |
| ----------------------- | ------ | ------------------------------------ |
| `linking_report`        | object | گزارش کامل استراتژی پیوند داخلی      |
| `semantic_links`        | array  | پیوندهای معنایی با type و توجیه      |
| `hierarchical_links`    | array  | پیوندهای سلسله‌مراتبی (parent/child) |
| `prerequisite_refs`     | array  | ارجاعات پیش‌نیاز با اولویت           |
| `knowledge_graph_edges` | array  | لبه‌های گراف دانش برای AI-011        |
| `linking_score`         | number | امتیاز پوشش پیوند (۰–۱۰۰)            |

---

## 11. Validation Rules

| ID     | قاعده                                          | سطح    | نقض     |
| ------ | ---------------------------------------------- | ------ | ------- |
| VAL-01 | همه پیوندها به موجودیت‌های معتبر اشاره می‌کنند | معماری | عدم ثبت |
| VAL-02 | گراف پیوند غیرچرخه‌ای (DAG)                    | معماری | عدم ثبت |
| VAL-03 | هر پیوند دارای type رابطه مشخص از ARCH-012     | معماری | هشدار   |
| VAL-04 | حداکثر ۲۰ پیوند خروجی                          | معماری | هشدار   |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                                            | مسئول           |
| ----- | ----------------- | ------------------------------------------------ | --------------- |
| QG-01 | Draft → Review    | هویت کامل, وابستگی به PRM-220, PRM-221, ARCH-012 | خودکار          |
| QG-02 | Review → Approved | انطباق با ARCH-012, EDT-002                      | Prompt Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3)                        | Registry Keeper |

---

## 13. Dependencies

| شناسه    | نوع               | نسخه   | دلیل                      |
| -------- | ----------------- | ------ | ------------------------- |
| PRM-220  | DEP-01 (Requires) | ^1.0.0 | گزارش معنایی و entity map |
| PRM-221  | DEP-01 (Requires) | ^1.0.0 | گزارش قصد جستجو           |
| ARCH-012 | DEP-05 (Provides) | ^1.0.0 | مدل دانش و انواع روابط    |

---

## 14. Human Override

| سناریو                   | اقدام                                          |
| ------------------------ | ---------------------------------------------- |
| پیوند به موجودیت نامعتبر | حذف پیوند + اطلاع‌رسانی به Knowledge Architect |
| linking_score < ۵۰       | بازگشت به AI-005 برای بهینه‌سازی               |
| عدم دسترسی به KNW-\*     | ادامه با پیوندهای معنایی داخلی فقط             |

---

## 15. Governance Notes

| ID     | یادداشت                                               |
| ------ | ----------------------------------------------------- |
| GOV-01 | A-3 (Strategic) — نیازمند ADR + تأیید مدیر            |
| GOV-02 | C-3 (Complex) — ترکیب ۳ منبع ورودی مستقل              |
| GOV-03 | لبه‌های گراف دانش باید با ARCH-۱۲ همخوانی داشته باشند |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-222",
  "name": "Internal Linking Strategy",
  "family": "FAM-CON",
  "subfamily": "CON-SEO",
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
    { "type": "CTX-04", "source": "PRM-220", "required": true },
    { "type": "CTX-04", "source": "PRM-221", "required": true },
    { "type": "CTX-02", "source": "ARCH-012", "required": true },
    { "type": "CTX-02", "source": "KNW-*", "required": false }
  ],
  "max_tokens": 5000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "semantic_report", "type": "VAR-06", "required": true },
    { "id": "intent_report", "type": "VAR-06", "required": true },
    { "id": "existing_knowledge_index", "type": "VAR-07", "required": false },
    {
      "id": "max_links_per_document",
      "type": "VAR-02",
      "required": false,
      "min": 1,
      "max": 20,
      "default": 10
    }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["semantic_report", "intent_report"],
    "optional": ["existing_knowledge_index", "max_links_per_document"]
  },
  "output": {
    "required": ["linking_report", "semantic_links", "linking_score"],
    "optional": ["hierarchical_links", "prerequisite_refs", "knowledge_graph_edges"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "All links point to valid entities", "severity": "error" },
    { "id": "VAL-02", "description": "Link graph is DAG", "severity": "error" },
    {
      "id": "VAL-03",
      "description": "Each link has ARCH-012 relationship type",
      "severity": "warning"
    },
    { "id": "VAL-04", "description": "Max 20 output links", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-005", "AI-011"],
  "dependencies": ["PRM-220", "PRM-221", "ARCH-012"],
  "documentation_refs": ["ARCH-012", "KNW-*", "EDT-002"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                                 | توسط        |
| ----------- | ---------- | ------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — استراتژی پیوندهای داخلی | معمار سیستم |
