# Frontend Architecture — معماری فرانت‌اند

**نسخه**: ۱.۰.۰ | **فریم‌ورک**: Next.js 14 | **پورت**: ۳۰۰۱

---

## تکنولوژی‌ها

| کتابخانه | کاربرد |
|----------|--------|
| Next.js 14 | فریم‌ورک (App Router) |
| React 18 | UI Library |
| Tailwind CSS 3 | استایل‌دهی |
| next-intl | بین‌المللی‌سازی |
| Zustand | State Management |
| React Query | Server State |

---

## API Proxy

```javascript
// next.config.js — تمام /api/* به NestJS هدایت می‌شود
async rewrites() {
  return [
    { source: '/api/:path*', destination: 'http://localhost:3000/api/:path*' },
  ];
}
```

Vision Service از طریق CORS مستقیم:
```typescript
const VISION_API_URL = process.env.NEXT_PUBLIC_VISION_API_URL;
// POST http://localhost:8003/api/v1/vision/upload
```

---

## بین‌المللی‌سازی

```typescript
import { useTranslations } from 'next-intl';
const t = useTranslations('vision');
```

- `messages/fa.json` — فارسی
- `messages/en.json` — انگلیسی

---

## مسیرهای اصلی

| مسیر | توضیح |
|------|-------|
| `/` | صفحه اصلی |
| `/fa/` | فارسی |
| `/en/` | انگلیسی |
| `/auth/login` | ورود |
| `/vision/nameplate` | خواندن پلاک |
| `/vision/bill` | خواندن قبض |
| `/engineering/motor` | تحلیل موتور |
| `/engineering/transformer` | تحلیل ترانسفورماتور |
