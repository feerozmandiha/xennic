# راهنمای کامپوننت‌ها — Component Guide

**نسخه**: ۱.۰.۰ | **وضعیت**: Approved | **آخرین بروزرسانی**: خرداد ۱۴۰۵

---

## Purpose

راهنمای جامع کامپوننت‌های فرانت‌اند Xennic و نحوه استفاده از آنها.

---

## Scope

تمامی کامپوننت‌های UI, Layout, Feature.

---

## UI Components

| کامپوننت | Props | توضیح |
|----------|-------|--------|
| **Button** | variant, size, isLoading | دکمه با حالت‌های مختلف |
| **Badge** | variant, children | برچسب وضعیت |
| **Card** | title, description, children | کارت نمایش محتوا |
| **Input** | label, error, placeholder | فیلد ورودی |
| **Dialog** | open, onClose, title | مودال |
| **Skeleton** | width, height | placeholder لودینگ |
| **Toast** | type, message, duration | اعلان موقت |
| **Separator** | orientation (horizontal/vertical) | خط جداکننده |
| **PageHeader** | title, description, actions | هدر صفحات |

### Usage Example
```tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function WelcomeCard() {
  return (
    <Card title="خوش آمدید" description="به Xennic خوش آمدید">
      <Button variant="primary" size="lg" onClick={handleStart}>
        شروع کنید
      </Button>
    </Card>
  );
}
```

---

## Layout Components

| کامپوننت | توضیح |
|----------|--------|
| **Sidebar** | نوار کناری با لینک‌های ناوبری |
| **Topbar** | نوار بالا با جستجو، اعلان‌ها، پروفایل |
| **LanguageSwitcher** | تغییر زبان فارسی/انگلیسی |
| **ThemeToggle** | تغییر تم dark/light |
| **AuthGuard** | محافظت از صفحات نیازمند احراز هویت |

---

## Feature Components

| Feature | کامپوننت اصلی | توضیح |
|---------|---------------|--------|
| **Auth** | `LoginForm`, `RegisterForm` | فرم‌های احراز هویت |
| **Engineering** | `CalculatorForm`, `PdfReport` | فرم محاسبه و گزارش PDF |
| **AI** | `AiChatClient` | رابط چت با AI |
| **Vision** | `VisionUploadClient` | آپلود و OCR تصاویر |
| **Knowledge** | `KnowledgeEditor`, `TaxonomySelect` | ویرایشگر محتوای دانش |
| **Marketplace** | `ProductList`, `OrderList` | لیست محصولات و سفارش‌ها |
| **Workspace** | `WorkspaceSelector`, `WorkspaceGate` | مدیریت workspace |

---

## Component Guidelines

### 1. Server Components First
```tsx
// ✅ Server Component (default)
async function KnowledgePage() {
  const articles = await fetchArticles();
  return <ArticleList articles={articles} />;
}

// ✅ Client Component (when needed)
"use client";
function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### 2. Composition over Configuration
```tsx
// ✅ Good: Composition
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Content</p>
  </CardContent>
</Card>

// ❌ Bad: Too many props
<Card title="Title" content="Content" variant="elevated" showHeader={true} />
```

### 3. Colocation
```
feature/engineering/
├── components/
│   ├── calculator-form.tsx          # Related component
│   ├── calculator-form.test.tsx     # Related test
│   ├── calculator-form.stories.tsx  # Related story
│   └── charts/
│       ├── cable-chart.tsx
│       └── harmonic-chart.tsx
```

---

## Related Documents

| سند | مسیر |
|-----|------|
| UI Architecture | `frontend/UI_ARCHITECTURE.md` |
| State Management | `frontend/STATE_MANAGEMENT.md` |
| Features Catalog | `frontend/FEATURES_CATALOG.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | خرداد ۱۴۰۵ | انتشار اولیه |
