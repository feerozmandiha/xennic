import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { KnowledgeManageHub } from '@/features/knowledge/components/manage/knowledge-manage-hub';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('nav');
  return { title: `${t('knowledge')} - مدیریت` };
}

export default function KnowledgeManagePage() {
  return <KnowledgeManageHub />;
}
