'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  BookOpen, Search, Clock, Eye, Heart,
  ChevronLeft, Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge }       from '@/components/ui/badge';
import { apiClient }   from '@/lib/api/client';
import { cn }          from '@/lib/utils';

// ─────────────────────────────────────────────────────────────
// types
// ─────────────────────────────────────────────────────────────

interface Article {
  id:          string;
  title:       string;
  slug:        string;
  summary:     string;
  content:     string;
  category:    string;
  tags:        string[];
  authorName:  string;
  readMinutes: number;
  viewCount:   number;
  likeCount:   number;
  publishedAt: string | null;
}

interface ArticlesResponse {
  success: boolean;
  data:    Article[];
  meta:    { total: number };
}

interface ArticleResponse {
  success: boolean;
  data:    Article;
}

// ─────────────────────────────────────────────────────────────
// constants
// ─────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: '',              label: 'همه موضوعات' },
  { key: 'cable',         label: '🔌 کابل' },
  { key: 'transformer',   label: '⚡ ترانسفورماتور' },
  { key: 'protection',    label: '🛡️ حفاظت' },
  { key: 'power_quality', label: '📊 کیفیت توان' },
  { key: 'grounding',     label: '🌍 زمین' },
  { key: 'renewable',     label: '☀️ تجدیدپذیر' },
  { key: 'motor',         label: '⚙️ موتور' },
  { key: 'general',       label: '📚 عمومی' },
];

const CATEGORY_COLOR: Record<string, string> = {
  cable:         'bg-blue-100 text-blue-700',
  transformer:   'bg-yellow-100 text-yellow-700',
  protection:    'bg-red-100 text-red-700',
  power_quality: 'bg-purple-100 text-purple-700',
  grounding:     'bg-green-100 text-green-700',
  renewable:     'bg-emerald-100 text-emerald-700',
  motor:         'bg-orange-100 text-orange-700',
  general:       'bg-gray-100 text-gray-700',
};

// ─────────────────────────────────────────────────────────────
// article card
// ─────────────────────────────────────────────────────────────

function ArticleCard({ article, onClick }: { article: Article; onClick: () => void }) {
  const catLabel = CATEGORIES.find(c => c.key === article.category)?.label ?? article.category;
  const catColor = CATEGORY_COLOR[article.category] ?? CATEGORY_COLOR.general;

  return (
    <Card
      className="cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
      onClick={onClick}
    >
      <CardContent className="p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', catColor)}>
            {catLabel}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-[hsl(var(--muted-foreground))]">
            <Clock className="h-3 w-3" />{article.readMinutes} دقیقه
          </span>
        </div>

        <h3 className="text-sm font-bold leading-relaxed group-hover:text-[hsl(var(--primary))] transition-colors line-clamp-2">
          {article.title}
        </h3>

        <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed line-clamp-3">
          {article.summary}
        </p>

        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {article.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-1 border-t border-[hsl(var(--border)/0.5)]">
          <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{article.authorName}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[10px] text-[hsl(var(--muted-foreground))]">
              <Eye className="h-3 w-3" />{article.viewCount}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-[hsl(var(--muted-foreground))]">
              <Heart className="h-3 w-3" />{article.likeCount}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// article reader
// ─────────────────────────────────────────────────────────────

function ArticleReader({ slug, onBack }: { slug: string; onBack: () => void }) {
  const [liked, setLiked] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['article', slug],
    queryFn:  () => apiClient.get<ArticleResponse>(`/articles/${slug}`),
  });

  const likeMutation = useMutation({
    mutationFn: () => apiClient.post(`/articles/${slug}/like`),
    onSuccess:  () => setLiked(true),
  });

  const article = data?.data;

  if (isLoading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--primary))]" />
    </div>
  );

  if (!article) return (
    <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">مقاله یافت نشد</div>
  );

  const catLabel = CATEGORIES.find(c => c.key === article.category)?.label;
  const catColor = CATEGORY_COLOR[article.category] ?? CATEGORY_COLOR.general;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
        <ChevronLeft className="h-4 w-4" />بازگشت به مقالات
      </button>

      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', catColor)}>
            {catLabel}
          </span>
          <span className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
            <Clock className="h-3.5 w-3.5" />{article.readMinutes} دقیقه مطالعه
          </span>
          <span className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
            <Eye className="h-3.5 w-3.5" />{article.viewCount} بازدید
          </span>
        </div>
        <h1 className="text-2xl font-black leading-relaxed">{article.title}</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{article.summary}</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          نوشته: {article.authorName}
          {article.publishedAt && ` • ${new Date(article.publishedAt).toLocaleDateString('fa-IR')}`}
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-1" style={{ direction: 'rtl' }}>
            {article.content.split('\n').map((line, i) => {
              if (line.startsWith('# '))  return <h1  key={i} className="text-xl font-black mt-6 mb-3">{line.slice(2)}</h1>;
              if (line.startsWith('## ')) return <h2  key={i} className="text-lg font-bold mt-5 mb-2 text-[hsl(var(--primary))]">{line.slice(3)}</h2>;
              if (line.startsWith('### '))return <h3  key={i} className="text-base font-bold mt-4 mb-2">{line.slice(4)}</h3>;
              if (line.startsWith('```') || line === '```') return null;
              if (line.startsWith('| '))  return (
                <div key={i} className="font-mono text-xs bg-[hsl(var(--secondary)/0.5)] px-3 py-1 rounded text-left" dir="ltr">{line}</div>
              );
              if (/^`[^`]+`$/.test(line)) return (
                <code key={i} className="block font-mono text-xs bg-[hsl(var(--secondary))] px-3 py-2 rounded text-left" dir="ltr">
                  {line.replace(/`/g, '')}
                </code>
              );
              if (line.startsWith('- ') || line.startsWith('• ')) return (
                <li key={i} className="text-sm leading-relaxed mr-4 list-disc">{line.slice(2)}</li>
              );
              if (line.trim() === '') return <div key={i} className="h-2" />;
              return <p key={i} className="text-sm leading-relaxed">{line}</p>;
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex flex-wrap gap-2">
          {article.tags.map(tag => (
            <span key={tag} className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]">
              #{tag}
            </span>
          ))}
        </div>
        <button
          onClick={() => likeMutation.mutate()}
          disabled={liked || likeMutation.isPending}
          className={cn(
            'flex items-center gap-2 h-8 px-4 rounded-[var(--radius-lg)] text-xs transition-all',
            liked
              ? 'bg-red-100 text-red-600 border border-red-200'
              : 'border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))]',
          )}
        >
          <Heart className={cn('h-3.5 w-3.5', liked && 'fill-current')} />
          {liked ? 'پسندیدم!' : 'مفید بود'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// main
// ─────────────────────────────────────────────────────────────

export function ArticlesClient() {
  const [category,     setCategory]    = useState('');
  const [searchInput,  setSearchInput] = useState('');
  const [search,       setSearch]      = useState('');
  const [selectedSlug, setSelected]    = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['articles', category, search],
    queryFn:  () => apiClient.get<ArticlesResponse>(
      `/articles?category=${category}&search=${encodeURIComponent(search)}&limit=24`,
    ),
  });

  const articles  = data?.data  ?? [];
  const total     = data?.meta?.total ?? articles.length;

  if (selectedSlug) {
    return <ArticleReader slug={selectedSlug} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="space-y-6">

      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-[hsl(var(--primary))]" />
            مقالات مهندسی برق
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
            راهنماهای فنی، استانداردها و بهترین روش‌های مهندسی برق
          </p>
        </div>
        <Badge variant="secondary">{total} مقاله</Badge>
      </div>

      {/* search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text" value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setSearch(searchInput)}
            placeholder="جستجو در مقالات..."
            className="w-full h-9 pr-9 pl-3 rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm outline-none focus:border-[hsl(var(--primary))]"
          />
        </div>
        <button onClick={() => setSearch(searchInput)}
          className="h-9 px-4 rounded-[var(--radius-lg)] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm hover:opacity-90">
          جستجو
        </button>
      </div>

      {/* category filters */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(c => (
          <button key={c.key} onClick={() => setCategory(c.key)}
            className={cn(
              'h-7 px-3 text-xs rounded-full border transition-all',
              category === c.key
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))]'
                : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.5)] hover:bg-[hsl(var(--secondary))]',
            )}>
            {c.label}
          </button>
        ))}
      </div>

      {/* grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-[var(--radius-xl)] bg-[hsl(var(--secondary)/0.5)] animate-pulse" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 text-[hsl(var(--muted-foreground))]">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">مقاله‌ای یافت نشد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map(article => (
            <ArticleCard key={article.id} article={article}
              onClick={() => setSelected(article.slug)} />
          ))}
        </div>
      )}
    </div>
  );
}
