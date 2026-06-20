'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, MessageSquare, MapPin, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ContactPage() {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: actual API call
    await new Promise(r => setTimeout(r, 800));
    setSent(true);
    setLoading(false);
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-[hsl(var(--foreground))] text-sm outline-none focus:border-[hsl(var(--primary))] transition-colors placeholder:text-[hsl(var(--muted-foreground))/0.5]';

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="max-w-5xl mx-auto px-5 pt-32 pb-20">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[hsl(var(--primary))/0.3] bg-[hsl(var(--primary))/0.05] text-xs text-[hsl(var(--primary))/0.8] font-medium mb-6">
            تماس با ما
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-[hsl(var(--foreground))] leading-tight mb-4">
            در ارتباط باشید
          </h1>
          <p className="text-base text-[hsl(var(--muted-foreground))] max-w-xl mx-auto">
            سوالات، پیشنهادات و نیازهای خود را با ما در میان بگذارید
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Info */}
          <div className="space-y-6">
            {[
              { icon: Mail, title: 'ایمیل', desc: 'info@xennic.ir' },
              { icon: MessageSquare, title: 'پشتیبانی', desc: 'پاسخگویی ۲۴ ساعته' },
              { icon: MapPin, title: 'دفتر مرکزی', desc: 'تهران، ایران' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center shrink-0">
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-[hsl(var(--foreground))] font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            {sent ? (
              <div className="p-10 rounded-xl border border-[hsl(var(--success))/0.3] bg-[hsl(var(--success))/0.05] text-center">
                <div className="w-16 h-16 rounded-full bg-[hsl(var(--success))/0.2] flex items-center justify-center mx-auto mb-4">
                  <Send className="h-6 w-6 text-[hsl(var(--success))]" />
                </div>
                <h3 className="text-[hsl(var(--foreground))] text-lg font-bold mb-2">پیام شما ارسال شد</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">در اسرع وقت با شما تماس خواهیم گرفت</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input value={form.name} onChange={set('name')} placeholder="نام و نام خانوادگی" className={inputCls} required />
                  <input value={form.email} onChange={set('email')} type="email" placeholder="ایمیل" className={inputCls} required />
                </div>
                <input value={form.subject} onChange={set('subject')} placeholder="موضوع" className={inputCls} required />
                <textarea value={form.message} onChange={set('message')} rows={6} placeholder="متن پیام..." className={cn(inputCls, 'resize-none')} required />
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))' }}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  ارسال پیام
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}