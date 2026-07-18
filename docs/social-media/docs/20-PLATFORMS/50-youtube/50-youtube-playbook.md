# یوتیوب — YouTube Playbook

> **شناسه:** PLAT-005
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-27
> **مسئول:** مدیر پلتفرم یوتیوب
> **وابستگی:** [PLAT-000](../00-platform-playbook-standard.md), [ARCH-020](../../00-ARCHITECTURE/20-enterprise-multi-platform-strategy.md)
> **مخاطب:** human, agent, n8n, mcp

---

## Architectural Dependencies

### Why This Document Exists

هر کتابچه پلتفرم SMOS باید از PLAT-000 پیروی کند. PLAT-005 این ساختار را برای پلتفرم **YouTube** پیاده‌سازی می‌کند و قواعد عملیاتی مختص یوتیوب را به عنوان SSOT تعریف می‌کند. بدون این سند:

- Agentها نمی‌دانند چه محتوای ویدئویی در یوتیوب منتشر کنند
- کیفیت ویدئو، ساختار و قواعد سئوی یوتیوب ناپایدار خواهد بود
- Shorts و Live Streaming بدون فرایند استاندارد تولید می‌شوند
- دانش استخراج‌شده از بازخورد ویدئوها به سیستم بازنمی‌گردد

### Problems It Solves

1. **نبود SSOT برای یوتیوب**: هر تیم برداشت متفاوتی از قواعد یوتیوب دارد → PLAT-005 به عنوان تنها مرجع معتبر
2. **کیفیت ناپایدار ویدئو**: ویدئوها بدون استاندارد بصری و فنی تولید می‌شوند → Video Quality Gate
3. **سئوی ازدست‌رفته**: ویدئوها بدون بهینه‌سازی عنوان، توضیحات و برچسب منتشر می‌شوند → SEO Pipeline
4. **نبود استراتژی Shorts**: محتوای کوتاه بدون برنامه و هدف → Shorts Strategy استاندارد
5. **عدم هماهنگی AI**: Agentها نمی‌دانند در یوتیوب چگونه عمل کنند → AI Collaboration با قواعد مشخص
6. **از دست دادن Audience Insights**: بازخورد ویدئوها به دانش سازمانی تبدیل نمی‌شود → Analytics Pipeline با Knowledge Capture

### Explicit Scope

این سند فقط تعریف می‌کند:

- هویت و مأموریت یوتیوب در SMOS (برگرفته از [ARCH-020](../../00-ARCHITECTURE/20-enterprise-multi-platform-strategy.md))
- انواع محتوای ویدئویی قابل انتشار (برگرفته از [EDT-002](../../24-EDITORIAL/20-content-taxonomy.md))
- قواعد عملیاتی تولید، انتشار، سئو و تعامل مختص یوتیوب
- استانداردهای فنی ویدئو (رزولوشن، ابعاد، طول، زیرنویس)
- همکاری با Agentها و رابط‌های خودکارسازی (برگرفته از [ARCH-013](../../00-ARCHITECTURE/13-ai-operating-model.md))
- KPIها و متریک‌های مختص یوتیوب

### Explicit Non-Scope

این سند هرگز شامل موارد زیر نیست:

- استراتژی چندپلتفرمی (به [ARCH-020](../../00-ARCHITECTURE/20-enterprise-multi-platform-strategy.md) مراجعه کنید)
- هویت برند، صدا و شخصیت برند (به [BRD-001](../../22-BRAND/10-brand-identity.md) مراجعه کنید)
- معماری صدای برند و لحن (به [BRD-002](../../22-BRAND/20-brand-voice.md) مراجعه کنید)
- انواع محتوا و تعریف CT-IDها (به [EDT-002](../../24-EDITORIAL/20-content-taxonomy.md) مراجعه کنید)
- کد API یا اسکریپت‌های اجرایی (به [AUT-\*](../../30-AUTOMATION/) مراجعه کنید)
- چرخه حیات محتوا و کیفیت (به [EDT-001](../../24-EDITORIAL/10-content-guidelines.md) مراجعه کنید)
- قواعد برند برای Agentها (به [BRD-001 §۲۱](../../22-BRAND/10-brand-identity.md) مراجعه کنید)
- مدیریت دارایی‌های ویدئویی خام (به [AST-\*](../../26-ASSETS/) مراجعه کنید)

### Upstream Dependencies

| سند                                                                        | نوع وابستگی  | دلیل                                               |
| -------------------------------------------------------------------------- | ------------ | -------------------------------------------------- |
| [PLAT-000](../00-platform-playbook-standard.md)                            | derived-from | قالب ساختار ۳۴ بخشی                                |
| [ARCH-020](../../00-ARCHITECTURE/20-enterprise-multi-platform-strategy.md) | depends-on   | نقش استراتژیک، طبقه‌بندی، اولویت                   |
| [CON-000](../../05-CONSTITUTION/00-constitution.md)                        | governs      | اصول یکپارچگی، کیفیت، حاکمیت                       |
| [BRD-001](../../22-BRAND/10-brand-identity.md)                             | depends-on   | هویت برند، صدا، لحن، فلسفه بصری                    |
| [BRD-002](../../22-BRAND/20-brand-voice.md)                                | depends-on   | معماری صدا، لحن، Tone Matrix                       |
| [EDT-001](../../24-EDITORIAL/10-content-guidelines.md)                     | depends-on   | چرخه حیات محتوا، کیفیت                             |
| [EDT-002](../../24-EDITORIAL/20-content-taxonomy.md)                       | depends-on   | شناسه‌های CT-ID، طبقه‌بندی محتوا                   |
| [ARCH-013](../../00-ARCHITECTURE/13-ai-operating-model.md)                 | depends-on   | Agentهای Publishing, Engagement, Monitoring, Video |
| [GOV-001](../../10-GOVERNANCE/01-documentation-standards.md)               | follows      | استاندارد نگارش سند                                |
| [GOV-003](../../10-GOVERNANCE/03-naming-conventions.md)                    | follows      | قراردادهای نام‌گذاری شناسه‌ها                      |
| [GOV-004](../../10-GOVERNANCE/04-cross-references.md)                      | follows      | نظام ارجاع متقابل                                  |

### Downstream Dependencies

| سند                            | نوع وابستگی | دلیل                                            |
| ------------------------------ | ----------- | ----------------------------------------------- |
| [AUT-\*](../../30-AUTOMATION/) | implements  | گردش کارهای انتشار، مانیتورینگ، SEO، Shorts     |
| [AI-\*](../../40-AI-AGENTS/)   | implements  | Agentهای Writing, Video, Publishing, Monitoring |
| [PRM-\*](../../35-PROMPTS/)    | implements  | پرامپت‌های تولید محتوای ویدئویی یوتیوب          |
| [MET-\*](../../60-METRICS/)    | measures    | KPIهای عملکرد یوتیوب                            |

### SSOT Ownership

| موضوع                             | SSOT                   |
| --------------------------------- | ---------------------- |
| YouTube-specific Rules            | **PLAT-005** (این سند) |
| YouTube Content Mapping           | **PLAT-005** (این سند) |
| YouTube Video Types               | **PLAT-005** (این سند) |
| YouTube SEO Rules                 | **PLAT-005** (این سند) |
| YouTube Engagement Rules          | **PLAT-005** (این سند) |
| YouTube Shorts Strategy           | **PLAT-005** (این سند) |
| YouTube Live Streaming Rules      | **PLAT-005** (این سند) |
| YouTube Video Technical Standards | **PLAT-005** (این سند) |
| Brand Visual Philosophy           | BRD-001                |
| Brand Voice Architecture          | BRD-002                |
| Content Type Definitions          | EDT-002                |
| Multi-Platform Strategy           | ARCH-020               |
| Platform Playbook Structure       | PLAT-000               |

### Related ADRs

| ADR     | عنوان                             | ارتباط                              |
| ------- | --------------------------------- | ----------------------------------- |
| ADR-010 | معماری متا به عنوان الگوی عملیاتی | لایه Distribution (یوتیوب)          |
| ADR-013 | جداسازی Automation و Agent        | یوتیوب توسط Automation توزیع می‌شود |
| ADR-015 | تأیید انسانی برای انتشار الزامی   | گیت‌های تأیید در یوتیوب             |
| ADR-019 | حکمرانی ۱۰ لایه                   | لایه Platform در حکمرانی یوتیوب     |

### Related Objects (from ARCH-011)

Platform (OBJ-010), Account (OBJ-019), Audience (OBJ-012), Persona (OBJ-011), Platform Version (OBJ-005), Content Variant (OBJ-006), Publication (OBJ-022), Metric (OBJ-017), Asset (OBJ-007), Campaign (OBJ-001)

### Related AI Agents (from ARCH-013)

Orchestrator (000), Planning (002), Writing (003), Review (004), Fact Check (005), Graphic (006), Video (007), Publishing (008), Monitoring (009), Analytics (010), Knowledge (011), Engagement (013), Scheduler (014)

---

## ۱. Executive Summary

PLAT-005 کتابچه عملیاتی پلتفرم **YouTube** در SMOS است. یوتیوب با نقش **Video (ویدئو)** و اولویت **P2** به عنوان کانال اصلی انتشار محتوای ویدئویی سازمانی در اکوسیستم SMOS عمل می‌کند.

یوتیوب تنها پلتفرم SMOS است که بر **محتوای ویدئویی بلند** (Long-form Video) تمرکز دارد و مکمل پلتفرم‌های متنی و تصویری دیگر است. محتوای آموزشی، تحلیل‌های عمیق صنعت، مصاحبه‌های تخصصی، مستندهای سازمانی و ویدئوهای کوتاه (Shorts) در یوتیوب منتشر می‌شوند.

این سند شامل ۳۴ بخش است که همه جنبه‌های عملیاتی یوتیوب را پوشش می‌دهد: از هویت و مأموریت تا قواعد تولید ویدئو، سئو، مدل تعامل، Shorts Strategy، همکاری با Agentها و بلوک‌های ماشین‌خوان.

---

## ۲. Purpose

### اهداف PLAT-005

1. **تعریف نقش ویدئویی یوتیوب**: یوتیوب به عنوان Video Hub سازمانی — SSOT برای انتشار محتوای ویدئویی
2. **کیفیت پایدار ویدئو**: استانداردهای فنی و محتوایی یکسان برای همه ویدئوها
3. **سئوی سازمانی یوتیوب**: بهینه‌سازی عنوان، توضیحات، برچسب و زیرنویس برای کشف‌پذیری حداکثری
4. **یکپارچگی با برند**: همه ویدئوها با BRD-001 و BRD-002 هماهنگ هستند
5. **بهره‌وری از Shorts**: ویدئوهای کوتاه به عنوان ابزار جذب و تعامل مخاطب جدید
6. **همکاری هوشمند**: Agentها و انسان‌ها در یک چارچوب مشخص در یوتیوب همکاری می‌کنند

### اصول PLAT-005

| اصل       | توضیح                                                                        |
| --------- | ---------------------------------------------------------------------------- |
| **YT-01** | کیفیت بر کمیت اولویت دارد — هر ویدئو باید ارزش مشخصی به مخاطب بدهد           |
| **YT-02** | هر ویدئو یک CTA مشخص دارد — حتی اگر فقط "اشتراک کانال" باشد                  |
| **YT-03** | سئو بخشی از تولید محتواست — عنوان، توضیحات و برچسب پس از تولید بهینه می‌شوند |
| **YT-04** | Shorts دروازه ورود به محتوای بلند هستند — مستقل اما مرتبط                    |
| **YT-05** | تعامل (کامنت، لایک، اشتراک‌گذاری) بخشی از استراتژی رشد کانال است             |
| **YT-06** | بازخورد مخاطب در کامنت‌ها به دانش سازمانی تبدیل می‌شود                       |

---

## ۳. Scope

### دامنه شمول

| پلتفرم         | شناسه    | دامنه                                                               |
| -------------- | -------- | ------------------------------------------------------------------- |
| YouTube        | PLAT-005 | کانال رسمی Xennic — ویدئوهای بلند، Shorts، لایو استریم، Memberships |
| YouTube Shorts | PLAT-005 | محتوای ویدئویی کوتاه (≤ ۶۰ ثانیه) — عمودی                           |
| YouTube Live   | PLAT-005 | پخش زنده رویدادها، وبینارها، Q&A                                    |

### دامنه عدم شمول

- مدیریت کانال‌های شخصی تیم Xennic
- تبلیغات پولی YouTube Ads — مگر در کمپین‌های خاص با تأیید Media Director
- YouTube Shopping — خارج از دامنه فعلی SMOS
- YouTube Music — خارج از دامنه فعلی
- YouTube Premium Content — خارج از دامنه فعلی

---

## ۴. Platform Identity

### هویت پلتفرم

| فیلد                   | مقدار                                                       |
| ---------------------- | ----------------------------------------------------------- |
| **Platform ID**        | PLAT-005                                                    |
| **Platform Name (FA)** | یوتیوب                                                      |
| **Platform Name (EN)** | YouTube                                                     |
| **Owner Company**      | Google LLC (Alphabet Inc.)                                  |
| **Platform Category**  | Third-Party                                                 |
| **Platform Role**      | Video                                                       |
| **Platform Priority**  | P2                                                          |
| **API Type**           | YouTube Data API v3                                         |
| **API Version**        | v3                                                          |
| **Authentication**     | OAuth 2.0 + API Key                                         |
| **Rate Limits**        | ۱۰,۰۰۰ units/day (standard); ۱,۰۰۰,۰۰۰ units/day (verified) |

### بلوک JSON

```json
{
  "platform_identity": {
    "id": "PLAT-005",
    "name_fa": "یوتیوب",
    "name_en": "YouTube",
    "owner": "Google LLC",
    "category": "Third-Party",
    "role": "Video",
    "priority": "P2",
    "api": {
      "type": "Data API v3",
      "version": "v3",
      "auth": "OAuth 2.0",
      "rate_limits": "10,000 units/day standard"
    }
  }
}
```

---

## ۵. Platform Overview

یوتیوب بزرگ‌ترین پلتفرم اشتراک‌گذاری ویدئو در جهان است. کاربران ویدئو آپلود می‌کنند، تماشا می‌کنند، نظر می‌دهند، اشتراک‌گذاری می‌کنند و در کانال‌ها عضو می‌شوند. یوتیوب دومین موتور جستجوی بزرگ جهان پس از Google است.

### ویژگی‌های کلیدی یوتیوب

| ویژگی                   | توضیح                              | اهمیت برای SMOS                        |
| ----------------------- | ---------------------------------- | -------------------------------------- |
| **Long-form Video**     | ویدئوهای بلند (تا ۱۲ ساعت)         | حیاتی — محتوای آموزشی، تحلیلی، مستند   |
| **Shorts**              | ویدئوهای کوتاه عمودی (≤ ۶۰ ثانیه)  | بالا — جذب مخاطب جدید، تیزر            |
| **Live Streaming**      | پخش زنده                           | متوسط — رویدادها، وبینارها، Q&A        |
| **YouTube Search**      | دومین موتور جستجوی جهان            | حیاتی — سئوی ویدئو برای کشف‌پذیری      |
| **Playlists**           | دسته‌بندی ویدئوها در لیست‌های پخش  | بالا — سازماندهی محتوا، تماشای پیوسته  |
| **Chapters**            | بخش‌بندی ویدئو با تایم‌استمپ       | بالا — ناوبری آسان در ویدئوهای بلند    |
| **Cards & End Screens** | عناصر تعاملی درون ویدئو            | بالا — CTA, لینک به ویدئوهای دیگر      |
| **Comments**            | نظرات مخاطبان زیر هر ویدئو         | بالا — تعامل و بازخورد                 |
| **Community Tab**       | پست‌های متنی و تصویری (بدون ویدئو) | متوسط — اطلاع‌رسانی و تعامل غیرویدئویی |
| **YouTube Studio**      | داشبورد مدیریت کانال و تحلیل       | بالا — متریک‌ها و Insights             |
| **Subtitles & CC**      | زیرنویس و Closed Caption           | بالا — دسترس‌پذیری و سئو               |

### آمار کلیدی (جهانی)

| معیار                       | مقدار                      |
| --------------------------- | -------------------------- |
| کاربران فعال ماهانه         | ~۲.۵ میلیارد               |
| ویدئو آپلودشده در دقیقه     | ~۵۰۰ ساعت                  |
| ساعات تماشای روزانه         | ~۱ میلیارد ساعت            |
| پشتیبانی رزولوشن            | تا ۸K (4320p)              |
| حداکثر حجم فایل ویدئو       | ۲۵۶ GB                     |
| حداکثر طول ویدئو (تأییدشده) | ۱۲ ساعت                    |
| نسبت ابعاد ترجیحی           | ۱۶:۹ (عریض), ۹:۱۶ (Shorts) |

---

## ۶. Strategic Role

### نقش استراتژیک: Video (ویدئو)

نقش **Video** یک نقش جدید در چارچوب [ARCH-020 §۶](../../00-ARCHITECTURE/20-enterprise-multi-platform-strategy.md#۶-platform-roles) است که در کنار نقش‌های Hub, Reach, Network, Community, Archive, News تعریف می‌شود.

| ویژگی           | توضیح                                                             |
| --------------- | ----------------------------------------------------------------- |
| **نام نقش**     | Video                                                             |
| **هدف**         | انتشار محتوای ویدئویی سازمانی — آموزشی، تحلیلی، مستند، مصاحبه     |
| **سرعت**        | برنامه‌ریزی‌شده (Scheduled) — ویدئوهای بلند نیازمند تولید زمان‌بر |
| **مخاطب**       | عموم — متخصصان صنعت، دانشجویان، علاقه‌مندان به فناوری             |
| **محتوای غالب** | ویدئوی بلند (Long-form), Shorts, لایو                             |
| **CTA اصلی**    | اشتراک کانال + لینک به Website/Blog (Hub) برای اطلاعات بیشتر      |

### جایگاه در سفر مخاطب (از ARCH-020 §۷)

| مرحله          | نقش یوتیوب                         | پلتفرم مکمل          |
| -------------- | ---------------------------------- | -------------------- |
| **Awareness**  | کشف از طریق جستجوی یوتیوب و Shorts | Instagram (Reach)    |
| **Attention**  | ویدئوهای عمیق آموزشی و تحلیلی      | LinkedIn (Network)   |
| **Engagement** | کامنت‌ها و Community Tab           | Telegram (Community) |
| **Trust**      | محتوای مستند و معتبر آموزشی        | Website / Blog (Hub) |
| **Advocacy**   | اشتراک‌گذاری ویدئوها توسط مخاطبان  | Telegram (Community) |

### تفکیک نقش‌ها (حل تعارض)

| نقش              | پلتفرم‌ها                   | مرز                               |
| ---------------- | --------------------------- | --------------------------------- |
| **Video**        | YouTube                     | محتوای ویدئویی بلند، Shorts، لایو |
| **Video Backup** | Aparat                      | آینه یوتیوب برای مخاطب ایران      |
| **Hub**          | Website / Blog              | محتوای کامل متنی، مرجع، SEO       |
| **Reach**        | Instagram, YouTube (Shorts) | دسترسی بصری گسترده                |
| **News**         | X / Twitter                 | اخبار فوری، بیانیه‌ها             |
| **Archive**      | YouTube, Aparat             | بایگانی بلندمدت ویدئو             |

---

## ۷. Audience Definition

### مخاطبان پلتفرم

| فیلد                      | مقدار                                                                          |
| ------------------------- | ------------------------------------------------------------------------------ |
| **Primary Audience**      | متخصصان و علاقه‌مندان به انرژی، فناوری و نوآوری — جستجوگران محتوای آموزشی عمیق |
| **Secondary Audience**    | دانشجویان، پژوهشگران، تصمیم‌گیرندگان صنعت، مخاطبان عمومی علاقه‌مند به دانش     |
| **Audience Demographics** | ۲۰-۵۵ سال، مخلوط جنسیت، ایران + جهان (فارسی‌زبان + انگلیسی)                    |
| **Audience Behavior**     | فعال — جستجوی ویدئو، تماشای بلندمدت، کامنت، اشتراک کانال، ذخیره در پلی‌لیست    |
| **Peak Hours**            | ۱۰:۰۰-۱۳:۰۰ + ۲۰:۰۰-۲۳:۰۰ (به وقت تهران)                                       |
| **Content Preferences**   | آموزش عمیق، تحلیل صنعت، مصاحبه تخصصی، مستند فناوری                             |
| **Personas**              | PERSONA-001 (Professional), PERSONA-002 (Student), PERSONA-005 (Researcher)    |

### بلوک JSON

```json
{
  "audience_definition": {
    "primary": "متخصصان انرژی، فناوری و نوآوری",
    "secondary": "دانشجویان، پژوهشگران، تصمیم‌گیرندگان صنعت",
    "demographics": {
      "age_range": "20-55",
      "gender": "مخلوط",
      "location": "جهانی (فارسی‌زبان)",
      "language": "فارسی + انگلیسی"
    },
    "behavior": {
      "active_hours": ["10:00-13:00", "20:00-23:00"],
      "content_preferences": ["آموزش عمیق", "تحلیل صنعت", "مصاحبه", "مستند"],
      "engagement_style": "فعال",
      "platform_habits": ["جستجوی ویدئو", "تماشای پلی‌لیست", "کامنت", "اشتراک"]
    },
    "personas": ["PERSONA-001", "PERSONA-002", "PERSONA-005"]
  }
}
```

---

## ۸. Platform Mission

مأموریت یوتیوب در SMOS:

**"مرجع تصویری دانش و نوآوری — جایی که مفاهیم عمیق به زبان تصویر بیان می‌شوند."**

### ابعاد مأموریت

| بعد          | توضیح                                                       |
| ------------ | ----------------------------------------------------------- |
| **Educate**  | آموزش مفاهیم تخصصی انرژی و فناوری به زبان ساده و تصویری     |
| **Analyze**  | تحلیل عمیق روندها، رویدادها و نوآوری‌های صنعت در قالب ویدئو |
| **Document** | مستندسازی دانش سازمانی، فرهنگ برند و دستاوردها              |
| **Engage**   | ایجاد تعامل عمیق از طریق محتوای تصویری جذاب و پرسش‌محور     |

---

## ۹. Platform Objectives

| هدف    | توضیح                                                   | KPI مرتبط                               | زمان    | اولویت |
| ------ | ------------------------------------------------------- | --------------------------------------- | ------- | ------ |
| OBJ-01 | تبدیل کانال یوتیوب به مرجع محتوای آموزشی انرژی و فناوری | KPI-PLAT-005-06 (Watch Time Growth)     | Q4 1405 | P1     |
| OBJ-02 | رشد ۲۰۰۰ مشترک فعال در ۶ ماه                            | KPI-PLAT-005-04 (Subscriber Growth)     | Q4 1405 | P1     |
| OBJ-03 | میانگین Retention Rate > ۵۰٪ برای ویدئوهای بلند         | KPI-PLAT-005-03 (Retention Rate)        | Q3 1405 | P1     |
| OBJ-04 | انتشار ۴ ویدئوی بلند و ۸ Shorts در ماه                  | KPI-PLAT-005-01 (Publication Frequency) | Q2 1405 | P2     |
| OBJ-05 | استخراج ماهانه Insights از کامنت‌ها و بازخوردها         | KPI-PLAT-005-09 (Audience Insights)     | Q3 1405 | P2     |

---

## ۱۰. Platform KPIs

| KPI             | توضیح                                                         | هدف                       | فرکانس اندازه‌گیری | مسئول               |
| --------------- | ------------------------------------------------------------- | ------------------------- | ------------------ | ------------------- |
| KPI-PLAT-005-01 | **Views** — تعداد بازدید ویدئوها                              | ۱۰۰K / ماه                | روزانه             | AI-009 (Monitoring) |
| KPI-PLAT-005-02 | **Watch Time** — ساعت تماشای کل ویدئوها                       | ۵,۰۰۰ ساعت / ماه          | روزانه             | AI-009              |
| KPI-PLAT-005-03 | **Retention Rate** — میانگین درصد تماشای ویدئو                | > ۵۰٪                     | هفتگی              | AI-010 (Analytics)  |
| KPI-PLAT-005-04 | **Subscriber Growth** — رشد مشترکین کانال                     | +۳٪ / ماه                 | هفتگی              | AI-010              |
| KPI-PLAT-005-05 | **Engagement Rate** — (Likes+Comments+Shares) / Views         | > ۵٪                      | روزانه             | AI-009              |
| KPI-PLAT-005-06 | **Average View Duration** — میانگین زمان تماشای هر ویدئو      | > ۵ دقیقه (ویدئوهای بلند) | هفتگی              | AI-010              |
| KPI-PLAT-005-07 | **CTR (Click-Through Rate)** — نرخ کلیک روی عنوان ویدئو       | > ۵٪                      | هفتگی              | AI-010              |
| KPI-PLAT-005-08 | **Shorts Views** — تعداد بازدید Shorts                        | ۵۰K / ماه                 | روزانه             | AI-009              |
| KPI-PLAT-005-09 | **Audience Insights** — تعداد Insight استخراج‌شده از کامنت‌ها | > ۴ / ماه                 | ماهانه             | AI-011 (Knowledge)  |
| KPI-PLAT-005-10 | **Publishing Consistency** — درصد پایبندی به تقویم انتشار     | > ۹۰٪                     | ماهانه             | AI-014 (Scheduler)  |

### بلوک JSON

```json
{
  "platform_kpis": [
    {
      "id": "KPI-PLAT-005-01",
      "name": "Views",
      "description": "تعداد بازدید ویدئوها",
      "target": "100K / month",
      "unit": "views",
      "frequency": "daily",
      "owner": "AI-009"
    },
    {
      "id": "KPI-PLAT-005-02",
      "name": "Watch Time",
      "description": "ساعت تماشای کل ویدئوها",
      "target": "5,000 hours / month",
      "unit": "hours",
      "frequency": "daily",
      "owner": "AI-009"
    },
    {
      "id": "KPI-PLAT-005-03",
      "name": "Retention Rate",
      "description": "میانگین درصد تماشای ویدئو",
      "target": "> 50%",
      "unit": "percentage",
      "frequency": "weekly",
      "owner": "AI-010"
    },
    {
      "id": "KPI-PLAT-005-04",
      "name": "Subscriber Growth",
      "description": "رشد مشترکین",
      "target": "+3% / month",
      "unit": "percentage",
      "frequency": "weekly",
      "owner": "AI-010"
    },
    {
      "id": "KPI-PLAT-005-05",
      "name": "Engagement Rate",
      "description": "نرخ تعامل کلی",
      "target": "> 5%",
      "unit": "percentage",
      "frequency": "daily",
      "owner": "AI-009"
    },
    {
      "id": "KPI-PLAT-005-06",
      "name": "Average View Duration",
      "description": "میانگین زمان تماشا",
      "target": "> 5 min (long-form)",
      "unit": "minutes",
      "frequency": "weekly",
      "owner": "AI-010"
    },
    {
      "id": "KPI-PLAT-005-07",
      "name": "CTR",
      "description": "نرخ کلیک روی عنوان ویدئو",
      "target": "> 5%",
      "unit": "percentage",
      "frequency": "weekly",
      "owner": "AI-010"
    },
    {
      "id": "KPI-PLAT-005-08",
      "name": "Shorts Views",
      "description": "بازدید Shorts",
      "target": "50K / month",
      "unit": "views",
      "frequency": "daily",
      "owner": "AI-009"
    },
    {
      "id": "KPI-PLAT-005-09",
      "name": "Audience Insights",
      "description": "Insight از کامنت‌ها",
      "target": "> 4 / month",
      "unit": "insights",
      "frequency": "monthly",
      "owner": "AI-011"
    },
    {
      "id": "KPI-PLAT-005-10",
      "name": "Publishing Consistency",
      "description": "پایبندی به تقویم انتشار",
      "target": "> 90%",
      "unit": "percentage",
      "frequency": "monthly",
      "owner": "AI-014"
    }
  ]
}
```

---

## ۱۱. Platform Constraints

### Technical

| محدودیت             | توضیح                      | تأثیر                            | کاهش اثر                     |
| ------------------- | -------------------------- | -------------------------------- | ---------------------------- |
| Maximum file size   | ۲۵۶ GB per video           | محدودیت در ویدئوهای بسیار بلند   | فشرده‌سازی با حفظ کیفیت      |
| Maximum length      | ۱۲ ساعت (verified account) | محدودیت در محتوای فوق‌بلند       | تقسیم به سری چندقسمتی        |
| Resolution          | تا ۸K                      | نیاز به پردازش و پهنای باند بالا | خروجی ۱۰۸۰p/4K کافی است      |
| Audio format        | AAC-LC, MP3 و غیره         | محدودیت در فرمت‌های صوتی خاص     | تبدیل به فرمت پشتیبانی‌شده   |
| Thumbnail size      | ۲ MB max, ۱۲۸۰×۷۲۰ min     | محدودیت در تصاویر بندانگشتی      | بهینه‌سازی تصویر             |
| API quota           | ۱۰,۰۰۰ units/day           | محدودیت در درخواست‌های API       | کش کردن داده‌ها و بهینه‌سازی |
| Rate limit comments | محدودیت نامشخص             | محدودیت در پاسخ خودکار           | صف هوشمند پاسخ               |

### Content

| محدودیت            | توضیح                                               | تأثیر                                      |
| ------------------ | --------------------------------------------------- | ------------------------------------------ |
| Prohibited content | خشونت، نفرت‌پراکنی، اطلاعات نادرست، محتوای کپی‌رایت | رعایت قواعد YouTube                        |
| Copyright          | موسیقی و تصاویر بدون مجوز ممنوع                     | استفاده از کتابخانه YouTube یا محتوای اصلی |
| COPPA              | محتوای کودکان تابع قواعد خاص                        | عدم تولید محتوای کودکان                    |
| Misinformation     | محتوای گمراه‌کننده ممنوع                            | Fact Check قبل از انتشار                   |

### Legal

| محدودیت        | توضیح                                                                     |
| -------------- | ------------------------------------------------------------------------- |
| Data privacy   | GDPR, CCPA — عدم اشتراک اطلاعات شخصی                                      |
| Copyright      | رعایت حق نشر در موسیقی، تصاویر و کلیپ‌های استفاده‌شده                     |
| Iran sanctions | تحریم‌های آمریکا علیه ایران — دسترسی محدود برای کاربران ایرانی (نیاز VPN) |
| YouTube Terms  | رعایت شرایط سرویس YouTube — عدم نقض ToS                                   |

### Business

| محدودیت           | توضیح                                        |
| ----------------- | -------------------------------------------- |
| Brand safety      | عدم محتوای جنجالی، سیاسی یا مذهبی            |
| Competitor policy | عدم اشاره منفی مستقیم به رقبا                |
| Ad suitability    | محتوای مناسب برای محیط تبلیغاتی (brand-safe) |
| Crisis policy     | محتوای بحرانی نیازمند تأیید Media Director   |

### بلوک JSON

```json
{
  "platform_constraints": [
    {
      "type": "technical",
      "description": "Maximum file size 256 GB",
      "impact": "محدودیت در ویدئوهای فوق‌بلند",
      "mitigation": "فشرده‌سازی با کیفیت مناسب"
    },
    {
      "type": "technical",
      "description": "Max length 12 hours for verified accounts",
      "impact": "محدودیت در محتوای طولانی",
      "mitigation": "تقسیم به سری چندقسمتی"
    },
    {
      "type": "content",
      "description": "Copyright and prohibited content rules",
      "impact": "محدودیت در استفاده از موسیقی و تصاویر",
      "mitigation": "استفاده از محتوای اصلی و کتابخانه YouTube"
    },
    {
      "type": "legal",
      "description": "US sanctions on Iran",
      "impact": "دسترسی محدود کاربران ایرانی",
      "mitigation": "Aparat به عنوان آینه برای مخاطب ایران"
    },
    {
      "type": "business",
      "description": "Brand safety and advertiser-friendly content",
      "impact": "محدودیت در موضوعات حساس",
      "mitigation": "بررسی محتوا قبل از انتشار"
    }
  ]
}
```

---

## ۱۲. Content Types

### Video Types (بومی یوتیوب)

| نوع ویدئو              | توضیح                       | حداکثر طول | نسبت ابعاد |
| ---------------------- | --------------------------- | ---------- | ---------- |
| **Long-form Video**    | ویدئوی استاندارد بلند       | ۱۲ ساعت    | ۱۶:۹       |
| **Shorts**             | ویدئوی کوتاه عمودی          | ۶۰ ثانیه   | ۹:۱۶       |
| **Live Stream**        | پخش زنده                    | ۱۲ ساعت    | ۱۶:۹       |
| **Premiere**           | نمایش اولیه برنامه‌ریزی‌شده | ۱۲ ساعت    | ۱۶:۹       |
| **Members-only Video** | ویدئوی اختصاصی اعضا         | ۱۲ ساعت    | ۱۶:۹       |

### Content Pillars

| ستون محتوا              | درصد | توضیح                                                 |
| ----------------------- | ---- | ----------------------------------------------------- |
| **Educational Content** | ۳۵٪  | آموزش مفاهیم انرژی، فناوری، نوآوری — عمیق و ساختارمند |
| **Industry Analysis**   | ۲۵٪  | تحلیل روندها، رویدادها، تحولات صنعت در قالب ویدئو     |
| **Expert Interviews**   | ۱۵٪  | مصاحبه با متخصصان، مدیران و تحلیلگران صنعت            |
| **Brand & Culture**     | ۱۵٪  | مستند سازمانی، فرهنگ برند، داستان‌های Xennic          |
| **Shorts**              | ۱۰٪  | ویدئوهای کوتاه جذاب — تیزر، نکته، پرسش                |

---

## ۱۳. Content Strategy

### استراتژی محتوای یوتیوب

| فیلد                  | مقدار                                                                             |
| --------------------- | --------------------------------------------------------------------------------- |
| **Content Pillars**   | Educational, Industry Analysis, Expert Interviews, Brand & Culture, Shorts        |
| **Content Mix**       | Educational ۳۵٪, Analysis ۲۵٪, Interviews ۱۵٪, Brand ۱۵٪, Shorts ۱۰٪              |
| **Content Frequency** | ۱ ویدئوی بلند در هفته + ۲ Shorts در هفته                                          |
| **Best Times**        | پنجشنبه و جمعه ۱۰:۰۰-۱۲:۰۰ (به وقت تهران) — برای ویدئوهای بلند                    |
| **Content Sources**   | AI-generated ۴۰٪, Human-written ۴۰٪, Curated ۲۰٪                                  |
| **Repurpose Rules**   | محتوای Blog → فیلم‌نامه ویدئو; محتوای LinkedIn → موضوع Shorts; ویدئو → خلاصه Blog |

### اصول استراتژی

| اصل          | توضیح                                                                                    |
| ------------ | ---------------------------------------------------------------------------------------- |
| **CS-YT-01** | کیفیت ویدئو (محتوا + فنی) بر کمیت اولویت دارد — هر ویدئو باید ارزش مشخصی ارائه دهد       |
| **CS-YT-02** | Shorts به عنوان دروازه ورود به محتوای بلند — هر Shorts به یک ویدئوی بلند مرتبط لینک دارد |
| **CS-YT-03** | هر ویدئو باید Chapters (بخش‌بندی) داشته باشد — ناوبری آسان                               |
| **CS-YT-04** | محتوای تکراری از پلتفرم‌های دیگر در یوتیوب ممنوع — هر محتوا بومی‌سازی می‌شود             |
| **CS-YT-05** | لینک به Hub (Website/Blog) و ویدئوهای مرتبط در توضیحات الزامی است                        |

### بلوک JSON

```json
{
  "content_strategy": {
    "pillars": [
      "Educational",
      "Industry Analysis",
      "Expert Interviews",
      "Brand & Culture",
      "Shorts"
    ],
    "mix": {
      "educational": 35,
      "analysis": 25,
      "interviews": 15,
      "brand": 15,
      "shorts": 10
    },
    "frequency": {
      "per_week": "1 long-form + 2 Shorts",
      "per_month": "4 long-form + 8 Shorts",
      "best_times": ["Thursday 10:00", "Friday 10:00"],
      "timezone": "Asia/Tehran"
    },
    "sources": {
      "ai_generated": 40,
      "human_written": 40,
      "curated": 20
    }
  }
}
```

---

## ۱۴. Content Mapping

### نگاشت CT-ID به یوتیوب

| CT-ID                         | نسخه پلتفرم                | تغییرات لازم                    | مسئول تبدیل     |
| ----------------------------- | -------------------------- | ------------------------------- | --------------- |
| CT-002 (Educational Video)    | ویدئوی بلند کامل           | همان (مناسب برای یوتیوب)        | AI-007 (Video)  |
| CT-006 (Technical Analysis)   | ویدئوی تحلیلی + Chapters   | تبدیل متن به فیلم‌نامه ویدئویی  | AI-003 → AI-007 |
| CT-007 (Research Report)      | ویدئوی گزارش + اینفوگرافیک | استخراج ۳-۵ Insight کلیدی بصری  | AI-003 → AI-007 |
| CT-009 (Industry Insight)     | Shorts یا ویدئوی کوتاه     | خلاصه‌سازی به ≤ ۶۰ ثانیه        | AI-003 → AI-007 |
| CT-011 (Product Introduction) | ویدئوی معرفی محصول         | فیلم‌نامه + دموی تصویری         | AI-003 → AI-007 |
| CT-013 (Promotional Campaign) | ویدئوی تبلیغاتی            | تیزر + CTA در End Screen        | AI-007          |
| CT-014 (Tutorial)             | ویدئوی آموزشی کامل         | همان (مناسب برای یوتیوب)        | AI-007          |
| CT-015 (How-to Guide)         | ویدئوی آموزش گام‌به‌گام    | تقسیم به Chapters               | AI-007          |
| CT-022 (Webinar)              | لایو استریم یا Premiere    | برنامه‌ریزی + اعلام قبلی        | AI-007 + AI-014 |
| CT-025 (Case Study)           | ویدئوی مستند               | فیلم‌نامه + مصاحبه + تصویرسازی  | AI-003 → AI-007 |
| CT-029 (Event Announcement)   | Shorts یا Community Post   | اطلاعیه تصویری کوتاه            | AI-007          |
| CT-030 (Live Coverage)        | لایو استریم                | پخش زنده + ذخیره به عنوان ویدئو | AI-007          |
| CT-031 (Event Recap)          | ویدئوی خلاصه رویداد        | تدوین ۳-۷ دقیقه‌ای              | AI-007          |
| CT-033 (Best Practice)        | ویدئوی آموزشی              | همان (مناسب برای یوتیوب)        | AI-007          |
| CT-034 (Expert Interview)     | ویدئوی مصاحبه              | فیلم‌نامه سؤالات + تدوین        | AI-003 + AI-007 |
| CT-042 (Training Material)    | سری ویدئوهای آموزشی        | تقسیم به پلی‌لیست چندقسمتی      | AI-007          |

### CT-IDهای غیرمجاز در یوتیوب

| CT-ID                  | دلیل عدم تناسب                                  |
| ---------------------- | ----------------------------------------------- |
| CT-001 (Breaking News) | یوتیوب不适合 برای اخبار فوری → مناسب X/Twitter  |
| CT-005 (Short Opinion) | متن کوتاه → مناسب X/Twitter یا LinkedIn         |
| CT-016 (Poll)          | یوتیوب نظرسنجی بومی ندارد → Community Tab محدود |
| CT-024 (Infographic)   | تصویر ثابت → مناسب Instagram, LinkedIn          |
| CT-039 (Internal Memo) | محتوای داخلی → فقط Website / Telegram           |

---

## ۱۵. Publishing Model

### مدل انتشار یوتیوب

| فیلد                     | مقدار                                                                           |
| ------------------------ | ------------------------------------------------------------------------------- |
| **Publishing Workflow**  | AUT-005-PUB                                                                     |
| **Approval Chain**       | AI-004 (Review) → Human Approval (هر ویدئو) → AI-008 (Publish)                  |
| **Queue Priority**       | Priority Content (P0), Regular (P2)                                             |
| **Scheduling Rules**     | Long-form → برنامه‌ریزی (حداقل ۴۸ ساعت قبل), Shorts → برنامه‌ریزی (۲۴ ساعت قبل) |
| **Auto-publish Rules**   | Shorts با تأیید AI-004 → خودکار; Long-form → تأیید انسانی الزامی                |
| **Human Approval Gates** | همه ویدئوهای بلند, محتوای بحرانی, محتوای کمپین, اولین Shorts هفته               |

### بلوک JSON

```json
{
  "publishing_model": {
    "workflow_id": "AUT-005-PUB",
    "approval_chain": ["AI-004 Review", "Human Approval"],
    "queue_priority": "P0|P2",
    "auto_publish": {
      "enabled": true,
      "conditions": ["content_type == 'shorts'", "ai_review_passed", "not crisis_content"]
    },
    "human_gates": [
      "all_long_form_video",
      "crisis_content",
      "campaign_content",
      "first_shorts_weekly"
    ],
    "scheduling": {
      "best_times": ["Thursday 10:00", "Friday 10:00"],
      "timezone": "Asia/Tehran",
      "min_interval_days": 2
    }
  }
}
```

---

## ۱۶. Publishing Rules

### قواعد عمومی

| #     | قاعده                                                            | توضیح                  |
| ----- | ---------------------------------------------------------------- | ---------------------- |
| PR-01 | هر ویدئوی بلند باید حداقل ۵ دقیقه و حداکثر ۶۰ دقیقه باشد         | محدوده بهینه تعامل     |
| PR-02 | هر ویدئو باید Chapters (بخش‌بندی) داشته باشد                     | ناوبری و سئو           |
| PR-03 | Shorts حداکثر ۶۰ ثانیه و نسبت ۹:۱۶ عمودی                         | مطابق استاندارد یوتیوب |
| PR-04 | توضیحات ویدئو باید حداقل ۲۰۰ کلمه و شامل لینک به Hub باشد        | سئو و CTA              |
| PR-05 | عنوان ویدئو باید شامل کلمه کلیدی اصلی و حداکثر ۶۰ کاراکتر باشد   | سئو و CTR              |
| PR-06 | حداقل فاصله بین دو ویدئوی بلند ۲ روز (۴۸ ساعت)                   | جلوگیری از خستگی مخاطب |
| PR-07 | Shorts می‌تواند روزانه منتشر شود — حداکثر ۱ Shorts در روز        | تعادل محتوا            |
| PR-08 | هر ویدئو باید حداقل یک CTA (داخل ویدئو یا End Screen) داشته باشد | تعامل نهایی            |

### قواعد سئو

| #      | قاعده                                                                                    | توضیح |
| ------ | ---------------------------------------------------------------------------------------- | ----- |
| SEO-01 | عنوان: شامل کلمه کلیدی اصلی + ارزش پیشنهادی + حداکثر ۶۰ کاراکتر                          |
| SEO-02 | توضیحات: حداقل ۲۰۰ کلمه, شامل کلمات کلیدی, لینک‌ها, Chapters تایم‌استمپ                  |
| SEO-03 | برچسب‌ها (Tags): ۵-۱۵ برچسب مرتبط — اولویت با برچسب‌های پرجستجو و کم‌رقابت               |
| SEO-04 | Thumbnail: تصویر بندانگشتی اختصاصی, با متن و برند, رزولوشن ۱۲۸۰×۷۲۰                      |
| SEO-05 | زیرنویس (CC): زیرنویس فارسی + انگلیسی برای همه ویدئوهای بلند                             |
| SEO-06 | دسته‌بندی (Category): انتخاب دسته مرتبط از لیست یوتیوب (Science & Technology, Education) |
| SEO-07 | Playlist: هر ویدئو باید به یک پلی‌لیست مرتبط اضافه شود                                   |

### قواعد Shorts

| #     | قاعده                                                | توضیح |
| ----- | ---------------------------------------------------- | ----- |
| SH-01 | Shorts باید در ۳ ثانیه اول توجه مخاطب را جلب کند     |
| SH-02 | محتوای Shorts مستقل اما مرتبط با ویدئوهای بلند کانال |
| SH-03 | هر Shorts یک CTA برای ویدئوی بلند مرتبط دارد         |
| SH-04 | Shorts در پلی‌لیست جداگانه دسته‌بندی می‌شوند         |
| SH-05 | Shorts بدون زیرنویس فارسی ممنوع (دسترس‌پذیری)        |

---

## ۱۷. Post Types

### انواع محتوا در یوتیوب

| نوع                   | توضیح                          | CT-ID سازگار                   | فرکانس           |
| --------------------- | ------------------------------ | ------------------------------ | ---------------- |
| **Educational Video** | ویدئوی آموزشی عمیق با Chapters | CT-002, CT-014, CT-015, CT-033 | ۲ / ماه          |
| **Analysis Video**    | تحلیل روندها و رویدادها        | CT-006, CT-007, CT-009         | ۱ / ماه          |
| **Expert Interview**  | مصاحبه با متخصص                | CT-034                         | ۱ / ماه          |
| **Brand Documentary** | مستند برند و فرهنگ سازمانی     | CT-025, CT-031                 | ۱ / دو ماه       |
| **Product Video**     | معرفی و دموی محصول             | CT-011, CT-013                 | ۱ / ماه          |
| **Live Stream**       | پخش زنده رویداد                | CT-022, CT-030                 | به‌اندازه رویداد |
| **Shorts**            | ویدئوی کوتاه عمودی             | CT-009, CT-011, CT-029         | ۲ / هفته         |
| **Community Post**    | پست متنی/تصویری Community Tab  | CT-029, CT-016                 | ۱-۲ / هفته       |

---

## ۱۸. Visual Guidelines

### راهنمای بصری یوتیوب

| فیلد                         | مقدار                                                          |
| ---------------------------- | -------------------------------------------------------------- |
| **Aspect Ratio (Long-form)** | ۱۶:۹ (اجباری)                                                  |
| **Aspect Ratio (Shorts)**    | ۹:۱۶ (اجباری)                                                  |
| **Resolution (Minimum)**     | ۱۰۸۰p (Full HD) —推薦 4K                                       |
| **Resolution (Recommended)** | ۴K (2160p) برای محتوای اصلی                                    |
| **Frame Rate**               | ۲۴ fps (سینمایی) / ۳۰ fps (استاندارد) / ۶۰ fps (محتوای پرسرعت) |
| **Max File Size**            | ۲۵۶ GB                                                         |
| **Thumbnail Resolution**     | ۱۲۸۰×۷۲۰ pixels (minimum)                                      |
| **Thumbnail Format**         | JPG, PNG — حداکثر ۲ MB                                         |
| **Thumbnail Safe Zone**      | ۲۰٪ حاشیه امن — متن در مرکز ۶۰٪                                |
| **Brand Watermark**          | لوگوی Xennic در ۵ ثانیه اول و ۵ ثانیه آخر ویدئو                |
| **Color Profile**            | Rec. 709 (SDR) / Rec. 2020 (HDR) — مطابق BRD-001 §۱۴           |

### اصول بصری

| اصل           | توضیح                                                            |
| ------------- | ---------------------------------------------------------------- |
| **VIS-YT-01** | Thumbnail اختصاصی برای هر ویدئو — طراحی شده با هویت برند         |
| **VIS-YT-02** | متن روی Thumbnail خوانا در اندازه‌های کوچک (min ۳۰px font)       |
| **VIS-YT-03** | Lighting و کیفیت تصویر حرفه‌ای — تصاویر تار یا غیرحرفه‌ای ممنوع  |
| **VIS-YT-04** | موسیبی‌گراند بدون کپی‌رایت — از کتابخانه YouTube یا تولید اصلی   |
| **VIS-YT-05** | Subtitles و Caption برای دسترس‌پذیری در همه ویدئوهای بلند الزامی |

---

## ۱۹. Caption Guidelines

### راهنمای عنوان (Title) و توضیحات (Description)

| فیلد            | کلاس     | محدودیت        | توضیح                                |
| --------------- | -------- | -------------- | ------------------------------------ |
| **Title**       | Short    | ≤ ۶۰ کاراکتر   | شامل کلمه کلیدی اصلی + ارزش پیشنهادی |
| **Title**       | Medium   | ۶۰-۱۰۰ کاراکتر | برای ویدئوهای تحلیلی و مصاحبه        |
| **Description** | Standard | ≥ ۲۰۰ کلمه     | شامل کلمات کلیدی, لینک‌ها, Chapters  |
| **Description** | Rich     | ≥ ۵۰۰ کلمه     | برای محتوای آموزشی و مستند           |

### اصول عنوان

| اصل           | توضیح                                                                    |
| ------------- | ------------------------------------------------------------------------ |
| **CAP-YT-01** | عنوان باید در ۳ ثانیه اول ارزش ویدئو را به مخاطب بفهماند                 |
| **CAP-YT-02** | شامل عدد یا آمار (مثلاً "۵ تکنیک", "۳ مرحله") برای جذابیت بیشتر          |
| **CAP-YT-03** | کلمه کلیدی اصلی در ابتدای عنوان — نه انتها                               |
| **CAP-YT-04** | عنوان‌های Clickbait (اغراق‌آمیز و گمراه‌کننده) ممنوع                     |
| **CAP-YT-05** | زبان عنوان: فارسی روان برای مخاطب فارسی‌زبان — انگلیسی برای محتوای جهانی |

### اصول توضیحات

| اصل            | توضیح                                                   |
| -------------- | ------------------------------------------------------- |
| **DESC-YT-01** | پاراگراف اول (۲-۳ خط): خلاصه ویدئو شامل کلمه کلیدی اصلی |
| **DESC-YT-02** | Chapters با تایم‌استمپ در ابتدای توضیحات                |
| **DESC-YT-03** | لینک‌های مرتبط: Website, LinkedIn, Instagram, Telegram  |
| **DESC-YT-04** | CTA: اشتراک کانال, لایک, کامنت, زنگوله                  |
| **DESC-YT-05** | #Xennic در انتهای توضیحات به همراه ۲-۳ هشتگ مرتبط       |

---

## ۲۰. Hashtag Strategy

### سیستم هشتگ یوتیوب

| سطح           | تعداد | توضیح                                      | مثال                                 |
| ------------- | ----- | ------------------------------------------ | ------------------------------------ |
| **Brand**     | ۱     | هشتگ اختصاصی برند — در توضیحات همه ویدئوها | #Xennic                              |
| **Primary**   | ۲-۳   | هشتگ‌های اصلی موضوع ویدئو                  | #ArtificialIntelligence #CleanEnergy |
| **Secondary** | ۰-۲   | هشتگ‌های کمکی یا دسته‌بندی                 | #TechEducation #FutureOfEnergy       |

### قواعد هشتگ

| #     | قاعده                                                           | توضیح |
| ----- | --------------------------------------------------------------- | ----- |
| HT-01 | هشتگ در توضیحات ویدئو — نه در عنوان (مگر ضرورت)                 |
| HT-02 | حداکثر ۵ هشتگ در هر توضیحات                                     |
| HT-03 | #Xennic در توضیحات همه ویدئوها الزامی                           |
| HT-04 | هشتگ‌های بسیار عمومی (#love #fun) ممنوع — فقط هشتگ‌های مرتبط    |
| HT-05 | هشتگ‌های فارسی و انگلیسی مجاز — ترجیح با انگلیسی برای کشف جهانی |
| HT-06 | هشتگ‌های رقبا یا برندهای دیگر ممنوع                             |

---

## ۲۱. Community Model

### مدل اجتماع یوتیوب

| فیلد                   | مقدار                                                          |
| ---------------------- | -------------------------------------------------------------- |
| **Community Type**     | Public Channel + Memberships                                   |
| **Community Rules**    | رعایت قواعد YouTube + احترام متقابل + موضوعیت (انرژی و فناوری) |
| **Growth Strategy**    | Organic — سئو + Shorts + پلی‌لیست + همکاری با دیگر کانال‌ها    |
| **Moderation Team**    | AI-013 (Engagement) + Human Supervisor                         |
| **Onboarding Process** | خوش‌آمدگویی خودکار به مشترکین جدید از طریق Community Tab       |

### قواعد اجتماع

| #      | قاعده                                                | توضیح |
| ------ | ---------------------------------------------------- | ----- |
| COM-01 | پاسخ به کامنت‌های مرتبط در ۴۸ ساعت اول انتشار        |
| COM-02 | پین (Pin) کردن کامنت‌های مفید یا پرسش‌های مهم        |
| COM-03 | Community Tab برای اطلاع‌رسانی و نظرسنجی استفاده شود |
| COM-04 | Memberships (اعضا) برای محتوای اختصاصی در آینده      |
| COM-05 | Block و Report اسپم و کامنت‌های نامناسب              |
| COM-06 | Heart (لایک) کامنت‌های مثبت و سازنده                 |

---

## ۲۲. Engagement Model

### مدل تعامل یوتیوب

| فیلد                         | مقدار                                                                                                           |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Engagement Types**         | Like, Comment, Reply, Subscribe, Share, Save to Playlist                                                        |
| **Response Time SLA**        | < ۴۸ ساعت برای کامنت‌های عادی, < ۱۲ ساعت برای کامنت‌های پرسشی                                                   |
| **Tone Guidelines**          | [BRD-002 §۶](../../22-BRAND/20-brand-voice.md#۶-tone-matrix) — Tone Matrix برای Mode: Educational, Professional |
| **Escalation Path**          | AI-013 → Human (Content Manager) → Media Director                                                               |
| **AI Engagement Rules**      | AI-013 مجاز به پاسخ کامنت عادی — کامنت بحرانی به Human                                                          |
| **Human Intervention Rules** | توهین, اطلاعات نادرست, سؤال حقوقی, پیشنهاد همکاری                                                               |

### قواعد تعامل

| #     | قاعده                                                           | توضیح |
| ----- | --------------------------------------------------------------- | ----- |
| EN-01 | به همه کامنت‌های مرتبط (غیراسپم) پاسخ داده شود — حداکثر ۴۸ ساعت |
| EN-02 | پاسخ به کامنت‌های منفی با لحن حرفه‌ای و محترمانه — جدل ممنوع    |
| EN-03 | کامنت‌های آموزشی و پرسش‌های عمیق پین شوند                       |
| EN-04 | کامنت‌های تکراری (اسپم) حذف و کاربر ریپورت شود                  |
| EN-05 | پاسخ به کامنت‌ها با ذکر نام کاربر (برای شخصی‌سازی)              |

---

## ۲۳. Moderation Model

### مدل مدیریت محتوای نامناسب

| فیلد                    | مقدار                                                      |
| ----------------------- | ---------------------------------------------------------- |
| **Moderation Types**    | Post-moderation (Reactive) + فیلتر خودکار کلمات ممنوع      |
| **Prohibited Content**  | توهین, نفرت‌پراکنی, اسپم, اطلاعات نادرست, خشونت, لینک مخرب |
| **Spam Rules**          | AI-013 تشخیص اسپم (تکراری, لینک مخرب, رفتار رباتیک)        |
| **User Blocking Rules** | Block + Report برای اسپم و توهین شدید                      |
| **Reporting Process**   | گزارش به YouTube + گزارش داخلی به Content Manager          |
| **Appeal Process**      | اعتراض از طریق فرم تماس → بررسی توسط Human Supervisor      |

### قواعد مدیریت

| #      | قاعده                                                          | توضیح |
| ------ | -------------------------------------------------------------- | ----- |
| MOD-01 | اسپم → حذف + Report (AI خودکار)                                |
| MOD-02 | توهین خفیف → Hide User + هشدار (AI)                            |
| MOD-03 | توهین شدید → حذف کامنت + Block + Report + اطلاع Media Director |
| MOD-04 | اطلاعات نادرست → Reply تصحیح + لینک منبع (AI-013)              |
| MOD-05 | پیشنهاد همکاری → ارجاع به Human (Content Manager)              |

---

## ۲۴. Response Templates

### قالب‌های پاسخ استاندارد

| وضعیت                  | قالب پاسخ                                                                       | مسئول                  |
| ---------------------- | ------------------------------------------------------------------------------- | ---------------------- |
| **Thanks (Positive)**  | "از لطف شما سپاسگزاریم. خوشحالیم که این محتوا برایتان مفید بود."                | AI-013                 |
| **Question General**   | "پاسخ سؤال شما: [پاسخ]. پیشنهاد می‌کنیم ویدئو [link] را هم ببینید."             | AI-013                 |
| **Question Technical** | "سؤال تخصصی شما عالی است. پاسخ دقیق‌تر را در ویدئوی آینده پوشش خواهیم داد."     | AI-013 → Human         |
| **Suggestion**         | "پیشنهاد ارزشمند شما ثبت شد. برای ویدئوهای آینده بررسی خواهیم کرد."             | AI-013                 |
| **Complaint**          | "از بازخورد شما متشکریم. برای بررسی دقیق‌تر به [email] پیام دهید."              | AI-013 → Human         |
| **Misinformation**     | "با احترام، این نکته نیاز به اصلاح دارد: [تصحیح + منبع]. ممنون از توجه شما."    | AI-013                 |
| **Crisis**             | "از نگرانی شما عذرخواهی می‌کنیم. بیانیه رسمی در کانال‌های رسمی منتشر خواهد شد." | Human (Media Director) |
| **Collaboration**      | "از پیشنهاد همکاری شما سپاسگزاریم. لطفاً درخواست خود را به [email] ارسال کنید." | Human                  |
| **Spam/Hate**          | (بدون پاسخ — حذف کامنت + Block)                                                 | AI-013                 |

---

## ۲۵. AI Collaboration

### همکاری با عامل‌های هوشمند

| Agent ID            | نقش در پلتفرم               | سطح اختیار | ورودی                     | خروجی                        |
| ------------------- | --------------------------- | ---------- | ------------------------- | ---------------------------- |
| AI-001 (Research)   | تحقیق موضوعات ویدئویی و سئو | A-2        | Topic, Keyword            | Research Brief, Keyword List |
| AI-002 (Planning)   | برنامه‌ریزی تقویم انتشار    | A-2        | Content Calendar          | Schedule, Priority           |
| AI-003 (Writing)    | تولید فیلم‌نامه ویدئو       | A-2        | Research Brief, CT-ID     | Video Script                 |
| AI-004 (Review)     | بازبینی فیلم‌نامه و توضیحات | A-2        | Script, Description       | Approval / Revision          |
| AI-005 (Fact Check) | راستی‌آزمایی محتوای ویدئو   | A-2        | Script, Sources           | Fact Check Report            |
| AI-006 (Graphic)    | طراحی Thumbnail و گرافیک    | A-2        | Video Topic, Brand Assets | Thumbnail Design             |
| AI-007 (Video)      | تولید و تدوین ویدئو         | A-2        | Script, Assets            | Rendered Video               |
| AI-008 (Publishing) | انتشار و برنامه‌ریزی        | A-3        | Approved Video            | Publication                  |
| AI-009 (Monitoring) | نظارت بر عملکرد ویدئوها     | A-3        | Platform Data             | Alerts, Reports              |
| AI-010 (Analytics)  | تحلیل داده و بینش مخاطب     | A-2        | Metrics                   | Weekly Reports, Insights     |
| AI-011 (Knowledge)  | استخراج دانش از کامنت‌ها    | A-2        | Comments, Metrics         | Knowledge Objects            |
| AI-013 (Engagement) | تعامل با مخاطبان            | A-2        | Comment                   | Response                     |
| AI-014 (Scheduler)  | زمان‌بندی انتشار            | A-3        | Content Queue             | Schedule, Playlist           |

### بلوک JSON

```json
{
  "ai_collaboration": [
    {
      "agent_id": "AI-001",
      "agent_name": "Research Agent",
      "role": "تحقیق موضوعات و سئو",
      "authority_level": "A-2",
      "inputs": ["Topic", "Keyword"],
      "outputs": ["Research Brief", "Keyword List"],
      "human_oversight": false
    },
    {
      "agent_id": "AI-002",
      "agent_name": "Planning Agent",
      "role": "برنامه‌ریزی تقویم انتشار",
      "authority_level": "A-2",
      "inputs": ["Content Calendar"],
      "outputs": ["Schedule", "Priority"],
      "human_oversight": false
    },
    {
      "agent_id": "AI-003",
      "agent_name": "Writing Agent",
      "role": "تولید فیلم‌نامه ویدئو",
      "authority_level": "A-2",
      "inputs": ["Research Brief", "CT-ID"],
      "outputs": ["Video Script"],
      "human_oversight": false
    },
    {
      "agent_id": "AI-004",
      "agent_name": "Review Agent",
      "role": "بازبینی فیلم‌نامه و توضیحات",
      "authority_level": "A-2",
      "inputs": ["Script", "Description"],
      "outputs": ["Approval / Revision"],
      "human_oversight": false
    },
    {
      "agent_id": "AI-005",
      "agent_name": "Fact Check Agent",
      "role": "راستی‌آزمایی محتوای ویدئو",
      "authority_level": "A-2",
      "inputs": ["Script", "Sources"],
      "outputs": ["Fact Check Report"],
      "human_oversight": true
    },
    {
      "agent_id": "AI-006",
      "agent_name": "Graphic Agent",
      "role": "طراحی Thumbnail و گرافیک",
      "authority_level": "A-2",
      "inputs": ["Video Topic", "Brand Assets"],
      "outputs": ["Thumbnail Design"],
      "human_oversight": false
    },
    {
      "agent_id": "AI-007",
      "agent_name": "Video Agent",
      "role": "تولید و تدوین ویدئو",
      "authority_level": "A-2",
      "inputs": ["Script", "Assets"],
      "outputs": ["Rendered Video"],
      "human_oversight": true
    },
    {
      "agent_id": "AI-008",
      "agent_name": "Publishing Agent",
      "role": "انتشار و برنامه‌ریزی",
      "authority_level": "A-3",
      "inputs": ["Approved Video"],
      "outputs": ["Publication", "Schedule"],
      "human_oversight": false
    },
    {
      "agent_id": "AI-009",
      "agent_name": "Monitoring Agent",
      "role": "نظارت بر عملکرد ویدئوها",
      "authority_level": "A-3",
      "inputs": ["Platform Data"],
      "outputs": ["Alerts", "Reports"],
      "human_oversight": false
    },
    {
      "agent_id": "AI-010",
      "agent_name": "Analytics Agent",
      "role": "تحلیل داده و بینش مخاطب",
      "authority_level": "A-2",
      "inputs": ["Metrics"],
      "outputs": ["Weekly Reports", "Insights"],
      "human_oversight": false
    },
    {
      "agent_id": "AI-011",
      "agent_name": "Knowledge Agent",
      "role": "استخراج دانش از کامنت‌ها",
      "authority_level": "A-2",
      "inputs": ["Comments", "Metrics"],
      "outputs": ["Knowledge Objects"],
      "human_oversight": false
    },
    {
      "agent_id": "AI-013",
      "agent_name": "Engagement Agent",
      "role": "تعامل با مخاطبان",
      "authority_level": "A-2",
      "inputs": ["Comment"],
      "outputs": ["Response"],
      "human_oversight": false
    },
    {
      "agent_id": "AI-014",
      "agent_name": "Scheduler Agent",
      "role": "زمان‌بندی انتشار",
      "authority_level": "A-3",
      "inputs": ["Content Queue"],
      "outputs": ["Schedule", "Playlist"],
      "human_oversight": false
    }
  ]
}
```

---

## ۲۶. Automation Interfaces

### Workflowهای خودکار یوتیوب

| Workflow ID | وظیفه                               | Trigger            | فرکانس          |
| ----------- | ----------------------------------- | ------------------ | --------------- |
| AUT-005-PUB | انتشار و برنامه‌ریزی ویدئو          | Scheduled + Manual | هفتگی           |
| AUT-005-MON | مانیتورینگ عملکرد ویدئوها           | Scheduled          | روزانه          |
| AUT-005-RPT | گزارش‌گیری هفتگی                    | Scheduled          | هفتگی           |
| AUT-005-EXT | استخراج دانش از کامنت‌ها و متریک‌ها | Event-driven       | پس از هر انتشار |
| AUT-005-ENG | پاسخ خودکار به کامنت                | Event-driven       | پیوسته          |
| AUT-005-SEO | بهینه‌سازی سئوی ویدئو               | Manual + Scheduled | پس از انتشار    |
| AUT-005-SHR | تولید و انتشار Shorts               | Scheduled          | هفتگی           |

### بلوک JSON

```json
{
  "automation_interfaces": [
    {
      "workflow_id": "AUT-005-PUB",
      "task": "انتشار و برنامه‌ریزی ویدئو",
      "trigger": "schedule|manual",
      "frequency": "weekly",
      "inputs": ["Approved Video", "Schedule", "Thumbnail", "Description", "Tags"],
      "outputs": ["Published Video"],
      "error_handling": "retry|alert"
    },
    {
      "workflow_id": "AUT-005-MON",
      "task": "مانیتورینگ عملکرد ویدئوها",
      "trigger": "schedule",
      "frequency": "daily",
      "inputs": ["Platform Data", "Video Metrics"],
      "outputs": ["Performance Report", "Alert"],
      "error_handling": "alert"
    },
    {
      "workflow_id": "AUT-005-RPT",
      "task": "گزارش‌گیری هفتگی",
      "trigger": "schedule",
      "frequency": "weekly",
      "inputs": ["Weekly Metrics"],
      "outputs": ["Weekly Report"],
      "error_handling": "alert"
    },
    {
      "workflow_id": "AUT-005-EXT",
      "task": "استخراج دانش از کامنت‌ها و متریک‌ها",
      "trigger": "event",
      "frequency": "per publication",
      "inputs": ["Comments", "Metrics", "Viewer Data"],
      "outputs": ["Knowledge Object", "Insight"],
      "error_handling": "alert"
    },
    {
      "workflow_id": "AUT-005-ENG",
      "task": "پاسخ خودکار به کامنت",
      "trigger": "event",
      "frequency": "continuous",
      "inputs": ["Comment", "Context"],
      "outputs": ["Response", "Escalation"],
      "error_handling": "escalate"
    },
    {
      "workflow_id": "AUT-005-SEO",
      "task": "بهینه‌سازی سئوی ویدئو",
      "trigger": "manual|schedule",
      "frequency": "per video",
      "inputs": ["Video Metadata", "Keyword Research"],
      "outputs": ["Optimized Title", "Optimized Description", "Tags"],
      "error_handling": "alert"
    },
    {
      "workflow_id": "AUT-005-SHR",
      "task": "تولید و انتشار Shorts",
      "trigger": "schedule",
      "frequency": "weekly",
      "inputs": ["Content Brief", "Long-form Video"],
      "outputs": ["Shorts Video"],
      "error_handling": "retry|alert"
    }
  ]
}
```

---

## ۲۷. Workflow References

### ارجاع به گردش کارها (از AUT-\*)

| Workflow ID | وظیفه               | Trigger            | خروجی اصلی         |
| ----------- | ------------------- | ------------------ | ------------------ |
| AUT-005-PUB | انتشار خودکار ویدئو | Scheduled + Manual | Video Published    |
| AUT-005-MON | مانیتورینگ روزانه   | Scheduled (daily)  | Performance Report |
| AUT-005-RPT | گزارش هفتگی         | Scheduled (weekly) | Weekly Report      |
| AUT-005-EXT | استخراج دانش        | Event-driven       | Knowledge Object   |
| AUT-005-ENG | تعامل خودکار        | Event-driven       | Reply / Escalation |
| AUT-005-SEO | بهینه‌سازی سئو      | Manual             | Optimized Metadata |
| AUT-005-SHR | تولید Shorts        | Scheduled (weekly) | Shorts Video       |

### Agent IDs

```json
{
  "agent_ids": {
    "research": "AI-001",
    "planner": "AI-002",
    "writer": "AI-003",
    "reviewer": "AI-004",
    "fact_checker": "AI-005",
    "graphic": "AI-006",
    "video": "AI-007",
    "publisher": "AI-008",
    "monitor": "AI-009",
    "analytics": "AI-010",
    "knowledge": "AI-011",
    "engagement": "AI-013",
    "scheduler": "AI-014"
  }
}
```

---

## ۲۸. Machine Readable Blocks

### بلوک اصلی

```json
{
  "plat_metadata": {
    "doc_id": "PLAT-005",
    "version": "1.0.0-draft",
    "status": "draft",
    "updated": "2026-06-27",
    "owner": "مدیر پلتفرم یوتیوب",
    "upstream": ["PLAT-000", "ARCH-020"],
    "downstream": [
      "AUT-005-*",
      "AI-001",
      "AI-002",
      "AI-003",
      "AI-004",
      "AI-005",
      "AI-006",
      "AI-007",
      "AI-008",
      "AI-009",
      "AI-010",
      "AI-011",
      "AI-013",
      "AI-014"
    ]
  }
}
```

### Workflow IDs

```json
{
  "workflow_ids": {
    "publish": "AUT-005-PUB",
    "monitor": "AUT-005-MON",
    "report": "AUT-005-RPT",
    "extract": "AUT-005-EXT",
    "engage": "AUT-005-ENG",
    "seo": "AUT-005-SEO",
    "shorts": "AUT-005-SHR"
  }
}
```

### Automation IDs

```json
{
  "automation_ids": {
    "content_pipeline": "AUT-005-001",
    "monitoring_pipeline": "AUT-005-002",
    "reporting_pipeline": "AUT-005-003",
    "seo_pipeline": "AUT-005-004",
    "engagement_pipeline": "AUT-005-005",
    "knowledge_pipeline": "AUT-005-006"
  }
}
```

### Object IDs

```json
{
  "object_ids": {
    "platform": "OBJ-010",
    "account": "OBJ-019",
    "audience": "OBJ-012",
    "content_piece": "OBJ-004",
    "platform_version": "OBJ-005",
    "asset": "OBJ-007",
    "publication": "OBJ-022",
    "metric": "OBJ-017"
  }
}
```

### Prompt IDs

```json
{
  "prompt_ids": {
    "content_creation": "PRM-005-CC",
    "script_generation": "PRM-005-SG",
    "caption_generation": "PRM-005-CG",
    "seo_optimization": "PRM-005-SO",
    "engagement_reply": "PRM-005-ER",
    "analytics_report": "PRM-005-AR",
    "shorts_creation": "PRM-005-SC"
  }
}
```

### Decision IDs

```json
{
  "decision_ids": {
    "publish_approval": "DEC-PLAT-005-001",
    "content_rejection": "DEC-PLAT-005-002",
    "engagement_escalation": "DEC-PLAT-005-003",
    "moderation_action": "DEC-PLAT-005-004",
    "seo_optimization": "DEC-PLAT-005-005",
    "shorts_approval": "DEC-PLAT-005-006"
  }
}
```

### KPI IDs

```json
{
  "kpi_ids": {
    "views": "KPI-PLAT-005-01",
    "watch_time": "KPI-PLAT-005-02",
    "retention": "KPI-PLAT-005-03",
    "subscriber_growth": "KPI-PLAT-005-04",
    "engagement_rate": "KPI-PLAT-005-05",
    "avg_view_duration": "KPI-PLAT-005-06",
    "ctr": "KPI-PLAT-005-07",
    "shorts_views": "KPI-PLAT-005-08",
    "audience_insights": "KPI-PLAT-005-09",
    "publishing_consistency": "KPI-PLAT-005-10"
  }
}
```

### Event IDs

```json
{
  "event_ids": {
    "content_published": "EVT-PLAT-005-001",
    "content_failed": "EVT-PLAT-005-002",
    "threshold_breached": "EVT-PLAT-005-003",
    "engagement_alert": "EVT-PLAT-005-004",
    "moderation_flag": "EVT-PLAT-005-005",
    "seo_opportunity": "EVT-PLAT-005-006",
    "knowledge_extracted": "EVT-PLAT-005-007",
    "shorts_generated": "EVT-PLAT-005-008"
  }
}
```

### State IDs

```json
{
  "state_ids": {
    "platform_active": "STATE-PLAT-005-01",
    "platform_paused": "STATE-PLAT-005-02",
    "platform_error": "STATE-PLAT-005-03",
    "platform_maintenance": "STATE-PLAT-005-04",
    "platform_deprecated": "STATE-PLAT-005-05"
  }
}
```

---

## ۲۹. Decision Tables

### Publishing Decisions

| وضعیت                | شرط                                     | تصمیم                              | مسئول                            | زمان               |
| -------------------- | --------------------------------------- | ---------------------------------- | -------------------------------- | ------------------ |
| Long-form Video      | Script AI-004 Approved + Human Approved | انتشار برنامه‌ریزی‌شده             | AI-003 → AI-004 → Human → AI-008 | < ۴۸ ساعت از تأیید |
| Shorts               | Script + Visuals AI-004 Approved        | انتشار خودکار                      | AI-003 → AI-004 → AI-008         | < ۲۴ ساعت          |
| Live Stream          | Event Confirmed + Technical Check       | برنامه‌ریزی + اعلام                | AI-014 + Human                   | ۱ هفته قبل         |
| Crisis Content       | CT-036~038                              | تأیید Media Director + Hold انتشار | Human (MD)                       | < ۳۰ دقیقه         |
| First Video of Month | Any Type                                | تأیید انسانی اضافی                 | Human (Content Manager)          | < ۴۸ ساعت          |

### Engagement Escalation

| وضعیت          | شرط                  | تصمیم                  | مسئول                    | زمان      |
| -------------- | -------------------- | ---------------------- | ------------------------ | --------- |
| کامنت معمولی   | Positive or Neutral  | پاسخ با Template       | AI-013                   | < ۴۸ ساعت |
| کامنت پرسشی    | Contains Question    | پاسخ + لینک مرتبط      | AI-013                   | < ۲۴ ساعت |
| کامنت بحرانی   | توهین, تهدید, بحران  | ارتقا به L3            | AI-013 → Content Manager | فوری      |
| سؤال تخصصی     | نیاز به تحقیق        | پاسخ با Research Agent | AI-013 + AI-001          | < ۷۲ ساعت |
| پیشنهاد همکاری | Collaboration intent | ارجاع به Human         | AI-013 → Human           | < ۴۸ ساعت |

### Moderation Decisions

| وضعیت          | شرط           | تصمیم                   | مسئول                    | زمان       |
| -------------- | ------------- | ----------------------- | ------------------------ | ---------- |
| اسپم           | تکراری + لینک | حذف + Report (خودکار)   | AI-013                   | فوری       |
| توهین خفیف     | کلمات ممنوع   | Hide + هشدار            | AI-013                   | فوری       |
| توهین شدید     | توهین مستقیم  | Block + Report + Alert  | AI-013 → Content Manager | فوری       |
| اطلاعات نادرست | ادعای ناصحیح  | Reply تصحیح + لینک منبع | AI-013                   | < ۳۰ دقیقه |
| پیشنهاد مفید   | ایده سازنده   | Pin + تشکر              | AI-013                   | < ۲۴ ساعت  |

### SEO Optimization

| وضعیت         | شرط                  | تصمیم                              | مسئول           | زمان               |
| ------------- | -------------------- | ---------------------------------- | --------------- | ------------------ |
| Low CTR       | CTR < ۳٪             | بهینه‌سازی عنوان + Thumbnail       | AI-010 → AI-006 | < ۲۴ ساعت          |
| Low Retention | Retention < ۳۰٪      | تحلیل Chapters + بهبود ویدئوی بعدی | AI-010          | قبل از ویدئوی بعدی |
| Low Discovery | Impressions < ۱K/day | بهینه‌سازی Tags + Description      | AI-010 + Human  | < ۴۸ ساعت          |

---

## ۳۰. Validation Rules

### قواعد عمومی (از PLAT-000 — همه الزامی)

تمام ۳۵ قاعده VAL-001 تا VAL-035 از [PLAT-000 §۲۵](../00-platform-playbook-standard.md#۲۵-validation-rules) برای PLAT-005 الزامی است.

### قواعد اختصاصی یوتیوب

| #         | قاعده                                                    | توضیح                      | نوع |
| --------- | -------------------------------------------------------- | -------------------------- | --- |
| VAL-YT-01 | همه ویدئوها باید CT-ID معتبر از لیست سازگار داشته باشند  | invalid_ct_for_platform    |
| VAL-YT-02 | نسبت ابعاد ویدئوی بلند = ۱۶:۹ و Shorts = ۹:۱۶            | invalid_aspect_ratio       |
| VAL-YT-03 | رزولوشن ≥ ۱۰۸۰p برای ویدئوهای بلند                       | invalid_resolution         |
| VAL-YT-04 | توضیحات ≥ ۲۰۰ کلمه و شامل لینک به Hub                    | missing_description_length |
| VAL-YT-05 | عنوان ≤ ۶۰ کاراکتر و شامل کلمه کلیدی اصلی                | invalid_title_length       |
| VAL-YT-06 | Thumbnail اختصاصی ≥ ۱۲۸۰×۷۲۰ و ≤ ۲MB                     | invalid_thumbnail          |
| VAL-YT-07 | هر ویدئوی بلند باید Chapters داشته باشد                  | missing_chapters           |
| VAL-YT-08 | زیرنویس فارسی + انگلیسی برای ویدئوهای بلند الزامی        | missing_subtitles          |
| VAL-YT-09 | هشتگ ≥ ۱ و ≤ ۵ در توضیحات                                | invalid_hashtag_count      |
| VAL-YT-10 | #Xennic در توضیحات همه ویدئوها الزامی                    | missing_branded_hashtag    |
| VAL-YT-11 | Shorts ≤ ۶۰ ثانیه و نسبت ۹:۱۶                            | invalid_shorts_spec        |
| VAL-YT-12 | Brand Watermark در ۵ ثانیه اول و آخر ویدئو               | missing_brand_watermark    |
| VAL-YT-13 | موسیقی بدون کپی‌رایت — از کتابخانه YouTube یا تولید اصلی | copyright_audio            |
| VAL-YT-14 | لینک به Hub و ویدئوهای مرتبط در توضیحات                  | missing_related_links      |
| VAL-YT-15 | CTA در End Screen یا Cards الزامی                        | missing_cta                |

---

## ۳۱. Quality Gates

### گیت‌های کیفیت (از PLAT-000 — همه الزامی)

تمام ۷ گیت کیفیت از [PLAT-000 §۳۰](../00-platform-playbook-standard.md#۳۰-quality-gates) برای PLAT-005 الزامی است:
۱. Architecture Review
۲. Brand Review
۳. Editorial Review
۴. Governance Review
۵. Automation Review
۶. AI Review
۷. Compliance Review

### گیت‌های اختصاصی یوتیوب

| #   | گیت                       | مسئول               | معیارها                                                                               | خروجی                  |
| --- | ------------------------- | ------------------- | ------------------------------------------------------------------------------------- | ---------------------- |
| ۱   | **Video Quality Gate**    | AI-004 + Human      | Resolution ≥ 1080p, Aspect ratio 16:9, Audio quality, Lighting, Brand watermark       | تأیید کیفیت فنی ویدئو  |
| ۲   | **SEO Gate**              | AI-004 + AI-010     | Title optimization, Description ≥ 200 words, Tags (5-15), Thumbnail quality, Chapters | تأیید بهینه‌سازی سئو   |
| ۳   | **Content Accuracy Gate** | AI-005 (Fact Check) | Source verification, Data accuracy, Claim validation, Fact check passed               | تأیید صحت محتوا        |
| ۴   | **Shorts Gate**           | AI-004              | Duration ≤ 60s, Aspect ratio 9:16, Hook in first 3s, CTA for long-form                | تأیید استاندارد Shorts |
| ۵   | **Accessibility Gate**    | AI-004              | Subtitles (FA+EN), Chapters, Readable thumbnail text                                  | تأیید دسترس‌پذیری      |
| ۶   | **Brand Gate**            | AI-004              | Brand watermark, Color profile, Logo usage, Tone alignment with BRD-002               | تأیید تطابق برند       |

---

## ۳۲. Compliance Checklist

### چک‌لیست عمومی (از PLAT-000 — همه الزامی)

تمام ۲۳ آیتم C-01 تا C-23 از [PLAT-000 §۳۱](../00-platform-playbook-standard.md#۳۱-compliance-checklist) برای PLAT-005 الزامی است.

### چک‌لیست اختصاصی یوتیوب

| #       | مورد                                                              | تأیید |
| ------- | ----------------------------------------------------------------- | ----- |
| C-YT-01 | همه CT-IDهای استفاده‌شده در لیست سازگار با یوتیوب هستند           | □     |
| C-YT-02 | Visual Guidelines با BRD-001 مطابقت دارد                          | □     |
| C-YT-03 | Title و Description Guidelines با BRD-002 مطابقت دارد             | □     |
| C-YT-04 | Hashtag Strategy شامل #Xennic است                                 | □     |
| C-YT-05 | AI Agent Mapping کامل و دقیق است (۱۳ Agent)                       | □     |
| C-YT-06 | همه Video Types تعریف شده‌اند (Long-form, Shorts, Live, Premiere) | □     |
| C-YT-07 | Automation Interfaces به AUT-\*های معتبر ارجاع می‌دهند            | □     |
| C-YT-08 | Video Quality Gate تعریف شده است                                  | □     |
| C-YT-09 | SEO Pipeline تعریف شده است                                        | □     |
| C-YT-10 | هیچ محتوای استراتژیک از ARCH-020 تکرار نشده است                   | □     |
| C-YT-11 | هیچ تعریف CT-ID از EDT-002 تکرار نشده است                         | □     |
| C-YT-12 | Shorts Strategy تعریف و مستند شده است                             | □     |
| C-YT-13 | Response Templates برای همه وضعیت‌ها تعریف شده است                | □     |
| C-YT-14 | Chapters و Subtitles برای ویدئوهای بلند الزامی شده است            | □     |

---

## ۳۳. Change Log

| نسخه        | تاریخ      | تغییر                                                   | توسط               |
| ----------- | ---------- | ------------------------------------------------------- | ------------------ |
| ۱.۰.۰-draft | 2026-06-27 | انتشار اولیه — کتابچه عملیاتی YouTube با نقش Video (P2) | مدیر پلتفرم یوتیوب |

---

## ۳۴. Reading Guide

### راهنمای خواندن این سند

| مخاطب                         | بخش‌های کلیدی    | اقدام                               |
| ----------------------------- | ---------------- | ----------------------------------- |
| **مدیر پلتفرم یوتیوب**        | ۱-۱۱, ۳۰-۳۲      | مدیریت روزانه کانال یوتیوب          |
| **تولیدکننده محتوای ویدئویی** | ۱۲-۱۷, ۱۹-۲۰, ۳۱ | تولید محتوای ویدئویی مطابق با قواعد |
| **تدوین‌گر ویدئو**            | ۱۸, ۳۱           | رعایت استانداردهای فنی و بصری       |
| **AI Agent Developer**        | ۲۵, ۲۶, ۲۷, ۲۸   | پیاده‌سازی Agentها برای یوتیوب      |
| **مهندس اتوماسیون**           | ۲۶, ۲۷           | پیاده‌سازی Workflowهای n8n          |
| **مدیر برند**                 | ۴, ۱۸-۲۰, ۳۱     | تطابق با برند                       |
| **متخصص سئو**                 | ۱۶ (SEO), ۲۰, ۳۱ | بهینه‌سازی سئوی ویدئوها             |
| **AI Agents**                 | ۲۴, ۲۵, ۲۸, ۲۹   | اجرای فرایندهای خودکار              |

### مسیر خواندن وابسته

```
برای درک کامل کتابچه YouTube:
1. [PLAT-000](../00-platform-playbook-standard.md) — قالب مادر کتابچه پلتفرم
2. [ARCH-020](../../00-ARCHITECTURE/20-enterprise-multi-platform-strategy.md) — استراتژی چندپلتفرمی
3. [BRD-001](../../22-BRAND/10-brand-identity.md) — هویت برند Xennic
4. [BRD-002](../../22-BRAND/20-brand-voice.md) — معماری صدای برند
5. [EDT-002](../../24-EDITORIAL/20-content-taxonomy.md) — طبقه‌بندی محتوا
6. PLAT-005 (این سند) — کتابچه YouTube
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر        | توسط               |
| ----------- | ---------- | ------------ | ------------------ |
| ۱.۰.۰-draft | 2026-06-27 | انتشار اولیه | مدیر پلتفرم یوتیوب |
