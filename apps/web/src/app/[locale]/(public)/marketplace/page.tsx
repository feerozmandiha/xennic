import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { StorefrontClient } from '@/features/marketplace/storefront/storefront-client';

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
      <StorefrontClient />
    </div>
  );
}
