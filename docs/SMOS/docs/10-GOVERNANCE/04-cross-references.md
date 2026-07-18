# Cross-References — نظام ارجاع متقابل SMOS

> **شناسه:** GOV-004
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-27
> **مسئول:** مهندس حکمرانی سازمانی
> **وابستگی:** [CON-000](../05-CONSTITUTION/00-constitution.md), [GOV-001](./01-documentation-standards.md), [GOV-003](./03-naming-conventions.md)
> **مخاطب:** human, agent, n8n, mcp

---

## ۱. معرفی

این سند **نظام ارجاع بین اسناد SMOS** را تعریف می‌کند.
ارجاع متقابل ابزاری است برای پیوند اسناد مرتبط بدون تکرار محتوا.

### اهداف

- حذف محتوای تکراری — هر موضوع یک SSOT دارد
- ایجاد گراف دانش قابل پیمایش برای انسان و Agent
- اطمینان از به‌روزرسانی هماهنگ اسناد مرتبط
- تسهیل تحلیل تأثیر تغییرات

---

## ۲. انواع ارجاع

| نوع                             | نماد       | توضیح                              | مثال                    |
| ------------------------------- | ---------- | ---------------------------------- | ----------------------- |
| **وابستگی (Depends On)**        | `→`        | سند فعلی به سند دیگر وابسته است    | `ARCH-030 → CON-000`    |
| **مشتق (Derived From)**         | `←`        | سند فعلی از سند دیگر مشتق شده      | `GOV-001 ← ARCH-030`    |
| **جایگزین (Supersedes)**        | `⊳`        | سند فعلی جایگزین سند قبلی شده      | `GOV-002 ⊳ ARCH-031 §۶` |
| **جایگزین‌شده (Superseded By)** | `⊲`        | سند فعلی توسط سند جدید جایگزین شده | `ARCH-031 §۶ ⊲ GOV-002` |
| **مرتبط (Related To)**          | `↔`        | ارتباط دوطرفه بدون وابستگی مستقیم  | `GOV-003 ↔ GOV-005`     |
| **ارجاع (References)**          | `→` (ضعیف) | اشاره به سند دیگر بدون وابستگی     | `[مثال](./مسیر)`        |

---

## ۳. نحوه ارجاع در متن

### ۳.۱ ارجاع استاندارد

```markdown
[شناسه](./مسیر-نسبی-به-فایل)
```

**مثال:**

```markdown
طبق [CON-000](../05-CONSTITUTION/00-constitution.md) ...
```

### ۳.۲ ارجاع به بخش خاص

```markdown
[شناسه](./مسیر#section-slug)
```

**مثال:**

```markdown
طبق [GOV-001](./01-documentation-standards.md#۳-ساختار-پایه-سند) ...
```

### ۳.۳ ارجاع با نوع رابطه (برای Agent / n8n)

```markdown
[شناسه](./مسیر) — نوع: depends-on
```

**مثال:**

```markdown
[GOV-001](./01-documentation-standards.md) — نوع: derived-from
```

---

## ۴. فیلد وابستگی در هدر سند

فیلد `وابستگی` در هدر سند، ارجاعات ساختاری سند را فهرست می‌کند:

```markdown
> **وابستگی:** [CON-000](../05-CONSTITUTION/00-constitution.md), [ARCH-030](./../00-ARCHITECTURE/30-governance-architecture.md)
```

**قواعد:**

- فقط ارجاعات از نوع `depends-on` در هدر درج می‌شوند
- حداکثر ۵ وابستگی در هدر — بیش از ۵ نیازمند بازنگری معماری است
- ترتیب وابستگی‌ها: از مهم به کم‌اهمیت
- ارجاعات to اسناد `Draft` مجاز نیست
- ارجاع به نسخه خاصی از سند الزامی نیست (آخرین نسخه Published معتبر است)

---

## ۵. ثبات وابستگی ماژول‌ها (Module Dependency Registry)

| ماژول        | وابسته به                              | نوع وابستگی      |
| ------------ | -------------------------------------- | ---------------- |
| CONSTITUTION | —                                      | مستقل — سند عالی |
| ARCHITECTURE | CONSTITUTION                           | depends-on       |
| GOVERNANCE   | CONSTITUTION, ARCHITECTURE             | depends-on       |
| PLATFORMS    | CONSTITUTION, BRAND, GOVERNANCE        | depends-on       |
| BRAND        | CONSTITUTION                           | depends-on       |
| EDITORIAL    | BRAND, PLATFORMS, ARCHITECTURE         | depends-on       |
| ASSETS       | BRAND, EDITORIAL                       | depends-on       |
| AUTOMATION   | GOVERNANCE, ARCHITECTURE               | depends-on       |
| PROMPTS      | GOVERNANCE, AI-AGENTS                  | depends-on       |
| AI-AGENTS    | CONSTITUTION, ARCHITECTURE, GOVERNANCE | depends-on       |
| KNOWLEDGE    | CONSTITUTION, ARCHITECTURE             | depends-on       |
| OPERATIONS   | GOVERNANCE, AUTOMATION                 | depends-on       |
| REPORTS      | METRICS, KNOWLEDGE                     | depends-on       |
| METRICS      | PLATFORMS, EDITORIAL                   | depends-on       |
| REFERENCE    | CONSTITUTION, ARCHITECTURE             | depends-on       |
| TRAINING     | GOVERNANCE, KNOWLEDGE, OPERATIONS      | depends-on       |
| ARCHIVE      | —                                      | مستقل            |

---

## ۶. پیشگیری از ارجاع دایره‌ای (Circular Reference Prevention)

| قاعده | توضیح                                                    |
| ----- | -------------------------------------------------------- |
| CR-01 | ارجاع دایره‌ای مستقیم ممنوع: A → B → A                   |
| CR-02 | ارجاع دایره‌ای غیرمستقیم ممنوع: A → B → C → A            |
| CR-03 | خودارجاعی (self-reference) ممنوع                         |
| CR-04 | کشف ارجاع دایره‌ای توسط Reviewer در بازبینی انجام می‌شود |
| CR-05 | ارجاع دایره‌ای کشف‌شده باید با ADR ثبت و رفع شود         |

**درخت وابستگی مجاز:** DAG (Directed Acyclic Graph) — گراف جهت‌دار بدون دور.

---

## ۷. چرخه حیات ارجاع

| وضعیت سند مبدأ | وضعیت سند مقصد | مجاز؟                               |
| -------------- | -------------- | ----------------------------------- |
| Published      | Published      | بله                                 |
| Published      | Deprecated     | بله — با اطلاع‌رسانی                |
| Published      | Superseded     | بله — با هدایت به سند جدید          |
| Published      | Archived       | خیر — باید به سند جایگزین هدایت شود |
| Draft          | Published      | بله — با احتیاط                     |
| Draft          | Draft          | خیر                                 |
| Review         | Published      | بله — با تگ REVIEW                  |

---

## ۸. قواعد عمومی

| قاعده      | توضیح                                                                     |
| ---------- | ------------------------------------------------------------------------- |
| GOV-004-01 | هر ارجاع باید به سندی معتبر (شناسه + فایل موجود) اشاره کند                |
| GOV-004-02 | لینک‌های شکسته (broken links) باید در ۲۴ ساعت اصلاح شوند                  |
| GOV-004-03 | ارجاع به ماژول ≠ ارجاع به سند خاص — فقط در فیلد `وابستگی` مجاز است        |
| GOV-004-04 | ارجاع به سند خارج از SMOS (external) باید با URL کامل و تاریخ دسترسی باشد |
| GOV-004-05 | هیچ سندی نباید به `Draft` ارجاع دهد                                       |
| GOV-004-06 | ارجاع به `Archived` باید به سند جایگزین هدایت کند                         |

---

## ۹. تطابق

- Reviewer مسئول بررسی صحت ارجاعات در بازبینی اسناد است
- لینک‌های شکسته باید قبل از انتشار اصلاح شوند
- اسناد Published که لینک شکسته دارند در بازبینی بعدی اصلاح می‌شوند

---

## تغییرات

| نسخه        | تاریخ      | تغییر        | توسط                  |
| ----------- | ---------- | ------------ | --------------------- |
| ۱.۰.۰-draft | 2026-06-27 | انتشار اولیه | مهندس حکمرانی سازمانی |
