'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  BookOpenText,
  CheckCircle2,
  FileImage,
  FlaskConical,
  Languages,
  Pencil,
  Plus,
  RefreshCw,
  Sigma,
  Trash2,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { knowledgeApi } from '../admin/knowledge-api';
import { InlineError, KnowledgeQueryState } from '../admin/knowledge-query-state';
import type {
  ExampleDifficulty,
  KnowledgeExample,
  KnowledgeFormula,
  KnowledgeLocale,
  KnowledgeMedia,
  KnowledgeMediaType,
  KnowledgeTranslation,
  LocalizedKnowledge,
} from './knowledge-content.types';

type ContentArea = 'translations' | 'media' | 'formulas' | 'examples';

const contentAreas: Array<{ id: ContentArea; label: string; icon: typeof Languages }> = [
  { id: 'translations', label: 'ترجمه‌ها', icon: Languages },
  { id: 'media', label: 'رسانه', icon: FileImage },
  { id: 'formulas', label: 'فرمول‌ها', icon: Sigma },
  { id: 'examples', label: 'مثال‌های حل‌شده', icon: FlaskConical },
];

const locales: Array<{ value: KnowledgeLocale; label: string }> = [
  { value: 'fa', label: 'فارسی' },
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
  { value: 'ru', label: 'Русский' },
  { value: 'zh', label: '中文' },
];

const mediaTypes: Array<{ value: KnowledgeMediaType; label: string }> = [
  { value: 'image', label: 'تصویر' },
  { value: 'pdf', label: 'PDF' },
  { value: 'video', label: 'ویدئو' },
  { value: 'cad', label: 'CAD' },
  { value: '3d', label: 'مدل سه‌بعدی' },
  { value: 'gif', label: 'GIF' },
  { value: 'svg', label: 'SVG' },
  { value: 'audio', label: 'صوت' },
  { value: 'archive', label: 'بایگانی' },
];

const emptyTranslationForm = {
  language: 'en' as KnowledgeLocale,
  title: '',
  summary: '',
  seoTitle: '',
  seoDescription: '',
};

const emptyMediaForm = {
  type: 'image' as KnowledgeMediaType,
  url: '',
  captionFa: '',
  captionEn: '',
  altFa: '',
  altEn: '',
  description: '',
  license: '',
  source: '',
};

const emptyFormulaForm = {
  latex: '',
  descriptionFa: '',
  descriptionEn: '',
  calculatorType: '',
};

const emptyExampleForm = {
  titleFa: '',
  titleEn: '',
  difficulty: 'basic' as ExampleDifficulty,
  steps: '',
  answer: '',
  calculatorType: '',
};

export function KnowledgeRichContentManager({ articleId }: { articleId: string }) {
  const [activeArea, setActiveArea] = useState<ContentArea>('translations');
  const [translations, setTranslations] = useState<KnowledgeTranslation[]>([]);
  const [media, setMedia] = useState<KnowledgeMedia[]>([]);
  const [formulas, setFormulas] = useState<KnowledgeFormula[]>([]);
  const [examples, setExamples] = useState<KnowledgeExample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const id = encodeURIComponent(articleId);
      const [translationData, mediaData, formulaData, exampleData] = await Promise.all([
        knowledgeApi.get<KnowledgeTranslation[]>(`/knowledge/${id}/translations`),
        knowledgeApi.get<KnowledgeMedia[]>(`/knowledge/${id}/media`),
        knowledgeApi.get<KnowledgeFormula[]>(`/knowledge/${id}/formulas`),
        knowledgeApi.get<KnowledgeExample[]>(`/knowledge/${id}/examples`),
      ]);
      setTranslations(translationData);
      setMedia(mediaData);
      setFormulas(formulaData);
      setExamples(exampleData);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : 'دریافت محتوای غنی ناموفق بود.',
      );
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    void loadContent();
  }, [loadContent]);

  const announce = (message: string) => {
    setSuccess(message);
    setActionError(null);
    window.setTimeout(() => setSuccess(null), 3500);
  };

  const report = (requestError: unknown, fallback: string) => {
    setActionError(requestError instanceof Error ? requestError.message : fallback);
    setSuccess(null);
  };

  const counts = useMemo(
    () => ({
      translations: translations.length,
      media: media.length,
      formulas: formulas.length,
      examples: examples.length,
    }),
    [examples.length, formulas.length, media.length, translations.length],
  );

  return (
    <Card>
      <CardHeader className="border-b bg-muted/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpenText className="size-5 text-violet-600" />
              محتوای غنی و چندزبانه
            </CardTitle>
            <CardDescription className="mt-1">
              ترجمه، رسانه، فرمول و مثال‌های حل‌شده این مقاله را مدیریت کنید.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => void loadContent()}>
            <RefreshCw className={loading ? 'size-4 animate-spin' : 'size-4'} />
            تازه‌سازی
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-5">
        <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl bg-muted/60 p-1">
          {contentAreas.map((area) => {
            const Icon = area.icon;
            return (
              <button
                key={area.id}
                type="button"
                onClick={() => setActiveArea(area.id)}
                className={`flex min-w-max items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                  activeArea === area.id
                    ? 'bg-background font-semibold shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="size-4" />
                {area.label}
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                  {counts[area.id].toLocaleString('fa-IR')}
                </Badge>
              </button>
            );
          })}
        </div>

        {actionError ? (
          <div className="mb-4">
            <InlineError message={actionError} />
          </div>
        ) : null}
        {success ? (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-3 py-2.5 text-sm text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="size-4" />
            {success}
          </div>
        ) : null}

        {loading && translations.length + media.length + formulas.length + examples.length === 0 ? (
          <KnowledgeQueryState kind="loading" compact />
        ) : error ? (
          <KnowledgeQueryState
            kind="error"
            compact
            description={error}
            onRetry={() => void loadContent()}
          />
        ) : (
          <>
            {activeArea === 'translations' ? (
              <TranslationsPanel
                articleId={articleId}
                items={translations}
                setItems={setTranslations}
                announce={announce}
                report={report}
              />
            ) : null}
            {activeArea === 'media' ? (
              <MediaPanel
                articleId={articleId}
                items={media}
                setItems={setMedia}
                announce={announce}
                report={report}
              />
            ) : null}
            {activeArea === 'formulas' ? (
              <FormulaPanel
                articleId={articleId}
                items={formulas}
                setItems={setFormulas}
                announce={announce}
                report={report}
              />
            ) : null}
            {activeArea === 'examples' ? (
              <ExamplesPanel
                articleId={articleId}
                items={examples}
                setItems={setExamples}
                announce={announce}
                report={report}
              />
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface PanelProps<T> {
  articleId: string;
  items: T[];
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  announce: (message: string) => void;
  report: (error: unknown, fallback: string) => void;
}

function TranslationsPanel({
  articleId,
  items,
  setItems,
  announce,
  report,
}: PanelProps<KnowledgeTranslation>) {
  const [form, setForm] = useState(emptyTranslationForm);
  const [saving, setSaving] = useState(false);
  const [previewLocale, setPreviewLocale] = useState<KnowledgeLocale>('en');
  const [preview, setPreview] = useState<LocalizedKnowledge | null>(null);
  const [previewing, setPreviewing] = useState(false);

  const edit = (item: KnowledgeTranslation) => {
    setForm({
      language: item.language,
      title: item.title,
      summary: item.summary ?? '',
      seoTitle: item.seoTitle ?? '',
      seoDescription: item.seoDescription ?? '',
    });
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const saved = await knowledgeApi.put<KnowledgeTranslation>(
        `/knowledge/${encodeURIComponent(articleId)}/translations`,
        {
          language: form.language,
          title: form.title.trim(),
          summary: form.summary.trim() || undefined,
          seoTitle: form.seoTitle.trim() || undefined,
          seoDescription: form.seoDescription.trim() || undefined,
        },
      );
      setItems((current) => [saved, ...current.filter((item) => item.language !== saved.language)]);
      setForm(emptyTranslationForm);
      announce('ترجمه ذخیره شد.');
    } catch (requestError) {
      report(requestError, 'ذخیره ترجمه ناموفق بود.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (language: KnowledgeLocale) => {
    if (!window.confirm('این ترجمه حذف شود؟')) return;
    try {
      await knowledgeApi.delete(
        `/knowledge/${encodeURIComponent(articleId)}/translations/${encodeURIComponent(language)}`,
      );
      setItems((current) => current.filter((item) => item.language !== language));
      announce('ترجمه حذف شد.');
    } catch (requestError) {
      report(requestError, 'حذف ترجمه ناموفق بود.');
    }
  };

  const loadPreview = async () => {
    setPreviewing(true);
    try {
      setPreview(
        await knowledgeApi.get<LocalizedKnowledge>(
          `/knowledge/${encodeURIComponent(articleId)}/localized?locale=${previewLocale}`,
        ),
      );
    } catch (requestError) {
      report(requestError, 'پیش‌نمایش محلی‌سازی ناموفق بود.');
    } finally {
      setPreviewing(false);
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4">
        {items.length === 0 ? (
          <KnowledgeQueryState kind="empty" compact title="ترجمه‌ای برای مقاله ثبت نشده است" />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {items.map((item) => (
              <div key={item.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge>
                        {locales.find((locale) => locale.value === item.language)?.label ??
                          item.language}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.updatedAt).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                    <h3 className="mt-3 truncate font-semibold">{item.title}</h3>
                    {item.summary ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {item.summary}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <IconButton label="ویرایش" onClick={() => edit(item)} icon={Pencil} />
                    <IconButton
                      label="حذف"
                      onClick={() => void remove(item.language)}
                      icon={Trash2}
                      danger
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-xl border bg-muted/20 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">پیش‌نمایش محلی‌سازی و زبان جایگزین</p>
              <p className="mt-1 text-xs text-muted-foreground">
                نتیجه واقعی endpoint محلی‌سازی مقاله
              </p>
            </div>
            <div className="flex gap-2">
              <select
                value={previewLocale}
                onChange={(event) => setPreviewLocale(event.target.value as KnowledgeLocale)}
                className="h-9 rounded-md border bg-background px-2 text-sm"
              >
                {locales.map((locale) => (
                  <option key={locale.value} value={locale.value}>
                    {locale.label}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                size="sm"
                disabled={previewing}
                onClick={() => void loadPreview()}
              >
                پیش‌نمایش
              </Button>
            </div>
          </div>
          {preview ? (
            <div className="mt-4 rounded-xl bg-background p-3 ring-1 ring-border">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">درخواست: {preview.requestedLocale}</Badge>
                <Badge variant={preview.isFallback ? 'secondary' : 'default'}>
                  پاسخ: {preview.resolvedLocale}
                  {preview.isFallback ? ' (جایگزین)' : ''}
                </Badge>
              </div>
              <p className="mt-3 font-semibold">{preview.title || 'بدون عنوان'}</p>
              {preview.summary ? (
                <p className="mt-1 text-sm text-muted-foreground">{preview.summary}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <form
        onSubmit={(event) => void save(event)}
        className="h-fit space-y-3 rounded-xl border bg-muted/20 p-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">افزودن یا ویرایش ترجمه</h3>
          <IconButton label="پاک‌کردن فرم" onClick={() => setForm(emptyTranslationForm)} icon={X} />
        </div>
        <FormField label="زبان">
          <select
            value={form.language}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                language: event.target.value as KnowledgeLocale,
              }))
            }
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            {locales.map((locale) => (
              <option key={locale.value} value={locale.value}>
                {locale.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="عنوان">
          <Input
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          />
        </FormField>
        <FormField label="خلاصه">
          <Textarea
            value={form.summary}
            onChange={(value) => setForm((current) => ({ ...current, summary: value }))}
            rows={4}
          />
        </FormField>
        <FormField label="عنوان SEO">
          <Input
            value={form.seoTitle}
            onChange={(event) =>
              setForm((current) => ({ ...current, seoTitle: event.target.value }))
            }
          />
        </FormField>
        <FormField label="توضیح SEO">
          <Textarea
            value={form.seoDescription}
            onChange={(value) => setForm((current) => ({ ...current, seoDescription: value }))}
            rows={3}
          />
        </FormField>
        <Button type="submit" className="w-full gap-2" disabled={saving || !form.title.trim()}>
          <Plus className={saving ? 'size-4 animate-pulse' : 'size-4'} />
          ذخیره ترجمه
        </Button>
      </form>
    </div>
  );
}

function MediaPanel({ articleId, items, setItems, announce, report }: PanelProps<KnowledgeMedia>) {
  const [form, setForm] = useState(emptyMediaForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const edit = (item: KnowledgeMedia) => {
    setEditingId(item.id);
    setForm({
      type: item.type,
      url: item.url,
      captionFa: item.captionFa ?? '',
      captionEn: item.captionEn ?? '',
      altFa: item.altFa ?? '',
      altEn: item.altEn ?? '',
      description: item.description ?? '',
      license: item.license ?? '',
      source: item.source ?? '',
    });
  };

  const reset = () => {
    setEditingId(null);
    setForm(emptyMediaForm);
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.url.trim()) return;
    setSaving(true);
    const payload = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [
        key,
        typeof value === 'string' ? value.trim() || undefined : value,
      ]),
    );
    try {
      const id = encodeURIComponent(articleId);
      const saved = editingId
        ? await knowledgeApi.patch<KnowledgeMedia>(
            `/knowledge/${id}/media/${encodeURIComponent(editingId)}`,
            payload,
          )
        : await knowledgeApi.post<KnowledgeMedia>(`/knowledge/${id}/media`, payload);
      setItems((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
      reset();
      announce(editingId ? 'رسانه ویرایش شد.' : 'رسانه پیوست شد.');
    } catch (requestError) {
      report(requestError, 'ذخیره رسانه ناموفق بود.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('این رسانه از مقاله جدا شود؟')) return;
    try {
      await knowledgeApi.delete(
        `/knowledge/${encodeURIComponent(articleId)}/media/${encodeURIComponent(id)}`,
      );
      setItems((current) => current.filter((item) => item.id !== id));
      announce('رسانه حذف شد.');
    } catch (requestError) {
      report(requestError, 'حذف رسانه ناموفق بود.');
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      {items.length === 0 ? (
        <KnowledgeQueryState kind="empty" compact title="رسانه‌ای به مقاله پیوست نشده است" />
      ) : (
        <div className="grid content-start gap-3 md:grid-cols-2">
          {items.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-xl border">
              {item.type === 'image' || item.type === 'gif' || item.type === 'svg' ? (
                <img
                  src={item.url}
                  alt={item.altFa || item.captionFa || ''}
                  className="h-40 w-full bg-muted object-cover"
                />
              ) : (
                <div className="grid h-28 place-items-center bg-muted/40">
                  <FileImage className="size-8 text-muted-foreground" />
                </div>
              )}
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Badge variant="secondary">
                      {mediaTypes.find((type) => type.value === item.type)?.label ?? item.type}
                    </Badge>
                    <p className="mt-2 truncate text-sm font-medium">
                      {item.captionFa || item.captionEn || item.url}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground" dir="ltr">
                      {item.url}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <IconButton label="ویرایش" onClick={() => edit(item)} icon={Pencil} />
                    <IconButton
                      label="حذف"
                      onClick={() => void remove(item.id)}
                      icon={Trash2}
                      danger
                    />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {item.license ? <span>مجوز: {item.license}</span> : null}
                  {item.source ? <span>منبع: {item.source}</span> : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={(event) => void save(event)}
        className="h-fit space-y-3 rounded-xl border bg-muted/20 p-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{editingId ? 'ویرایش رسانه' : 'پیوست رسانه'}</h3>
          {editingId ? <IconButton label="انصراف" onClick={reset} icon={X} /> : null}
        </div>
        <FormField label="نوع">
          <select
            value={form.type}
            onChange={(event) =>
              setForm((current) => ({ ...current, type: event.target.value as KnowledgeMediaType }))
            }
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            {mediaTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="نشانی فایل">
          <Input
            dir="ltr"
            type="url"
            value={form.url}
            onChange={(event) => setForm((current) => ({ ...current, url: event.target.value }))}
            placeholder="https://…"
          />
        </FormField>
        <FormField label="عنوان فارسی">
          <Input
            value={form.captionFa}
            onChange={(event) =>
              setForm((current) => ({ ...current, captionFa: event.target.value }))
            }
          />
        </FormField>
        <FormField label="عنوان انگلیسی">
          <Input
            dir="ltr"
            value={form.captionEn}
            onChange={(event) =>
              setForm((current) => ({ ...current, captionEn: event.target.value }))
            }
          />
        </FormField>
        <div className="grid grid-cols-2 gap-2">
          <FormField label="متن جایگزین فارسی">
            <Input
              value={form.altFa}
              onChange={(event) =>
                setForm((current) => ({ ...current, altFa: event.target.value }))
              }
            />
          </FormField>
          <FormField label="Alt انگلیسی">
            <Input
              dir="ltr"
              value={form.altEn}
              onChange={(event) =>
                setForm((current) => ({ ...current, altEn: event.target.value }))
              }
            />
          </FormField>
        </div>
        <FormField label="توضیح">
          <Textarea
            value={form.description}
            onChange={(value) => setForm((current) => ({ ...current, description: value }))}
            rows={3}
          />
        </FormField>
        <div className="grid grid-cols-2 gap-2">
          <FormField label="مجوز">
            <Input
              dir="ltr"
              value={form.license}
              onChange={(event) =>
                setForm((current) => ({ ...current, license: event.target.value }))
              }
              placeholder="CC-BY-4.0"
            />
          </FormField>
          <FormField label="منبع">
            <Input
              value={form.source}
              onChange={(event) =>
                setForm((current) => ({ ...current, source: event.target.value }))
              }
            />
          </FormField>
        </div>
        <Button type="submit" className="w-full" disabled={saving || !form.url.trim()}>
          {editingId ? 'ذخیره ویرایش' : 'پیوست به مقاله'}
        </Button>
      </form>
    </div>
  );
}

function FormulaPanel({
  articleId,
  items,
  setItems,
  announce,
  report,
}: PanelProps<KnowledgeFormula>) {
  const [form, setForm] = useState(emptyFormulaForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const edit = (item: KnowledgeFormula) => {
    setEditingId(item.id);
    setForm({
      latex: item.latex,
      descriptionFa: item.descriptionFa ?? '',
      descriptionEn: item.descriptionEn ?? '',
      calculatorType: item.calculatorType ?? '',
    });
  };
  const reset = () => {
    setEditingId(null);
    setForm(emptyFormulaForm);
  };
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.latex.trim()) return;
    setSaving(true);
    const payload = {
      latex: form.latex.trim(),
      descriptionFa: form.descriptionFa.trim() || undefined,
      descriptionEn: form.descriptionEn.trim() || undefined,
      calculatorType: form.calculatorType.trim() || undefined,
    };
    try {
      const id = encodeURIComponent(articleId);
      const saved = editingId
        ? await knowledgeApi.patch<KnowledgeFormula>(
            `/knowledge/${id}/formulas/${encodeURIComponent(editingId)}`,
            payload,
          )
        : await knowledgeApi.post<KnowledgeFormula>(`/knowledge/${id}/formulas`, payload);
      setItems((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
      reset();
      announce(editingId ? 'فرمول ویرایش شد.' : 'فرمول افزوده شد.');
    } catch (requestError) {
      report(requestError, 'ذخیره فرمول ناموفق بود.');
    } finally {
      setSaving(false);
    }
  };
  const remove = async (id: string) => {
    if (!window.confirm('این فرمول حذف شود؟')) return;
    try {
      await knowledgeApi.delete(
        `/knowledge/${encodeURIComponent(articleId)}/formulas/${encodeURIComponent(id)}`,
      );
      setItems((current) => current.filter((item) => item.id !== id));
      announce('فرمول حذف شد.');
    } catch (requestError) {
      report(requestError, 'حذف فرمول ناموفق بود.');
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      {items.length === 0 ? (
        <KnowledgeQueryState kind="empty" compact title="فرمولی برای مقاله ثبت نشده است" />
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.id} className="rounded-xl border p-4">
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-500/10 font-bold text-violet-700">
                  {(index + 1).toLocaleString('fa-IR')}
                </span>
                <div className="min-w-0 flex-1">
                  <code
                    className="block overflow-x-auto rounded-lg bg-muted px-3 py-2 text-sm"
                    dir="ltr"
                  >
                    {item.latex}
                  </code>
                  {item.descriptionFa ? (
                    <p className="mt-3 text-sm leading-6">{item.descriptionFa}</p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {item.calculatorType ? (
                      <Badge variant="outline">محاسبه‌گر {item.calculatorType}</Badge>
                    ) : null}
                    {item.variables.length ? (
                      <span>{item.variables.length.toLocaleString('fa-IR')} متغیر</span>
                    ) : null}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <IconButton label="ویرایش" onClick={() => edit(item)} icon={Pencil} />
                  <IconButton
                    label="حذف"
                    onClick={() => void remove(item.id)}
                    icon={Trash2}
                    danger
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <form
        onSubmit={(event) => void save(event)}
        className="h-fit space-y-3 rounded-xl border bg-muted/20 p-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{editingId ? 'ویرایش فرمول' : 'افزودن فرمول'}</h3>
          {editingId ? <IconButton label="انصراف" onClick={reset} icon={X} /> : null}
        </div>
        <FormField label="LaTeX">
          <Textarea
            dir="ltr"
            value={form.latex}
            onChange={(value) => setForm((current) => ({ ...current, latex: value }))}
            rows={5}
            placeholder="I = \\frac{P}{U}"
          />
        </FormField>
        <FormField label="توضیح فارسی">
          <Textarea
            value={form.descriptionFa}
            onChange={(value) => setForm((current) => ({ ...current, descriptionFa: value }))}
            rows={3}
          />
        </FormField>
        <FormField label="توضیح انگلیسی">
          <Textarea
            dir="ltr"
            value={form.descriptionEn}
            onChange={(value) => setForm((current) => ({ ...current, descriptionEn: value }))}
            rows={3}
          />
        </FormField>
        <FormField label="نوع محاسبه‌گر مرتبط">
          <Input
            dir="ltr"
            value={form.calculatorType}
            onChange={(event) =>
              setForm((current) => ({ ...current, calculatorType: event.target.value }))
            }
            placeholder="CABLE-003"
          />
        </FormField>
        <Button type="submit" className="w-full" disabled={saving || !form.latex.trim()}>
          {editingId ? 'ذخیره ویرایش' : 'افزودن فرمول'}
        </Button>
      </form>
    </div>
  );
}

function ExamplesPanel({
  articleId,
  items,
  setItems,
  announce,
  report,
}: PanelProps<KnowledgeExample>) {
  const [form, setForm] = useState(emptyExampleForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const edit = (item: KnowledgeExample) => {
    setEditingId(item.id);
    setForm({
      titleFa: item.titleFa,
      titleEn: item.titleEn ?? '',
      difficulty: item.difficulty,
      steps: item.steps
        .map((step) => String(step.text ?? step.formula ?? ''))
        .filter(Boolean)
        .join('\n'),
      answer: item.answer ? String(item.answer.text ?? item.answer.value ?? '') : '',
      calculatorType: item.calculatorType ?? '',
    });
  };
  const reset = () => {
    setEditingId(null);
    setForm(emptyExampleForm);
  };
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.titleFa.trim()) return;
    setSaving(true);
    const payload = {
      titleFa: form.titleFa.trim(),
      titleEn: form.titleEn.trim() || undefined,
      difficulty: form.difficulty,
      steps: form.steps
        .split('\n')
        .map((text) => text.trim())
        .filter(Boolean)
        .map((text, index) => ({ order: index + 1, text })),
      answer: form.answer.trim() ? { text: form.answer.trim() } : undefined,
      calculatorType: form.calculatorType.trim() || undefined,
    };
    try {
      const id = encodeURIComponent(articleId);
      const saved = editingId
        ? await knowledgeApi.patch<KnowledgeExample>(
            `/knowledge/${id}/examples/${encodeURIComponent(editingId)}`,
            payload,
          )
        : await knowledgeApi.post<KnowledgeExample>(`/knowledge/${id}/examples`, payload);
      setItems((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
      reset();
      announce(editingId ? 'مثال ویرایش شد.' : 'مثال افزوده شد.');
    } catch (requestError) {
      report(requestError, 'ذخیره مثال ناموفق بود.');
    } finally {
      setSaving(false);
    }
  };
  const remove = async (id: string) => {
    if (!window.confirm('این مثال حل‌شده حذف شود؟')) return;
    try {
      await knowledgeApi.delete(
        `/knowledge/${encodeURIComponent(articleId)}/examples/${encodeURIComponent(id)}`,
      );
      setItems((current) => current.filter((item) => item.id !== id));
      announce('مثال حذف شد.');
    } catch (requestError) {
      report(requestError, 'حذف مثال ناموفق بود.');
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      {items.length === 0 ? (
        <KnowledgeQueryState kind="empty" compact title="مثال حل‌شده‌ای ثبت نشده است" />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{item.titleFa}</h3>
                    <Badge variant="secondary">{difficultyLabel(item.difficulty)}</Badge>
                  </div>
                  {item.titleEn ? (
                    <p className="mt-1 text-sm text-muted-foreground" dir="ltr">
                      {item.titleEn}
                    </p>
                  ) : null}
                  <ol className="mt-4 space-y-2">
                    {item.steps.map((step, index) => (
                      <li key={index} className="flex gap-2 text-sm leading-6">
                        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold">
                          {(index + 1).toLocaleString('fa-IR')}
                        </span>
                        <span>{String(step.text ?? step.formula ?? '')}</span>
                      </li>
                    ))}
                  </ol>
                  {item.answer ? (
                    <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm">
                      <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                        پاسخ:{' '}
                      </span>
                      {String(item.answer.text ?? item.answer.value ?? 'ثبت شده')}
                    </div>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-1">
                  <IconButton label="ویرایش" onClick={() => edit(item)} icon={Pencil} />
                  <IconButton
                    label="حذف"
                    onClick={() => void remove(item.id)}
                    icon={Trash2}
                    danger
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <form
        onSubmit={(event) => void save(event)}
        className="h-fit space-y-3 rounded-xl border bg-muted/20 p-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{editingId ? 'ویرایش مثال' : 'افزودن مثال حل‌شده'}</h3>
          {editingId ? <IconButton label="انصراف" onClick={reset} icon={X} /> : null}
        </div>
        <FormField label="عنوان فارسی">
          <Input
            value={form.titleFa}
            onChange={(event) =>
              setForm((current) => ({ ...current, titleFa: event.target.value }))
            }
          />
        </FormField>
        <FormField label="عنوان انگلیسی">
          <Input
            dir="ltr"
            value={form.titleEn}
            onChange={(event) =>
              setForm((current) => ({ ...current, titleEn: event.target.value }))
            }
          />
        </FormField>
        <FormField label="سطح دشواری">
          <select
            value={form.difficulty}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                difficulty: event.target.value as ExampleDifficulty,
              }))
            }
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="basic">مقدماتی</option>
            <option value="intermediate">متوسط</option>
            <option value="advanced">پیشرفته</option>
          </select>
        </FormField>
        <FormField label="مراحل حل (هر مرحله یک خط)">
          <Textarea
            value={form.steps}
            onChange={(value) => setForm((current) => ({ ...current, steps: value }))}
            rows={7}
          />
        </FormField>
        <FormField label="پاسخ نهایی">
          <Input
            value={form.answer}
            onChange={(event) => setForm((current) => ({ ...current, answer: event.target.value }))}
          />
        </FormField>
        <FormField label="محاسبه‌گر مرتبط">
          <Input
            dir="ltr"
            value={form.calculatorType}
            onChange={(event) =>
              setForm((current) => ({ ...current, calculatorType: event.target.value }))
            }
          />
        </FormField>
        <Button type="submit" className="w-full" disabled={saving || !form.titleFa.trim()}>
          {editingId ? 'ذخیره ویرایش' : 'افزودن مثال'}
        </Button>
      </form>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Textarea({
  value,
  onChange,
  rows,
  dir,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  rows: number;
  dir?: 'rtl' | 'ltr';
  placeholder?: string;
}) {
  return (
    <textarea
      dir={dir}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
    />
  );
}

function IconButton({
  label,
  onClick,
  icon: Icon,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  icon: typeof Pencil;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`grid size-8 place-items-center rounded-lg border bg-background transition hover:bg-muted ${danger ? 'text-destructive' : 'text-muted-foreground hover:text-foreground'}`}
      aria-label={label}
      title={label}
    >
      <Icon className="size-4" />
    </button>
  );
}

function difficultyLabel(value: ExampleDifficulty) {
  if (value === 'advanced') return 'پیشرفته';
  if (value === 'intermediate') return 'متوسط';
  return 'مقدماتی';
}
