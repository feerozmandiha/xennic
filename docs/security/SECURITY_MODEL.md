# Security Model — مدل امنیتی فعلی

**نسخه**: ۱.۰.۰ | **وضعیت**: فعال

---

## لایه‌های امنیتی

### 1. Authentication
- JWT (access 15min + refresh 7d)
- bcrypt برای hash پسورد

### 2. Authorization
- Role-based (USER, ADMIN)
- Workspace isolation

### 3. API Security
- Input validation با class-validator
- whitelist + forbidNonWhitelisted
- CORS محدود شده
- Helmet headers

### 4. Data Security
- UUID به جای sequential IDs
- Soft delete
- Audit logging

### 5. Multi-tenant
- جداسازی با `workspace_id`
- تمام queryها دارای فیلتر workspace

---

## RBAC Roles

| نقش | دسترسی‌ها |
|-----|-----------|
| ADMIN | دسترسی کامل |
| USER | دسترسی به workspace خود |

---

## نکات امنیتی مهم

- CORS در Vision Service برای upload مستقیم از فرانت‌اند باز است
- JWT secret در environment variable
- Rate limiting روی endpoints حساس
- Environment variables برای secrets

> برای مدل امنیتی جامع و کامل (2FA, PBAC, API Keys, SSO) به `XENNIC_AUTHORIZATION_SPEC_v1.md` مراجعه کنید.
