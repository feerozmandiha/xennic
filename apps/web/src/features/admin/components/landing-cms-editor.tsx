'use client';

import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Save,
  Send,
  RotateCcw,
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
  Loader2,
  Eye,
  Type,
  Layout,
  Sparkles,
  Calculator,
  Grid3x3,
  Megaphone,
  MousePointerClick,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/stores/toast.store';
import { cn } from '@/lib/utils';
import {
  fetchDraftLandingContent,
  publishLandingContent,
  resetLandingContent,
  saveDraftLandingContent,
  uploadLandingAsset,
} from '@/features/landing/lib/landing-api';
import {
  DEFAULT_LANDING_CONTENT,
  mergeLandingContent,
  type CmsImage,
  type LandingContent,
} from '@/features/landing/types/landing-content';

type TabKey =
  | 'branding'
  | 'seo'
  | 'header'
  | 'hero'
  | 'calculations'
  | 'features'
  | 'cta'
  | 'footer';

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'branding', label: 'برندینگ', icon: Sparkles },
  { key: 'seo', label: 'سئو / متادیتا', icon: Type },
  { key: 'header', label: 'هدر', icon: Layout },
  { key: 'hero', label: 'هرو', icon: Eye },
  { key: 'calculations', label: 'محاسبات', icon: Calculator },
  { key: 'features', label: 'ویژگی‌ها', icon: Grid3x3 },
  { key: 'cta', label: 'فراخوان (CTA)', icon: Megaphone },
  { key: 'footer', label: 'فوتر', icon: MousePointerClick },
];

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm outline-none focus:border-[hsl(var(--primary))]';
const labelCls = 'text-xs font-medium block mb-1 text-[hsl(var(--foreground))/0.8]';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={cn(inputCls, 'resize-y')}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputCls}
        />
      )}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-10 h-6 rounded-full transition-colors',
          checked ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--border))]',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all',
            checked ? 'right-0.5' : 'right-4',
          )}
        />
      </button>
    </label>
  );
}

function ImageUpload({
  label,
  value,
  onChange,
  purpose,
}: {
  label: string;
  value?: CmsImage;
  onChange: (img: CmsImage | undefined) => void;
  purpose: string;
}) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const asset = await uploadLandingAsset(file, purpose);
      onChange({ fileId: asset.fileId, url: asset.url, alt: file.name });
      toast.success('تصویر آپلود شد');
    } catch (e: any) {
      toast.error(e?.message ?? 'خطا در آپلود');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-lg border border-dashed border-[hsl(var(--border))] flex items-center justify-center overflow-hidden bg-[hsl(var(--secondary)/0.3)] shrink-0">
          {value?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value.url} alt={value.alt ?? ''} className="w-full h-full object-contain" />
          ) : (
            <ImageIcon className="h-5 w-5 text-[hsl(var(--muted-foreground))/0.4]" />
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="h-9 px-3 inline-flex items-center gap-2 text-xs rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))] disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          آپلود
        </button>
        {value?.url && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="h-9 px-3 inline-flex items-center gap-1 text-xs rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" /> حذف
          </button>
        )}
      </div>
    </div>
  );
}

function LinkListEditor({
  title,
  links,
  onChange,
}: {
  title: string;
  links: { label: string; href: string }[];
  onChange: (links: { label: string; href: string }[]) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className={labelCls}>{title}</label>
        <button
          type="button"
          onClick={() => onChange([...links, { label: 'لینک جدید', href: '/' }])}
          className="text-xs flex items-center gap-1 text-[hsl(var(--primary))]"
        >
          <Plus className="h-3 w-3" /> افزودن
        </button>
      </div>
      <div className="space-y-2">
        {links.map((l, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              value={l.label}
              onChange={(e) => {
                const next = [...links];
                next[i] = { ...l, label: e.target.value };
                onChange(next);
              }}
              placeholder="عنوان"
              className={cn(inputCls, 'flex-1')}
            />
            <input
              value={l.href}
              onChange={(e) => {
                const next = [...links];
                next[i] = { ...l, href: e.target.value };
                onChange(next);
              }}
              placeholder="/path"
              className={cn(inputCls, 'flex-1')}
            />
            <button
              type="button"
              onClick={() => onChange(links.filter((_, idx) => idx !== i))}
              className="text-red-500 p-1.5 hover:bg-red-50 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LandingCmsEditor() {
  const toast = useToast();
  const qc = useQueryClient();
  const [tab, setTab] = useState<TabKey>('branding');
  const [draft, setDraft] = useState<LandingContent | null>(null);
  const [loaded, setLoaded] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'landing', 'draft'],
    queryFn: () => fetchDraftLandingContent('fa'),
  });

  if (!loaded && data?.data?.content) {
    setDraft(mergeLandingContent(data.data.content));
    setLoaded(true);
  }

  const content = draft ?? DEFAULT_LANDING_CONTENT;
  const update = (patch: Partial<LandingContent>) =>
    setDraft((p) => mergeLandingContent({ ...(p ?? DEFAULT_LANDING_CONTENT), ...patch }));

  const save = useMutation({
    mutationFn: () => saveDraftLandingContent(content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'landing'] });
      qc.invalidateQueries({ queryKey: ['landing-cms'] });
      toast.success('پیش‌نویس ذخیره شد');
    },
    onError: (e: any) => toast.error(e?.message ?? 'خطا در ذخیره'),
  });

  const publish = useMutation({
    mutationFn: () => publishLandingContent(true),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'landing'] });
      qc.invalidateQueries({ queryKey: ['landing-cms'] });
      toast.success('محتوا منتشر شد');
    },
    onError: (e: any) => toast.error(e?.message ?? 'خطا در انتشار'),
  });

  const reset = useMutation({
    mutationFn: () => resetLandingContent(),
    onSuccess: (res) => {
      setDraft(mergeLandingContent(res.data));
      qc.invalidateQueries({ queryKey: ['admin', 'landing'] });
      toast.success('به پیش‌فرض بازنشانی شد');
    },
  });

  if (isLoading && !draft) {
    return (
      <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
        <Loader2 className="h-4 w-4 animate-spin" /> در حال بارگذاری...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="h-9 px-4 inline-flex items-center gap-2 text-sm rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-50"
        >
          {save.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          ذخیره پیش‌نویس
        </button>
        <button
          onClick={() => publish.mutate()}
          disabled={publish.isPending}
          className="h-9 px-4 inline-flex items-center gap-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
        >
          {publish.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          انتشار
        </button>
        <button
          onClick={() => {
            if (confirm('بازنشانی به محتوای پیش‌فرض؟')) reset.mutate();
          }}
          className="h-9 px-4 inline-flex items-center gap-2 text-sm rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))]"
        >
          <RotateCcw className="h-4 w-4" /> بازنشانی
        </button>
        <a
          href="/fa"
          target="_blank"
          rel="noreferrer"
          className="h-9 px-4 inline-flex items-center gap-2 text-sm rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))] mr-auto"
        >
          <Eye className="h-4 w-4" /> مشاهده سایت
        </a>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-3">
          <div className="flex md:flex-col gap-1 flex-wrap">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all text-right',
                    tab === t.key
                      ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-medium'
                      : 'text-[hsl(var(--foreground)/0.7)] hover:bg-[hsl(var(--secondary))]',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="col-span-12 md:col-span-9 space-y-4">
          {tab === 'branding' && (
            <Section title="برندینگ و لوگو">
              <TextField
                label="نام پلتفرم"
                value={content.branding.platformName}
                onChange={(v) => update({ branding: { ...content.branding, platformName: v } })}
              />
              <TextField
                label="شعار"
                value={content.branding.tagline ?? ''}
                onChange={(v) => update({ branding: { ...content.branding, tagline: v } })}
              />
              <ImageUpload
                label="لوگو"
                value={content.branding.logo}
                onChange={(img) => update({ branding: { ...content.branding, logo: img } })}
                purpose="logo"
              />
              <ImageUpload
                label="فاوآیکون"
                value={content.branding.favicon}
                onChange={(img) => update({ branding: { ...content.branding, favicon: img } })}
                purpose="favicon"
              />
            </Section>
          )}

          {tab === 'seo' && (
            <Section title="سئو و متادیتا">
              <TextField
                label="عنوان صفحه"
                value={content.seo.title}
                onChange={(v) => update({ seo: { ...content.seo, title: v } })}
              />
              <TextField
                label="توضیحات"
                multiline
                value={content.seo.description}
                onChange={(v) => update({ seo: { ...content.seo, description: v } })}
              />
              <TextField
                label="کلمات کلیدی (با ویرگول)"
                value={content.seo.keywords.join('، ')}
                onChange={(v) =>
                  update({
                    seo: {
                      ...content.seo,
                      keywords: v
                        .split(/[،,]/)
                        .map((s) => s.trim())
                        .filter(Boolean),
                    },
                  })
                }
              />
              <ImageUpload
                label="تصویر Open Graph"
                value={content.seo.ogImage}
                onChange={(img) => update({ seo: { ...content.seo, ogImage: img } })}
                purpose="og-image"
              />
            </Section>
          )}

          {tab === 'header' && (
            <Section title="هدر و ناوبری">
              <Toggle
                label="نمایش هدر"
                checked={content.header.visible}
                onChange={(v) => update({ header: { ...content.header, visible: v } })}
              />
              <LinkListEditor
                title="لینک‌های ناوبری"
                links={content.header.links}
                onChange={(links) => update({ header: { ...content.header, links } })}
              />
              <Toggle
                label="نمایش تغییر زبان"
                checked={content.header.showLanguageSwitcher}
                onChange={(v) => update({ header: { ...content.header, showLanguageSwitcher: v } })}
              />
              <Toggle
                label="نمایش تغییر تم"
                checked={content.header.showThemeToggle}
                onChange={(v) => update({ header: { ...content.header, showThemeToggle: v } })}
              />
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[hsl(var(--border))/0.5]">
                <TextField
                  label="دکمه CTA - متن"
                  value={content.header.ctaButton?.label ?? ''}
                  onChange={(v) =>
                    update({
                      header: {
                        ...content.header,
                        ctaButton: { ...(content.header.ctaButton ?? { href: '/' }), label: v },
                      },
                    })
                  }
                />
                <TextField
                  label="دکمه CTA - لینک"
                  value={content.header.ctaButton?.href ?? ''}
                  onChange={(v) =>
                    update({
                      header: {
                        ...content.header,
                        ctaButton: { ...(content.header.ctaButton ?? { label: '' }), href: v },
                      },
                    })
                  }
                />
              </div>
            </Section>
          )}

          {tab === 'hero' && (
            <Section title="بخش هرو">
              <Toggle
                label="فعال"
                checked={content.hero.visible}
                onChange={(v) => update({ hero: { ...content.hero, visible: v } })}
              />
              <TextField
                label="نشان (badge)"
                value={content.hero.badge ?? ''}
                onChange={(v) => update({ hero: { ...content.hero, badge: v } })}
              />
              <TextField
                label="عنوان"
                value={content.hero.title}
                onChange={(v) => update({ hero: { ...content.hero, title: v } })}
              />
              <TextField
                label="کلمه هایلایت"
                value={content.hero.highlightedWord ?? ''}
                onChange={(v) => update({ hero: { ...content.hero, highlightedWord: v } })}
              />
              <TextField
                label="زیرعنوان"
                multiline
                value={content.hero.subtitle}
                onChange={(v) => update({ hero: { ...content.hero, subtitle: v } })}
              />
              <div className="grid grid-cols-2 gap-2">
                <TextField
                  label="دکمه اصلی - متن"
                  value={content.hero.primaryButton?.label ?? ''}
                  onChange={(v) =>
                    update({
                      hero: {
                        ...content.hero,
                        primaryButton: {
                          ...(content.hero.primaryButton ?? { href: '/' }),
                          label: v,
                        },
                      },
                    })
                  }
                />
                <TextField
                  label="دکمه اصلی - لینک"
                  value={content.hero.primaryButton?.href ?? ''}
                  onChange={(v) =>
                    update({
                      hero: {
                        ...content.hero,
                        primaryButton: {
                          ...(content.hero.primaryButton ?? { label: '' }),
                          href: v,
                        },
                      },
                    })
                  }
                />
                <TextField
                  label="دکمه ثانویه - متن"
                  value={content.hero.secondaryButton?.label ?? ''}
                  onChange={(v) =>
                    update({
                      hero: {
                        ...content.hero,
                        secondaryButton: {
                          ...(content.hero.secondaryButton ?? { href: '#' }),
                          label: v,
                        },
                      },
                    })
                  }
                />
                <TextField
                  label="دکمه ثانویه - لینک"
                  value={content.hero.secondaryButton?.href ?? ''}
                  onChange={(v) =>
                    update({
                      hero: {
                        ...content.hero,
                        secondaryButton: {
                          ...(content.hero.secondaryButton ?? { label: '' }),
                          href: v,
                        },
                      },
                    })
                  }
                />
              </div>
              <ImageUpload
                label="تصویر پس‌زمینه (اختیاری)"
                value={content.hero.backgroundImage}
                onChange={(img) => update({ hero: { ...content.hero, backgroundImage: img } })}
                purpose="hero-bg"
              />
              <Toggle
                label="نمایش mockup ترمینال"
                checked={content.hero.showTerminalMockup}
                onChange={(v) => update({ hero: { ...content.hero, showTerminalMockup: v } })}
              />
              <div>
                <label className={labelCls}>آمار</label>
                <div className="space-y-2">
                  {content.hero.stats.map((s, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={s.value}
                        onChange={(e) => {
                          const next = [...content.hero.stats];
                          next[i] = { ...s, value: e.target.value };
                          update({ hero: { ...content.hero, stats: next } });
                        }}
                        placeholder="مقدار"
                        className={cn(inputCls, 'w-32')}
                      />
                      <input
                        value={s.label}
                        onChange={(e) => {
                          const next = [...content.hero.stats];
                          next[i] = { ...s, label: e.target.value };
                          update({ hero: { ...content.hero, stats: next } });
                        }}
                        placeholder="برچسب"
                        className={cn(inputCls, 'flex-1')}
                      />
                      <button
                        onClick={() =>
                          update({
                            hero: {
                              ...content.hero,
                              stats: content.hero.stats.filter((_, idx) => idx !== i),
                            },
                          })
                        }
                        className="text-red-500 p-1.5"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      update({
                        hero: {
                          ...content.hero,
                          stats: [...content.hero.stats, { value: '۰', label: 'جدید' }],
                        },
                      })
                    }
                    className="text-xs flex items-center gap-1 text-[hsl(var(--primary))]"
                  >
                    <Plus className="h-3 w-3" /> افزودن آمار
                  </button>
                </div>
              </div>
            </Section>
          )}

          {tab === 'calculations' && (
            <Section title="بخش محاسبات">
              <Toggle
                label="فعال"
                checked={content.calculations.visible}
                onChange={(v) => update({ calculations: { ...content.calculations, visible: v } })}
              />
              <TextField
                label="عنوان"
                value={content.calculations.title ?? ''}
                onChange={(v) => update({ calculations: { ...content.calculations, title: v } })}
              />
              <div className="space-y-2">
                {content.calculations.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2">
                    <input
                      value={item.code}
                      onChange={(e) => {
                        const next = [...content.calculations.items];
                        next[i] = { ...item, code: e.target.value };
                        update({ calculations: { ...content.calculations, items: next } });
                      }}
                      placeholder="کد"
                      className={cn(inputCls, 'col-span-3')}
                    />
                    <input
                      value={item.label}
                      onChange={(e) => {
                        const next = [...content.calculations.items];
                        next[i] = { ...item, label: e.target.value };
                        update({ calculations: { ...content.calculations, items: next } });
                      }}
                      placeholder="عنوان"
                      className={cn(inputCls, 'col-span-4')}
                    />
                    <input
                      value={item.formula ?? ''}
                      onChange={(e) => {
                        const next = [...content.calculations.items];
                        next[i] = { ...item, formula: e.target.value };
                        update({ calculations: { ...content.calculations, items: next } });
                      }}
                      placeholder="فرمول"
                      className={cn(inputCls, 'col-span-4')}
                    />
                    <button
                      onClick={() =>
                        update({
                          calculations: {
                            ...content.calculations,
                            items: content.calculations.items.filter((_, idx) => idx !== i),
                          },
                        })
                      }
                      className="text-red-500 col-span-1 flex items-center justify-center"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() =>
                    update({
                      calculations: {
                        ...content.calculations,
                        items: [
                          ...content.calculations.items,
                          { code: 'CODE', label: 'محاسبه جدید', formula: '' },
                        ],
                      },
                    })
                  }
                  className="text-xs flex items-center gap-1 text-[hsl(var(--primary))]"
                >
                  <Plus className="h-3 w-3" /> افزودن
                </button>
              </div>
            </Section>
          )}

          {tab === 'features' && (
            <Section title="بخش ویژگی‌ها">
              <Toggle
                label="فعال"
                checked={content.features.visible}
                onChange={(v) => update({ features: { ...content.features, visible: v } })}
              />
              <TextField
                label="عنوان بخش"
                value={content.features.title ?? ''}
                onChange={(v) => update({ features: { ...content.features, title: v } })}
              />
              <div className="space-y-3">
                {content.features.items.map((f, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg border border-[hsl(var(--border))] space-y-2"
                  >
                    <div className="flex justify-between">
                      <span className="text-xs font-medium">ویژگی {i + 1}</span>
                      <button
                        onClick={() =>
                          update({
                            features: {
                              ...content.features,
                              items: content.features.items.filter((_, idx) => idx !== i),
                            },
                          })
                        }
                        className="text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <input
                      value={f.icon ?? ''}
                      onChange={(e) => {
                        const next = [...content.features.items];
                        next[i] = { ...f, icon: e.target.value };
                        update({ features: { ...content.features, items: next } });
                      }}
                      placeholder="آیکون (Shield, Cpu, Zap, ...)"
                      className={inputCls}
                    />
                    <input
                      value={f.title}
                      onChange={(e) => {
                        const next = [...content.features.items];
                        next[i] = { ...f, title: e.target.value };
                        update({ features: { ...content.features, items: next } });
                      }}
                      placeholder="عنوان"
                      className={inputCls}
                    />
                    <textarea
                      value={f.description}
                      onChange={(e) => {
                        const next = [...content.features.items];
                        next[i] = { ...f, description: e.target.value };
                        update({ features: { ...content.features, items: next } });
                      }}
                      placeholder="توضیحات"
                      rows={2}
                      className={cn(inputCls, 'resize-y')}
                    />
                  </div>
                ))}
                <button
                  onClick={() =>
                    update({
                      features: {
                        ...content.features,
                        items: [
                          ...content.features.items,
                          { icon: 'Zap', title: 'ویژگی جدید', description: '' },
                        ],
                      },
                    })
                  }
                  className="text-xs flex items-center gap-1 text-[hsl(var(--primary))]"
                >
                  <Plus className="h-3 w-3" /> افزودن ویژگی
                </button>
              </div>
            </Section>
          )}

          {tab === 'cta' && (
            <Section title="بخش فراخوان (CTA)">
              <Toggle
                label="فعال"
                checked={content.cta.visible}
                onChange={(v) => update({ cta: { ...content.cta, visible: v } })}
              />
              <TextField
                label="عبارت کوچک (eyebrow)"
                value={content.cta.eyebrow ?? ''}
                onChange={(v) => update({ cta: { ...content.cta, eyebrow: v } })}
              />
              <TextField
                label="عنوان"
                value={content.cta.title}
                onChange={(v) => update({ cta: { ...content.cta, title: v } })}
              />
              <TextField
                label="متن هایلایت"
                value={content.cta.highlightedText ?? ''}
                onChange={(v) => update({ cta: { ...content.cta, highlightedText: v } })}
              />
              <TextField
                label="زیرعنوان"
                multiline
                value={content.cta.subtitle ?? ''}
                onChange={(v) => update({ cta: { ...content.cta, subtitle: v } })}
              />
              <div className="grid grid-cols-2 gap-2">
                <TextField
                  label="دکمه - متن"
                  value={content.cta.button?.label ?? ''}
                  onChange={(v) =>
                    update({
                      cta: {
                        ...content.cta,
                        button: { ...(content.cta.button ?? { href: '/' }), label: v },
                      },
                    })
                  }
                />
                <TextField
                  label="دکمه - لینک"
                  value={content.cta.button?.href ?? ''}
                  onChange={(v) =>
                    update({
                      cta: {
                        ...content.cta,
                        button: { ...(content.cta.button ?? { label: '' }), href: v },
                      },
                    })
                  }
                />
              </div>
              <TextField
                label="نشان‌های اعتماد (با ویرگول)"
                value={(content.cta.trustBadges ?? []).join('، ')}
                onChange={(v) =>
                  update({
                    cta: {
                      ...content.cta,
                      trustBadges: v
                        .split(/[،,]/)
                        .map((s) => s.trim())
                        .filter(Boolean),
                    },
                  })
                }
              />
            </Section>
          )}

          {tab === 'footer' && (
            <Section title="فوتر">
              <Toggle
                label="فعال"
                checked={content.footer.visible}
                onChange={(v) => update({ footer: { ...content.footer, visible: v } })}
              />
              <TextField
                label="متن درباره"
                multiline
                value={content.footer.aboutText ?? ''}
                onChange={(v) => update({ footer: { ...content.footer, aboutText: v } })}
              />
              <TextField
                label="کپی‌رایت"
                value={content.footer.copyright}
                onChange={(v) => update({ footer: { ...content.footer, copyright: v } })}
              />
              <TextField
                label="نسخه"
                value={content.footer.version ?? ''}
                onChange={(v) => update({ footer: { ...content.footer, version: v } })}
              />
              <div className="space-y-3 pt-2 border-t border-[hsl(var(--border))/0.5]">
                <div className="flex items-center justify-between">
                  <label className={labelCls}>ستون‌های لینک</label>
                  <button
                    onClick={() =>
                      update({
                        footer: {
                          ...content.footer,
                          columns: [...content.footer.columns, { title: 'ستون جدید', links: [] }],
                        },
                      })
                    }
                    className="text-xs flex items-center gap-1 text-[hsl(var(--primary))]"
                  >
                    <Plus className="h-3 w-3" /> افزودن ستون
                  </button>
                </div>
                {content.footer.columns.map((col, ci) => (
                  <div
                    key={ci}
                    className="p-3 rounded-lg border border-[hsl(var(--border))] space-y-2"
                  >
                    <div className="flex gap-2 items-center">
                      <input
                        value={col.title}
                        onChange={(e) => {
                          const next = [...content.footer.columns];
                          next[ci] = { ...col, title: e.target.value };
                          update({ footer: { ...content.footer, columns: next } });
                        }}
                        placeholder="عنوان ستون"
                        className={inputCls}
                      />
                      <button
                        onClick={() =>
                          update({
                            footer: {
                              ...content.footer,
                              columns: content.footer.columns.filter((_, idx) => idx !== ci),
                            },
                          })
                        }
                        className="text-red-500 p-1.5"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {col.links.map((l, li) => (
                      <div key={li} className="flex gap-2">
                        <input
                          value={l.label}
                          onChange={(e) => {
                            const nextCols = [...content.footer.columns];
                            const links = [...col.links];
                            links[li] = { ...l, label: e.target.value };
                            nextCols[ci] = { ...col, links };
                            update({ footer: { ...content.footer, columns: nextCols } });
                          }}
                          placeholder="عنوان"
                          className={cn(inputCls, 'flex-1')}
                        />
                        <input
                          value={l.href}
                          onChange={(e) => {
                            const nextCols = [...content.footer.columns];
                            const links = [...col.links];
                            links[li] = { ...l, href: e.target.value };
                            nextCols[ci] = { ...col, links };
                            update({ footer: { ...content.footer, columns: nextCols } });
                          }}
                          placeholder="/path"
                          className={cn(inputCls, 'flex-1')}
                        />
                        <button
                          onClick={() => {
                            const nextCols = [...content.footer.columns];
                            nextCols[ci] = {
                              ...col,
                              links: col.links.filter((_, idx) => idx !== li),
                            };
                            update({ footer: { ...content.footer, columns: nextCols } });
                          }}
                          className="text-red-500 p-1.5"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const nextCols = [...content.footer.columns];
                        nextCols[ci] = {
                          ...col,
                          links: [...col.links, { label: 'لینک', href: '/' }],
                        };
                        update({ footer: { ...content.footer, columns: nextCols } });
                      }}
                      className="text-xs text-[hsl(var(--primary))] flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> لینک
                    </button>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
