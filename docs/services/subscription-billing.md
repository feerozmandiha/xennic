# Subscription & Billing — اشتراک و صورتحساب

**نسخه**: ۱.۰.۰ | **وضعیت**: فعال | **دامنه**: ماژول‌های `subscription`, `billing` (NestJS API)

---

## دیتابیس (۹ مدل Prisma)

| مدل | توضیح |
|------|--------|
| `plans` | پلن‌های قیمت‌گذاری |
| `subscriptions` | اشتراک workspaceها |
| `subscription_payments` | پرداخت‌های اشتراک |
| `usage_logs` | لاگ مصرف ویژگی‌ها |
| `feature_flags` | ویژگی‌های فعال |
| `invoices` | فاکتورها |
| `payments` | تراکنش‌های پرداخت |
| `transactions` | تراکنش‌های مالی |
| `payment_methods` | روش‌های پرداخت ذخیره‌شده |

---

## پلن‌ها (Plans)

| پلن | slug | ویژگی‌ها |
|-----|------|---------|
| مهمان | `guest` | دسترسی محدود، محاسبات آزمایشی |
| رایگان | `free` | ۳ پروژه، ۱۰۰ محاسبه/ماه، ۱ گیگابایت |
| حرفه‌ای | `pro` | نامحدود، ۱۰۰۰۰ AI/ماه، API |
| سازمانی | `enterprise` | نامحدود، SSO، مدل اختصاصی |

---

## Usage Tracking

```prisma
model usage_logs {
  workspace_id String
  feature      String
  amount       Int      @default(1)
  logged_at    DateTime @default(now())
}
```

**ویژگی‌های رهگیری**: `engineering.calculate`, `ai.chat`, `ai.document_analysis`, `storage.upload`, `api.requests`

---

## API Endpoints

| مسیر | متد | توضیح |
|------|------|-------|
| `/api/v1/subscription/plans` | GET | لیست پلن‌ها |
| `/api/v1/subscription/current` | GET | اشتراک جاری |
| `/api/v1/subscription/change` | POST | تغییر پلن |
| `/api/v1/subscription/cancel` | POST | لغو اشتراک |
| `/api/v1/billing/invoices` | GET | لیست فاکتورها |
| `/api/v1/billing/payment-methods` | GET | روش‌های پرداخت |
| `/api/v1/billing/usage` | GET | گزارش مصرف |
