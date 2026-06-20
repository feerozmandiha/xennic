import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Xennic — پلن‌ها و اشتراک',
};

export default async function BillingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/settings?tab=plan`);
}
