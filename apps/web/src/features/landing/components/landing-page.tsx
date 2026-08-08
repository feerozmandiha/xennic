'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Zap, ArrowRight, ChevronDown, Shield, TrendingUp, Star, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { UserStatus } from '@/components/layout/user-status';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { useLandingContent } from './landing-content-provider';
import { FeaturesSection } from './features-section';
import { PricingSection } from './pricing-section';
import { ArticlesSection } from './articles-section';
import { CalculationsSection } from './calculations-section';
import type { CmsBranding, LandingContent } from '../types/landing-content';

function localizeHref(href: string | undefined, locale: string): string {
  if (!href) return '#';
  if (href.startsWith('http') || href.startsWith('#')) return href;
  const clean = href.startsWith('/') ? href : `/${href}`;
  if (clean === '/') return `/${locale}`;
  return `/${locale}${clean}`;
}

function BrandLogo({ branding, size = 'sm' }: { branding: CmsBranding; size?: 'sm' | 'lg' }) {
  const dim = size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  if (branding.logo?.url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={branding.logo.url}
        alt={branding.logo.alt ?? branding.platformName}
        className={cn(dim, 'rounded-lg object-contain')}
      />
    );
  }
  return (
    <div
      className={cn(
        dim,
        'rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center shadow-[0_0_16px_hsl(var(--primary)/0.3)]',
      )}
    >
      <Zap className={size === 'lg' ? 'h-5 w-5 text-white' : 'h-4 w-4 text-white'} />
    </div>
  );
}

function Navbar({ content }: { content: LandingContent }) {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const isAuth = useAuthStore((s) => s.isAuthenticated);
  const { header, branding } = content;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!header.visible) return null;

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-[hsl(var(--background)/0.9)] backdrop-blur-xl border-b border-[hsl(var(--border))] shadow-lg'
          : 'bg-transparent',
      )}
    >
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
        <Link href={`/${locale}`} className="flex items-center gap-2.5 shrink-0">
          <BrandLogo branding={branding} />
          <span className="font-bold text-[hsl(var(--foreground))] tracking-wide text-lg">
            {branding.platformName}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {header.links.map((l) => {
            const href =
              l.href === '#calculations' && isAuth
                ? `/${locale}/engineering`
                : localizeHref(l.href, locale);
            return (
              <Link
                key={l.label}
                href={href}
                className="px-4 py-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] rounded-lg hover:bg-[hsl(var(--secondary))] transition-all"
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {header.showLanguageSwitcher && <LanguageSwitcher />}
          {header.showThemeToggle && <ThemeToggle />}
          {header.ctaButton && (
            <Link
              href={localizeHref(header.ctaButton.href, locale)}
              className="h-9 px-4 inline-flex items-center text-sm rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))]"
            >
              {header.ctaButton.label}
            </Link>
          )}
          <UserStatus />
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))] transition-colors"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-[hsl(var(--background)/0.98)] border-b border-[hsl(var(--border))] px-5 pb-5 space-y-1 animate-slide-down">
          {header.links.map((l) => (
            <Link
              key={l.label}
              href={localizeHref(l.href, locale)}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] rounded-lg hover:bg-[hsl(var(--secondary))] transition-all"
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-3 flex items-center gap-2 border-t border-[hsl(var(--border))]">
            {header.showLanguageSwitcher && <LanguageSwitcher />}
            {header.showThemeToggle && <ThemeToggle />}
          </div>
          <UserStatus variant="mobile" />
        </div>
      )}
    </header>
  );
}

function HeroSection({ content }: { content: LandingContent }) {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';
  const { hero } = content;
  if (!hero.visible) return null;

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 bg-[hsl(var(--background))]" />
      {hero.backgroundImage?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={hero.backgroundImage.url}
          alt={hero.backgroundImage.alt ?? ''}
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
      ) : (
        <>
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[hsl(var(--primary))] opacity-[0.06] blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[hsl(var(--accent))] opacity-[0.07] blur-[100px] pointer-events-none" />
        </>
      )}

      <div className="relative z-10 max-w-5xl mx-auto px-5 text-center space-y-8">
        {hero.badge && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[hsl(var(--primary))/0.3] bg-[hsl(var(--primary))/0.05] text-xs text-[hsl(var(--primary))/0.8] font-medium animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
            {hero.badge}
          </div>
        )}
        <div className="space-y-3 animate-fade-in stagger-1">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.08] tracking-tight text-[hsl(var(--foreground))] text-balance">
            {hero.title}{' '}
            {hero.highlightedWord && (
              <span
                className="inline-block"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {hero.highlightedWord}
              </span>
            )}
          </h1>
          <p className="text-base sm:text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto leading-relaxed text-pretty">
            {hero.subtitle}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in stagger-2">
          {hero.primaryButton && (
            <a
              href={localizeHref(hero.primaryButton.href, locale)}
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-white text-sm transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                boxShadow:
                  '0 0 30px hsl(var(--primary)/0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
            >
              {hero.primaryButton.label}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-[-4px]" />
            </a>
          )}
          {hero.secondaryButton && (
            <a
              href={localizeHref(hero.secondaryButton.href, locale)}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-medium text-[hsl(var(--foreground))/0.7] text-sm border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))/0.2] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))] transition-all"
            >
              {hero.secondaryButton.label}
            </a>
          )}
        </div>

        {hero.stats.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 animate-fade-in stagger-3">
            {hero.stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-lg font-bold text-[hsl(var(--foreground))]">{s.value}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))/0.6]">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {hero.showTerminalMockup && (
        <div className="relative z-10 mt-16 w-full max-w-3xl mx-auto px-5 animate-fade-in stagger-4">
          <div
            className="rounded-2xl overflow-hidden border border-[hsl(var(--border))/0.5]"
            style={{
              background: 'hsl(var(--card)/0.9)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[hsl(var(--border))/0.5]">
              <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <span className="w-3 h-3 rounded-full bg-[#28c840]" />
              <span className="flex-1 text-center text-[11px] text-[hsl(var(--foreground))/0.2] font-mono">
                xennic-cli — bash
              </span>
            </div>
            <div className="p-5 font-mono text-sm min-h-[120px] text-[hsl(var(--foreground))/0.5]">
              <div className="text-[hsl(var(--primary))/0.8]">$ xennic --ready</div>
              <div className="text-green-500/80">✓ پلتفرم آماده است</div>
            </div>
          </div>
        </div>
      )}

      <a
        href="#calculations"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-[hsl(var(--foreground))/0.25] hover:text-[hsl(var(--foreground))/0.5] transition-colors animate-bounce-soft"
      >
        <span className="text-[10px] uppercase tracking-widest">پایین</span>
        <ChevronDown className="h-4 w-4" />
      </a>
    </section>
  );
}

function CtaSection({ content }: { content: LandingContent }) {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';
  const { cta } = content;
  if (!cta.visible) return null;

  return (
    <section className="relative py-28 overflow-hidden bg-[hsl(var(--background))]">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--secondary))/0.3] to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[hsl(var(--primary))] opacity-[0.05] blur-[120px]" />
      </div>
      <div className="relative z-10 max-w-4xl mx-auto px-5 text-center space-y-8">
        <div className="space-y-4">
          {cta.eyebrow && (
            <p className="text-xs text-[hsl(var(--primary))] font-mono uppercase tracking-[0.2em]">
              // {cta.eyebrow}
            </p>
          )}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[hsl(var(--foreground))] text-balance">
            {cta.title}{' '}
            {cta.highlightedText && (
              <span
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {cta.highlightedText}
              </span>
            )}
          </h2>
          {cta.subtitle && (
            <p className="text-[hsl(var(--foreground))/0.45] text-base max-w-lg mx-auto">
              {cta.subtitle}
            </p>
          )}
        </div>
        {cta.button && (
          <a
            href={localizeHref(cta.button.href, locale)}
            className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-white transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
              boxShadow: '0 0 40px hsl(var(--primary)/0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          >
            <Zap className="h-5 w-5" />
            {cta.button.label}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </a>
        )}
        {cta.trustBadges && cta.trustBadges.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
            {cta.trustBadges.map((text, i) => {
              const Icon = [Shield, TrendingUp, Star][i % 3];
              return (
                <div
                  key={text}
                  className="flex items-center gap-2 text-xs text-[hsl(var(--foreground))/0.3]"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {text}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function Footer({ content }: { content: LandingContent }) {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';
  const { footer, branding } = content;
  if (!footer.visible) return null;

  return (
    <footer id="footer" className="relative border-t border-[hsl(var(--border))]">
      <div className="max-w-7xl mx-auto px-5 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <BrandLogo branding={branding} />
              <span className="font-bold text-[hsl(var(--foreground))] text-lg">
                {branding.platformName}
              </span>
            </div>
            {footer.aboutText && (
              <p className="text-sm text-[hsl(var(--foreground))/0.35] leading-relaxed max-w-xs">
                {footer.aboutText}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs text-[hsl(var(--foreground))/0.2] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--success))] animate-pulse" />
              سیستم آنلاین و پایدار
            </div>
          </div>
          {footer.columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold text-[hsl(var(--foreground))/0.5] uppercase tracking-wider mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={localizeHref(l.href, locale)}
                      className="text-sm text-[hsl(var(--foreground))/0.35] hover:text-[hsl(var(--foreground))/0.7] transition-colors"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8 border-t border-[hsl(var(--border))]">
          <p className="text-xs text-[hsl(var(--foreground))/0.2]">{footer.copyright}</p>
          {footer.version && (
            <p className="text-xs text-[hsl(var(--foreground))/0.15] font-mono">{footer.version}</p>
          )}
        </div>
      </div>
    </footer>
  );
}

export function LandingPage() {
  const content = useLandingContent();
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';

  return (
    <div dir="rtl" className="min-h-screen bg-[hsl(var(--background))] font-sans">
      <Navbar content={content} />
      <HeroSection content={content} />
      {content.calculations.visible && <CalculationsSection locale={locale} />}
      <FeaturesSection />
      <ArticlesSection locale={locale} />
      <PricingSection locale={locale} />
      <CtaSection content={content} />
      <Footer content={content} />
    </div>
  );
}
