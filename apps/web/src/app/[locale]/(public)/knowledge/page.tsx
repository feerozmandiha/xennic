import { PublicKnowledgeClient } from '@/features/knowledge/components/public-knowledge-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'دانشنامه فنی برق',
  description: 'دانشنامه تخصصی مهندسی برق شامل مقالات، استانداردها و فرمول‌های تخصصی',
};

export default function PublicKnowledgePage() {
  return <PublicKnowledgeClient />;
}
