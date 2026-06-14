import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ArticleDetailClient } from '@/features/articles/components/article-detail-client';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const t = await getTranslations('nav');
  return {
    title: `${t('articles')} — ${slug}`,
  };
}

export default function ArticleDetailPage({ params }: Props) {
  return <ArticleDetailClient params={params} />;
}
