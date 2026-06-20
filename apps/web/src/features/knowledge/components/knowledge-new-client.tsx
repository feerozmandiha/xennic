'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { useAuthStore } from '@/stores/auth.store';
import { useToast }     from '@/stores/toast.store';
import { apiClient }    from '@/lib/api/client';
import { KnowledgeEditor } from './knowledge-editor';
import { TaxonomySelect }  from './taxonomy-select';

const DIFFICULTIES = [
  { value: 'beginner',     label: 'مبتدی' },
  { value: 'intermediate', label: 'متوسط' },
  { value: 'advanced',     label: 'پیشرفته' },
  { value: 'expert',       label: 'متخصص' },
];

export function KnowledgeNewClient() {
  const t           = useTranslations('knowledge');
  const tCommon     = useTranslations('common');
  const params      = useParams();
  const locale      = (params?.locale as string) ?? 'fa';
  const router      = useRouter();
  const wsId        = useAuthStore(s => s.workspaceId);
  const toast       = useToast();

  const [slug, setSlug]       = useState('');
  const [title, setTitle]     = useState('');
  const [content, setContent] = useState<Record<string, unknown>>({});
  const [difficulty, setDifficulty] = useState('');
  const [error, setError]           = useState('');
  const [selected, setSelected] = useState<Record<string, string[]>>({
    category: [], topic: [], tag: [], discipline: [], audience: [],
  });

  const mutation = useMutation({
    mutationFn: async (body: any) => {
      const res = await apiClient.post<any>('/knowledge', body);
      return res.data;
    },
    onSuccess: (res: any) => {
      toast.success('مقاله ایجاد شد');
      router.push(`/${locale}/knowledge/${res.id}`);
    },
    onError: (err: any) => {
      setError(err?.message ?? 'خطا در ایجاد مقاله');
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!slug.trim()) { setError('slug مقاله الزامی است'); return; }
    if (!title.trim()) { setError('عنوان مقاله الزامی است'); return; }
    setError('');
    const taxonomy = [];
    for (const [type, ids] of Object.entries(selected)) {
      for (const id of ids) {
        taxonomy.push({ taxonomyType: type, taxonomyId: id });
      }
    }
    mutation.mutate({
      slug: slug.trim(),
      content: { title: title.trim(), doc: content },
      difficulty: difficulty || undefined,
      taxonomy: taxonomy.length > 0 ? taxonomy : undefined,
    });
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
          title={t('newArticle')}
          action={
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={mutation.isPending}>
                {tCommon('cancel')}
              </Button>
              <Button type="submit" loading={mutation.isPending}>
                {tCommon('save')}
              </Button>
            </div>
          }
        />

        {error && (
          <div className="text-sm text-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.08)] border border-[hsl(var(--destructive)/0.2)] rounded-[var(--radius)] px-3 py-2 text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">محتوای مقاله</CardTitle>
              </CardHeader>
              <CardContent>
                <KnowledgeEditor
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
                  onChange={e => setTitle(e.target.value)}
                  placeholder="عنوان مقاله"
                  required
                  disabled={mutation.isPending}
                />

                <Input
                  label={t('slug')}
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  placeholder="مثال: understanding-arc-flash"
                  required
                  autoFocus
                  disabled={mutation.isPending}
                  dir="ltr"
                />

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium">سطح دشواری</label>
                  <select
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value)}
                    className="flex w-full rounded-[var(--radius)] border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] disabled:opacity-50"
                  >
                    <option value="">بدون سطح</option>
                    {DIFFICULTIES.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
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
                  selected={selected.category ?? []}
                  onChange={ids => setSelected(p => ({ ...p, category: ids }))}
                />
                <TaxonomySelect
                  type="topic"
                  selected={selected.topic ?? []}
                  onChange={ids => setSelected(p => ({ ...p, topic: ids }))}
                />
                <TaxonomySelect
                  type="tag"
                  selected={selected.tag ?? []}
                  onChange={ids => setSelected(p => ({ ...p, tag: ids }))}
                />
                <TaxonomySelect
                  type="discipline"
                  selected={selected.discipline ?? []}
                  onChange={ids => setSelected(p => ({ ...p, discipline: ids }))}
                />
                <TaxonomySelect
                  type="audience"
                  selected={selected.audience ?? []}
                  onChange={ids => setSelected(p => ({ ...p, audience: ids }))}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
