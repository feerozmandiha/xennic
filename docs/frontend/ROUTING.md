# مسیریابی — Routing

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **آخرین بروزرسانی**: خرداد ۱۴۰۵

---

## Purpose

استراتژی مسیریابی (Routing) در فرانت‌اند Xennic را توصیف می‌کند.

---

## Scope

Next.js App Router, Route Groups, Middleware, i18n Routing.

---

## Route Structure

```
app/
├── [locale]/                    # Dynamic locale (fa/en)
│   ├── (landing)/               # Route Group: Landing
│   │   └── page.tsx             #   /
│   ├── (public)/                # Route Group: Public
│   │   ├── about/page.tsx       #   /about
│   │   ├── contact/page.tsx     #   /contact
│   │   └── knowledge/[id]/      #   /knowledge/123
│   ├── (auth)/                  # Route Group: Auth
│   │   ├── login/page.tsx       #   /login
│   │   ├── register/page.tsx    #   /register
│   │   └── forgot-password/     #   /forgot-password
│   ├── (dashboard)/             # Route Group: Protected
│   │   ├── dashboard/           #   /dashboard
│   │   ├── engineering/         #   /engineering
│   │   ├── ai/                  #   /ai
│   │   ├── vision/              #   /vision
│   │   ├── projects/            #   /projects
│   │   ├── knowledge-manage/    #   /knowledge-manage
│   │   ├── marketplace/         #   /marketplace
│   │   ├── storage/             #   /storage
│   │   ├── billing/             #   /billing
│   │   ├── settings/            #   /settings
│   │   └── workspace/           #   /workspace
│   └── (admin)/                 # Route Group: Admin
│       └── admin/               #   /admin
├── api/                          # API Routes
└── layout.tsx                    # Root Layout
```

---

## Route Groups

| Group | مسیرها | Layout | محافظت |
|-------|--------|--------|--------|
| `(landing)` | `/`, landing sections | Landing Layout | عمومی |
| `(public)` | about, contact, knowledge | Public Layout | عمومی |
| `(auth)` | login, register, forgot-password | Auth Layout | مهمانان |
| `(dashboard)` | dashboard, engineering, ai, ... | Dashboard Layout | احراز هویت |
| `(admin)` | admin | Admin Layout | ادمین |

---

## Middleware

```typescript
// middleware.ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['fa', 'en'],
  defaultLocale: 'fa',
  localePrefix: 'as-needed',
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
```

---

## Auth Guard

```typescript
// components/layout/auth-guard.tsx
"use client";
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'next/navigation';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const router = useRouter();
  
  if (!user) {
    router.push('/login');
    return null;
  }
  
  return <>{children}</>;
}
```

---

## API Proxy

```javascript
// next.config.js
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'http://localhost:3000/api/:path*',
    },
  ];
}
```

---

## Related Documents

| سند | مسیر |
|-----|------|
| UI Architecture | `frontend/UI_ARCHITECTURE.md` |
| State Management | `frontend/STATE_MANAGEMENT.md` |
| Component Guide | `frontend/COMPONENT_GUIDE.md` |
| Features Catalog | `frontend/FEATURES_CATALOG.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
