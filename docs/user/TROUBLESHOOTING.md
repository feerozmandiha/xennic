# عیب‌یابی — Troubleshooting

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **آخرین بروزرسانی**: خرداد ۱۴۰۵

---

## Purpose

راهنمای عیب‌یابی مشکلات رایج پلتفرم Xennic.

---

## Scope

Common issues, solutions, support.

---

## Common Issues

### Login Issues

| مشکل | علت | راه‌حل |
|------|------|--------|
| رمز عبور اشتباه | Caps Lock / language | بررسی keyboard layout |
| حساب مسدود | ۵ تلاش ناموفق | ۱۵ دقیقه صبر کنید |
| ایمیل تأیید نشد | ایمیل در spam | بررسی پوشه spam |

### Calculation Issues

| مشکل | علت | راه‌حل |
|------|------|--------|
| خطای validation | ورودی خارج از محدوده | بررسی مقادیر ورودی |
| نتیجه غیرمنتظره | واحد اشتباه | بررسی واحدها (kV, kA, mm²) |
| خطای استاندارد | استاندارد پشتیبانی نمی‌شود | انتخاب استاندارد دیگر |

### Performance Issues

| مشکل | راه‌حل |
|------|--------|
| صفحه بارگذاری نمی‌شود | رفرش + کش مرورگر |
| محاسبه کند | کاهش تعداد هم‌زمان |
| آپلود فایل سنگین | کاهش حجم فایل (< 50MB) |

## Diagnostic Commands

```bash
# Check service health
curl https://api.xennic.com/api/v1/health

# Check database
pg_isready -h localhost

# View logs
docker compose logs api --tail=100
```

---

## Related Documents

| سند | مسیر |
|-----|------|
| FAQ | `user/FAQ.md` |
| User Guide | `user/USER_GUIDE.md` |
| Monitoring | `devops/MONITORING.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
