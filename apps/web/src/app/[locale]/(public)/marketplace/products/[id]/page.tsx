import type { Metadata } from 'next';
import { StorefrontProductDetail } from '@/features/marketplace/storefront/storefront-product-detail';

export const metadata: Metadata = {
  title: 'Xennic Store',
  description: 'جزئیات محصول',
};

export default async function PublicProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      <StorefrontProductDetail id={id} />
    </div>
  );
}
