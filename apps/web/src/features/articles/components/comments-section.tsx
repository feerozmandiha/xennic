'use client';

import { MessageSquare, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { useComments } from '../hooks/use-comments';
import { CommentItem } from './comment-item';
import { CommentForm } from './comment-form';

export function CommentsSection({ articleId }: { articleId: string }) {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';
  const user = useAuthStore(s => s.user);
  const { query, create, update, remove, toggleLike } = useComments(articleId);

  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--muted-foreground))]" />
      </div>
    );
  }

  const comments = query.data ?? [];

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2.5">
        <MessageSquare className="h-5 w-5 text-[hsl(var(--primary))]" />
        <h2 className="text-lg font-bold text-[hsl(var(--foreground))]">
          نظرات ({comments.length})
        </h2>
      </div>

      {user ? (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <p className="text-sm font-medium text-[hsl(var(--foreground))] mb-3">
            {user.firstName} {user.lastName}
          </p>
          <CommentForm
            onSubmit={async (content) => create.mutateAsync({ content })}
            placeholder="نظر خود را بنویسید..."
          />
        </div>
      ) : (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[hsl(var(--primary)/0.1)] flex items-center justify-center mx-auto">
            <MessageSquare className="h-5 w-5 text-[hsl(var(--primary))]" />
          </div>
          <div>
            <p className="text-sm text-[hsl(var(--foreground))] font-medium mb-1">
              برای ثبت نظر وارد حساب خود شوید
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              عضویت رایگان است و فقط چند ثانیه طول می‌کشد
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Link
              href={`/${locale}/login?redirectTo=${encodeURIComponent(`/${locale}/articles/${articleId}`)}`}
              className="rounded-xl border border-[hsl(var(--border))] px-5 py-2 text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))] transition-all"
            >
              ورود
            </Link>
            <Link
              href={`/${locale}/register`}
              className="rounded-xl bg-[hsl(var(--primary))] px-5 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-all"
            >
              ثبت‌نام رایگان
            </Link>
          </div>
        </div>
      )}

      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onUpdate={async (id, content) => update.mutateAsync({ id, content })}
              onDelete={async (id) => remove.mutateAsync(id)}
              onReply={async (content, parentId) => create.mutateAsync({ content, parentId })}
              onLike={async (id) => { toggleLike.mutate(id); }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            هنوز نظری ثبت نشده است. اولین نفری باشید که نظر می‌دهید!
          </p>
        </div>
      )}
    </section>
  );
}
