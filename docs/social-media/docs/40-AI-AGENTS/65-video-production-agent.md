# AI-007 — Video Production Agent Architecture

> **شناسه:** AI-007
> **نام:** Video Production Agent
> **نوع:** Specialist (AT-01)
> **خانواده:** Content (FAM-02)
> **سطح اختیار:** A-3 (Autonomous, Limited) — ▲ از A-2
> **لایه عملیاتی:** LYR-03 (Execution)
> **نسخه:** 1.0.0-draft
> **پیش‌نیاز:** AI-000 (§۴, §۶, §۱۰, §۱۷, §۲۶, §۳۰)
> **مصرف‌کننده:** AI-003 (Content Production)
> **تأمین‌کننده:** AI-008 (Publishing)

---

## ۱. Identity

| شناسه                 | مقدار                     |
| --------------------- | ------------------------- |
| **AI-ID**             | AI-007                    |
| **Canonical Name**    | Video Production Agent    |
| **نام فارسی**         | عامل تولید ویدئو          |
| **Agent Type**        | Specialist (AT-01)        |
| **Family**            | Content (FAM-02)          |
| **Authority Level**   | A-3 (Autonomous, Limited) |
| **Operational Layer** | LYR-03 (Execution)        |
| **Version**           | 1.0.0-draft               |
| **Status**            | Architecture Definition   |

### Position in Enterprise Pipeline

```
AI-003 (Content Production) ──→ AI-004 (Review) ──→ AI-005 (Discoverability)
                                                              │
                                                              ▼
                                                    AI-006 (Media Asset)
                                                              │
                                                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                        AI-007 (Video)                            │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                      AI-008 (Publishing)
```

---

## ۲. Mission

تولید ویدئوی سازمانی از محتوای متعارف تأییدشده و بهینه‌شده. AI-007 اسکریپت، بلوک‌های محتوایی و دارایی‌های رسانه‌ای را به ویدئوی حرفه‌ای قابل انتشار در پلتفرم‌های هدف تبدیل می‌کند. خروجی AI-007 مستقل از پلتفرم است و AI-008 مسئول تطبیق نهایی با پلتفرم و انتشار است.

---

## ۳. Responsibilities

### Primary Responsibilities

| ID     | Responsibility                    | توضیح                                                               |
| ------ | --------------------------------- | ------------------------------------------------------------------- |
| RSP-01 | **Script-to-Video Conversion**    | تبدیل اسکریپت متنی به ویدئوی کامل با voiceover, timing, visual flow |
| RSP-02 | **Video Rendering**               | رندر نهایی ویدئو با کیفیت مناسب برای پلتفرم هدف                     |
| RSP-03 | **Post-Production Editing**       | تدوین، برش، انتقال، افکت، رنگ، صدا                                  |
| RSP-04 | **Multi-Format Adaptation**       | تولید نسخه‌های مختلف (Landscape, Portrait, Square, Shorts/Reels)    |
| RSP-05 | **Caption & Subtitle Generation** | تولید زیرنویس و کپشن خودکار + هاردکد                                |
| RSP-06 | **Thumbnail Design**              | تولید تصویر بند انگشتی متناسب با محتوا و پلتفرم (با مصرف AI-006)    |
| RSP-07 | **Audio Production**              | voiceover TTS یا دوبله، موزیک پس‌زمینه، افکت صوتی                   |
| RSP-08 | **Platform Compliance**           | تطابق با مشخصات فنی پلتفرم (فرمت، رزولوشن، مدت، حجم)                |
| RSP-09 | **Asset Optimization**            | بهینه‌سازی حجم و کیفیت برای تحویل سریع                              |
| RSP-10 | **Version Management**            | نگهداری نسخه‌های مختلف ویدئو و متادیتای آن                          |
| RSP-11 | **Metadata Generation**           | تولید متادیتای ویدئو (Title, Description, Tags, Chapters, Cards)    |
| RSP-12 | **Quality Check**                 | بررسی کیفیت بصری، صوتی، محتوایی قبل از تحویل                        |
| RSP-13 | **Chapter & Segment Structuring** | تقسیم ویدئو به بخش‌های معنایی با timestamp                          |

### Secondary Responsibilities

| ID     | Responsibility               | توضیح                                                 |
| ------ | ---------------------------- | ----------------------------------------------------- |
| RSP-14 | **Best Practice Monitoring** | به‌روزرسانی دانش خود با ترندها و تکنیک‌های جدید ویدئو |
| RSP-15 | **Content Archiving**        | آرشیو نسخه‌های نهایی با متادیتا                       |

### Non-Responsibilities

| ID     | Non-Responsibility          | دلیل        |
| ------ | --------------------------- | ----------- |
| NRS-01 | **Content Creation (Text)** | حوزه AI-003 |
| NRS-02 | **Publishing**              | حوزه AI-008 |
| NRS-03 | **Strategy Decision**       | حوزه AI-001 |
| NRS-04 | **Scheduling**              | حوزه AI-002 |
| NRS-05 | **SEO Optimization**        | حوزه AI-005 |
| NRS-06 | **Media Asset Design**      | حوزه AI-006 |
| NRS-07 | **Quality Approval**        | حوزه AI-004 |
| NRS-08 | **Analytics**               | حوزه AI-010 |
| NRS-09 | **Community Management**    | حوزه Human  |
| NRS-10 | **Brand Governance**        | حوزه Human  |

---

## ۴. Capabilities

### Core Capability

| ID     | Capability           | توضیح                                         |
| ------ | -------------------- | --------------------------------------------- |
| CAP-01 | **Video Production** | تولید ویدئوی حرفه‌ای از اسکریپت تا رندر نهایی |

### Supporting Capabilities

| ID     | Capability               | توضیح                                                      |
| ------ | ------------------------ | ---------------------------------------------------------- |
| CAP-02 | **Script-to-Video**      | تحلیل اسکریپت و تبدیل خودکار به Storyboard و Timeline      |
| CAP-03 | **Video Editing**        | تدوین غیرخطی، برش، transition, color grading, sound mixing |
| CAP-04 | **Format Adaptation**    | تولید خودکار نسخه‌های Portrait, Square, Landscape, Short   |
| CAP-05 | **Subtitle & Caption**   | تولید و همگام‌سازی زیرنویس و کپشن با ویدئو                 |
| CAP-06 | **Thumbnail Generation** | طراحی و تولید تصویر بند انگشتی جذاب و Informative          |
| CAP-07 | **Platform Compliance**  | رعایت مشخصات فنی همه پلتفرم‌های هدف                        |

### Collaborative Capabilities

| ID     | Capability             | همکار  | توضیح                                                                         |
| ------ | ---------------------- | ------ | ----------------------------------------------------------------------------- |
| CAP-08 | **Content Intake**     | AI-003 | دریافت بلوک‌های محتوایی و اسکریپت                                             |
| CAP-09 | **Media Asset Intake** | AI-006 | دریافت دارایی‌های رسانه‌ای (تصویر، گرافیک، اینفوگرافیک) برای استفاده در ویدئو |
| CAP-10 | **Publishing Handoff** | AI-008 | تحویل ویدئوی نهایی + متادیتا به عامل انتشار                                   |

### Reflexive Capability

| ID     | Capability          | توضیح                                      |
| ------ | ------------------- | ------------------------------------------ |
| CAP-11 | **Self-Assessment** | ارزیابی کیفیت ویدئوی تولیدشده قبل از تحویل |

---

## ۵. Inputs

| ID    | Input                       | Source  | توضیح                                                        |
| ----- | --------------------------- | ------- | ------------------------------------------------------------ |
| IN-01 | **Content Blocks**          | AI-003  | بلوک‌های محتوایی ساختاریافته شامل اسکریپت، دیالوگ، ساختار    |
| IN-02 | **Media Assets**            | AI-006  | تصاویر، گرافیک، اینفوگرافیک، پس‌زمینه، لوگو                  |
| IN-03 | **Brand Identity**          | BRD-001 | هویت بصری برند برای رنگ، فونت، لوگو در ویدئو                 |
| IN-04 | **Brand Voice Guidelines**  | BRD-002 | راهنمای voiceover, لحن, اصطلاحات                             |
| IN-05 | **Platform Specifications** | PLAT-\* | مشخصات فنی هر پلتفرم (رزولوشن، Duration, Format, Size Limit) |
| IN-06 | **Content Taxonomy**        | EDT-002 | نوع محتوا برای انتخاب قالب ویدئویی مناسب                     |
| IN-07 | **Knowledge Repository**    | KNW-\*  | دانش مرجع برای accuracy محتوای ویدئو                         |

---

## ۶. Outputs

| ID     | Output                       | Consumer             | توضیح                                                   |
| ------ | ---------------------------- | -------------------- | ------------------------------------------------------- |
| OUT-01 | **Canonical Video Asset**    | AI-008               | ویدئوی نهایی (Master) — بالاترین کیفیت، مستقل از پلتفرم |
| OUT-02 | **Platform-Specific Videos** | AI-008               | نسخه‌های تطبیق‌یافته با پلتفرم‌های هدف                  |
| OUT-03 | **Video Metadata**           | AI-008, KNW          | Title, Description, Tags, Chapters, Cards, Timestamps   |
| OUT-04 | **Captions & Subtitles**     | AI-008               | فایل‌های SRT/VTT + هاردکد (اختیاری)                     |
| OUT-05 | **Thumbnails**               | AI-008               | تصاویر بند انگشتی در ابعاد مختلف                        |
| OUT-06 | **Video Transcript**         | AI-008, KNW          | متن کامل گفتار ویدئو برای SEO و Archive                 |
| OUT-07 | **Video Manifest**           | AI-008, Orchestrator | مانیفست شامل نسخه، وضعیت رندر، شناسه دارایی             |
| OUT-08 | **Quality Report**           | AI-004, KNW          | گزارش کیفیت بصری، صوتی و انطباق با برند                 |

---

## ۷. Context Requirements

### Global Context (ثابت)

| منبع             | شناسه   | کاربرد                           |
| ---------------- | ------- | -------------------------------- |
| Brand Identity   | BRD-001 | هویت بصری، رنگ‌ها، فونت‌ها، لوگو |
| Brand Voice      | BRD-002 | لحن voiceover, زبان بدن          |
| Platform Specs   | PLAT-\* | مشخصات فنی ویدئو در هر پلتفرم    |
| Content Taxonomy | EDT-002 | نوع محتوا و قالب ویدئویی         |
| Brand Governance | BRD-001 | مرزهای بصری و محتوایی            |

### Session Context (متغیر)

| منبع           | شناسه | کاربرد                     |
| -------------- | ----- | -------------------------- |
| Content Blocks | IN-01 | اسکریپت و ساختار جلسه جاری |
| Media Assets   | IN-02 | دارایی‌های بصری جلسه جاری  |

---

## ۸. Knowledge Requirements

### منابع دانش

| اولویت | منبع    | نحوه دسترسی          | سطح دسترسی       |
| ------ | ------- | -------------------- | ---------------- |
| ۱      | BRD-001 | هویت بصری برند       | Read-Only Global |
| ۲      | PLAT-\* | مشخصات فنی پلتفرم‌ها | Read-Only Global |
| ۳      | EDT-002 | تاکسونومی محتوا      | Read-Only Global |
| ۴      | KNW-\*  | دانش مرجع            | Read-Only Global |

### قواعد دانش

1. AI-007 هرگز از هویت بصری برند خارج نمی‌شود
2. همه ویدئوها باید با مشخصات فنی پلتفرم هدف مطابقت داشته باشند
3. AI-007 از دارایی‌های AI-006 استفاده می‌کند — آنها را تولید نمی‌کند
4. AI-007 کیفیت را قبل از تحویل به AI-008 بررسی می‌کند

---

## ۹. Decision Authority

AI-007 در سطح **A-3** (Autonomous, Limited) عمل می‌کند — ارتقاء از A-2 مطابق معماری مادر.

### حوزه اختیار

| نوع تصمیم   | شناسه  | سطح | توضیح                                 |
| ----------- | ------ | --- | ------------------------------------- |
| **Format**  | DCS-01 | A-3 | انتخاب نسخه ویدئویی مناسب برای پلتفرم |
| **Editing** | DCS-02 | A-3 | تصمیمات تدوینی (برش، انتقال، افکت)    |
| **Quality** | DCS-03 | A-3 | تشخیص کیفیت قابل قبول                 |

### تصمیمات مجاز

| ID     | تصمیم                  | خودکار | محدودیت            |
| ------ | ---------------------- | ------ | ------------------ |
| ACT-01 | انتخاب قالب ویدئو      | بله    | بر اساس پلتفرم هدف |
| ACT-02 | انتخاب voiceover style | بله    | در چارچوب BRD-002  |
| ACT-03 | انتخاب موزیک پس‌زمینه  | بله    | از کتابخانه مجاز   |
| ACT-04 | تولید زیرنویس          | بله    | خودکار             |
| ACT-05 | تولید تصویر بند انگشتی | بله    | با رعایت BRD-001   |

### تصمیمات ممنوع

| ID      | تصمیم ممنوع           | دلیل                 |
| ------- | --------------------- | -------------------- |
| FORB-01 | انتشار ویدئو          | حوزه AI-008          |
| FORB-02 | تغییر محتوای اسکریپت  | حوزه AI-003          |
| FORB-03 | تغییر هویت برند       | حوزه Human + BRD-001 |
| FORB-04 | حذف دارایی‌های AI-006 | نقض یکپارچگی         |

---

## ۱۰. Communication Interfaces

### رویدادهای صادره

| ID     | رویداد                       | علت                         | گیرنده               |
| ------ | ---------------------------- | --------------------------- | -------------------- |
| EVT-01 | `video.production.completed` | ویدئو تولید و آماده تحویل   | AI-008, Orchestrator |
| EVT-02 | `video.quality.assessed`     | گزارش کیفیت ویدئو آماده است | AI-004               |
| EVT-03 | `video.production.failed`    | خطا در تولید ویدئو          | Orchestrator         |
| EVT-04 | `video.version.created`      | نسخه جدید ویدئو ساخته شد    | KNW                  |

### رویدادهای وارده

| ID     | رویداد                   | فرستنده | عکس‌العمل               |
| ------ | ------------------------ | ------- | ----------------------- |
| EVT-05 | `content.blocks.ready`   | AI-003  | شروع فرایند تولید ویدئو |
| EVT-06 | `media.assets.ready`     | AI-006  | دریافت دارایی‌های بصری  |
| EVT-07 | `platform.specs.updated` | PLAT-\* | بازبینی پارامترهای رندر |

---

## ۱۱. Collaboration Matrix

### مصرف‌کنندگان

| Agent            | شناسه  | خروجی دریافتی                                                                                       |
| ---------------- | ------ | --------------------------------------------------------------------------------------------------- |
| **Publishing**   | AI-008 | OUT-01 (Video), OUT-02 (Platform Videos), OUT-03 (Metadata), OUT-04 (Captions), OUT-05 (Thumbnails) |
| **Review**       | AI-004 | OUT-08 (Quality Report)                                                                             |
| **Knowledge**    | AI-011 | OUT-03 (Metadata), OUT-06 (Transcript)                                                              |
| **Orchestrator** | Human  | OUT-07 (Manifest)                                                                                   |

### تأمین‌کنندگان

| Agent                      | شناسه  | ورودی ارسالی           |
| -------------------------- | ------ | ---------------------- |
| **Content Production**     | AI-003 | IN-01 (Content Blocks) |
| **Media Asset Production** | AI-006 | IN-02 (Media Assets)   |

### همکاران

| Agent                  | شناسه  | نوع همکاری                                      |
| ---------------------- | ------ | ----------------------------------------------- |
| **Media Asset**        | AI-006 | تأمین دارایی‌های بصری برای درون ویدئو و تامبنیل |
| **Content Production** | AI-003 | تأمین اسکریپت و ساختار محتوایی                  |

---

## ۱۲. Delegation Rules

| نوع           | شناسه  | توضیح                                                                                        |
| ------------- | ------ | -------------------------------------------------------------------------------------------- |
| **Chain**     | DLG-01 | AI-003 پس از تولید بلوک‌های محتوایی به AI-007 (از طریق AI-004, AI-005, AI-006) واگذار می‌کند |
| **Chain**     | DLG-02 | AI-007 پس از تولید ویدئو به AI-008 برای انتشار واگذار می‌کند                                 |
| **Broadcast** | DLG-03 | AI-007 پس از اتمام به AI-004 (کیفیت), KNW (آرشیو) و Orchestrator (مانیفست) اطلاع می‌دهد      |

### مسیر Delegation

```
AI-003 → AI-004 → AI-005 → AI-006 ──→ AI-007 → AI-008
                                      (این Agent)
```

---

## ۱۳. Escalation Rules

| ID     | شرط                                           | سطح | اقدام                          |
| ------ | --------------------------------------------- | --- | ------------------------------ |
| ESC-01 | اسکریپت برای تبدیل به ویدئو ناقص است          | E-1 | درخواست تکمیل از AI-003        |
| ESC-02 | دارایی‌های بصری برای ویدئو کافی نیست          | E-1 | درخواست دارایی بیشتر از AI-006 |
| ESC-03 | مشخصات پلتفرم با قابلیت‌های فعلی ناسازگار است | E-2 | ارجاع به Architecture Review   |
| ESC-04 | کیفیت ویدئو زیر آستانه قابل قبول              | E-1 | تلاش مجدد با پارامترهای جدید   |
| ESC-05 | ویدئو با هویت برند مغایرت دارد                | E-2 | ارجاع به Brand Governance      |

---

## ۱۴. Human Override

| نوع                    | شناسه  | شرایط                                | سطح مجاز         |
| ---------------------- | ------ | ------------------------------------ | ---------------- |
| **Soft Override**      | OVR-01 | تغییر قالب یا سبک ویدئو              | Content Manager  |
| **Hard Override**      | OVR-02 | لغو ویدئو و درخواست بازتولید         | Content Director |
| **Emergency Override** | OVR-03 | انتشار فوری ویدئو بدون Quality Check | Media Director   |

### فرایند Override

1. AI-007 ویدئو را با پارامترهای استاندارد تولید می‌کند
2. انسان در صورت نیاز Override اعمال می‌کند
3. همه Overrideها در Video Manifest ثبت می‌شوند

---

## ۱۵. KPIs

| ID     | KPI                           | واحد                                | هدف                  | منبع   |
| ------ | ----------------------------- | ----------------------------------- | -------------------- | ------ |
| KPI-01 | **Rendering Success Rate**    | % رندرهای موفق                      | >= ۹۵٪               | System |
| KPI-02 | **Format Compliance Rate**    | % تطابق با مشخصات پلتفرم            | >= ۹۸٪               | AI-008 |
| KPI-03 | **Video Turnaround Time**     | زمان از دریافت تا تحویل             | <= ۲ ساعت            | System |
| KPI-04 | **Quality Pass Rate**         | % ویدئوهای عبورکرده از Quality Gate | >= ۹۰٪               | AI-004 |
| KPI-05 | **Platform Adaptation Count** | تعداد نسخه‌های پلتفرمی تولیدشده     | >= ۳ / ویدئو         | System |
| KPI-06 | **Asset Utilization Rate**    | % استفاده از دارایی‌های AI-006      | >= ۸۰٪               | System |
| KPI-07 | **Thumbnail Click-Through**   | % CTR تامبنیل                       | مطابق بنچمارک پلتفرم | AI-010 |
| KPI-08 | **Caption Accuracy**          | % دقت زیرنویس خودکار                | >= ۹۵٪               | AI-004 |
| KPI-09 | **Brand Compliance Score**    | % انطباق با BRD-001/BRD-002         | >= ۹۵٪               | AI-004 |
| KPI-10 | **Output Consistency**        | % ویدئوهای بدون بازبینی یا بازتولید | >= ۸۵٪               | Audit  |

---

## ۱۶. Validation Rules

| ID    | قانون                                        | نقض            | عکس‌العمل     |
| ----- | -------------------------------------------- | -------------- | ------------- |
| VR-01 | اسکریپت کامل و قابل تبدیل به ویدئو است       | ناقص           | درخواست تکمیل |
| VR-02 | ویدئو با مشخصات فنی پلتفرم هدف مطابقت دارد   | عدم تطابق      | اصلاح         |
| VR-03 | ویدئو با هویت بصری برند (BRD-001) سازگار است | مغایرت         | اصلاح         |
| VR-04 | voiceover با BRD-002 هماهنگ است              | عدم هماهنگی    | اصلاح         |
| VR-05 | کیفیت بصری ویدئو بالاتر از آستانه است        | کیفیت پایین    | بازتولید      |
| VR-06 | کیفیت صوتی ویدئو بالاتر از آستانه است        | کیفیت پایین    | بازتولید      |
| VR-07 | زیرنویس‌ها با ویدئو همگام هستند              | ناهمگام        | اصلاح         |
| VR-08 | تصویر بند انگشتی جذاب و مرتبط است            | نامرتبط        | بازطراحی      |
| VR-09 | حجم ویدئو در محدوده مجاز است                 | حجم بالا       | بهینه‌سازی    |
| VR-10 | متادیتا (Title, Description, Tags) کامل است  | ناقص           | تکمیل         |
| VR-11 | ویدئو محتوای ممنوعه ندارد                    | محتوای ممنوع   | اصلاح یا حذف  |
| VR-12 | نسخه‌های پلتفرمی همه تولید شده‌اند           | ناقص           | تکمیل         |
| VR-13 | مانیفست ویدئو کامل است                       | ناقص           | تکمیل         |
| VR-14 | دارایی‌های AI-006 به درستی استفاده شده‌اند   | استفاده نادرست | اصلاح         |
| VR-15 | خودارزیابی کامل و صادقانه است                | ناقص           | تجدید         |

---

## ۱۷. Quality Gates

هر Canonical Video Asset (OUT-01) قبل از تحویل به AI-008 از ۵ گیت کیفیت عبور می‌کند:

```
IN-01..IN-07 (Script + Assets + Brand + Platform Specs)
  │
  ▼
GATE-1: Script & Structure
  │  بررسی: اسکریپت کامل و قابل تبدیل
  │
  ▼
GATE-2: Visual Quality
  │  بررسی: کیفیت تصویر، رنگ، lighting, composition
  │
  ▼
GATE-3: Audio Quality
  │  بررسی: voiceover, موزیک, افکت‌ها, synchronization
  │
  ▼
GATE-4: Brand & Platform Compliance
  │  بررسی: انطباق با BRD-001, BRD-002, PLAT-*
  │
  ▼
GATE-5: Self-Assessment
  │  بررسی: خودارزیابی کیفیت
  │
  ▼
OUT-01..OUT-08 (Video Package)
```

| ID         | Gate                        | معیار عبور                     | عکس‌العمل در رد             |
| ---------- | --------------------------- | ------------------------------ | --------------------------- |
| **GATE-1** | Script & Structure          | اسکریپت کامل، Storyboard معتبر | درخواست بازبینی از AI-003   |
| **GATE-2** | Visual Quality              | کیفیت >= آستانه                | بازتولید با پارامترهای جدید |
| **GATE-3** | Audio Quality               | کیفیت >= آستانه                | بازتولید با mixer جدید      |
| **GATE-4** | Brand & Platform Compliance | انطباق کامل                    | اصلاح یا Escalation         |
| **GATE-5** | Self-Assessment             | خودارزیابی کامل                | تجدید                       |

---

## ۱۸. Machine Readable JSON Blocks

### Block 1 — Identity

```json
{
  "agent": {
    "id": "AI-007",
    "name": "Video Production Agent",
    "type": "specialist",
    "family": "FAM-02",
    "authority_level": "A-3",
    "operational_layer": "LYR-03",
    "version": "1.0.0-draft"
  }
}
```

### Block 2 — Capabilities

```json
{
  "capabilities": {
    "core": { "id": "CAP-01", "name": "Video Production" },
    "supporting": [
      { "id": "CAP-02", "name": "Script-to-Video" },
      { "id": "CAP-03", "name": "Video Editing" },
      { "id": "CAP-04", "name": "Format Adaptation" },
      { "id": "CAP-05", "name": "Subtitle & Caption Generation" },
      { "id": "CAP-06", "name": "Thumbnail Generation" },
      { "id": "CAP-07", "name": "Platform Compliance" }
    ],
    "collaborative": [
      { "id": "CAP-08", "name": "Content Intake", "target": "AI-003" },
      { "id": "CAP-09", "name": "Media Asset Intake", "target": "AI-006" },
      { "id": "CAP-10", "name": "Publishing Handoff", "target": "AI-008" }
    ],
    "reflexive": { "id": "CAP-11", "name": "Self-Assessment" }
  }
}
```

### Block 3 — Responsibilities

```json
{
  "responsibilities": {
    "primary": [
      { "id": "RSP-01", "name": "Script-to-Video Conversion" },
      { "id": "RSP-02", "name": "Video Rendering" },
      { "id": "RSP-03", "name": "Post-Production Editing" },
      { "id": "RSP-04", "name": "Multi-Format Adaptation" },
      { "id": "RSP-05", "name": "Caption & Subtitle Generation" },
      { "id": "RSP-06", "name": "Thumbnail Design" },
      { "id": "RSP-07", "name": "Audio Production" },
      { "id": "RSP-08", "name": "Platform Compliance" },
      { "id": "RSP-09", "name": "Asset Optimization" },
      { "id": "RSP-10", "name": "Version Management" },
      { "id": "RSP-11", "name": "Metadata Generation" },
      { "id": "RSP-12", "name": "Quality Check" },
      { "id": "RSP-13", "name": "Chapter & Segment Structuring" }
    ],
    "secondary": [
      { "id": "RSP-14", "name": "Best Practice Monitoring" },
      { "id": "RSP-15", "name": "Content Archiving" }
    ],
    "non_responsibility": [
      { "id": "NRS-01", "name": "Content Creation" },
      { "id": "NRS-02", "name": "Publishing" },
      { "id": "NRS-03", "name": "Strategy Decision" },
      { "id": "NRS-04", "name": "Scheduling" },
      { "id": "NRS-05", "name": "SEO Optimization" },
      { "id": "NRS-06", "name": "Media Asset Design" },
      { "id": "NRS-07", "name": "Quality Approval" },
      { "id": "NRS-08", "name": "Analytics" },
      { "id": "NRS-09", "name": "Community Management" },
      { "id": "NRS-10", "name": "Brand Governance" }
    ]
  }
}
```

### Block 4 — Inputs & Outputs

```json
{
  "inputs": {
    "IN-01": { "name": "Content Blocks", "source": "AI-003" },
    "IN-02": { "name": "Media Assets", "source": "AI-006" },
    "IN-03": { "name": "Brand Identity", "source": "BRD-001" },
    "IN-04": { "name": "Brand Voice Guidelines", "source": "BRD-002" },
    "IN-05": { "name": "Platform Specifications", "source": "PLAT-*" },
    "IN-06": { "name": "Content Taxonomy", "source": "EDT-002" },
    "IN-07": { "name": "Knowledge Repository", "source": "KNW-*" }
  },
  "outputs": {
    "OUT-01": { "name": "Canonical Video Asset", "consumers": ["AI-008"] },
    "OUT-02": { "name": "Platform-Specific Videos", "consumers": ["AI-008"] },
    "OUT-03": { "name": "Video Metadata", "consumers": ["AI-008", "KNW"] },
    "OUT-04": { "name": "Captions & Subtitles", "consumers": ["AI-008"] },
    "OUT-05": { "name": "Thumbnails", "consumers": ["AI-008"] },
    "OUT-06": { "name": "Video Transcript", "consumers": ["AI-008", "KNW"] },
    "OUT-07": { "name": "Video Manifest", "consumers": ["AI-008", "Orchestrator"] },
    "OUT-08": { "name": "Quality Report", "consumers": ["AI-004", "KNW"] }
  }
}
```

### Block 5 — Events

```json
{
  "events": {
    "published": [
      "EVT-01": "video.production.completed",
      "EVT-02": "video.quality.assessed",
      "EVT-03": "video.production.failed",
      "EVT-04": "video.version.created"
    ],
    "subscribed": [
      "EVT-05": "content.blocks.ready",
      "EVT-06": "media.assets.ready",
      "EVT-07": "platform.specs.updated"
    ]
  }
}
```

### Block 6 — KPIs

```json
{
  "kpis": [
    { "id": "KPI-01", "name": "Rendering Success Rate", "target": ">= 95%" },
    { "id": "KPI-02", "name": "Format Compliance Rate", "target": ">= 98%" },
    { "id": "KPI-03", "name": "Video Turnaround Time", "target": "<= 2 hours" },
    { "id": "KPI-04", "name": "Quality Pass Rate", "target": ">= 90%" },
    { "id": "KPI-05", "name": "Platform Adaptation Count", "target": ">= 3 / video" },
    { "id": "KPI-06", "name": "Asset Utilization Rate", "target": ">= 80%" },
    { "id": "KPI-07", "name": "Thumbnail Click-Through", "target": "platform benchmark" },
    { "id": "KPI-08", "name": "Caption Accuracy", "target": ">= 95%" },
    { "id": "KPI-09", "name": "Brand Compliance Score", "target": ">= 95%" },
    { "id": "KPI-10", "name": "Output Consistency", "target": ">= 85%" }
  ]
}
```

---

> **AI-007 هفتمین Agent مشخص SMOS — عامل تولید ویدئوی سازمانی. خانواده محتوا (FAM-02). سطح A-3 (▲ از A-2). مصرف‌کننده AI-003 و AI-006، تأمین‌کننده AI-008. مشتق از AI-000.**
