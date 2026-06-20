import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { WorkspaceNewClient } from '@/features/workspace/components/workspace-new-client';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('nav');
  return { title: 'ایجاد فضای کاری جدید' };
}

export default function WorkspaceNewPage() {
  return <WorkspaceNewClient />;
}
