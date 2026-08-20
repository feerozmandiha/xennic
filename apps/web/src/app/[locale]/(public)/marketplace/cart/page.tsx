import type { Metadata } from 'next';
import { StorefrontCart } from '@/features/marketplace/storefront/storefront-cart';

export const metadata: Metadata = {
  title: 'سبد خرید — Xennic Store',
  description: 'سبد خرید فروشگاه Xennic',
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      <h1 className="mb-6 text-2xl font-bold">سبد خرید</h1>
      <StorefrontCart />
    </div>
  );
}
