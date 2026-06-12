'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
  Zap, ArrowRight, ChevronDown,
  BarChart3, Shield, Globe, Cpu,
  CheckCircle2, Star, Menu, X,
  FlaskConical, Layers, TrendingUp,
  Sun, Moon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface NavLink { label: string; href: string; }

// ─────────────────────────────────────────────────────────────
// NAV
// ─────────────────────────────────────────────────────────────

function Navbar({ locale }: { locale: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);
  const [dark, setDark]         = useState(true);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links: NavLink[] = [
    { label: 'ویژگی‌ها',  href: '#features' },
    { label: 'آمار',       href: '#stats' },
    { label: 'پلن‌ها',    href: '#pricing' },
    { label: 'تماس',      href: '#footer' },
  ];

  return (
    <header className={cn(
      'fixed inset-x-0 top-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-[#050b14]/90 backdrop-blur-xl border-b border-white/5 shadow-lg'
        : 'bg-transparent',
    )}>
      <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <a href={`/${locale}`} className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#6366f1] flex items-center justify-center shadow-[0_0_16px_rgba(99,102,241,0.5)]">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-white tracking-wide text-lg">Xennic</span>
        </a>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              className="px-4 py-2 text-sm text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-all"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-2">
          {/* Theme (for landing) */}
          <button
            onClick={() => setDark(d => !d)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <a
            href={`/${locale}/login`}
            className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
          >
            ورود
          </a>
          <a
            href={`/${locale}/register`}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-[#3b82f6] to-[#6366f1] text-white hover:opacity-90 transition-opacity shadow-[0_0_16px_rgba(99,102,241,0.3)]"
          >
            شروع رایگان ←
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(o => !o)}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#050b14]/98 border-b border-white/5 px-5 pb-5 space-y-1 animate-slide-down">
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-white/70 hover:text-white rounded-lg hover:bg-white/5 transition-all"
            >
              {l.label}
            </a>
          ))}
          <div className="pt-3 flex flex-col gap-2 border-t border-white/5">
            <a href={`/${locale}/login`}    className="px-4 py-2.5 text-sm text-center text-white/70 border border-white/10 rounded-lg hover:bg-white/5 transition-all">ورود</a>
            <a href={`/${locale}/register`} className="px-4 py-2.5 text-sm font-semibold text-center rounded-lg bg-gradient-to-r from-[#3b82f6] to-[#6366f1] text-white">شروع رایگان</a>
          </div>
        </div>
      )}
    </header>
  );
}

// ─────────────────────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────────────────────

function HeroSection({ locale }: { locale: string }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">

      {/* ── Background layers ── */}
      <div className="absolute inset-0 bg-[#050b14]" />

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#3b82f6] opacity-[0.06] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[#6366f1] opacity-[0.07] blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] rounded-full bg-[#06b6d4] opacity-[0.04] blur-[80px] pointer-events-none" />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")" }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-5 text-center space-y-8">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#3b82f6]/30 bg-[#3b82f6]/5 text-xs text-[#93c5fd] font-medium animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-pulse" />
          پلتفرم تخصصی مهندسی برق و انرژی‌های نو
        </div>

        {/* Headline */}
        <div className="space-y-3 animate-fade-in stagger-1">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.08] tracking-tight text-white text-balance">
            محاسبات مهندسی{' '}
            <span
              className="inline-block"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              هوشمند
            </span>
            <br />
            با استانداردهای{' '}
            <span className="text-white/80">IEC / IEEE</span>
          </h1>
          <p className="text-base sm:text-lg text-white/50 max-w-2xl mx-auto leading-relaxed text-pretty">
            از طراحی کابل تا آنالیز کیفیت توان، از خورشیدی تا شبکه هوشمند —
            همه محاسبات تخصصی شما در یک پلتفرم یکپارچه
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in stagger-2">
          <a
            href={`/${locale}/register`}
            className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-white text-sm transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              boxShadow: '0 0 30px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          >
            شروع رایگان
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-[-4px]" />
          </a>
          <a
            href={`/${locale}/login`}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-medium text-white/70 text-sm border border-white/10 hover:border-white/20 hover:text-white hover:bg-white/5 transition-all"
          >
            ورود به حساب
          </a>
        </div>

        {/* Social proof */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-2 animate-fade-in stagger-3">
          {[
            { v: '20+',  l: 'محاسبه استاندارد' },
            { v: 'IEC',  l: '60364 / 60076' },
            { v: 'IEEE', l: '519 / C57.110' },
            { v: 'RTL',  l: 'پشتیبانی فارسی' },
          ].map(({ v, l }) => (
            <div key={v} className="text-center">
              <p className="text-lg font-bold text-white">{v}</p>
              <p className="text-xs text-white/35">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Terminal mockup */}
      <div className="relative z-10 mt-16 w-full max-w-3xl mx-auto px-5 animate-fade-in stagger-4">
        <TerminalMockup />
      </div>

      {/* Scroll indicator */}
      <a
        href="#features"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/25 hover:text-white/50 transition-colors animate-bounce-soft"
      >
        <span className="text-[10px] uppercase tracking-widest">بیشتر</span>
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
    { t: 100,  text: '$ xennic calc --type PQ-001 --thd 8.3%',  color: 'text-[#93c5fd]' },
    { t: 600,  text: '  ✓ THD Analysis (IEEE 519-2022)',          color: 'text-white/40' },
    { t: 900,  text: '  → THD_I = 8.3% > 5% (Limit)',           color: 'text-[#f87171]' },
    { t: 1100, text: '  → Recommendation: 5th Harmonic Filter',  color: 'text-[#fbbf24]' },
    { t: 1400, text: '  → C = 147.3 μF  |  L = 12.4 mH',       color: 'text-[#34d399]' },
    { t: 1700, text: '  ✓ Completed in 42ms',                    color: 'text-[#34d399]' },
    { t: 2000, text: '$ _',                                       color: 'text-[#93c5fd]' },
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
      className="rounded-2xl overflow-hidden border border-white/8"
      style={{ background: 'rgba(5,11,20,0.9)', backdropFilter: 'blur(20px)', boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)' }}
    >
      {/* Window bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
        <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
        <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        <span className="flex-1 text-center text-[11px] text-white/20 font-mono">xennic-cli — bash</span>
      </div>
      {/* Terminal body */}
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
// FEATURES
// ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: FlaskConical,
    color: 'from-[#3b82f6] to-[#6366f1]',
    glow:  'rgba(99,102,241,0.25)',
    title: 'محاسبات استاندارد',
    desc:  '۲۰+ محاسبه تخصصی مطابق IEC 60364، IEC 60076، IEEE 519 و IEEE C57.110',
    tags:  ['کابل‌سایزینگ', 'افت ولتاژ', 'اتصال کوتاه', 'ترانسفورماتور'],
  },
  {
    icon: BarChart3,
    color: 'from-[#06b6d4] to-[#3b82f6]',
    glow:  'rgba(6,182,212,0.25)',
    title: 'کیفیت توان',
    desc:  'تحلیل THD، TDD، K-Factor، رزونانس هارمونیک و طراحی فیلتر پسیو/فعال مطابق IEEE 519',
    tags:  ['THD', 'TDD', 'Passive Filter', 'Active APF'],
  },
  {
    icon: Cpu,
    color: 'from-[#8b5cf6] to-[#6366f1]',
    glow:  'rgba(139,92,246,0.25)',
    title: 'هوش مصنوعی مهندسی',
    desc:  'مشاور AI تخصصی برق با دانش استانداردها، طراحی سیستم و تشخیص اشکال',
    tags:  ['مشاور تخصصی', 'تشخیص خطا', 'بهینه‌سازی'],
  },
  {
    icon: Layers,
    color: 'from-[#f59e0b] to-[#ef4444]',
    glow:  'rgba(245,158,11,0.2)',
    title: 'مدیریت پروژه',
    desc:  'سازماندهی پروژه‌های مهندسی، یادداشت‌های فنی، تاریخچه محاسبات و همکاری تیمی',
    tags:  ['Multi-tenant', 'Team RBAC', 'تاریخچه'],
  },
  {
    icon: Shield,
    color: 'from-[#10b981] to-[#06b6d4]',
    glow:  'rgba(16,185,129,0.2)',
    title: 'امنیت و تطابق',
    desc:  'احراز هویت JWT، کنترل دسترسی نقش‌محور، ثبت تمام رویدادها و رمزگذاری داده',
    tags:  ['JWT Auth', 'RBAC', 'Audit Log'],
  },
  {
    icon: Globe,
    color: 'from-[#6366f1] to-[#8b5cf6]',
    glow:  'rgba(99,102,241,0.2)',
    title: 'چندزبانه & RTL',
    desc:  'پشتیبانی کامل از زبان فارسی با چینش RTL، فونت IranSansX و تقویم شمسی',
    tags:  ['فارسی', 'RTL', 'IranSansX'],
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="relative py-28 bg-[#050b14] overflow-hidden">
      {/* Top fade */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#050b14] to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-xs text-[#3b82f6] font-mono uppercase tracking-[0.2em]">// ویژگی‌ها</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white text-balance">
            همه ابزارهای مهندسی برق<br />
            <span
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              در یک پلتفرم
            </span>
          </h2>
          <p className="text-white/45 max-w-xl mx-auto text-sm leading-relaxed">
            از محاسبات پایه تا تحلیل‌های پیچیده کیفیت توان — با استانداردهای بین‌المللی
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <FeatureCard key={i} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature: f, index }: { feature: typeof FEATURES[0]; index: number }) {
  const Icon = f.icon;
  return (
    <div
      className="relative rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all duration-300 group overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.02)', animationDelay: `${index * 80}ms` }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${f.glow} 0%, transparent 70%)` }}
      />

      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
        style={{
          background: `linear-gradient(135deg, ${f.color.replace('from-[', '').replace('] to-[', ', ').replace(']', '')})`,
          boxShadow: `0 0 20px ${f.glow}`,
        }}
      >
        <Icon className="h-5 w-5 text-white" />
      </div>

      <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
      <p className="text-sm text-white/45 leading-relaxed mb-4">{f.desc}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {f.tags.map(tag => (
          <span
            key={tag}
            className="px-2 py-0.5 rounded-full text-[10px] font-medium border border-white/8 text-white/40"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────────────────────

const STATS = [
  { value: '20+',    label: 'محاسبه استاندارد',     sublabel: 'IEC · IEEE · UL' },
  { value: '6',      label: 'ماژول کیفیت توان',     sublabel: 'IEEE 519-2022' },
  { value: '100%',   label: 'پشتیبانی RTL',         sublabel: 'فارسی و انگلیسی' },
  { value: '∞',      label: 'ظرفیت محاسبه Pro',    sublabel: 'بدون محدودیت' },
];

function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.2 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="stats" ref={ref} className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050b14] via-[#070e1a] to-[#050b14]" />
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-[#3b82f6]/20 to-transparent" />

      <div className="relative z-10 max-w-5xl mx-auto px-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {STATS.map(({ value, label, sublabel }, i) => (
            <div
              key={i}
              className={cn(
                'text-center transition-all duration-700',
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
              )}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <div
                className="text-4xl sm:text-5xl font-black mb-2 tabular-nums"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {value}
              </div>
              <p className="text-sm font-semibold text-white/80">{label}</p>
              <p className="text-[11px] text-white/30 mt-0.5 font-mono">{sublabel}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// CALCULATORS PREVIEW
// ─────────────────────────────────────────────────────────────

const CALC_GROUPS = [
  {
    label: 'الکتریک پایه',
    color: '#3b82f6',
    items: ['قانون اهم', 'توان اکتیو', 'توان ظاهری', 'ضریب قدرت'],
  },
  {
    label: 'کابل',
    color: '#06b6d4',
    items: ['سایزینگ کابل', 'افت ولتاژ', 'اتصال کوتاه', 'سایز PE'],
  },
  {
    label: 'ترانسفورماتور',
    color: '#8b5cf6',
    items: ['سایزینگ', 'تلفات', 'تنظیم ولتاژ', 'K-Factor'],
  },
  {
    label: 'کیفیت توان',
    color: '#f59e0b',
    items: ['THD', 'TDD', 'رزونانس', 'فیلتر APF'],
  },
];

function CalculatorPreview() {
  return (
    <section className="relative py-24 bg-[#050b14]">
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center mb-12 space-y-3">
          <p className="text-xs text-[#8b5cf6] font-mono uppercase tracking-[0.2em]">// محاسبات</p>
          <h2 className="text-3xl font-black text-white">
            کاتالوگ محاسبات مهندسی
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CALC_GROUPS.map((g, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/5 p-5 hover:border-white/10 transition-all duration-300 group"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <div
                className="w-8 h-1.5 rounded-full mb-4"
                style={{ background: g.color }}
              />
              <h3 className="text-sm font-bold text-white mb-3">{g.label}</h3>
              <ul className="space-y-2">
                {g.items.map(item => (
                  <li key={item} className="flex items-center gap-2 text-xs text-white/45">
                    <CheckCircle2 className="h-3 w-3 shrink-0" style={{ color: g.color + 'aa' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// PRICING
// ─────────────────────────────────────────────────────────────

const PLANS = [
  {
    name: 'رایگان',
    nameEn: 'Free',
    price: '۰',
    period: 'تومان / ماه',
    desc: 'برای آشنایی با پلتفرم',
    color: 'border-white/8',
    badge: null,
    features: [
      '۱۰۰ محاسبه در ماه',
      'محاسبات پایه (BASIC · CABLE)',
      '۱ فضای کاری',
      '۱ گیگابایت فضا',
      'پشتیبانی ایمیل',
    ],
    cta: 'شروع رایگان',
    ctaStyle: 'border border-white/10 text-white hover:bg-white/5',
  },
  {
    name: 'حرفه‌ای',
    nameEn: 'Pro',
    price: '۴۹۰,۰۰۰',
    period: 'تومان / ماه',
    desc: 'برای مهندسان حرفه‌ای',
    color: 'border-[#3b82f6]/40',
    badge: 'محبوب‌ترین',
    glow: 'rgba(59,130,246,0.15)',
    features: [
      'محاسبات نامحدود',
      'تمام ماژول‌ها + کیفیت توان',
      '۵ فضای کاری',
      '۵۰ گیگابایت فضا',
      'AI مهندسی (۵۰۰ درخواست/ماه)',
      'پشتیبانی اولویت‌دار',
    ],
    cta: 'شروع با Pro',
    ctaStyle: 'bg-gradient-to-r from-[#3b82f6] to-[#6366f1] text-white',
    shadow: '0 0 30px rgba(99,102,241,0.25)',
  },
  {
    name: 'سازمانی',
    nameEn: 'Enterprise',
    price: 'تماس',
    period: 'برای قیمت‌گذاری',
    desc: 'برای شرکت‌ها و سازمان‌ها',
    color: 'border-white/8',
    badge: null,
    features: [
      'همه امکانات Pro',
      'فضاهای کاری نامحدود',
      'AI نامحدود',
      'SSO & SAML',
      'SLA اختصاصی',
      'پشتیبانی ۲۴/۷',
    ],
    cta: 'تماس با ما',
    ctaStyle: 'border border-white/10 text-white hover:bg-white/5',
  },
];

function PricingSection({ locale }: { locale: string }) {
  return (
    <section id="pricing" className="relative py-28 bg-[#050b14]">
      <div className="max-w-6xl mx-auto px-5">

        <div className="text-center mb-16 space-y-4">
          <p className="text-xs text-[#10b981] font-mono uppercase tracking-[0.2em]">// پلن‌ها</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            قیمت‌گذاری شفاف
          </h2>
          <p className="text-white/40 text-sm max-w-md mx-auto">
            پرداخت ماهانه، لغو هر زمان، بدون قرارداد بلندمدت
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
          {PLANS.map((plan, i) => (
            <div
              key={i}
              className={cn(
                'relative rounded-2xl border p-7 transition-all duration-300',
                plan.color,
                i === 1 && 'scale-[1.03] md:scale-[1.06]',
              )}
              style={{
                background: plan.glow
                  ? `radial-gradient(ellipse at 50% -20%, ${plan.glow} 0%, rgba(5,11,20,0.95) 70%)`
                  : 'rgba(255,255,255,0.02)',
                boxShadow: plan.shadow,
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold text-white bg-gradient-to-r from-[#3b82f6] to-[#6366f1]">
                    ⭐ {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan info */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xs text-white/30 font-mono">{plan.nameEn}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-xs text-white/35">{plan.desc}</p>
              </div>

              {/* Price */}
              <div className="mb-7 pb-7 border-b border-white/5">
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-black text-white tabular-nums">{plan.price}</span>
                  <span className="text-xs text-white/30 pb-1">{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white/60">
                    <CheckCircle2 className="h-4 w-4 text-[#10b981] shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href={plan.cta === 'تماس با ما' ? '#footer' : `/${locale}/register`}
                className={cn(
                  'block w-full text-center py-3 rounded-xl text-sm font-semibold transition-all',
                  plan.ctaStyle,
                  i === 1 && 'shadow-[0_0_20px_rgba(99,102,241,0.3)]',
                )}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// CTA BANNER
// ─────────────────────────────────────────────────────────────

function CTASection({ locale }: { locale: string }) {
  return (
    <section className="relative py-28 overflow-hidden bg-[#050b14]">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] to-[#050b14]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[#3b82f6] opacity-[0.05] blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-5 text-center space-y-8">
        <div className="space-y-4">
          <p className="text-xs text-[#3b82f6] font-mono uppercase tracking-[0.2em]">// شروع کنید</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white text-balance">
            محاسبات مهندسی خود را<br />
            <span
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #6366f1, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              حرفه‌ای کنید
            </span>
          </h2>
          <p className="text-white/45 text-base max-w-lg mx-auto">
            همین الان ثبت‌نام کنید — بدون نیاز به کارت اعتباری، رایگان شروع کنید
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={`/${locale}/register`}
            className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-white transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              boxShadow: '0 0 40px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          >
            <Zap className="h-5 w-5" />
            شروع رایگان
            <ArrowRight className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </a>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
          {[
            { icon: Shield,    text: 'امنیت کامل' },
            { icon: TrendingUp, text: 'بروزرسانی مداوم' },
            { icon: Star,      text: 'پشتیبانی فارسی' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-xs text-white/30">
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
    <footer id="footer" className="relative bg-[#030810] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-5 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#6366f1] flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg">Xennic</span>
            </div>
            <p className="text-sm text-white/35 leading-relaxed max-w-xs">
              پلتفرم تخصصی محاسبات مهندسی برق، کیفیت توان و انرژی‌های تجدیدپذیر
              با استانداردهای IEC و IEEE
            </p>
            <div className="flex items-center gap-2 text-xs text-white/20 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              سیستم آنلاین و پایدار
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">محصول</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'ویژگی‌ها', href: '#features' },
                { label: 'پلن‌ها',   href: '#pricing' },
                { label: 'محاسبات', href: `/${locale}/register` },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="text-sm text-white/35 hover:text-white/70 transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">حساب</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'ورود',     href: `/${locale}/login` },
                { label: 'ثبت‌نام', href: `/${locale}/register` },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="text-sm text-white/35 hover:text-white/70 transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8 border-t border-white/5">
          <p className="text-xs text-white/20">
            © ۱۴۰۴ Xennic — تمام حقوق محفوظ است
          </p>
          <p className="text-xs text-white/15 font-mono">
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
    <div dir="rtl" className="min-h-screen bg-[#050b14] font-sans">
      <Navbar locale={locale} />
      <HeroSection locale={locale} />
      <FeaturesSection />
      <StatsSection />
      <CalculatorPreview />
      <PricingSection locale={locale} />
      <CTASection locale={locale} />
      <Footer locale={locale} />
    </div>
  );
}
