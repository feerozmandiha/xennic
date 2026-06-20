'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Zap, ArrowRight, ChevronDown,
  Shield, TrendingUp, Star,
  Menu, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { UserStatus } from '@/components/layout/user-status';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { ThemeToggle } from '@/components/layout/theme-toggle';  // ✅ اضافه کردن import
import { FeaturesSection } from './features-section';
import { PricingSection } from './pricing-section';
import { ArticlesSection } from './articles-section';
import { CalculationsSection } from './calculations-section';

// ⚠️ حذف کامپوننت محلی ThemeToggleDark (دیگر نیاز نیست)

// ─────────────────────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────────────────────

function Navbar({ locale }: { locale: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);
  const isAuth = useAuthStore(s => s.isAuthenticated);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links: { label: string; href: string }[] = [
    { label: 'صفحه اصلی',  href: `/${locale}` },
    { label: 'محاسبات',    href: isAuth ? `/${locale}/engineering` : '#calculations' },
    { label: 'مقالات',     href: `/${locale}/articles` },
    { label: 'درباره ما',  href: `/${locale}/about` },
    { label: 'تماس',       href: `/${locale}/contact` },
  ];

  return (
    <header className={cn(
      'fixed inset-x-0 top-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-[hsl(var(--background)/0.9)] backdrop-blur-xl border-b border-[hsl(var(--border))] shadow-lg'
        : 'bg-transparent',
    )}>
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
        <Link href={`/${locale}`} className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center shadow-[0_0_16px_hsl(var(--primary)/0.3)]">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-[hsl(var(--foreground))] tracking-wide text-lg">Xennic</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="px-4 py-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] rounded-lg hover:bg-[hsl(var(--secondary))] transition-all"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />  {/* ✅ استفاده از کامپوننت اصلی */}
          <UserStatus />
        </div>

        <button
          onClick={() => setOpen(o => !o)}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))] transition-colors"
        >
          {open ? <Menu className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-[hsl(var(--background)/0.98)] border-b border-[hsl(var(--border))] px-5 pb-5 space-y-1 animate-slide-down">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] rounded-lg hover:bg-[hsl(var(--secondary))] transition-all"
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-3 flex items-center gap-2 border-t border-[hsl(var(--border))]">
            <LanguageSwitcher />
            <ThemeToggle />  {/* ✅ استفاده از کامپوننت اصلی */}
          </div>
          <UserStatus variant="mobile" />
        </div>
      )}
    </header>
  );
}


// ─────────────────────────────────────────────────────────────
// HERO SECTION
// ─────────────────────────────────────────────────────────────

function HeroSection({ locale }: { locale: string }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 bg-[hsl(var(--background))]" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[hsl(var(--primary))] opacity-[0.06] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[hsl(var(--accent))] opacity-[0.07] blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] rounded-full bg-[hsl(var(--accent))] opacity-[0.04] blur-[80px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-5 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[hsl(var(--primary))/0.3] bg-[hsl(var(--primary))/0.05] text-xs text-[hsl(var(--primary))/0.8] font-medium animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
          پلتفرم تخصصی مهندسی برق و انرژی‌های نو
        </div>

        <div className="space-y-3 animate-fade-in stagger-1">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.08] tracking-tight text-[hsl(var(--foreground))] text-balance">
            محاسبات مهندسی{' '}
            <span
              className="inline-block"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              هوشمند
            </span>
            <br />
            با استانداردهای{' '}
            <span className="text-[hsl(var(--foreground))/0.8]">IEC / IEEE</span>
          </h1>
          <p className="text-base sm:text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto leading-relaxed text-pretty">
            از طراحی کابل تا آنالیز کیفیت توان، از خورشیدی تا شبکه هوشمند —
            همه محاسبات تخصصی شما در یک پلتفرم یکپارچه
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in stagger-2">
          <a
            href={`/${locale}/register`}
            className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-white text-sm transition-all duration-200"
            style={{
              background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))`,
              boxShadow: `0 0 30px hsl(var(--primary)/0.35), inset 0 1px 0 rgba(255,255,255,0.15)`,
            }}
          >
            شروع رایگان
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-[-4px]" />
          </a>
          <a
            href="#calculations"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-medium text-[hsl(var(--foreground))/0.7] text-sm border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))/0.2] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))] transition-all"
          >
            امتحان رایگان
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 pt-2 animate-fade-in stagger-3">
          {[
            { v: '۲۰+', l: 'محاسبه استاندارد' },
            { v: 'IEC',  l: '60364 / 60076' },
            { v: 'IEEE', l: '519 / C57.110' },
            { v: 'RTL',  l: 'پشتیبانی فارسی' },
          ].map(({ v, l }) => (
            <div key={v} className="text-center">
              <p className="text-lg font-bold text-[hsl(var(--foreground))]">{v}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))/0.6]">{l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mt-16 w-full max-w-3xl mx-auto px-5 animate-fade-in stagger-4">
        <TerminalMockup />
      </div>

      <a
        href="#calculations"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-[hsl(var(--foreground))/0.25] hover:text-[hsl(var(--foreground))/0.5] transition-colors animate-bounce-soft"
      >
        <span className="text-[10px] uppercase tracking-widest">محاسبات رایگان</span>
        <ChevronDown className="h-4 w-4" />
      </a>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// TERMINAL MOCKUP
// ─────────────────────────────────────────────────────────────

function TerminalMockup() {
  const lines = [
    { t: 100,  text: '$ xennic calc --type PQ-001 --thd 8.3%',  color: 'text-[hsl(var(--primary))/0.8]' },
    { t: 600,  text: '  ✓ THD Analysis (IEEE 519-2022)',          color: 'text-[hsl(var(--foreground))/0.4]' },
    { t: 900,  text: '  → THD_I = 8.3% > 5% (Limit)',           color: 'text-[hsl(var(--destructive))/0.8]' },
    { t: 1100, text: '  → Recommendation: 5th Harmonic Filter',  color: 'text-[hsl(var(--warning))/0.8]' },
    { t: 1400, text: '  → C = 147.3 μF  |  L = 12.4 mH',       color: 'text-[hsl(var(--success))/0.8]' },
    { t: 1700, text: '  ✓ Completed in 42ms',                    color: 'text-[hsl(var(--success))/0.8]' },
    { t: 2000, text: '$ _',                                       color: 'text-[hsl(var(--primary))/0.8]' },
  ];

  const [visible, setVisible] = useState(0);

  useEffect(() => {
    lines.forEach(({ t }, i) => {
      const timer = setTimeout(() => setVisible(i + 1), t);
      return () => clearTimeout(timer);
    });
  }, []);

  return (
    <div
      className="rounded-2xl overflow-hidden border border-[hsl(var(--border))/0.5]"
      style={{ background: 'hsl(var(--card)/0.9)', backdropFilter: 'blur(20px)', boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)' }}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[hsl(var(--border))/0.5]">
        <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
        <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        <span className="flex-1 text-center text-[11px] text-[hsl(var(--foreground))/0.2] font-mono">xennic-cli — bash</span>
      </div>
      <div className="p-5 font-mono text-sm space-y-1 min-h-[180px]">
        {lines.slice(0, visible).map((l, i) => (
          <div key={i} className={cn('leading-relaxed', l.color, 'animate-fade-in-fast')}>
            {l.text}
            {i === visible - 1 && l.text.endsWith('_') && (
              <span className="animate-pulse">|</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CTA SECTION
// ─────────────────────────────────────────────────────────────

function CTASection({ locale }: { locale: string }) {
  return (
    <section className="relative py-28 overflow-hidden bg-[hsl(var(--background))]">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--secondary))/0.3] to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[hsl(var(--primary))] opacity-[0.05] blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-5 text-center space-y-8">
        <div className="space-y-4">
          <p className="text-xs text-[hsl(var(--primary))] font-mono uppercase tracking-[0.2em]">// شروع کنید</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[hsl(var(--foreground))] text-balance">
            محاسبات مهندسی خود را<br />
            <span
              style={{
                background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              حرفه‌ای کنید
            </span>
          </h2>
          <p className="text-[hsl(var(--foreground))/0.45] text-base max-w-lg mx-auto">
            همین الان ثبت‌نام کنید — بدون نیاز به کارت اعتباری، رایگان شروع کنید
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={`/${locale}/register`}
            className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-white transition-all duration-200"
            style={{
              background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))`,
              boxShadow: `0 0 40px hsl(var(--primary)/0.4), inset 0 1px 0 rgba(255,255,255,0.15)`,
            }}
          >
            <Zap className="h-5 w-5" />
            شروع رایگان
            <ArrowRight className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
          {[
            { icon: Shield,    text: 'امنیت کامل' },
            { icon: TrendingUp, text: 'بروزرسانی مداوم' },
            { icon: Star,      text: 'پشتیبانی فارسی' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-xs text-[hsl(var(--foreground))/0.3]">
              <Icon className="h-3.5 w-3.5" />
              {text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────

function Footer({ locale }: { locale: string }) {
  return (
    <footer id="footer" className="relative border-t border-[hsl(var(--border))]">
      <div className="max-w-7xl mx-auto px-5 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-[hsl(var(--foreground))] text-lg">Xennic</span>
            </div>
            <p className="text-sm text-[hsl(var(--foreground))/0.35] leading-relaxed max-w-xs">
              پلتفرم تخصصی محاسبات مهندسی برق، کیفیت توان و انرژی‌های تجدیدپذیر
              با استانداردهای IEC و IEEE
            </p>
            <div className="flex items-center gap-2 text-xs text-[hsl(var(--foreground))/0.2] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--success))] animate-pulse" />
              سیستم آنلاین و پایدار
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-[hsl(var(--foreground))/0.5] uppercase tracking-wider mb-4">محصول</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'ویژگی‌ها',   href: '#features' },
                { label: 'مقالات',     href: `/${locale}/articles` },
                { label: 'محاسبات',    href: '#calculations' },
                { label: 'پلن‌ها',     href: '#pricing' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="text-sm text-[hsl(var(--foreground))/0.35] hover:text-[hsl(var(--foreground))/0.7] transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-[hsl(var(--foreground))/0.5] uppercase tracking-wider mb-4">سایر</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'درباره ما', href: `/${locale}/about` },
                { label: 'تماس',      href: `/${locale}/contact` },
                { label: 'ورود',     href: `/${locale}/login` },
                { label: 'ثبت‌نام', href: `/${locale}/register` },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="text-sm text-[hsl(var(--foreground))/0.35] hover:text-[hsl(var(--foreground))/0.7] transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8 border-t border-[hsl(var(--border))]">
          <p className="text-xs text-[hsl(var(--foreground))/0.2]">
            © ۱۴۰۴ Xennic — تمام حقوق محفوظ است
          </p>
          <p className="text-xs text-[hsl(var(--foreground))/0.15] font-mono">
            v1.0.0-beta
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────

export function LandingPage() {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';

  return (
    <div dir="rtl" className="min-h-screen bg-[hsl(var(--background))] font-sans">
      <Navbar locale={locale} />
      <HeroSection locale={locale} />
      <CalculationsSection locale={locale} />
      <FeaturesSection />
      <ArticlesSection locale={locale} />
      <PricingSection locale={locale} />
      <CTASection locale={locale} />
      <Footer locale={locale} />
    </div>
  );
}