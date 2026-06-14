import type { Metadata } from 'next';
import { LandingPage } from '@/features/landing/components/landing-page';

export const metadata: Metadata = {
  title: 'Xennic — پلتفرم تخصصی مهندسی برق',
  description:
    'محاسبات مهندسی برق، کیفیت توان (IEEE 519) و انرژی‌های تجدیدپذیر با استانداردهای IEC و IEEE. رایگان شروع کنید.',
  keywords: ['مهندسی برق', 'محاسبات مهندسی', 'کیفیت توان', 'THD', 'IEEE 519', 'IEC 60364', 'Xennic'],
  openGraph: {
    title:       'Xennic — پلتفرم تخصصی مهندسی برق',
    description: 'محاسبات مهندسی برق با استانداردهای IEC و IEEE',
    type:        'website',
  },
};

export default function HomePage() {
  return <LandingPage />;
}
