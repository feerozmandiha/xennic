'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Send, Archive, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { useToast } from '@/stores/toast.store';
import { apiClient } from '@/lib/api/client';
import { KnowledgeEditor } from './knowledge-editor';
import { TaxonomySelect } from './taxonomy-select';
import { StandardsManager } from './standards-manager';

const DIFFICULTIES = [
  { value: 'beginner', label: 'مبتدی' },
  { value: 'intermediate', label: 'متوسط' },
  { value: 'advanced', label: 'پیشرفته' },
  { value: 'expert', label: 'متخصص' },
];

const VISIBILITIES = [
  { value: 'public', label: 'عمومی' },
  { value: 'workspace', label: 'فضای کاری' },
  { value: 'private', label: 'خصوصی' },
];

interface TaxonomyEntry {
  id: string;
  taxonomy_type: string;
  taxonomy_id: string;
}

interface Props {
  articleId: string;
}

export function KnowledgeEditClient({ articleId }: Props) {
  const t = useTranslations('knowledge');
  const tCommon = useTranslations('common');
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<Record<string, unknown>>({});
  const [difficulty, setDifficulty] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [articleStatus, setArticleStatus] = useState<string>('draft');
  const [selectedTaxonomy, setSelectedTaxonomy] = useState<Record<string, string[]>>({
    category: [],
    topic: [],
    tag: [],
    discipline: [],
    audience: [],
  });

  const { data, isLoading } = useQuery({
    queryKey: ['knowledge', articleId],
    queryFn: () => apiClient.get<any>(`/knowledge/${articleId}`),
    enabled: !!articleId,
    retry: false,
  });

  const taxonomyQuery = useQuery({
    queryKey: ['knowledge', articleId, 'taxonomy'],
    queryFn: () => apiClient.get<{ data: TaxonomyEntry[] }>(`/knowledge/${articleId}/taxonomy`),
    enabled: !!articleId,
  });

  const standardsQuery = useQuery({
    queryKey: ['knowledge', articleId, 'standards'],
    queryFn: () =>
      apiClient.get<{ success: boolean; data: any[] }>(`/knowledge/${articleId}/standards`),
    enabled: !!articleId,
  });

  useEffect(() => {
    if (data?.data) {
      setSlug(data.data.slug ?? '');
      const c = data.data.content ?? {};
      setTitle((c as any).title ?? '');
      setContent((c as any).doc ?? c);
      setDifficulty(data.data.difficulty ?? '');
      setVisibility(data.data.visibility ?? 'public');
      setArticleStatus(data.data.status ?? 'draft');
    }
  }, [data]);

  useEffect(() => {
    if (taxonomyQuery.data?.data) {
      const grouped: Record<string, string[]> = {
        category: [],
        topic: [],
        tag: [],
        discipline: [],
        audience: [],
      };
      for (const entry of taxonomyQuery.data.data) {
        if (grouped[entry.taxonomy_type]) {
          grouped[entry.taxonomy_type].push(entry.taxonomy_id);
        }
      }
      setSelectedTaxonomy(grouped);
    }
  }, [taxonomyQuery.data]);

  const mutation = useMutation({
    mutationFn: async (variables: {
      slug: string;
      title: string;
      content: Record<string, unknown>;
      difficulty: string;
      visibility: string;
      taxonomy: Record<string, string[]>;
      existingTaxonomy: TaxonomyEntry[];
    }) => {
      await apiClient.patch(`/knowledge/${articleId}`, {
        slug: variables.slug.trim() || undefined,
        content: { title: variables.title.trim(), doc: variables.content },
        difficulty: variables.difficulty || null,
        visibility: variables.visibility,
      });

      const current: Record<string, string[]> = {
        category: [],
        topic: [],
        tag: [],
        discipline: [],
        audience: [],
      };
      for (const entry of variables.existingTaxonomy) {
        if (current[entry.taxonomy_type]) {
          current[entry.taxonomy_type].push(entry.taxonomy_id);
        }
      }

      const toAdd: { type: string; id: string }[] = [];
      const toRemove: string[] = [];

      for (const [type, ids] of Object.entries(variables.taxonomy)) {
        const existing = current[type] ?? [];
        for (const id of ids) {
          if (!existing.includes(id)) toAdd.push({ type, id });
        }
        for (const id of existing) {
          if (!ids.includes(id)) {
            const entry = variables.existingTaxonomy.find(
              (e) => e.taxonomy_type === type && e.taxonomy_id === id,
            );
            if (entry) toRemove.push(entry.id);
          }
        }
      }

      await Promise.all([
        ...toAdd.map(({ type, id }) =>
          apiClient
            .post(`/knowledge/${articleId}/taxonomy`, {
              taxonomyType: type,
              taxonomyId: id,
            })
            .catch(() => {}),
        ),
        ...toRemove.map((id) =>
          apiClient.delete(`/knowledge/${articleId}/taxonomy/${id}`).catch(() => {}),
        ),
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
      toast.success('مقاله به‌روزرسانی شد');
      router.push(`/${locale}/knowledge-manage/${articleId}`);
    },
    onError: (err: any) => {
      toast.error(err?.message ?? 'خطا در به‌روزرسانی مقاله');
    },
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      // Save any pending edits first, then publish.
      await mutation.mutateAsync({
        slug,
        title,
        content,
        difficulty,
        visibility,
        taxonomy: selectedTaxonomy,
        existingTaxonomy: taxonomyQuery.data?.data ?? [],
      });
      return apiClient.post<{ success: boolean; data: any }>(`/knowledge/${articleId}/publish`, {});
    },
    onSuccess: (res) => {
      setArticleStatus(res.data.data?.status ?? 'published');
      queryClient.invalidateQueries({ queryKey: ['knowledge', articleId] });
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
      toast.success('مقاله منتشر شد');
    },
    onError: (err: any) => {
      toast.error(err?.message ?? 'خطا در انتشار مقاله');
    },
  });

  const _archiveMutation = useMutation({
    mutationFn: () => apiClient.post(`/knowledge/${articleId}/archive`, {}),
    onSuccess: () => {
      setArticleStatus('archived');
      queryClient.invalidateQueries({ queryKey: ['knowledge', articleId] });
      toast.success('مقاله بایگانی شد');
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate({
      slug,
      title,
      content,
      difficulty,
      visibility,
      taxonomy: selectedTaxonomy,
      existingTaxonomy: taxonomyQuery.data?.data ?? [],
    });
  }

  const statusBadge = (() => {
    switch (articleStatus) {
      case 'published':
        return {
          label: 'منتشر شده',
          cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
          Icon: CheckCircle2,
        };
      case 'review':
        return {
          label: 'در حال بازبینی',
          cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
          Icon: Clock,
        };
      case 'archived':
        return {
          label: 'بایگانی شده',
          cls: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
          Icon: Archive,
        };
      default:
        return {
          label: 'پیش‌نویس',
          cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
          Icon: Clock,
        };
    }
  })();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24">
        <p className="text-[hsl(var(--muted-foreground))]">مقاله یافت نشد</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          {tCommon('back')}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {tCommon('back')}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <PageHeader
          title={t('editArticle')}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusBadge.cls}`}
              >
                <statusBadge.Icon className="h-3.5 w-3.5" />
                {statusBadge.label}
              </span>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={mutation.isPending || publishMutation.isPending}
              >
                {tCommon('cancel')}
              </Button>
              <Button type="submit" variant="outline" loading={mutation.isPending}>
                {tCommon('save')}
              </Button>
              {articleStatus !== 'published' && articleStatus !== 'archived' && (
                <Button
                  type="button"
                  onClick={() => publishMutation.mutate()}
                  loading={publishMutation.isPending}
                  className="gap-1.5 bg-gradient-to-l from-[hsl(var(--primary))] to-[hsl(var(--accent))] shadow-md shadow-[hsl(var(--primary)/0.2)]"
                >
                  <Send className="h-4 w-4" />
                  انتشار
                </Button>
              )}
            </div>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">محتوای مقاله</CardTitle>
              </CardHeader>
              <CardContent>
                <KnowledgeEditor
                  key={`editor-${articleId}`}
                  content={content}
                  onChange={setContent}
                  placeholder="شروع به نوشتن کنید..."
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">اطلاعات مقاله</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="عنوان"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={mutation.isPending}
                />

                <Input
                  label={t('slug')}
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  disabled={mutation.isPending}
                  dir="ltr"
                />

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">سطح دشواری</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="flex w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] disabled:opacity-50"
                  >
                    <option value="">بدون سطح</option>
                    {DIFFICULTIES.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">دید</label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="flex w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] disabled:opacity-50"
                  >
                    {VISIBILITIES.map((v) => (
                      <option key={v.value} value={v.value}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">دسته‌بندی</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <TaxonomySelect
                  type="category"
                  selected={selectedTaxonomy.category ?? []}
                  onChange={(ids) => setSelectedTaxonomy((p) => ({ ...p, category: ids }))}
                />
                <TaxonomySelect
                  type="topic"
                  selected={selectedTaxonomy.topic ?? []}
                  onChange={(ids) => setSelectedTaxonomy((p) => ({ ...p, topic: ids }))}
                />
                <TaxonomySelect
                  type="tag"
                  selected={selectedTaxonomy.tag ?? []}
                  onChange={(ids) => setSelectedTaxonomy((p) => ({ ...p, tag: ids }))}
                />
                <TaxonomySelect
                  type="discipline"
                  selected={selectedTaxonomy.discipline ?? []}
                  onChange={(ids) => setSelectedTaxonomy((p) => ({ ...p, discipline: ids }))}
                />
                <TaxonomySelect
                  type="audience"
                  selected={selectedTaxonomy.audience ?? []}
                  onChange={(ids) => setSelectedTaxonomy((p) => ({ ...p, audience: ids }))}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">استانداردها</CardTitle>
              </CardHeader>
              <CardContent>
                <StandardsManager
                  articleId={articleId}
                  linked={standardsQuery.data?.data ?? []}
                  onLinkedChange={() => standardsQuery.refetch()}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
