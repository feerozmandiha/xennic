import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SearchClient } from '@/features/search/components/search-client';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('nav');
  return { title: t('search') };
}

export default function SearchPage() {
  return <SearchClient />;
}
