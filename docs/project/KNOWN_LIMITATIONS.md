# محدودیت‌های شناخته شده — Known Limitations

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **آخرین بروزرسانی**: خرداد ۱۴۰۵

---

## Purpose

محدودیت‌های شناخته شده پلتفرم Xennic.

---

## AI & ML

| محدودیت | توضیح | راه‌حل برنامه‌ریزی شده |
|----------|--------|------------------------|
| OCR دقت | Tesseract برای خطوط فارسی ۸۵٪ دقت | مدل اختصاصی در v2 |
| Embedding | 384-dim, all-MiniLM-L6-v2 | ارتقا به مدل 768-dim |
| LLM | وابستگی به OpenAI/Anthropic | LLama 3 محلی در v2 |
| Vision | تشخیص diagram محدود | Custom model training |

## Infrastructure

| محدودیت | توضیح | راه‌حل |
|----------|--------|--------|
| Single region | DR محدود | Multi-region در v2 |
| Manual scaling | هنوز auto-scaling کامل | K8s migration |
| Backup | دستی | Automated در v2 |

## Platform

| محدودیت | توضیح |
|----------|--------|
| Mobile | PWA موجود، اپلیکیشن Native خیر |
| Offline | نیاز به اینترنت |
| Persian UI | تمام رابط فارسی، i18n برای انگلیسی در v2 |

---

## Related Documents

| سند | مسیر |
|-----|------|
| Technical Debt | `project/TECHNICAL_DEBT.md` |
| Roadmap | `project/ROADMAP.md` |
| TODO | `project/TODO.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
