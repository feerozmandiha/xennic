# ایکس / توییتر — X / Twitter Playbook

> **شناسه:** PLAT-004
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-27
> **مسئول:** مدیر پلتفرم ایکس
> **وابستگی:** [PLAT-000](../00-platform-playbook-standard.md), [ARCH-020](../../00-ARCHITECTURE/20-enterprise-multi-platform-strategy.md)
> **مخاطب:** human, agent, n8n, mcp

---

## Architectural Dependencies

### Why This Document Exists

هر کتابچه پلتفرم SMOS باید از PLAT-000 پیروی کند. PLAT-004 این ساختار را برای پلتفرم X/Twitter پیاده‌سازی می‌کند و قواعد عملیاتی مختص ایکس را به عنوان SSOT تعریف می‌کند. بدون این سند:

- Agentها نمی‌دانند چه محتوای خبری در ایکس منتشر کنند
- سرعت انتشار (مزیت اصلی ایکس) از دست می‌رود — محتوای خبری نیازمند سرعت است
- قواعد Thread، هشتگ و تعامل ناپایدار و وابسته به افراد خواهند بود
- دانش استخراج‌شده از روندها و بحث‌های ایکس به سیستم بازنمی‌گردد

### Problems It Solves

1. **نبود SSOT برای ایکس**: هر تیم برداشت متفاوتی از قواعد ایکس دارد → PLAT-004 به عنوان تنها مرجع معتبر
2. **از دست رفتن سرعت خبری**: محتوای خبری بدون فرایند استاندارد遲 منتشر می‌شود → News Pipeline با اولویت فوری
3. **نبود استراتژی Thread**: تهدهای بی‌ساختار و بدون هدف → Thread Architecture استاندارد
4. **نبود استراتژی هشتگ**: هشتگ‌های تصادفی و بدون بهره‌وری → سیستم هشتگ Trend-aware
5. **عدم هماهنگی AI**: Agentها نمی‌دانند در ایکس چگونه عمل کنند → AI Collaboration با قواعد مشخص
6. **از دست دادن Trend Intelligence**: روندهای ایکس به دانش سازمانی تبدیل نمی‌شود → Trend Monitoring با Knowledge Capture

### Explicit Scope

این سند فقط تعریف می‌کند:

- هویت و مأموریت ایکس در SMOS (برگرفته از [ARCH-020](../../00-ARCHITECTURE/20-enterprise-multi-platform-strategy.md))
- انواع محتوای خبری قابل انتشار (برگرفته از [EDT-002](../../24-EDITORIAL/20-content-taxonomy.md))
- قواعد عملیاتی انتشار، Thread، هشتگ و تعامل مختص ایکس
- همکاری با Agentها و رابط‌های خودکارسازی (برگرفته از [ARCH-013](../../00-ARCHITECTURE/13-ai-operating-model.md))
- KPIها و متریک‌های مختص ایکس

### Explicit Non-Scope

این سند هرگز شامل موارد زیر نیست:

- استراتژی چندپلتفرمی (به [ARCH-020](../../00-ARCHITECTURE/20-enterprise-multi-platform-strategy.md) مراجعه کنید)
- هویت برند، صدا و شخصیت برند (به [BRD-001](../../22-BRAND/10-brand-identity.md) مراجعه کنید)
- معماری صدای برند و لحن (به [BRD-002](../../22-BRAND/20-brand-voice.md) مراجعه کنید)
- انواع محتوا و تعریف CT-IDها (به [EDT-002](../../24-EDITORIAL/20-content-taxonomy.md) مراجعه کنید)
- کد API یا اسکریپت‌های اجرایی (به [AUT-\*](../../30-AUTOMATION/) مراجعه کنید)
- چرخه حیات محتوا و کیفیت (به [EDT-001](../../24-EDITORIAL/10-content-guidelines.md) مراجعه کنید)
- قواعد برند برای Agentها (به [BRD-001 §۲۱](../../22-BRAND/10-brand-identity.md) مراجعه کنید)

### Upstream Dependencies

| سند                                                                        | نوع وابستگی  | دلیل                                        |
| -------------------------------------------------------------------------- | ------------ | ------------------------------------------- |
| [PLAT-000](../00-platform-playbook-standard.md)                            | derived-from | قالب ساختار ۳۴ بخشی                         |
| [ARCH-020](../../00-ARCHITECTURE/20-enterprise-multi-platform-strategy.md) | depends-on   | نقش استراتژیک، طبقه‌بندی، اولویت            |
| [CON-000](../../05-CONSTITUTION/00-constitution.md)                        | governs      | اصول یکپارچگی، کیفیت، حاکمیت                |
| [BRD-001](../../22-BRAND/10-brand-identity.md)                             | depends-on   | هویت برند، صدا، لحن، فلسفه بصری             |
| [BRD-002](../../22-BRAND/20-brand-voice.md)                                | depends-on   | معماری صدا، لحن، Tone Matrix                |
| [EDT-001](../../24-EDITORIAL/10-content-guidelines.md)                     | depends-on   | چرخه حیات محتوا، کیفیت                      |
| [EDT-002](../../24-EDITORIAL/20-content-taxonomy.md)                       | depends-on   | شناسه‌های CT-ID، طبقه‌بندی محتوا            |
| [ARCH-013](../../00-ARCHITECTURE/13-ai-operating-model.md)                 | depends-on   | Agentهای Publishing, Engagement, Monitoring |
| [GOV-001](../../10-GOVERNANCE/01-documentation-standards.md)               | follows      | استاندارد نگارش سند                         |
| [GOV-003](../../10-GOVERNANCE/03-naming-conventions.md)                    | follows      | قراردادهای نام‌گذاری شناسه‌ها               |
| [GOV-004](../../10-GOVERNANCE/04-cross-references.md)                      | follows      | نظام ارجاع متقابل                           |

### Downstream Dependencies

| سند                            | نوع وابستگی | دلیل                                               |
| ------------------------------ | ----------- | -------------------------------------------------- |
| [AUT-\*](../../30-AUTOMATION/) | implements  | گردش کارهای انتشار، مانیتورینگ، Trend Detection    |
| [AI-\*](../../40-AI-AGENTS/)   | implements  | Agentهای Research, Writing, Engagement, Monitoring |
| [PRM-\*](../../35-PROMPTS/)    | implements  | پرامپت‌های تولید محتوای خبری ایکس                  |
| [MET-\*](../../60-METRICS/)    | measures    | KPIهای عملکرد ایکس                                 |

### SSOT Ownership

| موضوع                         | SSOT                   |
| ----------------------------- | ---------------------- |
| X/Twitter-specific Rules      | **PLAT-004** (این سند) |
| X/Twitter Content Mapping     | **PLAT-004** (این سند) |
| X/Twitter Post Types          | **PLAT-004** (این سند) |
| X/Twitter Hashtag Strategy    | **PLAT-004** (این سند) |
| X/Twitter Engagement Rules    | **PLAT-004** (این سند) |
| X/Twitter Thread Architecture | **PLAT-004** (این سند) |
| X/Twitter News Pipeline       | **PLAT-004** (این سند) |
| Brand Visual Philosophy       | BRD-001                |
| Brand Voice Architecture      | BRD-002                |
| Content Type Definitions      | EDT-002                |
| Multi-Platform Strategy       | ARCH-020               |
| Platform Playbook Structure   | PLAT-000               |

### Related ADRs

| ADR     | عنوان                             | ارتباط                            |
| ------- | --------------------------------- | --------------------------------- |
| ADR-010 | معماری متا به عنوان الگوی عملیاتی | لایه Distribution (ایکس)          |
| ADR-013 | جداسازی Automation و Agent        | ایکس توسط Automation توزیع می‌شود |
| ADR-015 | تأیید انسانی برای انتشار الزامی   | گیت‌های تأیید در ایکس             |
| ADR-019 | حکمرانی ۱۰ لایه                   | لایه Platform در حکمرانی ایکس     |

### Related Objects (from ARCH-011)

Platform (OBJ-010), Account (OBJ-019), Audience (OBJ-012), Persona (OBJ-011), Platform Version (OBJ-005), Content Variant (OBJ-006), Publication (OBJ-022), Metric (OBJ-017), Trend (OBJ-020), Event (OBJ-021)

### Related AI Agents (from ARCH-013)

Orchestrator (000), Research (001), Planning (002), Writing (003), Review (004), Fact Check (005), Publishing (008), Monitoring (009), Analytics (010), Knowledge (011), Engagement (013), Scheduler (014)

---

## ۱. Executive Summary

PLAT-004 کتابچه عملیاتی پلتفرم **X / Twitter** در SMOS است. ایکس با نقش **News (خبر)** و اولویت **P2** به عنوان کانال اصلی انتشار اخبار صنعت، رویدادها، بیانیه‌های رسمی و روندهای فناوری در اکوسیستم SMOS عمل می‌کند.

ایکس سریع‌ترین پلتفرم SMOS است — محتوای خبری در اینجا با حداکثر سرعت و حداقل اصطکاک منتشر می‌شود. مزیت اصلی ایکس **سرعت** است: breaking news, live coverage, real-time engagement.

این سند شامل ۳۴ بخش است که همه جنبه‌های عملیاتی ایکس را پوشش می‌دهد: از هویت و مأموریت تا قواعد انتشار، مدل تعامل، همکاری با Agentها و بلوک‌های ماشین‌خوان.

---

## ۲. Purpose

### اهداف PLAT-004

1. **تعریف نقش خبری ایکس**: ایکس به عنوان News Hub سازمانی — SSOT برای انتشار اخبار فوری
2. **سرعت بدون هرج‌ومرج**: انتشار سریع با حفظ کیفیت و تطابق برند
3. **یکپارچگی با برند**: همه پست‌ها و تهدها با BRD-001 و BRD-002 هماهنگ هستند
4. **بهره‌وری از Trend**: روندهای ایکس شناسایی، تحلیل و به دانش سازمانی تبدیل می‌شوند
5. **همکاری هوشمند**: Agentها و انسان‌ها در یک چارچوب مشخص در ایکس همکاری می‌کنند

### اصول PLAT-004

| اصل       | توضیح                                                                       |
| --------- | --------------------------------------------------------------------------- |
| **TW-01** | سرعت اولویت دارد — اما نه به قیمت صحت و دقت                                 |
| **TW-02** | هر پست یک CTA دارد — حتی اگر فقط "لینک به Hub" باشد                         |
| **TW-03** | Threadها مقالات کوتاه هستند — ساختارمند و قابل اسکن                         |
| **TW-04** | تعامل (Reply, Retweet, Quote) بخشی از استراتژی خبری است                     |
| **TW-05** | Trendها رصد می‌شوند — اما برند از Trendهای نامناسب پیروی نمی‌کند            |
| **TW-06** | Crisis protocol در ایکس اولویت مطلق دارد — هر تأخیر بحران را عمیق‌تر می‌کند |

---

## ۳. Scope

### دامنه شمول

| پلتفرم           | شناسه    | دامنه                                                                 |
| ---------------- | -------- | --------------------------------------------------------------------- |
| X / Twitter      | PLAT-004 | حساب رسمی Xennic — انتشار اخبار، تهدهای تحلیلی، بیانیه‌ها، تعامل خبری |
| X Premium (Blue) | PLAT-004 | قواعد مربوط به قابلیت‌های Premium (پست بلندتر, Priority Ranking)      |

### دامنه عدم شمول

- حساب‌های شخصی تیم Xennic
- تبلیغات پولی (X Ads) — مگر در کمپین‌های خاص با تأیید Media Director
- X Spaces (صدای زنده) — مگر برای رویدادهای خاص با PLAT-004 Update
- X Shopping — خارج از دامنه فعلی SMOS

---

## ۴. Platform Identity

### هویت پلتفرم

| فیلد                   | مقدار                                               |
| ---------------------- | --------------------------------------------------- |
| **Platform ID**        | PLAT-004                                            |
| **Platform Name (FA)** | ایکس / توییتر                                       |
| **Platform Name (EN)** | X / Twitter                                         |
| **Owner Company**      | X Corp. (formerly Twitter, Inc.)                    |
| **Platform Category**  | Third-Party                                         |
| **Platform Role**      | News                                                |
| **Platform Priority**  | P2                                                  |
| **API Type**           | REST API (Twitter API v2)                           |
| **API Version**        | v2 (with v1.1 legacy endpoints)                     |
| **Authentication**     | OAuth 2.0 (PKCE) + Bearer Token                     |
| **Rate Limits**        | 300 POST / 15-min per user; 500K tweets/day per app |

### بلوک JSON

```json
{
  "platform_identity": {
    "id": "PLAT-004",
    "name_fa": "ایکس / توییتر",
    "name_en": "X / Twitter",
    "owner": "X Corp.",
    "category": "Third-Party",
    "role": "News",
    "priority": "P2",
    "api": {
      "type": "REST API",
      "version": "v2",
      "auth": "OAuth 2.0",
      "rate_limits": "300 POST/15min per user"
    }
  }
}
```

---

## ۵. Platform Overview

ایکس یک پلتفرم **میکروبلاگینگ** و **شبکه اجتماعی خبرمحور** است. کاربران با پست‌های کوتاه (Tweets/Posts) تا ۲۸۰ کاراکتر (یا ۴۰۰۰ برای X Premium) محتوا منتشر می‌کنند و از طریق Reply, Retweet (Repost), Like, Quote, Bookmark و اشتراک‌گذاری با دیگران تعامل دارند.

### ویژگی‌های کلیدی ایکس

| ویژگی                | توضیح                                      | اهمیت برای SMOS                        |
| -------------------- | ------------------------------------------ | -------------------------------------- |
| **Real-time**        | محتوا در لحظه منتشر و مشاهده می‌شود        | حیاتی — اخبار فوری و رویدادها          |
| **Thread**           | زنجیره پست‌های متوالی                      | بالا — تهدهای تحلیلی و آموزشی          |
| **Hashtag**          | برچسب‌گذاری موضوعی                         | بالا — دسته‌بندی اخبار و Trend         |
| **Trend**            | موضوعات داغ جهانی و منطقه‌ای               | بالا — Trend Monitoring و حضور به‌موقع |
| **Retweet (Repost)** | اشتراک‌گذاری پست دیگران                    | متوسط — استراتژی اشتراک دانش           |
| **Quote**            | Retweet + نظر شخصی                         | بالا — اظهارنظر تحلیلی                 |
| **Poll**             | نظرسنجی در پست                             | متوسط — تعامل با مخاطب                 |
| **Spaces**           | گفتگوی صوتی زنده                           | کم — فعلاً خارج از دامنه               |
| **X Premium**        | قابلیت‌های ویژه (پست بلند, اولویت, ویرایش) | متوسط — برای تهدهای تحلیلی             |

### آمار کلیدی (جهانی)

| معیار                     | مقدار                          |
| ------------------------- | ------------------------------ |
| کاربران فعال ماهانه       | ~۵۵۰ میلیون                    |
| کاربران فعال روزانه       | ~۲۵۰ میلیون                    |
| پست در روز                | ~۵۰۰ میلیون                    |
| محدودیت کاراکتر (رایگان)  | ۲۸۰                            |
| محدودیت کاراکتر (Premium) | ۴۰۰۰                           |
| رسانه در هر پست           | ۴ تصویر / ۱ ویدئو (۲:۲۰ دقیقه) |

---

## ۶. Strategic Role

### نقش استراتژیک: News (خبر)

نقش **News** یک نقش جدید در چارچوب [ARCH-020 §۶](../../00-ARCHITECTURE/20-enterprise-multi-platform-strategy.md#۶-platform-roles) است که مکمل نقش‌های Hub, Reach, Network, Community, Archive تعریف می‌شود.

| ویژگی           | توضیح                                                      |
| --------------- | ---------------------------------------------------------- |
| **نام نقش**     | News                                                       |
| **هدف**         | انتشار فوری اخبار صنعت، بیانیه‌های رسمی، رویدادها و روندها |
| **سرعت**        | Real-time — سریع‌ترین کانال انتشار SMOS                    |
| **مخاطب**       | عموم + خبرنگاران + تحلیلگران صنعت                          |
| **محتوای غالب** | متن کوتاه، لینک، تصویر، تهد                                |
| **CTA اصلی**    | لینک به Website/Blog (Hub) برای مطالعه کامل                |

### جایگاه در سفر مخاطب (از ARCH-020 §۷)

| مرحله          | نقش ایکس                     | پلتفرم مکمل          |
| -------------- | ---------------------------- | -------------------- |
| **Awareness**  | دیده‌شدن فوری اخبار و روندها | Instagram (Reach)    |
| **Attention**  | تهدهای تحلیلی عمیق‌تر        | LinkedIn (Network)   |
| **Engagement** | Reply و گفتگوی عمومی         | Telegram (Community) |
| **Advocacy**   | Retweet و Quote توسط مخاطبان | Telegram (Community) |

### تفکیک نقش‌ها (حل تعارض)

| نقش           | پلتفرم‌ها          | مرز                                    |
| ------------- | ------------------ | -------------------------------------- |
| **News**      | X / Twitter        | اخبار فوری، بیانیه‌ها، رویدادها، Trend |
| **Hub**       | Website / Blog     | محتوای کامل، مرجع، SEO                 |
| **Reach**     | Instagram, YouTube | دسترسی بصری گسترده                     |
| **Network**   | LinkedIn           | ارتباطات حرفه‌ای B2B                   |
| **Community** | Telegram, Bale     | تعامل عمیق و گفتگو                     |

---

## ۷. Audience Definition

### مخاطبان پلتفرم

| فیلد                      | مقدار                                                                               |
| ------------------------- | ----------------------------------------------------------------------------------- |
| **Primary Audience**      | متخصصان صنعت انرژی و فناوری — خبرخوان‌های حرفه‌ای                                   |
| **Secondary Audience**    | خبرنگاران، تحلیلگران، سرمایه‌گذاران، عموم علاقه‌مند به فناوری                       |
| **Audience Demographics** | ۲۵-۵۵ سال، مخلوط جنسیت، ایران + جهان                                                |
| **Audience Behavior**     | فعال — اخبار را تعقیب می‌کنند، Retweet و Reply و Quote می‌کنند                      |
| **Peak Hours**            | ۸:۰۰-۱۰:۰۰ صبح + ۱۶:۰۰-۱۸:۰۰ عصر (به وقت تهران)                                     |
| **Content Preferences**   | اخبار فوری, تحلیل‌های کوتاه, اینفوگرافیک, تهدهای آموزشی                             |
| **Personas**              | PERSONA-001 (Professional), PERSONA-003 (Tech Enthusiast), PERSONA-004 (Journalist) |

### بلوک JSON

```json
{
  "audience_definition": {
    "primary": "متخصصان صنعت انرژی و فناوری",
    "secondary": "خبرنگاران، تحلیلگران، سرمایه‌گذاران",
    "demographics": {
      "age_range": "25-55",
      "gender": "مخلوط",
      "location": "ایران + جهانی",
      "language": "فارسی + انگلیسی"
    },
    "behavior": {
      "active_hours": ["08:00-10:00", "16:00-18:00"],
      "content_preferences": ["اخبار فوری", "تحلیل کوتاه", "اینفوگرافیک", "تِرد"],
      "engagement_style": "فعال",
      "platform_habits": ["دنبال‌کردن هشتگ‌ها", "اشتراک اخبار", "بحث در Reply"]
    },
    "personas": ["PERSONA-001", "PERSONA-003", "PERSONA-004"]
  }
}
```

---

## ۸. Platform Mission

مأموریت ایکس در SMOS:

**"اولین نقطه اطلاع از رویدادها و تحولات صنعت — جایی که خبر قبل از هر جای دیگر منتشر می‌شود."**

### ابعاد مأموریت

| بعد         | توضیح                                                  |
| ----------- | ------------------------------------------------------ |
| **Alert**   | هشدار فوری درباره رویدادها، اخبار و تغییرات صنعت       |
| **Analyze** | تحلیل کوتاه و سریع رویدادها در قالب تهد                |
| **Amplify** | تقویت محتوای Hub و دیگر پلتفرم‌ها از طریق لینک و Quote |
| **Absorb**  | جذب روندها و بازخورد از تعاملات و تبدیل به دانش        |

---

## ۹. Platform Objectives

| هدف    | توضیح                                             | KPI مرتبط                         | زمان    | اولویت |
| ------ | ------------------------------------------------- | --------------------------------- | ------- | ------ |
| OBJ-01 | تبدیل ایکس به منبع اول اخبار صنعت انرژی و فناوری  | KPI-PLAT-004-06 (Share of Voice)  | Q4 1405 | P1     |
| OBJ-02 | میانگین زمان انتشار خبر < ۳۰ دقیقه از وقوع رویداد | KPI-PLAT-004-07 (Time-to-Publish) | Q2 1405 | P1     |
| OBJ-03 | رشد ۵۰٪ فالوورهای مرتبط با صنعت در ۶ ماه          | KPI-PLAT-004-04 (Follower Growth) | Q4 1405 | P2     |
| OBJ-04 | افزایش نرخ تعامل (Engagement Rate) به > ۳٪        | KPI-PLAT-004-02 (Engagement Rate) | Q3 1405 | P2     |
| OBJ-05 | استخراج هفتگی Trend Report از روندهای ایکس        | KPI-PLAT-004-09 (Trend Insights)  | Q2 1405 | P2     |

---

## ۱۰. Platform KPIs

| KPI             | توضیح                                                               | هدف        | فرکانس اندازه‌گیری | مسئول               |
| --------------- | ------------------------------------------------------------------- | ---------- | ------------------ | ------------------- |
| KPI-PLAT-004-01 | **Impressions** — تعداد نمایش پست‌ها                                | ۵۰۰K / ماه | روزانه             | AI-009 (Monitoring) |
| KPI-PLAT-004-02 | **Engagement Rate** — (Likes+Reply+Retweet+Quote) / Impressions     | > ۳٪       | روزانه             | AI-009              |
| KPI-PLAT-004-03 | **Profile Visits** — بازدید از پروفایل                              | ۵۰K / ماه  | هفتگی              | AI-010 (Analytics)  |
| KPI-PLAT-004-04 | **Follower Growth** — رشد فالوورها                                  | +۵٪ / ماه  | هفتگی              | AI-010              |
| KPI-PLAT-004-05 | **Link Click Rate** — نرخ کلیک روی لینک‌ها                          | > ۲٪       | روزانه             | AI-009              |
| KPI-PLAT-004-06 | **Share of Voice** — سهم از مکالمات صنعت                            | > ۱۰٪      | ماهانه             | AI-010              |
| KPI-PLAT-004-07 | **Time-to-Publish** — زمان از رویداد تا انتشار خبر                  | < ۳۰ دقیقه | روزانه             | AI-009              |
| KPI-PLAT-004-08 | **Thread Completion Rate** —٪ مخاطبانی که تهد را تا انتها می‌خوانند | > ۴۰٪      | هفتگی              | AI-010              |
| KPI-PLAT-004-09 | **Trend Insights Generated** — تعداد Insight استخراج‌شده از Trend   | > ۴ / ماه  | ماهانه             | AI-010              |
| KPI-PLAT-004-10 | **Response Time** — میانگین زمان پاسخ به Reply                      | < ۴ ساعت   | روزانه             | AI-013 (Engagement) |
| KPI-PLAT-004-11 | **Crisis Response Time** — زمان واکنش به بحران در ایکس              | < ۱۵ دقیقه | روزانه             | AI-009 + Human      |

### بلوک JSON

```json
{
  "platform_kpis": [
    {
      "id": "KPI-PLAT-004-01",
      "name": "Impressions",
      "description": "تعداد نمایش پست‌ها",
      "target": "500K / month",
      "unit": "impressions",
      "frequency": "daily",
      "owner": "AI-009"
    },
    {
      "id": "KPI-PLAT-004-02",
      "name": "Engagement Rate",
      "description": "نرخ تعامل کلی",
      "target": "> 3%",
      "unit": "percentage",
      "frequency": "daily",
      "owner": "AI-009"
    },
    {
      "id": "KPI-PLAT-004-03",
      "name": "Profile Visits",
      "description": "بازدید از پروفایل",
      "target": "50K / month",
      "unit": "visits",
      "frequency": "weekly",
      "owner": "AI-010"
    },
    {
      "id": "KPI-PLAT-004-04",
      "name": "Follower Growth",
      "description": "رشد فالوورها",
      "target": "+5% / month",
      "unit": "percentage",
      "frequency": "weekly",
      "owner": "AI-010"
    },
    {
      "id": "KPI-PLAT-004-05",
      "name": "Link Click Rate",
      "description": "نرخ کلیک روی لینک‌ها",
      "target": "> 2%",
      "unit": "percentage",
      "frequency": "daily",
      "owner": "AI-009"
    },
    {
      "id": "KPI-PLAT-004-06",
      "name": "Share of Voice",
      "description": "سهم از مکالمات صنعت",
      "target": "> 10%",
      "unit": "percentage",
      "frequency": "monthly",
      "owner": "AI-010"
    },
    {
      "id": "KPI-PLAT-004-07",
      "name": "Time-to-Publish",
      "description": "زمان از رویداد تا انتشار خبر",
      "target": "< 30 min",
      "unit": "minutes",
      "frequency": "daily",
      "owner": "AI-009"
    },
    {
      "id": "KPI-PLAT-004-08",
      "name": "Thread Completion Rate",
      "description": "نرخ تکمیل خواندن ترد",
      "target": "> 40%",
      "unit": "percentage",
      "frequency": "weekly",
      "owner": "AI-010"
    },
    {
      "id": "KPI-PLAT-004-09",
      "name": "Trend Insights",
      "description": "تعداد Insight استخراج‌شده از Trend",
      "target": "> 4 / month",
      "unit": "insights",
      "frequency": "monthly",
      "owner": "AI-010"
    },
    {
      "id": "KPI-PLAT-004-10",
      "name": "Response Time",
      "description": "میانگین زمان پاسخ به Reply",
      "target": "< 4 hours",
      "unit": "hours",
      "frequency": "daily",
      "owner": "AI-013"
    },
    {
      "id": "KPI-PLAT-004-11",
      "name": "Crisis Response Time",
      "description": "زمان واکنش به بحران در ایکس",
      "target": "< 15 min",
      "unit": "minutes",
      "frequency": "daily",
      "owner": "AI-009"
    }
  ]
}
```

---

## ۱۱. Platform Constraints

### Technical

| محدودیت                    | توضیح                     | تأثیر                    | کاهش اثر                                |
| -------------------------- | ------------------------- | ------------------------ | --------------------------------------- |
| Character limit (free)     | ۲۸۰ کاراکتر در هر پست     | محدودیت در توضیح کامل    | استفاده از Thread برای محتوای بلندتر    |
| Character limit (Premium)  | ۴۰۰۰ کاراکتر در هر پست    | مناسب برای تردهای تحلیلی | فعال‌سازی X Premium برای حساب رسمی      |
| Rate limit                 | ۳۰۰ POST / ۱۵ min         | محدودیت در انتشار انبوه  | صف هوشمند و اولویت‌بندی                 |
| Media limit                | ۴ تصویر یا ۱ ویدئو (۲:۲۰) | محدودیت در رسانه         | لینک به YouTube/Aparat برای ویدئوی بلند |
| API rate limit (Free tier) | ۵۰۰K tweets/day per app   | محدودیت در مقیاس بزرگ    | برنامه‌ریزی انتشار و کش کردن            |

### Content

| محدودیت            | توضیح                              | تأثیر                                        |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| Prohibited content | خشونت, نفرت‌پراکنی, اطلاعات نادرست | رعایت قواعد X — Crisis content نیازمند تأیید |
| Spam rules         | لینک‌های تکراری, رفتار اسپم        | پرهیز از لینک‌های تکراری در چند پست          |
| Sensitive content  | محتوای حساس نیازمند برچسب          | عدم انتشار محتوای حساس بدون بررسی            |

### Legal

| محدودیت        | توضیح                                                                     |
| -------------- | ------------------------------------------------------------------------- |
| Data privacy   | عدم اشتراک‌گذاری اطلاعات شخصی بدون رضایت                                  |
| Copyright      | رعایت حق نشر در تصاویر و محتوای بازنشر                                    |
| Iran sanctions | تحریم‌های آمریکا علیه ایران — دسترسی محدود برای کاربران ایرانی (نیاز VPN) |

### Business

| محدودیت           | توضیح                                          |
| ----------------- | ---------------------------------------------- |
| Brand safety      | عدم تعامل با حساب‌های نامناسب یا محتوای جنجالی |
| Competitor policy | عدم اشاره منفی مستقیم به رقبا                  |
| Crisis policy     | هر پست بحرانی نیازمند تأیید Media Director     |

### بلوک JSON

```json
{
  "platform_constraints": [
    {
      "type": "technical",
      "description": "Character limit 280 for free accounts",
      "impact": "محدودیت در محتوای طولانی",
      "mitigation": "Thread یا X Premium"
    },
    {
      "type": "technical",
      "description": "Rate limit 300 POST / 15 min",
      "impact": "محدودیت در انتشار انبوه",
      "mitigation": "صف هوشمند و اولویت‌بندی"
    },
    {
      "type": "content",
      "description": "Prohibited content policy",
      "impact": "محدودیت در برخی محتواها",
      "mitigation": "بررسی محتوا قبل از انتشار"
    },
    {
      "type": "legal",
      "description": "US sanctions on Iran",
      "impact": "دسترسی محدود کاربران ایرانی",
      "mitigation": "استفاده از Telegram/Bale برای مخاطب داخل ایران"
    },
    {
      "type": "business",
      "description": "Brand safety rules",
      "impact": "محدودیت در تعامل با حساب‌های خاص",
      "mitigation": "لیست سیاه حساب‌های نامناسب"
    }
  ]
}
```

---

## ۱۲. Content Types

### Post Types (بومی ایکس)

| نوع پست        | توضیح                 | حداکثر طول          | رسانه             |
| -------------- | --------------------- | ------------------- | ----------------- |
| **Post**       | پست استاندارد         | ۲۸۰ / ۴۰۰۰ ch       | تصویر, ویدئو, GIF |
| **Thread**     | زنجیره پست‌های متوالی | ∞ (هر پست ۲۸۰/۴۰۰۰) | تصویر, ویدئو      |
| **Reply**      | پاسخ به پست دیگران    | ۲۸۰ / ۴۰۰۰ ch       | تصویر, ویدئو      |
| **Quote**      | Retweet + نظر         | ۲۸۰ / ۴۰۰۰ ch       | —                 |
| **Poll**       | نظرسنجی               | ۲۸۰ ch + ۴ گزینه    | —                 |
| **Image Post** | پست با تصویر غالب     | ۲۸۰ ch              | ۱-۴ تصویر         |
| **Video Post** | پست با ویدئوی کوتاه   | ۲۸۰ ch              | ۱ ویدئو (≤ ۲:۲۰)  |
| **GIF Post**   | پست با GIF            | ۲۸۰ ch              | ۱ GIF             |

### Content Pillars

| ستون محتوا                 | درصد | توضیح                                   |
| -------------------------- | ---- | --------------------------------------- |
| **Breaking News**          | ۳۰٪  | اخبار فوری صنعت انرژی و فناوری          |
| **Industry Analysis**      | ۲۵٪  | تحلیل کوتاه روندها و رویدادها (Thread)  |
| **Brand News**             | ۲۰٪  | اطلاعیه‌ها، بیانیه‌ها، رویدادهای Xennic |
| **Thought Leadership**     | ۱۵٪  | دیدگاه‌ها و نظرات مدیران Xennic         |
| **Engagement & Community** | ۱۰٪  | Poll, Reply, Quote, تعامل با مخاطب      |

---

## ۱۳. Content Strategy

### استراتژی محتوای ایکس

| فیلد                  | مقدار                                                                        |
| --------------------- | ---------------------------------------------------------------------------- |
| **Content Pillars**   | Breaking News, Industry Analysis, Brand News, Thought Leadership, Engagement |
| **Content Mix**       | News ۳۰٪, Analysis ۲۵٪, Brand ۲۰٪, Leadership ۱۵٪, Interactive ۱۰٪           |
| **Content Frequency** | ۵-۱۰ پست در روز (شامل Reply, Quote, Retweet)                                 |
| **Best Times**        | ۸:۰۰-۱۰:۰۰ صبح + ۱۲:۰۰-۱۳:۰۰ + ۱۶:۰۰-۱۸:۰۰ (به وقت تهران)                    |
| **Content Sources**   | AI-generated ۵۰٪, Human-written ۳۰٪, Curated ۲۰٪                             |
| **Repurpose Rules**   | محتوای Blog → Thread; محتوای LinkedIn → خلاصه; ویدئو → لینک                  |

### اصول استراتژی

| اصل          | توضیح                                                                     |
| ------------ | ------------------------------------------------------------------------- |
| **CS-TW-01** | Breaking News優先 — خبرها قبل از هر پلتفرم دیگر در ایکس منتشر می‌شوند     |
| **CS-TW-02** | هر پست خبری باید لینک به Hub (Website) داشته باشد                         |
| **CS-TW-03** | Threadها باید حداقل ۳ و حداکثر ۱۵ پست داشته باشند                         |
| **CS-TW-04** | محتوای تکراری از کانال‌های دیگر در ایکس ممنوع — هر محتوا بومی‌سازی می‌شود |
| **CS-TW-05** | Retweet محتوای دیگران فقط با نظر (Quote) انجام شود — Retweet خالی ممنوع   |

### بلوک JSON

```json
{
  "content_strategy": {
    "pillars": [
      "Breaking News",
      "Industry Analysis",
      "Brand News",
      "Thought Leadership",
      "Engagement"
    ],
    "mix": {
      "news": 30,
      "analysis": 25,
      "brand": 20,
      "leadership": 15,
      "interactive": 10
    },
    "frequency": {
      "per_day": "5-10",
      "per_week": "35-70",
      "best_times": ["08:00-10:00", "12:00-13:00", "16:00-18:00"],
      "timezone": "Asia/Tehran"
    },
    "sources": {
      "ai_generated": 50,
      "human_written": 30,
      "curated": 20
    }
  }
}
```

---

## ۱۴. Content Mapping

### نگاشت CT-ID به ایکس

| CT-ID                         | پلتفرم              | تغییرات لازم              | مسئول تبدیل      |
| ----------------------------- | ------------------- | ------------------------- | ---------------- |
| CT-006 (Technical Analysis)   | Thread خلاصه + لینک | خلاصه‌سازی به ۵-۱۰ پست    | AI-003 (Writing) |
| CT-007 (Research Report)      | Thread + لینک       | استخراج ۳-۵ Insight کلیدی | AI-003           |
| CT-009 (Industry Insight)     | Post + لینک         | همان (مناسب برای ایکس)    | AI-003           |
| CT-010 (Opinion Piece)        | Quote + تحلیل       | نظر مدیر → Quote از منبع  | AI-003           |
| CT-011 (Product Introduction) | Thread معرفی        | ۳-۵ پست معرفی             | AI-003           |
| CT-013 (Promotional Campaign) | Post + لینک         | خلاصه کوتاه + CTA         | AI-003           |
| CT-029 (Event Announcement)   | Post + Image        | اطلاعیه + تصویر           | AI-003           |
| CT-030 (Live Coverage)        | Live Thread         | پست‌های لحظه‌ای           | AI-003 + AI-008  |
| CT-031 (Event Recap)          | Thread خلاصه        | ۳-۷ پست خلاصه             | AI-003           |
| CT-033 (Best Practice)        | Thread آموزشی       | ۳-۱۰ پست آموزشی           | AI-003           |
| CT-036 (Crisis Statement)     | Post فوری           | همان (مختصر و رسمی)       | Human + AI-008   |
| CT-037 (Crisis Update)        | Post فوری           | همان                      | Human + AI-008   |
| CT-038 (Apology / Correction) | Post فوری           | همان                      | Human + AI-008   |

### CT-IDهای غیرمجاز در ایکس

| CT-ID                      | دلیل عدم تناسب                                  |
| -------------------------- | ----------------------------------------------- |
| CT-002 (Educational Video) | ویدئوی بلند در ایکس محدود است → لینک به YouTube |
| CT-032 (Documentation)     | محتوای سنگین و طولانی → مناسب Website           |
| CT-039 (Internal Memo)     | محتوای داخلی → فقط Website / Telegram           |
| CT-042 (Training Material) | محتوای آموزشی طولانی → مناسب Website / YouTube  |

---

## ۱۵. Publishing Model

### مدل انتشار ایکس

| فیلد                     | مقدار                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| **Publishing Workflow**  | AUT-004-PUB                                                                                 |
| **Approval Chain**       | AI-004 (Review) → Human Approval (First Post) → AI-008 (Publish)                            |
| **Queue Priority**       | Breaking News (P0), Normal (P2)                                                             |
| **Scheduling Rules**     | News → فوری/دستی, Analysis → زمان‌بندی‌شده                                                  |
| **Auto-publish Rules**   | CT-036~038 (Crisis) → Human only; CT-030 (Live) → Human + AI; rest → AI auto after approval |
| **Human Approval Gates** | First publish of each day, Crisis content, Campaign content, Sensitive topics               |

### بلوک JSON

```json
{
  "publishing_model": {
    "workflow_id": "AUT-004-PUB",
    "approval_chain": ["AI-004 Review", "Human Approval"],
    "queue_priority": "P0|P2",
    "auto_publish": {
      "enabled": true,
      "conditions": ["content_type != 'crisis'", "confidence > 0.9", "not first_post_of_day"]
    },
    "human_gates": ["first_publish_daily", "crisis_content", "campaign_content", "sensitive_topic"],
    "scheduling": {
      "best_times": ["08:00", "12:00", "16:00"],
      "timezone": "Asia/Tehran",
      "min_interval_minutes": 15
    }
  }
}
```

---

## ۱۶. Publishing Rules

### قواعد عمومی

| #     | قاعده                                                                | توضیح                  |
| ----- | -------------------------------------------------------------------- | ---------------------- |
| PR-01 | Breaking News حداکثر ۳۰ دقیقه پس از رویداد منتشر شود                 | سرعت اولویت دارد       |
| PR-02 | هر پست خبری باید لینک به Hub (Website/Blog) داشته باشد               | CTA الزامی             |
| PR-03 | حداقل فاصله بین دو پست غيرخبری ۱۵ دقیقه                              | جلوگیری از اسپم        |
| PR-04 | Repetitive content ممنوع — محتوای مشابه در < ۲۴ ساعت مجدد منتشر نشود | جلوگیری از خستگی مخاطب |
| PR-05 | Crisis content (CT-036~038) فقط با تأیید Media Director              | ایمنی برند             |
| PR-06 | Threadها باید شماره‌گذاری شوند (X/Y)                                 | قابلیت پیگیری          |
| PR-07 | لینک‌ها همیشه با URL shortener سازمانی کوتاه شوند                    | tracking + brand       |
| PR-08 | اولین پست روز باید توسط انسان تأیید شود                              | کیفیت                  |

### قواعد Thread

| #     | قاعده                                                 | توضیح                   |
| ----- | ----------------------------------------------------- | ----------------------- |
| TH-01 | Thread حداقل ۳ پست و حداکثر ۱۵ پست                    | محدوده بهینه            |
| TH-02 | پست اول Thread باید تیتر جذاب + خلاصه داشته باشد      | جلب توجه                |
| TH-03 | هر پست Thread باید یک پیام کامل و مستقل باشد          | خواندن پاره‌ای ممکن است |
| TH-04 | پست آخر Thread باید CTA داشته باشد (لینک, سؤال, Poll) | تعامل نهایی             |
| TH-05 | Threadها با هشتگ یکسان و شماره پست منتشر شوند         | قابلیت جستجو            |

---

## ۱۷. Post Types

### انواع پست در ایکس

| نوع                 | توضیح                 | CT-ID سازگار                   | فرکانس      |
| ------------------- | --------------------- | ------------------------------ | ----------- |
| **News Post**       | پست خبری فوری با لینک | CT-029, CT-030, CT-036~038     | ۲-۳ / روز   |
| **Analysis Post**   | پست تحلیلی کوتاه      | CT-009, CT-010                 | ۱-۲ / روز   |
| **Thread**          | زنجیره پست تحلیلی     | CT-006, CT-007, CT-011, CT-033 | ۱ / روز     |
| **Announcement**    | اطلاعیه رسمی          | CT-013, CT-029                 | ۲-۳ / هفته  |
| **Engagement Post** | Poll, سؤال, تعاملی    | CT-016, CT-017                 | ۱ / روز     |
| **Quote Post**      | Quote از منبع + نظر   | CT-010, CT-023                 | ۱-۲ / روز   |
| **Media Post**      | تصویر + متن کوتاه     | CT-003, CT-024                 | ۲-۳ / هفته  |
| **Live Thread**     | پوشش لحظه‌ای رویداد   | CT-030                         | در رویدادها |

---

## ۱۸. Visual Guidelines

### راهنمای بصری ایکس

| فیلد                      | مقدار                                 |
| ------------------------- | ------------------------------------- |
| **Aspect Ratio (Images)** | ۱۶:۹ (ترجیحی), ۱:۱ (مجاز), ۴:۳ (مجاز) |
| **Aspect Ratio (Video)**  | ۱۶:۹ (ترجیحی)                         |
| **Resolution (Images)**   | ≥ ۱۰۸۰px در پهنا                      |
| **Max Image Size**        | ۵ MB per image                        |
| **Max Video Size**        | ۵۱۲ MB                                |
| **Max Video Duration**    | ۲:۲۰ (standard), ۶۰ min (Premium)     |
| **Color Profile**         | SRGB — مطابق BRD-001 §۱۴              |
| **Safe Zone**             | ۱۰٪ حاشیه امن از هر طرف               |
| **Text on Image**         | Sans-serif, readable at ۵۰٪ thumbnail |

### اصول بصری

| اصل           | توضیح                                             |
| ------------- | ------------------------------------------------- |
| **VIS-TW-01** | تصاویر خبری اولویت真实性 دارند — نه editing سنگین |
| **VIS-TW-02** | اینفوگرافیک‌ها در ابعاد ۱۶:۹ و با فونت خوانا      |
| **VIS-TW-03** | Brand Watermark در تصاویر اختیاری — لینک کافی است |
| **VIS-TW-04** | ویدئوهای کوتاه (≤ ۶۰ ثانیه) اولویت دارند          |

---

## ۱۹. Caption Guidelines

### راهنمای کپشن ایکس

| کلاس طول           | کاراکتر  | کاربرد                          |
| ------------------ | -------- | ------------------------------- |
| **Flash**          | ≤ ۱۰۰    | Breaking News, Alert            |
| **Short**          | ۱۰۰-۱۸۰  | News, Quote, Poll               |
| **Medium**         | ۱۸۰-۲۸۰  | Analysis, Announcement          |
| **Long (Premium)** | ۲۸۰-۴۰۰۰ | Thread posts, Detailed analysis |

### اصول کپشن

| اصل           | توضیح                                                                   |
| ------------- | ----------------------------------------------------------------------- |
| **CAP-TW-01** | خط اول کپشن = خبر اصلی یا تیتر — کاربر باید در ۲ ثانیه اصل خبر را بفهمد |
| **CAP-TW-02** | زبان فارسی روان و رسمی — از مخفف‌های غیررسمی پرهیز                      |
| **CAP-TW-03** | CTA (لینک, سؤال, Retweet request) در انتهای کپشن                        |
| **CAP-TW-04** | Hashtag حداکثر ۳ عدد — یک branded (#Xennic) + ۲ موضوعی                  |
| **CAP-TW-05** | Mention افراد/سازمان‌ها فقط در صورت relevance مستقیم                    |

---

## ۲۰. Hashtag Strategy

### سیستم هشتگ ایکس

| سطح           | تعداد | توضیح                                    | مثال                   |
| ------------- | ----- | ---------------------------------------- | ---------------------- |
| **Brand**     | ۱     | هشتگ اختصاصی برند — الزامی در همه پست‌ها | #Xennic                |
| **Primary**   | ۱-۲   | هشتگ اصلی موضوع پست                      | #AI #EnergyTech        |
| **Secondary** | ۰-۱   | هشتگ کمکی یا Trend                       | #DigitalTransformation |

### قواعد هشتگ

| #     | قاعده                                                                   | توضیح |
| ----- | ----------------------------------------------------------------------- | ----- |
| HT-01 | حداکثر ۳ هشتگ در هر پست (شامل برند)                                     |
| HT-02 | #Xennic در همه پست‌ها الزامی                                            |
| HT-03 | هشتگ‌های Trend فقط در صورت relevance صنعتی                              |
| HT-04 | هشتگ‌های فارسی و انگلیسی مجاز — ترجیح با هشتگ انگلیسی برای دسترسی جهانی |
| HT-05 | هشتگ‌های طنز یا مناسبتی (بدون relevance) ممنوع                          |
| HT-06 | هشتگ‌ها در انتهای پست — نه در میان متن اصلی                             |

---

## ۲۱. Community Model

### مدل اجتماع ایکس

| فیلد                | مقدار                                                  |
| ------------------- | ------------------------------------------------------ |
| **Community Type**  | Public Network                                         |
| **Community Rules** | رعایت قواعد X + Brand Safety + احترام متقابل           |
| **Growth Strategy** | Organic — محتوای خبری باکیفیت + تعامل با حساب‌های صنعت |
| **Moderation Team** | AI-013 (Engagement) + Human Supervisor                 |
| **Key Accounts**    | فالو کردن حساب‌های کلیدی صنعت (۳۰-۵۰ حساب)             |

### قواعد اجتماع

| #      | قاعده                                                  | توضیح |
| ------ | ------------------------------------------------------ | ----- |
| COM-01 | فالو کردن فقط حساب‌های مرتبط با صنعت و فناوری          |
| COM-02 | فالو کردن متقابل (Follow Back) فقط برای حساب‌های معتبر |
| COM-03 | Listهای عمومی برای دسته‌بندی حساب‌های کلیدی            |
| COM-04 | Block حساب‌های اسپم و مزاحم — بدون تعامل               |
| COM-05 | Mute کلمات و حساب‌های نامناسب                          |

---

## ۲۲. Engagement Model

### مدل تعامل ایکس

| فیلد                         | مقدار                                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Engagement Types**         | Reply, Retweet (Repost), Quote, Like, Bookmark                                                          |
| **Response Time SLA**        | < ۴ ساعت برای Replyهای عادی, < ۳۰ دقیقه برای Crisis                                                     |
| **Tone Guidelines**          | [BRD-002 §۶](../../22-BRAND/20-brand-voice.md#۶-tone-matrix) — Tone Matrix برای Mode: News, Educational |
| **Escalation Path**          | AI-013 → Human (Content Manager) → Media Director                                                       |
| **AI Engagement Rules**      | AI-013 مجاز به Reply عادی — Reply بحرانی به Human                                                       |
| **Human Intervention Rules** | Crisis, توهین, تهدید, سؤال حقوقی                                                                        |

### قواعد تعامل

| #     | قاعده                                                 | توضیح |
| ----- | ----------------------------------------------------- | ----- |
| EN-01 | به همه Replyهای مرتبط پاسخ داده شود — حداکثر ۴ ساعت   |
| EN-02 | Replyهای منفی با لحن حرفه‌ای و محترمانه — جدل ممنوع   |
| EN-03 | Retweet فقط با Quote (نظر) — Retweet خالی ممنوع       |
| EN-04 | Like = تأیید ضمنی — با دقت استفاده شود                |
| EN-05 | Quote از منتقدان ممنوع — پاسخ در Reply                |
| EN-06 | Block اولویت دارد بر Debate — وقت‌تلف‌کن‌ها بلاک شوند |

---

## ۲۳. Moderation Model

### مدل مدیریت محتوای نامناسب

| فیلد                    | مقدار                                               |
| ----------------------- | --------------------------------------------------- |
| **Moderation Types**    | Post-moderation (Reactive)                          |
| **Prohibited Content**  | توهین, نفرت‌پراکنی, اسپم, اطلاعات نادرست, خشونت     |
| **Spam Rules**          | AI-013 تشخیص اسپم (تکراری, لینک مخرب, رفتار رباتیک) |
| **User Blocking Rules** | Block خودکار برای اسپم — Human برای توهین           |
| **Reporting Process**   | گزارش به X + گزارش داخلی به Media Director          |
| **Appeal Process**      | اعتراض از طریق DM → بررسی توسط Human Supervisor     |

### قواعد مدیریت

| #      | قاعده                                              | توضیح |
| ------ | -------------------------------------------------- | ----- |
| MOD-01 | اسپم → Block + Report (AI خودکار)                  |
| MOD-02 | توهین خفیف → Hide Reply + هشدار (AI)               |
| MOD-03 | توهین شدید → Block + Report + اطلاع Media Director |
| MOD-04 | اطلاعات نادرست → Reply تصحیح + لینک منبع           |
| MOD-05 | بحران → Crisis Protocol فعال شود                   |

---

## ۲۴. Response Templates

### قالب‌های پاسخ استاندارد

| وضعیت                  | قالب پاسخ                                                                   | مسئول                  |
| ---------------------- | --------------------------------------------------------------------------- | ---------------------- |
| **Thanks (Positive)**  | "از توجه شما سپاسگزاریم. برای اطلاعات بیشتر به [link] مراجعه کنید."         | AI-013                 |
| **Question General**   | "پاسخ سؤال شما: [پاسخ]. مطالعه بیشتر: [link]"                               | AI-013                 |
| **Question Technical** | "سؤال تخصصی شما به تیم فنی ارسال شد. پاسخ در اسرع وقت ارائه خواهد شد."      | AI-013 → Human         |
| **Complaint**          | "از بازخورد شما متشکریم. لطفاً برای بررسی دقیق‌تر به [DM/Email] پیام دهید." | AI-013                 |
| **Misinformation**     | "این مطلب نیاز به تصحیح دارد. اطلاعات دقیق: [source link]"                  | AI-013                 |
| **Crisis**             | "از نگرانی شما عذرخواهی می‌کنیم. بیانیه رسمی به زودی منتشر خواهد شد."       | Human (Media Director) |
| **Spam/Hate**          | (بدون پاسخ — Block مستقیم)                                                  | AI-013                 |

---

## ۲۵. AI Collaboration

### همکاری با عامل‌های هوشمند

| Agent ID            | نقش در پلتفرم                   | سطح اختیار | ورودی                | خروجی                    |
| ------------------- | ------------------------------- | ---------- | -------------------- | ------------------------ |
| AI-001 (Research)   | تحقیق اخبار و Trendها           | A-2        | Topic, Trend Signal  | Research Brief           |
| AI-003 (Writing)    | تولید پست و Thread              | A-2        | Content Brief, CT-ID | Post / Thread Draft      |
| AI-004 (Review)     | بازبینی قبل از انتشار           | A-2        | Draft Post           | Approval / Revision      |
| AI-005 (Fact Check) | راستی‌آزمایی اخبار و ادعاها     | A-2        | News Draft           | Fact Check Report        |
| AI-008 (Publishing) | انتشار خودکار                   | A-3        | Approved Content     | Publication              |
| AI-009 (Monitoring) | نظارت بر Trend و Performance    | A-3        | Platform Data        | Alerts, Reports          |
| AI-010 (Analytics)  | تحلیل داده و گزارش              | A-2        | Metrics              | Weekly Reports, Insights |
| AI-011 (Knowledge)  | استخراج دانش از Trend و تعاملات | A-2        | Trend Data, Replies  | Knowledge Objects        |
| AI-013 (Engagement) | تعامل با مخاطبان                | A-2        | Reply/Message        | Response                 |
| AI-014 (Scheduler)  | زمان‌بندی انتشار                | A-3        | Content Queue        | Schedule                 |

### بلوک JSON

```json
{
  "ai_collaboration": [
    {
      "agent_id": "AI-001",
      "agent_name": "Research Agent",
      "role": "تحقیق اخبار و Trendها",
      "authority_level": "A-2",
      "inputs": ["Topic", "Trend Signal"],
      "outputs": ["Research Brief"],
      "human_oversight": false
    },
    {
      "agent_id": "AI-003",
      "agent_name": "Writing Agent",
      "role": "تولید پست و Thread",
      "authority_level": "A-2",
      "inputs": ["Content Brief", "CT-ID"],
      "outputs": ["Post Draft", "Thread Draft"],
      "human_oversight": false
    },
    {
      "agent_id": "AI-004",
      "agent_name": "Review Agent",
      "role": "بازبینی قبل از انتشار",
      "authority_level": "A-2",
      "inputs": ["Draft Post"],
      "outputs": ["Approval / Revision"],
      "human_oversight": false
    },
    {
      "agent_id": "AI-005",
      "agent_name": "Fact Check Agent",
      "role": "راستی‌آزمایی اخبار",
      "authority_level": "A-2",
      "inputs": ["News Draft"],
      "outputs": ["Fact Check Report"],
      "human_oversight": true
    },
    {
      "agent_id": "AI-008",
      "agent_name": "Publishing Agent",
      "role": "انتشار خودکار",
      "authority_level": "A-3",
      "inputs": ["Approved Content"],
      "outputs": ["Publication"],
      "human_oversight": false
    },
    {
      "agent_id": "AI-009",
      "agent_name": "Monitoring Agent",
      "role": "نظارت بر Trend و Performance",
      "authority_level": "A-3",
      "inputs": ["Platform Data"],
      "outputs": ["Alerts", "Reports"],
      "human_oversight": false
    },
    {
      "agent_id": "AI-010",
      "agent_name": "Analytics Agent",
      "role": "تحلیل داده و گزارش",
      "authority_level": "A-2",
      "inputs": ["Metrics"],
      "outputs": ["Weekly Reports", "Insights"],
      "human_oversight": false
    },
    {
      "agent_id": "AI-011",
      "agent_name": "Knowledge Agent",
      "role": "استخراج دانش از Trend",
      "authority_level": "A-2",
      "inputs": ["Trend Data", "Replies"],
      "outputs": ["Knowledge Objects"],
      "human_oversight": false
    },
    {
      "agent_id": "AI-013",
      "agent_name": "Engagement Agent",
      "role": "تعامل با مخاطبان",
      "authority_level": "A-2",
      "inputs": ["Reply", "Message"],
      "outputs": ["Response"],
      "human_oversight": false
    },
    {
      "agent_id": "AI-014",
      "agent_name": "Scheduler Agent",
      "role": "زمان‌بندی انتشار",
      "authority_level": "A-3",
      "inputs": ["Content Queue"],
      "outputs": ["Schedule"],
      "human_oversight": false
    }
  ]
}
```

---

## ۲۶. Automation Interfaces

### Workflowهای خودکار ایکس

| Workflow ID | وظیفه                           | Trigger            | فرکانس         |
| ----------- | ------------------------------- | ------------------ | -------------- |
| AUT-004-PUB | انتشار محتوا                    | Scheduled + Manual | روزانه         |
| AUT-004-MON | مانیتورینگ Trend و Performance  | Scheduled          | ساعتی          |
| AUT-004-RPT | گزارش‌گیری هفتگی                | Scheduled          | هفتگی          |
| AUT-004-EXT | استخراج دانش از Trend و تعاملات | Event-driven       | پس از هر تعامل |
| AUT-004-ENG | پاسخ خودکار به Reply            | Event-driven       | پیوسته         |
| AUT-004-TRD | شناسایی و تحلیل Trend           | Scheduled          | هر ۴ ساعت      |
| AUT-004-CRS | پروتکل بحران                    | Event-driven       | فوری           |

### بلوک JSON

```json
{
  "automation_interfaces": [
    {
      "workflow_id": "AUT-004-PUB",
      "task": "انتشار محتوای تأییدشده",
      "trigger": "schedule|manual",
      "frequency": "daily",
      "inputs": ["Approved Post", "Schedule"],
      "outputs": ["Published Post"],
      "error_handling": "retry|alert"
    },
    {
      "workflow_id": "AUT-004-MON",
      "task": "مانیتورینگ Trend و Performance",
      "trigger": "schedule",
      "frequency": "hourly",
      "inputs": ["Platform Data"],
      "outputs": ["Performance Report", "Trend Alert"],
      "error_handling": "alert"
    },
    {
      "workflow_id": "AUT-004-RPT",
      "task": "گزارش‌گیری هفتگی",
      "trigger": "schedule",
      "frequency": "weekly",
      "inputs": ["Weekly Metrics"],
      "outputs": ["Weekly Report"],
      "error_handling": "alert"
    },
    {
      "workflow_id": "AUT-004-EXT",
      "task": "استخراج دانش از Trend و تعاملات",
      "trigger": "event",
      "frequency": "per interaction",
      "inputs": ["Trend Data", "Replies", "Metrics"],
      "outputs": ["Knowledge Object"],
      "error_handling": "alert"
    },
    {
      "workflow_id": "AUT-004-ENG",
      "task": "پاسخ خودکار به Reply",
      "trigger": "event",
      "frequency": "continuous",
      "inputs": ["Reply", "Context"],
      "outputs": ["Response", "Escalation"],
      "error_handling": "escalate"
    },
    {
      "workflow_id": "AUT-004-TRD",
      "task": "شناسایی و تحلیل Trend",
      "trigger": "schedule",
      "frequency": "every 4 hours",
      "inputs": ["Trending Topics", "Industry Keywords"],
      "outputs": ["Trend Report", "Opportunity Alert"],
      "error_handling": "alert"
    },
    {
      "workflow_id": "AUT-004-CRS",
      "task": "فعال‌سازی پروتکل بحران",
      "trigger": "event",
      "frequency": "immediate",
      "inputs": ["Crisis Signal"],
      "outputs": ["Crisis Alert", "Hold Publishing"],
      "error_handling": "escalate_immediate"
    }
  ]
}
```

---

## ۲۷. Workflow References

### ارجاع به گردش کارها (از AUT-\*)

| Workflow ID | وظیفه                | Trigger            | خروجی اصلی         |
| ----------- | -------------------- | ------------------ | ------------------ |
| AUT-004-PUB | انتشار خودکار پست‌ها | Scheduled + Manual | Post Published     |
| AUT-004-MON | مانیتورینگ لحظه‌ای   | Scheduled (hourly) | Alert / Report     |
| AUT-004-RPT | گزارش هفتگی          | Scheduled (weekly) | Weekly Report      |
| AUT-004-EXT | استخراج دانش         | Event-driven       | Knowledge Object   |
| AUT-004-ENG | تعامل خودکار         | Event-driven       | Reply / Escalation |
| AUT-004-TRD | Trend Detection      | Scheduled (4h)     | Trend Report       |
| AUT-004-CRS | بحران                | Event-driven       | Crisis Response    |

### Agent IDs

```json
{
  "agent_ids": {
    "research": "AI-001",
    "writer": "AI-003",
    "reviewer": "AI-004",
    "fact_checker": "AI-005",
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
    "doc_id": "PLAT-004",
    "version": "1.0.0-draft",
    "status": "draft",
    "updated": "2026-06-27",
    "owner": "مدیر پلتفرم ایکس",
    "upstream": ["PLAT-000", "ARCH-020"],
    "downstream": [
      "AUT-004-*",
      "AI-001",
      "AI-003",
      "AI-004",
      "AI-005",
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
    "publish": "AUT-004-PUB",
    "monitor": "AUT-004-MON",
    "report": "AUT-004-RPT",
    "extract": "AUT-004-EXT",
    "engage": "AUT-004-ENG",
    "trend": "AUT-004-TRD",
    "crisis": "AUT-004-CRS"
  }
}
```

### Automation IDs

```json
{
  "automation_ids": {
    "content_pipeline": "AUT-004-001",
    "monitoring_pipeline": "AUT-004-002",
    "reporting_pipeline": "AUT-004-003",
    "trend_pipeline": "AUT-004-004",
    "crisis_pipeline": "AUT-004-005"
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
    "publication": "OBJ-022",
    "metric": "OBJ-017",
    "trend": "OBJ-020",
    "event": "OBJ-021"
  }
}
```

### Prompt IDs

```json
{
  "prompt_ids": {
    "content_creation": "PRM-004-CC",
    "caption_generation": "PRM-004-CG",
    "thread_generation": "PRM-004-TG",
    "engagement_reply": "PRM-004-ER",
    "analytics_report": "PRM-004-AR",
    "trend_analysis": "PRM-004-TA"
  }
}
```

### Decision IDs

```json
{
  "decision_ids": {
    "publish_approval": "DEC-PLAT-004-001",
    "content_rejection": "DEC-PLAT-004-002",
    "engagement_escalation": "DEC-PLAT-004-003",
    "moderation_action": "DEC-PLAT-004-004",
    "crisis_activation": "DEC-PLAT-004-005",
    "trend_opportunity": "DEC-PLAT-004-006"
  }
}
```

### KPI IDs

```json
{
  "kpi_ids": {
    "impressions": "KPI-PLAT-004-01",
    "engagement": "KPI-PLAT-004-02",
    "profile_visits": "KPI-PLAT-004-03",
    "follower_growth": "KPI-PLAT-004-04",
    "link_clicks": "KPI-PLAT-004-05",
    "share_of_voice": "KPI-PLAT-004-06",
    "time_to_publish": "KPI-PLAT-004-07",
    "thread_completion": "KPI-PLAT-004-08",
    "trend_insights": "KPI-PLAT-004-09",
    "response_time": "KPI-PLAT-004-10",
    "crisis_response": "KPI-PLAT-004-11"
  }
}
```

### Event IDs

```json
{
  "event_ids": {
    "content_published": "EVT-PLAT-004-001",
    "content_failed": "EVT-PLAT-004-002",
    "threshold_breached": "EVT-PLAT-004-003",
    "engagement_alert": "EVT-PLAT-004-004",
    "moderation_flag": "EVT-PLAT-004-005",
    "crisis_detected": "EVT-PLAT-004-006",
    "trend_detected": "EVT-PLAT-004-007",
    "knowledge_extracted": "EVT-PLAT-004-008"
  }
}
```

### State IDs

```json
{
  "state_ids": {
    "platform_active": "STATE-PLAT-004-01",
    "platform_paused": "STATE-PLAT-004-02",
    "platform_error": "STATE-PLAT-004-03",
    "platform_maintenance": "STATE-PLAT-004-04",
    "platform_deprecated": "STATE-PLAT-004-05"
  }
}
```

---

## ۲۹. Decision Tables

### Publishing Decisions

| وضعیت             | شرط                                           | تصمیم                              | مسئول                    | زمان       |
| ----------------- | --------------------------------------------- | ---------------------------------- | ------------------------ | ---------- |
| Breaking News     | Confidence > ۰.۹ AND Fact Check Passed        | انتشار خودکار                      | AI-003 → AI-008          | < ۱۵ دقیقه |
| Normal Post       | CT-ID ∈ Auto-publish List AND AI-004 Approved | انتشار خودکار                      | AI-004 → AI-008          | < ۲ ساعت   |
| First Post of Day | Any CT                                        | ارسال برای تأیید انسانی            | AI-004 → Human           | < ۱ ساعت   |
| Thread            | AI-003 Generated                              | تأیید AI-004 + ارسال به صف         | AI-003 → AI-004 → AI-014 | < ۴ ساعت   |
| Crisis Content    | CT-036~038                                    | تأیید Media Director + انتشار فوری | Human (MD) → AI-008      | < ۱۵ دقیقه |

### Engagement Escalation

| وضعیت        | شرط                 | تصمیم                  | مسئول           | زمان     |
| ------------ | ------------------- | ---------------------- | --------------- | -------- |
| Reply معمولی | Positive or Neutral | پاسخ با Template       | AI-013          | < ۴ ساعت |
| Reply منفی   | Contains Complaint  | پاسخ + انتقال به DM    | AI-013          | < ۲ ساعت |
| Reply بحرانی | توهین, تهدید, بحران | ارتقا به L4            | AI-013 → MD     | فوری     |
| سؤال تخصصی   | نیاز به تحقیق       | پاسخ با Research Agent | AI-013 + AI-001 | < ۸ ساعت |

### Moderation Decisions

| وضعیت          | شرط           | تصمیم                   | مسئول       | زمان       |
| -------------- | ------------- | ----------------------- | ----------- | ---------- |
| اسپم           | تکراری + لینک | Block + Report (خودکار) | AI-013      | فوری       |
| توهین خفیف     | کلمات ممنوع   | Hide + هشدار            | AI-013      | فوری       |
| توهین شدید     | توهین مستقیم  | Block + Report + Alert  | AI-013 → MD | فوری       |
| اطلاعات نادرست | ادعای ناصحیح  | Reply تصحیح + لینک منبع | AI-013      | < ۳۰ دقیقه |

### Crisis Activation

| وضعیت          | شرط                        | تصمیم                                    | مسئول       | زمان       |
| -------------- | -------------------------- | ---------------------------------------- | ----------- | ---------- |
| Trend منفی     | Mentions > ۱۰۰ در < ۱ ساعت | فعال‌سازی Crisis Alert                   | AI-009 → MD | فوری       |
| بحران تأییدشده | تأیید MD                   | قفل انتشار + بیانیه + Hold all scheduled | MD + Legal  | < ۱۵ دقیقه |
| False Alarm    | پس از بررسی                | لغو Crisis + Resume                      | MD          | < ۳۰ دقیقه |

---

## ۳۰. Validation Rules

### قواعد عمومی (از PLAT-000 — همه الزامی)

تمام ۳۵ قاعده VAL-001 تا VAL-035 از [PLAT-000 §۲۵](../00-platform-playbook-standard.md#۲۵-validation-rules) برای PLAT-004 الزامی است.

### قواعد اختصاصی ایکس

| #         | قاعده                                                         | توضیح                    | نوع |
| --------- | ------------------------------------------------------------- | ------------------------ | --- |
| VAL-TW-01 | همه پست‌ها باید CT-ID معتبر از لیست سازگار داشته باشند        | invalid_ct_for_platform  |
| VAL-TW-02 | طول پست ≤ ۲۸۰ کاراکتر (free) / ≤ ۴۰۰۰ (Premium)               | invalid_post_length      |
| VAL-TW-03 | Thread ≥ ۳ پست و ≤ ۱۵ پست                                     | invalid_thread_length    |
| VAL-TW-04 | Hashtag ≥ ۱ و ≤ ۳ در هر پست                                   | invalid_hashtag_count    |
| VAL-TW-05 | #Xennic در همه پست‌ها الزامی                                  | missing_branded_hashtag  |
| VAL-TW-06 | هر پست خبری (CT-029, CT-030, CT-036~038) باید لینک داشته باشد | missing_news_link        |
| VAL-TW-07 | Crisis content (CT-036~038) فقط با تأیید Media Director       | ai_cannot_publish_crisis |
| VAL-TW-08 | تصاویر ≥ ۱۰۸۰px پهنا و ≤ ۵MB                                  | invalid_image_spec       |
| VAL-TW-09 | ویدئو ≤ ۲:۲۰ دقیقه (standard) یا ≤ ۶۰ دقیقه (Premium)         | invalid_video_duration   |
| VAL-TW-10 | Quote از حساب‌های موجود در لیست سیاه ممنوع                    | blocked_account_quote    |
| VAL-TW-11 | لینک‌ها همیشه با URL shortener سازمانی                        | missing_short_link       |
| VAL-TW-12 | اولین پست روز باید توسط انسان تأیید شود                       | missing_human_first_post |
| VAL-TW-13 | فاصله بین دو پست ≥ ۱۵ دقیقه                                   | min_interval_violation   |

---

## ۳۱. Quality Gates

### گیت‌های کیفیت (از PLAT-000 — همه الزامی)

تمام ۷ گیت کیفیت از [PLAT-000 §۳۰](../00-platform-playbook-standard.md#۳۰-quality-gates) برای PLAT-004 الزامی است:
۱. Architecture Review
۲. Brand Review
۳. Editorial Review
۴. Governance Review
۵. Automation Review
۶. AI Review
۷. Compliance Review

### گیت‌های اختصاصی ایکس

| #   | گیت                       | مسئول          | معیارها                                                       | خروجی               |
| --- | ------------------------- | -------------- | ------------------------------------------------------------- | ------------------- |
| ۱   | **News Accuracy Gate**    | AI-005 + Human | Fact Check, Source Verification, Date/Time Accuracy           | تأیید صحت خبری      |
| ۲   | **Thread Structure Gate** | AI-004         | Thread length, Sequence numbering, CTA in last post, Cohesion | تأیید ساختار Thread |
| ۳   | **Hashtag Gate**          | AI-004         | Hashtag count, Branded hashtag, Trend relevance               | تأیید هشتگ          |
| ۴   | **CT-Compatibility Gate** | AI-004         | CT-ID در لیست سازگار با ایکس                                  | تأیید CT            |
| ۵   | **Speed Gate**            | AI-009         | News time-to-publish < ۳۰ min; Crisis < ۱۵ min                | تأیید سرعت          |

---

## ۳۲. Compliance Checklist

### چک‌لیست عمومی (از PLAT-000 — همه الزامی)

تمام ۲۳ آیتم C-01 تا C-23 از [PLAT-000 §۳۱](../00-platform-playbook-standard.md#۳۱-compliance-checklist) برای PLAT-004 الزامی است.

### چک‌لیست اختصاصی ایکس

| #       | مورد                                                            | تأیید |
| ------- | --------------------------------------------------------------- | ----- |
| C-TW-01 | همه CT-IDهای استفاده‌شده در لیست سازگار با ایکس هستند           | □     |
| C-TW-02 | Caption Guidelines با BRD-001 و BRD-002 مطابقت دارد             | □     |
| C-TW-03 | Hashtag Strategy شامل #Xennic است                               | □     |
| C-TW-04 | AI Agent Mapping کامل و دقیق است                                | □     |
| C-TW-05 | همه Post Types تعریف شده‌اند (Post, Thread, Reply, Quote, Poll) | □     |
| C-TW-06 | Automation Interfaces به AUT-\*های معتبر ارجاع می‌دهند          | □     |
| C-TW-07 | Crisis protocol تعریف شده است                                   | □     |
| C-TW-08 | هیچ محتوای استراتژیک از ARCH-020 تکرار نشده است                 | □     |
| C-TW-09 | هیچ تعریف CT-ID از EDT-002 تکرار نشده است                       | □     |
| C-TW-10 | Thread Architecture تعریف و مستند شده است                       | □     |
| C-TW-11 | Trend Monitoring و Knowledge Capture تعریف شده است              | □     |
| C-TW-12 | Response Templates برای همه وضعیت‌ها تعریف شده است              | □     |

---

## ۳۳. Change Log

| نسخه        | تاریخ      | تغییر                                                    | توسط             |
| ----------- | ---------- | -------------------------------------------------------- | ---------------- |
| ۱.۰.۰-draft | 2026-06-27 | انتشار اولیه — کتابچه عملیاتی X/Twitter با نقش News (P2) | مدیر پلتفرم ایکس |

---

## ۳۴. Reading Guide

### راهنمای خواندن این سند

| مخاطب                      | بخش‌های کلیدی       | اقدام                            |
| -------------------------- | ------------------- | -------------------------------- |
| **مدیر پلتفرم ایکس**       | ۱-۱۱, ۳۰-۳۲         | مدیریت روزانه ایکس               |
| **تولیدکننده محتوای خبری** | ۱۲-۱۷, ۱۹-۲۰        | تولید محتوای خبری مطابق با قواعد |
| **AI Agent Developer**     | ۲۵, ۲۶, ۲۷, ۲۸      | پیاده‌سازی Agentها برای ایکس     |
| **مهندس اتوماسیون**        | ۲۶, ۲۷              | پیاده‌سازی Workflowهای n8n       |
| **مدیر برند**              | ۴, ۱۸-۲۰, ۳۱        | تطابق با برند                    |
| **تیم بحران**              | ۱۶, ۲۹ (Crisis), ۳۰ | مدیریت بحران در ایکس             |
| **AI Agents**              | ۲۴, ۲۵, ۲۸, ۲۹      | اجرای فرایندهای خودکار           |

### مسیر خواندن وابسته

```
برای درک کامل کتابچه X/Twitter:
1. [PLAT-000](../00-platform-playbook-standard.md) — قالب مادر کتابچه پلتفرم
2. [ARCH-020](../../00-ARCHITECTURE/20-enterprise-multi-platform-strategy.md) — استراتژی چندپلتفرمی
3. [BRD-001](../../22-BRAND/10-brand-identity.md) — هویت برند Xennic
4. [BRD-002](../../22-BRAND/20-brand-voice.md) — معماری صدای برند
5. [EDT-002](../../24-EDITORIAL/20-content-taxonomy.md) — طبقه‌بندی محتوا
6. PLAT-004 (این سند) — کتابچه X/Twitter
```

---

## تغییرات

| نسخه        | تاریخ      | تغییر        | توسط             |
| ----------- | ---------- | ------------ | ---------------- |
| ۱.۰.۰-draft | 2026-06-27 | انتشار اولیه | مدیر پلتفرم ایکس |
