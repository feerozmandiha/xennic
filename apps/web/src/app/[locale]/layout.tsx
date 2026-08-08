import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import localFont from 'next/font/local';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { routing } from '@/i18n/routing';

// ── فونت IranSansX — فارسی ──────────────────────────────────────────────────
const iranSans = localFont({
  src: [
    {
      path: '../../fonts/iran-sans/IRANSansXFaNum-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../fonts/iran-sans/IRANSansXFaNum-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-iran-sans',
  display: 'swap',
  preload: true,
});

// ── Inter — انگلیسی ─────────────────────────────────────────────────────────
const inter = localFont({
  src: [
    {
      path: '../../fonts/inter/Inter-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../fonts/inter/Inter-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: 'Xennic — پلتفرم مهندسی برق',
    template: '%s | Xennic',
  },
  description: 'پلتفرم محاسبات مهندسی برق، انرژی‌های تجدیدپذیر و مشاوره هوش مصنوعی',
  keywords: ['مهندسی برق', 'محاسبات مهندسی', 'توان خورشیدی', 'Xennic'],
};

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();
  const dir = locale === 'fa' ? 'rtl' : 'ltr';

  // توجه: html و body در app/layout.tsx هستند (برای رفع ارور Missing html/body tags)
  // اینجا فقط providers و font variables را اعمال می‌کنیم
  return (
    <div dir={dir} lang={locale} className={`${iranSans.variable} ${inter.variable} min-h-screen`}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>{children}</QueryProvider>
        </NextIntlClientProvider>
      </ThemeProvider>
    </div>
  );
}
