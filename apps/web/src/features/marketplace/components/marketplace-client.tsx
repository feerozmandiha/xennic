'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ShoppingCart, Package, Building2, Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { cn } from '@/lib/utils';
import { ProductList } from './product-list';
import { OrderList } from './order-list';
import { VendorManager } from './vendor-manager';

const TABS = [
  { key: 'products', icon: Package, labelKey: 'products' },
  { key: 'orders', icon: ShoppingCart, labelKey: 'orders' },
  { key: 'vendors', icon: Building2, labelKey: 'vendors' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export function MarketplaceClient() {
  const t = useTranslations('marketplace');
  const [activeTab, setActiveTab] = useState<TabKey>('products');

  return (
    <div>
      <PageHeader
        title={t('title')}
        description={t('description')}
      />

      <div className="flex items-center gap-1 border-b border-[hsl(var(--border))] mb-6">
        {TABS.map(({ key, icon: Icon, labelKey }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === key
                ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
                : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]',
            )}
          >
            <Icon className="h-4 w-4" />
            {t(labelKey)}
          </button>
        ))}
      </div>

      {activeTab === 'products' && <ProductList />}
      {activeTab === 'orders' && <OrderList />}
      {activeTab === 'vendors' && <VendorManager />}
    </div>
  );
}
