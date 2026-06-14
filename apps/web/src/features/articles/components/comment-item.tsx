'use client';

import { useState } from 'react';
import { Heart, MessageSquare, Pencil, Trash2, User as UserIcon, CornerDownRight } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { CommentForm } from './comment-form';
import { cn } from '@/lib/utils';

interface Comment {
  id: string; articleId: string; userId: string;
  authorName: string; authorAvatar: string | null;
  content: string; parentId: string | null;
  likes: number; likedBy: string[];
  isEdited: boolean; createdAt: Date; updatedAt: Date;
  replies: Comment[];
}

interface CommentItemProps {
  comment: Comment;
  onUpdate: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReply: (content: string, parentId: string) => Promise<void>;
  onLike: (id: string) => Promise<void>;
  depth?: number;
}

export function CommentItem({ comment, onUpdate, onDelete, onReply, onLike, depth = 0 }: CommentItemProps) {
  const user = useAuthStore(s => s.user);
  const isOwner = user?.id === comment.userId;
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const isLiked = comment.likedBy.includes(user?.id ?? '');

  const formatDate = (d: Date | string) => {
    const date = new Date(d);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className={cn('space-y-3', depth > 0 && 'mr-6')}>
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 transition-colors">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
              {comment.authorAvatar
                ? <img src={comment.authorAvatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                : <UserIcon className="h-4 w-4 text-[hsl(var(--primary))]" />
              }
            </div>
            <div>
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">{comment.authorName}</p>
              <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
                {formatDate(comment.createdAt)}
                {comment.isEdited && ' • ویرایش شده'}
              </p>
            </div>
          </div>
          {isOwner && (
            <div className="flex items-center gap-1">
              <button onClick={() => setIsEditing(e => !e)}
                className="p-1.5 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))] transition-all">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => { if (confirm('حذف شود؟')) onDelete(comment.id); }}
                className="p-1.5 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/0.08)] transition-all">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <CommentForm
            initialValue={comment.content}
            onSubmit={async (content) => { await onUpdate(comment.id, content); setIsEditing(false); }}
            submitLabel="ذخیره"
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <p className="text-sm text-[hsl(var(--foreground))] leading-relaxed whitespace-pre-wrap">{comment.content}</p>
        )}

        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[hsl(var(--border))]">
          <button onClick={() => onLike(comment.id)}
            className={cn(
              'flex items-center gap-1 text-xs transition-colors',
              isLiked ? 'text-red-500' : 'text-[hsl(var(--muted-foreground))] hover:text-red-500',
            )}
          >
            <Heart className={cn('h-3.5 w-3.5', isLiked && 'fill-current')} />
            {comment.likes > 0 && comment.likes}
          </button>
          {user && (
            <button onClick={() => setIsReplying(r => !r)}
              className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
              <MessageSquare className="h-3.5 w-3.5" />
              پاسخ
            </button>
          )}
        </div>

        {isReplying && (
          <div className="mt-3">
            <CommentForm
              onSubmit={async (content) => { await onReply(content, comment.id); setIsReplying(false); }}
              placeholder={`پاسخ به ${comment.authorName}...`}
              submitLabel="ارسال پاسخ"
              onCancel={() => setIsReplying(false)}
            />
          </div>
        )}
      </div>

      {comment.replies?.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onReply={onReply}
              onLike={onLike}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
