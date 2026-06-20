import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { KnowledgeDetailClient } from '@/features/knowledge/components/knowledge-detail-client';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('knowledge');
  return { title: t('title') };
}

export default async function KnowledgeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <KnowledgeDetailClient articleId={id} />;
}
