import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ProjectDetailClient } from '@/features/projects/components/project-detail-client';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('projects');
  return { title: t('title') };
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  return <ProjectDetailClient projectId={params.id} />;
}
