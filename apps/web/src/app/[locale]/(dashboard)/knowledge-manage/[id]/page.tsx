import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { KnowledgeManageDetail } from '@/features/knowledge/components/manage/knowledge-manage-detail';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('knowledge');
  return { title: `${t('title')} - جزئیات مدیریتی` };
}

export default async function KnowledgeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <KnowledgeManageDetail articleId={id} />;
}
