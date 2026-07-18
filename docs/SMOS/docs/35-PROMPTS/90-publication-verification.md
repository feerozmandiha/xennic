# Publication Verification — تأیید انتشار

> **شناسه:** PRM-307
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Operations Lead
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-306](./88-publication-execution-chain.md), [PLAT-\*](../20-PLATFORMS/)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                    |
| ------------------ | ------------------------ |
| **id**             | PRM-307                  |
| **name_fa**        | تأیید انتشار             |
| **name_en**        | Publication Verification |
| **family**         | FAM-OPS                  |
| **subfamily**      | OPS-PUB                  |
| **type**           | PT-06                    |
| **complexity**     | C-2                      |
| **authority**      | A-2                      |
| **owner**          | Operations Lead          |
| **version**        | 1.0.0-draft              |
| **status**         | draft                    |
| **security_level** | SL-01                    |

---

## 2. Purpose

PRM-307 تأیید موفقیت انتشار در هر پلتفرم هدف را انجام می‌دهد. این پرامپت با بررسی قابلیت مشاهده، یکپارچگی محتوا، فراداده و دسترس‌پذیری محتوای منتشرشده، صحت انتشار را تضمین می‌کند.

### اصول تأیید انتشار

| ID    | اصل                                                 |
| ----- | --------------------------------------------------- |
| PV-01 | هر انتشار باید در پلتفرم هدف قابل تأیید باشد        |
| PV-02 | یکپارچگی محتوا بین بسته ارسالی و منتشرشده بررسی شود |
| PV-03 | فراداده انتشار باید صحیح و کامل باشد                |
| PV-04 | تأیید باید ظرف بازه زمانی تعیین‌شده انجام شود       |

---

## 3. Scope

### Inside Scope

| حوزه           | توضیح                                  |
| -------------- | -------------------------------------- |
| تأیید مشاهده   | بررسی قابل مشاهده بودن محتوا در پلتفرم |
| یکپارچگی محتوا | تطبیق محتوای منتشرشده با بسته اصلی     |
| فراداده انتشار | تأیید صحت فراداده نمایش‌داده‌شده       |
| گزارش تأیید    | تولید گزارش جامع تأیید انتشار          |

### Outside Scope

| حوزه           | دلیل         |
| -------------- | ------------ |
| اجرای انتشار   | حوزه PRM-306 |
| انطباق پلتفرمی | حوزه PRM-305 |
| تکمیل توزیع    | حوزه PRM-308 |

---

## 4. Consumers

| مصرف‌کننده          | نقش                            | نوع مصرف |
| ------------------- | ------------------------------ | -------- |
| AI-008 (Publishing) | تأیید انتشار                   | Chain    |
| AI-010 (Analytics)  | مصرف داده‌های تأیید برای تحلیل | System   |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-306 Output",
        "scope": ["execution-log", "platform-results"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PLAT-*",
        "scope": ["verification-methods", "visibility-checks"],
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

| منبع    | دامنه                | کاربرد           |
| ------- | -------------------- | ---------------- |
| PLAT-\* | روش‌های تأیید انتشار | بررسی صحت انتشار |

---

## 7. Variables

| متغیر                          | نوع    | اجباری | توضیح                         | اعتبارسنجی          |
| ------------------------------ | ------ | ------ | ----------------------------- | ------------------- |
| `execution_log`                | VAR-06 | بله    | لاگ اجرا از PRM-306           | —                   |
| `verification_timeout_minutes` | VAR-04 | خیر    | حداکثر زمان انتظار برای تأیید | default: 30, min: 5 |

---

## 8. Constraints

| ID     | محدودیت                                            |
| ------ | -------------------------------------------------- |
| CST-01 | تأیید باید ظرف ۳۰ دقیقه پس از ارسال انجام شود      |
| CST-02 | یکپارچگی محتوا ≥ ۹۵٪ تطابق لازم دارد               |
| CST-03 | فراداده باید با بسته ارسالی مطابقت کامل داشته باشد |

---

## 9. Input Contract

| ورودی                          | نوع    | منبع    | اجباری |
| ------------------------------ | ------ | ------- | ------ |
| `execution_log`                | array  | PRM-306 | بله    |
| `verification_timeout_minutes` | number | AI-008  | خیر    |

---

## 10. Output Contract

| خروجی                     | نوع    | توضیح                           |
| ------------------------- | ------ | ------------------------------- |
| `verification_report`     | object | گزارش تأیید به ازای پلتفرم      |
| `visibility_status`       | object | وضعیت مشاهده‌پذیری محتوا        |
| `content_integrity_score` | number | امتیاز یکپارچگی محتوا (۰–۱۰۰)   |
| `metadata_accuracy`       | number | درصد صحت فراداده نمایش‌داده‌شده |
| `verification_summary`    | string | خلاصه وضعیت تأیید               |
| `failed_platforms`        | array  | پلتفرم‌های تأییدنشده            |

---

## 11. Validation Rules

| ID     | قاعده                                | سطح    | نقض     |
| ------ | ------------------------------------ | ------ | ------- |
| VAL-01 | content_integrity ≥ ۹۵٪              | معماری | عدم ثبت |
| VAL-02 | metadata_accuracy = ۱۰۰٪             | معماری | عدم ثبت |
| VAL-03 | تأیید در بازه زمانی انجام شده        | معماری | هشدار   |
| VAL-04 | visibility_status برای همه پلتفرم‌ها | معماری | هشدار   |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                  | مسئول               |
| ----- | ----------------- | ---------------------- | ------------------- |
| QG-01 | Draft → Review    | هویت کامل, input معتبر | خودکار              |
| QG-02 | Review → Approved | متدولوژی تأیید مشخص    | Operations Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001         | Registry Keeper     |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                       |
| ------- | ------------------- | ------ | -------------------------- |
| PRM-306 | DEP-01 (Requires)   | ^1.0.0 | لاگ اجرا برای تأیید انتشار |
| PLAT-\* | DEP-03 (References) | ^1.0.0 | روش‌های تأیید پلتفرم       |

---

## 14. Human Override

| سناریو                     | اقدام                                         |
| -------------------------- | --------------------------------------------- |
| failed_platforms غیرمنتظره | Escalation به Operations Lead برای بررسی دستی |
| verification_timeout       | ثبت خطا + Escalation به Operations Lead       |

---

## 15. Governance Notes

| ID     | یادداشت                                                |
| ------ | ------------------------------------------------------ |
| GOV-01 | A-2 (Tactical) — نیازمند تأیید سرپرست عملیات           |
| GOV-02 | داده‌های تأیید برای AI-010 برای تحلیل عملکرد قابل مصرف |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-307",
  "name": "Publication Verification",
  "family": "FAM-OPS",
  "subfamily": "OPS-PUB",
  "type": "PT-06",
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
    { "type": "CTX-04", "source": "PRM-306", "required": true },
    { "type": "CTX-02", "source": "PLAT-*", "required": true }
  ],
  "max_tokens": 3000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "execution_log", "type": "VAR-06", "required": true },
    { "id": "verification_timeout_minutes", "type": "VAR-04", "required": false, "default": 30 }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["execution_log"],
    "optional": ["verification_timeout_minutes"]
  },
  "output": {
    "required": [
      "verification_report",
      "visibility_status",
      "content_integrity_score",
      "verification_summary"
    ],
    "optional": ["metadata_accuracy", "failed_platforms"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    { "id": "VAL-01", "description": "Content integrity >= 95%", "severity": "error" },
    { "id": "VAL-02", "description": "Metadata accuracy = 100%", "severity": "error" },
    { "id": "VAL-03", "description": "Verification within time window", "severity": "warning" },
    { "id": "VAL-04", "description": "Visibility status for all platforms", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-01",
  "consumers": ["AI-008", "AI-010"],
  "dependencies": ["PRM-306"],
  "documentation_refs": ["PLAT-*"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                      | توسط        |
| ----------- | ---------- | -------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — تأیید انتشار | معمار سیستم |
