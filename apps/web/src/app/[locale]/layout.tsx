import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import localFont from 'next/font/local';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { routing } from '@/i18n/routing';
// CSS در root layout.tsx import شده است

// ── فونت IranSansX — فارسی ──────────────────────────────────────────────────
const iranSans = localFont({
  src: [
    {
      path:   '../../fonts/iran-sans/IRANSansXFaNum-Regular.woff2',
      weight: '400',
      style:  'normal',
    },
    {
      path:   '../../fonts/iran-sans/IRANSansXFaNum-Bold.woff2',
      weight: '700',
      style:  'normal',
    },
  ],
  variable: '--font-iran-sans',
  display:  'swap',
  preload:  true,
});

// ── Inter — انگلیسی ─────────────────────────────────────────────────────────
const inter = Inter({
  subsets:  ['latin'],
  variable: '--font-inter',
  display:  'swap',
});

export const metadata: Metadata = {
  title: {
    default:  'Xennic — پلتفرم مهندسی برق',
    template: '%s | Xennic',
  },
  description: 'پلتفرم محاسبات مهندسی برق، انرژی‌های تجدیدپذیر و مشاوره هوش مصنوعی',
  keywords:    ['مهندسی برق', 'محاسبات مهندسی', 'توان خورشیدی', 'Xennic'],
};

interface LocaleLayoutProps {
  children:  React.ReactNode;
  params:    Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  // اعتبارسنجی locale
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  // direction بر اساس locale
  const dir = locale === 'fa' ? 'rtl' : 'ltr';

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${iranSans.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            <QueryProvider>
              {children}
            </QueryProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
