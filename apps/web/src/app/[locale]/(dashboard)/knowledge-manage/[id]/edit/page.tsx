import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { KnowledgeCreateWizard } from '@/features/knowledge/components/manage/knowledge-create-wizard';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('knowledge');
  return { title: `${t('editArticle')} - ویرایشگر مدرن` };
}

export default async function KnowledgeEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <KnowledgeCreateWizard articleId={id} />;
}
