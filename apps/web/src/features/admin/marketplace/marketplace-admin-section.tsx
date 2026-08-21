'use client';

import { useState } from 'react';
import { Package, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductsPanel } from './products-panel';
import { VendorsPanel } from './vendors-panel';

const TABS = [
  { key: 'products', label: 'محصولات', icon: Package },
  { key: 'vendors', label: 'فروشندگان', icon: Store },
] as const;

type Tab = (typeof TABS)[number]['key'];

/** بخش «فروشگاه (بازارگاه)» پنل ادمین — مدیریت محصولات و فروشندگان. */
export function MarketplaceAdminSection() {
  const [tab, setTab] = useState<Tab>('products');

  return (
    <div className="space-y-4">
      <p className="text-xs text-[hsl(var(--muted-foreground))]">
        مدیریت کاتالوگ بازارگاه: افزودن، ویرایش و حذف محصولات به همراه مشخصات فنی و ترجمهٔ
        فارسی/انگلیسی، و مدیریت فروشندگان.
      </p>

      <div className="flex gap-1.5 border-b border-[hsl(var(--border))]">
        {TABS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={cn(
                '-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm transition-all',
                tab === item.key
                  ? 'border-[hsl(var(--primary))] font-medium text-[hsl(var(--primary))]'
                  : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === 'products' ? <ProductsPanel /> : <VendorsPanel />}
    </div>
  );
}
