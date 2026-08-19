import type { Metadata } from 'next';
import { Suspense } from 'react';
import { StorefrontCheckout } from '@/features/marketplace/storefront/storefront-checkout';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'تسویه حساب — Xennic Store',
  description: 'ثبت نهایی سفارش و پرداخت',
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<Skeleton className="h-72" />}>
      <StorefrontCheckout />
    </Suspense>
  );
}
