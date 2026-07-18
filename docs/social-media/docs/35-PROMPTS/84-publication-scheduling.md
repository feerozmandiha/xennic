# Publication Scheduling — زمان‌بندی انتشار

> **شناسه:** PRM-304
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Operations Lead
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-303](./82-platform-selection-strategy.md), [PRM-402](./42-content-taxonomy-context.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                  |
| ------------------ | ---------------------- |
| **id**             | PRM-304                |
| **name_fa**        | زمان‌بندی انتشار       |
| **name_en**        | Publication Scheduling |
| **family**         | FAM-OPS                |
| **subfamily**      | OPS-PUB                |
| **type**           | PT-04                  |
| **complexity**     | C-2                    |
| **authority**      | A-2                    |
| **owner**          | Operations Lead        |
| **version**        | 1.0.0-draft            |
| **status**         | draft                  |
| **security_level** | SL-01                  |

---

## 2. Purpose

PRM-304 زمان‌بندی انتشار بسته محتوا را در پلتفرم‌های انتخاب‌شده تعریف می‌کند. این پرامپت با در نظر گرفتن تقویم تحریریه، بهترین زمان انتشار، توالی پلتفرم‌ها و محدودیت‌های زمانی، برنامه زمان‌بندی بهینه را تولید می‌کند.

### اصول زمان‌بندی

| ID     | اصل                                                  |
| ------ | ---------------------------------------------------- |
| SCH-01 | زمان انتشار متناسب با مخاطب هر پلتفرم انتخاب شود     |
| SCH-02 | توالی انتشار باید از Hub (P0) به بقیه پلتفرم‌ها باشد |
| SCH-03 | فاصله انتشار بین پلتفرم‌ها باید محاسبه شود           |
| SCH-04 | تقویم تحریریه مرجع اصلی زمان‌بندی است                |

---

## 3. Scope

### Inside Scope

| حوزه        | توضیح                                   |
| ----------- | --------------------------------------- |
| تحلیل زمان  | تعیین بهترین زمان انتشار به ازای پلتفرم |
| توالی‌بندی  | ترتیب انتشار در پلتفرم‌ها               |
| فاصله‌گذاری | تعیین فاصله زمانی بین انتشارهای متوالی  |
| تقویم‌محوری | تطبیق با تقویم تحریریه                  |

### Outside Scope

| حوزه          | دلیل         |
| ------------- | ------------ |
| مونتاژ بسته   | حوزه PRM-302 |
| انتخاب پلتفرم | حوزه PRM-303 |
| اجرای انتشار  | حوزه PRM-306 |

---

## 4. Consumers

| مصرف‌کننده          | نقش              | نوع مصرف |
| ------------------- | ---------------- | -------- |
| AI-008 (Publishing) | زمان‌بندی انتشار | Chain    |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-303 Output",
        "scope": ["selected-platforms", "platform-priorities"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PRM-402",
        "scope": ["scheduling-attributes", "time-sensitivity"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-01",
        "source": "editorial-calendar",
        "scope": ["published-dates", "calendar-constraints"],
        "injection": "append",
        "required": false
      }
    ],
    "max_tokens": 3000,
    "priority": "high"
  }
}
```

---

## 6. Required Knowledge

| منبع    | دامنه                | کاربرد             |
| ------- | -------------------- | ------------------ |
| PLAT-\* | الگوهای زمانی پلتفرم | بهترین زمان انتشار |

---

## 7. Variables

| متغیر                | نوع    | اجباری | توضیح                            | اعتبارسنجی   |
| -------------------- | ------ | ------ | -------------------------------- | ------------ |
| `selected_platforms` | VAR-07 | بله    | پلتفرم‌های انتخاب‌شده از PRM-303 | —            |
| `editorial_calendar` | VAR-05 | خیر    | تقویم تحریریه موجود              | —            |
| `time_zone`          | VAR-01 | بله    | منطقه زمانی مخاطب هدف            | format: IANA |

---

## 8. Constraints

| ID     | محدودیت                                          |
| ------ | ------------------------------------------------ |
| CST-01 | توالی انتشار: Hub → Primary → Secondary → Backup |
| CST-02 | حداقل فاصله بین انتشارها: ۱۵ دقیقه               |
| CST-03 | انتشار در پنجره زمانی تنظیم‌شده پلتفرم           |

---

## 9. Input Contract

| ورودی                | نوع    | منبع    | اجباری |
| -------------------- | ------ | ------- | ------ |
| `selected_platforms` | array  | PRM-303 | بله    |
| `editorial_calendar` | object | AI-008  | خیر    |
| `time_zone`          | string | AI-008  | بله    |

---

## 10. Output Contract

| خروجی                     | نوع    | توضیح                                  |
| ------------------------- | ------ | -------------------------------------- |
| `publication_schedule`    | array  | برنامه زمان‌بندی انتشار به ازای پلتفرم |
| `platform_sequence`       | array  | توالی انتشار پلتفرم‌ها                 |
| `time_slot_analysis`      | object | تحلیل بهترین زمان انتشار               |
| `calendar_conflict_check` | object | بررسی تداخل با تقویم تحریریه           |
| `schedule_confidence`     | number | امتیاز اطمینان زمان‌بندی (۰–۱۰۰)       |

---

## 11. Validation Rules

| ID     | قاعده                            | سطح    | نقض     |
| ------ | -------------------------------- | ------ | ------- |
| VAL-01 | توالی انتشار رعایت شده           | معماری | عدم ثبت |
| VAL-02 | فاصله انتشار ≥ ۱۵ دقیقه          | معماری | عدم ثبت |
| VAL-03 | زمان انتشار در پنجره مجاز پلتفرم | معماری | هشدار   |
| VAL-04 | تداخل با تقویم وجود ندارد        | معماری | هشدار   |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                  | مسئول               |
| ----- | ----------------- | ---------------------- | ------------------- |
| QG-01 | Draft → Review    | هویت کامل, input معتبر | خودکار              |
| QG-02 | Review → Approved | سازگاری با تقویم       | Operations Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001         | Registry Keeper     |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                                 |
| ------- | ------------------- | ------ | ------------------------------------ |
| PRM-303 | DEP-01 (Requires)   | ^1.0.0 | پلتفرم‌های انتخاب شده برای زمان‌بندی |
| PRM-402 | DEP-03 (References) | ^1.0.0 | بافت تاکسونومی برای ویژگی‌های زمانی  |

---

## 14. Human Override

| سناریو                   | اقدام                                                |
| ------------------------ | ---------------------------------------------------- |
| schedule_confidence < ۶۰ | Escalation به Operations Lead برای بازبینی زمان‌بندی |
| تداخل با تقویم           | اولویت با تقویم تحریریه موجود                        |

---

## 15. Governance Notes

| ID     | یادداشت                                          |
| ------ | ------------------------------------------------ |
| GOV-01 | A-2 (Tactical) — نیازمند تأیید سرپرست عملیات     |
| GOV-02 | تغییر زمان‌بندی نیازمند هماهنگی با تقویم تحریریه |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-304",
  "name": "Publication Scheduling",
  "family": "FAM-OPS",
  "subfamily": "OPS-PUB",
  "type": "PT-04",
  "complexity": "C-2",
  "authority": "A-2",
  "version": "1.0.0-draft",
  "status": "draft"
}
```

### Block 2 — Context

```json
{
  "sources": [
    { "type": "CTX-04", "source": "PRM-303", "required": true },
    { "type": "CTX-02", "source": "PRM-402", "required": true },
    { "type": "CTX-01", "source": "editorial-calendar", "required": false }
  ],
  "max_tokens": 3000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "selected_platforms", "type": "VAR-07", "required": true },
    { "id": "editorial_calendar", "type": "VAR-05", "required": false },
    { "id": "time_zone", "type": "VAR-01", "required": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["selected_platforms", "time_zone"],
    "optional": ["editorial_calendar"]
  },
  "output": {
    "required": ["publication_schedule", "platform_sequence", "schedule_confidence"],
    "optional": ["time_slot_analysis", "calendar_conflict_check"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    {
      "id": "VAL-01",
      "description": "Sequence follows Hub → Primary → Secondary → Backup",
      "severity": "error"
    },
    {
      "id": "VAL-02",
      "description": "Interval between publications >= 15 minutes",
      "severity": "error"
    },
    {
      "id": "VAL-03",
      "description": "Publication within platform time window",
      "severity": "warning"
    },
    { "id": "VAL-04", "description": "No conflict with editorial calendar", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-01",
  "consumers": ["AI-008"],
  "dependencies": ["PRM-303"],
  "documentation_refs": ["PRM-402"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                          | توسط        |
| ----------- | ---------- | ------------------------------ | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — زمان‌بندی انتشار | معمار سیستم |
