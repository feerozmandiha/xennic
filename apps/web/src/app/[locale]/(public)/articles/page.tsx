import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ArticlesClient } from '@/features/articles/components/articles-client';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('nav');
  return { title: t('articles') };
}

export default function ArticlesPage() {
  return <ArticlesClient />;
}
