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

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: actual API call
    setTimeout(() => setSent(true), 800);
  };

  const inputCls = 'w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white text-sm outline-none focus:border-[#3b82f6] transition-colors placeholder:text-white/20';

  return (
    <div className="min-h-screen bg-[#050b14]">
      <div className="max-w-5xl mx-auto px-5 pt-32 pb-20">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#3b82f6]/30 bg-[#3b82f6]/5 text-xs text-[#93c5fd] font-medium mb-6">
            تماس با ما
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
            در ارتباط باشید
          </h1>
          <p className="text-base text-white/50 max-w-xl mx-auto">
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
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#6366f1] flex items-center justify-center shrink-0">
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-white/40">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="md:col-span-2">
            {sent ? (
              <div className="p-10 rounded-xl border border-green-500/30 bg-green-500/5 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <Send className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-white text-lg font-bold mb-2">پیام شما ارسال شد</h3>
                <p className="text-sm text-white/50">در اسرع وقت با شما تماس خواهیم گرفت</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input value={form.name} onChange={set('name')} placeholder="نام و نام خانوادگی" className={inputCls} required />
                  <input value={form.email} onChange={set('email')} type="email" placeholder="ایمیل" className={inputCls} required />
                </div>
                <input value={form.subject} onChange={set('subject')} placeholder="موضوع" className={inputCls} required />
                <textarea value={form.message} onChange={set('message')} rows={6} placeholder="متن پیام..." className={cn(inputCls, 'resize-none')} required />
                <button type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm transition-all"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
                >
                  ارسال پیام
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
