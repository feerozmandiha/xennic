'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import {
  Send, Bot, User, Plus, Trash2,
  MessageSquare, Zap, Cpu, Loader2,
  ChevronLeft, Copy, Check, RefreshCw,
  BookOpen, Settings2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton }   from '@/components/ui/skeleton';
import { Badge }      from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth.store';
import { useToast }     from '@/stores/toast.store';
import { apiClient }    from '@/lib/api/client';
import { cn }           from '@/lib/utils';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface Message {
  id:        string;
  role:      'user' | 'assistant' | 'system';
  content:   string;
  createdAt: string;
  streaming?: boolean;
}

interface Conversation {
  id:           string;
  agentId:      string;
  title:        string | null;
  createdAt:    string;
  updatedAt:    string;
  messages:     Message[];
  messageCount: number;
}

// ─────────────────────────────────────────────────────────────
// MARKDOWN RENDERER
// ─────────────────────────────────────────────────────────────

function renderMarkdown(text: string): string {
  return text
    // Code blocks ```lang\n...\n```
    .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
      `<pre class="code-block"><div class="code-lang">${lang || 'code'}</div><code>${code.trim().replace(/</g,'&lt;').replace(/>/g,'&gt;')}</code></pre>`)
    // Inline code `...`
    .replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>')
    // Bold **...**
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic *...*
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>')
    // Headers ## ...
    .replace(/^#{1,3}\s+(.+)$/gm, '<div class="md-heading">$1</div>')
    // Bullet • or -
    .replace(/^[•\-]\s+(.+)$/gm, '<div class="md-bullet">• $1</div>')
    // Numbered list 1. ...
    .replace(/^\d+\.\s+(.+)$/gm, '<div class="md-numbered">$1</div>')
    // Horizontal rule ---
    .replace(/^---$/gm, '<hr class="md-hr"/>')
    // Line breaks
    .replace(/\n/g, '<br/>');
}

// ─────────────────────────────────────────────────────────────
// CODE COPY BUTTON
// ─────────────────────────────────────────────────────────────

function MessageContent({ content }: { content: string }) {
  const html = renderMarkdown(content);
  return (
    <div
      className="prose-xennic"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// MESSAGE BUBBLE
// ─────────────────────────────────────────────────────────────

function MessageBubble({ msg, userName }: { msg: Message; userName?: string }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === 'user';

  function copyContent() {
    navigator.clipboard.writeText(msg.content).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={cn('flex gap-3 group animate-fade-in', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 text-xs font-bold',
        isUser
          ? 'bg-[hsl(var(--primary))] text-white'
          : 'bg-[hsl(var(--secondary))] border border-[hsl(var(--border))]',
      )}>
        {isUser
          ? (userName?.[0]?.toUpperCase() ?? <User className="h-3.5 w-3.5" />)
          : <Bot className="h-4 w-4 text-[hsl(var(--primary))]" />}
      </div>

      {/* Bubble */}
      <div className={cn('max-w-[80%] space-y-1', isUser ? 'items-end' : 'items-start')}>
        <div className={cn(
          'relative px-4 py-3 rounded-2xl text-sm leading-relaxed',
          isUser
            ? 'bg-[hsl(var(--primary))] text-white rounded-tr-sm'
            : 'bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-tl-sm',
          msg.streaming && 'opacity-90',
        )}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{msg.content}</p>
          ) : (
            <MessageContent content={msg.content} />
          )}

          {/* Streaming cursor */}
          {msg.streaming && (
            <span className="inline-block w-0.5 h-4 bg-current animate-pulse ml-0.5" />
          )}

          {/* Copy button */}
          {!msg.streaming && (
            <button
              onClick={copyContent}
              className={cn(
                'absolute -top-2 -end-2 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all',
                'bg-[hsl(var(--background))] border border-[hsl(var(--border))] shadow-sm',
              )}
              title="کپی"
            >
              {copied
                ? <Check className="h-3 w-3 text-[hsl(var(--success))]" />
                : <Copy  className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />}
            </button>
          )}
        </div>

        <p className={cn(
          'text-[10px] text-[hsl(var(--muted-foreground))] px-1',
          isUser ? 'text-end' : 'text-start',
        )}>
          {new Date(msg.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// TYPING INDICATOR
// ─────────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] flex items-center justify-center shrink-0 mt-1">
        <Bot className="h-4 w-4 text-[hsl(var(--primary))]" />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
        <div className="flex gap-1 items-center h-5">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--muted-foreground))] animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SUGGESTION CHIPS
// ─────────────────────────────────────────────────────────────

const SUGGESTIONS = [
  { icon: '⚡', text: 'THD چیست و IEEE 519 چه حدی مجاز می‌داند؟' },
  { icon: '🔌', text: 'سایزینگ کابل ۱۰۰ آمپر سه‌فاز با IEC 60364' },
  { icon: '🔋', text: 'ترانسفورماتور ۱۰۰۰ kVA با بار ۷۵٪ چه تلفاتی دارد؟' },
  { icon: '📊', text: 'فیلتر پسیو برای هارمونیک ۵ چگونه طراحی می‌شود؟' },
  { icon: '🛡️', text: 'انتخاب MCCB برای فیدر ۱۶۰ آمپر' },
  { icon: '☀️', text: 'طراحی سیستم PV ۱۰ کیلوواتی خانگی' },
];

// ─────────────────────────────────────────────────────────────
// CONVERSATION SIDEBAR ITEM
// ─────────────────────────────────────────────────────────────

function ConvItem({ conv, active, onClick, onDelete }: {
  conv: Conversation; active: boolean;
  onClick: () => void; onDelete: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'group flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius)] cursor-pointer transition-all',
        active
          ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
          : 'hover:bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))]',
      )}
    >
      <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-60" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">
          {conv.title ?? 'گفتگوی جدید'}
        </p>
        <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">
          {conv.messageCount} پیام · {new Date(conv.updatedAt).toLocaleDateString('fa-IR')}
        </p>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onDelete(); }}
        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[hsl(var(--destructive)/0.1)] hover:text-[hsl(var(--destructive))] transition-all shrink-0"
        title="حذف"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// WELCOME SCREEN
// ─────────────────────────────────────────────────────────────

function WelcomeScreen({ onSuggestion, onStart }: {
  onSuggestion: (text: string) => void;
  onStart: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12 space-y-6">
      {/* Icon */}
      <div className={cn(
        'w-18 h-18 rounded-3xl flex items-center justify-center p-4',
        'bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))]',
        'shadow-[0_0_40px_hsl(var(--primary)/0.25)]',
      )}>
        <Cpu className="h-8 w-8 text-white" />
      </div>

      <div className="space-y-1.5">
        <h2 className="text-xl font-black">Xennic AI</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-xs leading-relaxed">
          مشاور تخصصی مهندسی برق با دانش استانداردهای IEC و IEEE
        </p>
      </div>

      {/* Capabilities */}
      <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
        {[
          { icon: '⚡', label: 'IEC 60364 · 60076' },
          { icon: '📊', label: 'IEEE 519 · کیفیت توان' },
          { icon: '🔌', label: 'کابل و ترانسفورماتور' },
          { icon: '🛡️', label: 'حفاظت و رله‌گذاری' },
        ].map(({ icon, label }) => (
          <div key={label} className="flex items-center gap-2 p-2.5 rounded-[var(--radius-lg)] bg-[hsl(var(--secondary)/0.6)] border border-[hsl(var(--border))] text-xs">
            <span className="text-base">{icon}</span>
            <span className="font-medium">{label}</span>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      <div className="w-full max-w-sm space-y-1.5">
        <p className="text-[10px] text-[hsl(var(--muted-foreground))] font-medium uppercase tracking-wider text-right">
          سؤالات پیشنهادی
        </p>
        {SUGGESTIONS.slice(0, 4).map(s => (
          <button
            key={s.text}
            onClick={() => onSuggestion(s.text)}
            className={cn(
              'w-full text-right px-3 py-2.5 rounded-[var(--radius-lg)] text-xs',
              'border border-[hsl(var(--border))]',
              'hover:bg-[hsl(var(--secondary))] hover:border-[hsl(var(--primary)/0.3)]',
              'transition-all flex items-center gap-2',
            )}
          >
            <span>{s.icon}</span>
            <span className="flex-1 text-right">{s.text}</span>
          </button>
        ))}
      </div>

      <button
        onClick={onStart}
        className={cn(
          'inline-flex items-center gap-2 h-10 px-6 rounded-[var(--radius-lg)]',
          'bg-[hsl(var(--primary))] text-white text-sm font-semibold',
          'hover:opacity-90 transition-opacity',
          'shadow-[0_4px_14px_hsl(var(--primary)/0.3)]',
        )}
      >
        <Plus className="h-4 w-4" />
        شروع گفتگو
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

const API_BASE = typeof window !== 'undefined'
  ? `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/v1`
  : `http://localhost:3000/api/v1`;

export function AiChatClient() {
  const user        = useAuthStore(s => s.user);
  const wsId        = useAuthStore(s => s.workspaceId);
  const toast       = useToast();
  const queryClient = useQueryClient();

  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [input,        setInput]        = useState('');
  const [isTyping,     setIsTyping]     = useState(false);
  const [messages,     setMessages]     = useState<Message[]>([]);
  const [useStream,    setUseStream]    = useState(false); // streaming endpoint در دست توسعه

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLTextAreaElement>(null);
  const abortRef       = useRef<AbortController | null>(null);

  // Conversations list
  const { data: convsData, isLoading: convsLoading } = useQuery({
    queryKey: ['ai-conversations', wsId],
    queryFn:  () => apiClient.get<any>('/ai/conversations?limit=30'),
    enabled:  !!wsId,
    retry: false,
    refetchInterval: 30_000,
  });

  // Active conversation
  const { data: convData, isLoading: convLoading } = useQuery({
    queryKey: ['ai-conversation', activeConvId],
    queryFn:  () => apiClient.get<any>(`/ai/conversations/${activeConvId}`),
    enabled:  !!activeConvId,
    retry: false,
  });

  useEffect(() => {
    if (convData?.data?.messages) {
      setMessages(convData.data.messages);
    }
  }, [convData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Create conversation
  const createMutation = useMutation({
    mutationFn: () => apiClient.post<any>('/ai/conversations', { agentSlug: 'electrical-engineer' }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      setActiveConvId(data.data.id);
      setMessages([]);
    },
    onError: () => toast.error('خطا در ایجاد گفتگو'),
  });

  // Delete conversation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/ai/conversations/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      if (activeConvId === id) { setActiveConvId(null); setMessages([]); }
    },
    onError: () => toast.error('خطا در حذف'),
  });

  // ── Send with streaming ────────────────────────────────────────────────────

  async function sendStreaming(convId: string, content: string) {
    const token = localStorage.getItem('xennic_token') ?? '';

    // Optimistic user message
    const tempUserMsg: Message = {
      id: 'user-' + Date.now(),
      role: 'user', content,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setIsTyping(true);

    // Streaming assistant bubble
    const tempAsstId = 'asst-' + Date.now();
    const tempAsst: Message = {
      id: tempAsstId, role: 'assistant',
      content: '', createdAt: new Date().toISOString(), streaming: true,
    };
    setMessages(prev => [...prev, tempAsst]);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch(`${API_BASE}/ai/conversations/${convId}/stream`, {
        method:  'POST',
        headers: {
          'Content-Type':   'application/json',
          'Authorization':  `Bearer ${token}`,
          'x-workspace-id': wsId ?? '',
        },
        body:   JSON.stringify({ content }),
        signal: ctrl.signal,
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let   buffer  = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (raw === '[DONE]') break;

          try {
            const ev = JSON.parse(raw);
            if (ev.type === 'chunk') {
              setMessages(prev => prev.map(m =>
                m.id === tempAsstId
                  ? { ...m, content: m.content + ev.chunk }
                  : m,
              ));
            }
            if (ev.type === 'done') {
              setMessages(prev => prev.map(m =>
                m.id === tempAsstId
                  ? { ...m, id: ev.assistantMessageId, streaming: false }
                  : m.id === tempUserMsg.id
                  ? { ...m, id: ev.userMessageId }
                  : m,
              ));
            }
            if (ev.type === 'error') throw new Error(ev.message);
          } catch { /* skip malformed */ }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      // Fallback به non-streaming
      // silent fallback to non-streaming
      setMessages(prev => prev.filter(m => m.id !== tempAsstId));
      await sendNormal(convId, content, tempUserMsg.id);
      return;
    } finally {
      setIsTyping(false);
      setMessages(prev => prev.map(m =>
        m.id === tempAsstId ? { ...m, streaming: false } : m,
      ));
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
    }
  }

  // ── Send normal (non-streaming) ───────────────────────────────────────────

  async function sendNormal(convId: string, content: string, tempUserId?: string) {
    setIsTyping(true);
    try {
      const res = await apiClient.post<any>(`/ai/conversations/${convId}/messages`, { content });
      const now = new Date().toISOString();

      const userMsg: Message  = { id: res.data.userMessageId,      role: 'user',      content, createdAt: now };
      const asstMsg: Message  = { id: res.data.assistantMessageId, role: 'assistant', content: res.data.reply, createdAt: now };

      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== tempUserId && !m.id.startsWith('user-'));
        return [...filtered, userMsg, asstMsg];
      });
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
    } catch (err: any) {
      toast.error(err?.message ?? 'خطا در ارسال پیام');
      setMessages(prev => prev.filter(m => !m.id.startsWith('user-') && !m.id.startsWith('asst-')));
    } finally {
      setIsTyping(false);
    }
  }

  // ── Main send handler ─────────────────────────────────────────────────────

  async function handleSend(text?: string) {
    const content = (text ?? input).trim();
    if (!content || isTyping) return;
    setInput('');

    let convId = activeConvId;
    if (!convId) {
      try {
        const res = await apiClient.post<any>('/ai/conversations', { agentSlug: 'electrical-engineer' });
        convId = res.data.id;
        setActiveConvId(convId);
        queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      } catch {
        toast.error('خطا در ایجاد گفتگو');
        return;
      }
    }

    if (useStream) {
      await sendStreaming(convId!, content);
    } else {
      const tempId = 'user-' + Date.now();
      setMessages(prev => [...prev, {
        id: tempId, role: 'user', content, createdAt: new Date().toISOString(),
      }]);
      await sendNormal(convId!, content, tempId);
    }

    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function stopStreaming() {
    abortRef.current?.abort();
    setIsTyping(false);
    setMessages(prev => prev.map(m =>
      m.streaming ? { ...m, streaming: false } : m,
    ));
  }

  const conversations: Conversation[] = convsData?.data ?? [];
  const activeConv = conversations.find(c => c.id === activeConvId);

  return (
    <>
      {/* Prose styles */}
      <style>{`
        .prose-xennic .md-heading { font-weight:700; font-size:0.95em; margin:8px 0 4px; }
        .prose-xennic .md-bullet  { padding-right:12px; margin:2px 0; }
        .prose-xennic .md-numbered{ padding-right:12px; margin:2px 0; }
        .prose-xennic .md-hr      { border:none; border-top:1px solid currentColor; opacity:0.2; margin:8px 0; }
        .prose-xennic .inline-code{
          font-family:'JetBrains Mono','Fira Code',monospace;
          font-size:0.82em;
          background:rgba(127,127,127,0.15);
          border-radius:4px; padding:1px 5px;
        }
        .prose-xennic .code-block {
          background:rgba(0,0,0,0.06); border-radius:8px;
          margin:8px 0; overflow:auto; font-size:0.8em;
        }
        .dark .prose-xennic .code-block { background:rgba(255,255,255,0.08); }
        .prose-xennic .code-lang {
          font-size:0.7em; padding:4px 10px 0;
          opacity:0.5; font-family:monospace; text-transform:uppercase;
        }
        .prose-xennic .code-block code { display:block; padding:8px 12px; white-space:pre; }
        .prose-xennic strong { font-weight:700; }
        .prose-xennic em     { font-style:italic; }
      `}</style>

      <div className="flex h-[calc(100dvh-7rem)] gap-4 -mx-4 lg:-mx-6 px-4 lg:px-6">

        {/* ── Sidebar ──────────────────────────────────────── */}
        <div className="hidden lg:flex flex-col w-60 shrink-0 gap-2.5">

          {/* New button */}
          <button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
            className={cn(
              'flex items-center gap-2 h-9 px-4 rounded-[var(--radius-lg)]',
              'bg-[hsl(var(--primary))] text-white text-sm font-medium',
              'hover:opacity-90 transition-opacity disabled:opacity-50',
              'shadow-[0_2px_8px_hsl(var(--primary)/0.3)]',
            )}
          >
            {createMutation.isPending
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Plus    className="h-4 w-4" />}
            گفتگوی جدید
          </button>

          {/* Conversations */}
          <Card className="flex-1 overflow-hidden">
            <CardContent className="p-2 h-full overflow-y-auto space-y-0.5">
              {convsLoading ? (
                <div className="space-y-2 p-2">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-12" />)}
                </div>
              ) : conversations.length > 0 ? (
                conversations.map(conv => (
                  <ConvItem
                    key={conv.id}
                    conv={conv}
                    active={conv.id === activeConvId}
                    onClick={() => { setActiveConvId(conv.id); setMessages([]); }}
                    onDelete={() => deleteMutation.mutate(conv.id)}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <MessageSquare className="h-6 w-6 text-[hsl(var(--muted-foreground))] opacity-30 mb-2" />
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">هنوز گفتگویی ندارید</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settings strip */}
          <div className="px-3 py-2 rounded-[var(--radius-lg)] bg-[hsl(var(--secondary)/0.5)] border border-[hsl(var(--border))] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
                <span className="text-xs font-medium">Xennic AI</span>
              </div>
              <Badge variant="default" className="text-[9px]">β</Badge>
            </div>
            {/* Streaming toggle */}
            <button
              onClick={() => setUseStream(s => !s)}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 rounded-[var(--radius)] text-[10px] transition-colors',
                useStream ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]' : 'hover:bg-[hsl(var(--secondary))]',
              )}
            >
              <RefreshCw className="h-3 w-3" />
              {useStream ? 'Streaming: روشن' : 'Streaming: خاموش'}
            </button>
          </div>
        </div>

        {/* ── Chat Area ─────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Header */}
          {activeConvId && (
            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-[hsl(var(--border))] shrink-0">
              <button
                onClick={() => { setActiveConvId(null); setMessages([]); }}
                className="lg:hidden p-1.5 rounded-[var(--radius)] hover:bg-[hsl(var(--secondary))]"
              >
                <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
              </button>
              <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
                <Bot className="h-4 w-4 text-[hsl(var(--primary))]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {activeConv?.title ?? 'Xennic AI'}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    isTyping ? 'bg-[hsl(var(--warning))] animate-pulse' : 'bg-[hsl(var(--success))]',
                  )} />
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
                    {isTyping ? 'در حال پاسخ...' : 'آنلاین'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {isTyping && (
                  <button
                    onClick={stopStreaming}
                    className="h-7 px-2 rounded-[var(--radius)] text-xs border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))] transition-colors"
                  >
                    توقف
                  </button>
                )}
                <Badge variant="default" className="text-[9px]">
                  {activeConv?.messageCount ?? 0} پیام
                </Badge>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            {!activeConvId ? (
              <WelcomeScreen
                onSuggestion={text => handleSend(text)}
                onStart={() => createMutation.mutate()}
              />
            ) : convLoading ? (
              <div className="space-y-4 p-4">
                {[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}
              </div>
            ) : (
              <div className="space-y-4 p-4 pb-2">
                {messages.map(msg => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    userName={user?.firstName}
                  />
                ))}
                {isTyping && !messages.some(m => m.streaming) && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input area */}
          {activeConvId && (
            <div className="mt-2 shrink-0">
              {/* Suggestion chips (اگر پیامی نیست) */}
              {messages.length === 0 && (
                <div className="flex gap-2 flex-wrap mb-3">
                  {SUGGESTIONS.slice(0, 3).map(s => (
                    <button
                      key={s.text}
                      onClick={() => handleSend(s.text)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))] hover:border-[hsl(var(--primary)/0.3)] transition-all"
                    >
                      <span>{s.icon}</span>
                      <span className="truncate max-w-[120px]">{s.text.slice(0,25)}...</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Input box */}
              <div className={cn(
                'flex items-end gap-2 p-2 rounded-[var(--radius-xl)] border',
                'bg-[hsl(var(--card))]',
                'focus-within:border-[hsl(var(--primary)/0.5)] focus-within:ring-1 focus-within:ring-[hsl(var(--ring)/0.3)]',
                'transition-all',
              )}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="سؤال فنی بپرسید... (Enter=ارسال، Shift+Enter=خط جدید)"
                  rows={1}
                  disabled={isTyping}
                  className={cn(
                    'flex-1 bg-transparent text-sm resize-none outline-none',
                    'placeholder:text-[hsl(var(--muted-foreground)/0.5)]',
                    'max-h-32 overflow-y-auto leading-relaxed py-1.5 px-2',
                    'disabled:opacity-50',
                  )}
                  style={{ fieldSizing: 'content' } as any}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className={cn(
                    'w-9 h-9 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0',
                    'bg-[hsl(var(--primary))] text-white',
                    'hover:opacity-90 transition-opacity',
                    'disabled:opacity-40 disabled:cursor-not-allowed',
                  )}
                >
                  {isTyping
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Send    className="h-4 w-4" />}
                </button>
              </div>

              <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1.5 text-center">
                Xennic AI ممکن است اشتباه کند — نتایج را با استانداردها تأیید کنید
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
