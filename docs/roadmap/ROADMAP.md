# Roadmap — نقشه راه توسعه

**آخرین بروزرسانی**: خرداد ۱۴۰۵

---

## اولویت‌بندی فعلی

| اولویت | ویژگی | وضعیت |
|--------|--------|--------|
| ۱ | رفع timeout فایل‌های PDF | 🔄 در حال توسعه |
| ۲ | بهبود استخراج اطلاعات (نام کارخانه، مدل) | 🔄 در حال توسعه |
| ۳ | کش EasyOCR در build Docker | 📋 برنامه‌ریزی |
| ۴ | API Gateway واقعی | 📋 برنامه‌ریزی |
| ۵ | سیستم دانش (Qdrant + RAG) | 📋 برنامه‌ریزی |
| ۶ | تست و مستندسازی | 🔄 در حال توسعه |

---

## فازبندی

### فاز ۱ — MVP (تکمیل شده)
- معماری Monorepo ✅
- NestJS API + Prisma ✅
- Next.js Frontend ✅
- Vision Service (Tesseract OCR) ✅
- Engineering Service (موتور-ترانس) ✅
- AI Service با LLM ✅
- احراز هویت ✅
- Multi-tenant ✅

### فاز ۲ — بهبود و پایداری (Q2-Q3 2026)
- EasyOCR با مدل‌های کش شده
- بهبود OCR برای تصاویر واقعی
- افزایش timeout PDF
- پردازش async
- Metrics و monitoring
- تست‌های یکپارچه‌سازی

### فاز ۳ — سیستم دانش (Q3-Q4 2026)
- پایگاه دانش با Qdrant
- RAG Pipeline کامل
- Indexing خودکار اسناد
- جستجوی برداری پیشرفته

### فاز ۴ — بازارگاه و اشتراک (Q1 2027)
- بازارگاه محتوای مهندسی
- سیستم اشتراک و صورتحساب
- API عمومی

### فاز ۵ — رشد (2027)
- Mobile App
- Enterprise SSO
- Real-time Processing
- AR Mode

> برای نقشه راه جامع و جزئیات کامل milestones به `XENNIC_MASTER_ROADMAP_v1.md` مراجعه کنید.
