# Review Preparation — آماده‌سازی بازبینی

> **شناسه:** PRM-210
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Content Producer
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-001](../60-PROMPTS/10-prompt-index.md), [PRM-202](./22-content-review-validation.md), [PRM-401](./40-brand-voice-context.md), [PRM-402](./42-content-taxonomy-context.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار              |
| ------------------ | ------------------ |
| **id**             | PRM-210            |
| **name_fa**        | آماده‌سازی بازبینی |
| **name_en**        | Review Preparation |
| **family**         | FAM-CON            |
| **subfamily**      | CON-RVW            |
| **type**           | PT-04              |
| **complexity**     | C-1                |
| **authority**      | A-2                |
| **owner**          | Content Producer   |
| **version**        | 1.0.0-draft        |
| **status**         | draft              |
| **security_level** | SL-02              |

---

## 2. Purpose

PRM-210 بافت بازبینی را پیش از ارزیابی محتوا آماده می‌کند. این پرامپت اطلاعات زمینه‌ای مورد نیاز برای بازبینی مؤثر را گردآوری، ساختاردهی و اولویت‌بندی می‌کند تا Agent بازبینی با زمینه کامل شروع به کار کند.

### اصول آماده‌سازی

| ID    | اصل                                                                          |
| ----- | ---------------------------------------------------------------------------- |
| RP-01 | بازبینی بدون زمینه کامل ممنوع — همه منابع بافت باید پیش از شروع گردآوری شوند |
| RP-02 | اولویت‌بندی معیارها بر اساس نوع محتوا (CT-ID) و سطح اختیار                   |
| RP-03 | بافت آماده‌شده باید ساختاریافته و قابل پردازش توسط Agentهای پایین‌دست باشد   |
| RP-04 | خطا در گردآوری بافت باید گزارش شود — بازبینی با بافت ناقص مجاز نیست          |

---

## 3. Scope

### Inside Scope

| حوزه                      | توضیح                                                    |
| ------------------------- | -------------------------------------------------------- |
| گردآوری بافت بازبینی      | جمع‌آوری همه منابع CTX-02, CTX-04, CTX-06                |
| اولویت‌بندی معیارها       | تعیین ترتیب بررسی بر اساس CT-ID و authority level        |
| ساختاردهی زمینه           | تبدیل بافت خام به ساختار قابل مصرف توسط Agentهای بازبینی |
| اعتبارسنجی کامل بودن بافت | اطمینان از حضور همه منابع required                       |

### Outside Scope

| حوزه                | دلیل                    |
| ------------------- | ----------------------- |
| اجرای بازبینی       | حوزه PRM-211 تا PRM-214 |
| اعتبارسنجی ساختار   | حوزه PRM-211            |
| اعتبارسنجی اصطلاحات | حوزه PRM-212            |
| اعتبارسنجی سازگاری  | حوزه PRM-213            |
| تعیین آمادگی انتشار | حوزه PRM-214            |

---

## 4. Consumers

| مصرف‌کننده              | نقش                                     | نوع مصرف |
| ----------------------- | --------------------------------------- | -------- |
| AI-004 (Content Review) | آماده‌سازی زمینه بازبینی پیش از ارزیابی | Chain    |

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
        "type": "CTX-02",
        "source": "PRM-401",
        "scope": ["brand-voice-dimensions", "tone-mode"],
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
        "type": "CTX-06",
        "source": "ARCH-032",
        "scope": ["authority-level", "review-requirements"],
        "injection": "append",
        "required": false
      }
    ],
    "max_tokens": 2000,
    "priority": "high"
  }
}
```

---

## 6. Required Knowledge

| منبع    | دامنه     | کاربرد                                        |
| ------- | --------- | --------------------------------------------- |
| BRD-002 | صدای برند | معیارهای انطباق برای آماده‌سازی زمینه بازبینی |
| EDT-001 | ECOS      | چرخه حیات و مرحله بازبینی                     |
| EDT-002 | تاکسونومی | اولویت‌بندی معیارها بر اساس CT-ID             |

---

## 7. Variables

| متغیر                | نوع    | اجباری | توضیح                         | اعتبارسنجی                                       |
| -------------------- | ------ | ------ | ----------------------------- | ------------------------------------------------ |
| `structured_content` | VAR-06 | بله    | محتوای ساختاریافته از PRM-203 | —                                                |
| `ct_id`              | VAR-04 | بله    | نوع محتوای هدف                | members: [CT-001..CT-042]                        |
| `authority_level`    | VAR-04 | خیر    | سطح اختیار محتوا              | members: [A-0, A-1, A-2, A-3, A-4], default: A-2 |

---

## 8. Constraints

| ID     | محدودیت                                                |
| ------ | ------------------------------------------------------ |
| CST-01 | همه منابع required باید در زمان آماده‌سازی موجود باشند |
| CST-02 | بافت آماده‌شده حداکثر ۲۰۰۰ توکن                        |
| CST-03 | اولویت‌بندی معیارها باید با CT-ID همخوانی داشته باشد   |
| CST-04 | خطا در هر منبع باید جداگانه گزارش شود                  |

---

## 9. Input Contract

| ورودی                | نوع    | منبع    | اجباری |
| -------------------- | ------ | ------- | ------ |
| `structured_content` | object | PRM-203 | بله    |
| `ct_id`              | enum   | AI-014  | بله    |
| `authority_level`    | enum   | AI-014  | خیر    |

---

## 10. Output Contract

| خروجی               | نوع     | توضیح                                       |
| ------------------- | ------- | ------------------------------------------- |
| `review_context`    | object  | بافت ساختاریافته بازبینی شامل همه منابع     |
| `criteria_priority` | array   | ترتیب اولویت معیارهای بازبینی               |
| `missing_sources`   | array   | فهرست منابع بافت در دسترس نبوده             |
| `readiness_flag`    | boolean | نشان‌دهنده کامل بودن بافت برای شروع بازبینی |

---

## 11. Validation Rules

| ID     | قاعده                                               | سطح    | نقض     |
| ------ | --------------------------------------------------- | ------ | ------- |
| VAL-01 | همه منابع required موجود باشند                      | معماری | عدم ثبت |
| VAL-02 | اولویت‌بندی معیارها با CT-ID همخوانی دارد           | معماری | هشدار   |
| VAL-03 | بافت ≤ ۲۰۰۰ توکن                                    | معماری | هشدار   |
| VAL-04 | readiness_flag تنها در صورت کامل بودن بافت true است | معماری | عدم ثبت |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                      | مسئول           |
| ----- | ----------------- | -------------------------- | --------------- |
| QG-01 | Draft → Review    | هویت کامل، context معتبر   | خودکار          |
| QG-02 | Review → Approved | انطباق با PRM-000, EDT-002 | Prompt Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001             | Registry Keeper |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                                                     |
| ------- | ------------------- | ------ | -------------------------------------------------------- |
| PRM-202 | DEP-05 (Provides)   | ^1.0.0 | بافت آماده‌شده برای بازبینی به PRM-202 تحویل داده می‌شود |
| PRM-401 | DEP-01 (Requires)   | ^1.0.0 | بافت صدای برند برای آماده‌سازی معیارها                   |
| PRM-402 | DEP-03 (References) | ^1.0.0 | بافت تاکسونومی برای اولویت‌بندی معیارها                  |

---

## 14. Human Override

| سناریو                    | اقدام                                              |
| ------------------------- | -------------------------------------------------- |
| منبع CTX-06 در دسترس نیست | ادامه با authority_level=A-2 پیش‌فرض — اطلاع‌رسانی |
| هیچ منبعی موجود نیست      | Escalation به Human Editor — بازبینی غیرممکن       |

---

## 15. Governance Notes

| ID     | یادداشت                                            |
| ------ | -------------------------------------------------- |
| GOV-01 | A-2 (Operational) — نیازمند تأیید ناظر             |
| GOV-02 | تغییر در منابع required نیازمند Major Version Bump |
| GOV-03 | readiness_flag=false باید بازبینی را متوقف کند     |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-210",
  "name": "Review Preparation",
  "family": "FAM-CON",
  "subfamily": "CON-RVW",
  "type": "PT-04",
  "complexity": "C-1",
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
    { "type": "CTX-02", "source": "PRM-401", "required": true },
    { "type": "CTX-02", "source": "PRM-402", "required": true },
    { "type": "CTX-06", "source": "ARCH-032", "required": false }
  ],
  "max_tokens": 2000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "structured_content", "type": "VAR-06", "required": true },
    {
      "id": "ct_id",
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
      "id": "authority_level",
      "type": "VAR-04",
      "required": false,
      "members": ["A-0", "A-1", "A-2", "A-3", "A-4"],
      "default": "A-2"
    }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["structured_content", "ct_id"],
    "optional": ["authority_level"]
  },
  "output": {
    "required": ["review_context", "criteria_priority", "readiness_flag"],
    "optional": ["missing_sources"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "All required sources present", "severity": "error" },
    { "id": "VAL-02", "description": "Criteria priority matches CT-ID", "severity": "warning" },
    { "id": "VAL-03", "description": "Context ≤ 2000 tokens", "severity": "warning" },
    {
      "id": "VAL-04",
      "description": "readiness_flag=true only when context complete",
      "severity": "error"
    }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-004"],
  "dependencies": ["PRM-202", "PRM-401", "PRM-402"],
  "documentation_refs": ["BRD-002", "EDT-001", "EDT-002"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                            | توسط        |
| ----------- | ---------- | -------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — آماده‌سازی بازبینی | معمار سیستم |
