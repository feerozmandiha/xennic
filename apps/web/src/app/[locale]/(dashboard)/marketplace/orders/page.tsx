import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { OrderList } from '@/features/marketplace/components/order-list';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('marketplace');
  return { title: t('orders') };
}

export default function OrdersPage() {
  return <OrderList />;
}
