import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { KnowledgeEditClient } from '@/features/knowledge/components/knowledge-edit-client';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('knowledge');
  return { title: t('editArticle') };
}

export default async function KnowledgeEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <KnowledgeEditClient articleId={id} />;
}
