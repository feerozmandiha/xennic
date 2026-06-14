'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Zap, Shield, Globe, Cpu, ArrowRight } from 'lucide-react';

const VALUES = [
  { icon: Shield, title: 'دقت و استاندارد', desc: 'تمام محاسبات بر اساس آخرین استانداردهای IEC و IEEE انجام می‌شود.' },
  { icon: Cpu, title: 'هوش مصنوعی مهندسی', desc: 'Xennic AI با مدل‌های تخصصی مهندسی برق، پاسخ‌های دقیق ارائه می‌دهد.' },
  { icon: Globe, title: 'دسترسی جهانی', desc: 'پلتفرم آنلاین با پشتیبانی از زبان فارسی و انگلیسی.' },
];

const TEAM = [
  { name: 'مهندس احمد فیروزمندی', role: 'مدیرعامل', bio: ' مهندسی برق قدرت' },
  { name: 'مهندس سارا کریمی', role: 'مدیر فنی', bio: 'کارشناسی ارشد هوش مصنوعی' },
  { name: 'مهندس علی محمدی', role: 'سرپرست محاسبات', bio: 'کارشناسی ارشد مهندسی برق' },
];

export default function AboutPage() {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'fa';

  return (
    <div className="min-h-screen bg-[#050b14]">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-5 pt-32 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#3b82f6]/30 bg-[#3b82f6]/5 text-xs text-[#93c5fd] font-medium mb-6">
          درباره Xennic
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
          پلتفرم تخصصی{' '}
          <span className="bg-gradient-to-r from-[#3b82f6] to-[#6366f1] bg-clip-text text-transparent">
            مهندسی برق
          </span>
        </h1>
        <p className="text-base sm:text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
          Xennic یک پلتفرم یکپارچه برای محاسبات مهندسی برق، تحلیل کیفیت توان، انرژی‌های تجدیدپذیر
          و مشاوره تخصصی با استانداردهای بین‌المللی IEC و IEEE است.
        </p>
      </div>

      {/* Values */}
      <div className="max-w-5xl mx-auto px-5 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {VALUES.map((v, i) => (
            <div key={i} className="p-6 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#6366f1] flex items-center justify-center mb-4">
                <v.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-white font-bold mb-2">{v.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="max-w-5xl mx-auto px-5 pb-20">
        <h2 className="text-2xl font-bold text-white text-center mb-8">تیم ما</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TEAM.map((m, i) => (
            <div key={i} className="p-5 rounded-xl border border-white/5 bg-white/[0.02] text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#6366f1] flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-white">{m.name[0]}</span>
              </div>
              <h3 className="text-white font-semibold">{m.name}</h3>
              <p className="text-xs text-[#93c5fd] mt-0.5">{m.role}</p>
              <p className="text-xs text-white/40 mt-1">{m.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-5xl mx-auto px-5 pb-24 text-center">
        <Link
          href={`/${locale}/register`}
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white text-sm transition-all"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 0 30px rgba(99,102,241,0.35)' }}
        >
          شروع رایگان
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
