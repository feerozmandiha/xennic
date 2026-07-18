# Semantic Optimization — بهینه‌سازی معنایی

> **شناسه:** PRM-220
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Content Producer
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-203](./24-content-structuring-instruction.md), [PRM-401](./40-brand-voice-context.md), [PRM-402](./42-content-taxonomy-context.md), [ARCH-003](../00-ARCHITECTURE/03-enterprise-vocabulary.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                 |
| ------------------ | --------------------- |
| **id**             | PRM-220               |
| **name_fa**        | بهینه‌سازی معنایی     |
| **name_en**        | Semantic Optimization |
| **family**         | FAM-CON               |
| **subfamily**      | CON-SEO               |
| **type**           | PT-04                 |
| **complexity**     | C-3                   |
| **authority**      | A-3                   |
| **owner**          | Content Producer      |
| **version**        | 1.0.0-draft           |
| **status**         | draft                 |
| **security_level** | SL-02                 |

---

## 2. Purpose

PRM-220 شفافیت معنایی محتوای متعارف را بدون تغییر در مفهوم اصلی بهبود می‌بخشد. این پرامپت ساختار معنایی، روابط موجودیت‌ها، نرمال‌سازی اصطلاحات، سازگاری مفهومی و آمادگی برای گراف دانش را تضمین می‌کند.

### اصول بهینه‌سازی معنایی

| ID    | اصل                                                      |
| ----- | -------------------------------------------------------- |
| SO-01 | معنا حفظ می‌شود — بهینه‌سازی هرگز مفهوم را تغییر نمی‌دهد |
| SO-02 | موجودیت‌ها (Entity) باید قابل شناسایی و متمایز باشند     |
| SO-03 | اصطلاحات باید با ARCH-003 نرمال شوند                     |
| SO-04 | روابط معنایی باید صریح و قابل ردیابی باشند               |
| SO-05 | خروجی باید برای گراف دانش قابل پردازش باشد               |

---

## 3. Scope

### Inside Scope

| حوزه                       | توضیح                                         |
| -------------------------- | --------------------------------------------- |
| بهینه‌سازی ساختار معنایی   | شفاف‌سازی روابط منطقی بین جملات و پاراگراف‌ها |
| شناسایی و تفکیک موجودیت‌ها | تشخیص موجودیت‌های کلیدی و تمایز آنها          |
| نرمال‌سازی اصطلاحات        | یکسان‌سازی اصطلاحات بر اساس ARCH-003          |
| سازگاری مفهومی             | اطمینان از ثبات مفهومی در سراسر سند           |
| آمادگی گراف دانش           | ساختاردهی برای مصرف در AI-011                 |

### Outside Scope

| حوزه                      | دلیل         |
| ------------------------- | ------------ |
| بهینه‌سازی ساختار سند     | حوزه PRM-203 |
| بهینه‌سازی فراداده        | حوزه PRM-223 |
| بهینه‌سازی پیوندهای داخلی | حوزه PRM-222 |
| اعتبارسنجی قابلیت کشف     | حوزه PRM-224 |
| بهینه‌سازی قالب پلتفرمی   | حوزه PRM-207 |

---

## 4. Consumers

| مصرف‌کننده                   | نقش                                  | نوع مصرف |
| ---------------------------- | ------------------------------------ | -------- |
| AI-005 (Search Optimization) | بهینه‌سازی معنایی محتوای ساختاریافته | Chain    |

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
        "type": "CTX-02",
        "source": "ARCH-003",
        "scope": ["canonical-vocabulary", "entity-definitions"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PRM-402",
        "scope": ["content-attributes", "ct-id-rules"],
        "injection": "append",
        "required": true
      }
    ],
    "max_tokens": 4000,
    "priority": "high"
  }
}
```

---

## 6. Required Knowledge

| منبع     | دامنه          | کاربرد                           |
| -------- | -------------- | -------------------------------- |
| ARCH-003 | واژه‌نامه رسمی | نرمال‌سازی اصطلاحات و موجودیت‌ها |
| EDT-002  | تاکسونومی      | تطابق معنایی با نوع محتوا        |
| BRD-002  | صدای برند      | حفظ لحن در بهینه‌سازی            |

---

## 7. Variables

| متغیر                     | نوع    | اجباری | توضیح                      | اعتبارسنجی                                     |
| ------------------------- | ------ | ------ | -------------------------- | ---------------------------------------------- |
| `structured_document`     | VAR-06 | بله    | سند ساختاریافته از PRM-203 | —                                              |
| `normalize_terms`         | VAR-03 | خیر    | اعمال نرمال‌سازی اصطلاحات  | default: true                                  |
| `entity_extraction_depth` | VAR-04 | خیر    | عمق استخراج موجودیت‌ها     | members: [core, extended, full], default: core |

---

## 8. Constraints

| ID     | محدودیت                                                |
| ------ | ------------------------------------------------------ |
| CST-01 | معنا و مفهوم اصلی هرگز تغییر نمی‌کند                   |
| CST-02 | اصطلاحات نرمال‌شده باید با ARCH-003 مطابقت داشته باشند |
| CST-03 | روابط معنایی باید غیرچرخه‌ای (DAG) باشند               |
| CST-04 | حداکثر ۱۰٪ از متن می‌تواند برای شفافیت بازنویسی شود    |

---

## 9. Input Contract

| ورودی                     | نوع     | منبع    | اجباری |
| ------------------------- | ------- | ------- | ------ |
| `structured_document`     | object  | PRM-203 | بله    |
| `normalize_terms`         | boolean | AI-005  | خیر    |
| `entity_extraction_depth` | enum    | AI-005  | خیر    |

---

## 10. Output Contract

| خروجی                     | نوع     | توضیح                                   |
| ------------------------- | ------- | --------------------------------------- |
| `semantic_report`         | object  | گزارش کامل بهینه‌سازی معنایی            |
| `entity_map`              | object  | نگاشت موجودیت‌ها با شناسه و روابط       |
| `normalized_terms`        | array   | اصطلاحات نرمال‌شده با ارجاع به ARCH-003 |
| `knowledge_graph_ready`   | boolean | آمادگی برای مصرف در گراف دانش           |
| `semantic_fidelity_score` | number  | امتیاز وفاداری معنایی (۰–۱۰۰)           |

---

## 11. Validation Rules

| ID     | قاعده                             | سطح    | نقض     |
| ------ | --------------------------------- | ------ | ------- |
| VAL-01 | معنا و مفهوم اصلی حفظ شده         | معماری | عدم ثبت |
| VAL-02 | اصطلاحات نرمال‌شده مطابق ARCH-003 | معماری | هشدار   |
| VAL-03 | روابط معنایی DAG                  | معماری | عدم ثبت |
| VAL-04 | حداکثر ۱۰٪ بازنویسی برای شفافیت   | معماری | هشدار   |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                                   | مسئول           |
| ----- | ----------------- | --------------------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل, وابستگی به PRM-203, ARCH-003 | خودکار          |
| QG-02 | Review → Approved | انطباق با ARCH-003, EDT-002             | Prompt Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3)               | Registry Keeper |

---

## 13. Dependencies

| شناسه    | نوع                 | نسخه   | دلیل                             |
| -------- | ------------------- | ------ | -------------------------------- |
| PRM-203  | DEP-01 (Requires)   | ^1.0.0 | سند ساختاریافته ورودی اصلی       |
| ARCH-003 | DEP-05 (Provides)   | ^1.0.0 | واژه‌نامه رسمی برای نرمال‌سازی   |
| PRM-402  | DEP-03 (References) | ^1.0.0 | بافت تاکسونومی برای تطابق معنایی |

---

## 14. Human Override

| سناریو                          | اقدام                                 |
| ------------------------------- | ------------------------------------- |
| semantic_fidelity_score < ۸۰    | بازگشت به AI-005 برای بهینه‌سازی مجدد |
| entity_map با ARCH-003 ناسازگار | Escalation به Knowledge Architect     |

---

## 15. Governance Notes

| ID     | یادداشت                                                   |
| ------ | --------------------------------------------------------- |
| GOV-01 | A-3 (Strategic) — نیازمند ADR + تأیید مدیر                |
| GOV-02 | تغییر در قواعد نرمال‌سازی نیازمند به‌روزرسانی ARCH-003    |
| GOV-03 | knowledge_graph_ready=false باید مسیر AI-011 را مسدود کند |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-220",
  "name": "Semantic Optimization",
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
    { "type": "CTX-04", "source": "PRM-203", "required": true },
    { "type": "CTX-02", "source": "ARCH-003", "required": true },
    { "type": "CTX-02", "source": "PRM-402", "required": false }
  ],
  "max_tokens": 4000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "structured_document", "type": "VAR-06", "required": true },
    { "id": "normalize_terms", "type": "VAR-03", "required": false, "default": true },
    {
      "id": "entity_extraction_depth",
      "type": "VAR-04",
      "required": false,
      "members": ["core", "extended", "full"],
      "default": "core"
    }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["structured_document"],
    "optional": ["normalize_terms", "entity_extraction_depth"]
  },
  "output": {
    "required": ["semantic_report", "entity_map", "semantic_fidelity_score"],
    "optional": ["normalized_terms", "knowledge_graph_ready"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Core meaning preserved", "severity": "error" },
    { "id": "VAL-02", "description": "Normalized terms match ARCH-003", "severity": "warning" },
    { "id": "VAL-03", "description": "Semantic relationships form DAG", "severity": "error" },
    { "id": "VAL-04", "description": "Max 10% rewriting for clarity", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-005"],
  "dependencies": ["PRM-203", "ARCH-003", "PRM-402"],
  "documentation_refs": ["ARCH-003", "EDT-002", "BRD-002"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                           | توسط        |
| ----------- | ---------- | ------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — بهینه‌سازی معنایی | معمار سیستم |
