'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Loader2, Palette, RotateCcw, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/stores/toast.store';
import { apiClient } from '@/lib/api/client';
import { invalidateTheme } from '@/lib/theme/invalidate';

type ThemeTokens = Record<string, string>;

const FIELDS: { group: string; items: [key: string, label: string, hint?: string][] }[] = [
  {
    group: 'برند',
    items: [
      ['primary', 'اصلی (پس‌زمینه)'],
      ['primaryForeground', 'متن روی اصلی'],
      ['accent', 'تاکید (پس‌زمینه)'],
      ['accentForeground', 'متن روی تاکید'],
      ['ring', 'فوکوس / Ring'],
    ],
  },
  {
    group: 'پس‌زمینه و متن',
    items: [
      ['background', 'پس‌زمینه'],
      ['foreground', 'متن اصلی'],
      ['card', 'کارت'],
      ['cardForeground', 'متن کارت'],
      ['muted', 'Muted'],
      ['mutedForeground', 'متن Muted'],
    ],
  },
  {
    group: 'اجزاء',
    items: [
      ['secondary', 'Secondary'],
      ['secondaryForeground', 'متن Secondary'],
      ['border', 'حاشیه'],
      ['input', 'Input'],
      ['destructive', 'خطا'],
      ['destructiveForeground', 'متن روی خطا'],
    ],
  },
];

const DEFAULT_HINTS: Record<string, string> = {
  primary: 'HSL triplet مثل 210 56% 23%',
};

export function ThemeSection() {
  const toast = useToast();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['theme'],
    queryFn: () => apiClient.get<{ success: boolean; data: ThemeTokens }>('/theme'),
  });

  const [draft, setDraft] = useState<ThemeTokens>({});

  useEffect(() => {
    if (data?.data) setDraft({ ...data.data });
  }, [data?.data]);

  useEffect(() => {
    // Live preview: apply to :root
    const root = document.documentElement;
    for (const [k, v] of Object.entries(draft)) {
      if (v) root.style.setProperty(`--${camelToKebab(k)}`, v);
    }
  }, [draft]);

  const saveMut = useMutation({
    mutationFn: async () => {
      return apiClient.put('/theme', draft);
    },
    onSuccess: async () => {
      toast.success('ذخیره شد', 'تم با موفقیت ذخیره شد');
      qc.invalidateQueries({ queryKey: ['theme'] });
      await invalidateTheme();
    },
    onError: (e: any) => {
      toast.error('خطا', e?.message ?? 'ذخیره تم ناموفق بود');
    },
  });

  const resetMut = useMutation({
    mutationFn: async () =>
      apiClient.put<{ success: boolean; data: ThemeTokens }>('/theme/reset', {}),
    onSuccess: async (res) => {
      setDraft(res.data);
      toast.success('بازنشانی شد', 'تم به پیش‌فرض بازگشت');
      qc.invalidateQueries({ queryKey: ['theme'] });
      await invalidateTheme();
    },
  });

  const set = (k: string, v: string) => setDraft((d) => ({ ...d, [k]: v }));
  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(data?.data ?? {}),
    [draft, data],
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> در حال بارگذاری تم…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.06)] p-4">
        <Palette className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--primary))]" />
        <div className="space-y-1 text-sm">
          <p className="font-semibold">رنگ‌های سازمانی پلتفرم</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            مقادیر را با فرمت{' '}
            <code dir="ltr" className="font-mono">
              H S% L%
            </code>{' '}
            وارد کنید. تغییرات بلافاصله در کل پلتفرم اعمال می‌شوند؛ برای ماندگاری، «ذخیره تم» را
            بزنید.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {FIELDS.map((group) => (
            <Card key={group.group}>
              <CardHeader>
                <CardTitle className="text-sm">{group.group}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {group.items.map(([key, label]) => (
                    <TokenField
                      key={key}
                      label={label}
                      value={draft[key] ?? ''}
                      hint={DEFAULT_HINTS[key]}
                      onChange={(v) => set(key, v)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">شعاع و فونت</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <TokenField
                label="شعاع پیش‌فرض (radius)"
                value={draft.radius ?? ''}
                hint="مثل 0.625rem یا 10px"
                onChange={(v) => set('radius', v)}
              />
              <TokenField
                label="فونت خانواده"
                value={draft.fontFamilySans ?? ''}
                hint="نام فونت با کاما جدا شود"
                onChange={(v) => set('fontFamilySans', v)}
              />
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">پیش‌نمایش</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <button className="btn btn-primary text-xs">دکمه اصلی</button>
                <button className="btn btn-outline text-xs">دکمه حاشیه</button>
                <button className="btn btn-ghost text-xs">شبح</button>
              </div>
              <div className="card p-4 text-sm">
                <p className="font-semibold">یک کارت نمونه</p>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  متن فرعی برای نمایش رنگ muted.
                </p>
                <span className="badge mt-3">بج</span>
              </div>
              <div className="flex gap-2">
                <span
                  className="h-6 w-6 rounded-full"
                  style={{ background: 'hsl(var(--primary))' }}
                />
                <span
                  className="h-6 w-6 rounded-full"
                  style={{ background: 'hsl(var(--accent))' }}
                />
                <span className="h-6 w-6 rounded-full border border-[hsl(var(--border))]" />
                <span
                  className="h-6 w-6 rounded-full"
                  style={{ background: 'hsl(var(--destructive))' }}
                />
              </div>
            </CardContent>
          </Card>

          <div className="sticky top-4 flex gap-2">
            <Button
              onClick={() => saveMut.mutate()}
              disabled={saveMut.isPending || !dirty}
              className="flex-1"
            >
              {saveMut.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              ذخیره تم
            </Button>
            <Button
              variant="outline"
              onClick={() => resetMut.mutate()}
              disabled={resetMut.isPending}
            >
              <RotateCcw className="h-4 w-4" /> بازنشانی
            </Button>
          </div>

          {!dirty ? (
            <p className="flex items-center justify-center gap-1.5 text-xs text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" /> همه‌ی تغییرات ذخیره شده است.
            </p>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function TokenField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  const swatch = useMemo(() => {
    // Render a color swatch only if value matches H S% L%
    const m = /^\d{1,3}\s+\d{1,3}%\s+\d{1,3}%$/.test(value);
    return m ? `hsl(${value})` : 'transparent';
  }, [value]);

  return (
    <label className="block space-y-1">
      <span className="text-[11px] font-medium text-[hsl(var(--foreground))]">{label}</span>
      <div className="flex items-center gap-1.5 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-2 py-1 focus-within:border-[hsl(var(--ring))]">
        <span
          className="h-5 w-5 shrink-0 rounded border border-[hsl(var(--border))]"
          style={{ background: swatch }}
        />
        <input
          value={value}
          dir="ltr"
          onChange={(e) => onChange(e.target.value)}
          placeholder="210 56% 23%"
          className="w-full bg-transparent py-1 font-mono text-[11px] outline-none"
        />
      </div>
      {hint ? (
        <span className="block text-[10px] text-[hsl(var(--muted-foreground))]">{hint}</span>
      ) : null}
    </label>
  );
}

function camelToKebab(s: string): string {
  return s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
}
