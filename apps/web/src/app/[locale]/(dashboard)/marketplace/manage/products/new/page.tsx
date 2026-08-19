'use client';

import { useTranslations } from 'next-intl';
import { ProductForm } from '@/features/marketplace/components/product-form';
import { useRouter } from 'next/navigation';

export default function NewProductPage() {
  const t = useTranslations('marketplace');
  const router = useRouter();

  return (
    <div>
      <h1 className="text-lg font-semibold mb-6">{t('newProduct')}</h1>
      <ProductForm open={true} onClose={() => router.back()} />
    </div>
  );
}
