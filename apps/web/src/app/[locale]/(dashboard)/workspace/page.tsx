import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { WorkspaceDashboardClient } from '@/features/workspace/components/workspace-dashboard-client';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('nav');
  return { title: t('workspace') ?? 'Workspace' };
}

export default function WorkspacePage() {
  return <WorkspaceDashboardClient />;
}
