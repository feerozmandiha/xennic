'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen, ArrowLeft, Edit3, Trash2, Send,
  Archive, RotateCcw, CheckCircle, XCircle, Eye, History,
  MessageSquare, Reply, ThumbsUp, Pencil, X, Clock, User, Check,
  AlertCircle, Loader2, Calculator,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge }    from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button }   from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { useAuthStore } from '@/stores/auth.store';
import { useToast }     from '@/stores/toast.store';
import { apiClient }    from '@/lib/api/client';
import { cn }           from '@/lib/utils';
import { KnowledgeRenderer } from './knowledge-editor';

const STATUS_VARIANT: Record<string, 'success' | 'secondary' | 'warning' | 'destructive'> = {
  published: 'success',
  draft:     'secondary',
  review:    'warning',
  archived:  'destructive',
};

const STATUS_FA: Record<string, string> = {
  published: 'منتشرشده',
  draft:     'پیش‌نویس',
  review:    'در انتظار بررسی',
  archived:  'آرشیو',
};

const DIFFICULTY_FA: Record<string, string> = {
  beginner:     'مبتدی',
  intermediate: 'متوسط',
  advanced:     'پیشرفته',
  expert:       'متخصص',
};

const VISIBILITY_FA: Record<string, string> = {
  public:    'عمومی',
  private:   'خصوصی',
  workspace: 'فضای کاری',
};

interface TaxonomyEntry {
  id: string;
  taxonomy_type: string;
  taxonomy_id: string;
  name?: string;
}

interface Props {
  articleId: string;
}

export function KnowledgeDetailClient({ articleId }: Props) {
  const t           = useTranslations('knowledge');
  const tCommon     = useTranslations('common');
  const params      = useParams();
  const locale      = (params?.locale as string) ?? 'fa';
  const wsId        = useAuthStore(s => s.workspaceId);
  const toast       = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['knowledge', articleId],
    queryFn:  () => apiClient.get<any>(`/knowledge/${articleId}`),
    enabled:  !!articleId,
    retry: false,
  });

  const taxonomyQuery = useQuery({
    queryKey: ['knowledge', articleId, 'taxonomy'],
    queryFn:  () => apiClient.get<{ data: TaxonomyEntry[] }>(`/knowledge/${articleId}/taxonomy`),
    enabled:  !!articleId,
  });

  const publishMutation = useMutation({
    mutationFn: () => apiClient.post(`/knowledge/${articleId}/publish`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['knowledge'] }); toast.success('مقاله منتشر شد'); },
    onError: () => toast.error('خطا در انتشار مقاله'),
  });

  const archiveMutation = useMutation({
    mutationFn: () => apiClient.post(`/knowledge/${articleId}/archive`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['knowledge'] }); toast.success('مقاله بایگانی شد'); },
    onError: () => toast.error('خطا در بایگانی مقاله'),
  });

  const restoreMutation = useMutation({
    mutationFn: () => apiClient.post(`/knowledge/${articleId}/restore`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['knowledge'] }); toast.success('مقاله بازیابی شد'); },
    onError: () => toast.error('خطا در بازیابی مقاله'),
  });

  const reviewMutation = useMutation({
    mutationFn: () => apiClient.post(`/knowledge/${articleId}/review`, { reviewerId: '' }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['knowledge'] }); toast.success('درخواست بررسی ثبت شد'); },
    onError: () => toast.error('خطا در ثبت درخواست بررسی'),
  });

  const rejectMutation = useMutation({
    mutationFn: () => apiClient.post(`/knowledge/${articleId}/reject`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['knowledge'] }); toast.success('بررسی رد شد'); },
    onError: () => toast.error('خطا در رد بررسی'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiClient.delete(`/knowledge/${articleId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge'] });
      toast.success('مقاله حذف شد');
    },
    onError: () => toast.error('خطا در حذف مقاله'),
  });

  // ── Comments ─────────────────────────────────────────────────────────────

  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const commentsQuery = useQuery({
    queryKey: ['knowledge', articleId, 'comments'],
    queryFn:  () => apiClient.get<{ data: any[] }>(`/knowledge/${articleId}/comments`),
    enabled:  !!articleId,
  });

  const createCommentMutation = useMutation({
    mutationFn: (body: { content: string; parentId?: string }) =>
      apiClient.post(`/knowledge/${articleId}/comments`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge', articleId, 'comments'] });
      toast.success('نظر ثبت شد');
      setCommentText('');
      setReplyTo(null);
      setReplyText('');
    },
    onError: () => toast.error('خطا در ثبت نظر'),
  });

  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      apiClient.patch(`/knowledge/${articleId}/comments/${commentId}`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge', articleId, 'comments'] });
      toast.success('نظر ویرایش شد');
      setEditingComment(null);
      setEditText('');
    },
    onError: () => toast.error('خطا در ویرایش نظر'),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) =>
      apiClient.delete(`/knowledge/${articleId}/comments/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge', articleId, 'comments'] });
      toast.success('نظر حذف شد');
    },
    onError: () => toast.error('خطا در حذف نظر'),
  });

  // ── Workflow ─────────────────────────────────────────────────────────────

  const [wfComment, setWfComment] = useState('');

  const workflowQuery = useQuery({
    queryKey: ['knowledge', articleId, 'workflow'],
    queryFn:  () => apiClient.get<{ data: any }>(`/knowledge/${articleId}/workflow`),
    enabled:  !!articleId,
  });

  const submitWorkflowMutation = useMutation({
    mutationFn: (comment: string) =>
      apiClient.post(`/knowledge/${articleId}/workflow/submit`, { comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge', articleId, 'workflow'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge', articleId] });
      toast.success('برای بررسی ارسال شد');
      setWfComment('');
    },
    onError: () => toast.error('خطا'),
  });

  const approveWorkflowMutation = useMutation({
    mutationFn: (comment: string) =>
      apiClient.post(`/knowledge/${articleId}/workflow/approve`, { comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge', articleId, 'workflow'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge', articleId] });
      toast.success('تأیید شد');
      setWfComment('');
    },
    onError: () => toast.error('خطا'),
  });

  const rejectWorkflowMutation = useMutation({
    mutationFn: (comment: string) =>
      apiClient.post(`/knowledge/${articleId}/workflow/reject`, { comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge', articleId, 'workflow'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge', articleId] });
      toast.success('رد شد');
      setWfComment('');
    },
    onError: () => toast.error('خطا'),
  });

  const versionsQuery = useQuery({
    queryKey: ['knowledge', articleId, 'versions'],
    queryFn:  () => apiClient.get<{ data: any[] }>(`/knowledge/${articleId}/versions`),
    enabled:  !!articleId,
  });

  const restoreVersionMutation = useMutation({
    mutationFn: (versionId: string) =>
      apiClient.post(`/knowledge/${articleId}/versions/${versionId}/restore`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge', articleId] });
      queryClient.invalidateQueries({ queryKey: ['knowledge', articleId, 'versions'] });
      toast.success('نسخه بازیابی شد');
    },
    onError: () => toast.error('خطا در بازیابی نسخه'),
  });

  const analyticsQuery = useQuery({
    queryKey: ['knowledge', articleId, 'analytics'],
    queryFn:  () => apiClient.get<{ data: any }>(`/knowledge/${articleId}/analytics`),
    enabled:  !!articleId,
  });

  const relatedCalcQuery = useQuery({
    queryKey: ['knowledge', articleId, 'related-calculations'],
    queryFn:  () => apiClient.get<{ data: any[] }>(`/knowledge/${articleId}/related-calculations`),
    enabled:  !!articleId,
  });

  const standardsQuery = useQuery({
    queryKey: ['knowledge', articleId, 'standards'],
    queryFn:  () => apiClient.get<{ success: boolean; data: any[] }>(`/knowledge/${articleId}/standards`),
    enabled:  !!articleId,
  });

  const article = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-24">
        <BookOpen className="h-12 w-12 mx-auto text-[hsl(var(--muted-foreground))] opacity-30 mb-4" />
        <h3 className="font-semibold text-base mb-2">مقاله یافت نشد</h3>
        <Button variant="outline" onClick={() => window.history.back()}>
          {tCommon('back')}
        </Button>
      </div>
    );
  }

  const taxonomy = taxonomyQuery.data?.data ?? [];
  const taxonomyByType: Record<string, { name: string; color?: string }[]> = {};
  const comments = commentsQuery.data?.data ?? [];
  const workflowData = workflowQuery.data?.data ?? null;
  const analyticsData = analyticsQuery.data?.data ?? null;

  return (
    <div>
      <PageHeader
        title={(article.content?.title as string) || article.slug}
        description={
          <span className="flex items-center gap-2">
            <Badge variant={STATUS_VARIANT[article.status] ?? 'secondary'}>
              {STATUS_FA[article.status] ?? article.status}
            </Badge>
            <span>v{article.version}</span>
            {article.difficulty && <span>· {DIFFICULTY_FA[article.difficulty] ?? article.difficulty}</span>}
            {article.language === 'fa' ? <span>· فارسی</span> : <span>· English</span>}
          </span>
        }
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={`/${locale}/knowledge/${articleId}/edit`}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[var(--radius)] border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--secondary))] transition-colors"
            >
              <Edit3 className="h-3.5 w-3.5" />
              ویرایش
            </a>

            {article.status === 'draft' && (
              <button
                onClick={() => reviewMutation.mutate()}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[var(--radius)] border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--secondary))] transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
                ارسال برای بررسی
              </button>
            )}

            {article.status === 'review' && (
              <>
                <button
                  onClick={() => publishMutation.mutate()}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[var(--radius)] bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  تأیید و انتشار
                </button>
                <button
                  onClick={() => rejectMutation.mutate()}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[var(--radius)] border border-[hsl(var(--destructive))] text-[hsl(var(--destructive))] text-sm hover:bg-[hsl(var(--destructive)/0.08)] transition-colors"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  رد
                </button>
              </>
            )}

            {article.status === 'published' && (
              <button
                onClick={() => archiveMutation.mutate()}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[var(--radius)] border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--secondary))] transition-colors"
              >
                <Archive className="h-3.5 w-3.5" />
                بایگانی
              </button>
            )}

            {article.status === 'archived' && (
              <button
                onClick={() => restoreMutation.mutate()}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[var(--radius)] border border-[hsl(var(--border))] text-sm hover:bg-[hsl(var(--secondary))] transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                بازیابی
              </button>
            )}

            <button
              onClick={() => deleteMutation.mutate()}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[var(--radius)] text-[hsl(var(--destructive))] text-sm hover:bg-[hsl(var(--destructive)/0.08)] transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              حذف
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">محتوای مقاله</CardTitle>
            </CardHeader>
            <CardContent className="min-h-[200px]">
              {article.content && Object.keys(article.content).length > 0 ? (
                <KnowledgeRenderer content={article.content} />
              ) : (
                <p className="text-sm text-[hsl(var(--muted-foreground))] italic">محتوایی ثبت نشده است</p>
              )}
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                نظرات
                {comments.length > 0 && (
                  <Badge variant="secondary" className="text-[10px]">{comments.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add comment form */}
              <div className="flex gap-2">
                <input
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && commentText.trim()) createCommentMutation.mutate({ content: commentText.trim() }); }}
                  placeholder="نظر خود را بنویسید..."
                  className="flex-1 h-9 px-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm outline-none focus:border-[hsl(var(--primary))]"
                />
                <button
                  onClick={() => { if (commentText.trim()) createCommentMutation.mutate({ content: commentText.trim() }); }}
                  disabled={createCommentMutation.isPending || !commentText.trim()}
                  className="h-9 px-4 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {createCommentMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  ارسال
                </button>
              </div>

              {/* Comments list */}
              {commentsQuery.isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 bg-[hsl(var(--secondary)/0.5)] rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : comments.length === 0 ? (
                <p className="text-xs text-[hsl(var(--muted-foreground))] italic text-center py-4">
                  هنوز نظری ثبت نشده است
                </p>
              ) : (
                <div className="space-y-3">
                  {comments.map((c: any) => {
                    const isReply = !!c.parentId;
                    return (
                      <div key={c.id} className={cn(
                        'px-3 py-3 rounded-xl',
                        isReply ? 'mr-6 bg-[hsl(var(--secondary)/0.2)]' : 'bg-[hsl(var(--secondary)/0.1)]',
                      )}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] mb-1">
                            <User className="h-3 w-3" />
                            <span className="font-mono text-[10px]">{c.userId?.slice(0, 8)}</span>
                            <span>·</span>
                            <span>{new Date(c.createdAt).toLocaleDateString('fa-IR')}</span>
                            {c.isEdited && <Badge variant="outline" className="text-[9px] h-4">ویرایش شده</Badge>}
                          </div>
                        </div>

                        {editingComment === c.id ? (
                          <div className="flex gap-2">
                            <input
                              value={editText}
                              onChange={e => setEditText(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter' && editText.trim())
                                  updateCommentMutation.mutate({ commentId: c.id, content: editText.trim() });
                                if (e.key === 'Escape') { setEditingComment(null); setEditText(''); }
                              }}
                              className="flex-1 h-8 px-2 rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm outline-none focus:border-[hsl(var(--primary))]"
                              autoFocus
                            />
                            <button onClick={() => updateCommentMutation.mutate({ commentId: c.id, content: editText.trim() })}
                              disabled={!editText.trim()}
                              className="h-8 px-2 rounded bg-[hsl(var(--primary))] text-white text-xs">
                              ذخیره
                            </button>
                            <button onClick={() => { setEditingComment(null); setEditText(''); }}
                              className="h-8 px-2 rounded border border-[hsl(var(--border))] text-xs">
                              لغو
                            </button>
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed">{c.content}</p>
                        )}

                        <div className="flex items-center gap-2 mt-2">
                          {!isReply && (
                            <button
                              onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}
                              className="text-[10px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] flex items-center gap-1"
                            >
                              <Reply className="h-3 w-3" />
                              پاسخ
                            </button>
                          )}
                          {c.userId === wsId && (
                            <>
                              <button
                                onClick={() => { setEditingComment(c.id); setEditText(c.content); }}
                                className="text-[10px] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] flex items-center gap-1"
                              >
                                <Pencil className="h-3 w-3" />
                                ویرایش
                              </button>
                              <button
                                onClick={() => { if (confirm('آیا از حذف نظر مطمئن هستید؟')) deleteCommentMutation.mutate(c.id); }}
                                className="text-[10px] text-red-400 hover:text-red-500 flex items-center gap-1"
                              >
                                <X className="h-3 w-3" />
                                حذف
                              </button>
                            </>
                          )}
                        </div>

                        {/* Reply form */}
                        {replyTo === c.id && (
                          <div className="flex gap-2 mt-2">
                            <input
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter' && replyText.trim()) createCommentMutation.mutate({ content: replyText.trim(), parentId: c.id }); }}
                              placeholder={`پاسخ به ${c.userId?.slice(0, 8)}...`}
                              className="flex-1 h-8 px-2 rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm outline-none focus:border-[hsl(var(--primary))]"
                              autoFocus
                            />
                            <button onClick={() => { if (replyText.trim()) createCommentMutation.mutate({ content: replyText.trim(), parentId: c.id }); }}
                              disabled={!replyText.trim()}
                              className="h-8 px-2 rounded bg-[hsl(var(--primary))] text-white text-xs">
                              پاسخ
                            </button>
                            <button onClick={() => { setReplyTo(null); setReplyText(''); }}
                              className="h-8 px-2 rounded border border-[hsl(var(--border))] text-xs">
                              لغو
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">اطلاعات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">شناسه</span>
                <span className="font-mono text-xs" dir="ltr">{article.id?.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">وضعیت</span>
                <Badge variant={STATUS_VARIANT[article.status] ?? 'secondary'} className="text-[10px]">
                  {STATUS_FA[article.status] ?? article.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">نسخه</span>
                <span>{article.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">زبان</span>
                <span>{article.language === 'fa' ? 'فارسی' : 'English'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">دید</span>
                <span>{VISIBILITY_FA[article.visibility] ?? article.visibility}</span>
              </div>
              {article.authorId && (
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">نویسنده</span>
                  <span className="text-xs font-mono">{article.authorId?.slice(0, 8)}...</span>
                </div>
              )}
              {article.reviewerId && (
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">بازبین</span>
                  <span className="text-xs font-mono">{article.reviewerId?.slice(0, 8)}...</span>
                </div>
              )}
              {article.difficulty && (
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">سطح</span>
                  <span>{DIFFICULTY_FA[article.difficulty] ?? article.difficulty}</span>
                </div>
              )}
              {article.readingTime != null && (
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">زمان مطالعه</span>
                  <span>{article.readingTime} دقیقه</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[hsl(var(--muted-foreground))]">ایجاد</span>
                <span className="text-xs">{new Date(article.createdAt).toLocaleDateString('fa-IR')}</span>
              </div>
              {article.publishedAt && (
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">انتشار</span>
                  <span className="text-xs">{new Date(article.publishedAt).toLocaleDateString('fa-IR')}</span>
                </div>
              )}
              {article.archivedAt && (
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted-foreground))]">بایگانی</span>
                  <span className="text-xs">{new Date(article.archivedAt).toLocaleDateString('fa-IR')}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analytics Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                آمار بازدید
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsQuery.isLoading ? (
                <div className="h-16 bg-[hsl(var(--secondary)/0.5)] rounded-lg animate-pulse" />
              ) : !analyticsData ? (
                <p className="text-xs text-[hsl(var(--muted-foreground))] italic">آماری ثبت نشده</p>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[hsl(var(--muted-foreground))] text-xs">بازدید کل</span>
                    <span className="font-bold text-base">{analyticsData.views?.toLocaleString('fa-IR') ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[hsl(var(--muted-foreground))] text-xs">بازدید یکتا</span>
                    <span className="font-medium">{analyticsData.uniqueViews?.toLocaleString('fa-IR') ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[hsl(var(--muted-foreground))] text-xs">لایک</span>
                    <span className="font-medium">{analyticsData.likes ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[hsl(var(--muted-foreground))] text-xs">ذخیره</span>
                    <span className="font-medium">{analyticsData.bookmarks ?? 0}</span>
                  </div>
                  {analyticsData.lastViewedAt && (
                    <div className="pt-2 border-t border-[hsl(var(--border)/0.5)] text-[10px] text-[hsl(var(--muted-foreground))]">
                      آخرین بازدید: {new Date(analyticsData.lastViewedAt).toLocaleDateString('fa-IR')}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Related Calculations Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Calculator className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                محاسبات مرتبط
              </CardTitle>
            </CardHeader>
            <CardContent>
              {relatedCalcQuery.isLoading ? (
                <div className="h-16 bg-[hsl(var(--secondary)/0.5)] rounded-lg animate-pulse" />
              ) : (relatedCalcQuery.data?.data ?? []).length === 0 ? (
                <p className="text-xs text-[hsl(var(--muted-foreground))] italic">محاسبه‌ای یافت نشد</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {(relatedCalcQuery.data?.data ?? []).slice(0, 5).map((calc: any) => (
                    <div key={calc.id}
                      className="px-2 py-1.5 rounded-lg bg-[hsl(var(--secondary)/0.2)] text-xs space-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-[hsl(var(--primary))]">{calc.type}</span>
                        <span className="text-[9px] text-[hsl(var(--muted-foreground))]">
                          {new Date(calc.createdAt).toLocaleDateString('fa-IR')}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] text-[hsl(var(--muted-foreground))]">
                        <span>{calc.engineVersion}</span>
                        <span>{calc.standardVersion}</span>
                      </div>
                    </div>
                  ))}
                  {(relatedCalcQuery.data?.data ?? []).length > 5 && (
                    <p className="text-[10px] text-center text-[hsl(var(--muted-foreground))]">
                      + {(relatedCalcQuery.data?.data ?? []).length - 5} محاسبه دیگر
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Standards Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                استانداردها
              </CardTitle>
            </CardHeader>
            <CardContent>
              {standardsQuery.isLoading ? (
                <div className="h-12 bg-[hsl(var(--secondary)/0.5)] rounded-lg animate-pulse" />
              ) : (standardsQuery.data?.data ?? []).length === 0 ? (
                <p className="text-xs text-[hsl(var(--muted-foreground))] italic">استانداردی متصل نیست</p>
              ) : (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {(standardsQuery.data?.data ?? []).map((s: any) => (
                    <div key={s.id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[hsl(var(--secondary)/0.2)] text-xs"
                    >
                      <BookOpen className="h-3 w-3 shrink-0 text-[hsl(var(--muted-foreground))]" />
                      <span className="font-mono text-[10px] font-bold text-[hsl(var(--primary))] shrink-0">{s.code}</span>
                      <span className="truncate text-[hsl(var(--muted-foreground))]">{s.title}</span>
                      <Badge variant="outline" className="text-[9px] h-4 mr-auto shrink-0">{s.organization}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {taxonomy.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">دسته‌بندی‌ها</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {['category', 'topic', 'tag', 'discipline', 'audience'].map(type => {
                  const entries = taxonomy.filter((e: TaxonomyEntry) => e.taxonomy_type === type);
                  if (entries.length === 0) return null;
                  const labels: Record<string, string> = {
                    category: 'دسته‌بندی', topic: 'موضوع', tag: 'برچسب',
                    discipline: 'رشته', audience: 'مخاطب',
                  };
                  return (
                    <div key={type}>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">{labels[type]}</p>
                      <div className="flex flex-wrap gap-1">
                        {entries.map((e: TaxonomyEntry) => (
                          <Badge key={e.id} variant="secondary" className="text-[10px]">
                            {e.taxonomy_id?.slice(0, 8)}...
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Workflow Timeline */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                گردش کار
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {workflowQuery.isLoading ? (
                <div className="h-20 bg-[hsl(var(--secondary)/0.5)] rounded-lg animate-pulse" />
              ) : (
                <>
                  {/* Workflow history timeline */}
                  {workflowData?.history?.length > 0 ? (
                    <div className="space-y-2">
                      {workflowData.history.map((h: any) => (
                        <div key={h.id} className="flex gap-2">
                          <div className="flex flex-col items-center">
                            <div className={cn(
                              'w-2.5 h-2.5 rounded-full mt-1 ring-2',
                              h.status === 'published' ? 'bg-green-500 ring-green-200'
                              : h.status === 'review' ? 'bg-yellow-500 ring-yellow-200'
                              : 'bg-gray-400 ring-gray-200',
                            )} />
                            <div className="w-px flex-1 bg-[hsl(var(--border))] min-h-[8px]" />
                          </div>
                          <div className="pb-2">
                            <p className="text-xs font-medium">
                              {h.status === 'published' ? 'منتشر شد'
                              : h.status === 'review' ? 'ارسال برای بررسی'
                              : 'پیش‌نویس'}
                            </p>
                            {h.comment && <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">{h.comment}</p>}
                            <p className="text-[9px] text-[hsl(var(--muted-foreground))] mt-0.5">
                              {new Date(h.createdAt).toLocaleDateString('fa-IR')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[hsl(var(--muted-foreground))] italic">هنوز مرحله‌ای ثبت نشده</p>
                  )}

                  {/* Workflow actions + comment input */}
                  {article.status === 'draft' && (
                    <div className="space-y-2 pt-1 border-t border-[hsl(var(--border)/0.5)]">
                      <input
                        value={wfComment}
                        onChange={e => setWfComment(e.target.value)}
                        placeholder="توضیح برای بررسی..."
                        className="w-full h-8 px-2 rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs outline-none focus:border-[hsl(var(--primary))]"
                      />
                      <button
                        onClick={() => submitWorkflowMutation.mutate(wfComment)}
                        disabled={submitWorkflowMutation.isPending}
                        className="w-full h-8 rounded-lg bg-yellow-500 text-white text-xs font-medium hover:bg-yellow-600 disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        {submitWorkflowMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                        ارسال برای بررسی
                      </button>
                    </div>
                  )}

                  {article.status === 'review' && (
                    <div className="space-y-2 pt-1 border-t border-[hsl(var(--border)/0.5)]">
                      <input
                        value={wfComment}
                        onChange={e => setWfComment(e.target.value)}
                        placeholder="نظر بررسی‌کننده..."
                        className="w-full h-8 px-2 rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-xs outline-none focus:border-[hsl(var(--primary))]"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => rejectWorkflowMutation.mutate(wfComment)}
                          disabled={rejectWorkflowMutation.isPending}
                          className="flex-1 h-8 rounded-lg border border-red-200 text-red-500 text-xs font-medium hover:bg-red-50 disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          {rejectWorkflowMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                          رد
                        </button>
                        <button
                          onClick={() => approveWorkflowMutation.mutate(wfComment)}
                          disabled={approveWorkflowMutation.isPending}
                          className="flex-1 h-8 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                          {approveWorkflowMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                          تأیید
                        </button>
                      </div>
                    </div>
                  )}

                  {article.status === 'archived' && (
                    <div className="pt-1 border-t border-[hsl(var(--border)/0.5)]">
                      <p className="text-[10px] text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        این مقاله بایگانی شده است
                      </p>
                    </div>
                  )}

                  {article.status === 'published' && (
                    <p className="text-[10px] text-green-600 flex items-center gap-1 pt-1 border-t border-[hsl(var(--border)/0.5)]">
                      <CheckCircle className="h-3 w-3" />
                      منتشر شده
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Version History */}
          <Card>
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                تاریخچه نسخه‌ها
              </CardTitle>
              <Badge variant="outline" className="text-[10px]">
                v{article.version}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              {versionsQuery.isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-10 bg-[hsl(var(--secondary)/0.5)] rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (versionsQuery.data?.data ?? []).length === 0 ? (
                <p className="text-xs text-[hsl(var(--muted-foreground))] italic">هیچ نسخه‌ای ثبت نشده</p>
              ) : (
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {(versionsQuery.data?.data ?? []).map((v: any) => (
                    <div key={v.id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[hsl(var(--secondary)/0.3)] transition-colors group">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold',
                          v.version === article.version
                            ? 'bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))]'
                            : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]',
                        )}>
                          {v.version}
                        </span>
                        <div>
                          <p className="text-xs font-medium">
                            نسخه {v.version}
                            {v.version === article.version && (
                              <span className="text-[10px] text-[hsl(var(--primary))] mr-1">(فعلی)</span>
                            )}
                          </p>
                          <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
                            {new Date(v.createdAt).toLocaleDateString('fa-IR')}
                            {' · '}
                            {new Date(v.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      {v.version !== article.version && (
                        <button
                          onClick={() => {
                            if (confirm(`آیا از بازیابی نسخه ${v.version} مطمئن هستید؟ محتوای فعلی به‌عنوان نسخه جدید ذخیره خواهد شد.`))
                              restoreVersionMutation.mutate(v.id);
                          }}
                          disabled={restoreVersionMutation.isPending}
                          className="opacity-0 group-hover:opacity-100 text-[10px] px-2 py-1 rounded border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))] transition-all disabled:opacity-40 flex items-center gap-1"
                          title="بازیابی این نسخه"
                        >
                          <RotateCcw className="h-3 w-3" />
                          بازیابی
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">دسترسی سریع</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a
                href={`/${locale}/knowledge/${articleId}/edit`}
                className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius)] text-sm hover:bg-[hsl(var(--secondary))] transition-colors"
              >
                <Edit3 className="h-4 w-4 text-[hsl(var(--primary))]" />
                ویرایش محتوا
              </a>
              <button
                onClick={() => apiClient.post(`/knowledge/${articleId}/view`).catch(() => {})}
                className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius)] text-sm hover:bg-[hsl(var(--secondary))] transition-colors w-full text-start"
              >
                <Eye className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                ثبت بازدید (دستی)
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
