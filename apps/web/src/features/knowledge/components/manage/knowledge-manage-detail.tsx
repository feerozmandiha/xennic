'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, ArrowLeft, Eye, Clock, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { manageKnowledgeApi } from '@/features/knowledge/lib/manage-api';
import { getArticleTitle } from '@/features/knowledge/lib/knowledge-api';
import { KnowledgeRenderer } from '../knowledge-editor';
import { FormulasManagerModern } from './formulas-manager-modern';
import { ExamplesManagerModern } from './examples-manager-modern';
import { StandardsManagerModern } from './standards-manager-modern';
import { DIFFICULTY_META } from '@/features/knowledge/lib/taxonomy-data';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function KnowledgeManageDetail({ articleId }: { articleId: string }) {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';

  const { data, isLoading } = useQuery({
    queryKey: ['manage-knowledge-detail', articleId],
    queryFn: async () => {
      const res = await import('@/lib/api/client').then(({ apiClient }) =>
        apiClient.get<any>(`/knowledge/${articleId}`),
      );
      return res.data;
    },
  });

  const { data: analytics } = useQuery({
    queryKey: ['knowledge', articleId, 'analytics-manage'],
    queryFn: () => manageKnowledgeApi.getAnalytics(articleId).then((r) => r.data),
    enabled: !!articleId,
  });

  const { data: versions } = useQuery({
    queryKey: ['knowledge', articleId, 'versions-manage'],
    queryFn: () => manageKnowledgeApi.getVersions(articleId).then((r) => r.data),
    enabled: !!articleId,
  });

  const article = data as any;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-16">
        <BookOpen className="h-12 w-12 mx-auto opacity-20 mb-3" />
        <p>مقاله یافت نشد</p>
        <Link href={`/${locale}/knowledge-manage`}>
          <Button variant="outline" className="mt-3">
            بازگشت
          </Button>
        </Link>
      </div>
    );
  }

  const diff = article.difficulty ? DIFFICULTY_META[article.difficulty] : null;

  return (
    <div>
      <div className="mb-4">
        <Link
          href={`/${locale}/knowledge-manage`}
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> بازگشت به لیست
        </Link>
      </div>

      <PageHeader
        title={getArticleTitle(article)}
        description={
          <span className="flex items-center gap-2">
            <Badge
              variant={article.status === 'published' ? 'default' : 'secondary'}
              className="text-[11px]"
            >
              {article.status}
            </Badge>
            {diff && <Badge className={cn('text-[10px] border-0', diff.color)}>{diff.fa}</Badge>}
            <span>v{article.version}</span>
          </span>
        }
        action={
          <div className="flex gap-2">
            <Link href={`/${locale}/knowledge-manage/${articleId}/edit`}>
              <Button variant="outline" size="sm">
                ویرایش
              </Button>
            </Link>
            <Link href={`/${locale}/knowledge/${article.slug}`} target="_blank">
              <Button size="sm">
                <Eye className="h-4 w-4" /> مشاهده عمومی
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">محتوا</CardTitle>
            </CardHeader>
            <CardContent>
              <KnowledgeRenderer content={article.content} />
            </CardContent>
          </Card>

          <FormulasManagerModern articleId={articleId} />
          <ExamplesManagerModern articleId={articleId} />
        </div>

        <div className="space-y-6">
          <StandardsManagerModern articleId={articleId} />

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> آمار
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {analytics ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">بازدید</span>
                    <span className="font-bold">
                      {analytics.views?.toLocaleString('fa-IR') ?? 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">یکتا</span>
                    <span>{analytics.uniqueViews?.toLocaleString('fa-IR') ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">لایک</span>
                    <span>{analytics.likes ?? 0}</span>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">آماری نیست</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" /> نسخه‌ها
              </CardTitle>
            </CardHeader>
            <CardContent>
              {versions && versions.length > 0 ? (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {versions.slice(0, 5).map((v: any) => (
                    <div
                      key={v.id}
                      className="flex justify-between text-xs p-2 rounded-lg hover:bg-secondary"
                    >
                      <span>v{v.version}</span>
                      <span className="text-muted-foreground">
                        {new Date(v.createdAt).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">نسخه‌ای نیست</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">اطلاعات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">زبان</span>
                <span>{article.language}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">دید</span>
                <span>{article.visibility}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ایجاد</span>
                <span>{new Date(article.createdAt).toLocaleDateString('fa-IR')}</span>
              </div>
              {article.publishedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">انتشار</span>
                  <span>{new Date(article.publishedAt).toLocaleDateString('fa-IR')}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
