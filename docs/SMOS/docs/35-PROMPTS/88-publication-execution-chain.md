# Publication Execution Chain — زنجیره اجرای انتشار

> **شناسه:** PRM-306
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-28
> **مسئول:** Operations Lead
> **وابستگی:** [PRM-000](../60-PROMPTS/00-enterprise-prompt-architecture.md), [PRM-305](./86-platform-compliance-validation.md), [PRM-207](./31-platform-format-adaptation.md)
> **مخاطب:** ai-agent

---

## 1. Identity

| فیلد               | مقدار                       |
| ------------------ | --------------------------- |
| **id**             | PRM-306                     |
| **name_fa**        | زنجیره اجرای انتشار         |
| **name_en**        | Publication Execution Chain |
| **family**         | FAM-OPS                     |
| **subfamily**      | OPS-PUB                     |
| **type**           | PT-04                       |
| **complexity**     | C-3                         |
| **authority**      | A-3                         |
| **owner**          | Operations Lead             |
| **version**        | 1.0.0-draft                 |
| **status**         | draft                       |
| **security_level** | SL-02                       |

---

## 2. Purpose

PRM-306 زنجیره اجرای انتشار را در پلتفرم‌های هدف تعریف می‌کند. این پرامپت توالی عملیات انتشار، تطبیق قالب پلتفرمی، ارسال به پلتفرم و مدیریت خطا را در یک زنجیره منسجم هماهنگ می‌کند.

### اصول زنجیره اجرا

| ID    | اصل                                                 |
| ----- | --------------------------------------------------- |
| EC-01 | هر پلتفرم یک گام مجزا در زنجیره اجرا دارد           |
| EC-02 | زنجیره باید پس از هر گام وضعیت را ثبت کند           |
| EC-03 | خطا در یک پلتفرم مانع انتشار در سایر پلتفرم‌ها نشود |
| EC-04 | تطبیق قالب باید پیش از ارسال انجام شود              |

---

## 3. Scope

### Inside Scope

| حوزه        | توضیح                                    |
| ----------- | ---------------------------------------- |
| توالی اجرا  | تعیین ترتیب عملیات انتشار به ازای پلتفرم |
| تطبیق قالب  | اعمال PRM-207 برای هر پلتفرم             |
| ارسال محتوا | آماده‌سازی و ارسال به پلتفرم‌ها          |
| مدیریت خطا  | شناسایی و مدیریت خطاهای انتشار           |

### Outside Scope

| حوزه           | دلیل         |
| -------------- | ------------ |
| زمان‌بندی      | حوزه PRM-304 |
| انطباق پلتفرمی | حوزه PRM-305 |
| تأیید انتشار   | حوزه PRM-307 |

---

## 4. Consumers

| مصرف‌کننده          | نقش                 | نوع مصرف |
| ------------------- | ------------------- | -------- |
| AI-008 (Publishing) | اجرای زنجیره انتشار | Chain    |

---

## 5. Required Context

```json
{
  "context": {
    "sources": [
      {
        "type": "CTX-04",
        "source": "PRM-305 Output",
        "scope": ["compliance-report", "release-blockers"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-04",
        "source": "PRM-207",
        "scope": ["platform-format-adaptation"],
        "injection": "prepend",
        "required": true
      },
      {
        "type": "CTX-02",
        "source": "PRM-301",
        "scope": ["publishing-workflow", "error-handling"],
        "injection": "append",
        "required": true
      }
    ],
    "max_tokens": 5000,
    "priority": "high"
  }
}
```

---

## 6. Required Knowledge

| منبع    | دامنه                | کاربرد                   |
| ------- | -------------------- | ------------------------ |
| PLAT-\* | API و مکانیزم انتشار | ارسال به پلتفرم          |
| PRM-207 | تطبیق قالب           | قالب‌بندی برای هر پلتفرم |

---

## 7. Variables

| متغیر               | نوع    | اجباری | توضیح                               | اعتبارسنجی     |
| ------------------- | ------ | ------ | ----------------------------------- | -------------- |
| `compliance_report` | VAR-06 | بله    | گزارش انطباق از PRM-305             | —              |
| `dry_run`           | VAR-03 | خیر    | شبیه‌سازی بدون ارسال واقعی          | default: false |
| `continue_on_error` | VAR-03 | خیر    | ادامه زنجیره در صورت خطای غیربحرانی | default: true  |

---

## 8. Constraints

| ID     | محدودیت                                                   |
| ------ | --------------------------------------------------------- |
| CST-01 | زنجیره پس از release_blockers مسدود می‌شود                |
| CST-02 | هر گام باید وضعیت success/failure را ثبت کند              |
| CST-03 | خطای بحرانی در یک پلتفرم زنجیره آن پلتفرم را متوقف می‌کند |

---

## 9. Input Contract

| ورودی               | نوع     | منبع    | اجباری |
| ------------------- | ------- | ------- | ------ |
| `compliance_report` | object  | PRM-305 | بله    |
| `dry_run`           | boolean | AI-008  | خیر    |
| `continue_on_error` | boolean | AI-008  | خیر    |

---

## 10. Output Contract

| خروجی               | نوع    | توضیح                                |
| ------------------- | ------ | ------------------------------------ |
| `execution_plan`    | array  | برنامه اجرایی گام‌های انتشار         |
| `execution_log`     | array  | لاگ کامل هر گام اجرا                 |
| `platform_results`  | object | نتیجه انتشار به ازای پلتفرم          |
| `error_log`         | array  | خطاهای رخ‌داده در حین اجرا           |
| `execution_summary` | object | خلاصه وضعیت اجرا                     |
| `overall_status`    | string | وضعیت نهایی (success/partial/failed) |

---

## 11. Validation Rules

| ID     | قاعده                                | سطح    | نقض     |
| ------ | ------------------------------------ | ------ | ------- |
| VAL-01 | compliance_score ≥ ۷۰ برای هر پلتفرم | معماری | عدم ثبت |
| VAL-02 | هر گام وضعیت ثبت کرده                | معماری | عدم ثبت |
| VAL-03 | خطاهای بحرانی مسدودکننده             | معماری | عدم ثبت |
| VAL-04 | تطبیق قالب پیش از ارسال انجام شده    | معماری | هشدار   |

---

## 12. Quality Gates

| گیت   | مکان              | معیار                       | مسئول               |
| ----- | ----------------- | --------------------------- | ------------------- |
| QG-01 | Draft → Review    | هویت کامل, input معتبر      | خودکار              |
| QG-02 | Review → Approved | سازگاری با PRM-301, PLAT-\* | Operations Reviewer |
| QG-03 | Approved → Active | ثبت در PRM-001, ADR (A-3)   | Registry Keeper     |

---

## 13. Dependencies

| شناسه   | نوع                 | نسخه   | دلیل                   |
| ------- | ------------------- | ------ | ---------------------- |
| PRM-305 | DEP-01 (Requires)   | ^1.0.0 | گزارش انطباق برای اجرا |
| PRM-207 | DEP-01 (Requires)   | ^1.0.0 | تطبیق قالب پلتفرمی     |
| PRM-301 | DEP-03 (References) | ^1.0.0 | گردش کار انتشار        |

---

## 14. Human Override

| سناریو                                    | اقدام                                    |
| ----------------------------------------- | ---------------------------------------- |
| dry_run = false + overall_status = failed | Escalation به Operations Lead + لاگ کامل |
| خطاهای متوالی در بیش از ۲ پلتفرم          | توقف زنجیره + Escalation                 |

---

## 15. Governance Notes

| ID     | یادداشت                                        |
| ------ | ---------------------------------------------- |
| GOV-01 | A-3 (Strategic) — نیازمند ADR برای اجرای نهایی |
| GOV-02 | لاگ اجرا برای AI-010 و AI-011 قابل مصرف        |

---

## 16. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "id": "PRM-306",
  "name": "Publication Execution Chain",
  "family": "FAM-OPS",
  "subfamily": "OPS-PUB",
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
    { "type": "CTX-04", "source": "PRM-305", "required": true },
    { "type": "CTX-04", "source": "PRM-207", "required": true },
    { "type": "CTX-02", "source": "PRM-301", "required": true }
  ],
  "max_tokens": 5000,
  "priority": "high"
}
```

### Block 3 — Variables

```json
{
  "variables": [
    { "id": "compliance_report", "type": "VAR-06", "required": true },
    { "id": "dry_run", "type": "VAR-03", "required": false, "default": false },
    { "id": "continue_on_error", "type": "VAR-03", "required": false, "default": true }
  ]
}
```

### Block 4 — Input/Output

```json
{
  "input": {
    "required": ["compliance_report"],
    "optional": ["dry_run", "continue_on_error"]
  },
  "output": {
    "required": ["execution_plan", "execution_log", "platform_results", "overall_status"],
    "optional": ["error_log", "execution_summary"]
  }
}
```

### Block 5 — Validation

```json
{
  "rules": [
    {
      "id": "VAL-01",
      "description": "Compliance score >= 70 for each platform",
      "severity": "error"
    },
    { "id": "VAL-02", "description": "Each step has status logged", "severity": "error" },
    { "id": "VAL-03", "description": "Critical errors are blocking", "severity": "error" },
    { "id": "VAL-04", "description": "Format adaptation before submission", "severity": "warning" }
  ]
}
```

### Block 6 — Metadata

```json
{
  "security_level": "SL-02",
  "consumers": ["AI-008"],
  "dependencies": ["PRM-305", "PRM-207"],
  "documentation_refs": ["PRM-301"]
}
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر                             | توسط        |
| ----------- | ---------- | --------------------------------- | ----------- |
| 1.0.0-draft | 2026-06-28 | نگارش اولیه — زنجیره اجرای انتشار | معمار سیستم |
