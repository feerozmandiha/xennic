'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Zap,
  Shield,
  Globe,
  Cpu,
  Layers,
  BarChart3,
  FlaskConical,
  CheckCircle2,
  ArrowRight,
  Star,
  Mail,
  Phone,
  MapPin,
  Send,
  Quote,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Play,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { containerStyleProps, styleToClasses } from '../lib/styles';
import type { CmsBlock, CmsDocument } from '../lib/types';

/* ──────────────────────────────────────────────────────────────
 *  CMS Renderer v2 — رندرر بلوکی با پشتیبانی از استایل هر بلوک
 *  ──────────────────────────────────────────────────────────── */

const ICONS: Record<string, LucideIcon> = {
  zap: Zap,
  shield: Shield,
  globe: Globe,
  cpu: Cpu,
  layers: Layers,
  barChart3: BarChart3,
  flask: FlaskConical,
  check: CheckCircle2,
  star: Star,
  mail: Mail,
  phone: Phone,
  pin: MapPin,
  arrowRight: ArrowRight,
  send: Send,
  quote: Quote,
  alert: AlertTriangle,
  info: Info,
  success: CheckCircle,
  error: XCircle,
  play: Play,
};

function iconOf(name?: string): LucideIcon | null {
  if (!name) return null;
  return ICONS[name] ?? null;
}

/* ── shared components ──────────────────────────────────────── */

function AuthBrand({ block }: RenderProps) {
  const title = block.props.title as string | undefined;
  const subtitle = block.props.subtitle as string | undefined;
  const bullets = Array.isArray(block.props.bullets) ? (block.props.bullets as string[]) : [];
  const image = block.props.image as string | undefined;
  return (
    <div className="space-y-6 text-white">
      {title ? (
        <h2 className="whitespace-pre-line text-3xl font-black leading-snug">{title}</h2>
      ) : null}
      {subtitle ? <p className="leading-8 text-white/80">{subtitle}</p> : null}
      {bullets.length ? (
        <ul className="space-y-3 text-sm text-white/90">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">
                ✓
              </span>
              {b}
            </li>
          ))}
        </ul>
      ) : null}
      {image ? (
        <img
          src={image}
          alt=""
          className="mt-4 w-full rounded-2xl border border-white/10 object-cover"
        />
      ) : null}
    </div>
  );
}

function BlockShell({
  block,
  className,
  children,
  as: Tag = 'div',
}: {
  block?: CmsBlock;
  className?: string;
  children?: React.ReactNode;
  as?: any;
}) {
  const s = block?.style;
  const props = containerStyleProps(s);
  return (
    <Tag
      id={block?.id}
      className={cn(props.className, className)}
      style={props.style}
      data-block={block?.type}
    >
      {children}
    </Tag>
  );
}

/* ── Basic: Heading / Paragraph / RichText ──────────────────── */

function Heading({ block, children }: RenderProps) {
  const Tag = (block.props.as as any) ?? 'h2';
  return (
    <BlockShell block={block} as={Tag}>
      {block.props.text as React.ReactNode}
      {children}
    </BlockShell>
  );
}

function Paragraph({ block, children }: RenderProps) {
  return (
    <BlockShell block={block} as="p">
      {block.props.text as React.ReactNode}
      {children}
    </BlockShell>
  );
}

function RichText({ block }: RenderProps) {
  return (
    <BlockShell block={block} as="div">
      <div
        className="prose prose-invert max-w-none cms-rich-text"
        dangerouslySetInnerHTML={{ __html: (block.props.html as string) ?? '' }}
      />
    </BlockShell>
  );
}

/* ── Buttons ───────────────────────────────────────────────── */

function ButtonBlock({ block }: RenderProps) {
  const label = (block.props.label as string) ?? '';
  const href = (block.props.href as string) ?? '#';
  const external = (block.props.external as boolean) ?? false;
  const variant = (block.props.variant as 'primary' | 'ghost' | 'outline') ?? 'primary';
  const size = (block.props.size as 'sm' | 'md' | 'lg') ?? 'md';

  const cls = cn(
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all whitespace-nowrap',
    size === 'sm' && 'px-4 py-2 text-xs',
    size === 'md' && 'px-6 py-3 text-sm',
    size === 'lg' && 'px-8 py-4 text-base',
    variant === 'primary' &&
      'bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white shadow-lg shadow-[hsl(var(--primary)/0.25)] hover:shadow-[hsl(var(--primary)/0.4)]',
    variant === 'ghost' &&
      'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]',
    variant === 'outline' &&
      'border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]',
  );

  const content = (
    <>
      {label}
      {block.props.showArrow ? <ArrowRight className="h-4 w-4" /> : null}
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {content}
    </Link>
  );
}

function Branding({ block }: RenderProps) {
  const name = (block.props.name as string) ?? 'Xennic';
  const href = (block.props.href as string) ?? '/';
  const logoLight = block.props.logoLight as string | undefined;
  const logoDark = block.props.logoDark as string | undefined;
  const logo = block.props.logo as string | undefined;
  const tagline = block.props.tagline as string | undefined;
  const showShape = (block.props.showShape as boolean) ?? true;

  const logoSrc = logo ?? logoLight;

  return (
    <BlockShell block={block}>
      <Link href={href} className="flex shrink-0 items-center gap-2.5">
        {logoSrc ? (
          <>
            <img
              src={logoSrc}
              alt={name}
              data-logo-dark={logoDark ? 'true' : undefined}
              className={cn('h-9 w-auto object-contain', logoDark && 'dark:hidden')}
            />
            {logoDark ? (
              <img
                src={logoDark}
                alt={name}
                className="hidden h-9 w-auto object-contain dark:block"
              />
            ) : null}
          </>
        ) : (
          <>
            {showShape ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] shadow-[0_0_16px_hsl(var(--primary)/0.3)]">
                <Zap className="h-4 w-4 text-white" />
              </div>
            ) : null}
            <span className="text-lg font-bold tracking-wide text-[hsl(var(--foreground))]">
              {name}
            </span>
            {tagline ? (
              <span className="hidden text-[10px] text-[hsl(var(--muted-foreground))] md:inline">
                {tagline}
              </span>
            ) : null}
          </>
        )}
      </Link>
    </BlockShell>
  );
}

function Buttons({ block, children }: RenderProps) {
  const justify = (block.props.justify as 'start' | 'center' | 'end') ?? 'center';
  return (
    <BlockShell
      block={block}
      className={cn(
        'flex flex-wrap gap-3',
        justify === 'center' && 'justify-center',
        justify === 'start' && 'justify-start',
        justify === 'end' && 'justify-end',
      )}
    >
      {children}
    </BlockShell>
  );
}

/* ── Media: Image / Video / Gallery ────────────────────────── */

function ImageBlock({ block }: RenderProps) {
  const src = (block.props.src as string) ?? '';
  const alt = (block.props.alt as string) ?? '';
  const ratio = (block.props.ratio as string) ?? '16/9';
  if (!src) return null;
  return (
    <BlockShell block={block} as="figure" className="overflow-hidden">
      <div style={{ aspectRatio: ratio }}>
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      </div>
      {block.props.caption ? (
        <figcaption className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
          {block.props.caption as string}
        </figcaption>
      ) : null}
    </BlockShell>
  );
}

function VideoBlock({ block }: RenderProps) {
  const src = block.props.src as string;
  const poster = block.props.poster as string | undefined;
  if (!src) return null;
  const isYouTube = src.includes('youtube.com') || src.includes('youtu.be');
  return (
    <BlockShell block={block} as="figure" className="overflow-hidden">
      <div className="aspect-video w-full">
        {isYouTube ? (
          <iframe
            src={toEmbedUrl(src)}
            title={block.props.title as string}
            className="h-full w-full"
            allowFullScreen
          />
        ) : (
          <video src={src} poster={poster} controls className="h-full w-full" playsInline />
        )}
      </div>
    </BlockShell>
  );
}

function toEmbedUrl(url: string): string {
  const ytId = url.match(/(?:youtu\.be\/|v=)([A-Za-z0-9_-]{11})/);
  if (ytId) return `https://www.youtube.com/embed/${ytId[1]}`;
  return url;
}

function Gallery({ block, children }: RenderProps) {
  const cols = Number(block.props.cols ?? 3);
  return (
    <BlockShell
      block={block}
      className={cn(
        'grid gap-3',
        cols === 2 && 'sm:grid-cols-2',
        cols === 3 && 'sm:grid-cols-2 lg:grid-cols-3',
        cols === 4 && 'sm:grid-cols-2 lg:grid-cols-4',
      )}
    >
      {children}
    </BlockShell>
  );
}

/* ── Layout: Columns / Column / Spacer / Divider ───────────── */

function Columns({ block, children }: RenderProps) {
  const cols = Number(block.props.cols ?? 3);
  const gap = (block.props.gap as 'sm' | 'md' | 'lg') ?? 'md';
  return (
    <BlockShell
      block={block}
      className={cn(
        'grid',
        gap === 'sm' && 'gap-3',
        gap === 'md' && 'gap-6',
        gap === 'lg' && 'gap-10',
        cols === 2 && 'md:grid-cols-2',
        cols === 3 && 'md:grid-cols-3',
        cols === 4 && 'md:grid-cols-2 lg:grid-cols-4',
      )}
    >
      {children}
    </BlockShell>
  );
}

function Column({ block, children }: RenderProps) {
  const span = block.props.span as number | undefined;
  return (
    <BlockShell block={block} className={cn('space-y-4', span && `md:col-span-${span}`)}>
      {children}
    </BlockShell>
  );
}

function Spacer({ block }: RenderProps) {
  const size = (block.props.size as 'sm' | 'md' | 'lg') ?? 'md';
  return (
    <div
      aria-hidden
      className={cn(size === 'sm' && 'h-4', size === 'md' && 'h-10', size === 'lg' && 'h-20')}
    />
  );
}

function Divider({ block }: RenderProps) {
  return <BlockShell block={block} as="hr" className="border-[hsl(var(--border))]" />;
}

/* ── Composed: Hero / Features / Pricing / CTA / FAQ / ... ──── */

function Hero({ block, children }: RenderProps) {
  const eyebrow = block.props.eyebrow as string | undefined;
  const title = block.props.title as string | undefined;
  const subtitle = block.props.subtitle as string | undefined;
  const bgImage = block.props.bgImage as string | undefined;

  const backgroundStyle: React.CSSProperties = {};
  if (bgImage) {
    backgroundStyle.backgroundImage = `linear-gradient(hsl(var(--background)/0.6), hsl(var(--background)/0.85)), url(${bgImage})`;
    backgroundStyle.backgroundSize = 'cover';
    backgroundStyle.backgroundPosition = 'center';
  }

  return (
    <section
      className={cn(
        'relative isolate overflow-hidden pt-28 pb-20 md:pt-36 md:pb-32',
        styleToClasses({ ...block.style, paddingX: block.style?.paddingX ?? 'md' }),
      )}
      style={backgroundStyle}
    >
      {!bgImage ? (
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.18),transparent_60%)]" />
      ) : null}
      <div className="mx-auto max-w-5xl space-y-6 text-center">
        {eyebrow ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--secondary))/60] px-4 py-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))]">
            <Zap className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
            {eyebrow}
          </span>
        ) : null}
        {title ? (
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-[hsl(var(--foreground))]">
            {title}
          </h1>
        ) : null}
        {subtitle ? (
          <p className="mx-auto max-w-2xl text-lg text-[hsl(var(--muted-foreground))]">
            {subtitle}
          </p>
        ) : null}
        {children ? <div className="pt-2">{children}</div> : null}
      </div>
    </section>
  );
}

function Features({ block, children }: RenderProps) {
  return (
    <SectionShell
      block={block}
      title={block.props.title as string}
      subtitle={block.props.subtitle as string}
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </SectionShell>
  );
}

function Feature({ block }: RenderProps) {
  const Icon = iconOf(block.props.icon as string);
  const color =
    (block.props.color as string) ?? 'from-[hsl(var(--primary))] to-[hsl(var(--accent))]';
  return (
    <BlockShell
      block={block}
      className="group relative rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 transition-all hover:-translate-y-1 hover:shadow-xl"
    >
      <div
        className={cn(
          'mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg',
          color,
        )}
      >
        {Icon ? <Icon className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-[hsl(var(--foreground))]">
        {block.props.title as string}
      </h3>
      <p className="text-sm leading-7 text-[hsl(var(--muted-foreground))]">
        {block.props.desc as string}
      </p>
      {Array.isArray(block.props.tags) && (block.props.tags as string[]).length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {(block.props.tags as string[]).map((t) => (
            <span
              key={t}
              className="rounded-full border border-[hsl(var(--border))] px-2.5 py-0.5 text-xs text-[hsl(var(--muted-foreground))]"
            >
              {t}
            </span>
          ))}
        </div>
      ) : null}
    </BlockShell>
  );
}

function Pricing({ block, children }: RenderProps) {
  return (
    <SectionShell
      block={block}
      title={block.props.title as string}
      subtitle={block.props.subtitle as string}
    >
      <div className="grid gap-6 md:grid-cols-3 items-start">{children}</div>
    </SectionShell>
  );
}

function PricingPlan({ block, children }: RenderProps) {
  const features = Array.isArray(block.props.features) ? (block.props.features as string[]) : [];
  const highlighted = block.props.highlighted as boolean | undefined;
  return (
    <BlockShell
      block={block}
      className={cn(
        'relative rounded-2xl border bg-[hsl(var(--card))] p-8 transition-all',
        highlighted
          ? 'border-[hsl(var(--primary))/0.5] shadow-2xl shadow-[hsl(var(--primary)/0.15)] md:scale-105'
          : 'border-[hsl(var(--border))]',
      )}
    >
      {block.props.badge ? (
        <span className="absolute -top-3 right-6 rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] px-3 py-1 text-xs font-bold text-white">
          {block.props.badge as string}
        </span>
      ) : null}
      <h3 className="text-xl font-bold">{block.props.name as string}</h3>
      <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
        {block.props.desc as string}
      </p>
      <div className="my-6 flex items-baseline gap-2">
        <span className="text-4xl font-extrabold">{block.props.price as string}</span>
        <span className="text-sm text-[hsl(var(--muted-foreground))]">
          {block.props.period as string}
        </span>
      </div>
      <ul className="mb-6 space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--primary))]" />
            <span className="text-[hsl(var(--muted-foreground))]">{f}</span>
          </li>
        ))}
      </ul>
      {children}
    </BlockShell>
  );
}

function Cta({ block, children }: RenderProps) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] p-10 md:p-16 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-extrabold">{block.props.title as string}</h2>
        {block.props.subtitle ? (
          <p className="mt-4 max-w-2xl mx-auto text-white/85">{block.props.subtitle as string}</p>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}

function Faq({ block, children }: RenderProps) {
  return (
    <SectionShell block={block} title={block.props.title as string} className="max-w-3xl">
      <div className="space-y-3">{children}</div>
    </SectionShell>
  );
}

function FaqItem({ block }: RenderProps) {
  return (
    <BlockShell
      block={block}
      as="details"
      className="group rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"
    >
      <summary className="cursor-pointer list-none flex items-center justify-between font-semibold">
        {block.props.question as string}
        <span className="text-[hsl(var(--muted-foreground))] transition group-open:rotate-180">
          ▾
        </span>
      </summary>
      <p className="mt-3 text-sm leading-7 text-[hsl(var(--muted-foreground))]">
        {block.props.answer as string}
      </p>
    </BlockShell>
  );
}

function Contact({ block }: RenderProps) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <div className="grid gap-8 md:grid-cols-3">
        {(
          [
            { icon: Mail, label: 'ایمیل', value: block.props.email ?? '' },
            { icon: Phone, label: 'تلفن', value: block.props.phone ?? '' },
            { icon: MapPin, label: 'نشانی', value: block.props.address ?? '' },
          ] as const
        ).map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-[hsl(var(--border))] p-6 text-center"
          >
            <c.icon className="mx-auto mb-3 h-6 w-6 text-[hsl(var(--primary))]" />
            <div className="text-sm text-[hsl(var(--muted-foreground))]">{c.label}</div>
            <div className="mt-1 font-medium">{c.value as string}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Stats({ block, children }: RenderProps) {
  return (
    <BlockShell block={block} className="mx-auto max-w-6xl py-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">{children}</div>
    </BlockShell>
  );
}

function Stat({ block }: RenderProps) {
  return (
    <BlockShell block={block} className="text-center">
      <div className="text-3xl md:text-4xl font-extrabold text-[hsl(var(--primary))]">
        {block.props.value as string}
      </div>
      <div className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
        {block.props.label as string}
      </div>
    </BlockShell>
  );
}

function Testimonials({ block, children }: RenderProps) {
  return (
    <SectionShell block={block} title={block.props.title as string}>
      <div className="grid gap-6 md:grid-cols-3">{children}</div>
    </SectionShell>
  );
}

function Testimonial({ block }: RenderProps) {
  return (
    <BlockShell
      block={block}
      className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-4"
    >
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              'h-4 w-4',
              i < Number(block.props.rating ?? 5)
                ? 'fill-amber-400 text-amber-400'
                : 'text-[hsl(var(--border))]',
            )}
          />
        ))}
      </div>
      <p className="text-sm leading-7 text-[hsl(var(--muted-foreground))]">
        {block.props.quote as string}
      </p>
      <div className="text-sm font-semibold">
        {block.props.author as string}
        {block.props.role ? (
          <span className="font-normal text-[hsl(var(--muted-foreground))]">
            {' '}
            — {block.props.role as string}
          </span>
        ) : null}
      </div>
    </BlockShell>
  );
}

/* ── New blocks: articles / logos / cards / steps / ... ────── */

function Articles({ block, children }: RenderProps) {
  return (
    <SectionShell block={block} title={block.props.title as string}>
      <div className="grid gap-6 md:grid-cols-3">{children}</div>
    </SectionShell>
  );
}

function Article({ block }: RenderProps) {
  return (
    <BlockShell
      block={block}
      as="article"
      className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]"
    >
      {block.props.image ? (
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={block.props.image as string}
            alt={block.props.title as string}
            className="h-full w-full object-cover transition hover:scale-105"
          />
        </div>
      ) : null}
      <div className="p-5 space-y-2">
        {block.props.category ? (
          <span className="text-xs font-medium text-[hsl(var(--primary))]">
            {block.props.category as string}
          </span>
        ) : null}
        <h3 className="font-bold">{block.props.title as string}</h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-3">
          {block.props.excerpt as string}
        </p>
        {block.props.href ? (
          <Link
            href={block.props.href as string}
            className="inline-flex items-center gap-1 text-sm font-medium text-[hsl(var(--primary))] pt-2"
          >
            ادامه مطلب <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>
    </BlockShell>
  );
}

function Logos({ block, children }: RenderProps) {
  return (
    <SectionShell block={block} title={block.props.title as string}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 items-center">
        {children}
      </div>
    </SectionShell>
  );
}

function Logo({ block }: RenderProps) {
  const src = block.props.src as string | undefined;
  const name = block.props.name as string | undefined;
  return (
    <BlockShell
      block={block}
      className="flex items-center justify-center p-4 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition"
    >
      {src ? (
        <img src={src} alt={name ?? ''} className="max-h-10 object-contain" />
      ) : (
        <span className="text-sm font-bold">{name}</span>
      )}
    </BlockShell>
  );
}

function Cards({ block, children }: RenderProps) {
  const cols = Number(block.props.cols ?? 3);
  return (
    <SectionShell block={block} title={block.props.title as string}>
      <div
        className={cn(
          'grid gap-6',
          cols === 2 && 'md:grid-cols-2',
          cols === 3 && 'md:grid-cols-3',
          cols === 4 && 'md:grid-cols-2 lg:grid-cols-4',
        )}
      >
        {children}
      </div>
    </SectionShell>
  );
}

function Card({ block, children }: RenderProps) {
  return (
    <BlockShell
      block={block}
      className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-3 h-full"
    >
      {block.props.icon ? (
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
          {(() => {
            const I = iconOf(block.props.icon as string);
            return I ? <I className="h-5 w-5" /> : null;
          })()}
        </div>
      ) : null}
      {block.props.title ? (
        <h3 className="font-bold text-lg">{block.props.title as string}</h3>
      ) : null}
      {block.props.text ? (
        <p className="text-sm text-[hsl(var(--muted-foreground))] leading-7">
          {block.props.text as string}
        </p>
      ) : null}
      {children}
    </BlockShell>
  );
}

function Steps({ block, children }: RenderProps) {
  return (
    <SectionShell block={block} title={block.props.title as string}>
      <div className="grid gap-6 md:grid-cols-3">{children}</div>
    </SectionShell>
  );
}

function Step({ block }: RenderProps) {
  const n = Number(block.props.number ?? 0);
  return (
    <BlockShell
      block={block}
      className="relative rounded-2xl border border-[hsl(var(--border))] p-6 bg-[hsl(var(--card))]"
    >
      <div className="absolute -top-4 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white font-bold shadow-lg">
        {n}
      </div>
      <h3 className="mt-4 font-bold">{block.props.title as string}</h3>
      <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))] leading-7">
        {block.props.text as string}
      </p>
    </BlockShell>
  );
}

function QuoteBlock({ block }: RenderProps) {
  return (
    <BlockShell
      block={block}
      as="blockquote"
      className="relative rounded-2xl border-r-4 border-[hsl(var(--primary))] bg-[hsl(var(--card))] p-6 md:p-8"
    >
      <Quote className="h-6 w-6 text-[hsl(var(--primary))]/40 mb-3" />
      <p className="text-lg leading-9 italic">{block.props.text as string}</p>
      {block.props.author ? (
        <footer className="mt-4 text-sm font-semibold text-[hsl(var(--muted-foreground))]">
          — {block.props.author as string}
        </footer>
      ) : null}
    </BlockShell>
  );
}

function CodeBlock({ block }: RenderProps) {
  return (
    <BlockShell
      block={block}
      as="pre"
      className="rounded-2xl bg-[hsl(var(--secondary))] p-5 overflow-x-auto text-sm font-mono leading-7"
    >
      <code>{block.props.code as string}</code>
    </BlockShell>
  );
}

function Alert({ block }: RenderProps) {
  const kind = (block.props.kind as 'info' | 'success' | 'warning' | 'error') ?? 'info';
  const map = {
    info: { icon: Info, cls: 'border-sky-500/40 bg-sky-500/10 text-sky-700' },
    success: { icon: CheckCircle, cls: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700' },
    warning: { icon: AlertTriangle, cls: 'border-amber-500/40 bg-amber-500/10 text-amber-700' },
    error: { icon: XCircle, cls: 'border-red-500/40 bg-red-500/10 text-red-700' },
  } as const;
  const { icon: Icon, cls } = map[kind];
  return (
    <BlockShell block={block} className={cn('flex gap-3 rounded-xl border p-4', cls)}>
      <Icon className="h-5 w-5 shrink-0" />
      <div className="text-sm leading-7">{block.props.text as string}</div>
    </BlockShell>
  );
}

function Newsletter({ block }: RenderProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'ok' | 'err'>('idle');

  return (
    <BlockShell
      block={block}
      className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 space-y-4 text-center"
    >
      <h3 className="text-xl font-bold">{block.props.title as string}</h3>
      {block.props.subtitle ? (
        <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-xl mx-auto">
          {block.props.subtitle as string}
        </p>
      ) : null}
      <form
        className="mx-auto flex max-w-md flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setStatus('err');
            return;
          }
          setStatus('ok');
        }}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ایمیل شما"
          className="flex-1 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-2.5 text-sm outline-none focus:border-[hsl(var(--primary))]"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] px-5 py-2.5 text-sm font-semibold text-white"
        >
          <Send className="h-4 w-4" /> عضویت
        </button>
      </form>
      {status === 'ok' ? <p className="text-xs text-emerald-600">✓ با موفقیت ثبت شد</p> : null}
      {status === 'err' ? <p className="text-xs text-red-600">ایمیل نامعتبر است</p> : null}
    </BlockShell>
  );
}

function Countdown({ block }: RenderProps) {
  const target = new Date(block.props.target as string).getTime();
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    if (Number.isNaN(target)) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [target]);
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  const secs = Math.floor((diff % 60_000) / 1000);
  return (
    <BlockShell block={block} className="text-center space-y-4">
      {block.props.title ? (
        <h3 className="text-lg font-bold">{block.props.title as string}</h3>
      ) : null}
      <div className="flex justify-center gap-3" dir="ltr">
        {[
          { v: days, l: 'روز' },
          { v: hours, l: 'ساعت' },
          { v: mins, l: 'دقیقه' },
          { v: secs, l: 'ثانیه' },
        ].map((x) => (
          <div
            key={x.l}
            className="min-w-[72px] rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3"
          >
            <div className="text-3xl font-extrabold tabular-nums">{x.v}</div>
            <div className="text-[10px] text-[hsl(var(--muted-foreground))]">{x.l}</div>
          </div>
        ))}
      </div>
    </BlockShell>
  );
}

function MapBlock({ block }: RenderProps) {
  const src = block.props.embed as string | undefined;
  const address = block.props.address as string | undefined;
  return (
    <BlockShell
      block={block}
      className="overflow-hidden rounded-2xl border border-[hsl(var(--border))]"
    >
      {src ? (
        <iframe
          src={src}
          loading="lazy"
          className="h-72 w-full border-0"
          title={address ?? 'نقشه'}
        />
      ) : address ? (
        <div className="p-6 text-center text-sm text-[hsl(var(--muted-foreground))]">{address}</div>
      ) : null}
    </BlockShell>
  );
}

function HtmlBlock({ block }: RenderProps) {
  return <div dangerouslySetInnerHTML={{ __html: (block.props.html as string) ?? '' }} />;
}

function FooterColumn({ block, children }: RenderProps) {
  return (
    <div className="space-y-4">
      {block.props.title ? (
        <h4 className="text-sm font-bold text-[hsl(var(--foreground))]">
          {block.props.title as string}
        </h4>
      ) : null}
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function NavLinks({ block }: RenderProps) {
  const links = Array.isArray(block.props.links)
    ? (block.props.links as { label: string; href: string }[])
    : [];
  return (
    <ul className="space-y-2">
      {links.map((l) => (
        <li key={l.href}>
          {l.href.startsWith('http') ? (
            <a
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              {l.label}
            </a>
          ) : (
            <Link
              href={l.href}
              className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              {l.label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

function SocialLinks({ children }: RenderProps) {
  return <div className="flex items-center gap-2">{children}</div>;
}

function SocialLink({ block }: RenderProps) {
  const href = block.props.href as string;
  const _label = block.props.label as string;
  const icon = (block.props.icon as string) ?? 'globe';
  const I = iconOf(icon) ?? Globe;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={_label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))] transition"
    >
      <I className="h-4 w-4" />
    </a>
  );
}

/* ── Shared Section wrapper ────────────────────────────────── */

function SectionShell({
  block,
  title,
  subtitle,
  className,
  children,
}: {
  block?: CmsBlock;
  title?: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn('mx-auto px-6 py-20', styleToClasses(block?.style), className)}>
      {title ? (
        <div className="mb-10 max-w-2xl mx-auto text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>
          {subtitle ? <p className="text-[hsl(var(--muted-foreground))]">{subtitle}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

/* ── Registry ──────────────────────────────────────────────── */

type RenderProps = {
  block: CmsBlock;
  children?: React.ReactNode;
};

const BLOCK_REGISTRY: Record<string, React.ComponentType<RenderProps>> = {
  heading: Heading,
  paragraph: Paragraph,
  'rich-text': RichText,
  button: ButtonBlock,
  buttons: Buttons,
  branding: Branding,
  'auth-brand': AuthBrand,
  image: ImageBlock,
  video: VideoBlock,
  gallery: Gallery,
  spacer: Spacer,
  divider: Divider,
  columns: Columns,
  column: Column,
  hero: Hero,
  features: Features,
  feature: Feature,
  pricing: Pricing,
  'pricing-plan': PricingPlan,
  cta: Cta,
  faq: Faq,
  'faq-item': FaqItem,
  contact: Contact,
  stats: Stats,
  stat: Stat,
  testimonials: Testimonials,
  testimonial: Testimonial,
  articles: Articles,
  article: Article,
  logos: Logos,
  logo: Logo,
  cards: Cards,
  card: Card,
  steps: Steps,
  step: Step,
  quote: QuoteBlock,
  code: CodeBlock,
  alert: Alert,
  newsletter: Newsletter,
  countdown: Countdown,
  map: MapBlock,
  html: HtmlBlock,
  'footer-column': FooterColumn,
  'nav-links': NavLinks,
  'social-links': SocialLinks,
  'social-link': SocialLink,
};

export function BlockRenderer({ block }: { block: CmsBlock }) {
  if (block.hidden) return null;
  const Component = BLOCK_REGISTRY[block.type];
  if (!Component) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[CMS] Unknown block type: ${block.type}`);
    }
    return null;
  }
  const children = block.children?.map((child) => <BlockRenderer key={child.id} block={child} />);
  return <Component block={block}>{children}</Component>;
}

export function CmsDocumentRenderer({ document }: { document?: CmsDocument | null }) {
  if (!document?.blocks?.length) return null;
  // Backward compat: v1 docs still render the same
  return (
    <div className="cms-document" data-schema={document.schema}>
      {document.blocks.map((b) => (
        <BlockRenderer key={b.id} block={b} />
      ))}
    </div>
  );
}

export const CMS_BLOCK_TYPES = Object.keys(BLOCK_REGISTRY);
