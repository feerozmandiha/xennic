import type { Metadata } from 'next';
import { TaxonomyManagerHub } from '@/features/knowledge/components/manage/taxonomy-manager-hub';

export const metadata: Metadata = {
  title: 'مدیریت تاکسونومی دانشنامه',
};

export default function TaxonomyManagePage() {
  return <TaxonomyManagerHub />;
}
