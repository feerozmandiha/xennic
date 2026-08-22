# اپ موبایل زنیک (Mobile App) — پورت ۳۰۰۲

این ماژول یک اپ موبایل ساده و آماده است که بدون نیاز به عضویت یا ذخیره‌سازی سشن، اطلاعات را از تصویر یا PDF استخراج می‌کند و در جدول زیبا نمایش می‌دهد.

## ساختار

- `index.html` — رابط کاربری موبایل با دو تب: پلاک تجهیزات و قبض برق
- `style.css` — طراحی RTL با جدول حرفه‌ای
- `script.js` — منطق اتصال به vision-service (`port 8003`)
- `server.py` — سرور اختصاصی روی پورت ۳۰۰۲

## راه‌اندازی

```bash
# شروع سرور روی پورت ۳۰۰۲
bash apps/mobile/start.sh
# یا مستقیماً
python3 apps/mobile/server.py 3002
```

## اتصال به endpointهای پروژه زنیک

در `script.js` متغیر `VISION` به `localhost:8003` اشاره دارد. برای اتصال به API اصلی (`port 3000`):

```javascript
const VISION = 'http://localhost:3000';  // API اصلی زنیک
```

سپس endpointها را بر اساس `/api/v1/*` موجود در `apps/api` تنظیم کنید.
