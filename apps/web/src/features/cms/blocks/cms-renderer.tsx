'use client';

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
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CmsBlock, CmsDocument } from '../lib/types';

/* ──────────────────────────────────────────────────────────────
 *  CMS Renderer — رندر بلوک‌های قابل ویرایش
 *  ──────────────────────────────────────────────────────────────
 * هر بلوک از document.blocks به یک کامپوننت رندر می‌شود.
 * کامپوننت‌ها data-driven هستند و از props مقادیر را می‌خوانند.
 * برای افزودن نوع بلوک جدید کافی است به BLOCK_REGISTRY اضافه شود.
 * ──────────────────────────────────────────────────────────── */

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
};

function iconOf(name?: string): LucideIcon | null {
  if (!name) return null;
  return ICONS[name] ?? null;
}

/* ── Basic blocks ───────────────────────────────────────────── */

function Heading({ id, props, children }: RenderProps) {
  const Tag = (props.as as any) ?? 'h2';
  const align = (props.align as 'center' | 'right' | 'left') ?? 'center';
  return (
    <Tag
      id={id}
      className={cn(
        'font-bold tracking-tight text-[hsl(var(--foreground))]',
        props.size === 'lg' ? 'text-4xl md:text-5xl' : 'text-2xl md:text-3xl',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        align === 'left' && 'text-left',
        (props.className as string) ?? '',
      )}
      style={(props.style as React.CSSProperties) ?? undefined}
    >
      {props.text as React.ReactNode}
      {children}
    </Tag>
  );
}

function Paragraph({ id, props, children }: RenderProps) {
  const align = (props.align as 'center' | 'right' | 'left') ?? 'center';
  return (
    <p
      id={id}
      className={cn(
        'text-base md:text-lg leading-8 text-[hsl(var(--muted-foreground))]',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        align === 'left' && 'text-left',
      )}
      style={(props.style as React.CSSProperties) ?? undefined}
    >
      {props.text as React.ReactNode}
      {children}
    </p>
  );
}

function RichText({ id, props }: RenderProps) {
  return (
    <div
      id={id}
      className="prose prose-invert max-w-none text-[hsl(var(--muted-foreground))]"
      dangerouslySetInnerHTML={{ __html: (props.html as string) ?? '' }}
    />
  );
}

function ButtonBlock({ props }: RenderProps) {
  const label = (props.label as string) ?? '';
  const href = (props.href as string) ?? '#';
  const external = (props.external as boolean) ?? false;
  const variant = (props.variant as 'primary' | 'ghost' | 'outline') ?? 'primary';
  const cls = cn(
    'inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all',
    variant === 'primary' &&
      'bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white shadow-lg shadow-[hsl(var(--primary)/0.25)] hover:shadow-[hsl(var(--primary)/0.4)]',
    variant === 'ghost' &&
      'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]',
    variant === 'outline' &&
      'border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]',
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {label}
      {props.showArrow ? <ArrowRight className="h-4 w-4" /> : null}
    </Link>
  );
}

function Buttons({ children }: RenderProps) {
  return <div className="flex flex-wrap items-center justify-center gap-3">{children}</div>;
}

function ImageBlock({ props }: RenderProps) {
  const src = (props.src as string) ?? '';
  const alt = (props.alt as string) ?? '';
  const ratio = (props.ratio as string) ?? '16/9';
  if (!src) return null;
  return (
    <figure
      className="relative overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))]"
      style={{ aspectRatio: ratio }}
    >
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </figure>
  );
}

function Spacer({ props }: RenderProps) {
  const size = (props.size as 'sm' | 'md' | 'lg') ?? 'md';
  return (
    <div className={cn(size === 'sm' && 'h-4', size === 'md' && 'h-10', size === 'lg' && 'h-20')} />
  );
}

function Divider() {
  return <hr className="border-[hsl(var(--border))]" />;
}

function Columns({ children, props }: RenderProps) {
  const cols = Number(props.cols ?? 3);
  return (
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
  );
}

function Column({ children, props }: RenderProps) {
  return (
    <div className="space-y-4" style={(props.style as React.CSSProperties) ?? undefined}>
      {children}
    </div>
  );
}

function FooterColumn({ children, props }: RenderProps) {
  return (
    <div className="space-y-4">
      {props.title ? (
        <h4 className="text-sm font-bold text-[hsl(var(--foreground))]">{props.title as string}</h4>
      ) : null}
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function NavLinks({ props }: RenderProps) {
  const links = Array.isArray(props.links)
    ? (props.links as { label: string; href: string }[])
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

/* ── Composed sections ──────────────────────────────────────── */

function Hero({ props, children }: RenderProps) {
  const eyebrow = props.eyebrow as string | undefined;
  const title = props.title as string | undefined;
  const subtitle = props.subtitle as string | undefined;
  const bgImage = props.bgImage as string | undefined;
  return (
    <section className="relative isolate overflow-hidden pt-28 pb-20 md:pt-36 md:pb-32">
      {bgImage ? (
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      ) : (
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.18),transparent_60%)]" />
      )}
      <div className="mx-auto max-w-5xl px-6 text-center space-y-6">
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

function Features({ children, props }: RenderProps) {
  return (
    <section
      id={props.id as string | undefined}
      className="mx-auto max-w-7xl px-6 py-20 space-y-12"
    >
      {props.title ? (
        <h2 className="text-3xl md:text-4xl font-bold text-center">{props.title as string}</h2>
      ) : null}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

function Feature({ props }: RenderProps) {
  const Icon = iconOf(props.icon as string);
  const color = (props.color as string) ?? 'from-[hsl(var(--primary))] to-[hsl(var(--accent))]';
  return (
    <div className="group relative rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 transition-all hover:-translate-y-1 hover:shadow-xl">
      <div
        className={cn(
          'mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg',
          color,
        )}
      >
        {Icon ? <Icon className="h-6 w-6" /> : <Zap className="h-6 w-6" />}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-[hsl(var(--foreground))]">
        {props.title as string}
      </h3>
      <p className="text-sm leading-7 text-[hsl(var(--muted-foreground))]">
        {props.desc as string}
      </p>
      {Array.isArray(props.tags) && (props.tags as string[]).length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {(props.tags as string[]).map((t) => (
            <span
              key={t}
              className="rounded-full border border-[hsl(var(--border))] px-2.5 py-0.5 text-xs text-[hsl(var(--muted-foreground))]"
            >
              {t}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Pricing({ children, props }: RenderProps) {
  return (
    <section
      id={props.id as string | undefined}
      className="mx-auto max-w-7xl px-6 py-20 space-y-12"
    >
      {props.title ? (
        <h2 className="text-3xl md:text-4xl font-bold text-center">{props.title as string}</h2>
      ) : null}
      <div className="grid gap-6 md:grid-cols-3 items-start">{children}</div>
    </section>
  );
}

function PricingPlan({ props, children }: RenderProps) {
  const features = Array.isArray(props.features) ? (props.features as string[]) : [];
  const highlighted = props.highlighted as boolean | undefined;
  return (
    <div
      className={cn(
        'relative rounded-2xl border bg-[hsl(var(--card))] p-8 transition-all',
        highlighted
          ? 'border-[hsl(var(--primary))/0.5] shadow-2xl shadow-[hsl(var(--primary)/0.15)]'
          : 'border-[hsl(var(--border))]',
      )}
    >
      {props.badge ? (
        <span className="absolute -top-3 right-6 rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] px-3 py-1 text-xs font-bold text-white">
          {props.badge as string}
        </span>
      ) : null}
      <h3 className="text-xl font-bold">{props.name as string}</h3>
      <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{props.desc as string}</p>
      <div className="my-6 flex items-baseline gap-2">
        <span className="text-4xl font-extrabold">{props.price as string}</span>
        <span className="text-sm text-[hsl(var(--muted-foreground))]">
          {props.period as string}
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
    </div>
  );
}

function Cta({ props, children }: RenderProps) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] p-10 md:p-16 text-center text-white">
        <h2 className="text-3xl md:text-4xl font-extrabold">{props.title as string}</h2>
        {props.subtitle ? (
          <p className="mt-4 max-w-2xl mx-auto text-white/85">{props.subtitle as string}</p>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}

function Faq({ children, props }: RenderProps) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20 space-y-8">
      {props.title ? (
        <h2 className="text-3xl md:text-4xl font-bold text-center">{props.title as string}</h2>
      ) : null}
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function FaqItem({ props }: RenderProps) {
  return (
    <details className="group rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
      <summary className="cursor-pointer list-none flex items-center justify-between font-semibold">
        {props.question as string}
        <span className="text-[hsl(var(--muted-foreground))] transition group-open:rotate-180">
          ▾
        </span>
      </summary>
      <p className="mt-3 text-sm leading-7 text-[hsl(var(--muted-foreground))]">
        {props.answer as string}
      </p>
    </details>
  );
}

function Contact({ props }: RenderProps) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <div className="grid gap-8 md:grid-cols-3">
        {(
          [
            { icon: Mail, label: 'ایمیل', value: props.email ?? '' },
            { icon: Phone, label: 'تلفن', value: props.phone ?? '' },
            { icon: MapPin, label: 'نشانی', value: props.address ?? '' },
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

function Stats({ props }: RenderProps) {
  const items = Array.isArray(props.items)
    ? (props.items as { value: string; label: string }[])
    : [];
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-3xl md:text-4xl font-extrabold text-[hsl(var(--primary))]">
              {s.value}
            </div>
            <div className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonials({ children, props }: RenderProps) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 space-y-12">
      {props.title ? (
        <h2 className="text-3xl md:text-4xl font-bold text-center">{props.title as string}</h2>
      ) : null}
      <div className="grid gap-6 md:grid-cols-3">{children}</div>
    </section>
  );
}

function Testimonial({ props }: RenderProps) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-4">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              'h-4 w-4',
              i < Number(props.rating ?? 5)
                ? 'fill-amber-400 text-amber-400'
                : 'text-[hsl(var(--border))]',
            )}
          />
        ))}
      </div>
      <p className="text-sm leading-7 text-[hsl(var(--muted-foreground))]">
        {props.quote as string}
      </p>
      <div className="text-sm font-semibold">
        {props.author as string}
        {props.role ? (
          <span className="font-normal text-[hsl(var(--muted-foreground))]">
            {' '}
            — {props.role as string}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function HtmlBlock({ props }: RenderProps) {
  return <div dangerouslySetInnerHTML={{ __html: (props.html as string) ?? '' }} />;
}

/* ── Registry ───────────────────────────────────────────────── */

type RenderProps = {
  id?: string;
  props: Record<string, unknown>;
  children?: React.ReactNode;
};

const BLOCK_REGISTRY: Record<string, React.ComponentType<RenderProps>> = {
  heading: Heading,
  paragraph: Paragraph,
  'rich-text': RichText,
  button: ButtonBlock,
  buttons: Buttons,
  image: ImageBlock,
  spacer: Spacer,
  divider: Divider,
  columns: Columns,
  column: Column,
  'footer-column': FooterColumn,
  'nav-links': NavLinks,
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
  testimonials: Testimonials,
  testimonial: Testimonial,
  html: HtmlBlock,
};

export function BlockRenderer({ block }: { block: CmsBlock }) {
  const Component = BLOCK_REGISTRY[block.type];
  if (!Component) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[CMS] Unknown block type: ${block.type}`);
    }
    return null;
  }
  const children = block.children?.map((child) => <BlockRenderer key={child.id} block={child} />);
  return (
    <Component id={block.id} props={block.props ?? {}}>
      {children}
    </Component>
  );
}

export function CmsDocumentRenderer({ document }: { document?: CmsDocument | null }) {
  if (!document?.blocks?.length) return null;
  return (
    <div className="cms-document" data-version={document.meta?.version}>
      {document.blocks.map((b) => (
        <BlockRenderer key={b.id} block={b} />
      ))}
    </div>
  );
}
