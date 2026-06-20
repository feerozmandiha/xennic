import { PublicKnowledgeDetailClient } from '@/features/knowledge/components/public-knowledge-detail-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'دانشنامه فنی برق',
  description: 'مشاهده مقاله تخصصی مهندسی برق',
};

export default async function PublicKnowledgeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PublicKnowledgeDetailClient slug={id} />;
}
