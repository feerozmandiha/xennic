import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { KnowledgeAdminConsole } from '@/features/knowledge/admin';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('nav');
  return { title: t('knowledge') };
}

export default function KnowledgePage() {
  return <KnowledgeAdminConsole />;
}
