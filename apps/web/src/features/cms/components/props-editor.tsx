'use client';

import { useState } from 'react';
import { ImageIcon, Plus, Trash2, X } from 'lucide-react';
import type { BlockField, BlockDef } from '../lib/block-library';
import type { CmsBlock } from '../lib/types';

const ICONS = [
  'zap',
  'shield',
  'globe',
  'cpu',
  'layers',
  'barChart3',
  'flask',
  'check',
  'star',
  'mail',
  'phone',
  'pin',
  'send',
  'quote',
  'alert',
  'info',
  'success',
  'error',
  'play',
];

const LABEL = 'text-[11px] text-[hsl(var(--muted-foreground))] block mb-1';
const INPUT =
  'w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 py-1.5 text-xs outline-none focus:border-[hsl(var(--primary))]';

export function PropsEditor({
  def,
  block,
  onChange,
  onUpload,
}: {
  def: BlockDef;
  block: CmsBlock;
  onChange: (props: Record<string, unknown>) => void;
  onUpload: (file: File) => Promise<string>;
}) {
  const set = (key: string, value: unknown) => onChange({ ...block.props, [key]: value });

  return (
    <div className="grid gap-3">
      {def.fields.length === 0 ? (
        <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
          این بلوک فیلد قابل ویرایشی ندارد.
        </p>
      ) : null}
      {def.fields.map((field) => (
        <FieldEditor
          key={field.key}
          field={field}
          value={block.props[field.key]}
          onChange={(v) => set(field.key, v)}
          onUpload={onUpload}
        />
      ))}
    </div>
  );
}

function FieldEditor({
  field,
  value,
  onChange,
  onUpload,
}: {
  field: BlockField;
  value: unknown;
  onChange: (v: unknown) => void;
  onUpload: (file: File) => Promise<string>;
}) {
  switch (field.kind) {
    case 'text':
      return (
        <div>
          <label className={LABEL}>{field.label}</label>
          <input
            className={INPUT}
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
    case 'textarea':
      return (
        <div>
          <label className={LABEL}>{field.label}</label>
          <textarea
            className={INPUT}
            rows={4}
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
    case 'url':
      return (
        <div>
          <label className={LABEL}>{field.label}</label>
          <input
            className={INPUT}
            dir="ltr"
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
          />
        </div>
      );
    case 'number':
      return (
        <div>
          <label className={LABEL}>{field.label}</label>
          <input
            type="number"
            className={INPUT}
            value={(value as number) ?? 0}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        </div>
      );
    case 'boolean':
      return (
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            className="h-3.5 w-3.5"
          />
          {field.label}
        </label>
      );
    case 'select':
      return (
        <div>
          <label className={LABEL}>{field.label}</label>
          <select
            className={INPUT}
            value={(value as string) ?? ''}
            onChange={(e) => {
              const opt = field.options.find((o) => String(o.value) === e.target.value);
              onChange(typeof opt?.value === 'number' ? Number(opt.value) : e.target.value);
            }}
          >
            {field.options.map((o) => (
              <option key={String(o.value)} value={String(o.value)}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      );
    case 'icon':
      return (
        <div>
          <label className={LABEL}>{field.label}</label>
          <select
            className={INPUT}
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">بدون آیکون</option>
            {ICONS.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
      );
    case 'color':
      return (
        <div>
          <label className={LABEL}>{field.label}</label>
          <div className="flex gap-1">
            <input
              type="color"
              value={(value as string) ?? '#4f46e5'}
              onChange={(e) => onChange(e.target.value)}
              className="h-8 w-8 cursor-pointer rounded border border-[hsl(var(--border))] bg-transparent"
            />
            <input
              className={`${INPUT} flex-1 font-mono text-[10px]`}
              value={(value as string) ?? ''}
              onChange={(e) => onChange(e.target.value)}
              dir="ltr"
            />
          </div>
        </div>
      );
    case 'image':
      return (
        <div>
          <label className={LABEL}>{field.label}</label>
          <ImageField value={value as string | undefined} onChange={onChange} onUpload={onUpload} />
        </div>
      );
    case 'list':
      return <ListField field={field} value={value as unknown[]} onChange={onChange} />;
    case 'json':
      return (
        <div>
          <label className={LABEL}>{field.label}</label>
          <textarea
            className={`${INPUT} font-mono text-[10px]`}
            rows={6}
            dir="ltr"
            value={JSON.stringify(value ?? {}, null, 2)}
            onChange={(e) => {
              try {
                onChange(JSON.parse(e.target.value));
              } catch {
                /* ignore while typing */
              }
            }}
          />
        </div>
      );
  }
}

function ImageField({
  value,
  onChange,
  onUpload,
}: {
  value?: string;
  onChange: (v: string) => void;
  onUpload: (file: File) => Promise<string>;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        <input
          className={`${INPUT} flex-1`}
          dir="ltr"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
        <label className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-[hsl(var(--border))] px-2 py-1 text-[11px] hover:bg-[hsl(var(--secondary))]">
          <ImageIcon className="h-3.5 w-3.5" />
          آپلود
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setBusy(true);
              try {
                const url = await onUpload(f);
                onChange(url);
              } finally {
                setBusy(false);
              }
            }}
          />
        </label>
      </div>
      {busy ? <p className="text-[10px] text-amber-600">در حال آپلود…</p> : null}
      {value ? (
        <img
          src={value}
          alt=""
          className="h-20 rounded border border-[hsl(var(--border))] object-cover"
        />
      ) : null}
    </div>
  );
}

function ListField({
  field,
  value,
  onChange,
}: {
  field: Extract<BlockField, { kind: 'list' }>;
  value: unknown[] | undefined;
  onChange: (v: unknown[]) => void;
}) {
  const items = Array.isArray(value) ? value : [];
  const update = (i: number, v: unknown) => {
    const next = items.slice();
    next[i] = v;
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  if (field.itemKind === 'text' || field.itemKind === 'tags') {
    return (
      <div>
        <label className={LABEL}>{field.label}</label>
        <div className="flex flex-wrap gap-1.5">
          {items.map((it, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--secondary))] px-2 py-0.5 text-[11px]"
            >
              <input
                className="w-24 bg-transparent outline-none"
                value={it as string}
                onChange={(e) => update(i, e.target.value)}
              />
              <button onClick={() => remove(i)} className="hover:text-red-500">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <button
            onClick={() => onChange([...items, ''])}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-[hsl(var(--border))] px-2 py-0.5 text-[11px] hover:bg-[hsl(var(--secondary))]"
          >
            <Plus className="h-3 w-3" /> افزودن
          </button>
        </div>
      </div>
    );
  }

  if (field.itemKind === 'links') {
    return (
      <div>
        <label className={LABEL}>{field.label}</label>
        <div className="space-y-2">
          {items.map((it, i) => {
            const item = (it ?? {}) as { label: string; href: string };
            return (
              <div
                key={i}
                className="flex gap-1 rounded-md border border-[hsl(var(--border))] p-1.5"
              >
                <input
                  placeholder="برچسب"
                  className={`${INPUT} flex-1`}
                  value={item.label ?? ''}
                  onChange={(e) => update(i, { ...item, label: e.target.value })}
                />
                <input
                  placeholder="/path"
                  dir="ltr"
                  className={`${INPUT} flex-1`}
                  value={item.href ?? ''}
                  onChange={(e) => update(i, { ...item, href: e.target.value })}
                />
                <button
                  onClick={() => remove(i)}
                  className="px-1 text-[hsl(var(--muted-foreground))] hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
          <button
            onClick={() => onChange([...items, { label: 'لینک جدید', href: '#' }])}
            className="inline-flex items-center gap-1 rounded-md border border-dashed border-[hsl(var(--border))] px-2 py-1 text-[11px] hover:bg-[hsl(var(--secondary))]"
          >
            <Plus className="h-3 w-3" /> لینک جدید
          </button>
        </div>
      </div>
    );
  }

  if (field.itemKind === 'features') {
    return (
      <div>
        <label className={LABEL}>{field.label}</label>
        <div className="space-y-2">
          {items.map((it, i) => {
            const item = (it ?? {}) as { title: string; desc: string; icon: string };
            return (
              <div
                key={i}
                className="space-y-1 rounded-md border border-[hsl(var(--border))] p-1.5"
              >
                <input
                  placeholder="عنوان"
                  className={INPUT}
                  value={item.title ?? ''}
                  onChange={(e) => update(i, { ...item, title: e.target.value })}
                />
                <textarea
                  placeholder="توضیح"
                  rows={2}
                  className={INPUT}
                  value={item.desc ?? ''}
                  onChange={(e) => update(i, { ...item, desc: e.target.value })}
                />
                <button onClick={() => remove(i)} className="text-[10px] text-red-500">
                  حذف
                </button>
              </div>
            );
          })}
          <button
            onClick={() => onChange([...items, { title: 'ویژگی', desc: '', icon: 'zap' }])}
            className="inline-flex items-center gap-1 rounded-md border border-dashed border-[hsl(var(--border))] px-2 py-1 text-[11px] hover:bg-[hsl(var(--secondary))]"
          >
            <Plus className="h-3 w-3" /> ویژگی جدید
          </button>
        </div>
      </div>
    );
  }

  if (field.itemKind === 'stats') {
    return (
      <div>
        <label className={LABEL}>{field.label}</label>
        <div className="space-y-2">
          {items.map((it, i) => {
            const item = (it ?? {}) as { value: string; label: string };
            return (
              <div key={i} className="flex gap-1">
                <input
                  placeholder="مقدار"
                  className={`${INPUT} w-24`}
                  value={item.value ?? ''}
                  onChange={(e) => update(i, { ...item, value: e.target.value })}
                />
                <input
                  placeholder="برچسب"
                  className={`${INPUT} flex-1`}
                  value={item.label ?? ''}
                  onChange={(e) => update(i, { ...item, label: e.target.value })}
                />
                <button onClick={() => remove(i)} className="px-1 hover:text-red-500">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
          <button
            onClick={() => onChange([...items, { value: '۰', label: 'مورد' }])}
            className="inline-flex items-center gap-1 rounded-md border border-dashed border-[hsl(var(--border))] px-2 py-1 text-[11px] hover:bg-[hsl(var(--secondary))]"
          >
            <Plus className="h-3 w-3" /> آمار جدید
          </button>
        </div>
      </div>
    );
  }

  if (field.itemKind === 'faq') {
    return (
      <div>
        <label className={LABEL}>{field.label}</label>
        <div className="space-y-2">
          {items.map((it, i) => {
            const item = (it ?? {}) as { question: string; answer: string };
            return (
              <div
                key={i}
                className="space-y-1 rounded-md border border-[hsl(var(--border))] p-1.5"
              >
                <input
                  placeholder="سوال"
                  className={INPUT}
                  value={item.question ?? ''}
                  onChange={(e) => update(i, { ...item, question: e.target.value })}
                />
                <textarea
                  placeholder="پاسخ"
                  rows={2}
                  className={INPUT}
                  value={item.answer ?? ''}
                  onChange={(e) => update(i, { ...item, answer: e.target.value })}
                />
                <button onClick={() => remove(i)} className="text-[10px] text-red-500">
                  حذف
                </button>
              </div>
            );
          })}
          <button
            onClick={() => onChange([...items, { question: 'سوال؟', answer: 'پاسخ' }])}
            className="inline-flex items-center gap-1 rounded-md border border-dashed border-[hsl(var(--border))] px-2 py-1 text-[11px] hover:bg-[hsl(var(--secondary))]"
          >
            <Plus className="h-3 w-3" /> سوال جدید
          </button>
        </div>
      </div>
    );
  }

  if (field.itemKind === 'testimonials') {
    return (
      <div>
        <label className={LABEL}>{field.label}</label>
        <div className="space-y-2">
          {items.map((it, i) => {
            const item = (it ?? {}) as {
              quote: string;
              author: string;
              role: string;
              rating: number;
            };
            return (
              <div
                key={i}
                className="space-y-1 rounded-md border border-[hsl(var(--border))] p-1.5"
              >
                <textarea
                  placeholder="نظر"
                  rows={2}
                  className={INPUT}
                  value={item.quote ?? ''}
                  onChange={(e) => update(i, { ...item, quote: e.target.value })}
                />
                <div className="flex gap-1">
                  <input
                    placeholder="نام"
                    className={`${INPUT} flex-1`}
                    value={item.author ?? ''}
                    onChange={(e) => update(i, { ...item, author: e.target.value })}
                  />
                  <input
                    placeholder="سمت"
                    className={`${INPUT} flex-1`}
                    value={item.role ?? ''}
                    onChange={(e) => update(i, { ...item, role: e.target.value })}
                  />
                  <input
                    type="number"
                    min={1}
                    max={5}
                    className={`${INPUT} w-16`}
                    value={item.rating ?? 5}
                    onChange={(e) => update(i, { ...item, rating: Number(e.target.value) })}
                  />
                </div>
                <button onClick={() => remove(i)} className="text-[10px] text-red-500">
                  حذف
                </button>
              </div>
            );
          })}
          <button
            onClick={() =>
              onChange([...items, { quote: 'متن نظر', author: 'نام', role: 'سمت', rating: 5 }])
            }
            className="inline-flex items-center gap-1 rounded-md border border-dashed border-[hsl(var(--border))] px-2 py-1 text-[11px] hover:bg-[hsl(var(--secondary))]"
          >
            <Plus className="h-3 w-3" /> نظر جدید
          </button>
        </div>
      </div>
    );
  }

  return null;
}
