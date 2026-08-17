'use client';

import { Palette } from 'lucide-react';
import type { CmsBlockStyle } from '../lib/types';
import { cn } from '@/lib/utils';

/**
 * StyleEditor — ویرایشگر استایل برای هر بلوک
 *
 * این پنجره به‌صورت popover داخل ویرایشگر بلوک باز می‌شود و تمام
 * تنظیمات ظاهری (پس‌زمینه، رنگ متن، فاصله، گردی، سایه، چیدمان)
 * را ویرایش می‌کند.
 */

const SELECT =
  'w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 py-1.5 text-xs outline-none focus:border-[hsl(var(--primary))]';
const LABEL = 'text-[10px] text-[hsl(var(--muted-foreground))] block mb-1';

export function StyleEditor({
  value,
  onChange,
}: {
  value?: CmsBlockStyle;
  onChange: (next: CmsBlockStyle) => void;
}) {
  const s = value ?? {};
  const set = <K extends keyof CmsBlockStyle>(key: K, v: CmsBlockStyle[K]) => {
    onChange({ ...s, [key]: v });
  };
  const reset = () => onChange({});

  return (
    <div className="space-y-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))/20] p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <Palette className="h-3.5 w-3.5" />
          استایل بلوک
        </div>
        <button
          onClick={reset}
          className="text-[10px] text-[hsl(var(--muted-foreground))] hover:text-red-500"
        >
          ریست
        </button>
      </div>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={LABEL}>پس‌زمینه</label>
          <ColorInput value={s.backgroundColor} onChange={(v) => set('backgroundColor', v)} />
        </div>
        <div>
          <label className={LABEL}>رنگ متن</label>
          <ColorInput value={s.textColor} onChange={(v) => set('textColor', v)} />
        </div>
      </div>

      <div>
        <label className={LABEL}>تصویر پس‌زمینه (URL)</label>
        <input
          value={s.backgroundImage ?? ''}
          onChange={(e) => set('backgroundImage', e.target.value || undefined)}
          placeholder="https://..."
          className={SELECT}
        />
      </div>

      <div>
        <label className={LABEL}>گرادیان</label>
        <input
          value={s.gradient ?? ''}
          onChange={(e) => set('gradient', e.target.value || undefined)}
          placeholder="linear-gradient(...)"
          className={SELECT}
        />
        <div className="mt-2 flex flex-wrap gap-1">
          {[
            'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
            'linear-gradient(135deg, #0ea5e9, #8b5cf6)',
            'linear-gradient(135deg, #f59e0b, #ef4444)',
          ].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => set('gradient', g)}
              className="h-6 w-10 rounded border border-[hsl(var(--border))]"
              style={{ backgroundImage: g }}
              title={g}
            />
          ))}
        </div>
      </div>

      {/* Spacing */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className={LABEL}>فاصله عمودی</label>
          <select
            value={s.paddingY ?? 'md'}
            onChange={(e) => set('paddingY', e.target.value as CmsBlockStyle['paddingY'])}
            className={SELECT}
          >
            <option value="none">هیچ</option>
            <option value="sm">کم</option>
            <option value="md">متوسط</option>
            <option value="lg">زیاد</option>
            <option value="xl">خیلی زیاد</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>فاصله افقی</label>
          <select
            value={s.paddingX ?? 'md'}
            onChange={(e) => set('paddingX', e.target.value as CmsBlockStyle['paddingX'])}
            className={SELECT}
          >
            <option value="none">هیچ</option>
            <option value="sm">کم</option>
            <option value="md">متوسط</option>
            <option value="lg">زیاد</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>حاشیه عمودی</label>
          <select
            value={s.marginY ?? 'none'}
            onChange={(e) => set('marginY', e.target.value as CmsBlockStyle['marginY'])}
            className={SELECT}
          >
            <option value="none">هیچ</option>
            <option value="sm">کم</option>
            <option value="md">متوسط</option>
            <option value="lg">زیاد</option>
          </select>
        </div>
      </div>

      {/* Appearance */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className={LABEL}>گردی</label>
          <select
            value={s.rounded ?? 'md'}
            onChange={(e) => set('rounded', e.target.value as CmsBlockStyle['rounded'])}
            className={SELECT}
          >
            <option value="none">هیچ</option>
            <option value="sm">کم</option>
            <option value="md">متوسط</option>
            <option value="lg">زیاد</option>
            <option value="xl">خیلی</option>
            <option value="full">کامل</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>سایه</label>
          <select
            value={s.shadow ?? 'none'}
            onChange={(e) => set('shadow', e.target.value as CmsBlockStyle['shadow'])}
            className={SELECT}
          >
            <option value="none">هیچ</option>
            <option value="sm">کم</option>
            <option value="md">متوسط</option>
            <option value="lg">زیاد</option>
            <option value="xl">خیلی زیاد</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>حداکثر عرض</label>
          <select
            value={s.maxWidth ?? 'xl'}
            onChange={(e) => set('maxWidth', e.target.value as CmsBlockStyle['maxWidth'])}
            className={SELECT}
          >
            <option value="sm">کوچک</option>
            <option value="md">متوسط</option>
            <option value="lg">بزرگ</option>
            <option value="xl">خیلی بزرگ</option>
            <option value="full">کامل</option>
          </select>
        </div>
      </div>

      {/* Typography */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={LABEL}>اندازه متن</label>
          <select
            value={s.textSize ?? 'base'}
            onChange={(e) => set('textSize', e.target.value as CmsBlockStyle['textSize'])}
            className={SELECT}
          >
            <option value="xs">خیلی کوچک</option>
            <option value="sm">کم</option>
            <option value="base">معمولی</option>
            <option value="lg">بزرگ</option>
            <option value="xl">خیلی بزرگ</option>
            <option value="2xl">2XL</option>
            <option value="3xl">3XL</option>
            <option value="4xl">4XL</option>
            <option value="5xl">5XL</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>ضخامت</label>
          <select
            value={s.fontWeight ?? 'normal'}
            onChange={(e) => set('fontWeight', e.target.value as CmsBlockStyle['fontWeight'])}
            className={SELECT}
          >
            <option value="normal">معمولی</option>
            <option value="medium">متوسط</option>
            <option value="semibold">نیمه‌ضخیم</option>
            <option value="bold">ضخیم</option>
            <option value="extrabold">خیلی ضخیم</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className={LABEL}>چینش متن</label>
          <select
            value={s.textAlign ?? 'right'}
            onChange={(e) => set('textAlign', e.target.value as CmsBlockStyle['textAlign'])}
            className={SELECT}
          >
            <option value="right">راست</option>
            <option value="center">وسط</option>
            <option value="left">چپ</option>
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex w-full cursor-pointer items-center gap-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 py-1.5 text-xs">
            <input
              type="checkbox"
              checked={s.border === true}
              onChange={(e) => set('border', e.target.checked)}
              className="h-3.5 w-3.5"
            />
            حاشیه دور
          </label>
        </div>
      </div>

      <div>
        <label className={LABEL}>کلاس سفارشی (Tailwind)</label>
        <input
          value={s.className ?? ''}
          onChange={(e) => set('className', e.target.value || undefined)}
          placeholder="مثال: bg-gradient-to-br from-pink-500 ..."
          className={cn(SELECT, 'font-mono')}
        />
      </div>
    </div>
  );
}

function ColorInput({
  value,
  onChange,
}: {
  value?: string;
  onChange: (v: string | undefined) => void;
}) {
  return (
    <div className="flex gap-1">
      <input
        type="color"
        value={toColor(value)}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-8 shrink-0 cursor-pointer rounded border border-[hsl(var(--border))] bg-transparent p-0"
      />
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        placeholder="transparent"
        className={cn(SELECT, 'flex-1 font-mono text-[10px]')}
      />
    </div>
  );
}

function toColor(v?: string): string {
  if (!v) return '#000000';
  if (v.startsWith('#')) return v;
  if (v.startsWith('hsl')) return '#4f46e5';
  if (v.startsWith('rgb')) return '#4f46e5';
  return '#4f46e5';
}
