import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { StorefrontClient } from '@/features/marketplace/storefront/storefront-client';
import { Skeleton } from '@/components/ui/skeleton';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('marketplace');
  return {
    title: t('title'),
    description: t('storefrontDescription'),
  };
}

export default async function PublicMarketplacePage() {
  const t = await getTranslations('marketplace');
  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          {t('storefrontDescription')}
        </p>
      </div>
      <Suspense
        fallback={
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-44" />
            ))}
          </div>
        }
      >
        <StorefrontClient />
      </Suspense>
    </div>
  );
}
