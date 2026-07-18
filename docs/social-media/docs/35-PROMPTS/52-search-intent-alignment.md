# Search Intent Alignment — هم‌راستاسازی با قصد جستجو

> **شناسه:** PRM-221
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Content Producer
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-220](./50-semantic-optimization.md), [PRM-401](./40-brand-voice-context.md), [PRM-402](./42-content-taxonomy-context.md), [EDT-002](../24-EDITORIAL/20-content-taxonomy.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                     |
| ------------------ | ------------------------- |
| **id**             | PRM-221                   |
| **name_fa**        | هم‌راستاسازی با قصد جستجو |
| **name_en**        | Search Intent Alignment   |
| **family**         | FAM-CON                   |
| **subfamily**      | CON-SEO                   |
| **type**           | PT-04                     |
| **complexity**     | C-2                       |
| **authority**      | A-3                       |
| **owner**          | Content Producer          |
| **version**        | 1.0.0-draft               |
| **status**         | draft                     |
| **security_level** | SL-02                     |

---

## 2. Purpose

PRM-221 محتوای سازمانی را با انواع قصد جستجوی کاربر (informational, navigational, transactional, educational) هم‌راستا می‌کند. این پرامپت تضمین می‌کند محتوا به نیازهای جستجوی مخاطب پاسخ می‌دهد و برای قصد جستجوی هدف بهینه شده است.

### اصول هم‌راستاسازی با قصد جستجو

| ID    | اصل                                                    |
| ----- | ------------------------------------------------------ |
| IA-01 | هر محتوا باید برای یک نوع قصد جستجوی مشخص بهینه شود    |
| IA-02 | قصد جستجو باید با نوع محتوا (CT-ID) همخوانی داشته باشد |
| IA-03 | محتوا باید به سؤالات ضمنی کاربر در آن قصد پاسخ دهد     |
| IA-04 | طبقه‌بندی قصد باید مبتنی بر Taxonomy سازمانی باشد      |

---

## 3. Scope

### Inside Scope

| حوزه                 | توضیح                                 |
| -------------------- | ------------------------------------- |
| طبقه‌بندی قصد جستجو  | تعیین نوع قصد dominant برای محتوا     |
| هم‌راستاسازی ساختار  | تطبیق ساختار محتوا با قصد جستجو       |
| بهینه‌سازی پاسخ‌دهی  | اطمینان از پاسخ به سؤالات کلیدی کاربر |
| اعتبارسنجی تطابق قصد | بررسی همخوانی قصد با CT-ID            |

### Outside Scope

| حوزه                      | دلیل                                   |
| ------------------------- | -------------------------------------- |
| بهینه‌سازی معنایی         | حوزه PRM-220                           |
| بهینه‌سازی فراداده        | حوزه PRM-223                           |
| بهینه‌سازی پیوندهای داخلی | حوزه PRM-222                           |
| بهینه‌سازی فنی سئو        | خارج از تکنولوژی-خنثایی                |
| کلمات کلیدی               | خارج از معماری — وابسته به موتور جستجو |

---

## 4. Consumers

| مصرف‌کننده                   | نقش                                  | نوع مصرف |
| ---------------------------- | ------------------------------------ | -------- |
| AI-005 (Search Optimization) | هم‌راستاسازی محتوا با قصد جستجوی هدف | Chain    |

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
        "type": "CTX-02",
        "source": "PRM-402",
        "scope": ["content-attributes", "ct-id-rules"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "EDT-002",
        "scope": ["intent-classification", "intent-to-content-mapping"],
        "injection": "prepend",
        "required": true
      }
    ],
    "max_tokens": 3000,
    "priority": "high"
  }
}
```

---

## 6. Required Knowledge

| منبع    | دامنه     | کاربرد                               |
| ------- | --------- | ------------------------------------ |
| EDT-002 | تاکسونومی | طبقه‌بندی قصد جستجو و نگاشت به CT-ID |
| BRD-002 | صدای برند | تطبیق لحن با نوع قصد جستجو           |

---

## 7. Variables

| متغیر             | نوع    | اجباری | توضیح                   | اعتبارسنجی                                                         |
| ----------------- | ------ | ------ | ----------------------- | ------------------------------------------------------------------ |
| `semantic_report` | VAR-06 | بله    | گزارش معنایی از PRM-220 | —                                                                  |
| `target_intent`   | VAR-04 | بله    | قصد جستجوی هدف          | members: [informational, navigational, transactional, educational] |

---

## 8. Constraints

| ID     | محدودیت                                         |
| ------ | ----------------------------------------------- |
| CST-01 | محتوا فقط برای یک قصد dominant بهینه می‌شود     |
| CST-02 | قصد جستجو باید با CT-ID همخوانی داشته باشد      |
| CST-03 | تغییر در محتوا نباید وفاداری معنایی را کاهش دهد |
| CST-04 | لحن برند (BRD-002) در هم‌راستاسازی حفظ می‌شود   |

---

## 9. Input Contract

| ورودی             | نوع    | منبع           | اجباری |
| ----------------- | ------ | -------------- | ------ |
| `semantic_report` | object | PRM-220        | بله    |
| `target_intent`   | enum   | AI-014, AI-005 | بله    |

---

## 10. Output Contract

| خروجی                   | نوع    | توضیح                                |
| ----------------------- | ------ | ------------------------------------ |
| `intent_report`         | object | گزارش کامل هم‌راستاسازی با قصد جستجو |
| `intent_classification` | object | طبقه‌بندی قصد dominant و secondary   |
| `alignment_score`       | number | امتیاز هم‌راستاسازی با قصد (۰–۱۰۰)   |
| `coverage_gaps`         | array  | شکاف‌های پوشش سؤالات کاربر           |

---

## 11. Validation Rules

| ID     | قاعده                                   | سطح    | نقض     |
| ------ | --------------------------------------- | ------ | ------- |
| VAL-01 | یک قصد dominant برای محتوا تعیین شده    | معماری | هشدار   |
| VAL-02 | قصد جستجو با CT-ID همخوانی دارد         | معماری | هشدار   |
| VAL-03 | وفاداری معنایی ≥ ۹۰٪ پس از هم‌راستاسازی | معماری | عدم ثبت |
| VAL-04 | لحن برند در هم‌راستاسازی حفظ شده        | معماری | عدم ثبت |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                                  | مسئول           |
| ----- | ----------------- | -------------------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل, وابستگی به PRM-220, EDT-002 | خودکار          |
| QG-02 | Review → Approved | انطباق با EDT-002                      | Prompt Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3)              | Registry Keeper |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                                  |
| ------- | ------------------- | ------ | ------------------------------------- |
| PRM-220 | DEP-01 (Requires)   | ^1.0.0 | گزارش معنایی برای هم‌راستاسازی با قصد |
| PRM-402 | DEP-03 (References) | ^1.0.0 | بافت تاکسونومی برای تطابق قصد         |
| EDT-002 | DEP-05 (Provides)   | ^1.0.0 | طبقه‌بندی قصد جستجو                   |

---

## 14. Human Override

| سناریو                          | اقدام                                 |
| ------------------------------- | ------------------------------------- |
| alignment_score < ۶۰            | بازگشت به AI-005 برای بهینه‌سازی مجدد |
| تعارض بین target_intent و CT-ID | Escalation به Content Strategist      |

---

## 15. Governance Notes

| ID     | یادداشت                                            |
| ------ | -------------------------------------------------- |
| GOV-01 | A-3 (Strategic) — نیازمند ADR + تأیید مدیر         |
| GOV-02 | تغییر در طبقه‌بندی قصد نیازمند به‌روزرسانی EDT-002 |
| GOV-03 | coverage_gaps باید در Issue Tracker ثبت شود        |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-221",
  "name": "Search Intent Alignment",
  "family": "FAM-CON",
  "subfamily": "CON-SEO",
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
    { "type": "CTX-04", "source": "PRM-220", "required": true },
    { "type": "CTX-02", "source": "PRM-402", "required": true },
    { "type": "CTX-02", "source": "EDT-002", "required": true }
  ],
  "max_tokens": 3000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "semantic_report", "type": "VAR-06", "required": true },
    {
      "id": "target_intent",
      "type": "VAR-04",
      "required": true,
      "members": ["informational", "navigational", "transactional", "educational"]
    }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["semantic_report", "target_intent"],
    "optional": []
  },
  "output": {
    "required": ["intent_report", "intent_classification", "alignment_score"],
    "optional": ["coverage_gaps"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "One dominant intent assigned", "severity": "warning" },
    { "id": "VAL-02", "description": "Intent matches CT-ID", "severity": "warning" },
    { "id": "VAL-03", "description": "Semantic fidelity ≥ 90%", "severity": "error" },
    { "id": "VAL-04", "description": "Brand voice preserved", "severity": "error" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-005"],
  "dependencies": ["PRM-220", "PRM-402", "EDT-002"],
  "documentation_refs": ["EDT-002", "BRD-002"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                                   | توسط        |
| ----------- | ---------- | --------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — هم‌راستاسازی با قصد جستجو | معمار سیستم |
