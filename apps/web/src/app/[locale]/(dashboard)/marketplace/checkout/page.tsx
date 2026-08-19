import type { Metadata } from 'next';
import { StorefrontCheckout } from '@/features/marketplace/storefront/storefront-checkout';

export const metadata: Metadata = {
  title: 'تسویه حساب — Xennic Store',
  description: 'ثبت نهایی سفارش',
};

export default function CheckoutPage() {
  return <StorefrontCheckout />;
}
