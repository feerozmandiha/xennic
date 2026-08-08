import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { KnowledgeCreateWizard } from '@/features/knowledge/components/manage/knowledge-create-wizard';
import { KnowledgeImportPanel } from '@/features/knowledge/components/manage/knowledge-import-panel';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('knowledge');
  return { title: `${t('newArticle')} - جادوگر مدرن` };
}

export default function KnowledgeNewPage() {
  return (
    <div className="space-y-6">
      <KnowledgeCreateWizard />
      <KnowledgeImportPanel />
    </div>
  );
}
