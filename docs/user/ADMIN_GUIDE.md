# راهنمای مدیر — Admin Guide

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **آخرین بروزرسانی**: خرداد ۱۴۰۵

---

## Purpose

راهنمای مدیران سیستم پلتفرم Xennic.

---

## Scope

User management, billing, workspace configuration.

---

## Admin Console

```mermaid
graph TB
    subgraph "Admin Panel"
        USERS["User Management"]
        BILLING["Billing & Plans"]
        WORKSPACES["Workspace Management"]
        AUDIT["Audit Logs"]
        SETTINGS["System Settings"]
    end
    
    USERS --> INVITE["Invite Users"]
    USERS --> ROLES["Role Assignment"]
    USERS --> BLOCK["Block/Remove"]
    
    BILLING --> PLANS["Plan Management"]
    BILLING --> INVOICES["Invoices"]
    BILLING --> USAGE["Usage Reports"]
    
    WORKSPACES --> CREATE["Create Workspace"]
    WORKSPACES --> QUOTA["Quota Management"]
    WORKSPACES --> DELETE["Delete Workspace"]
```

---

## Admin Tasks

| وظیفه | مسیر | توضیح |
|-------|------|-------|
| مدیریت کاربران | Admin → Users | افزودن، حذف، تغییر نقش |
| مدیریت اشتراک | Admin → Billing | تغییر پلن، مشاهده صورتحساب |
| تنظیمات سیستم | Admin → Settings | پیکربندی global |
| لاگ‌ها | Admin → Audit | مشاهده فعالیت کاربران |
| گزارش‌گیری | Admin → Reports | گزارش مصرف و عملکرد |

---

## Related Documents

| سند | مسیر |
|-----|------|
| User Guide | `user/USER_GUIDE.md` |
| Subscription & Billing | `services/subscription-billing.md` |
| Security Model | `security/SECURITY_MODEL.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
