import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { StorageClient } from '@/features/storage/components/storage-client';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('nav');
  return { title: t('storage') };
}

export default function StoragePage() {
  return <StorageClient />;
}
