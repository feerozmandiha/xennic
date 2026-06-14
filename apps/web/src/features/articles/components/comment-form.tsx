'use client';

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  initialValue?: string;
  submitLabel?: string;
  onCancel?: () => void;
}

export function CommentForm({
  onSubmit, placeholder, initialValue = '',
  submitLabel = 'ارسال', onCancel,
}: CommentFormProps) {
  const [content, setContent] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      await onSubmit(content.trim());
      setContent('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder={placeholder ?? 'نظر خود را بنویسید...'}
        rows={3}
        maxLength={2000}
        className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--ring))] transition-colors resize-none placeholder:text-[hsl(var(--muted-foreground))]"
        disabled={loading}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-[hsl(var(--muted-foreground))]">{content.length}/2000</span>
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
            >
              انصراف
            </button>
          )}
          <button
            type="submit"
            disabled={!content.trim() || loading}
            className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-all disabled:opacity-40"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
