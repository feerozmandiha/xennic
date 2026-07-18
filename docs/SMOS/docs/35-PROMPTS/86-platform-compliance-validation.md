# Platform Compliance Validation — اعتبارسنجی انطباق پلتفرمی

> **شناسه:** PRM-305
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Operations Lead
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-304](./84-publication-scheduling.md), [PLAT-\*](../20-PLATFORMS/), [BRD-002](../22-BRAND/20-brand-voice.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                          |
| ------------------ | ------------------------------ |
| **id**             | PRM-305                        |
| **name_fa**        | اعتبارسنجی انطباق پلتفرمی      |
| **name_en**        | Platform Compliance Validation |
| **family**         | FAM-OPS                        |
| **subfamily**      | OPS-PUB                        |
| **type**           | PT-06                          |
| **complexity**     | C-2                            |
| **authority**      | A-3                            |
| **owner**          | Operations Lead                |
| **version**        | 1.0.0-draft                    |
| **status**         | draft                          |
| **security_level** | SL-02                          |

---

## 2. Purpose

PRM-305 انطباق بسته انتشار را با الزامات فنی، محتوایی و برندی هر پلتفرم هدف اعتبارسنجی می‌کند. این پرامپت تضمین می‌کند که محتوا قبل از انتشار با محدودیت‌ها و استانداردهای هر پلتفرم مطابقت دارد.

### اصول انطباق پلتفرمی

| ID    | اصل                                              |
| ----- | ------------------------------------------------ |
| PC-01 | هر پلتفرم الزامات فنی و محتوایی منحصربه‌فرد دارد |
| PC-02 | انطباق برند باید در همه پلتفرم‌ها یکسان باشد     |
| PC-03 | محدودیت‌های پلتفرم باید پیش از انتشار بررسی شود  |
| PC-04 | عدم انطباق بحرانی مانع انتشار می‌شود             |

---

## 3. Scope

### Inside Scope

| حوزه            | توضیح                               |
| --------------- | ----------------------------------- |
| الزامات فنی     | بررسی ابعاد، حجم، فرمت دارایی‌ها    |
| الزامات محتوایی | بررسی محدودیت‌های متنی و رسانه‌ای   |
| انطباق برند     | تطبیق با BRD-002 و BRD-001          |
| امتیاز انطباق   | محاسبه امتیاز انطباق به ازای پلتفرم |

### Outside Scope

| حوزه                | دلیل         |
| ------------------- | ------------ |
| کیفیت محتوا         | حوزه PRM-202 |
| دسترس‌پذیری رسانه   | حوزه PRM-233 |
| آمادگی انتشار ویدئو | حوزه PRM-244 |

---

## 4. Consumers

| مصرف‌کننده          | نقش                             | نوع مصرف   |
| ------------------- | ------------------------------- | ---------- |
| AI-008 (Publishing) | اعتبارسنجی انطباق پیش از انتشار | Chain      |
| AI-004 (Review)     | تأیید انطباق برند               | Validation |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-304 Output",
        "scope": ["publication-schedule", "platform-sequence"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PLAT-*",
        "scope": ["technical-requirements", "content-limits", "format-specs"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "BRD-002",
        "scope": ["voice-rules", "brand-constraints"],
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

| منبع    | دامنه                        | کاربرد       |
| ------- | ---------------------------- | ------------ |
| PLAT-\* | الزامات فنی و محتوایی پلتفرم | بررسی انطباق |
| BRD-002 | قواعد صدای برند              | انطباق برند  |

---

## 7. Variables

| متغیر                  | نوع    | اجباری | توضیح                       | اعتبارسنجی    |
| ---------------------- | ------ | ------ | --------------------------- | ------------- |
| `publication_schedule` | VAR-06 | بله    | برنامه زمان‌بندی از PRM-304 | —             |
| `strict_brand_check`   | VAR-03 | خیر    | بررسی دقیق برند             | default: true |
| `fail_on_critical`     | VAR-03 | خیر    | توقف در صورت نقض بحرانی     | default: true |

---

## 8. Constraints

| ID     | محدودیت                                                        |
| ------ | -------------------------------------------------------------- |
| CST-01 | هرگونه نقض بحرانی مانع انتشار در پلتفرم مربوطه                 |
| CST-02 | انطباق برند A-3 حداقل برای پلتفرم‌های Primary                  |
| CST-03 | دارایی‌های رسانه باید با مشخصات فنی پلتفرم همخوانی داشته باشند |

---

## 9. Input Contract

| ورودی                  | نوع     | منبع    | اجباری |
| ---------------------- | ------- | ------- | ------ |
| `publication_schedule` | object  | PRM-304 | بله    |
| `strict_brand_check`   | boolean | AI-008  | خیر    |
| `fail_on_critical`     | boolean | AI-008  | خیر    |

---

## 10. Output Contract

| خروجی                    | نوع    | توضیح                       |
| ------------------------ | ------ | --------------------------- |
| `compliance_report`      | object | گزارش انطباق به ازای پلتفرم |
| `compliance_score`       | number | امتیاز کلی انطباق (۰–۱۰۰)   |
| `critical_violations`    | array  | نقض‌های بحرانی (blocker)    |
| `warning_violations`     | array  | نقض‌های غیربحرانی           |
| `brand_alignment_status` | object | وضعیت انطباق برند           |
| `release_blockers`       | array  | موانع انتشار شناسایی‌شده    |

---

## 11. Validation Rules

| ID     | قاعده                           | سطح    | نقض     |
| ------ | ------------------------------- | ------ | ------- |
| VAL-01 | assets تابع مشخصات فنی پلتفرم   | معماری | blcoker |
| VAL-02 | متن محتوا در محدودیت طول پلتفرم | معماری | blcoker |
| VAL-03 | brand_voice مطابق BRD-002       | برند   | warning |
| VAL-04 | compliance_score < ۷۰           | معماری | warning |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                       | مسئول               |
| ----- | ----------------- | --------------------------- | ------------------- |
| QG-01 | Draft → Review    | هویت کامل, input معتبر      | خودکار              |
| QG-02 | Review → Approved | انطباق با PLAT-\* و BRD-002 | Compliance Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3)   | Registry Keeper     |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                               |
| ------- | ------------------- | ------ | ---------------------------------- |
| PRM-304 | DEP-01 (Requires)   | ^1.0.0 | برنامه زمان‌بندی برای بررسی انطباق |
| PLAT-\* | DEP-03 (References) | ^1.0.0 | الزامات فنی و محتوایی پلتفرم       |
| BRD-002 | DEP-03 (References) | ^1.0.0 | قواعد صدای برند                    |

---

## 14. Human Override

| سناریو                        | اقدام                                         |
| ----------------------------- | --------------------------------------------- |
| critical_violations غیرمنتظره | Escalation به Operations Lead برای بررسی دستی |
| brand_alignment_status ناموفق | Escalation به Brand Manager برای تأیید دستی   |

---

## 15. Governance Notes

| ID     | یادداشت                                          |
| ------ | ------------------------------------------------ |
| GOV-01 | A-3 (Strategic) — نقض بحرانی نیازمند ADR         |
| GOV-02 | تغییر الزامات پلتفرم نیازمند به‌روزرسانی PLAT-\* |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-305",
  "name": "Platform Compliance Validation",
  "family": "FAM-OPS",
  "subfamily": "OPS-PUB",
  "type": "PT-06",
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
    { "type": "CTX-04", "source": "PRM-304", "required": true },
    { "type": "CTX-02", "source": "PLAT-*", "required": true },
    { "type": "CTX-02", "source": "BRD-002", "required": false }
  ],
  "max_tokens": 4000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "publication_schedule", "type": "VAR-06", "required": true },
    { "id": "strict_brand_check", "type": "VAR-03", "required": false, "default": true },
    { "id": "fail_on_critical", "type": "VAR-03", "required": false, "default": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["publication_schedule"],
    "optional": ["strict_brand_check", "fail_on_critical"]
  },
  "output": {
    "required": [
      "compliance_report",
      "compliance_score",
      "critical_violations",
      "release_blockers"
    ],
    "optional": ["warning_violations", "brand_alignment_status"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    {
      "id": "VAL-01",
      "description": "Assets conform to platform technical specs",
      "severity": "blocker"
    },
    {
      "id": "VAL-02",
      "description": "Content within platform length limits",
      "severity": "blocker"
    },
    { "id": "VAL-03", "description": "Brand voice matches BRD-002", "severity": "warning" },
    { "id": "VAL-04", "description": "Compliance score >= 70", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-008", "AI-004"],
  "dependencies": ["PRM-304"],
  "documentation_refs": ["PLAT-*", "BRD-002"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                                   | توسط        |
| ----------- | ---------- | --------------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — اعتبارسنجی انطباق پلتفرمی | معمار سیستم |
