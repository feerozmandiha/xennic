# Structured Metadata Enhancement — بهینه‌سازی فراداده ساختاریافته

> **شناسه:** PRM-223
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Content Producer
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-220](./50-semantic-optimization.md), [PRM-222](./54-internal-linking-strategy.md), [PRM-402](./42-content-taxonomy-context.md), [EDT-002](../24-EDITORIAL/20-content-taxonomy.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                           |
| ------------------ | ------------------------------- |
| **id**             | PRM-223                         |
| **name_fa**        | بهینه‌سازی فراداده ساختاریافته  |
| **name_en**        | Structured Metadata Enhancement |
| **family**         | FAM-CON                         |
| **subfamily**      | CON-SEO                         |
| **type**           | PT-04                           |
| **complexity**     | C-3                             |
| **authority**      | A-3                             |
| **owner**          | Content Producer                |
| **version**        | 1.0.0-draft                     |
| **status**         | draft                           |
| **security_level** | SL-02                           |

---

## 2. Purpose

PRM-223 فراداده ساختاریافته (schema.org, JSON-LD, Open Graph, Dublin Core) را برای محتوای متعارف SMOS تولید و بهینه می‌کند. این پرامپت تضمین می‌کند هر دارایی محتوایی دارای فراداده غنی، استاندارد و قابل پردازش ماشینی است.

### اصول بهینه‌سازی فراداده

| ID    | اصل                                                                    |
| ----- | ---------------------------------------------------------------------- |
| ME-01 | فراداده باید از استانداردهای شناخته‌شده (schema.org, og, dc) پیروی کند |
| ME-02 | هر محتوا باید حداقل یک type schema.org داشته باشد                      |
| ME-03 | فراداده باید با تاکسونومی سازمانی (EDT-002) همخوان باشد                |
| ME-04 | فراداده باید برای مصرف توسط پلتفرم‌های هدف (PLAT-\*) بهینه شود         |
| ME-05 | فراداده تولیدی باید قابل راستی‌آزمایی با PRM-208 باشد                  |

---

## 3. Scope

### Inside Scope

| حوزه                 | توضیح                                   |
| -------------------- | --------------------------------------- |
| Schema.org JSON-LD   | تولید فراداده ساختاریافته با type مناسب |
| Open Graph           | تولید og:meta برای اشتراک‌گذاری اجتماعی |
| Dublin Core          | تولید dc:meta برای نمایه‌سازی           |
| Twitter Cards        | فراداده مخصوص توییتر/ایکس               |
| فراداده اختصاصی SMOS | بلوک‌های فراداده سازمانی (GOV-005)      |

### Outside Scope

| حوزه                   | دلیل                    |
| ---------------------- | ----------------------- |
| فراداده تصویر/ویدئو    | حوزه AI-006, AI-007     |
| فراداده سفارشی پلتفرم  | حوزه PRM-207            |
| اعتبارسنجی فنی فراداده | حوزه PRM-224, PRM-208   |
| بهینه‌سازی سئوی فنی    | خارج از تکنولوژی-خنثایی |

---

## 4. Consumers

| مصرف‌کننده                    | نقش                              | نوع مصرف |
| ----------------------------- | -------------------------------- | -------- |
| AI-005 (Search Optimization)  | بهینه‌سازی فراداده محتوای متعارف | Chain    |
| AI-011 (Knowledge Management) | دریافت فراداده برای نمایه‌سازی   | Chain    |

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
        "source": "PRM-222 Output",
        "scope": ["linking-report", "semantic-links", "knowledge-graph-edges"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PRM-402",
        "scope": ["content-attributes", "ct-id-rules", "ct-id-value"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PRM-401",
        "scope": ["brand-identity", "brand-meta-tags"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PLAT-*",
        "scope": ["platform-meta-requirements", "og-requirements"],
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

| منبع    | دامنه     | کاربرد                                 |
| ------- | --------- | -------------------------------------- |
| EDT-002 | تاکسونومی | تطابق CT-ID با schema.org type         |
| BRD-002 | برند      | فراداده برند (og:site_name, publisher) |
| PLAT-\* | پلتفرم‌ها | الزامات فراداده هر پلتفرم              |

---

## 7. Variables

| متغیر              | نوع    | اجباری | توضیح                                    | اعتبارسنجی         |
| ------------------ | ------ | ------ | ---------------------------------------- | ------------------ |
| `semantic_report`  | VAR-06 | بله    | گزارش معنایی از PRM-220                  | —                  |
| `linking_report`   | VAR-06 | بله    | گزارش پیوند از PRM-222                   | —                  |
| `platform_targets` | VAR-07 | خیر    | لیست پلتفرم‌های هدف برای فراداده خاص     | default: [website] |
| `schema_org_type`  | VAR-05 | خیر    | نوع schema.org (استخراج خودکار از CT-ID) | —                  |
| `generate_og`      | VAR-03 | خیر    | تولید فراداده Open Graph                 | default: true      |
| `generate_twitter` | VAR-03 | خیر    | تولید فراداده Twitter Card               | default: true      |

---

## 8. Constraints

| ID     | محدودیت                                                    |
| ------ | ---------------------------------------------------------- |
| CST-01 | فراداده باید با استانداردهای schema.org 3.x+ سازگار باشد   |
| CST-02 | og:description ≤ ۳۰۰ کاراکتر                               |
| CST-03 | twitter:description ≤ ۲۰۰ کاراکتر                          |
| CST-04 | فراداده اختصاصی SMOS نباید با استانداردهای عمومی تداخل کند |

---

## 9. Input Contract

| ورودی              | نوع     | منبع           | اجباری |
| ------------------ | ------- | -------------- | ------ |
| `semantic_report`  | object  | PRM-220        | بله    |
| `linking_report`   | object  | PRM-222        | بله    |
| `platform_targets` | array   | AI-005, AI-011 | خیر    |
| `generate_og`      | boolean | AI-005         | خیر    |
| `generate_twitter` | boolean | AI-005         | خیر    |

---

## 10. Output Contract

| خروجی                     | نوع    | توضیح                              |
| ------------------------- | ------ | ---------------------------------- |
| `metadata_report`         | object | گزارش کامل فراداده تولیدی          |
| `schema_jsonld`           | object | فراداده schema.org در قالب JSON-LD |
| `og_meta`                 | object | فراداده Open Graph                 |
| `twitter_meta`            | object | فراداده Twitter Card               |
| `dc_meta`                 | object | فراداده Dublin Core                |
| `smm_meta`                | object | فراداده اختصاصی SMOS (GOV-005)     |
| `metadata_coverage_score` | number | امتیاز پوشش فراداده (۰–۱۰۰)        |

---

## 11. Validation Rules

| ID     | قاعده                                 | سطح    | نقض     |
| ------ | ------------------------------------- | ------ | ------- |
| VAL-01 | JSON-LD معتبر و قابل parse            | معماری | عدم ثبت |
| VAL-02 | og:description ≤ ۳۰۰ کاراکتر          | معماری | هشدار   |
| VAL-03 | twitter:description ≤ ۲۰۰ کاراکتر     | معماری | هشدار   |
| VAL-04 | schema.org type با CT-ID همخوانی دارد | معماری | هشدار   |
| VAL-05 | هیچ فراداده خالی یا null تولید نشده   | معماری | عدم ثبت |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                                  | مسئول           |
| ----- | ----------------- | -------------------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل, وابستگی به PRM-220, PRM-222 | خودکار          |
| QG-02 | Review → Approved | انطباق با schema.org, GOV-005          | Prompt Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3)              | Registry Keeper |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                              |
| ------- | ------------------- | ------ | --------------------------------- |
| PRM-220 | DEP-01 (Requires)   | ^1.0.0 | گزارش معنایی برای استخراج فراداده |
| PRM-222 | DEP-01 (Requires)   | ^1.0.0 | پیوندها برای فراداده ارتباطی      |
| PRM-402 | DEP-03 (References) | ^1.0.0 | بافت تاکسونومی برای تطابق type    |
| PRM-401 | DEP-03 (References) | ^1.0.0 | فراداده برند                      |

---

## 14. Human Override

| سناریو                       | اقدام                                                     |
| ---------------------------- | --------------------------------------------------------- |
| metadata_coverage_score < ۶۰ | Escalation به Content Editor برای تکمیل فراداده           |
| نوع schema.org نامشخص        | پیشنهاد رایج‌ترین type + اطلاع‌رسانی به Content Architect |

---

## 15. Governance Notes

| ID     | یادداشت                                     |
| ------ | ------------------------------------------- |
| GOV-01 | A-3 (Strategic) — نیازمند ADR + تأیید مدیر  |
| GOV-02 | C-3 (Complex) — ترکیب چند استاندارد فراداده |
| GOV-03 | تغییر در GOV-005 نیازمند بازبینی smm_meta   |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-223",
  "name": "Structured Metadata Enhancement",
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
    { "type": "CTX-04", "source": "PRM-222", "required": true },
    { "type": "CTX-02", "source": "PRM-402", "required": true },
    { "type": "CTX-02", "source": "PRM-401", "required": true },
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
    { "id": "semantic_report", "type": "VAR-06", "required": true },
    { "id": "linking_report", "type": "VAR-06", "required": true },
    { "id": "platform_targets", "type": "VAR-07", "required": false, "default": ["website"] },
    { "id": "generate_og", "type": "VAR-03", "required": false, "default": true },
    { "id": "generate_twitter", "type": "VAR-03", "required": false, "default": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["semantic_report", "linking_report"],
    "optional": ["platform_targets", "generate_og", "generate_twitter"]
  },
  "output": {
    "required": ["metadata_report", "schema_jsonld", "metadata_coverage_score"],
    "optional": ["og_meta", "twitter_meta", "dc_meta", "smm_meta"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Valid parseable JSON-LD", "severity": "error" },
    { "id": "VAL-02", "description": "og:description ≤ 300 chars", "severity": "warning" },
    { "id": "VAL-03", "description": "twitter:description ≤ 200 chars", "severity": "warning" },
    { "id": "VAL-04", "description": "schema.org type matches CT-ID", "severity": "warning" },
    { "id": "VAL-05", "description": "No null or empty metadata fields", "severity": "error" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-005", "AI-011"],
  "dependencies": ["PRM-220", "PRM-222", "PRM-402", "PRM-401"],
  "documentation_refs": ["EDT-002", "BRD-002", "PLAT-*", "GOV-005"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                                        | توسط        |
| ----------- | ---------- | -------------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — بهینه‌سازی فراداده ساختاریافته | معمار سیستم |
