# Metadata Generation Instruction — دستورالعمل تولید فراداده

> **شناسه:** PRM-204
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Knowledge Architect
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-203](../35-PROMPTS/24-content-structuring-instruction.md), [PRM-402](../35-PROMPTS/42-content-taxonomy-context.md), [EDT-002](../24-EDITORIAL/20-content-taxonomy.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                           |
| ------------------ | ------------------------------- |
| **id**             | PRM-204                         |
| **name_fa**        | دستورالعمل تولید فراداده        |
| **name_en**        | Metadata Generation Instruction |
| **family**         | FAM-CON                         |
| **subfamily**      | CON-PRD                         |
| **type**           | PT-04                           |
| **complexity**     | C-2                             |
| **authority**      | A-3                             |
| **owner**          | Knowledge Architect             |
| **version**        | 1.0.0-draft                     |
| **status**         | draft                           |
| **security_level** | SL-02                           |

---

## 2. Purpose

PRM-204 تولید فراداده (metadata) متعارف برای دارایی‌های محتوایی SMOS را تعریف می‌کند. فراداده شامل عنوان، خلاصه، توضیحات، کلمات کلیدی، شناسه‌های متعارف، ارجاعات تاکسونومی و ارجاعات گراف دانش است.

### اصول فراداده

| ID    | اصل                                                                |
| ----- | ------------------------------------------------------------------ |
| MD-01 | هر دارایی محتوایی باید دارای فراداده کامل و معتبر باشد             |
| MD-02 | فراداده باید قابل پردازش توسط ماشین (JSON) و انسان (Markdown) باشد |
| MD-03 | ارجاعات تاکسونومی باید از شناسه‌های CT-ID معتبر استفاده کنند       |
| MD-04 | کلمات کلیدی باید با واژگان رسمی ARCH-003 همخوانی داشته باشند       |
| MD-05 | فراداده باید قابل توسعه (extensible) باشد                          |

---

## 3. Scope

### Inside Scope

| حوزه                     | توضیح                           |
| ------------------------ | ------------------------------- |
| عنوان (Title)            | عنوان متعارف محتوا              |
| خلاصه (Summary)          | خلاصه محتوا حداکثر ۳۰۰ کاراکتر  |
| توضیحات (Description)    | توضیحات بلند محتوا              |
| کلمات کلیدی (Keywords)   | ۵–۱۵ کلمه کلیدی مرتبط           |
| شناسه محتوا (Content ID) | شناسه یکتای CONT-YYYY-MM-DD-NNN |
| ارجاعات CT-ID            | نوع محتوا از EDT-002            |
| ارجاعات گراف دانش        | روابط با موجودیت‌های دانشی      |
| فراداده فنی              | زبان، تاریخ ایجاد، مالک، نسخه   |

### Outside Scope

| حوزه            | دلیل         |
| --------------- | ------------ |
| محتوای اصلی     | حوزه PRM-201 |
| ساختار محتوا    | حوزه PRM-203 |
| داده‌های عملکرد | حوزه AI-010  |

---

## 4. Consumers

| مصرف‌کننده                    | نقش               | نوع مصرف    |
| ----------------------------- | ----------------- | ----------- |
| AI-005 (Search Optimization)  | تولید فراداده SEO | Instruction |
| AI-011 (Knowledge Management) | نمایه‌سازی دانش   | Instruction |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-203 Output",
        "scope": ["structured-document", "block-index", "heading-hierarchy"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PRM-402",
        "scope": ["ct-id-matrix", "content-attributes", "metadata-model"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "EDT-002",
        "scope": ["metadata-schema", "content-relationship-types"],
        "injection": "prepend",
        "required": true
      }
    ],
    "max_tokens": 2500,
    "priority": "high"
  }
}
```

---

## 6. Required Knowledge

| منبع     | دامنه       | کاربرد                         |
| -------- | ----------- | ------------------------------ |
| EDT-002  | تاکسونومی   | شناسه‌های CT-ID، ابعاد فراداده |
| EDT-001  | ECOS        | چرخه حیات و وضعیت‌ها           |
| ARCH-003 | واژگان رسمی | کلمات کلیدی مجاز               |
| ARCH-012 | مدل دانش    | ارجاعات گراف دانش              |

---

## 7. Variables

| متغیر                | نوع    | اجباری | توضیح                         | اعتبارسنجی                                                                       |
| -------------------- | ------ | ------ | ----------------------------- | -------------------------------------------------------------------------------- |
| `structured_content` | VAR-06 | بله    | محتوای ساختاریافته از PRM-203 | —                                                                                |
| `content_ct_id`      | VAR-04 | بله    | نوع محتوا از EDT-002          | members: [CT-001..CT-042]                                                        |
| `keyword_domain`     | VAR-04 | خیر    | دامنه تخصصی کلمات کلیدی       | members: [technology, business, marketing, design, industry], default: marketing |
| `language`           | VAR-04 | بله    | زبان محتوا                    | members: [fa, en]                                                                |

---

## 8. Constraints

| ID     | محدودیت                                                 |
| ------ | ------------------------------------------------------- |
| CST-01 | عنوان حداکثر ۱۲۰ کاراکتر                                |
| CST-02 | خلاصه حداکثر ۳۰۰ کاراکتر                                |
| CST-03 | کلمات کلیدی ۵–۱۵ عدد                                    |
| CST-04 | شناسه محتوا باید الگوی CONT-YYYY-MM-DD-NNN را رعایت کند |
| CST-05 | CT-ID باید در EDT-002 ثبت شده باشد                      |

---

## 9. Input Contract

| ورودی                | نوع    | منبع    | اجباری |
| -------------------- | ------ | ------- | ------ |
| `structured_content` | object | PRM-203 | بله    |
| `content_ct_id`      | enum   | AI-014  | بله    |
| `keyword_domain`     | enum   | AI-014  | خیر    |
| `language`           | enum   | AI-014  | بله    |

---

## 10. Output Contract

| خروجی                  | نوع    | توضیح                                      |
| ---------------------- | ------ | ------------------------------------------ |
| `content_metadata`     | object | فراداده کامل محتوا                         |
| `seo_metadata`         | object | فراداده SEO (title, description, keywords) |
| `taxonomy_references`  | array  | ارجاعات CT-ID و ابعاد طبقه‌بندی            |
| `knowledge_graph_refs` | array  | ارجاعات به موجودیت‌های گراف دانش           |
| `metadata_validator`   | object | نتیجه اعتبارسنجی فراداده تولیدشده          |

---

## 11. Validation Rules

| ID     | قاعده                     | سطح    | نقض     |
| ------ | ------------------------- | ------ | ------- |
| VAL-01 | عنوان ≤ ۱۲۰ کاراکتر       | معماری | هشدار   |
| VAL-02 | خلاصه ≤ ۳۰۰ کاراکتر       | معماری | هشدار   |
| VAL-03 | ۵ ≤ کلمات کلیدی ≤ ۱۵      | معماری | هشدار   |
| VAL-04 | شناسه محتوا معتبر         | معماری | عدم ثبت |
| VAL-05 | CT-ID معتبر               | معماری | عدم ثبت |
| VAL-06 | فراداده قابل پردازش ماشین | معماری | عدم ثبت |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                          | مسئول           |
| ----- | ----------------- | ------------------------------ | --------------- |
| QG-01 | Draft → Review    | هویت کامل، ورودی PRM-203 معتبر | خودکار          |
| QG-02 | Review → Approved | انطباق با EDT-002، ARCH-003    | Prompt Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001، ADR (A-3)      | Registry Keeper |

---

## 13. Dependencies

| شناسه    | نوع                 | نسخه   | دلیل                                |
| -------- | ------------------- | ------ | ----------------------------------- |
| PRM-203  | DEP-01 (Requires)   | ^1.0.0 | محتوای ساختاریافته ورودی اصلی       |
| PRM-402  | DEP-01 (Requires)   | ^1.0.0 | بافت تاکسونومی برای شناسه‌های CT-ID |
| EDT-002  | DEP-05 (Provides)   | ^1.0.0 | شمای فراداده و روابط                |
| ARCH-003 | DEP-03 (References) | ^1.0.0 | واژگان رسمی برای کلمات کلیدی        |

---

## 14. Human Override

| سناریو                                        | اقدام                             |
| --------------------------------------------- | --------------------------------- |
| عنوان پیشنهادی با استراتژی برند همخوانی ندارد | بازگشت به AI-001 برای تأیید       |
| CT-ID نامعتبر یا منسوخ                        | Escalation به Knowledge Architect |
| کلمات کلیدی خارج از دامنه مجاز                | تأیید انسانی                      |

---

## 15. Governance Notes

| ID     | یادداشت                                          |
| ------ | ------------------------------------------------ |
| GOV-01 | فراداده باید با GOV-005 (Metadata) سازگار باشد   |
| GOV-02 | تغییر در ساختار فراداده نیازمند ADR است          |
| GOV-03 | همه فراداده‌های تولیدشده باید قابل حسابرسی باشند |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-204",
  "name": "Metadata Generation Instruction",
  "family": "FAM-CON",
  "subfamily": "CON-PRD",
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
    { "type": "CTX-04", "source": "PRM-203", "required": true },
    { "type": "CTX-02", "source": "PRM-402", "required": true },
    { "type": "CTX-02", "source": "EDT-002", "required": true }
  ],
  "max_tokens": 2500,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "structured_content", "type": "VAR-06", "required": true },
    {
      "id": "content_ct_id",
      "type": "VAR-04",
      "required": true,
      "members": [
        "CT-001",
        "CT-002",
        "CT-003",
        "CT-004",
        "CT-005",
        "CT-006",
        "CT-007",
        "CT-008",
        "CT-009",
        "CT-010",
        "CT-011",
        "CT-012",
        "CT-013",
        "CT-014",
        "CT-015",
        "CT-016",
        "CT-017",
        "CT-018",
        "CT-019",
        "CT-020",
        "CT-021",
        "CT-022",
        "CT-023",
        "CT-024",
        "CT-025",
        "CT-026",
        "CT-027",
        "CT-028",
        "CT-029",
        "CT-030",
        "CT-031",
        "CT-032",
        "CT-033",
        "CT-034",
        "CT-035",
        "CT-036",
        "CT-037",
        "CT-038",
        "CT-039",
        "CT-040",
        "CT-041",
        "CT-042"
      ]
    },
    {
      "id": "keyword_domain",
      "type": "VAR-04",
      "required": false,
      "members": ["technology", "business", "marketing", "design", "industry"],
      "default": "marketing"
    },
    { "id": "language", "type": "VAR-04", "required": true, "members": ["fa", "en"] }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["structured_content", "content_ct_id", "language"],
    "optional": ["keyword_domain"]
  },
  "output": {
    "required": ["content_metadata", "seo_metadata", "taxonomy_references"],
    "optional": ["knowledge_graph_refs", "metadata_validator"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Title ≤ 120 characters", "severity": "warning" },
    { "id": "VAL-02", "description": "Summary ≤ 300 characters", "severity": "warning" },
    { "id": "VAL-03", "description": "Keywords 5-15", "severity": "warning" },
    { "id": "VAL-04", "description": "Valid content ID pattern", "severity": "error" },
    { "id": "VAL-05", "description": "Valid CT-ID", "severity": "error" },
    { "id": "VAL-06", "description": "Machine-readable metadata", "severity": "error" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-005", "AI-011"],
  "dependencies": ["PRM-203", "PRM-402", "EDT-002"],
  "documentation_refs": ["EDT-001", "EDT-002", "ARCH-003", "ARCH-012"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                                  | توسط        |
| ----------- | ---------- | -------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — دستورالعمل تولید فراداده | معمار سیستم |
