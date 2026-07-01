# مشخصات وب — Web Specification

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **مالک**: Frontend Team | **آخرین بروزرسانی**: خرداد ۱۴۰۵ | **بازبینی بعدی**: شهریور ۱۴۰۵

---

## Purpose

مشخصات رسمی Web Application پلتفرم Xennic.

---

## Scope

Next.js app, routing, state management, component library.

---

## Contract

### Tech Stack
| مؤلفه | تکنولوژی |
|-------|----------|
| Framework | Next.js 14 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State (Client) | Zustand |
| State (Server) | TanStack Query |
| i18n | next-intl |
| API Client | Axios |

### Pages (44 total)
| مسیر | گروه | توضیح |
|------|------|-------|
| / | Public | Landing |
| /auth/* | Auth | Login, Register, Forgot |
| /dashboard | App | Main dashboard |
| /projects/* | Projects | CRUD |
| /calculators/* | Calculators | 13 categories |
| /knowledge/* | Knowledge | Search |
| /documents/* | Documents | Upload, view |
| /team/* | Team | Management |
| /settings/* | Settings | Profile, workspace |
| /admin/* | Admin | System admin |

### Routing
| نوع | Route | Target |
|-----|-------|--------|
| Page | /app/* | Next.js page |
| API | /api/v1/* | NestJS (proxy rewrite) |
| Static | /_next/* | Next.js static |

---

## Related Documents

| سند | مسیر |
|-----|------|
| Frontend Architecture | `frontend/FRONTEND_ARCHITECTURE.md` |
| UI Architecture | `frontend/UI_ARCHITECTURE.md` |
| Routing | `frontend/ROUTING.md` |
| Features Catalog | `frontend/FEATURES_CATALOG.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
