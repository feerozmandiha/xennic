'use client';

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ShoppingCart, Trash2, Minus, Plus, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCartStore, useCartTotals } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';

export function StorefrontCart() {
  const t = useTranslations('marketplace');
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';
  const numberLocale = locale === 'fa' ? 'fa-IR' : 'en-US';

  const { items, count, total } = useCartTotals();
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const goToCheckout = () => {
    if (isAuthenticated) {
      router.push(`/${locale}/marketplace/checkout`);
    } else {
      router.push(`/${locale}/login?redirectTo=${encodeURIComponent('/marketplace/checkout')}`);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ShoppingCart className="mb-4 h-12 w-12 text-[hsl(var(--muted-foreground))] opacity-30" />
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{t('emptyCart')}</p>
        <Button asChild variant="outline" className="mt-6">
          <Link href={`/${locale}/marketplace`}>{t('continueShopping')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-3 lg:col-span-2">
        {items.map((item) => (
          <Card key={item.productId}>
            <CardContent className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{item.sku}</p>
                <p className="mt-1 text-sm font-bold" dir="ltr">
                  {Number(item.price).toLocaleString(numberLocale)} {item.currency}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setQuantity(item.productId, item.quantity - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-[var(--radius)] border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))]"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                <button
                  onClick={() => setQuantity(item.productId, item.quantity + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-[var(--radius)] border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))]"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                onClick={() => removeItem(item.productId)}
                className="p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))]"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="h-fit">
        <CardContent className="p-6">
          <h2 className="mb-4 text-sm font-semibold">{t('orderSummary')}</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-foreground))]">{t('items')}</span>
              <span>{count}</span>
            </div>
            <div className="flex justify-between border-t border-[hsl(var(--border))] pt-2 text-base font-bold">
              <span>{t('total')}</span>
              <span dir="ltr">{Number(total).toLocaleString(numberLocale)} USD</span>
            </div>
          </div>
          <Button className="mt-6 w-full" onClick={goToCheckout}>
            {t('proceedToCheckout')}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
          <Button asChild variant="ghost" className="mt-2 w-full">
            <Link href={`/${locale}/marketplace`}>{t('continueShopping')}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
