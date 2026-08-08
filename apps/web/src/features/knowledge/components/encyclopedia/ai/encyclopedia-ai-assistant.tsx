'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  X,
  Lightbulb,
  BookOpen,
  Zap,
  MessageSquare,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { knowledgeAiClient, AiChatMessage } from '@/features/knowledge/lib/ai-client';
import { cn } from '@/lib/utils';

const SUGGESTED_QUESTIONS = [
  'تفاوت IEC 60364 و NEC در سایزینگ کابل چیست؟',
  'برای ترانسفورماتور 1250kVA چه استانداردی باید رعایت شود؟',
  'روش محاسبه مقاومت زمین بر اساس IEEE 80 چگونه است؟',
  'هارمونیک‌ها چه تاثیری روی بانک خازنی دارند؟',
  'جدیدترین مقالات درباره کیفیت توان کدامند؟',
];

export function EncyclopediaAiAssistant({
  articleSlug,
  onClose,
}: {
  articleSlug?: string;
  onClose?: () => void;
}) {
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      role: 'assistant',
      content: articleSlug
        ? `سلام! من دستیار هوشمند دانشنامه فنی هستم. می‌توانم درباره مقاله "${articleSlug}" و استانداردهای مرتبط توضیح دهم. چه سوالی دارید؟`
        : 'سلام! من دستیار هوشمند دانشنامه فنی Xennic هستم 🤖\n\nمی‌توانم در این موارد کمک کنم:\n• توضیح استانداردهای IEC/IEEE/NEC\n• راهنمای انتخاب تجهیزات\n• محاسبات مهندسی برق\n• معرفی مقالات مرتبط\n\nچه چیزی می‌خواهید بدانید؟',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: AiChatMessage = { role: 'user', content: text.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const answer = await knowledgeAiClient.chatAboutArticle(
        articleSlug ?? 'encyclopedia',
        text.trim(),
        messages,
      );
      setMessages((m) => [...m, { role: 'assistant', content: answer }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: 'متأسفم، در اتصال به سرویس هوش مصنوعی خطایی رخ داد. لطفاً دوباره تلاش کنید.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[500px] border-primary/20 shadow-lg shadow-primary/5 overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </span>
            دستیار هوشمند دانشنامه
            <Badge className="bg-white/20 text-white border-0 text-[10px]">AI • Beta</Badge>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] opacity-80">آنلاین</span>
            {onClose && (
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center ml-1"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-3 space-y-3 bg-muted/20">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
            )}
            <div
              className={cn(
                'max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap',
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                  : 'bg-card border shadow-sm rounded-bl-sm',
              )}
            >
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                <User className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        ))}

        {messages.length <= 1 && (
          <div className="space-y-2 pt-2">
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Lightbulb className="h-3 w-3" /> پیشنهادها:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_QUESTIONS.slice(0, 3).map((q, i) => (
                <button
                  key={i}
                  onClick={() => send(q)}
                  className="text-xs px-2.5 py-1.5 rounded-full border bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors text-right"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex gap-2 items-center text-xs text-muted-foreground">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center animate-pulse">
              <Bot className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="flex items-center gap-1">
              <span
                className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce"
                style={{ animationDelay: '0ms' }}
              />
              <span
                className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <span
                className="w-1 h-1 rounded-full bg-muted-foreground animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
              در حال فکر کردن...
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </CardContent>

      <div className="p-3 border-t bg-card">
        <div className="flex items-center gap-2 rounded-xl border bg-background px-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="سوالی درباره استانداردها یا تجهیزات بپرسید..."
            className="flex-1 h-10 bg-transparent outline-none text-sm placeholder:text-muted-foreground/60"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3" /> مبتنی بر Xennic AI Gateway
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" /> استانداردها و تجهیزات
          </span>
        </div>
      </div>
    </Card>
  );
}

export function FloatingAiButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 left-6 w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30 flex items-center justify-center hover:scale-105 transition-transform z-50"
      aria-label="دستیار هوش مصنوعی"
    >
      <div className="relative">
        <MessageSquare className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
      </div>
    </button>
  );
}
