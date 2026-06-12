import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SettingsClient } from '@/features/settings/components/settings-client';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('nav');
  return { title: t('settings') };
}

export default function SettingsPage() {
  return <SettingsClient />;
}
