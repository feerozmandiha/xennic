# Security Headers — هدرهای امنیتی HTTP

**نسخه**: ۱.۰.۰ | **وضعیت**: Draft | **آخرین بروزرسانی**: خرداد ۱۴۰۵

---

## Purpose

این سند تمام هدرهای امنیتی HTTP پیکربندی شده در پلتفرم Xennic — شامل `@fastify/helmet` در NestJS API و Nginx — و نحوه تأیید آنها را شرح می‌دهد.

---

## Scope

HTTP security headers, CORS, Nginx headers, verification.

---

## Helmet Configuration — پیکربندی @fastify/helmet

کد فعلی در `apps/api/src/main.ts:44-70`:

```typescript
await app.register((await import('@fastify/helmet')).default, {
  contentSecurityPolicy: isProduction ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  } : false,
  crossOriginResourcePolicy: { policy: 'same-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginEmbedderPolicy: { policy: 'require-corp' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xXssProtection: false,
  xFrameOptions: { action: 'deny' },
  xPermittedCrossDomainPolicies: { permittedPolicies: 'none' },
  hidePoweredBy: true,
  noSniff: true,
  ieNoOpen: true,
  dnsPrefetchControl: { allow: false },
  originAgentCluster: true,
});
```

---

## Complete Header Table — جدول کامل هدرها

| # | هدر | مقدار | منبع | توضیح |
|---|-----|-------|------|-------|
| 1 | **Content-Security-Policy** | `default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data: https:; connect-src 'self'; font-src 'self'; object-src 'none'; frame-ancestors 'none'; upgrade-insecure-requests` | Helmet (production only) | جلوگیری از XSS و data injection |
| 2 | **X-Frame-Options** | `DENY` | Helmet | جلوگیری از clickjacking |
| 3 | **X-Content-Type-Options** | `nosniff` | Helmet | جلوگیری از MIME sniffing |
| 4 | **Referrer-Policy** | `strict-origin-when-cross-origin` | Helmet | کنترل ارسال Referer header |
| 5 | **Permissions-Policy** | `camera=(), microphone=(), geolocation=()` | Helmet | محدود کردن APIهای مرورگر |
| 6 | **Cross-Origin-Resource-Policy** | `same-origin` | Helmet | جلوگیری از بارگذاری cross-origin |
| 7 | **Cross-Origin-Opener-Policy** | `same-origin` | Helmet | ایزوله کردن پنجره‌ها |
| 8 | **Cross-Origin-Embedder-Policy** | `require-corp` | Helmet | الزام CORP برای منابع embed |
| 9 | **X-XSS-Protection** | `0` | Helmet | **غیرفعال** — CSP این وظیفه را بر عهده دارد |
| 10 | **X-Permitted-Cross-Domain-Policies** | `none` | Helmet | جلوگیری از دسترسی Flash cross-domain |
| 11 | **Strict-Transport-Security** | — | **Nginx** (در Helmet فعال نیست) | HSTS اجباری |
| 12 | **Server** | (حذف شده) | Helmet `hidePoweredBy` | عدم افشای نوع سرور |
| 13 | **X-DNS-Prefetch-Control** | `off` | Helmet | غیرفعال کردن DNS prefetching |
| 14 | **Origin-Agent-Cluster** | `?1` | Helmet | ایزوله کردن origin در Chromium |

### جزئیات Content-Security-Policy

| دستور | مقدار | دلیل |
|-------|-------|------|
| `default-src` | `'self'` | همه منابع فقط از origin خود |
| `style-src` | `'self' 'unsafe-inline'` | **نیاز به unsafe-inline** برای Next.js/css-in-js |
| `script-src` | `'self'` | فقط اسکریپت‌های خودی |
| `img-src` | `'self' data: https:` | تصاویر از APIهای خارجی مجاز |
| `connect-src` | `'self'` | فقط API خودی |
| `font-src` | `'self'` | فونت‌های محلی |
| `object-src` | `'none'` | عدم پشتیبانی از پلاگین‌ها |
| `frame-ancestors` | `'none'` | عدم نمایش در iframe |
| `upgrade-insecure-requests` | (فعال) | ارتقاء خودکار به HTTPS |

> **توجه**: CSP فقط در `production` فعال است. در توسعه، برای جلوگیری از مشکلات hot-reload، غیرفعال است.

---

## Nginx Headers — هدرهای Nginx

Nginx نیز هدرهای امنیتی اضافی را در `infrastructure/nginx/nginx.conf` تنظیم می‌کند:

```nginx
# nginx.conf
server_tokens off;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
```

> **توجه**: Nginx از `X-Frame-Options: SAMEORIGIN` استفاده می‌کند در حالی که Helmet از `DENY`. Nginx همچنین `X-XSS-Protection: 1; mode=block` را تنظیم می‌کند در حالی که Helmet آن را `0` (disabled) کرده. در production توصیه می‌شود Nginx هدرهای امنیتی را حذف کرده و فقط Helmet مسئول آنها باشد.

---

## HSTS — Strict-Transport-Security

HSTS در Helmet تنظیم نشده و در Nginx نیز فعال نیست. برای production ضروری است.

```nginx
# باید به nginx.conf اضافه شود
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

| پارامتر | مقدار | توضیح |
|---------|-------|-------|
| `max-age` | 31536000 (۱ سال) | مدت اعتبار HSTS |
| `includeSubDomains` | فعال | اعمال به زیردامنه‌ها |
| `preload` | فعال | ثبت در لیست preload مرورگرها |

---

## CORS Configuration — پیکربندی CORS

```typescript
// apps/api/src/main.ts:115-128
app.enableCors({
  origin: corsOrigins,    // از CORS_ORIGINS env
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'Origin',
    'X-Request-ID',
    'X-Workspace-ID',
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
});
```

| پارامتر | مقدار | توضیح |
|---------|-------|-------|
| `origin` | Whitelist از `CORS_ORIGINS` | فقط origins مجاز |
| `methods` | محدود به ۶ متد | OPTIONS برای preflight |
| `allowedHeaders` | ۶ هدر مشخص | حداقل هدرهای ضروری |
| `credentials` | `true` | ارسال cookies + Authorization |
| `maxAge` | ۸۶۴۰۰ ثانیه (۲۴ ساعت) | کش کردن preflight |

**مقادیر پیش‌فرض CORS_ORIGINS**:
- Development: `http://localhost:3000,http://localhost:3001`
- Production: `https://app.xennic.com` (باید تنظیم شود)

---

## Verification Instructions — دستورالعمل تأیید

### بررسی با curl

```bash
# بررسی هدرهای امنیتی (از طریق Nginx)
curl -sI https://api.xennic.com/api/v1/health | grep -i -E '(x-frame|x-content|x-xss|content-security|referrer|strict-transport|server|permissions-policy|cross-origin)'

# بررسی هدرهای NestJS (مستقیم)
curl -sI http://localhost:3000/api/v1/health | grep -i -E '(x-frame|x-content|x-xss|content-security|referrer|server|permissions-policy)'

# بررسی CORS preflight
curl -s -D - -o /dev/null -X OPTIONS \
  -H "Origin: http://localhost:3001" \
  -H "Access-Control-Request-Method: GET" \
  http://localhost:3000/api/v1/health
```

### بررسی با ابزارهای آنلاین

| ابزار | آدرس | هدف |
|-------|------|------|
| **Security Headers** | `https://securityheaders.com` | نمره‌دهی A+ |
| **Mozilla Observatory** | `https://observatory.mozilla.org` | اسکن کامل امنیتی |
| **CSP Evaluator** | `https://csp-evaluator.withgoogle.com` | بررسی CSP |
| **SSL Labs** | `https://www.ssllabs.com/ssltest/` | بررسی TLS |

### خروجی مطلوب (Production)

```http
HTTP/2 200
content-security-policy: default-src 'self'; ...
x-frame-options: DENY
x-content-type-options: nosniff
referrer-policy: strict-origin-when-cross-origin
permissions-policy: camera=(), microphone=(), geolocation=()
cross-origin-resource-policy: same-origin
cross-origin-opener-policy: same-origin
cross-origin-embedder-policy: require-corp
x-xss-protection: 0
x-permitted-cross-domain-policies: none
strict-transport-security: max-age=31536000; includeSubDomains; preload
server: (hidden or "xennic")
```

---

## Related Documents

| سند | مسیر |
|-----|------|
| Security Architecture | `security/Architecture.md` |
| Security Model | `security/SECURITY_MODEL.md` |
| Production Hardening | `security/Production-Hardening.md` |
| Security Checklist | `security/Security-Checklist.md` |
| Nginx Configuration | `infrastructure/nginx/nginx.conf` |
| Nginx Default Config | `infrastructure/nginx/conf.d/default.conf` |
| Main.ts (Helmet Config) | `apps/api/src/main.ts:44-70` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه — Helmet + Nginx headers + CORS + Verification |
