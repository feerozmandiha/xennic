import type { Metadata } from 'next';
import { LandingPage } from '@/features/landing/components/landing-page';
import { LandingContentProvider } from '@/features/landing/components/landing-content-provider';
import { fetchPublicLandingContent } from '@/features/landing/lib/landing-api';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const content = await fetchPublicLandingContent(locale);
  return {
    title: content.seo.title,
    description: content.seo.description,
    keywords: content.seo.keywords,
    openGraph: {
      title: content.seo.title,
      description: content.seo.description,
      type: 'website',
      images: content.seo.ogImage?.url ? [{ url: content.seo.ogImage.url }] : undefined,
    },
    icons: content.branding.favicon?.url ? { icon: content.branding.favicon.url } : undefined,
  };
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  const content = await fetchPublicLandingContent(locale);
  return (
    <LandingContentProvider content={content}>
      <LandingPage />
    </LandingContentProvider>
  );
}
