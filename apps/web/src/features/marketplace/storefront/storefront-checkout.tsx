'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation } from '@tanstack/react-query';
import { ShoppingCart, CheckCircle2, Package, CreditCard, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/client';
import { useCartStore, useCartTotals } from '@/stores/cart.store';
import { useToast } from '@/stores/toast.store';

export function StorefrontCheckout() {
  const t = useTranslations('marketplace');
  const toast = useToast();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) ?? 'fa';
  const numberLocale = locale === 'fa' ? 'fa-IR' : 'en-US';

  const paymentResult = searchParams.get('payment') ?? null;

  const { items, count, total } = useCartTotals();
  const clear = useCartStore((s) => s.clear);
  const [orderId, setOrderId] = useState<string | null>(null);

  const placeOrder = useMutation({
    mutationFn: () =>
      apiClient.post<{ id: string }>('/orders', {
        currency: 'USD',
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      }),
    onSuccess: (res) => {
      clear();
      setOrderId(res.id);
      toast.success(t('orderSuccess'));
    },
    onError: () => toast.error(t('error')),
  });

  const requestPayment = useMutation({
    mutationFn: (id: string) =>
      apiClient.post<{ redirectUrl: string }>(`/orders/${id}/request-payment`),
    onSuccess: (res) => {
      if (res.redirectUrl) window.location.href = res.redirectUrl;
    },
    onError: () => toast.error(t('error')),
  });

  // ── بازگشت از درگاه پرداخت ─────────────────────────────
  if (paymentResult === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <CheckCircle2 className="mb-4 h-14 w-14 text-[hsl(var(--success))]" />
        <h1 className="text-lg font-bold">{t('paymentSuccess')}</h1>
        <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
          {t('paymentSuccessNote')}
        </p>
        <div className="mt-6 flex gap-3">
          <Button asChild>
            <Link href={`/${locale}/marketplace/manage/orders`}>{t('viewOrders')}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/${locale}/marketplace`}>{t('continueShopping')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (paymentResult === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <XCircle className="mb-4 h-14 w-14 text-[hsl(var(--destructive))]" />
        <h1 className="text-lg font-bold">{t('paymentFailed')}</h1>
        <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{t('paymentFailedNote')}</p>
        <div className="mt-6 flex gap-3">
          <Button asChild>
            <Link href={`/${locale}/marketplace/manage/orders`}>{t('viewOrders')}</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/${locale}/marketplace`}>{t('continueShopping')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (orderId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <CheckCircle2 className="mb-4 h-14 w-14 text-[hsl(var(--success))]" />
        <h1 className="text-lg font-bold">{t('orderSuccess')}</h1>
        <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
          {t('orderId')}:{' '}
          <span className="font-mono" dir="ltr">
            {orderId}
          </span>
        </p>
        <Button
          className="mt-6"
          onClick={() => requestPayment.mutate(orderId)}
          loading={requestPayment.isPending}
        >
          <CreditCard className="h-4 w-4" />
          {t('payOnline')}
        </Button>
        <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">{t('payTestMode')}</p>
        <div className="mt-6 flex gap-3">
          <Button asChild variant="outline">
            <Link href={`/${locale}/marketplace/manage/orders`}>{t('viewOrders')}</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href={`/${locale}/marketplace`}>{t('continueShopping')}</Link>
          </Button>
        </div>
      </div>
    );
  }

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
      <Card className="lg:col-span-2">
        <CardContent className="p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <Package className="h-4 w-4" />
            {t('reviewOrder')}
          </h2>
          <div className="divide-y divide-[hsl(var(--border))]">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {item.quantity} × {Number(item.price).toLocaleString(numberLocale)}{' '}
                    {item.currency}
                  </p>
                </div>
                <p className="text-sm font-semibold" dir="ltr">
                  {Number(item.price * item.quantity).toLocaleString(numberLocale)} {item.currency}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
          <Button
            className="mt-6 w-full"
            onClick={() => placeOrder.mutate()}
            loading={placeOrder.isPending}
          >
            {t('placeOrder')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
