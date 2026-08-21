import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { KnowledgeNewClient } from '@/features/knowledge/components/knowledge-new-client';
import { KnowledgeAdminGuard } from '@/features/knowledge/admin';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('knowledge');
  return { title: t('newArticle') };
}

export default function KnowledgeNewPage() {
  return (
    <KnowledgeAdminGuard>
      <KnowledgeNewClient />
    </KnowledgeAdminGuard>
  );
}
