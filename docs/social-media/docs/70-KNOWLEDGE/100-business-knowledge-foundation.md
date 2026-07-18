# Enterprise Business Knowledge Foundation — پایه دانش کسب‌وکار سازمانی

> **شناسه:** KNW-101
> **وضعیت:** پیش‌نویس
> **نسخه:** 1.0.0-draft
> **به‌روزرسانی:** 2026-06-29
> **مسئول:** معمار دانش سازمانی
> **وابستگی:** [KNW-000](./00-enterprise-knowledge-architecture.md), [KNW-001](./10-knowledge-index.md), [CON-000](../05-CONSTITUTION/00-constitution.md), [ARCH-003](../00-ARCHITECTURE/03-canonical-vocabulary.md)
> **مخاطب:** human, ai-agent, knowledge-engineer, business-analyst

---

## ۱. Purpose

KNW-101 نخستین سند واقعی پایگاه دانش سازمانی و SSOT (تک منبع حقیقت) برای تمام مفاهیم، موجودیت‌ها و قابلیت‌های کسب‌وکار SMOS است.

### چرا KNW-101 وجود دارد

بدون یک پایه دانش کسب‌وکار:

- مفاهیم کسب‌وکار در اسناد مختلف پراکنده می‌شوند
- واژگان کسب‌وکار یکسان تعریف نمی‌شوند
- موجودیت‌های کسب‌وکار مدل مشخصی ندارند
- قابلیت‌های سازمانی قابل ردیابی نیستند
- Agentها نمی‌توانند دانش کسب‌وکار را به صورت ساختاریافته مصرف کنند

KNW-101 این مشکلات را با تعریف **چارچوب یکپارچه دانش کسب‌وکار** حل می‌کند.

### نقش KNW-101 در SMOS

| سند         | نقش                                               |
| ----------- | ------------------------------------------------- |
| CON-000     | قانون اساسی — اصول عالی                           |
| KNW-000     | معماری دانش سازمانی                               |
| KNW-001     | نمایه مرکزی دانش                                  |
| **KNW-101** | **SSOT مفاهیم، موجودیت‌ها و قابلیت‌های کسب‌وکار** |
| KNW-102+    | قوانین، سیاست‌ها و چارچوب‌های تخصصی کسب‌وکار      |

---

## ۲. Scope

### Inside Scope

| حوزه                                 | توضیح                |
| ------------------------------------ | -------------------- |
| فلسفه و اصول دانش کسب‌وکار           | هستی‌شناسی کسب‌وکار  |
| تعریف دامنه کسب‌وکار                 | مرزهای دانش کسب‌وکار |
| واژگان بنیادین کسب‌وکار              | ۲۰–۳۰ مفهوم اصلی     |
| مدل موجودیت کسب‌وکار                 | انواع موجودیت‌ها     |
| مدل قابلیت کسب‌وکار                  | قابلیت‌های سازمانی   |
| مدل وظیفه کسب‌وکار                   | وظایف و کارکردها     |
| مفاهیم فرآیند، قاعده، سیاست، محدودیت | مفاهیم انتزاعی       |
| مدل تصمیم و مسئولیت                  | ساختار تصمیم‌گیری    |
| ذی‌نفعان و روابط                     | مدل ذی‌نفعان         |

### Outside Scope

| حوزه                            | دلیل                   |
| ------------------------------- | ---------------------- |
| قوانین و سیاست‌های خاص کسب‌وکار | حوزه KNW-102           |
| داده‌ها و آمار واقعی کسب‌وکار   | حوزه سیستم‌های عملیاتی |
| پیاده‌سازی Agent                | حوزه AI-\*             |
| Workflowهای خودکار              | حوزه AUT-\*            |

---

## ۳. Business Knowledge Philosophy

### فلسفه دانش کسب‌وکار

SMOS دانش کسب‌وکار را به عنوان **زبان مشترک سازمان** می‌بیند که:

1. **توصیف‌گر است** — آنچه هست را توصیف می‌کند نه آنچه باید باشد
2. **ثابت است** — در طول زمان پایدار می‌ماند مگر با ADR تغییر کند
3. **مرجع است** — همه اسناد به آن ارجاع می‌دهند
4. **قابل مصرف است** — توسط انسان و Agent قابل درک است
5. **تک منبع است** — هر مفهوم یک خانه دارد

### اصول هستی‌شناسی کسب‌وکار

| اصل                         | توضیح                             |
| --------------------------- | --------------------------------- |
| **کسب‌وکار یک سیستم است**   | دارای ورودی، خروجی، بازخورد و هدف |
| **هر مفهوم یک تعریف دارد**  | تعریف دقیق و غیرقابل تفسیر        |
| **هر موجودیت یک نقش دارد**  | نقش در سیستم کسب‌وکار             |
| **هر قابلیت یک مالک دارد**  | مسئولیت قابلیت مشخص است           |
| **همه چیز قابل ردیابی است** | از مفهوم تا اجرا                  |

---

## ۴. Business Knowledge Principles

| ID     | اصل              | توضیح                                          |
| ------ | ---------------- | ---------------------------------------------- |
| BKP-01 | **SSOT**         | هر مفهوم کسب‌وکار تنها در KNW-101 تعریف می‌شود |
| BKP-02 | **ثبات**         | تغییر در مفاهیم پایه نیازمند ADR است           |
| BKP-03 | **ساختاریافتگی** | همه مفاهیم دارای ساختار مشخص هستند             |
| BKP-04 | **قابلیت مصرف**  | مفاهیم برای Agent و انسان قابل مصرف هستند      |
| BKP-05 | **عدم تناقض**    | هیچ دو مفهومی با یکدیگر تناقض ندارند           |
| BKP-06 | **تکامل تدریجی** | مفاهیم در طول زمان تکامل می‌یابند              |
| BKP-07 | **خنثی بودن**    | مفاهیم مستقل از هر ابزار و پلتفرم هستند        |

---

## ۵. Business Domain Definition

### دامنه کسب‌وکار SMOS

دامنه کسب‌وکار SMOS شامل تمام فعالیت‌های مرتبط با **مدیریت شبکه‌های اجتماعی سازمانی** است:

| زیردامنه    | شناسه  | توضیح                       |
| ----------- | ------ | --------------------------- |
| Strategy    | BIZ-01 | استراتژی محتوا و برند       |
| Planning    | BIZ-02 | برنامه‌ریزی محتوا و انتشار  |
| Production  | BIZ-03 | تولید محتوای متعارف و رسانه |
| Publishing  | BIZ-04 | انتشار و توزیع در پلتفرم‌ها |
| Engagement  | BIZ-05 | تعامل با جامعه و مخاطب      |
| Analytics   | BIZ-06 | تحلیل و هوش عملکرد          |
| Knowledge   | BIZ-07 | مدیریت دانش سازمانی         |
| Improvement | BIZ-08 | بهبود مستمر و بهینه‌سازی    |

### مرزهای دامنه

| درون دامنه             | بیرون از دامنه      |
| ---------------------- | ------------------- |
| مدیریت محتوای اجتماعی  | تولید محصول فیزیکی  |
| تعامل با مخاطب دیجیتال | مدیریت زنجیره تأمین |
| تحلیل عملکرد محتوا     | حسابداری مالی       |
| دانش سازمانی بازاریابی | منابع انسانی        |

---

## ۶. Enterprise Terminology Model

### مدل اصطلاحات سازمانی

| ID     | اصطلاح          | تعریف                  | مثال                   |
| ------ | --------------- | ---------------------- | ---------------------- |
| TRM-01 | Content         | محتوای دیجیتال سازمانی | پست، ویدئو، مقاله      |
| TRM-02 | Asset           | دارایی دیجیتال سازمانی | تصویر، لوگو، فایل      |
| TRM-03 | Platform        | پلتفرم اجتماعی هدف     | Instagram, LinkedIn    |
| TRM-04 | Audience        | مخاطب هدف محتوا        | دنبال‌کنندگان، مشتریان |
| TRM-05 | Campaign        | کارزار محتوایی         | کمپین فصلی             |
| TRM-06 | Metric          | شاخص اندازه‌گیری       | Reach, Engagement      |
| TRM-07 | Agent           | عامل هوشمند            | AI-001, AI-002         |
| TRM-08 | Workflow        | گردش کار خودکار        | زنجیره انتشار          |
| TRM-09 | Knowledge Asset | دارایی دانش            | KNW-NNN                |
| TRM-10 | Brand           | هویت برند سازمان       | Xennic                 |

---

## ۷. Canonical Business Vocabulary

### واژگان بنیادین کسب‌وکار

| ID     | مفهوم          | تعریف                                  |
| ------ | -------------- | -------------------------------------- |
| VOC-01 | **Enterprise** | سازمان Xennic (زر نور نیرو یکتا) در کل |
| VOC-02 | **Brand**      | هویت و شخصیت سازمان در بازار           |
| VOC-03 | **Content**    | هر پیام دیجیتال تولیدشده توسط سازمان   |
| VOC-04 | **Asset**      | هر دارایی دیجیتال با ارزش تجاری        |
| VOC-05 | **Campaign**   | مجموعه هماهنگ از فعالیت‌های محتوایی    |
| VOC-06 | **Platform**   | کانال اجتماعی برای انتشار محتوا        |
| VOC-07 | **Audience**   | گروه هدف مصرف‌کننده محتوا              |
| VOC-08 | **Engagement** | هر نوع تعامل مخاطب با محتوا            |
| VOC-09 | **Reach**      | تعداد مخاطبان منحصربه‌فرد مشاهده‌کننده |
| VOC-10 | **Conversion** | اقدام مورد نظر مخاطب (خرید، ثبت‌نام)   |
| VOC-11 | **ROI**        | بازگشت سرمایه محتوایی                  |
| VOC-12 | **KPI**        | شاخص کلیدی عملکرد سازمانی              |
| VOC-13 | **Agent**      | عامل هوشمند خودکار SMOS                |
| VOC-14 | **Workflow**   | توالی خودکار وظایف                     |
| VOC-15 | **Knowledge**  | دانش ساختاریافته سازمانی               |
| VOC-16 | **Policy**     | سیاست رسمی سازمان                      |
| VOC-17 | **Rule**       | قاعده کسب‌وکار                         |
| VOC-18 | **Process**    | فرآیند کسب‌وکار                        |
| VOC-19 | **Capability** | قابلیت سازمانی                         |
| VOC-20 | **Function**   | وظیفه کسب‌وکار                         |

---

## ۸. Business Entity Model

### مدل موجودیت کسب‌وکار

| موجودیت         | شناسه  | نوع      | توضیح            |
| --------------- | ------ | -------- | ---------------- |
| Organization    | ENT-01 | Core     | سازمان Xennic    |
| Brand           | ENT-02 | Core     | برند SMOS        |
| Product         | ENT-03 | Core     | محصولات و خدمات  |
| Content         | ENT-04 | Core     | محتوای دیجیتال   |
| Asset           | ENT-05 | Core     | دارایی دیجیتال   |
| Campaign        | ENT-06 | Temporal | کارزار محتوایی   |
| Platform        | ENT-07 | Core     | پلتفرم اجتماعی   |
| Audience        | ENT-08 | Core     | مخاطب هدف        |
| Agent           | ENT-09 | Core     | عامل هوشمند      |
| Workflow        | ENT-10 | Core     | گردش کار         |
| Metric          | ENT-11 | Core     | شاخص اندازه‌گیری |
| Knowledge Asset | ENT-12 | Core     | دارایی دانش      |

### ویژگی‌های هر موجودیت

| ویژگی      | شناسه   | اجباری | توضیح                    |
| ---------- | ------- | ------ | ------------------------ |
| شناسه یکتا | ATTR-01 | بله    | شناسه منحصربه‌فرد        |
| نام        | ATTR-02 | بله    | نام رسمی                 |
| نوع        | ATTR-03 | بله    | Core, Temporal, Abstract |
| توضیح      | ATTR-04 | خیر    | توضیح تکمیلی             |
| مالک       | ATTR-05 | بله    | نقش مالک در سازمان       |

---

## ۹. Business Capability Model

### مدل قابلیت کسب‌وکار

| قابلیت                 | شناسه  | سطح | توضیح                 |
| ---------------------- | ------ | --- | --------------------- |
| Content Strategy       | CAP-01 | L1  | تدوین استراتژی محتوا  |
| Content Planning       | CAP-02 | L1  | برنامه‌ریزی محتوا     |
| Content Production     | CAP-03 | L1  | تولید محتوای متعارف   |
| Media Production       | CAP-04 | L2  | تولید دارایی رسانه    |
| Video Production       | CAP-05 | L2  | تولید ویدئو           |
| Content Review         | CAP-06 | L1  | بازبینی و تضمین کیفیت |
| Search Optimization    | CAP-07 | L2  | بهینه‌سازی جستجو      |
| Publishing             | CAP-08 | L1  | انتشار و توزیع        |
| Community Engagement   | CAP-09 | L1  | تعامل با جامعه        |
| Analytics              | CAP-10 | L1  | تحلیل و هوش عملکرد    |
| Knowledge Management   | CAP-11 | L1  | مدیریت دانش سازمانی   |
| Research               | CAP-12 | L2  | پژوهش و تحلیل         |
| Continuous Improvement | CAP-13 | L1  | بهبود مستمر           |
| Orchestration          | CAP-14 | L2  | هماهنگ‌سازی           |

### سطوح قابلیت

| سطح | شناسه      | توضیح               |
| --- | ---------- | ------------------- |
| L1  | Core       | قابلیت اصلی سازمان  |
| L2  | Supporting | قابلیت پشتیبان      |
| L3  | Emerging   | قابلیت در حال توسعه |

---

## ۱۰. Business Function Model

### مدل وظیفه کسب‌وکار

| وظیفه               | شناسه  | قابلیت مرتبط | مسئول            |
| ------------------- | ------ | ------------ | ---------------- |
| تدوین استراتژی      | FUN-01 | CAP-01       | استراتژیست محتوا |
| برنامه‌ریزی تحریریه | FUN-02 | CAP-02       | برنامه‌ریز محتوا |
| تولید محتوا         | FUN-03 | CAP-03       | تولیدکننده محتوا |
| تولید رسانه         | FUN-04 | CAP-04       | تولیدکننده رسانه |
| تولید ویدئو         | FUN-05 | CAP-05       | تولیدکننده ویدئو |
| بازبینی محتوا       | FUN-06 | CAP-06       | بازبین محتوا     |
| بهینه‌سازی SEO      | FUN-07 | CAP-07       | متخصص SEO        |
| انتشار محتوا        | FUN-08 | CAP-08       | مدیر انتشار      |
| تعامل با جامعه      | FUN-09 | CAP-09       | مدیر جامعه       |
| تحلیل عملکرد        | FUN-10 | CAP-10       | تحلیلگر داده     |
| مدیریت دانش         | FUN-11 | CAP-11       | مدیر دانش        |
| پژوهش               | FUN-12 | CAP-12       | پژوهشگر          |
| بهبود مستمر         | FUN-13 | CAP-13       | مدیر بهبود       |
| هماهنگ‌سازی         | FUN-14 | CAP-14       | هماهنگ‌ساز       |

---

## ۱۱. Business Process Concept

### مفهوم فرآیند کسب‌وکار

| ID     | فرآیند             | توضیح           | ورودی                           | خروجی |
| ------ | ------------------ | --------------- | ------------------------------- | ----- |
| BPC-01 | Content Lifecycle  | چرخه حیات محتوا | Brief → Published Content       |
| BPC-02 | Campaign Execution | اجرای کارزار    | Campaign Plan → Campaign Report |
| BPC-03 | Knowledge Capture  | ضبط دانش        | Raw Data → Knowledge Asset      |
| BPC-04 | Performance Review | بازبینی عملکرد  | Metrics → Improvement Plan      |

### اصول فرآیند

| اصل                                     | توضیح |
| --------------------------------------- | ----- |
| هر فرآیند یک ورودی و خروجی مشخص دارد    |
| فرآیندها قابل اندازه‌گیری هستند         |
| فرآیندها می‌توانند خودکار یا دستی باشند |

---

## ۱۲. Business Rule Concept

### مفهوم قاعده کسب‌وکار

| ID     | قاعده                                      | توضیح   | دامنه      |
| ------ | ------------------------------------------ | ------- | ---------- |
| BRC-01 | محتوا باید با صدای برند همخوانی داشته باشد | BRD-002 | Brand      |
| BRC-02 | هر محتوا قبل از انتشار بازبینی شود         | AI-004  | Operations |
| BRC-03 | دانش قبل از ثبت اعتبارسنجی شود             | KNW-000 | Knowledge  |
| BRC-04 | Agentها سطح اختیار خود را رعایت کنند       | AI-000  | AI         |

### انواع قاعده

| نوع         | توضیح   | مثال                       |
| ----------- | ------- | -------------------------- |
| Constraint  | محدودیت | محتوا > ۱۰۰ کاراکتر        |
| Condition   | شرط     | اگر بازخورد منفی → ارجاع   |
| Calculation | محاسبه  | ROI = (Gain − Cost) / Cost |

---

## ۱۳. Business Policy Concept

### مفهوم سیاست کسب‌وکار

| ID     | سیاست           | توضیح                                               | مرجع    |
| ------ | --------------- | --------------------------------------------------- | ------- |
| BPL-01 | کیفیت محتوا     | همه محتواها باید حداقل امتیاز کیفیت ۰.۷ داشته باشند | EDT-001 |
| BPL-02 | امنیت دانش      | دانش محرمانه فقط توسط مالک قابل ویرایش است          | KNW-000 |
| BPL-03 | انتشار مسئولانه | محتوای تأییدنشده منتشر نمی‌شود                      | AI-004  |

---

## ۱۴. Business Constraint Model

### مدل محدودیت کسب‌وکار

| ID     | محدودیت                            | نوع     | شدت    |
| ------ | ---------------------------------- | ------- | ------ |
| CST-01 | محتوای منتشرنشده قابل ویرایش است   | عملیاتی | بالا   |
| CST-02 | محتوای بایگانی‌شده قابل تغییر نیست | معماری  | بحرانی |
| CST-03 | دانش بدون مالک ثبت نمی‌شود         | معماری  | بحرانی |
| CST-04 | هر Agent یک خانواده دارد           | معماری  | بالا   |

---

## ۱۵. Business Decision Model

### مدل تصمیم کسب‌وکار

| ID     | تصمیم                   | مسئول            | مرجع   |
| ------ | ----------------------- | ---------------- | ------ |
| DEC-01 | تصویب استراتژی محتوا    | استراتژیست محتوا | AI-001 |
| DEC-02 | تأیید محتوا برای انتشار | بازبین محتوا     | AI-004 |
| DEC-03 | ارجاع به انسان          | Orchestrator     | AI-014 |
| DEC-04 | تغییر معماری دانش       | معمار دانش       | Human  |

### سطوح تصمیم

| سطح         | شناسه  | دامنه        | خودکار |
| ----------- | ------ | ------------ | ------ |
| Operational | DLV-01 | روزانه       | ✓      |
| Tactical    | DLV-02 | هفتگی/ماهانه | تا حدی |
| Strategic   | DLV-03 | فصلی/سالیانه | خیر    |

---

## ۱۶. Business Responsibility Model

### مدل مسئولیت کسب‌وکار

| مسئولیت           | شناسه  | نقش              | سطح اختیار |
| ----------------- | ------ | ---------------- | ---------- |
| استراتژی محتوا    | RES-01 | استراتژیست محتوا | A-3        |
| برنامه‌ریزی محتوا | RES-02 | برنامه‌ریز محتوا | A-2        |
| تولید محتوا       | RES-03 | تولیدکننده محتوا | A-2        |
| بازبینی محتوا     | RES-04 | بازبین محتوا     | A-3        |
| انتشار محتوا      | RES-05 | مدیر انتشار      | A-3        |
| مدیریت جامعه      | RES-06 | مدیر جامعه       | A-2        |
| تحلیل عملکرد      | RES-07 | تحلیلگر          | A-3        |
| مدیریت دانش       | RES-08 | مدیر دانش        | A-3        |
| بهبود مستمر       | RES-09 | مدیر بهبود       | A-3        |
| معماری سیستم      | RES-10 | معمار سیستم      | A-4        |

---

## ۱۷. Stakeholder Model

### مدل ذی‌نفعان

| ذی‌نفع             | شناسه  | نوع      | نیاز                 |
| ------------------ | ------ | -------- | -------------------- |
| مشتری              | STK-01 | External | محتوای ارزشمند       |
| مدیریت سازمان      | STK-02 | Internal | ROI قابل اندازه‌گیری |
| تیم محتوا          | STK-03 | Internal | ابزار کارآمد         |
| Agentهای هوشمند    | STK-04 | System   | دانش ساختاریافته     |
| پلتفرم‌های اجتماعی | STK-05 | External | محتوای منطبق         |
| تنظیم‌گر           | STK-06 | External | انطباق قانونی        |

---

## ۱۸. Business Relationship Model

### مدل رابطه کسب‌وکار

| رابطه                            | شناسه  | از     | به         | توضیح                          |
| -------------------------------- | ------ | ------ | ---------- | ------------------------------ |
| Organization owns Brand          | REL-01 | ENT-01 | ENT-02     | سازمان مالک برند است           |
| Brand produces Content           | REL-02 | ENT-02 | ENT-04     | برند محتوا تولید می‌کند        |
| Content published on Platform    | REL-03 | ENT-04 | ENT-07     | محتوا در پلتفرم منتشر می‌شود   |
| Content targets Audience         | REL-04 | ENT-04 | ENT-08     | محتوا مخاطب هدف دارد           |
| Campaign uses Content            | REL-05 | ENT-06 | ENT-04     | کارزار از محتوا استفاده می‌کند |
| Agent executes Workflow          | REL-06 | ENT-09 | ENT-10     | Agent گردش کار را اجرا می‌کند  |
| Metric measures Content          | REL-07 | ENT-11 | ENT-04     | شاخص محتوا را اندازه می‌گیرد   |
| Knowledge Asset describes Entity | REL-08 | ENT-12 | ENT-01..11 | دانش موجودیت را توصیف می‌کند   |

---

## ۱۹. Knowledge Ownership

### مالکیت KNW-101

| نقش                   | موجودیت             | مسئولیت                          |
| --------------------- | ------------------- | -------------------------------- |
| مالک (Owner)          | معمار دانش          | معماری، یکپارچگی، تغییرات        |
| متولی (Steward)       | متولی دانش          | به‌روزرسانی، Registry، نسخه‌بندی |
| مصرف‌کننده (Consumer) | همه Agentها + انسان | استفاده از مفاهیم                |

### قواعد مالکیت

| ID     | قاعده                                             |
| ------ | ------------------------------------------------- |
| OWN-01 | تغییر در مفاهیم پایه نیازمند تأیید معمار دانش است |
| OWN-02 | تغییر MAJOR نیازمند ADR است                       |
| OWN-03 | همه تغییرات در Change Log ثبت می‌شوند             |

---

## ۲۰. Governance

### حکمرانی KNW-101

| ID     | اصل              | توضیح                                             |
| ------ | ---------------- | ------------------------------------------------- |
| GOV-01 | KNW-101 SSOT است | هیچ مفهوم کسب‌وکاری خارج از این سند تعریف نمی‌شود |
| GOV-02 | بازبینی دوره‌ای  | سند هر ۶ ماه بازبینی می‌شود                       |
| GOV-03 | نسخه‌بندی دقیق   | همه تغییرات دارای نسخه SemVer هستند               |
| GOV-04 | انطباق با معماری | KNW-101 تابع KNW-000 و CON-000 است                |

---

## ۲۱. Validation Rules

| ID    | قانون                            | سطح     | نقض   |
| ----- | -------------------------------- | ------- | ----- |
| VR-01 | هر مفهوم دارای شناسه یکتا است    | معماری  | خطا   |
| VR-02 | هر موجودیت دارای مالک است        | معماری  | خطا   |
| VR-03 | روابط غیرچرخه‌ای هستند           | معماری  | خطا   |
| VR-04 | هر قابلیت به یک وظیفه مرتبط است  | معماری  | هشدار |
| VR-05 | واژگان با ARCH-003 همخوانی دارند | محتوایی | خطا   |
| VR-06 | هیچ دو مفهومی با هم تناقض ندارند | محتوایی | خطا   |

---

## ۲۲. Quality Gates

| گیت   | مکان              | معیار             | مسئول      |
| ----- | ----------------- | ----------------- | ---------- |
| QG-01 | Draft → Review    | هویت کامل، ۳۰ بخش | خودکار     |
| QG-02 | Review → Approved | اعتبارسنجی واژگان | معمار دانش |
| QG-03 | Approved → Active | ثبت در KNW-001    | متولی دانش |

---

## ۲۳. Dependencies

| سند      | نوع وابستگی | دلیل                          |
| -------- | ----------- | ----------------------------- |
| KNW-000  | مشتق‌شده    | معماری دانش — چارچوب، مدل شیء |
| KNW-001  | مشتق‌شده    | نمایه دانش — رجیستری          |
| CON-000  | حکمرانی     | اصول عالی، قانون اساسی        |
| ARCH-003 | ارجاع       | واژگان بنیادین                |

---

## ۲۴. Related Knowledge Objects

| شناسه    | رابطه                      | توضیح                       |
| -------- | -------------------------- | --------------------------- |
| KNW-102  | Derived-From (مشتق می‌شود) | قوانین و سیاست‌های کسب‌وکار |
| KNW-103  | Derived-From               | مدل‌های مرجع کسب‌وکار       |
| KNW-700+ | References                 | دانش برند (Brand Knowledge) |

---

## ۲۵. Knowledge Consumers

### مصرف‌کنندگان KNW-101

| مصرف‌کننده                    | نوع مصرف                 | سطح دسترسی |
| ----------------------------- | ------------------------ | ---------- |
| AI-001 (Content Strategy)     | پرس‌وجو + استخراج مفاهیم | A-3        |
| AI-002 (Content Planning)     | پرس‌وجو                  | A-2        |
| AI-011 (Knowledge Management) | همه                      | A-4        |
| AI-013 (Research)             | پرس‌وجو                  | A-3        |
| Human (Business Analyst)      | مطالعه + مرجع            | A-4        |

---

## ۲۶. Knowledge Producers

### تولیدکنندگان KNW-101

| تولیدکننده       | نوع تولید        | نقش        |
| ---------------- | ---------------- | ---------- |
| معمار دانش       | ایجاد + ویرایش   | مالک       |
| متولی دانش       | ویرایش + نگهداری | متولی      |
| تحلیلگر کسب‌وکار | پیشنهاد تغییر    | مصرف‌کننده |

---

## ۲۷. Machine Readable Blocks

### Block 1 — Business Identity

```json
{
  "id": "KNW-101",
  "name_fa": "پایه دانش کسب‌وکار سازمانی",
  "name_en": "Enterprise Business Knowledge Foundation",
  "version": "1.0.0-draft",
  "family": "KNW-BUS",
  "domain": "DOM-001",
  "type": "Conceptual",
  "status": "draft",
  "ssot": true,
  "total_concepts": 20,
  "total_entities": 12,
  "total_capabilities": 14,
  "total_functions": 14,
  "total_stakeholders": 6,
  "total_relationships": 8,
  "dependencies": ["KNW-000", "KNW-001", "CON-000", "ARCH-003"]
}
```

### Block 2 — Business Entities

```json
{
  "entities": [
    { "id": "ENT-01", "name": "Organization", "type": "Core", "owner": "Executive" },
    { "id": "ENT-02", "name": "Brand", "type": "Core", "owner": "Brand Manager" },
    { "id": "ENT-03", "name": "Product", "type": "Core", "owner": "Product Manager" },
    { "id": "ENT-04", "name": "Content", "type": "Core", "owner": "Content Strategist" },
    { "id": "ENT-05", "name": "Asset", "type": "Core", "owner": "Media Producer" },
    { "id": "ENT-06", "name": "Campaign", "type": "Temporal", "owner": "Campaign Manager" },
    { "id": "ENT-07", "name": "Platform", "type": "Core", "owner": "Platform Strategist" },
    { "id": "ENT-08", "name": "Audience", "type": "Core", "owner": "Community Manager" },
    { "id": "ENT-09", "name": "Agent", "type": "Core", "owner": "AI Architect" },
    { "id": "ENT-10", "name": "Workflow", "type": "Core", "owner": "Automation Architect" },
    { "id": "ENT-11", "name": "Metric", "type": "Core", "owner": "Analytics Lead" },
    { "id": "ENT-12", "name": "Knowledge Asset", "type": "Core", "owner": "Knowledge Architect" }
  ]
}
```

### Block 3 — Business Capabilities

```json
{
  "capabilities": [
    { "id": "CAP-01", "name": "Content Strategy", "level": "L1", "agent": "AI-001" },
    { "id": "CAP-02", "name": "Content Planning", "level": "L1", "agent": "AI-002" },
    { "id": "CAP-03", "name": "Content Production", "level": "L1", "agent": "AI-003" },
    { "id": "CAP-04", "name": "Media Production", "level": "L2", "agent": "AI-006" },
    { "id": "CAP-05", "name": "Video Production", "level": "L2", "agent": "AI-007" },
    { "id": "CAP-06", "name": "Content Review", "level": "L1", "agent": "AI-004" },
    { "id": "CAP-07", "name": "Search Optimization", "level": "L2", "agent": "AI-005" },
    { "id": "CAP-08", "name": "Publishing", "level": "L1", "agent": "AI-008" },
    { "id": "CAP-09", "name": "Community Engagement", "level": "L1", "agent": "AI-009" },
    { "id": "CAP-10", "name": "Analytics", "level": "L1", "agent": "AI-010" },
    { "id": "CAP-11", "name": "Knowledge Management", "level": "L1", "agent": "AI-011" },
    { "id": "CAP-12", "name": "Research", "level": "L2", "agent": "AI-013" },
    { "id": "CAP-13", "name": "Continuous Improvement", "level": "L1", "agent": "AI-012" },
    { "id": "CAP-14", "name": "Orchestration", "level": "L2", "agent": "AI-014" }
  ]
}
```

### Block 4 — Business Responsibilities

```json
{
  "responsibilities": [
    { "id": "RES-01", "role": "Content Strategist", "authority": "A-3", "agent": "AI-001" },
    { "id": "RES-02", "role": "Content Planner", "authority": "A-2", "agent": "AI-002" },
    { "id": "RES-03", "role": "Content Producer", "authority": "A-2", "agent": "AI-003" },
    { "id": "RES-04", "role": "Content Reviewer", "authority": "A-3", "agent": "AI-004" },
    { "id": "RES-05", "role": "Publishing Manager", "authority": "A-3", "agent": "AI-008" },
    { "id": "RES-06", "role": "Community Manager", "authority": "A-2", "agent": "AI-009" },
    { "id": "RES-07", "role": "Analytics Lead", "authority": "A-3", "agent": "AI-010" },
    { "id": "RES-08", "role": "Knowledge Manager", "authority": "A-3", "agent": "AI-011" },
    { "id": "RES-09", "role": "Improvement Manager", "authority": "A-3", "agent": "AI-012" },
    { "id": "RES-10", "role": "System Architect", "authority": "A-4", "agent": "Human" }
  ]
}
```

### Block 5 — Business Relationships

```json
{
  "relationships": [
    {
      "id": "REL-01",
      "source": "ENT-01",
      "target": "ENT-02",
      "type": "owns",
      "description": "Organization owns Brand"
    },
    {
      "id": "REL-02",
      "source": "ENT-02",
      "target": "ENT-04",
      "type": "produces",
      "description": "Brand produces Content"
    },
    {
      "id": "REL-03",
      "source": "ENT-04",
      "target": "ENT-07",
      "type": "published-on",
      "description": "Content published on Platform"
    },
    {
      "id": "REL-04",
      "source": "ENT-04",
      "target": "ENT-08",
      "type": "targets",
      "description": "Content targets Audience"
    },
    {
      "id": "REL-05",
      "source": "ENT-06",
      "target": "ENT-04",
      "type": "uses",
      "description": "Campaign uses Content"
    },
    {
      "id": "REL-06",
      "source": "ENT-09",
      "target": "ENT-10",
      "type": "executes",
      "description": "Agent executes Workflow"
    },
    {
      "id": "REL-07",
      "source": "ENT-11",
      "target": "ENT-04",
      "type": "measures",
      "description": "Metric measures Content"
    },
    {
      "id": "REL-08",
      "source": "ENT-12",
      "target": "ENT-01..11",
      "type": "describes",
      "description": "Knowledge Asset describes Entity"
    }
  ]
}
```

### Block 6 — Knowledge KPIs

```json
{
  "kpis": [
    {
      "id": "KPI-101-01",
      "name": "vocabulary_coverage",
      "description": "پوشش واژگان بنیادین",
      "target": "20/20",
      "measurement": "quarterly"
    },
    {
      "id": "KPI-101-02",
      "name": "entity_completeness",
      "description": "تکمیل موجودیت‌ها",
      "target": "100%",
      "measurement": "quarterly"
    },
    {
      "id": "KPI-101-03",
      "name": "capability_mapping",
      "description": "نگاشت قابلیت به Agent",
      "target": "14/14",
      "measurement": "quarterly"
    },
    {
      "id": "KPI-101-04",
      "name": "concept_consistency",
      "description": "سازگاری مفاهیم با ARCH-003",
      "target": "100%",
      "measurement": "semi-annual"
    },
    {
      "id": "KPI-101-05",
      "name": "consumption_rate",
      "description": "نرخ مصرف توسط Agentها",
      "target": "≥ 80%",
      "measurement": "monthly"
    }
  ]
}
```

---

## ۲۸. JSON Schemas (Draft-07)

### Schema 1 — Business Entity

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:knowledge:business:entity:v1",
  "title": "Business Entity",
  "description": "Schema for SMOS Business Entity definitions",
  "type": "object",
  "required": ["id", "name", "type", "owner"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^ENT-[0-9]{2}$"
    },
    "name": {
      "type": "string",
      "minLength": 2,
      "maxLength": 100
    },
    "type": {
      "type": "string",
      "enum": ["Core", "Temporal", "Abstract"]
    },
    "owner": {
      "type": "string",
      "minLength": 3
    },
    "description": {
      "type": "string",
      "maxLength": 500
    },
    "attributes": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "maxItems": 20
    }
  },
  "additionalProperties": false
}
```

### Schema 2 — Business Capability

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:knowledge:business:capability:v1",
  "title": "Business Capability",
  "description": "Schema for SMOS Business Capability definitions",
  "type": "object",
  "required": ["id", "name", "level"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^CAP-[0-9]{2}$"
    },
    "name": {
      "type": "string",
      "minLength": 2,
      "maxLength": 100
    },
    "level": {
      "type": "string",
      "enum": ["L1", "L2", "L3"]
    },
    "agent": {
      "type": "string",
      "pattern": "^AI-[0-9]{3}$"
    },
    "description": {
      "type": "string",
      "maxLength": 500
    }
  },
  "additionalProperties": false
}
```

### Schema 3 — Business Relationship

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "smos:knowledge:business:relationship:v1",
  "title": "Business Relationship",
  "description": "Schema for relationships between SMOS Business Entities",
  "type": "object",
  "required": ["id", "source", "target", "type"],
  "properties": {
    "id": {
      "type": "string",
      "pattern": "^REL-[0-9]{2}$"
    },
    "source": {
      "type": "string",
      "pattern": "^ENT-[0-9]{2}$"
    },
    "target": {
      "type": "string",
      "pattern": "^ENT-[0-9]{2}$"
    },
    "type": {
      "type": "string",
      "enum": [
        "owns",
        "produces",
        "published-on",
        "targets",
        "uses",
        "executes",
        "measures",
        "describes"
      ]
    },
    "description": {
      "type": "string",
      "maxLength": 300
    }
  },
  "additionalProperties": false
}
```

---

## ۲۹. KPIs — شاخص‌های کلیدی عملکرد

| KPI                   | شناسه      | هدف         | بازه    | مسئول      |
| --------------------- | ---------- | ----------- | ------- | ---------- |
| پوشش واژگان بنیادین   | KPI-101-01 | ۲۰/۲۰ مفهوم | فصلی    | متولی دانش |
| تکمیل موجودیت‌ها      | KPI-101-02 | ۱۰۰٪        | فصلی    | متولی دانش |
| نگاشت قابلیت به Agent | KPI-101-03 | ۱۴/۱۴       | فصلی    | معمار دانش |
| سازگاری مفاهیم        | KPI-101-04 | ۱۰۰٪        | شش‌ماهه | معمار دانش |
| نرخ مصرف توسط Agentها | KPI-101-05 | ≥ ۸۰٪       | ماهانه  | متولی دانش |

---

## ۳۰. Change Log

| نسخه        | تاریخ      | تغییر                                                                                                                                                                    | توسط        |
| ----------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| 1.0.0-draft | 2026-06-29 | نگارش اولیه — پایه دانش کسب‌وکار سازمانی. ۳۰ بخش, ۶ JSON Block, ۳ JSON Schema, ۲۰ مفهوم بنیادین, ۱۲ موجودیت, ۱۴ قابلیت, ۱۴ وظیفه, ۸ رابطه, ۶ ذی‌نفع. SSOT کسب‌وکار SMOS. | معمار سیستم |
