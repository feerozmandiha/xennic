import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PowerSystemClient } from '@/features/engineering/components/power-system-client';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('nav');
  return { title: t('power-system') };
}

export default function PowerSystemPage() {
  return <PowerSystemClient />;
}
