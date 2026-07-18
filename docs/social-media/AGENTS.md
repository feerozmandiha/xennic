# AGENTS.md — SMOS

## هویت پروژه

- **SMOS** = Social Media Operating System  
  سیستم عامل مدیریت شبکه‌های اجتماعی شرکت **Xennic** (زر نور نیرو یکتا)
- فاز فعلی: **P11.S01 — Content Operations Playbooks — راهنماهای عملیات محتوا** ✅
- مخزن در مرحله **راه‌اندازی** است — هنوز کد سورسی ندارد.
- مخزن در مرحله **راه‌اندازی** است — هنوز کد سورسی وجود ندارد.

## ساختار دایرکتوری

```
docs/               ← معماری مستندات (۲۰ ماژول)
│
├── 00-ARCHITECTURE/   استراتژیک — معماری سیستم
├── 05-CONSTITUTION/   استراتژیک — قانون اساسی SMOS
├── 10-GOVERNANCE/     استراتژیک — حکمرانی و استانداردها (GOV-001 تا GOV-005)
│   ├── 01-documentation-standards.md   استانداردهای مستندات
│   ├── 02-versioning.md                نسخه‌بندی
│   ├── 03-naming-conventions.md        قراردادهای نام‌گذاری
│   ├── 04-cross-references.md          نظام ارجاع متقابل
│   └── 05-metadata.md                  فراداده
├── 15-DEPLOY/         استراتژیک — استقرار سازمانی (DEPLOY-001)
│   └── 00-deployment-strategy.md   DEPLOY-001 — استراتژی استقرار
├── 20-PLATFORMS/      پلتفرم — کتابچه پلتفرم‌های اجتماعی
│   ├── 00-platform-playbook-standard.md   PLAT-000 — قالب مادر
│   ├── 10-instagram/10-instagram-playbook.md   PLAT-001 — اینستاگرام
│   ├── 20-linkedin/20-linkedin-playbook.md     PLAT-002 — لینکدین
│   ├── 30-telegram/30-telegram-playbook.md     PLAT-003 — تلگرام و بله
│   ├── 40-x-twitter/40-x-twitter-playbook.md   PLAT-004 — ایکس/توییتر
│   ├── 50-youtube/50-youtube-playbook.md     PLAT-005 — یوتیوب
│   ├── 60-aparat/60-aparat-playbook.md       PLAT-006 — آپارات
│   └── 70-website-blog/70-website-blog-playbook.md   PLAT-007 — وبسایت و وبلاگ
├── 22-BRAND/          پلتفرم — هویت و راهنمای برند
│   ├── 10-brand-identity.md   BRD-001 — معماری سیستم برند
│   └── 20-brand-voice.md      BRD-002 — معماری صدای برند
├── 24-EDITORIAL/      پلتفرم — سیستم تحریریه
│   ├── 10-content-guidelines.md   EDT-001 — ECOS
│   └── 20-content-taxonomy.md     EDT-002 — تاکسونومی محتوا
├── 26-ASSETS/         عملیاتی — مدیریت دارایی‌ها
├── 30-AUTOMATION/     خودکارسازی — گردش کار n8n
│   └── 00-automation-index.md   AUT-001 — نمایه خودکارسازی
├── 35-PROMPTS/        خودکارسازی — کتابخانه پرامپت (PRM-101 تا PRM-NNN)
│   ├── 10-enterprise-strategic-planning.md   PRM-101 — برنامه‌ریزی استراتژیک
│   ├── 12-goal-decomposition.md              PRM-102 — تجزیه اهداف
│   ├── 14-decision-framing.md                PRM-103 — چارچوب تصمیمات
│   ├── 16-governance-compliance.md           PRM-104 — انطباق حکمرانی
│   ├── 18-executive-response-generation.md   PRM-105 — پاسخ اجرایی
│   ├── 20-content-production-instruction.md  PRM-201 — تولید محتوا
│   ├── 22-content-review-validation.md       PRM-202 — بازبینی محتوا
│   ├── 30-publishing-instruction.md          PRM-301 — انتشار و توزیع
│   ├── 40-brand-voice-context.md             PRM-401 — بافت صدای برند
│   ├── 42-content-taxonomy-context.md        PRM-402 — بافت تاکسونومی
│   ├── 160-knowledge-retrieval-strategy.md   PRM-403 — استراتژی بازیابی دانش
│   ├── 162-knowledge-source-selection.md     PRM-404 — انتخاب منبع دانش
│   ├── 164-knowledge-extraction-instruction.md  PRM-405 — استخراج دانش
│   ├── 166-knowledge-normalization-validation.md PRM-406 — نرمال‌سازی دانش
│   ├── 168-knowledge-quality-assessment.md   PRM-407 — ارزیابی کیفیت دانش
│   ├── 170-knowledge-registration-validation.md PRM-408 — ثبت دانش
│   ├── 200-structured-knowledge-extraction.md  PRM-410 — استخراج دانش ساختاریافته
│   ├── 202-unstructured-knowledge-extraction.md PRM-411 — استخراج دانش از متن آزاد
│   ├── 204-knowledge-entity-identification.md  PRM-412 — شناسایی موجودیت
│   ├── 206-relationship-extraction.md          PRM-413 — استخراج رابطه
│   ├── 208-knowledge-enrichment.md             PRM-414 — غنی‌سازی دانش
│   ├── 210-knowledge-classification.md         PRM-415 — طبقه‌بندی دانش
│   ├── 212-knowledge-deduplication-validation.md PRM-416 — حذف تکرار
│   ├── 214-knowledge-consistency-validation.md  PRM-417 — سازگاری دانش
│   ├── 216-knowledge-integrity-assessment.md    PRM-418 — یکپارچگی دانش
│   ├── 218-knowledge-extraction-completion-validation.md PRM-419 — تکمیل استخراج
│   ├── 220-research-planning-strategy.md     PRM-420 — استراتژی برنامه‌ریزی پژوهش
│   ├── 222-source-selection-strategy.md      PRM-421 — استراتژی انتخاب منبع
│   ├── 224-evidence-collection-instruction.md PRM-422 — جمع‌آوری شواهد
│   ├── 226-evidence-evaluation.md            PRM-423 — ارزیابی شواهد
│   ├── 228-cross-source-correlation.md       PRM-424 — همبستگی منابع
│   ├── 230-insight-generation.md             PRM-425 — تولید بینش
│   ├── 232-research-consistency-validation.md PRM-426 — سازگاری پژوهش
│   ├── 234-research-quality-assessment.md     PRM-427 — کیفیت پژوهش
│   ├── 236-research-report-assembly.md       PRM-428 — مونتاژ گزارش پژوهش
│   ├── 238-research-completion-validation.md PRM-429 — تکمیل پژوهش
│   ├── 250-lessons-learned-capture.md         PRM-430 — ثبت درس‌آموخته‌ها
│   ├── 252-improvement-opportunity-identification.md PRM-431 — شناسایی فرصت بهبود
│   ├── 254-root-cause-analysis-preparation.md PRM-432 — تحلیل علت ریشه‌ای
│   ├── 256-organizational-learning-synthesis.md PRM-433 — ترکیب یادگیری سازمانی
│   ├── 258-knowledge-evolution-planning.md    PRM-434 — برنامه‌ریزی تکامل دانش
│   ├── 260-optimization-recommendation-assembly.md PRM-435 — مونتاژ توصیه بهینه‌سازی
│   ├── 262-learning-consistency-validation.md PRM-436 — اعتبارسنجی سازگاری یادگیری
│   ├── 264-organizational-learning-assessment.md PRM-437 — ارزیابی یادگیری سازمانی
│   ├── 266-improvement-package-assembly.md    PRM-438 — مونتاژ بسته بهبود
│   ├── 268-learning-completion-validation.md  PRM-439 — اعتبارسنجی تکمیل یادگیری
│   ├── 90-orchestrator-system-definition.md  PRM-901 — تعریف هماهنگ‌ساز
│   ├── 92-system-task-decomposition.md       PRM-902 — تجزیه وظایف سیستم
│   ├── 93-agent-capability-matching.md       PRM-903 — تطبیق قابلیت عامل
│   ├── 94-execution-routing-strategy.md      PRM-904 — استراتژی مسیریابی اجرا
│   ├── 95-execution-recovery-strategy.md     PRM-905 — استراتژی بازیابی اجرا
│   ├── 96-cross-agent-consistency-validation.md  PRM-906 — اعتبارسنجی سازگاری بین عاملی
│   └── 97-enterprise-orchestration-completion-validation.md  PRM-907 — اعتبارسنجی تکمیل هماهنگ‌سازی
├── 40-AI-AGENTS/      عامل هوش — مشخصات Agentها
│   ├── 00-enterprise-ai-agent-architecture.md   AI-000 — معماری مادر عامل‌های هوشمند
│   ├── 10-content-strategy-agent.md   AI-001 — معماری عامل استراتژی محتوا
│   ├── 20-content-planning-agent.md   AI-002 — معماری عامل برنامه‌ریزی محتوا
│   ├── 30-content-production-agent.md   AI-003 — معماری عامل تولید محتوای متعارف
│   ├── 40-content-review-agent.md   AI-004 — معماری عامل بازبینی و تضمین کیفیت
│   ├── 50-search-discoverability-agent.md   AI-005 — معماری عامل بهینه‌سازی جستجو و قابلیت کشف
│   ├── 60-media-asset-production-agent.md   AI-006 — معماری عامل تولید دارایی رسانه
│   ├── 65-video-production-agent.md     AI-007 — معماری عامل تولید ویدئو
│   ├── 70-publishing-distribution-agent.md   AI-008 — معماری عامل انتشار و توزیع سازمانی
│   ├── 75-community-engagement-agent.md   AI-009 — معماری عامل تعامل با جامعه
│   ├── 80-analytics-performance-intelligence-agent.md   AI-010 — معماری عامل تحلیل و هوش عملکرد
│   ├── 85-enterprise-knowledge-management-agent.md   AI-011 — معماری عامل مدیریت دانش سازمانی
│   ├── 90-continuous-improvement-agent.md   AI-012 — معماری عامل بهبود مستمر و بهینه‌سازی
│   ├── 99-enterprise-ai-orchestrator.md     AI-014 — معماری هماهنگ‌ساز عامل‌های هوشمند
│   └── 130-research-agent.md   AI-013 — معماری عامل پژوهش
├── 45-KNOWLEDGE/      مرجع — پایگاه دانش (قدیمی)
├── 50-OPERATIONS/     عملیاتی — رویه‌های روزانه
├── 55-REPORTS/        عملیاتی — قالب گزارش‌ها
├── 60-METRICS/        عملیاتی — KPI و داشبورد
├── 60-PROMPTS/        معماری — معماری پرامپت سازمانی (PRM-000)
├── 70-KNOWLEDGE/      معماری — معماری دانش سازمانی (KNW-000)
│   ├── 00-enterprise-knowledge-architecture.md   KNW-000 — معماری دانش سازمانی
│   ├── 10-knowledge-index.md                     KNW-001 — نمایه دانش سازمانی
│   ├── 100-business-knowledge-foundation.md      KNW-101 — پایه دانش کسب‌وکار
│   ├── 102-business-rules-policies.md            KNW-102 — قوانین و سیاست‌ها
│   ├── 104-business-process-architecture.md      KNW-103 — معماری فرآیندها
│   ├── 105-business-decision-architecture.md     KNW-104 — معماری تصمیم‌گیری
│   ├── 200-enterprise-knowledge-compiler-architecture.md   KNW-201 — معماری کامپایلر دانش
│   ├── 202-enterprise-knowledge-graph-architecture.md   KNW-202 — معماری گراف دانش
│   ├── 204-enterprise-semantic-engine-architecture.md   KNW-203 — معماری موتور معنایی
│   ├── 206-enterprise-knowledge-query-architecture.md   KNW-204 — معماری پرس‌وجوی دانش
│   ├── 208-enterprise-knowledge-federation-architecture.md   KNW-205 — معماری فدراسیون دانش
│   ├── 210-enterprise-knowledge-resolution-architecture.md   KNW-206 — معماری تفکیک دانش
│   ├── 300-platform-knowledge-foundation.md      KNW-301 — پایه دانش پلتفرم
│   ├── 302-platform-capability-service-architecture.md KNW-302 — قابلیت‌ها و سرویس‌ها
│   ├── 304-platform-relationship-architecture.md KNW-303 — معماری روابط پلتفرم
│   ├── 306-platform-governance-architecture.md KNW-304 — معماری حکمرانی پلتفرم
│   ├── 308-platform-lifecycle-architecture.md KNW-305 — معماری چرخه حیات پلتفرم
│   ├── 310-platform-quality-architecture.md KNW-306 — معماری کیفیت پلتفرم
│   ├── 312-platform-evolution-architecture.md KNW-307 — معماری تکامل پلتفرم
│   ├── 314-platform-security-architecture.md KNW-308 — معماری امنیت پلتفرم
│   ├── 400-operations-knowledge-foundation.md KNW-401 — پایه دانش عملیات
│   ├── 402-operations-governance-architecture.md KNW-402 — معماری حکمرانی عملیات
│   ├── 404-operations-lifecycle-architecture.md KNW-403 — معماری چرخه حیات عملیات
│   ├── 406-operations-reporting-knowledge.md KNW-404 — دانش گزارش‌دهی عملیاتی
│   ├── 408-operations-continuity-knowledge.md KNW-405 — دانش تداوم عملیات
│   ├── 500-ai-knowledge-foundation.md         KNW-501 — پایه دانش هوش مصنوعی
│   ├── 502-ai-reasoning-architecture.md       KNW-502 — معماری استدلال هوش مصنوعی
│   ├── 504-ai-memory-architecture.md         KNW-503 — معماری حافظه هوش مصنوعی
│   ├── 506-ai-tool-architecture.md           KNW-504 — معماری ابزار هوش مصنوعی
│   ├── 508-ai-planning-architecture.md       KNW-505 — معماری برنامه‌ریزی هوش مصنوعی
│   ├── 510-ai-decision-architecture.md       KNW-506 — معماری تصمیم‌گیری هوش مصنوعی
│   ├── 512-ai-collaboration-architecture.md  KNW-507 — معماری همکاری هوش مصنوعی
│   ├── 514-ai-learning-architecture.md       KNW-508 — معماری یادگیری هوش مصنوعی
│   ├── 516-ai-orchestration-architecture.md  KNW-509 — معماری هماهنگ‌سازی هوش مصنوعی
│   ├── 518-ai-meta-architecture.md           KNW-510 — معماری کلان هوش مصنوعی
│   ├── 700-brand-knowledge-foundation.md     KNW-701 — پایه دانش برند
│   └── 800-reference-knowledge-foundation.md KNW-801 — پایه دانش مرجع
├── 75-EXECUTION/      اجرایی — معماری اجرای سازمانی (SMOS-701 تا SMOS-718)
│   ├── 01-enterprise-execution-architecture.md   SMOS-701 — معماری اجرا (۸ Runtime, ۳۱ بخش)
│   ├── 02-execution-state-machine.md             SMOS-702 — ماشین حالت (۲۳ حالت, ۳۱ بخش)
│   ├── 03-execution-context-model.md             SMOS-703 — مدل بافت (۱۰ نوع, ۳۱ بخش)
│   ├── 04-workflow-orchestration.md              SMOS-704 — هماهنگ‌سازی (۱۲ الگو, ۳۰ بخش)
│   ├── 05-enterprise-event-architecture.md       SMOS-705 — رویدادها (۷۸ رویداد, ۳۱ بخش)
│   ├── 06-execution-monitoring-architecture.md   SMOS-706 — نظارت (۲۵+ بخش)
│   ├── 07-enterprise-runtime-security.md         SMOS-707 — امنیت زمان اجرا (۲۷ بخش)
│   ├── 08-smos-master-runtime-blueprint.md       SMOS-708 — طرح جامع زمان اجرا (۲۲+ بخش)
│   ├── 09-runtime-scheduler.md                   SMOS-709 — زمان‌بند اجرا (۳۱ بخش)
│   ├── 10-workflow-runtime-engine.md             SMOS-710 — موتور گردش کار (۲۴ بخش)
│   ├── 11-execution-persistence.md               SMOS-711 — ماندگاری اجرا (۳۲ بخش)
│   ├── 12-distributed-execution.md               SMOS-712 — اجرای توزیع‌شده (۲۶ بخش)
│   ├── 13-checkpoint-recovery.md                 SMOS-713 — ایست بازرسی و بازیابی (۳۰ بخش)
│   ├── 14-saga-compensation.md                   SMOS-714 — ساگا و جبران (۳۰ بخش)
│   ├── 15-runtime-telemetry.md                   SMOS-715 — تله‌متری زمان اجرا (۳۲ بخش)
│   ├── 16-runtime-optimization.md                SMOS-716 — بهینه‌سازی زمان اجرا (۲۴+ بخش)
│   ├── 17-runtime-sdk.md                         SMOS-717 — کیت توسعه زمان اجرا (۲۵ بخش)
│   └── 18-runtime-master-blueprint.md            SMOS-718 — طرح جامع موتور زمان اجرا (۲۴ بخش)
├── 70-REFERENCE/      مرجع — API و ابزارها
├── 90-RUNTIME/        اجرایی — معماری زمان اجرای سازمانی (RT-001 تا RT-007)
│   ├── 000-enterprise-runtime-foundation.md               RT-001 — بنیاد زمان اجرا
│   ├── 002-enterprise-runtime-execution-architecture.md   RT-002 — معماری اجرا
│   ├── 004-enterprise-runtime-context-architecture.md     RT-003 — معماری بافت
│   ├── 006-enterprise-runtime-session-architecture.md     RT-004 — معماری نشست
│   ├── 008-enterprise-runtime-state-architecture.md       RT-005 — معماری حالت
│   ├── 010-enterprise-runtime-coordination-architecture.md RT-006 — معماری هماهنگی
│   └── 012-enterprise-runtime-monitoring-architecture.md RT-007 — معماری نظارت
├── 80-COMMUNICATION/  ارتباطات — معماری محتوای سازمانی (COM-001 تا COM-005)
│   ├── 000-enterprise-content-architecture.md   COM-001 — معماری محتوای سازمانی
│   ├── 002-enterprise-brand-voice-architecture.md   COM-002 — معماری صدای برند
│   ├── 004-enterprise-editorial-architecture.md     COM-003 — معماری تحریریه سازمانی
│   ├── 006-enterprise-social-media-architecture.md  COM-004 — معماری شبکه‌های اجتماعی
│   └── 008-enterprise-knowledge-publishing-architecture.md  COM-005 — معماری انتشار دانش
├── 80-TRAINING/       آموزشی — راهنمای آموزش
├── 90-ARCHIVE/        تاریخی — اسناد منجمد
├── 95-CONTENT-OPERATIONS/  عملیاتی — راهنماهای عملیات محتوا (OPS-000 تا OPS-018)
│   ├── 000-content-operations-foundation.md   OPS-000 — بنیاد عملیات محتوا
│   ├── 002-social-media-operations-playbook.md   OPS-002 — راهنمای شبکه‌های اجتماعی
│   ├── 004-editorial-calendar-playbook.md   OPS-004 — راهنمای تقویم تحریریه
│   ├── 006-content-production-playbook.md   OPS-006 — راهنمای تولید محتوا
│   ├── 008-visual-design-system-playbook.md   OPS-008 — راهنمای سیستم طراحی بصری
│   ├── 010-brand-voice-playbook.md   OPS-010 — راهنمای صدای برند
│   ├── 012-community-management-playbook.md   OPS-012 — راهنمای مدیریت جامعه
│   ├── 014-content-quality-checklist.md   OPS-014 — چک‌لیست کیفیت محتوا
│   ├── 016-publishing-checklist.md   OPS-016 — چک‌لیست انتشار
│   └── 018-kpi-review-playbook.md   OPS-018 — راهنمای بازبینی KPI
│
├── P1-S1-REPORT.txt  ← گزارش اسپرینت S1
├── P1-S4-REPORT.txt  ← گزارش اسپرینت S4
├── P1-S5-REPORT.txt  ← گزارش اسپرینت S5
├── P1-S7-REPORT.txt  ← گزارش اسپرینت S7
├── P1-S8-REPORT.txt  ← گزارش اسپرینت S8
├── P1-S9-REPORT.txt  ← گزارش اسپرینت S9
├── P2-S1-REPORT.txt  ← گزارش اسپرینت S1 فاز ۲
├── P2-S3-REPORT.txt  ← گزارش اسپرینت S3 فاز ۲
├── P2-S7-REPORT.txt  ← گزارش اسپرینت S7 فاز ۲
├── P2-S8-REPORT.txt  ← گزارش اسپرینت S8 فاز ۲
├── P3-S0-REPORT.txt  ← گزارش اسپرینت S0 فاز ۳
├── P3-S1-REPORT.txt  ← گزارش اسپرینت S1 فاز ۳
├── P3-S2-REPORT.txt  ← گزارش اسپرینت S2 فاز ۳
├── P3-S3-REPORT.txt  ← گزارش اسپرینت S3 فاز ۳
AGENTS.md           ← راهنمای جلسات OpenCode (همین فایل)
SPRINT-S*.txt       ← گزارش‌های اسپرینت
```

پس از افزودن کد، این بخش با ورودی‌های اصلی، تست‌ها و کانفیگ build به‌روز خواهد شد.

## Progress

### Done

- **S0.0 — Documentation Architecture**: معماری مستندات اولیه با ۱۰ ماژول و ۳۷ سند
- **S0.1 — Architecture Refinement**: اضافه شدن ۷ ماژول جدید (CON, BRD, EDT, AST, PRM, KNW, REP)، تعریف قانون اساسی SMOS (CON-000)
- **S0.2 — Meta Architecture & Knowledge Model**: ۵ سند معماری متا (ARCH-010 تا ARCH-014)
- **S0.3 — Enterprise Governance & Decision Architecture**: ۵ سند حکمرانی (ARCH-030 تا ARCH-034)
- **P1.S1 — SMOS Constitution (CON-000)**: قانون اساسی SMOS با ۲۳ فصل، ۱۳۳ اصل
- **P1.S2 — Enterprise Canonical Vocabulary (ARCH-003)**: واژه‌نامه رسمی با ۵۲ مفهوم
- **P1.S3 — Governance Standards**: GOV-001 تا GOV-005
- **P1.S4 — ARCH-001 System Blueprint**: نمای کلی سیستم SMOS با ۲۱ فصل
- **P1.S5 — Brand System Architecture**: BRD-001 با ۲۷ فصل، DNA برند
- **P1.S6 — Enterprise Content OS (ECOS)**: EDT-001 با ۲۶ فصل
- **P1.S7 — Enterprise Multi-Platform Strategy**: ARCH-020 با ۲۶ فصل
- **P1.S8 — Platform Playbook Standard**: PLAT-000 با ۳۴ بخش
- **P1.S9 — Enterprise Content Taxonomy**: EDT-002 با ۴۲ CT-ID
- **P2.S1 — Instagram Playbook (PLAT-001)**: ۳۴ بخش مطابق PLAT-000
- **P2.S2 — LinkedIn Playbook (PLAT-002)**: ۳۴ بخش مطابق PLAT-000
- **P2.S3 — Telegram & Bale Playbook (PLAT-003)**: ۳۴ بخش، دو پلتفرمی
- **P2.S4 — Brand Voice Guidelines (BRD-002)**: معماری صدای برند Xennic — ۳۹ فصل
- **P2.S5 — X/Twitter Playbook (PLAT-004)**: ۳۴ بخش مطابق PLAT-000، نقش News (P2)
- **P2.S6 — YouTube Playbook (PLAT-005)**: ۳۴ بخش مطابق PLAT-000، نقش Video (P2)، ~۱۴۰۰ خط، ۱۰ KPI، ۱۶ CT-ID، ۱۳ AI Agent، ۷ Workflow. تعریف نقش جدید Video در ARCH-020 §۶.
- **P2.S7 — Aparat Playbook (PLAT-006)**: ۳۴ بخش مطابق PLAT-000، نقش Video Backup (P2)، ~۱۴۵۰ خط، ۱۰ KPI، ۱۳ CT-ID، ۹ AI Agent، ۶ Workflow. Mirror یوتیوب برای مخاطب ایران. تعریف نقش جدید Video Backup در ARCH-020 §۶.
- **P2.S8 — Website/Knowledge Hub Playbook (PLAT-007)**: ۳۴ بخش مطابق PLAT-000، نقش Hub (P0)، ~۱۶۸۰ خط، ۱۲ KPI، ۳۳ CT-ID سازگار، ۱۳ AI Agent، ۹ Workflow. وبسایت به عنوان SSOT انتشار و حافظه دائمی برند. آخرین کتابچه از نقشه راه اصلی SMOS.
- **AUT-001 — Enterprise Automation Index**: نمایه خودکارسازی سازمانی با ۲۵ بخش، ۸ خانواده Workflow، ۵۹ شناسه ثبت‌شده، ۸ لایه معماری، ۷ مدل اجرا، ۵ سیاست خطا، ۸ حالت State Machine. مرجع مادر تمام Workflowهای SMOS.
- **P3.S0 — AI-013 Research Agent Architecture**: Agent پژوهش SMOS — ۲۷ بخش، ۱۰ Responsibility, ۸ Input/۷ Output, ۷ Reasoning Stage, ۸ State, ۲۰ Validation Rule, ۸ Quality Gate, ۱۰ KPI. (بعداً به AI-013 reassign شد)
- **P3.S1 — AI-000 Enterprise AI Agent Architecture**: معماری مادر ۳۰ بخشی. ۵ خانواده Agent, ۵ نوع Agent, ۵ سطح اختیار, ۴ لایه معماری, ۴ مدل همکاری, ۲۰ قانون اعتبارسنجی, ۷ گیت کیفیت, ۱۲ بلوک Machine Readable, ۴ JSON Schema. سند SSOT برای تمام AI-001 تا AI-999.
- **P3.S2 — AI-001 Content Strategy Agent**: اولین Agent مشخص مشتق از AI-000 — عامل استراتژی محتوا. سطح A-3, لایه استراتژیک, خانواده Content. ۵ Primary Responsibility, ۴ نوع Capability, ۷ Input/۶ Output, ۱۵ Validation Rule, ۵ Quality Gate, ۱۰ KPI, ۶ بلوک JSON.
- **P3.S3 — AI-002 Content Planning Agent**: عامل برنامه‌ریزی محتوا — مشتق از AI-000, مصرف‌کننده AI-001. ۸ Primary Responsibility, ۴ نوع Capability, ۶ Input/۷ Output, ۱۵ Validation Rule, ۵ Quality Gate, ۱۰ KPI, ۶ بلوک JSON. سطح A-3, لایه استراتژیک, خانواده Content.
- **P3.S4 — AI-003 Content Production Agent**: عامل تولید محتوای متعارف — مشتق از AI-000, مصرف‌کننده AI-002. ۱۰ Primary Responsibility, ۴ نوع Capability (۱ Core + ۶ Supporting + ۲ Collaborative + ۱ Reflexive), ۷ Input/۸ Output, ۱۵ Validation Rule, ۵ Quality Gate, ۱۰ KPI, ۶ بلوک JSON. سطح A-3, لایه اجرایی, خانواده Content. خروجی: Canonical Content Asset مستقل از پلتفرم.
- **P3.S5 — AI-004 Content Review & Quality Assurance Agent**: عامل بازبینی و تضمین کیفیت — مشتق از AI-000, مصرف‌کننده AI-003. نوع Reviewer (AT-03), نخستین Agent غیر Specialist. ۱۵ Primary Responsibility, ۴ نوع Capability (۱ Core + ۶ Supporting + ۲ Collaborative + ۱ Reflexive), ۸ Input/۸ Output, ۱۵ Validation Rule, ۵ Quality Gate, ۱۰ KPI, ۶ بلوک JSON. سطح A-3, لایه اجرایی, خانواده Content. مدل وضعیت: Approved / Conditional / Revision / Rejected / Escalated.
- **P3.S6 — AI-005 Search Optimization & Discoverability Agent**: عامل بهینه‌سازی جستجو و قابلیت کشف — مشتق از AI-000, مصرف‌کننده AI-004. ۱۲ Primary + ۲ Secondary Responsibility, ۴ نوع Capability, ۸ Input/۸ Output, ۱۵ Validation Rule, ۵ Quality Gate, ۱۰ KPI, ۶ بلوک JSON. سطح A-3, لایه اجرایی, خانواده Content. بازتعریف AI-005 از Fact Check (FAM-01) به Discoverability (FAM-02).
- **P3.S7 — AI-006 Media Asset Production Agent**: عامل تولید دارایی رسانه — مشتق از AI-000, مصرف‌کننده AI-005. ۱۳ Primary Responsibility, ۴ نوع Capability, ۷ Input/۸ Output, ۱۵ Validation Rule, ۵ Quality Gate, ۱۰ KPI, ۶ بلوک JSON. سطح A-3, لایه اجرایی, خانواده Content. لایه تولید رسانه سازمانی. پشتیبانی از انواع رسانه کنونی و آینده بدون بازطراحی.
- **P3.S8 — AI-008 Enterprise Publishing & Distribution Agent**: عامل انتشار و توزیع سازمانی — مشتق از AI-000, مصرف‌کننده AI-005 و AI-006. ۱۳ Primary + ۲ Secondary Responsibility, ۴ نوع Capability, ۸ Input/۱۰ Output, ۱۵ Validation Rule, ۵ Quality Gate, ۱۰ KPI, ۶ بلوک JSON. سطح A-3, لایه اجرایی, خانواده Operations (FAM-03). نخستین Agent از خانواده Operations. پلتفرم‌های هدف: وبسایت، اینستاگرام، لینکدین، تلگرام، بله، یوتیوب، آپارات و آینده.
- **P3.S9 — AI-010 Analytics & Performance Intelligence Agent**: عامل تحلیل و هوش عملکرد — مشتق از AI-000, مصرف‌کننده AI-008. ۱۳ Primary + ۲ Secondary Responsibility, ۴ نوع Capability, ۸ Input/۱۰ Output, ۱۵ Validation Rule, ۵ Quality Gate, ۱۰ KPI, ۶ بلوک JSON. سطح A-3, لایه اجرایی, خانواده Knowledge (FAM-04). جمع‌آوری، اعتبارسنجی، تجمیع و تفسیر داده‌های عملکرد. خروجی: Performance Report, Trend Report, KPI Dashboard, Recommendation Package.
- **P3.S10 — AI-012 Continuous Improvement & Optimization Agent**: عامل بهبود مستمر و بهینه‌سازی — مشتق از AI-000, مصرف‌کننده AI-010. ۱۳ Primary + ۲ Secondary Responsibility, ۴ نوع Capability, ۸ Input/۱۰ Output, ۱۵ Validation Rule, ۵ Quality Gate, ۱۰ KPI, ۶ بلوک JSON. سطح A-3, لایه استراتژیک (LYR-01), خانواده Knowledge (FAM-04). بستن حلقه بازخورد سازمانی: AI-001 → ... → AI-012 → AI-001. خروجی: Improvement Proposal, Optimization Roadmap, Lessons Learned.
- **P3.S11 — AI-007 Video Production Agent**: عامل تولید ویدئوی سازمانی — مشتق از AI-000, مصرف‌کننده AI-003 و AI-006. ۱۳ Primary + ۲ Secondary Responsibility, ۴ نوع Capability (۱ Core + ۶ Supporting + ۳ Collaborative + ۱ Reflexive), ۷ Input/۸ Output, ۱۵ Validation Rule, ۵ Quality Gate, ۱۰ KPI, ۶ بلوک JSON. سطح A-3 ▲ از A-2, لایه اجرایی (LYR-03), خانواده Content (FAM-02). محور پلتفرم‌های یوتیوب، اینستاگرام Reels, لینکدین Video. خروجی: Canonical Video Asset مستقل از پلتفرم.
- **P3.S12 — AI-009 Community Engagement Agent**: عامل تعامل با جامعه — مشتق از AI-000, مصرف‌کننده AI-008. ۱۳ Primary + ۲ Secondary Responsibility, ۴ نوع Capability, ۷ Input/۸ Output, ۱۵ Validation Rule, ۵ Quality Gate, ۱۰ KPI, ۶ بلوک JSON. سطح A-3, لایه اجرایی (LYR-03), خانواده Operations (FAM-03). بازتعریف از Monitoring به Community Engagement. تنها مسئول تعاملات پس از انتشار. خروجی: Community Log, Engagement Report, Escalation Package.
- **P3.S13 — AI-011 Enterprise Knowledge Management Agent**: عامل مدیریت دانش سازمانی — مشتق از AI-000, مصرف‌کننده AI-003 تا AI-010. ۱۳ Primary + ۲ Secondary Responsibility, ۴ نوع Capability, ۸ Input/۱۰ Output, ۱۵ Validation Rule, ۵ Quality Gate, ۱۰ KPI, ۶ بلوک JSON. سطح A-3 ▲ از A-2, لایه اجرایی (LYR-03) ▲ از LYR-02, خانواده Knowledge (FAM-04). مدیریت چرخه حیات دانش سازمانی (دریافت، اعتبارسنجی، نرمال‌سازی، نمایه‌سازی، فهرست‌بندی). تأمین‌کننده AI-001, AI-002, AI-012. خروجی: Knowledge Asset, Knowledge Index, Semantic Links, Knowledge Retrieval Package.
- **P3.S14 — AI-014 Enterprise AI Orchestrator**: هماهنگ‌ساز عامل‌های هوشمند سازمانی — مشتق از AI-000. ۱۵ Primary Responsibility, ۴ نوع Capability, ۷ Input/۱۰ Output, ۱۵ Validation Rule, ۵ Quality Gate, ۱۰ KPI, ۶ بلوک JSON. نوع Orchestrator (AT-02), سطح A-4 (بالاترین در SMOS), لایه استراتژیک (LYR-01), خانواده Orchestration (FAM-05). هماهنگی، نظارت و هدایت تمام Agentهای SMOS. آخرین Agent از معماری عامل‌های SMOS. خروجی: Execution Plan, Execution Report, Session Summary.
- **P4.S1 — AUT-000 Enterprise Automation Architecture**: معماری مادر خودکارسازی سازمانی. ۳۰ بخش, ۵ لایه معماری, ۸ خانواده Workflow, ۶ نوع Workflow, ۱۲ اصل طراحی. مدل‌های Trigger, Event, State, Queue, Schedule, Retry, Failure, Compensation, Human Interaction, AI Collaboration. ۶ بلوک JSON + ۳ JSON Schema (Draft-07). A-4 بالاترین سطح اختیار Automation. AUT-000 معماری را تعریف می‌کند — AUT-001 نمایه را نگه می‌دارد — AUT-NNN پیاده‌سازی می‌کند.
- **P4.S2 — DEPLOY-001 Enterprise Deployment Strategy**: استراتژی استقرار سازمانی SMOS. ۱۸ بخش, ۵ فاز استقرار (Foundation تا Intelligence), ۳ محیط (Dev/Staging/Production), ۴ Ring Rollout, ۱۰ Validation Rule, ۵ Quality Gate, ۶ بلوک JSON. مدل استقرار تدریجی مبتنی بر وابستگی. تعریف DEPLOY به عنوان ماژول جدید در GOV-003.
- **P5.S1 — PRM-000 Enterprise Prompt Architecture**: معماری پرامپت سازمانی SMOS. ۲۶ بخش, ۵ خانواده پرامپت (FAM-STR تا FAM-SYS), ۷ نوع پرامپت (PT-01 تا PT-07), ۵ سطح پیچیدگی (C-0 تا C-4), ۵ لایه معماری (PLYR-01 تا PLYR-05), ۴ الگوی ترکیب (CP-01 تا CP-04), ۶ نوع بافت (CTX-01 تا CTX-06), ۸ نوع متغیر (VAR-01 تا VAR-08), ۵ نوع وابستگی (DEP-01 تا DEP-05), ۲۰ قانون اعتبارسنجی, ۷ گیت کیفیت, ۶ بلوک JSON, ۳ JSON Schema. PRM-000 معماری را تعریف می‌کند — PRM-001 نمایه را نگه می‌دارد — PRM-NNN پیاده‌سازی می‌کند.
- **P5.S2 — PRM-001 Enterprise Prompt Index**: نمایه مرکزی پرامپت. ۲۵ بخش, ۵ خانواده ثبت‌شده, ۷ نوع ثبت‌شده, ۵ سطح پیچیدگی, ۲۰ زیرخانواده, ۳۴ پرامپت در کاتالوگ برنامه‌ریزی‌شده, ۱۰۱ پرامپت draft. نگاشت کامل Agent→Prompt, Automation→Prompt, Knowledge→Prompt. ۶ بلوک JSON Registry. v2.5.0-draft.
- **P5.S3 — PRM-101–105 Strategic Prompt Library**: کتابخانه پرامپت استراتژیک SMOS. ۵ پرامپت در ۲ زیرخانواده (STR-PLN, STR-DEC). PRM-101 (Enterprise Strategic Planning), PRM-102 (Goal Decomposition), PRM-103 (Decision Framing), PRM-104 (Governance Compliance), PRM-105 (Executive Response Generation). هر سند دارای ۱۸ بخش + ۶ بلوک Machine Readable JSON. مصرف‌شده توسط AI-001, AI-002, AI-004, AI-012, AI-014.
- **P5.S4 — PRM-203–206 Content Prompt Library batch 1**: کتابخانه پرامپت محتوایی SMOS. ۴ پرامپت در زیرخانواده CON-PRD. PRM-203 (Content Structuring, PT-04, C-2, A-3), PRM-204 (Metadata Generation, PT-04, C-2, A-3), PRM-205 (Accessibility Enhancement, PT-06, C-2, A-3), PRM-206 (Localization & Translation, PT-04, C-3, A-3). مصرف‌شده توسط AI-003, AI-005, AI-006, AI-007, AI-008, AI-011.
- **P5.S5 — PRM-207–209 Content Prompt Library batch 2**: کتابخانه پرامپت محتوایی SMOS. ۳ پرامپت در زیرخانواده CON-PRD. PRM-207 (Platform Format Adaptation, PT-03, C-2, A-1), PRM-208 (Content Quality Check, PT-06, C-1, A-1), PRM-209 (Multi-Platform Adaptation Chain, PT-04, C-3, A-2). مصرف‌شده توسط AI-003, AI-004, AI-005, AI-008.
- **P5.S6 — PRM-210–214 CON-RVW Review Prompt Library**: کتابخانه پرامپت بازبینی SMOS. ۵ پرامپت در زیرخانواده CON-RVW. PRM-210 (Review Preparation, PT-04, C-1, A-2), PRM-211 (Structural Validation, PT-06, C-2, A-2), PRM-212 (Terminology Validation, PT-06, C-2, A-2), PRM-213 (Consistency Validation, PT-06, C-3, A-3), PRM-214 (Publication Readiness Validation, PT-06, C-3, A-3). مصرف‌شده توسط AI-004, AI-008, AI-011.
- **P5.S7 — PRM-220–224 CON-SEO Optimization Prompt Library**: کتابخانه پرامپت بهینه‌سازی SMOS. ۵ پرامپت در زیرخانواده CON-SEO. PRM-220 (Semantic Optimization, PT-04, C-3, A-3), PRM-221 (Search Intent Alignment, PT-04, C-2, A-3), PRM-222 (Internal Linking Strategy, PT-04, C-3, A-3), PRM-223 (Structured Metadata Enhancement, PT-04, C-3, A-3), PRM-224 (Discoverability Validation, PT-06, C-3, A-3). مصرف‌شده توسط AI-005, AI-008, AI-010, AI-011.
- **P5.S8 — PRM-230–234 CON-MED Media Asset Prompt Library**: کتابخانه پرامپت تولید دارایی رسانه SMOS. ۵ پرامپت در زیرخانواده CON-MED. PRM-230 (Media Planning, PT-04, C-2, A-3), PRM-231 (Visual Composition, PT-04, C-3, A-3), PRM-232 (Brand Visual Compliance, PT-06, C-2, A-3), PRM-233 (Accessibility Media Validation, PT-06, C-2, A-3), PRM-234 (Media Production Readiness, PT-06, C-3, A-3). مصرف‌شده توسط AI-004, AI-006, AI-007, AI-008. تکمیل لایه معماری تولید دارایی رسانه.
- **P5.S9 — PRM-240–244 CON-VID Video Production Prompt Library**: کتابخانه پرامپت تولید ویدئوی سازمانی SMOS. ۵ پرامپت در زیرخانواده CON-VID. PRM-240 (Video Storyboard Planning, PT-04, C-3, A-3), PRM-241 (Video Scene Composition, PT-04, C-3, A-3), PRM-242 (Audio & Narration Guidance, PT-04, C-2, A-3), PRM-243 (Video Brand Compliance, PT-06, C-2, A-3), PRM-244 (Video Publication Readiness, PT-06, C-3, A-3). مصرف‌شده توسط AI-004, AI-007, AI-008, AI-010. تکمیل لایه معماری تولید محتوای تصویری (PRM-200).
- **P5.S10 — PRM-302–308 OPS-PUB Enterprise Publishing Prompt Library**: کتابخانه پرامپت انتشار سازمانی SMOS. ۷ پرامپت در زیرخانواده OPS-PUB. PRM-302 (Publishing Package Assembly, PT-04, C-2, A-3), PRM-303 (Platform Selection Strategy, PT-07, C-3, A-3), PRM-304 (Publication Scheduling, PT-04, C-2, A-2), PRM-305 (Platform Compliance Validation, PT-06, C-2, A-3), PRM-306 (Publication Execution Chain, PT-04, C-3, A-3), PRM-307 (Publication Verification, PT-06, C-2, A-2), PRM-308 (Distribution Completion Validation, PT-06, C-3, A-3). مصرف‌شده توسط AI-004, AI-008, AI-009, AI-010, AI-011, AI-014. تکمیل زیرخانواده OPS-PUB.
- **P5.S11 — PRM-310–319 OPS-CMG Community Engagement Prompt Library**: کتابخانه پرامپت تعامل با جامعه SMOS. ۱۰ پرامپت در زیرخانواده OPS-CMG. PRM-310 (Comment Classification, PT-04, C-2, A-2), PRM-311 (Response Strategy Selection, PT-07, C-3, A-3), PRM-312 (Response Draft Preparation, PT-04, C-2, A-2), PRM-313 (Moderation Validation, PT-06, C-2, A-3), PRM-314 (Escalation Decision, PT-07, C-3, A-3), PRM-315 (Community Interaction Validation, PT-06, C-2, A-2), PRM-316 (Sentiment Observation, PT-04, C-3, A-3), PRM-317 (Conversation Continuity, PT-04, C-2, A-2), PRM-318 (Community Incident Assessment, PT-06, C-3, A-3), PRM-319 (Community Handoff Validation, PT-06, C-3, A-3). مصرف‌شده توسط AI-004, AI-009, AI-010, AI-011, AI-012, AI-014. تکمیل زیرخانواده OPS-CMG.
- **P5.S12 — PRM-320–329 OPS-RPT Reporting Prompt Library**: کتابخانه پرامپت گزارش و تحلیل SMOS. ۱۰ پرامپت در زیرخانواده OPS-RPT. PRM-320 (Performance Report Generation, PT-04, C-2, A-3), PRM-321 (KPI Dashboard Construction, PT-04, C-3, A-3), PRM-322 (Trend Analysis Preparation, PT-04, C-3, A-3), PRM-323 (Audience Insight Generation, PT-07, C-3, A-3), PRM-324 (Recommendation Package Assembly, PT-07, C-3, A-3), PRM-325 (Analytics Validation, PT-06, C-2, A-3), PRM-326 (Reporting Consistency Validation, PT-06, C-2, A-2), PRM-327 (Executive Dashboard Validation, PT-06, C-3, A-3), PRM-328 (Analytics Quality Assessment, PT-06, C-3, A-3), PRM-329 (Reporting Completion Validation, PT-06, C-3, A-3). مصرف‌شده توسط AI-001, AI-004, AI-010, AI-011, AI-012, AI-014. تکمیل زیرخانواده OPS-RPT.
- **P5.S13 — PRM-330–339 OPS-MON Monitoring Prompt Library**: کتابخانه پرامپت نظارت عملیاتی SMOS. ۱۰ پرامپت در زیرخانواده OPS-MON. PRM-330 (Operational Event Classification, PT-04, C-2, A-2), PRM-331 (Alert Prioritization Strategy, PT-07, C-3, A-3), PRM-332 (Incident Correlation Analysis, PT-04, C-3, A-3), PRM-333 (Operational Health Assessment, PT-04, C-2, A-2), PRM-334 (Service Degradation Evaluation, PT-06, C-2, A-2), PRM-335 (Operational Risk Validation, PT-06, C-3, A-3), PRM-336 (Monitoring Consistency Validation, PT-06, C-2, A-2), PRM-337 (Operational Intelligence Summary, PT-07, C-3, A-3), PRM-338 (Monitoring Quality Assessment, PT-06, C-3, A-3), PRM-339 (Monitoring Completion Validation, PT-06, C-3, A-3). مصرف‌شده توسط AI-004, AI-010, AI-011, AI-012, AI-014. تکمیل زیرخانواده OPS-MON — **تکمیل کامل FAM-OPS (۲۹→۳۹ پرامپت)**.
- **P5.S14 — PRM-403–408 KNW-RTR Knowledge Retrieval & Extraction Prompt Library**: کتابخانه پرامپت بازیابی و استخراج دانش SMOS. ۶ پرامپت در زیرخانواده KNW-RTR. PRM-403 (Knowledge Retrieval Strategy, PT-04, C-2, A-3), PRM-404 (Knowledge Source Selection, PT-07, C-3, A-3), PRM-405 (Knowledge Extraction Instruction, PT-04, C-3, A-3), PRM-406 (Knowledge Normalization Validation, PT-06, C-2, A-3), PRM-407 (Knowledge Quality Assessment, PT-06, C-3, A-3), PRM-408 (Knowledge Registration Validation, PT-06, C-3, A-3). مصرف‌شده توسط AI-011, AI-010, AI-012, AI-001, AI-002, AI-004, AI-014. زنجیره وابستگی: 403→404→405→406→407→408→knowledge_registered. اولین زیرخانواده FAM-KNW — **آغاز کامل FAM-KNW**.
- **P5.S15 — PRM-410–419 KNW-EXT Knowledge Extraction & Enrichment Prompt Library**: کتابخانه پرامپت استخراج و غنی‌سازی دانش SMOS. ۱۰ پرامپت در زیرخانواده KNW-EXT. PRM-410 (Structured Knowledge Extraction, PT-04, C-2, A-3), PRM-411 (Unstructured Knowledge Extraction, PT-04, C-3, A-3), PRM-412 (Knowledge Entity Identification, PT-04, C-2, A-3), PRM-413 (Relationship Extraction, PT-04, C-3, A-3), PRM-414 (Knowledge Enrichment, PT-04, C-3, A-3), PRM-415 (Knowledge Classification, PT-04, C-2, A-3), PRM-416 (Knowledge Deduplication Validation, PT-06, C-2, A-3), PRM-417 (Knowledge Consistency Validation, PT-06, C-2, A-3), PRM-418 (Knowledge Integrity Assessment, PT-06, C-3, A-3), PRM-419 (Knowledge Extraction Completion Validation, PT-06, C-3, A-3). مصرف‌شده توسط AI-011, AI-010, AI-012, AI-001, AI-002, AI-013, AI-004, AI-014. زنجیره وابستگی: 410→411→412→413→414→415→416→417→418→419→knowledge_extraction_completed. دومین زیرخانواده FAM-KNW.
- **P5.S16 — PRM-420–429 KNW-RSR Research & Analysis Prompt Library**: کتابخانه پرامپت پژوهش و تحلیل دانش SMOS. ۱۰ پرامپت در زیرخانواده KNW-RSR. PRM-420 (Research Planning Strategy, PT-04, C-2, A-3), PRM-421 (Source Selection Strategy, PT-07, C-3, A-3), PRM-422 (Evidence Collection Instruction, PT-04, C-3, A-3), PRM-423 (Evidence Evaluation, PT-06, C-2, A-3), PRM-424 (Cross-Source Correlation, PT-04, C-3, A-3), PRM-425 (Insight Generation, PT-07, C-3, A-3), PRM-426 (Research Consistency Validation, PT-06, C-2, A-3), PRM-427 (Research Quality Assessment, PT-06, C-3, A-3), PRM-428 (Research Report Assembly, PT-04, C-3, A-3), PRM-429 (Research Completion Validation, PT-06, C-3, A-3). مصرف‌شده توسط AI-013, AI-011, AI-001, AI-002, AI-010, AI-012, AI-004, AI-014. زنجیره وابستگی: 420→421→422→423→424→425→426→427→428→429→research_completed. سومین زیرخانواده FAM-KNW.
- **P5.S17 — PRM-430–439 KNW-LRN Learning & Optimization Prompt Library**: کتابخانه پرامپت یادگیری و بهبود مستمر SMOS. ۱۰ پرامپت در زیرخانواده KNW-LRN. PRM-430 (Lessons Learned Capture, PT-04, C-2, A-3), PRM-431 (Improvement Opportunity Identification, PT-07, C-3, A-3), PRM-432 (Root Cause Analysis Preparation, PT-04, C-3, A-3), PRM-433 (Organizational Learning Synthesis, PT-07, C-3, A-3), PRM-434 (Knowledge Evolution Planning, PT-04, C-3, A-3), PRM-435 (Optimization Recommendation Assembly, PT-07, C-3, A-3), PRM-436 (Learning Consistency Validation, PT-06, C-2, A-3), PRM-437 (Organizational Learning Assessment, PT-06, C-3, A-3), PRM-438 (Improvement Package Assembly, PT-04, C-3, A-3), PRM-439 (Learning Completion Validation, PT-06, C-3, A-3). مصرف‌شده توسط AI-012, AI-011, AI-001, AI-002, AI-010, AI-013, AI-004, AI-014. زنجیره وابستگی: 430→431→432→433→434→435→436→437→438→439→organizational_learning_completed. چهارمین و آخرین زیرخانواده FAM-KNW — **تکمیل کامل FAM-KNW**.
- **P5.S18 — PRM-902–907 SYS-ORC System Orchestration Prompt Library**: کتابخانه پرامپت هماهنگ‌سازی سیستم SMOS. ۶ پرامپت در زیرخانواده SYS-ORC. PRM-902 (System Task Decomposition, PT-04, C-3, A-4), PRM-903 (Agent Capability Matching, PT-07, C-3, A-4), PRM-904 (Execution Routing Strategy, PT-04, C-4, A-4), PRM-905 (Execution Recovery Strategy, PT-07, C-4, A-4), PRM-906 (Cross-Agent Consistency Validation, PT-06, C-3, A-4), PRM-907 (Enterprise Orchestration Completion Validation, PT-06, C-4, A-4). مصرف‌شده توسط AI-014, AI-004, AI-011, AI-012, AI-001. زنجیره وابستگی: 902→903→904→905→906→907→enterprise_orchestration_completed. آخرین زیرخانواده FAM-SYS — **تکمیل کامل FAM-SYS (۷ پرامپت: PRM-901–907)** — **تکمیل کامل P5 (Enterprise Prompt Library — ۱۱۷ پرامپت)**.
- **P6.S1 — KNW-000 Enterprise Knowledge Architecture**: معماری مادر دانش سازمانی SMOS. ۳۰ بخش, ۶ بلوک Machine Readable JSON, ۳ JSON Schema (Draft-07). ۹ دامنه دانش, ۸ نوع دانش, ۷ وضعیت, ۵ سطح اختیار. SSOT برای تمام KNW-NNN. هم‌ردیف CON-000, AI-000, AUT-000, PRM-000.
- **P6.S2 — KNW-001 Enterprise Knowledge Index**: نمایه دانش سازمانی SMOS. ۲۵ بخش, ۶ بلوک JSON Registry. ۲ سند ثبت‌شده (KNW-000, KNW-001), ۹ خانواده برنامه‌ریزی‌شده, ۲۲ دامنه. نگاشت کامل Agent→Knowledge, Automation→Knowledge, Platform→Knowledge. SSOT Registry برای تمام KNW-NNN.
- **P6.S3 — KNW-101 Enterprise Business Knowledge Foundation**: پایه دانش کسب‌وکار سازمانی SMOS. ۳۰ بخش, ۶ بلوک Machine Readable JSON, ۳ JSON Schema (Draft-07). ۲۰ مفهوم بنیادین, ۱۲ موجودیت, ۱۴ قابلیت, ۱۴ وظیفه, ۸ رابطه, ۶ ذی‌نفع. SSOT کسب‌وکار SMOS. نخستین دانش عملیاتی KNW-BUS.
- **P6.S4 — KNW-102 Enterprise Business Rules & Policies**: قوانین و سیاست‌های کسب‌وکار سازمانی SMOS. ۳۰ بخش, ۶ بلوک Machine Readable JSON, ۳ JSON Schema (Draft-07). ۷ دسته قانون (RUL-01 تا RUL-07), ۷ سیاست (POL-01 تا POL-07), ۷ محدودیت (CST-01 تا CST-07), ۵ سطح ریسک, ۵ سطح اختیار, ۴ سطح ارجاع. SSOT قوانین کسب‌وکار SMOS.
- **P6.S5 — KNW-103 Enterprise Business Process Architecture**: معماری فرآیندهای کسب‌وکار سازمانی SMOS. ۳۰ بخش, ۶ بلوک Machine Readable JSON, ۳ JSON Schema (Draft-07). ۹ فرآیند مرجع (PROC-001 تا PROC-009), ۱۸ فعالیت (ACT-001 تا ACT-018), ۱۰ رویداد (EVT-001 تا EVT-010), ۸ پیامد (OUT-001 تا OUT-008), ۸ محرک (TRG-001 تا TRG-008). SSOT فرآیندهای کسب‌وکار SMOS. بدون BPMN, UML یا پیاده‌سازی.
- **P6.S6 — KNW-104 Enterprise Business Decision Architecture**: معماری تصمیم‌گیری کسب‌وکار سازمانی SMOS. ۳۰ بخش, ۶ بلوک Machine Readable JSON, ۳ JSON Schema (Draft-07). ۷ دسته تصمیم (DEC-01 تا DEC-07), ۱۱ معیار (CRT-01 تا CRT-11), ۸ گزینه (OPT-01 تا OPT-08), ۸ پیامد (OUT-01 تا OUT-08), ۸ محرک (TRG-01 تا TRG-08), ۶ ذی‌نفع (STK-01 تا STK-06), ۷ ریسک (RSK-01 تا RSK-07), ۴ ماتریس تصمیم. SSOT تصمیم‌های کسب‌وکار SMOS. بدون BPMN, UML یا پیاده‌سازی. تکمیل زیرخانواده KNW-BUS (Foundation).
- **P6.S7 — KNW-301 Enterprise Platform Knowledge Foundation**: پایه دانش پلتفرم سازمانی SMOS. ۳۰ بخش, ۶ بلوک Machine Readable JSON, ۳ JSON Schema (Draft-07). ۸ دامنه پلتفرمی (PLTD-001..008), ۷ لایه (LYR-PLT-01..07), ۱۲ قابلیت (PLTCAP-001..012), ۹ سرویس (PLTS-001..009), ۱۲ مؤلفه (PLTC-001..012), ۷ ماژول (PLTM-001..007), ۸ رابطه (PLTR-001..009). طبقه‌بندی ۴ بعدی پلتفرم. نگاشت کامل به PLAT-_, AI-_, AUT-_, PRM-_. SSOT پلتفرم SMOS. نخستین دانش KNW-PLT.
- **P6.S8 — KNW-302 Enterprise Platform Capability & Service Architecture**: معماری قابلیت‌ها و سرویس‌های پلتفرم سازمانی SMOS. ۳۰ بخش, ۶ بلوک Machine Readable JSON, ۳ JSON Schema (Draft-07). ۲۰ قابلیت (CAP-PLT-001..020), ۱۸ سرویس (SRV-PLT-001..018), ۷ گروه قابلیتی (CAPGRP-001..007), ۸ گروه سرویسی (SRVGRP-001..008), ۸ وابستگی قابلیتی, ۷ وابستگی سرویسی. چرخه حیات قابلیت و سرویس. نگاشت کامل به KNW-301, PLAT-_, AI-_, AUT-\*. SSOT قابلیت‌ها و سرویس‌های پلتفرم SMOS.
- **P6.S9 — KNW-303 Enterprise Platform Relationship Architecture**: معماری روابط پلتفرم سازمانی SMOS. ۳۰ بخش, ۶ بلوک Machine Readable JSON, ۳ JSON Schema (Draft-07). ۲۸ نوع رابطه در ۹ ماهیت (REL-STR تا REL-EXT), ۲۲۲ رابطه ثبت‌شده بین ۶۲ موجودیت مبدأ و ۴۸ موجودیت مقصد. ۸۲ رابطه ساختاری, ۴۰ رابطه رفتاری, ۳۸ رابطه وابستگی, ۱۳ رابطه ارتباطی, ۱۵ رابطه حکمرانی, ۲۸ رابطه مالکیتی, ۶ رابطه خارجی. SSOT روابط پلتفرم SMOS. تکمیل زیرخانواده KNW-PLT (۳ سند: KNW-301, KNW-302, KNW-303).
- **P6.S10 — KNW-304 Enterprise Platform Governance Architecture**: معماری حکمرانی پلتفرم سازمانی SMOS. ۳۰ بخش, ۶ بلوک Machine Readable JSON, ۳ JSON Schema (Draft-07). ۸ دامنه حکمرانی (GOV-PLT تا GOV-AUD), ۵ سطح اختیار (A-0 تا A-4), ۱۲ قاعده حکمرانی, ۷ سیاست, ۸ محدودیت. مدل‌های اختیار, مالکیت, حساب‌پذیری, تفویض, تأیید, انطباق, اعتبارسنجی, استثنا و ارجاع. SSOT حکمرانی پلتفرم SMOS. تکمیل زیرخانواده KNW-PLT (۴ سند: KNW-301, KNW-302, KNW-303, KNW-304).
- **P6.S11 — KNW-305 Enterprise Platform Lifecycle Architecture**: معماری چرخه حیات پلتفرم سازمانی SMOS. ۳۰ بخش, ۶ بلوک Machine Readable JSON, ۳ JSON Schema (Draft-07). ۸ وضعیت (STATE-01 تا STATE-08), ۱۵ انتقال مجاز, ۱۰ دامنه چرخه حیات (LC-CRT تا LC-ARC), ۱۵ رویداد. مدل‌های نسخه‌بندی SemVer, انتشار, مدیریت تغییر, تکامل پیکربندی, تکامل وابستگی, ردیابی, بازنشستگی, خروج, بایگانی و بازیابی. SSOT چرخه حیات پلتفرم SMOS. تکمیل زیرخانواده KNW-PLT (۵ سند: KNW-301, KNW-302, KNW-303, KNW-304, KNW-305).
- **P6.S12 — KNW-306 Enterprise Platform Quality Architecture**: معماری کیفیت پلتفرم سازمانی SMOS. ۳۰ بخش, ۶ بلوک Machine Readable JSON, ۳ JSON Schema (Draft-07). ۱۰ دامنه کیفیت (QLT-ARC تا QLT-EVO), ۱۲ ویژگی کیفی (QAT-01 تا QAT-12), ۲۴ معیار (QLM-01 تا QLM-24), ۱۰ نشانگر (QLI-01 تا QLI-10). مدل‌های اندازه‌گیری, اعتبارسنجی, تأیید, معیارهای پذیرش, تضمین کیفیت, بهبود مستمر و ارزیابی. ۸ اصل کیفیت, ۶ هدف, ۸ ریسک, ۸ محدودیت, ۷ گیت کیفیت. SSOT کیفیت پلتفرم SMOS. ششمین و آخرین سند خانواده KNW-PLT.
- **P6.S13 — KNW-307 Enterprise Platform Evolution Architecture**: معماری تکامل پلتفرم سازمانی SMOS. ۳۰ بخش, ۶ بلوک Machine Readable JSON, ۳ JSON Schema (Draft-07). ۱۰ دامنه تکامل (EVO-ARC تا EVO-INT), ۱۰ محرک (DRV-01 تا DRV-10), ۸ بعد (DIM-01 تا DIM-08), ۵ سطح (EVL-01 تا EVL-05), ۶ وضعیت (EST-01 تا EST-06). مدل‌های بلوغ، تکامل معماری، قابلیت، سرویس، دانش، حکمرانی، چرخه حیات، کیفیت و تغییر. ۱۵ معیار (ELM-01 تا ELM-15), ۷ گیت کیفیت. SSOT تکامل پلتفرم SMOS. هفتمین سند خانواده KNW-PLT.
- **P6.S14 — KNW-308 Enterprise Platform Security Architecture**: معماری امنیت پلتفرم سازمانی SMOS. ۳۰ بخش, ۶ بلوک Machine Readable JSON, ۳ JSON Schema (Draft-07). ۱۰ دامنه امنیت (SEC-ARC تا SEC-EVO), ۵ سطح اعتماد (TRL-01 تا TRL-05), ۵ سطح هویت (IDL-01 تا IDL-05), ۵ سطح دسترسی (ACL-01 تا ACL-05), ۱۰ دسته تهدید (THR-01 تا THR-10), ۵ سطح ریسک (RSL-01 تا RSL-05). مدل‌های CIA Triad, Zero Trust, Defense in Depth, Threat Modeling, Security Governance, Security Lifecycle, Security Quality. ۱۵ معیار (SEM-01 تا SEM-15), ۷ گیت کیفیت (QG-SEC-01 تا QG-SEC-07). SSOT امنیت پلتفرم SMOS. هشتمین سند خانواده KNW-PLT.
- **P6.S15 — KNW-401 Enterprise Operations Knowledge Foundation**: پایه دانش عملیات سازمانی SMOS. ۳۰ بخش, ۶ بلوک Machine Readable JSON, ۳ JSON Schema (Draft-07). ۲۰ مفهوم عملیاتی (OPC-01 تا OPC-20), ۱۲ موجودیت (OPE-01 تا OPE-12), ۱۴ قابلیت (OPCAP-001 تا OPCAP-014), ۱۴ کارکرد (OPF-01 تا OPF-14), ۸ دامنه (OPD-01 تا OPD-08), ۸ وضعیت (OPS-01 تا OPS-08), ۱۰ رابطه (OPREL-01 تا OPREL-10). SSOT عملیات سازمانی SMOS. نخستین سند خانواده KNW-OPS.
- **P6.S16 — KNW-402 Enterprise Operations Governance Architecture**: معماری حکمرانی عملیات سازمانی SMOS. ۳۰ بخش, ۶ بلوک Machine Readable JSON, ۳ JSON Schema (Draft-07). ۸ دامنه حکمرانی (GOV-OP تا GOV-OPA), ۸ اصل (OPG-01 تا OPG-08), ۷ هدف (OGO-01 تا OGO-07), ۵ نوع تصمیم (OPDCT-01 تا OPDCT-05), ۵ سطح اختیار (A-0 تا A-4), ۵ سطح انطباق (OPCMP-00 تا OPCMP-04), ۱۲ قاعده (OPG-R01 تا OPG-R12), ۸ محدودیت (OPG-CST-01 تا OPG-CST-08), ۷ گیت کیفیت (OPGQG-01 تا OPGQG-07), ۱۵ معیار (OPGM-01 تا OPGM-15), ۵ نوع استثنا (OPEXC-01 تا OPEXC-05), ۴ مسیر ارجاع, ۶ مرحله چرخه حیات. SSOT حکمرانی عملیات سازمانی SMOS. عدم بازتعریف موجودیت‌های KNW-401.
- **P6.S17 — KNW-403 Enterprise Operations Lifecycle Architecture**: معماری چرخه حیات عملیات سازمانی SMOS. ۳۰ بخش, ۶ بلوک Machine Readable JSON, ۳ JSON Schema (Draft-07). ۹ وضعیت (OPLC-S01 تا OPLC-S09), ۱۹ انتقال مجاز, ۹ دامنه چرخه حیات (OPLC-D01 تا OPLC-D09), ۱۷ رویداد (OPLC-E01 تا OPLC-E17), ۱۵ شاخص چرخه حیات (OPLC-M01 تا OPLC-M15), ۷ گیت کیفیت (OPLC-QG01 تا OPLC-QG07), ۸ محدودیت (OPLC-CST01 تا OPLC-CST08), ۵ نوع انتشار (OPLC-R01 تا OPLC-R05), ۶ نوع تغییر (OPLC-C01 تا OPLC-C06). ۶ بلوک Machine Readable JSON, ۳ JSON Schema (Draft-07). SSOT چرخه حیات عملیات سازمانی SMOS. عدم بازتعریف موجودیت‌های KNW-401.
- **P6.S18 — KNW-404 Enterprise Operations Reporting Knowledge**: دانش گزارش‌دهی عملیاتی SMOS. ۳۰ بخش, ۶ بلوک Machine Readable JSON, ۳ JSON Schema (Draft-07). ۸ دامنه گزارش‌دهی (OPR-D01 تا OPR-D08), ۱۲ KPI عملیاتی (OPR-K01 تا OPR-K12), ۲۰ معیار (OPR-M01 تا OPR-M20), ۴ سطح داشبورد, ۶ نوع نشانگر, ۲۰ گزارش در رجیستری (OPR-RG01 تا OPR-RG20), ۱۵ معیار اثربخشی (OPR-RM01 تا OPR-RM15), ۱۵ نقش مصرف‌کننده (OPR-CM01 تا OPR-CM15), ۷ گیت کیفیت (OPR-QG01 تا OPR-QG07), ۸ محدودیت (OPR-CST01 تا OPR-CST08), ۱۵ زمان‌بندی (OPR-SC01 تا OPR-SC15), ۶ کانال توزیع, ۴ سطح امنیت, ۵ مرحله تکامل. ۶ بلوک Machine Readable JSON, ۳ JSON Schema (Draft-07). SSOT گزارش‌دهی عملیاتی SMOS. عدم بازتعریف موجودیت‌های KNW-401.
- **P6.S19 — KNW-405 Enterprise Operations Continuity Knowledge**: دانش تداوم عملیات SMOS. ۳۰ بخش, ۶ بلوک Machine Readable JSON, ۳ JSON Schema (Draft-07). ۸ دامنه تداوم (OPC-D01 تا OPC-D08), ۵ سطح بحرانیت (OPC-C01 تا OPC-C05), ۶ سطح تداوم (OPC-L01 تا OPC-L06), ۸ وضعیت تداوم (OPC-S01 تا OPC-S08), ۸ دسته اختلال (OPC-DC01 تا OPC-DC08), ۵ سطح شدت (OPC-DS01 تا OPC-DS05), ۹ رویداد تداوم (OPC-E01 تا OPC-E09), ۷ گیت کیفیت (OPC-QG01 تا OPC-QG07). پنجمین و آخرین سند خانواده KNW-OPS. SSOT تداوم عملیات SMOS. عدم بازتعریف موجودیت‌های KNW-401. **تکمیل خانواده KNW-OPS (۵ سند)**.
- **P6.S20 — KNW-501 Enterprise AI Knowledge Foundation**: پایه دانش هوش مصنوعی سازمانی SMOS. ۳۰ بخش, ۶ بلوک Machine Readable JSON, ۳ JSON Schema (Draft-07). ۲۰ مفهوم (AIC-001 تا AIC-020), ۱۲ موجودیت (AIE-001 تا AIE-012), ۱۴ قابلیت (AICAP-001 تا AICAP-014), ۱۴ کارکرد (AIF-01 تا AIF-14), ۸ دامنه (AID-01 تا AID-08), ۸ وضعیت (AIS-01 تا AIS-08), ۱۰ رابطه (AIR-01 تا AIR-10), ۱۰ معیار (AIM-01 تا AIM-10), ۸ اصل (AIP-01 تا AIP-08), ۱۲ سرویس (AISRV-01 تا AISRV-12). نخستین سند خانواده KNW-AI. SSOT مفاهیم هوش مصنوعی SMOS. نگاشت مستقیم به AI-001..AI-014.
- **P6.S21 — KNW-502 Enterprise AI Reasoning Architecture**: معماری استدلال هوش مصنوعی سازمانی SMOS. ۳۰ بخش, ۶ بلوک Machine Readable JSON, ۳ JSON Schema (Draft-07). ۲۰ مفهوم (ARC-001 تا ARC-020), ۱۲ موجودیت (ARE-001 تا ARE-012), ۱۴ قابلیت (ARCAP-001 تا ARCAP-014), ۱۴ کارکرد (ARF-01 تا ARF-14), ۸ دامنه (ARD-01 تا ARD-08), ۸ وضعیت (ARS-01 تا ARS-08), ۷ الگو (ARPT-01 تا ARPT-07), ۸ مرحله (ARST-01 تا ARST-08), ۸ مدل تصمیم (ARDM-01 تا ARDM-08), ۱۰ رابطه (ARR-01 تا ARR-10). دومین سند خانواده KNW-AI. SSOT معماری استدلال هوش مصنوعی SMOS.
- **P6.S22 — KNW-503 Enterprise AI Memory Architecture**: معماری حافظه هوش مصنوعی سازمانی SMOS. ۳۰ بخش, ۶ بلوک Machine Readable JSON, ۳ JSON Schema (Draft-07). ۲۰ مفهوم (AMC-001 تا AMC-020), ۱۲ موجودیت (AME-001 تا AME-012), ۸ نوع حافظه (AMT-001 تا AMT-008), ۸ دامنه (AMD-01 تا AMD-08), ۸ وضعیت (AMS-01 تا AMS-08), ۱۴ عملیات (AMOP-001 تا AMOP-014), ۱۰ رابطه (AMR-01 تا AMR-10), ۱۵ معیار (AMM-01 تا AMM-015), ۸ اصل (AMP-01 تا AMP-08), ۸ مرحله چرخه حیات (AMST-01 تا AMST-08). سومین سند خانواده KNW-AI. SSOT معماری حافظه هوش مصنوعی SMOS.
- **P6.S23 — KNW-504 Enterprise AI Tool Architecture**: معماری ابزار هوش مصنوعی سازمانی SMOS. ۳۰ بخش, ۶ بلوک Machine Readable JSON, ۳ JSON Schema (Draft-07). ۲۰ مفهوم (ATC-001 تا ATC-020), ۱۲ موجودیت (ATE-001 تا ATE-012), ۱۴ قابلیت (ATCAP-001 تا ATCAP-014), ۱۴ کارکرد (ATF-01 تا ATF-14), ۸ دامنه (ATD-01 تا ATD-08), ۸ وضعیت (ATS-01 تا ATS-08), ۷ الگو (ATPT-01 تا ATPT-07), ۸ مدل انتخاب (ATSM-01 تا ATSM-08), ۱۰ رابطه (ATR-01 تا ATR-10), ۱۵ معیار (ATM-001 تا ATM-015), ۸ اصل (ATP-01 تا ATP-08), ۸ مرحله چرخه حیات (ATST-01 تا ATST-08). چهارمین سند خانواده KNW-AI. SSOT معماری ابزار هوش مصنوعی SMOS.
- **P6.S24 — KNW-505 Enterprise AI Planning Architecture**: معماری برنامه‌ریزی هوش مصنوعی سازمانی SMOS. ۳۰ بخش, ۶ بلوک Machine Readable JSON, ۳ JSON Schema (Draft-07). ۲۰ مفهوم (APC-001 تا APC-020), ۱۲ موجودیت (APE-001 تا APE-012), ۱۴ قابلیت (APCAP-001 تا APCAP-014), ۱۴ کارکرد (APF-01 تا APF-14), ۸ دامنه (APD-01 تا APD-08), ۸ وضعیت (APS-01 تا APS-08), ۸ مرحله (APST-01 تا APST-08), ۸ مدل تصمیم (APDM-01 تا APDM-08), ۱۰ رابطه (APR-01 تا APR-10), ۱۵ معیار (APM-001 تا APM-015), ۸ اصل (APP-01 تا APP-08), ۸ مرحله چرخه حیات (APLC-01 تا APLC-08). پنجمین سند خانواده KNW-AI. SSOT معماری برنامه‌ریزی هوش مصنوعی SMOS.
- **P6.S25 — KNW-506 Enterprise AI Decision Architecture**: معماری تصمیم‌گیری هوش مصنوعی سازمانی SMOS. ۳۰ بخش, ۶ بلوک Machine Readable JSON, ۳ JSON Schema (Draft-07). ۲۰ مفهوم (ADC-001 تا ADC-020), ۱۲ موجودیت (ADE-001 تا ADE-012), ۱۴ قابلیت (ADCAP-001 تا ADCAP-014), ۱۴ کارکرد (ADF-01 تا ADF-14), ۸ دامنه (ADD-01 تا ADD-08), ۸ وضعیت (ADS-01 تا ADS-08), ۸ مرحله (ADST-01 تا ADST-08), ۸ مدل تصمیم (ADDM-01 تا ADDM-08), ۱۰ رابطه (ADR-01 تا ADR-10), ۱۵ معیار (ADM-001 تا ADM-015), ۸ اصل (ADP-01 تا ADP-08), ۸ مرحله چرخه حیات (ADLC-01 تا ADLC-08). ششمین سند خانواده KNW-AI. SSOT معماری تصمیم‌گیری هوش مصنوعی SMOS.
- **P6.S26 — KNW-507 Enterprise AI Collaboration Architecture**: معماری همکاری هوش مصنوعی سازمانی SMOS. ۳۰ بخش, ۶ بلوک Machine Readable JSON, ۳ JSON Schema (Draft-07). ۲۰ مفهوم (ACC-001 تا ACC-020), ۱۲ موجودیت (ACE-001 تا ACE-012), ۱۴ قابلیت (ACCAP-001 تا ACCAP-014), ۱۴ کارکرد (ACF-01 تا ACF-14), ۸ دامنه (ACD-01 تا ACD-08), ۸ وضعیت (ACS-01 تا ACS-08), ۸ مرحله (ACST-01 تا ACST-08), ۸ مدل همکاری (ACDM-01 تا ACDM-08), ۱۰ رابطه (ACR-01 تا ACR-10), ۱۵ معیار (ACM-001 تا ACM-015), ۸ اصل (ACP-01 تا ACP-08), ۸ مرحله چرخه حیات (ACLC-01 تا ACLC-08). هفتمین سند خانواده KNW-AI. SSOT معماری همکاری هوش مصنوعی SMOS.
- **P6.S27 — KNW-508 Enterprise AI Learning Architecture**: معماری یادگیری هوش مصنوعی سازمانی SMOS. ۳۰ بخش, ۶ بلوک Machine Readable JSON, ۳ JSON Schema (Draft-07). ۲۰ مفهوم (ALC-001 تا ALC-020), ۱۲ موجودیت (ALE-001 تا ALE-012), ۱۴ قابلیت (ALCAP-001 تا ALCAP-014), ۱۴ کارکرد (ALF-01 تا ALF-14), ۸ دامنه (ALD-01 تا ALD-08), ۸ وضعیت (ALS-01 تا ALS-08), ۸ مرحله (ALST-01 تا ALST-08), ۸ مدل یادگیری (ALMD-01 تا ALMD-08), ۱۰ رابطه (ALR-01 تا ALR-10), ۱۵ معیار (ALM-001 تا ALM-015). هشتمین سند خانواده KNW-AI. SSOT معماری یادگیری هوش مصنوعی SMOS.
- **P6.S28 — KNW-509 Enterprise AI Orchestration Architecture**: معماری هماهنگ‌سازی هوش مصنوعی سازمانی SMOS. ۳۰ بخش, ۶ JSON Block, ۳ JSON Schema (Draft-07). ۲۰ مفهوم (AOC-001 تا AOC-020), ۱۲ موجودیت (AOE-001 تا AOE-012), ۱۴ قابلیت (AOCAP-001 تا AOCAP-014), ۱۴ کارکرد (AOF-01 تا AOF-14), ۸ دامنه (AOD-01 تا AOD-08), ۸ وضعیت (AOS-01 تا AOS-08), ۸ مرحله (AOST-01 تا AOST-08), ۸ مدل هماهنگی (AODM-01 تا AODM-08), ۱۰ رابطه (AOR-01 تا AOR-10), ۱۵ معیار (AOM-001 تا AOM-015), ۱۵ مدل معماری. نهمین سند خانواده KNW-AI. SSOT معماری هماهنگ‌سازی هوش مصنوعی SMOS.
- **P6.S29 — KNW-510 Enterprise AI Meta Architecture**: معماری کلان دانش هوش مصنوعی سازمانی SMOS. ۳۰ بخش, ۶ JSON Block, ۳ JSON Schema (Draft-07). ۸ اصل معماری (MAP-01..08), ۵ لایه معنایی, ۹×۹ Dependency Matrix, ۱۲ SSOT Rule, ۸ Consistency Rule, ۸ Cross-document Constraint, ۷ Quality Gate. تعریف مرزهای دقیق ۹ سند خانواده KNW-AI, ماتریس مالکیت, استراتژی تکامل, Version Compatibility. **SSOT خانواده KNW-AI — معماری معماری‌ها**. **خانواده KNW-AI کامل شد (۱۰ سند: KNW-501..510)**.
- **P6.S30 — KNW-701 Enterprise Brand Knowledge Foundation**: پایه دانش برند سازمانی SMOS. ۳۰ بخش, ۶ JSON Block, ۳ JSON Schema (Draft-07). ۲۰ مفهوم (BRC-001..020), ۱۲ موجودیت (BRE-001..012), ۱۴ قابلیت (BRCAP-001..014), ۱۴ کارکرد (BRF-01..14), ۸ دامنه (BRD-01..08), ۸ وضعیت (BRS-01..08), ۱۰ رابطه (BRR-01..10), ۱۵ معیار (BRM-01..15), ۸ اصل (BRP-01..08), ۸ محدودیت (BRCST-01..08), ۷ گیت کیفیت (QG-BRD-01..07). **نخستین سند خانواده KNW-BRD**. فعال‌سازی خانواده KNW-BRD.
- **P6.S31 — KNW-801 Enterprise Reference Knowledge Foundation**: پایه دانش مرجع سازمانی SMOS. ۳۰ بخش, ۶ JSON Block, ۳ JSON Schema (Draft-07). ۲۰ مفهوم (RFC-001..020), ۱۲ موجودیت (RFE-001..012), ۱۴ قابلیت (RFCAP-001..014), ۱۴ کارکرد (RFF-01..14), ۸ دامنه (RFD-01..08), ۸ وضعیت (RFS-01..08), ۱۰ رابطه (RFR-01..10), ۱۵ معیار (RFM-01..15), ۸ اصل (RFP-01..08), ۸ محدودیت (RFCST-01..08), ۷ گیت کیفیت (RFQG-01..07). **نخستین سند خانواده KNW-REF**. فعال‌سازی خانواده KNW-REF.
- **P7.S01 — COM-001 Enterprise Content Architecture**: معماری محتوای سازمانی SMOS. ۳۰ بخش, ۶ JSON Block, ۳ JSON Schema (Draft-07). ۲۰ مفهوم (CCC-001..020), ۱۲ موجودیت (CCE-001..012), ۱۴ قابلیت (CCCAP-001..014), ۱۴ کارکرد (CCF-01..14), ۸ دامنه (CCD-01..08), ۸ وضعیت (CCS-01..08), ۱۰ رابطه (CCR-01..10), ۱۵ معیار (CCM-01..15), ۸ اصل (CCP-01..08), ۸ محدودیت (CCCST-01..08), ۷ گیت کیفیت (CCQG-01..07). **نخستین سند خانواده COM**. فعال‌سازی خانواده Communication Architecture.
- **P7.S02 — COM-002 Enterprise Brand Voice Architecture**: معماری صدای برند سازمانی SMOS. ۳۰ بخش, ۶ JSON Block, ۳ JSON Schema (Draft-07). ۲۰ مفهوم (BVC-001..020), ۱۲ موجودیت (BVE-001..012), ۱۴ قابلیت (BVCAP-001..014), ۱۴ کارکرد (BVF-01..14), ۸ دامنه (BVD-01..08), ۸ وضعیت (BVS-01..08), ۱۰ رابطه (BVR-01..10), ۱۵ معیار (BVM-01..15), ۸ اصل (BVP-01..08), ۸ محدودیت (BVCST-01..08), ۷ گیت کیفیت (BVQG-01..07). **دومین سند خانواده COM**. SSOT معماری صدای برند سازمانی SMOS.
- **P7.S03 — COM-003 Enterprise Editorial Architecture**: معماری تحریریه سازمانی SMOS. ۳۰ بخش, ۶ JSON Block, ۳ JSON Schema (Draft-07). ۲۰ مفهوم (EDC-001..020), ۱۲ موجودیت (EDE-001..012), ۱۴ قابلیت (EDCAP-001..014), ۱۴ کارکرد (EDF-01..14), ۸ دامنه (EDD-01..08), ۸ وضعیت (EDS-01..08), ۱۰ رابطه (EDR-01..10), ۱۵ معیار (EDM-01..15), ۸ اصل (EDP-01..08), ۸ محدودیت (EDCST-01..08), ۷ گیت کیفیت (EDQG-01..07). **سومین سند خانواده COM**. SSOT معماری تحریریه سازمانی SMOS.
- **P7.S04 — COM-004 Enterprise Social Media Architecture**: معماری شبکه‌های اجتماعی سازمانی SMOS. ~۹۱۵ خط, ۳۰ بخش, ۶ JSON Block, ۳ JSON Schema (Draft-07). ۲۰ مفهوم (SMC-001..020), ۱۲ موجودیت (SME-001..012), ۱۴ قابلیت (SMCAP-001..014), ۱۴ کارکرد (SMF-01..14), ۸ دامنه (SMD-01..08), ۸ وضعیت (SMS-01..08), ۱۰ رابطه (SMR-01..10), ۱۵ معیار (SMM-01..15), ۸ اصل (SMP-01..08), ۸ محدودیت (SMCST-01..08), ۷ گیت کیفیت (SMQG-01..07). **چهارمین سند خانواده COM**. SSOT معماری شبکه‌های اجتماعی سازمانی SMOS.
- **P7.S05 — COM-005 Enterprise Knowledge Publishing Architecture**: معماری انتشار دانش سازمانی SMOS. ~۹۵۰ خط, ۳۰ بخش, ۶ JSON Block, ۳ JSON Schema (Draft-07). ۲۰ مفهوم (KPC-001..020), ۱۲ موجودیت (KPE-001..012), ۱۴ قابلیت (KPCAP-001..014), ۱۴ کارکرد (KPF-01..14), ۸ دامنه (KPD-01..08), ۸ وضعیت (KPS-01..08), ۱۰ رابطه (KPR-01..10), ۱۵ معیار (KPM-01..15), ۸ اصل (KPP-01..08), ۸ محدودیت (KPCST-01..08), ۷ گیت کیفیت (KPQG-01..07). **پنجمین سند خانواده COM — تکمیل خانواده COM (۵ سند)**. SSOT معماری انتشار دانش سازمانی SMOS.
- **P7.S01 — SMOS Enterprise Execution Architecture (SMOS-701..708)**: معماری اجرای سازمانی SMOS — ۸ سند, ~۱۴,۸۴۵ خط, ۵۰+ JSON Schema, ۱۲۱+ Mermaid Diagram, ۲۲۸+ بخش. شامل SMOS-701 (معماری اجرا با ۸ Runtime), SMOS-702 (ماشین حالت با ۲۳ حالت), SMOS-703 (مدل بافت با ۱۰ نوع), SMOS-704 (هماهنگ‌سازی با ۱۲ الگو), SMOS-705 (رویدادها با ۷۸ رویداد), SMOS-706 (نظارت با ۶۰+ متریک), SMOS-707 (امنیت زمان اجرا با ۱۵ مدل تهدید), SMOS-708 (طرح جامع زمان اجرا). مخزن: docs/75-EXECUTION/. آخرین فاز معماری بزرگ SMOS.
- **P7.S02 — SMOS Enterprise Runtime Engine (SMOS-709..718)**: موتور زمان اجرای سازمانی SMOS — ۱۰ سند, ~۲۳,۸۸۹ خط, ۶۰+ JSON Schema, ۱۰۰+ Mermaid Diagram, ۲۷۰+ بخش. شامل SMOS-709 (زمان‌بند اجرا با ۴ الگوریتم), SMOS-710 (موتور گردش کار با ۱۲ الگو), SMOS-711 (ماندگاری اجرا با ۶ مدل داده), SMOS-712 (اجرای توزیع‌شده با قفل توزیع‌شده), SMOS-713 (ایست بازرسی و بازیابی), SMOS-714 (ساگا و جبران), SMOS-715 (تله‌متری زمان اجرا), SMOS-716 (بهینه‌سازی زمان اجرا), SMOS-717 (کیت توسعه زمان اجرا), SMOS-718 (طرح جامع موتور زمان اجرا). مخزن: docs/75-EXECUTION/.
- **P7.S03 — Enterprise Control Plane & Global Orchestration (SMOS-719..728)**: لایه کنترل متمرکز SMOS — ۱۰ سند, ~۱۰,۵۰۰+ خط, ۵۰+ JSON Schema, ۵۰+ Mermaid Diagram, ۱۶۰+ بخش. شامل SMOS-719 (Enterprise Control Plane با ۲۵+ کامپوننت), SMOS-720 (Global Orchestrator با ۴ موتور), SMOS-721 (Policy Engine با PDP/PEP), SMOS-722 (Resource Management), SMOS-723 (Configuration & Feature Management), SMOS-724 (Multi-Region Coordination), SMOS-725 (Governance & SLA), SMOS-726 (Enterprise Control APIs با ۹ دامنه), SMOS-727 (Control Plane Security), SMOS-728 (Enterprise Control Blueprint). مخزن: docs/75-EXECUTION/.
- **P7.S04 — Runtime Lifecycle & Evolution (SMOS-729..738)**: چرخه حیات و تکامل زمان اجرا SMOS — ۱۰ سند, ~۳,۲۱۹+ خط, ۳۰+ JSON Schema, ۲۰+ Mermaid Diagram, ۱۴۳+ بخش. شامل SMOS-729 (Runtime Lifecycle با ۱۰ نوع artifact), SMOS-730 (State Evolution با ۱۳ حالت), SMOS-731 (Version Management با SemVer), SMOS-732 (Migration با ۵ استراتژی), SMOS-733 (Compatibility Matrix با ۸ بعد), SMOS-734 (Dependency Graph با ۶ نوع رابطه), SMOS-735 (Release Management با ۵ کانال), SMOS-736 (Retirement با ۵ فاز), SMOS-737 (Evolution Governance با ۴ سطح اختیار), SMOS-738 (Lifecycle Master Blueprint). مخزن: docs/75-EXECUTION/. **کل P7: ۳۸ سند, ~۵۲,۴۰۰+ خط**.
- **P8.S01 — KNW-201 Enterprise Knowledge Compiler Architecture**: معماری کامپایلر دانش سازمانی SMOS. ~۸۸۰ خط, ۳۲ بخش, ۶ JSON Block, ۳ JSON Schema (Draft-07). ۲۰ مفهوم (KCP-001..020), ۱۲ موجودیت (KCE-001..012), ۱۴ قابلیت (KCCAP-001..014), ۱۴ کارکرد (KCF-01..14), ۸ دامنه (KCD-01..08: Source Ingestion, Content Extraction, Structural Validation, Semantic Validation, Normalization, Transformation, Quality Assessment, Registration & Indexing), ۱۰ وضعیت (KCS-01..10), ۹ مرحله خط لوله (KCPL-01..09), ۱۰ رابطه (KCR-01..10), ۱۵ معیار (KCM-01..15), ۸ اصل (KCPR-01..08), ۸ محدودیت (KCCST-01..08), ۷ گیت کیفیت (KCQG-01..07). **نخستین سند خانواده KNW-ENG**. SSOT معماری کامپایلر دانش سازمانی SMOS. وابستگی: KNW-000, KNW-001, KNW-101, KNW-301, KNW-401, KNW-501, KNW-510, KNW-701, KNW-801, AI-011, AUT-000, PRM-000.
- **P8.S02 — KNW-202 Enterprise Knowledge Graph Architecture**: معماری گراف دانش سازمانی SMOS. ~۹۰۰ خط, ۳۱ بخش, ۶ JSON Block, ۳ JSON Schema (Draft-07). ۲۰ مفهوم (KGC-001..020), ۱۲ موجودیت (KGE-001..012), ۱۴ قابلیت (KGCAP-001..014), ۱۴ کارکرد (KGF-01..14), ۸ دامنه (KGD-01..08: Concept, Entity, Capability, Knowledge, Reference, Dependency, Traceability, Evolution), ۸ وضعیت (KGS-01..08), ۱۸ انتقال مجاز, ۱۲ دسته گره (Node Category), ۱۰ نوع یال (Edge Category), ۸ لایه گراف, ۱۰ نوع رابطه (KGR-01..10), ۱۵ معیار (KGM-001..15), ۸ اصل (KGP-01..08), ۸ محدودیت (KGCST-01..08), ۷ گیت کیفیت (KGQG-01..07). **دومین سند خانواده KNW-ENG**. SSOT معماری گراف دانش سازمانی SMOS. Platform Neutral, Architecture Neutral, Implementation Free, Vendor Neutral — بدون RDF, OWL, SPARQL, Cypher, API, یا پایگاه داده خاص.
- **P8.S03 — KNW-203 Enterprise Semantic Engine Architecture**: معماری موتور معنایی سازمانی SMOS. ~۹۵۰ خط, ۳۰ بخش, ۶ JSON Block, ۳ JSON Schema (Draft-07). ۲۰ مفهوم (SEC-001..020), ۱۲ موجودیت (SEE-001..012), ۱۴ قابلیت (SECAP-001..014), ۱۴ کارکرد (SEF-01..14), ۸ دامنه (SED-01..08: Meaning Resolution, Semantic Classification, Knowledge Interpretation, Relationship Resolution, Inference Coordination, Semantic Validation, Semantic Discovery, Semantic Evolution), ۸ وضعیت (SES-01..08), ۱۸ انتقال مجاز, ۸ سرویس معنایی (SESRV-01..08), ۱۰ رابطه معنایی (SER-01..10), ۱۵ معیار (SEM-001..015), ۸ اصل (SEP-01..08), ۸ محدودیت (SECST-01..08), ۷ گیت کیفیت (SEQG-01..07). **سومین سند خانواده KNW-ENG**. SSOT معماری موتور معنایی سازمانی SMOS. Platform Neutral, Architecture Neutral, Implementation Free, Vendor Neutral — بدون LLM, Embedding, RDF, OWL, SPARQL, API یا پایگاه داده. تفسیر معنایی بر روی گراف دانش (KNW-202).
- **P8.S04 — KNW-204 Enterprise Knowledge Query Architecture**: معماری پرس‌وجوی دانش سازمانی SMOS. ~۹۵۰+ خط, ۳۰ بخش, ۶ JSON Block, ۳ JSON Schema (Draft-07). ۲۰ مفهوم (KQC-001..020), ۱۲ موجودیت (KQE-001..012), ۱۴ قابلیت (KQCAP-001..014), ۱۴ کارکرد (KQF-01..14), ۸ دامنه (KQD-01..08: Identity Query, Reference Query, Relationship Query, Dependency Query, Context Query, Capability Query, Semantic Query, Composite Query), ۸ وضعیت (KQS-01..08), ۱۸ انتقال مجاز, ۸ مرحله (KQST-01..08), ۸ مدل پرس‌وجو (KQM-01..08: Identity, Reference, Relationship, Dependency, Context, Capability, Semantic, Composite), ۱۰ رابطه (KQR-01..10), ۱۵ معیار (KQM-001..015), ۸ اصل (KQP-01..08), ۸ محدودیت (KQCST-01..08), ۷ گیت کیفیت (KQQG-01..07). **چهارمین سند خانواده KNW-ENG**. SSOT معماری پرس‌وجوی دانش سازمانی SMOS. Platform Neutral, Architecture Neutral, Implementation Free, Vendor Neutral — بدون SQL, GraphQL, Cypher, SPARQL, API, Query Language, یا Vendor خاص.
- **P8.S05 — KNW-205 Enterprise Knowledge Federation Architecture**: معماری فدراسیون دانش سازمانی SMOS. ~۹۵۰+ خط, ۳۰ بخش, ۶ JSON Block, ۳ JSON Schema (Draft-07). ۲۰ مفهوم (KFC-001..020), ۱۲ موجودیت (KFE-001..012), ۱۴ قابلیت (KFCAP-001..014), ۱۴ کارکرد (KFF-01..14), ۸ دامنه (KFD-01..08: Domain Registration, Identity Resolution, Semantic Mapping, Federated Discovery, Federated Query, Federated Governance, Synchronization, Federation Lifecycle), ۸ وضعیت (KFS-01..08), ۱۸ انتقال مجاز, ۸ مرحله (KFST-01..08), ۸ مدل فدراسیون (KFMD-01..08), ۱۰ رابطه (KFR-01..10), ۱۵ معیار (KFM-001..015), ۸ اصل (KFP-01..08), ۸ محدودیت (KFCST-01..08), ۷ گیت کیفیت (KFQG-01..07). **پنجمین سند خانواده KNW-ENG**. SSOT معماری فدراسیون دانش سازمانی SMOS. Platform Neutral, Architecture Neutral, Implementation Free, Vendor Neutral.
- **P8.S06 — KNW-206 Enterprise Knowledge Resolution Architecture**: معماری تفکیک دانش سازمانی SMOS. ~۹۳۰+ خط, ۳۰ بخش, ۶ JSON Block, ۳ JSON Schema (Draft-07). ۲۰ مفهوم (KRC-001..020), ۱۲ موجودیت (KRE-001..012), ۱۴ قابلیت (KRCAP-001..014), ۱۴ کارکرد (KRF-01..14), ۸ دامنه (KRD-01..08: Identity Resolution, Semantic Resolution, Reference Resolution, Relationship Resolution, Ownership Resolution, Version Resolution, Federation Resolution, Conflict Resolution), ۸ وضعیت (KRS-01..08), ۱۸ انتقال مجاز, ۸ مرحله (KRST-01..08), ۸ مدل تفکیک (KRM-01..08), ۱۰ رابطه (KRR-01..10), ۱۵ معیار (KRM-001..015), ۸ اصل (KRP-01..08), ۸ محدودیت (KRCST-01..08), ۷ گیت کیفیت (KRQG-01..07). **ششمین سند خانواده KNW-ENG**. SSOT معماری تفکیک دانش سازمانی SMOS. Platform Neutral, Architecture Neutral, Implementation Free, Vendor Neutral.
- **P7.S06 — Enterprise Architecture Integration Audit**: حسابرسی یکپارچگی معماری سازمانی SMOS. گزارش در docs/90-AUDIT/. امتیاز آمادگی: **۹۴/۱۰۰**. تصمیم: **GO**. شناسایی ۸ issue (۳ major, ۵ minor). اصلاحات KNW-001 v2.27.1-draft اعمال شد (Lifecycle Status, Knowledge Registry, Ownership Matrix, آمار ۳۱→۳۲ سند، Reserved Identifiers). **پایان P7**.
- **P9.S01 — RT-001 Enterprise Runtime Foundation**: بنیاد زمان اجرای سازمانی SMOS. ~۹۵۰+ خط, ۳۰ بخش, ۶ JSON Block, ۳ JSON Schema (Draft-07). ۲۰ مفهوم (RTC-001..020), ۱۲ موجودیت (RTE-001..012), ۱۴ قابلیت (RTCAP-001..014), ۱۴ کارکرد (RTF-01..14), ۸ دامنه (RTD-01..08: Execution, Context, Session, State, Coordination, Scheduling, Monitoring, Recovery), ۸ وضعیت (RTS-01..08: Initialized, Prepared, Ready, Running, Paused, Recovering, Completed, Terminated), ۱۸ انتقال مجاز, ۸ مرحله (RTST-01..08), ۸ مدل (RTM-01..08), ۱۰ رابطه (RTR-01..10), ۱۵ معیار (RTM-001..015), ۸ اصل (RTP-01..08), ۸ محدودیت (RTCST-01..08), ۷ گیت کیفیت (RTQG-01..07). **نخستین سند خانواده RT (Runtime Architecture)**. SSOT بنیاد زمان اجرای سازمانی SMOS. Platform Neutral, Architecture Neutral, Implementation Free, Vendor Neutral. **فعال‌سازی فاز P9**. KNW-001 → v2.28.0-draft.
- **P9.S02 — RT-002 Enterprise Runtime Execution Architecture**: معماری اجرای زمان اجرای سازمانی SMOS. ~۹۸۰+ خط, ۳۰ بخش, ۶ JSON Block, ۳ JSON Schema (Draft-07). ۲۰ مفهوم (REC-001..020), ۱۲ موجودیت (REE-001..012), ۱۴ قابلیت (RECAP-001..014), ۱۴ کارکرد (REF-01..14), ۸ دامنه (RED-01..08: Pipeline, Context, State, Scheduling, Isolation, Monitoring, Recovery, Governance), ۸ وضعیت (RES-01..08: Created, Prepared, Queued, Executing, Waiting, Recovering, Completed, Cancelled), ۲۰ انتقال مجاز, ۸ مرحله (REST-01..08: Receive, Validate, Prepare, Allocate, Execute, Observe, Finalize, Close), ۸ مدل (REDM-01..08), ۱۰ رابطه (RER-01..10), ۱۵ معیار (REM-001..015), ۸ اصل (REP-01..08), ۸ محدودیت (RECST-01..08), ۷ گیت کیفیت (REQG-01..07). معماری: مرز اجرا, بافت اجرا, مالکیت, هویت, ایزولاسیون, هماهنگی, چرخه حیات, مشاهده‌پذیری, سازگاری, ردیابی, حکمرانی. **دومین سند خانواده RT**. KNW-001 → v2.28.1-draft. رزرو RT-003..RT-010.
- **P9.S03 — RT-003 Enterprise Runtime Context Architecture**: معماری بافت زمان اجرای سازمانی SMOS. ~۹۹۹+ خط, ۳۰ بخش, ۶ JSON Block, ۳ JSON Schema (Draft-07). ۲۰ مفهوم (RCC-001..020), ۱۲ موجودیت (RCE-001..012), ۱۴ قابلیت (RCCAP-001..014), ۱۴ کارکرد (RCF-01..14), ۸ دامنه (RCD-01..08: Acquisition, Resolution, Propagation, Isolation, Persistence, Synchronization, Governance, Evolution), ۸ وضعیت (RCS-01..08: Undefined, Collecting, Resolving, Active, Shared, Suspended, Expired, Archived), ۲۰ انتقال مجاز, ۸ مرحله (RCST-01..08: Acquisition, Validation, Resolution, Registration, Propagation, Activation, Synchronization, Archival), ۸ مدل (RCM-01..08: Execution, Session, User, Agent, Knowledge, Operational, Environmental, Composite), ۱۰ رابطه (RCR-01..10), ۱۵ معیار (RCMTR-001..015), ۸ اصل (RCP-01..08), ۸ محدودیت (RCCST-01..08), ۷ گیت کیفیت (RCQG-01..07). معماری: Acquisition, Resolution, Propagation, Isolation, Persistence, Synchronization, Governance, Evolution. **سومین سند خانواده RT**. KNW-001 → v2.28.2-draft.
- **P9.S04 — RT-004 Enterprise Runtime Session Architecture**: معماری نشست زمان اجرای سازمانی SMOS. ~۱۰۰۰+ خط, ۳۰ بخش, ۶ JSON Block, ۳ JSON Schema (Draft-07). ۲۰ مفهوم (RSC-001..020), ۱۲ موجودیت (RSE-001..012), ۱۴ قابلیت (RSCAP-001..014), ۱۴ کارکرد (RSF-01..14), ۸ دامنه (RSD-01..08: Identity, Lifecycle, Context, Ownership, Isolation, Coordination, Governance, Evolution), ۸ وضعیت (RSS-01..08: Created, Initialized, Active, Suspended, Waiting, Resumed, Closed, Archived), ۲۰ انتقال مجاز, ۸ مرحله (RSST-01..08: Create, Initialize, Attach Context, Activate, Maintain, Suspend, Close, Archive), ۸ مدل (RSM-01..08: Execution, User, Agent, Knowledge, Workflow, Collaborative, System, Composite), ۱۲ قانون سازگاری (RSCR-01..12), ۱۰ رابطه (RSR-01..10), ۱۵ معیار (RSMTR-001..015), ۸ اصل (RSP-01..08), ۸ محدودیت (RSCST-01..08), ۸ بعد تاکسونومی (Identity, Ownership, Visibility, Lifetime, Persistence, Isolation, Sensitivity, Scope), ۷ گیت کیفیت (RSQG-01..07). **چهارمین سند خانواده RT**. KNW-001 → v2.28.3-draft.
- **P9.S05 — RT-005 Enterprise Runtime State Architecture**: معماری حالت زمان اجرای سازمانی SMOS. ~۱۰۲۱+ خط, ۳۰ بخش, ۶ JSON Block, ۳ JSON Schema (Draft-07). ۲۰ مفهوم (RSTC-001..020), ۱۲ موجودیت (RSTE-001..012), ۱۴ قابلیت (RSTCAP-001..014), ۱۴ کارکرد (RSTF-01..14), ۸ دامنه (RSTD-01..08: Definition, Transition, Propagation, Persistence, Synchronization, Governance, Evolution, Query), ۸ کلاس حالت (RSTS-01..08), ۲۰ انتقال مجاز, ۸ مرحله (RSTST-01..08), ۸ مدل حالت (RSTM-01..08), ۱۲ قانون سازگاری (RSTCR-01..12), ۱۰ رابطه (RSTR-01..10), ۱۵ معیار (RSTMTR-001..015), ۸ اصل (RSTP-01..08), ۸ محدودیت (RSTCST-01..08), ۵ الگوی حالت (PAT-01..05), ۷ گیت کیفیت (RSTQG-01..07). **پنجمین سند خانواده RT**. KNW-001 → v2.28.4-draft.
- **P9.S06 — RT-006 Enterprise Runtime Coordination Architecture**: معماری هماهنگی زمان اجرای سازمانی SMOS. ~۱۰۰۵+ خط, ۳۰ بخش, ۶ JSON Block, ۳ JSON Schema (Draft-07). ۲۰ مفهوم (RCOC-001..020), ۱۲ موجودیت (RCOE-001..012), ۱۴ قابلیت (RCOCAP-001..014), ۱۴ کارکرد (RCOF-01..14), ۸ دامنه (RCOD-01..08: Collaboration, Synchronization, Delegation, Negotiation, Coordination Governance, Runtime Integration, Distributed Execution, Evolution), ۸ وضعیت (RCOS-01..08: Proposed, Registered, Negotiating, Coordinating, Synchronized, Suspended, Completed, Archived), ۲۰ انتقال مجاز, ۸ مرحله (RCOST-01..08), ۸ مدل هماهنگی (RCOM-01..08: Centralized, Distributed, Hierarchical, Peer-to-Peer, Event Driven, Contract Based, Consensus Based, Hybrid), ۱۰ رابطه (RCOR-01..10), ۱۵ معیار (RCOMTR-001..015), ۸ اصل (RCOP-01..08), ۱۲ قانون سازگاری (RCOCR-01..12), ۸ محدودیت (RCOCST-01..08), ۵ الگوی هماهنگی (PAT-01..05), ۷ گیت کیفیت (RCOQG-01..07). **ششمین سند خانواده RT**. KNW-001 → v2.28.5-draft.
- **P9.S07 — RT-007 Enterprise Runtime Monitoring Architecture**: معماری نظارت زمان اجرای سازمانی SMOS. ~۱۰۸۵ خط, ۳۰ بخش, ۶ JSON Block, ۳ JSON Schema (Draft-07). ۲۰ مفهوم (RMC-001..020), ۱۲ موجودیت (RME-001..012), ۱۴ قابلیت (RMCAP-001..014), ۱۴ کارکرد (RMF-01..14), ۸ دامنه (RMD-01..08: Runtime Health, Telemetry, Observation, Diagnostics, Visibility, Governance, Operational Intelligence, Evolution), ۸ وضعیت (RMS-01..08: Defined, Registered, Monitoring, Evaluating, Reporting, Suspended, Completed, Archived), ۲۰ انتقال مجاز, ۸ مرحله (RMST-01..08), ۸ مدل نظارت (RMM-01..08: Passive, Active, Continuous, Periodic, Event-Oriented, State-Oriented, Policy-Oriented, Hybrid), ۱۰ رابطه (RMR-01..10), ۱۵ معیار (RMMTR-001..015), ۸ اصل (RMP-01..08), ۸ محدودیت (RMCST-01..08), ۷ گیت کیفیت (RMQG-01..07). **هفتمین سند خانواده RT**. KNW-001 → v2.28.6-draft. معماری: Runtime Health, Telemetry, Observation, Diagnostics, Visibility, Governance, Operational Intelligence, Evolution. **تکمیل خانواده RT (۷ سند: RT-001..RT-007)**.
- **P10.S01 — Enterprise Architecture Baseline Validation**: حسابرسی جامع معماری سازمانی SMOS. ~۲۵۸ سند در ۱۶ خانواده. بررسی KNW-001 (۹ مغایرت → رفع شد), وابستگی‌ها (KNW-000, KNW-101 → رفع شد), هدرهای ناسازگار (KNW-205, KNW-206, RT-007 → رفع شد), ارجاعات شکسته (SMOS-707 KNW-500 → رفع شد). تولید گزارش AUDIT-P10-S01. KNW-001 → v2.29.0-draft. امتیاز آمادگی معماری: **۹۲/۱۰۰**. توصیه: رفع ارجاعات به GOV-000, GOV-006, PRM-002, PRM-004.
- **P11.S01 — Content Operations Playbooks**: راهنماهای عملیات روزانه تیم محتوا. ۱۰ سند عملیاتی در `docs/95-CONTENT-OPERATIONS/`. OPS-000 (بنیاد عملیات — ۱۹ بخش), OPS-002 (Social Media — ۲۰ بخش, ۸ پلتفرم), OPS-004 (Editorial Calendar — ۲۰ بخش), OPS-006 (Content Production — ۲۰ بخش, brief→final), OPS-008 (Visual Design System — ۲۵ بخش), OPS-010 (Brand Voice — ۲۳ بخش), OPS-012 (Community Management — ۲۴ بخش), OPS-014 (Content Quality Checklist — ۲۹ بخش, ۶ گیت کیفیت), OPS-016 (Publishing Checklist — ۲۸ بخش, ۶ پلتفرم), OPS-018 (KPI Review — ۲۹ بخش, ۳ سطح داشبورد). هر سند عملیاتی, روزانه و قابل اجرا. بدون معماری, بدون کد, بدون API. KNW-001 → v2.30.0-draft. **گذار از معماری به عملیات روزانه**.

### Blocked

- (none)

## Next Steps

- **P10.S01 — Enterprise Architecture Baseline Validation**: حسابرسی جامع معماری ✓
- **P11.S01 — Content Operations Playbooks**: راهنماهای عملیات محتوا ✓
- **P10.S02 — Runtime SDK & Developer Experience** (برنامه‌ریزی‌شده)
- **P10.S03 — Enterprise API Architecture** (برنامه‌ریزی‌شده)
- **P11.S02 — Content Operations Refinement & Automation** (برنامه‌ریزی‌شده)

## Blocked

- (none)

## Relevant Files (P7-P9)

- `docs/70-KNOWLEDGE/200-enterprise-knowledge-compiler-architecture.md`: KNW-201 — معماری کامپایلر دانش (۳۲ بخش, ۶ JSON Block, ۳ Schema)
- `docs/70-KNOWLEDGE/202-enterprise-knowledge-graph-architecture.md`: KNW-202 — معماری گراف دانش (۳۱ بخش, ۶ JSON Block, ۳ Schema)
- `docs/70-KNOWLEDGE/204-enterprise-semantic-engine-architecture.md`: KNW-203 — معماری موتور معنایی (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/70-KNOWLEDGE/206-enterprise-knowledge-query-architecture.md`: KNW-204 — معماری پرس‌وجوی دانش (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/70-KNOWLEDGE/208-enterprise-knowledge-federation-architecture.md`: KNW-205 — معماری فدراسیون دانش (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/70-KNOWLEDGE/210-enterprise-knowledge-resolution-architecture.md`: KNW-206 — معماری تفکیک دانش (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/90-RUNTIME/000-enterprise-runtime-foundation.md`: RT-001 — بنیاد زمان اجرا (~۹۵۰ خط, ۳۰ بخش, ۶ JSON Block, ۳ Schema, **SSOT بنیاد زمان اجرای سازمانی SMOS**)
- `docs/90-RUNTIME/002-enterprise-runtime-execution-architecture.md`: RT-002 — معماری اجرای زمان اجرا (~۹۸۰+ خط, ۳۰ بخش, ۶ JSON Block, ۳ Schema, **SSOT معماری اجرای زمان اجرای سازمانی SMOS**)
- `docs/90-RUNTIME/004-enterprise-runtime-context-architecture.md`: RT-003 — معماری بافت زمان اجرا (~۹۹۹+ خط, ۳۰ بخش, ۶ JSON Block, ۳ Schema, **SSOT معماری بافت زمان اجرای سازمانی SMOS**)
- `docs/90-RUNTIME/006-enterprise-runtime-session-architecture.md`: RT-004 — معماری نشست زمان اجرا (~۱۰۰۰+ خط, ۳۰ بخش, ۶ JSON Block, ۳ Schema, **SSOT معماری نشست زمان اجرای سازمانی SMOS**)
- `docs/90-RUNTIME/008-enterprise-runtime-state-architecture.md`: RT-005 — معماری حالت زمان اجرا (~۱۰۲۱+ خط, ۳۰ بخش, ۶ JSON Block, ۳ Schema, **SSOT معماری حالت زمان اجرای سازمانی SMOS**)
- `docs/90-RUNTIME/010-enterprise-runtime-coordination-architecture.md`: RT-006 — معماری هماهنگی زمان اجرا (~۱۰۰۵+ خط, ۳۰ بخش, ۶ JSON Block, ۳ Schema, **SSOT معماری هماهنگی زمان اجرای سازمانی SMOS**)
- `docs/90-RUNTIME/012-enterprise-runtime-monitoring-architecture.md`: RT-007 — معماری نظارت زمان اجرا (~۱۰۰۰+ خط, ۳۰ بخش, ۶ JSON Block, ۳ Schema, **SSOT معماری نظارت زمان اجرای سازمانی SMOS**)
- `docs/80-COMMUNICATION/000-enterprise-content-architecture.md`: COM-001 — معماری محتوای سازمانی (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/80-COMMUNICATION/002-enterprise-brand-voice-architecture.md`: COM-002 — معماری صدای برند (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/80-COMMUNICATION/004-enterprise-editorial-architecture.md`: COM-003 — معماری تحریریه سازمانی (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/75-EXECUTION/01-enterprise-execution-architecture.md`: SMOS-701 — معماری اجرای سازمانی (۳۱ بخش, ۸ Runtime, ۱۲ Diagram)
- `docs/75-EXECUTION/02-execution-state-machine.md`: SMOS-702 — ماشین حالت اجرا (۳۱ بخش, ۲۳ حالت, ۲۲ Diagram)
- `docs/75-EXECUTION/03-execution-context-model.md`: SMOS-703 — مدل بافت اجرا (۳۱ بخش, ۱۰ نوع بافت)
- `docs/75-EXECUTION/04-workflow-orchestration.md`: SMOS-704 — هماهنگ‌سازی گردش کار (۳۰ بخش, ۱۲ الگو, ۳۴ Diagram)
- `docs/75-EXECUTION/05-enterprise-event-architecture.md`: SMOS-705 — معماری رویداد (۳۱ بخش, ۷۸ رویداد)
- `docs/75-EXECUTION/06-execution-monitoring-architecture.md`: SMOS-706 — نظارت اجرا (۲۵+ بخش, ۶۰+ متریک)
- `docs/75-EXECUTION/07-enterprise-runtime-security.md`: SMOS-707 — امنیت زمان اجرا (۲۷ بخش, ۱۵ مدل تهدید)
- `docs/75-EXECUTION/08-smos-master-runtime-blueprint.md`: SMOS-708 — طرح جامع زمان اجرا (۲۲+ بخش)
- `docs/75-EXECUTION/09-runtime-scheduler.md`: SMOS-709 — زمان‌بند اجرا (۳۱ بخش, ۴ الگوریتم)
- `docs/75-EXECUTION/10-workflow-runtime-engine.md`: SMOS-710 — موتور گردش کار (۲۴ بخش)
- `docs/75-EXECUTION/11-execution-persistence.md`: SMOS-711 — ماندگاری اجرا (۳۲ بخش)
- `docs/75-EXECUTION/12-distributed-execution.md`: SMOS-712 — اجرای توزیع‌شده (۲۶ بخش)
- `docs/75-EXECUTION/13-checkpoint-recovery.md`: SMOS-713 — ایست بازرسی و بازیابی (۳۰ بخش)
- `docs/75-EXECUTION/14-saga-compensation.md`: SMOS-714 — ساگا و جبران (۳۰ بخش)
- `docs/75-EXECUTION/15-runtime-telemetry.md`: SMOS-715 — تله‌متری زمان اجرا (۳۲ بخش)
- `docs/75-EXECUTION/16-runtime-optimization.md`: SMOS-716 — بهینه‌سازی زمان اجرا (۲۴+ بخش)
- `docs/75-EXECUTION/17-runtime-sdk.md`: SMOS-717 — کیت توسعه زمان اجرا (۲۵ بخش)
- `docs/75-EXECUTION/18-runtime-master-blueprint.md`: SMOS-718 — طرح جامع موتور زمان اجرا (۲۴ بخش)
- `docs/75-EXECUTION/19-enterprise-control-plane.md`: SMOS-719 — معماری لایه کنترل (۲۷ بخش, ۱۰ اصل, ۲۵+ کامپوننت)
- `docs/75-EXECUTION/20-global-orchestrator.md`: SMOS-720 — هماهنگ‌ساز سراسری (۱۵ بخش, ۴ موتور)
- `docs/75-EXECUTION/21-policy-engine.md`: SMOS-721 — موتور خط‌مشی (۱۷ بخش, PDP/PEP, ۷ نوع خط‌مشی)
- `docs/75-EXECUTION/22-resource-management.md`: SMOS-722 — مدیریت منابع (۱۳ بخش, ۶ منبع, ۴ مدل ظرفیت)
- `docs/75-EXECUTION/23-configuration-feature-management.md`: SMOS-723 — مدیریت پیکربندی و Feature Flag (۱۵ بخش, ۵ سطح سلسله‌مراتب)
- `docs/75-EXECUTION/24-multi-region-coordination.md`: SMOS-724 — هماهنگی چندمنطقه‌ای (۱۵ بخش, ۴ نقش منطقه, ۴ مدل سازگاری)
- `docs/75-EXECUTION/25-governance-sla.md`: SMOS-725 — حکمرانی و SLA (۱۲ بخش, ۶ گیت کیفیت)
- `docs/75-EXECUTION/26-enterprise-control-apis.md`: SMOS-726 — APIهای لایه کنترل (۱۶ بخش, ۹ دامنه API)
- `docs/75-EXECUTION/27-control-plane-security.md`: SMOS-727 — امنیت لایه کنترل (۱۴ بخش, ۴ سطح مجوز, ۵ منطقه امنیتی)
- `docs/75-EXECUTION/28-enterprise-control-blueprint.md`: SMOS-728 — طرح جامع لایه کنترل (۱۷ بخش, رجیستری ۱۰ کامپوننت)
- `docs/75-EXECUTION/29-runtime-lifecycle.md`: SMOS-729 — معماری چرخه حیات زمان اجرا (۱۹ بخش, ۱۰ نوع artifact)
- `docs/75-EXECUTION/30-runtime-state-evolution.md`: SMOS-730 — تکامل حالت زمان اجرا (۱۵ بخش, ۱۳ حالت, ۲۲+ انتقال)
- `docs/75-EXECUTION/31-runtime-version-management.md`: SMOS-731 — مدیریت نسخه (۱۶ بخش, SemVer, سناریوهای ارتقا و بازگشت)
- `docs/75-EXECUTION/32-runtime-migration.md`: SMOS-732 — مهاجرت زمان اجرا (۱۶ بخش, ۵ استراتژی: Blue-Green, Canary, Dark Launch)
- `docs/75-EXECUTION/33-runtime-compatibility.md`: SMOS-733 — ماتریس سازگاری (۱۴ بخش, ۸ بعد سازگاری)
- `docs/75-EXECUTION/34-runtime-dependency-graph.md`: SMOS-734 — گراف وابستگی (۱۶ بخش, ۶ نوع رابطه)
- `docs/75-EXECUTION/35-runtime-release-management.md`: SMOS-735 — مدیریت انتشار (۱۱ بخش, ۵ کانال انتشار)
- `docs/75-EXECUTION/36-runtime-retirement.md`: SMOS-736 — بازنشستگی زمان اجرا (۹ بخش, ۵ فاز بازنشستگی)
- `docs/75-EXECUTION/37-runtime-evolution-governance.md`: SMOS-737 — حکمرانی تکامل (۱۴ بخش, ۴ سطح اختیار)
- `docs/75-EXECUTION/38-runtime-lifecycle-blueprint.md`: SMOS-738 — طرح جامع چرخه حیات (۱۳ بخش, رجیستری ۱۰ کامپوننت, ۳۸ سند P7)
- `docs/70-KNOWLEDGE/300-platform-knowledge-foundation.md`: KNW-301 — پایه دانش پلتفرم سازمانی (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/70-KNOWLEDGE/302-platform-capability-service-architecture.md`: KNW-302 — معماری قابلیت‌ها و سرویس‌های پلتفرم (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/70-KNOWLEDGE/304-platform-relationship-architecture.md`: KNW-303 — معماری روابط پلتفرم (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/70-KNOWLEDGE/306-platform-governance-architecture.md`: KNW-304 — معماری حکمرانی پلتفرم (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/70-KNOWLEDGE/308-platform-lifecycle-architecture.md`: KNW-305 — معماری چرخه حیات پلتفرم (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/70-KNOWLEDGE/310-platform-quality-architecture.md`: KNW-306 — معماری کیفیت پلتفرم (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/70-KNOWLEDGE/312-platform-evolution-architecture.md`: KNW-307 — معماری تکامل پلتفرم (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/70-KNOWLEDGE/314-platform-security-architecture.md`: KNW-308 — معماری امنیت پلتفرم (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/70-KNOWLEDGE/400-operations-knowledge-foundation.md`: KNW-401 — پایه دانش عملیات سازمانی (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/70-KNOWLEDGE/402-operations-governance-architecture.md`: KNW-402 — معماری حکمرانی عملیات سازمانی (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/70-KNOWLEDGE/404-operations-lifecycle-architecture.md`: KNW-403 — معماری چرخه حیات عملیات سازمانی (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/70-KNOWLEDGE/406-operations-reporting-knowledge.md`: KNW-404 — دانش گزارش‌دهی عملیاتی (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/70-KNOWLEDGE/408-operations-continuity-knowledge.md`: KNW-405 — دانش تداوم عملیات (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/70-KNOWLEDGE/500-ai-knowledge-foundation.md`: KNW-501 — پایه دانش هوش مصنوعی سازمانی (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/70-KNOWLEDGE/502-ai-reasoning-architecture.md`: KNW-502 — معماری استدلال هوش مصنوعی سازمانی (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/70-KNOWLEDGE/504-ai-memory-architecture.md`: KNW-503 — معماری حافظه هوش مصنوعی سازمانی (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/95-CONTENT-OPERATIONS/000-content-operations-foundation.md`: OPS-000 — بنیاد عملیات محتوا (۱۹ بخش, نقش‌ها, اصول, چرخه حیات)
- `docs/95-CONTENT-OPERATIONS/002-social-media-operations-playbook.md`: OPS-002 — راهنمای عملیات شبکه‌های اجتماعی (۲۰ بخش, ۸ پلتفرم, چک‌لیست‌ها, تصمیم‌نامه‌ها, بحران)
- `docs/95-CONTENT-OPERATIONS/004-editorial-calendar-playbook.md`: OPS-004 — راهنمای تقویم تحریریه (۲۰ بخش, ساختار تقویم, مهلت‌ها, ظرفیت, کمپین‌ها)
- `docs/95-CONTENT-OPERATIONS/006-content-production-playbook.md`: OPS-006 — راهنمای تولید محتوا (۲۰ بخش, brief→final, استانداردها, گیت‌ها, دارایی‌ها)

## قواعد کار

1. **همیشه اول `docs/00-ARCHITECTURE/01-system-overview.md` (ARCH-001) را بخوان** — نمای کلی سیستم. این سند دروازه ورود به کل SMOS است.
2. **سپس `docs/00-ARCHITECTURE/30-governance-architecture.md` را بخوان** — معماری حکمرانی، مالکیت و RACI.
3. **سپس `docs/00-ARCHITECTURE/10-meta-architecture.md` را بخوان** — معماری متا، لایه‌ها و سلسله‌مراتب سیستم.
4. **سپس `docs/00-ARCHITECTURE/11-object-model.md` را بخوان** — مدل اشیاء و چرخه حیات.
5. **پیش از ویرایش یا ایجاد سند، مستندات `docs/10-GOVERNANCE/` را بررسی کن** — استانداردهای نام‌گذاری (GOV-003)، نسخه‌بندی (GOV-002)، cross-reference (GOV-004)، متادیتا (GOV-005) و قالب مستندات (GOV-001).
6. **از `opencode.json` (در صورت وجود) دستورات و ارجاعات را استخراج کن.**
7. **هیچ محتوای تکراری ایجاد نکن** — هر موضوع یک تک منبع حقیقت (Single Source of Truth) دارد.
8. **اسناد استراتژیک (evergreen) را از عملیاتی (frequently updated) جدا نگه دار.**
9. **پس از افزودن کد:** `README*`، `package.json` (یا معادل)، کانفیگ‌های CI و lint را بخوان و این فایل را به‌روز کن.
10. **پیش از ایجاد هر Agent جدید (AI-NNN)، `docs/40-AI-AGENTS/00-enterprise-ai-agent-architecture.md` (AI-000) را بخوان** — معماری مادر عامل‌های هوشمند. تمام Agentها از AI-000 مشتق می‌شوند.
11. **پیش از ایجاد هر پرامپت جدید (PRM-NNN)، `docs/60-PROMPTS/00-enterprise-prompt-architecture.md` (PRM-000) را بخوان** — معماری مادر پرامپت. تمام پرامپت‌ها از PRM-000 مشتق می‌شوند.

## Relevant Files

- `docs/60-PROMPTS/00-enterprise-prompt-architecture.md`: PRM-000 — معماری پرامپت سازمانی (۲۶ بخش)
- `docs/60-PROMPTS/10-prompt-index.md`: PRM-001 — نمایه پرامپت (۲۵ بخش, ۱۱۷ پرامپت draft)
- `docs/35-PROMPTS/10-enterprise-strategic-planning.md`: PRM-101 — برنامه‌ریزی استراتژیک
- `docs/35-PROMPTS/12-goal-decomposition.md`: PRM-102 — تجزیه اهداف
- `docs/35-PROMPTS/14-decision-framing.md`: PRM-103 — چارچوب تصمیمات
- `docs/35-PROMPTS/16-governance-compliance.md`: PRM-104 — انطباق حکمرانی
- `docs/35-PROMPTS/18-executive-response-generation.md`: PRM-105 — پاسخ اجرایی
- `docs/35-PROMPTS/20-content-production-instruction.md`: PRM-201 — تولید محتوا
- `docs/35-PROMPTS/22-content-review-validation.md`: PRM-202 — بازبینی محتوا
- `docs/35-PROMPTS/24-content-structuring-instruction.md`: PRM-203 — ساختاردهی محتوا
- `docs/35-PROMPTS/26-metadata-generation-instruction.md`: PRM-204 — تولید فراداده
- `docs/35-PROMPTS/28-accessibility-enhancement-instruction.md`: PRM-205 — دسترس‌پذیری
- `docs/35-PROMPTS/29-localization-translation-instruction.md`: PRM-206 — بومی‌سازی و ترجمه
- `docs/35-PROMPTS/31-platform-format-adaptation.md`: PRM-207 — تطبیق قالب پلتفرمی
- `docs/35-PROMPTS/33-content-quality-check.md`: PRM-208 — بررسی کیفیت محتوا
- `docs/35-PROMPTS/35-multi-platform-adaptation-chain.md`: PRM-209 — زنجیره تطبیق چندپلتفرمی
- `docs/35-PROMPTS/40-review-preparation.md`: PRM-210 — آماده‌سازی بازبینی
- `docs/35-PROMPTS/42-structural-validation.md`: PRM-211 — اعتبارسنجی ساختاری
- `docs/35-PROMPTS/44-terminology-validation.md`: PRM-212 — اعتبارسنجی اصطلاحات
- `docs/35-PROMPTS/46-consistency-validation.md`: PRM-213 — اعتبارسنجی سازگاری
- `docs/35-PROMPTS/48-publication-readiness-validation.md`: PRM-214 — اعتبارسنجی آمادگی انتشار
- `docs/35-PROMPTS/50-semantic-optimization.md`: PRM-220 — بهینه‌سازی معنایی
- `docs/35-PROMPTS/52-search-intent-alignment.md`: PRM-221 — هم‌راستاسازی با قصد جستجو
- `docs/35-PROMPTS/54-internal-linking-strategy.md`: PRM-222 — استراتژی پیوندهای داخلی
- `docs/35-PROMPTS/56-structured-metadata-enhancement.md`: PRM-223 — بهینه‌سازی فراداده ساختاریافته
- `docs/35-PROMPTS/58-discoverability-validation.md`: PRM-224 — اعتبارسنجی قابلیت کشف
- `docs/35-PROMPTS/60-media-planning-instruction.md`: PRM-230 — برنامه‌ریزی تولید دارایی رسانه
- `docs/35-PROMPTS/62-visual-composition-instruction.md`: PRM-231 — قواعد ترکیب بصری
- `docs/35-PROMPTS/64-brand-visual-compliance.md`: PRM-232 — انطباق بصری برند
- `docs/35-PROMPTS/66-accessibility-media-validation.md`: PRM-233 — اعتبارسنجی دسترس‌پذیری رسانه
- `docs/35-PROMPTS/68-media-production-readiness.md`: PRM-234 — آمادگی تولید رسانه
- `docs/35-PROMPTS/70-video-storyboard-planning.md`: PRM-240 — برنامه‌ریزی استوری‌بورد ویدئو
- `docs/35-PROMPTS/72-video-scene-composition.md`: PRM-241 — ترکیب صحنه ویدئو
- `docs/35-PROMPTS/74-audio-narration-guidance.md`: PRM-242 — راهنمای صدا و روایت
- `docs/35-PROMPTS/76-video-brand-compliance.md`: PRM-243 — انطباق برند ویدئو
- `docs/35-PROMPTS/78-video-publication-readiness.md`: PRM-244 — آمادگی انتشار ویدئو
- `docs/35-PROMPTS/30-publishing-instruction.md`: PRM-301 — انتشار و توزیع
- `docs/35-PROMPTS/80-publishing-package-assembly.md`: PRM-302 — مونتاژ بسته انتشار
- `docs/35-PROMPTS/82-platform-selection-strategy.md`: PRM-303 — استراتژی انتخاب پلتفرم
- `docs/35-PROMPTS/84-publication-scheduling.md`: PRM-304 — زمان‌بندی انتشار
- `docs/35-PROMPTS/86-platform-compliance-validation.md`: PRM-305 — اعتبارسنجی انطباق پلتفرمی
- `docs/35-PROMPTS/88-publication-execution-chain.md`: PRM-306 — زنجیره اجرای انتشار
- `docs/35-PROMPTS/90-publication-verification.md`: PRM-307 — تأیید انتشار
- `docs/35-PROMPTS/92-distribution-completion-validation.md`: PRM-308 — اعتبارسنجی تکمیل توزیع
- `docs/35-PROMPTS/100-comment-classification.md`: PRM-310 — طبقه‌بندی نظر
- `docs/35-PROMPTS/102-response-strategy-selection.md`: PRM-311 — انتخاب استراتژی پاسخ
- `docs/35-PROMPTS/104-response-draft-preparation.md`: PRM-312 — تهیه پیش‌نویس پاسخ
- `docs/35-PROMPTS/106-moderation-validation.md`: PRM-313 — اعتبارسنجی مدیتیشن
- `docs/35-PROMPTS/108-escalation-decision.md`: PRM-314 — تصمیم ارجاع
- `docs/35-PROMPTS/110-community-interaction-validation.md`: PRM-315 — اعتبارسنجی تعامل اجتماعی
- `docs/35-PROMPTS/112-sentiment-observation.md`: PRM-316 — مشاهده احساسات
- `docs/35-PROMPTS/114-conversation-continuity.md`: PRM-317 — تداوم مکالمه
- `docs/35-PROMPTS/116-community-incident-assessment.md`: PRM-318 — ارزیابی حادثه اجتماعی
- `docs/35-PROMPTS/118-community-handoff-validation.md`: PRM-319 — تحویل جامعه
- `docs/35-PROMPTS/120-performance-report-generation.md`: PRM-320 — تولید گزارش عملکرد
- `docs/35-PROMPTS/122-kpi-dashboard-construction.md`: PRM-321 — ساخت داشبورد KPI
- `docs/35-PROMPTS/124-trend-analysis-preparation.md`: PRM-322 — تحلیل روند
- `docs/35-PROMPTS/126-audience-insight-generation.md`: PRM-323 — بینش مخاطب
- `docs/35-PROMPTS/128-recommendation-package-assembly.md`: PRM-324 — بسته توصیه
- `docs/35-PROMPTS/130-analytics-validation.md`: PRM-325 — اعتبارسنجی تحلیلی
- `docs/35-PROMPTS/132-reporting-consistency-validation.md`: PRM-326 — سازگاری گزارش
- `docs/35-PROMPTS/134-executive-dashboard-validation.md`: PRM-327 — داشبورد اجرایی
- `docs/35-PROMPTS/136-analytics-quality-assessment.md`: PRM-328 — کیفیت تحلیلی
- `docs/35-PROMPTS/138-reporting-completion-validation.md`: PRM-329 — تکمیل گزارش
- `docs/35-PROMPTS/140-operational-event-classification.md`: PRM-330 — طبقه‌بندی رویداد عملیاتی
- `docs/35-PROMPTS/142-alert-prioritization-strategy.md`: PRM-331 — اولویت‌بندی هشدار
- `docs/35-PROMPTS/144-incident-correlation-analysis.md`: PRM-332 — تحلیل همبستگی رویداد
- `docs/35-PROMPTS/146-operational-health-assessment.md`: PRM-333 — ارزیابی سلامت عملیاتی
- `docs/35-PROMPTS/148-service-degradation-evaluation.md`: PRM-334 — ارزیابی تخریب سرویس
- `docs/35-PROMPTS/150-operational-risk-validation.md`: PRM-335 — اعتبارسنجی ریسک عملیاتی
- `docs/35-PROMPTS/152-monitoring-consistency-validation.md`: PRM-336 — سازگاری نظارت
- `docs/35-PROMPTS/154-operational-intelligence-summary.md`: PRM-337 — خلاصه هوش عملیاتی
- `docs/35-PROMPTS/156-monitoring-quality-assessment.md`: PRM-338 — کیفیت نظارت
- `docs/35-PROMPTS/158-monitoring-completion-validation.md`: PRM-339 — تکمیل نظارت
- `docs/35-PROMPTS/40-brand-voice-context.md`: PRM-401 — بافت صدای برند
- `docs/35-PROMPTS/42-content-taxonomy-context.md`: PRM-402 — بافت تاکسونومی
- `docs/35-PROMPTS/160-knowledge-retrieval-strategy.md`: PRM-403 — استراتژی بازیابی دانش
- `docs/35-PROMPTS/162-knowledge-source-selection.md`: PRM-404 — انتخاب منبع دانش
- `docs/35-PROMPTS/164-knowledge-extraction-instruction.md`: PRM-405 — استخراج دانش
- `docs/35-PROMPTS/166-knowledge-normalization-validation.md`: PRM-406 — نرمال‌سازی دانش
- `docs/35-PROMPTS/168-knowledge-quality-assessment.md`: PRM-407 — ارزیابی کیفیت دانش
- `docs/35-PROMPTS/170-knowledge-registration-validation.md`: PRM-408 — ثبت دانش
- `docs/35-PROMPTS/200-structured-knowledge-extraction.md`: PRM-410 — استخراج دانش ساختاریافته
- `docs/35-PROMPTS/202-unstructured-knowledge-extraction.md`: PRM-411 — استخراج دانش از متن آزاد
- `docs/35-PROMPTS/204-knowledge-entity-identification.md`: PRM-412 — شناسایی موجودیت
- `docs/35-PROMPTS/206-relationship-extraction.md`: PRM-413 — استخراج رابطه
- `docs/35-PROMPTS/208-knowledge-enrichment.md`: PRM-414 — غنی‌سازی دانش
- `docs/35-PROMPTS/210-knowledge-classification.md`: PRM-415 — طبقه‌بندی دانش
- `docs/35-PROMPTS/212-knowledge-deduplication-validation.md`: PRM-416 — حذف تکرار
- `docs/35-PROMPTS/214-knowledge-consistency-validation.md`: PRM-417 — سازگاری دانش
- `docs/35-PROMPTS/216-knowledge-integrity-assessment.md`: PRM-418 — یکپارچگی دانش
- `docs/35-PROMPTS/218-knowledge-extraction-completion-validation.md`: PRM-419 — اعتبارسنجی تکمیل استخراج
- `docs/35-PROMPTS/220-research-planning-strategy.md`: PRM-420 — استراتژی برنامه‌ریزی پژوهش
- `docs/35-PROMPTS/222-source-selection-strategy.md`: PRM-421 — استراتژی انتخاب منبع
- `docs/35-PROMPTS/224-evidence-collection-instruction.md`: PRM-422 — جمع‌آوری شواهد
- `docs/35-PROMPTS/226-evidence-evaluation.md`: PRM-423 — ارزیابی شواهد
- `docs/35-PROMPTS/228-cross-source-correlation.md`: PRM-424 — همبستگی منابع
- `docs/35-PROMPTS/230-insight-generation.md`: PRM-425 — تولید بینش
- `docs/35-PROMPTS/232-research-consistency-validation.md`: PRM-426 — سازگاری پژوهش
- `docs/35-PROMPTS/234-research-quality-assessment.md`: PRM-427 — کیفیت پژوهش
- `docs/35-PROMPTS/236-research-report-assembly.md`: PRM-428 — مونتاژ گزارش پژوهش
- `docs/35-PROMPTS/238-research-completion-validation.md`: PRM-429 — تکمیل پژوهش
- `docs/35-PROMPTS/250-lessons-learned-capture.md`: PRM-430 — ثبت درس‌آموخته‌ها
- `docs/35-PROMPTS/252-improvement-opportunity-identification.md`: PRM-431 — شناسایی فرصت بهبود
- `docs/35-PROMPTS/254-root-cause-analysis-preparation.md`: PRM-432 — تحلیل علت ریشه‌ای
- `docs/35-PROMPTS/256-organizational-learning-synthesis.md`: PRM-433 — ترکیب یادگیری سازمانی
- `docs/35-PROMPTS/258-knowledge-evolution-planning.md`: PRM-434 — برنامه‌ریزی تکامل دانش
- `docs/35-PROMPTS/260-optimization-recommendation-assembly.md`: PRM-435 — مونتاژ توصیه بهینه‌سازی
- `docs/35-PROMPTS/262-learning-consistency-validation.md`: PRM-436 — اعتبارسنجی سازگاری یادگیری
- `docs/35-PROMPTS/264-organizational-learning-assessment.md`: PRM-437 — ارزیابی یادگیری سازمانی
- `docs/35-PROMPTS/266-improvement-package-assembly.md`: PRM-438 — مونتاژ بسته بهبود
- `docs/35-PROMPTS/268-learning-completion-validation.md`: PRM-439 — اعتبارسنجی تکمیل یادگیری
- `docs/35-PROMPTS/90-orchestrator-system-definition.md`: PRM-901 — تعریف هماهنگ‌ساز
- `docs/35-PROMPTS/92-system-task-decomposition.md`: PRM-902 — تجزیه وظایف سیستم
- `docs/35-PROMPTS/93-agent-capability-matching.md`: PRM-903 — تطبیق قابلیت عامل
- `docs/35-PROMPTS/94-execution-routing-strategy.md`: PRM-904 — استراتژی مسیریابی اجرا
- `docs/35-PROMPTS/95-execution-recovery-strategy.md`: PRM-905 — استراتژی بازیابی اجرا
- `docs/35-PROMPTS/96-cross-agent-consistency-validation.md`: PRM-906 — اعتبارسنجی سازگاری بین عاملی
- `docs/35-PROMPTS/97-enterprise-orchestration-completion-validation.md`: PRM-907 — اعتبارسنجی تکمیل هماهنگ‌سازی
- `docs/15-DEPLOY/00-deployment-strategy.md`: DEPLOY-001 — استراتژی استقرار سازمانی (۱۸ بخش)
- `docs/50-AUTOMATION/00-enterprise-automation-architecture.md`: AUT-000 — معماری مادر خودکارسازی
- `docs/40-AI-AGENTS/00-enterprise-ai-agent-architecture.md`: AI-000 — معماری مادر عامل‌های هوشمند (SSOT همه Agentها)
- `docs/30-AUTOMATION/00-automation-index.md`: AUT-001 — نمایه خودکارسازی (۵۹ Workflow)
- `docs/40-AI-AGENTS/10-content-strategy-agent.md` تا `docs/40-AI-AGENTS/99-enterprise-ai-orchestrator.md`: AI-001 تا AI-014 (۱۴ Agent)
- `docs/20-PLATFORMS/`: ۷ کتابچه پلتفرم (PLAT-001 تا PLAT-007)
- `docs/22-BRAND/20-brand-voice.md`: BRD-002 v2.0.0 — معماری صدای برند
- `docs/70-KNOWLEDGE/00-enterprise-knowledge-architecture.md`: KNW-000 — معماری دانش سازمانی
- `docs/70-KNOWLEDGE/10-knowledge-index.md`: KNW-001 — نمایه دانش سازمانی
- `docs/70-KNOWLEDGE/100-business-knowledge-foundation.md`: KNW-101 — پایه دانش کسب‌وکار سازمانی
- `docs/70-KNOWLEDGE/102-business-rules-policies.md`: KNW-102 — قوانین و سیاست‌های کسب‌وکار سازمانی
- `docs/70-KNOWLEDGE/104-business-process-architecture.md`: KNW-103 — معماری فرآیندهای کسب‌وکار سازمانی
- `docs/70-KNOWLEDGE/105-business-decision-architecture.md`: KNW-104 — معماری تصمیم‌گیری کسب‌وکار سازمانی
- `docs/70-KNOWLEDGE/300-platform-knowledge-foundation.md`: KNW-301 — پایه دانش پلتفرم سازمانی
- `docs/70-KNOWLEDGE/302-platform-capability-service-architecture.md`: KNW-302 — معماری قابلیت‌ها و سرویس‌های پلتفرم
- `docs/70-KNOWLEDGE/304-platform-relationship-architecture.md`: KNW-303 — معماری روابط پلتفرم
- `docs/70-KNOWLEDGE/306-platform-governance-architecture.md`: KNW-304 — معماری حکمرانی پلتفرم
- `docs/70-KNOWLEDGE/308-platform-lifecycle-architecture.md`: KNW-305 — معماری چرخه حیات پلتفرم
- `docs/70-KNOWLEDGE/310-platform-quality-architecture.md`: KNW-306 — معماری کیفیت پلتفرم (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/70-KNOWLEDGE/312-platform-evolution-architecture.md`: KNW-307 — معماری تکامل پلتفرم (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/70-KNOWLEDGE/314-platform-security-architecture.md`: KNW-308 — معماری امنیت پلتفرم (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/70-KNOWLEDGE/400-operations-knowledge-foundation.md`: KNW-401 — پایه دانش عملیات سازمانی (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/70-KNOWLEDGE/402-operations-governance-architecture.md`: KNW-402 — معماری حکمرانی عملیات سازمانی (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/70-KNOWLEDGE/404-operations-lifecycle-architecture.md`: KNW-403 — معماری چرخه حیات عملیات سازمانی (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/70-KNOWLEDGE/406-operations-reporting-knowledge.md`: KNW-404 — دانش گزارش‌دهی عملیاتی (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/70-KNOWLEDGE/408-operations-continuity-knowledge.md`: KNW-405 — دانش تداوم عملیات (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/70-KNOWLEDGE/500-ai-knowledge-foundation.md`: KNW-501 — پایه دانش هوش مصنوعی سازمانی (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/70-KNOWLEDGE/502-ai-reasoning-architecture.md`: KNW-502 — معماری استدلال هوش مصنوعی سازمانی (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/70-KNOWLEDGE/504-ai-memory-architecture.md`: KNW-503 — معماری حافظه هوش مصنوعی سازمانی (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/70-KNOWLEDGE/506-ai-tool-architecture.md`: KNW-504 — معماری ابزار هوش مصنوعی سازمانی (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/70-KNOWLEDGE/508-ai-planning-architecture.md`: KNW-505 — معماری برنامه‌ریزی هوش مصنوعی سازمانی (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/70-KNOWLEDGE/510-ai-decision-architecture.md`: KNW-506 — معماری تصمیم‌گیری هوش مصنوعی سازمانی (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/70-KNOWLEDGE/512-ai-collaboration-architecture.md`: KNW-507 — معماری همکاری هوش مصنوعی سازمانی (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/70-KNOWLEDGE/514-ai-learning-architecture.md`: KNW-508 — معماری یادگیری هوش مصنوعی سازمانی (۳۰ بخش, ۶ JSON Block, ۳ Schema)
- `docs/70-KNOWLEDGE/516-ai-orchestration-architecture.md`: KNW-509 — معماری هماهنگ‌سازی هوش مصنوعی سازمانی (۳۰ بخش, ۶ JSON Block, ۳ Schema, ۱۵ مدل معماری)
- `docs/70-KNOWLEDGE/518-ai-meta-architecture.md`: KNW-510 — معماری کلان هوش مصنوعی سازمانی (۳۰ بخش, ۶ JSON Block, ۳ Schema, **SSOT خانواده KNW-AI**)
- `docs/70-KNOWLEDGE/700-brand-knowledge-foundation.md`: KNW-701 — پایه دانش برند سازمانی (۳۰ بخش, ۶ JSON Block, ۳ Schema, **SSOT خانواده KNW-BRD**)
- `docs/70-KNOWLEDGE/800-reference-knowledge-foundation.md`: KNW-801 — پایه دانش مرجع سازمانی (۳۰ بخش, ۶ JSON Block, ۳ Schema, **SSOT خانواده KNW-REF**)
- `docs/80-COMMUNICATION/000-enterprise-content-architecture.md`: COM-001 — معماری محتوای سازمانی (۳۰ بخش, ۶ JSON Block, ۳ Schema, **SSOT معماری محتوای سازمانی**)
- `docs/80-COMMUNICATION/002-enterprise-brand-voice-architecture.md`: COM-002 — معماری صدای برند (۳۰ بخش, ۶ JSON Block, ۳ Schema, **SSOT معماری صدای برند**)
- `docs/80-COMMUNICATION/004-enterprise-editorial-architecture.md`: COM-003 — معماری تحریریه سازمانی (۳۰ بخش, ۶ JSON Block, ۳ Schema, **SSOT معماری تحریریه سازمانی**)
- `docs/80-COMMUNICATION/006-enterprise-social-media-architecture.md`: COM-004 — معماری شبکه‌های اجتماعی سازمانی (۳۰ بخش, ۶ JSON Block, ۳ Schema, **SSOT معماری شبکه‌های اجتماعی سازمانی**)
- `docs/80-COMMUNICATION/008-enterprise-knowledge-publishing-architecture.md`: COM-005 — معماری انتشار دانش سازمانی (۳۰ بخش, ۶ JSON Block, ۳ Schema, **SSOT معماری انتشار دانش سازمانی**)
- `docs/70-KNOWLEDGE/200-enterprise-knowledge-compiler-architecture.md`: KNW-201 — معماری کامپایلر دانش (۳۲ بخش, ۶ JSON Block, ۳ Schema, **SSOT معماری کامپایلر دانش KNW-ENG**)
- `docs/70-KNOWLEDGE/202-enterprise-knowledge-graph-architecture.md`: KNW-202 — معماری گراف دانش (۳۱ بخش, ۶ JSON Block, ۳ Schema, **SSOT معماری گراف دانش**)
- `docs/70-KNOWLEDGE/204-enterprise-semantic-engine-architecture.md`: KNW-203 — معماری موتور معنایی (۳۰ بخش, ۶ JSON Block, ۳ Schema, **SSOT معماری موتور معنایی**)
- `docs/70-KNOWLEDGE/206-enterprise-knowledge-query-architecture.md`: KNW-204 — معماری پرس‌وجوی دانش (۳۰ بخش, ۶ JSON Block, ۳ Schema, **SSOT معماری پرس‌وجوی دانش**)
- `docs/70-KNOWLEDGE/208-enterprise-knowledge-federation-architecture.md`: KNW-205 — معماری فدراسیون دانش (۳۰ بخش, ۶ JSON Block, ۳ Schema, **SSOT معماری فدراسیون دانش**)
- `docs/70-KNOWLEDGE/210-enterprise-knowledge-resolution-architecture.md`: KNW-206 — معماری تفکیک دانش (۳۰ بخش, ۶ JSON Block, ۳ Schema, **SSOT معماری تفکیک دانش**)
- `docs/90-RUNTIME/000-enterprise-runtime-foundation.md`: RT-001 — بنیاد زمان اجرا (~۹۵۰ خط, ۳۰ بخش, ۶ JSON Block, ۳ Schema, **SSOT بنیاد زمان اجرای سازمانی SMOS**)
- `docs/90-RUNTIME/002-enterprise-runtime-execution-architecture.md`: RT-002 — معماری اجرای زمان اجرا (~۹۸۰+ خط, ۳۰ بخش, ۶ JSON Block, ۳ Schema, **SSOT معماری اجرای زمان اجرای سازمانی SMOS**)
- `docs/90-RUNTIME/004-enterprise-runtime-context-architecture.md`: RT-003 — معماری بافت زمان اجرا (~۹۹۹+ خط, ۳۰ بخش, ۶ JSON Block, ۳ Schema, **SSOT معماری بافت زمان اجرای سازمانی SMOS**)
- `docs/90-RUNTIME/006-enterprise-runtime-session-architecture.md`: RT-004 — معماری نشست زمان اجرا (~۱۰۰۰+ خط, ۳۰ بخش, ۶ JSON Block, ۳ Schema, **SSOT معماری نشست زمان اجرای سازمانی SMOS**)
- `docs/90-RUNTIME/008-enterprise-runtime-state-architecture.md`: RT-005 — معماری حالت زمان اجرا (~۱۰۲۱+ خط, ۳۰ بخش, ۶ JSON Block, ۳ Schema, **SSOT معماری حالت زمان اجرای سازمانی SMOS**)
- `docs/90-RUNTIME/010-enterprise-runtime-coordination-architecture.md`: RT-006 — معماری هماهنگی زمان اجرا (~۱۰۰۵+ خط, ۳۰ بخش, ۶ JSON Block, ۳ Schema, **SSOT معماری هماهنگی زمان اجرای سازمانی SMOS**)
- `docs/90-RUNTIME/012-enterprise-runtime-monitoring-architecture.md`: RT-007 — معماری نظارت زمان اجرا (~۱۰۰۰+ خط, ۳۰ بخش, ۶ JSON Block, ۳ Schema, **SSOT معماری نظارت زمان اجرای سازمانی SMOS**)
- `docs/90-AUDIT/enterprise-architecture-baseline-audit.md`: AUDIT-P10-S01 — گزارش حسابرسی جامع معماری SMOS
- `docs/95-CONTENT-OPERATIONS/000-content-operations-foundation.md`: OPS-000 — بنیاد عملیات محتوا (۱۹ بخش, نقش‌ها, اصول, چرخه حیات)
- `docs/95-CONTENT-OPERATIONS/002-social-media-operations-playbook.md`: OPS-002 — راهنمای عملیات شبکه‌های اجتماعی (۲۰ بخش, ۸ پلتفرم, چک‌لیست‌ها, تصمیم‌نامه‌ها, بحران)
- `docs/95-CONTENT-OPERATIONS/004-editorial-calendar-playbook.md`: OPS-004 — راهنمای تقویم تحریریه (۲۰ بخش, ساختار تقویم, مهلت‌ها, ظرفیت, کمپین‌ها)
- `docs/95-CONTENT-OPERATIONS/006-content-production-playbook.md`: OPS-006 — راهنمای تولید محتوا (۲۰ بخش, brief→final, استانداردها, گیت‌ها, دارایی‌ها)
- `docs/95-CONTENT-OPERATIONS/008-visual-design-system-playbook.md`: OPS-008 — راهنمای سیستم طراحی بصری (۲۵ بخش)
- `docs/95-CONTENT-OPERATIONS/010-brand-voice-playbook.md`: OPS-010 — راهنمای صدای برند (۲۳ بخش)
- `docs/95-CONTENT-OPERATIONS/012-community-management-playbook.md`: OPS-012 — راهنمای مدیریت جامعه (۲۴ بخش)
- `docs/95-CONTENT-OPERATIONS/014-content-quality-checklist.md`: OPS-014 — چک‌لیست کیفیت محتوا (۲۹ بخش, ۶ گیت کیفیت)
- `docs/95-CONTENT-OPERATIONS/016-publishing-checklist.md`: OPS-016 — چک‌لیست انتشار (۲۸ بخش, ۶ پلتفرم)
- `docs/95-CONTENT-OPERATIONS/018-kpi-review-playbook.md`: OPS-018 — راهنمای بازبینی KPI (۲۹ بخش, ۳ سطح داشبورد)
- `AGENTS.md`: راهنمای جلسات OpenCode

## خط فرمان (موقت)

در حال حاضر هیچ دستور build/test/lint وجود ندارد. پس از افزودن کد، دستورات دقیق در این بخش ثبت خواهند شد.
