'use client';

import { FlaskConical, BarChart3, Cpu, Layers, Shield, Globe } from 'lucide-react';

const FEATURES = [
  {
    icon: FlaskConical,
    color: 'from-[#3b82f6] to-[#6366f1]',
    glow:  'rgba(99,102,241,0.25)',
    title: 'محاسبات استاندارد',
    desc:  '۲۰+ محاسبه تخصصی مطابق IEC 60364، IEC 60076، IEEE 519 و IEEE C57.110',
    tags:  ['کابل‌سایزینگ', 'افت ولتاژ', 'اتصال کوتاه', 'ترانسفورماتور'],
  },
  {
    icon: BarChart3,
    color: 'from-[#06b6d4] to-[#3b82f6]',
    glow:  'rgba(6,182,212,0.25)',
    title: 'کیفیت توان',
    desc:  'تحلیل THD، TDD، K-Factor، رزونانس هارمونیک و طراحی فیلتر پسیو/فعال مطابق IEEE 519',
    tags:  ['THD', 'TDD', 'Passive Filter', 'Active APF'],
  },
  {
    icon: Cpu,
    color: 'from-[#8b5cf6] to-[#6366f1]',
    glow:  'rgba(139,92,246,0.25)',
    title: 'هوش مصنوعی مهندسی',
    desc:  'مشاور AI تخصصی برق با دانش استانداردها، طراحی سیستم و تشخیص اشکال',
    tags:  ['مشاور تخصصی', 'تشخیص خطا', 'بهینه‌سازی'],
  },
  {
    icon: Layers,
    color: 'from-[#f59e0b] to-[#ef4444]',
    glow:  'rgba(245,158,11,0.2)',
    title: 'مدیریت پروژه',
    desc:  'سازماندهی پروژه‌های مهندسی، یادداشت‌های فنی، تاریخچه محاسبات و همکاری تیمی',
    tags:  ['Multi-tenant', 'Team RBAC', 'تاریخچه'],
  },
  {
    icon: Shield,
    color: 'from-[#10b981] to-[#06b6d4]',
    glow:  'rgba(16,185,129,0.2)',
    title: 'امنیت و تطابق',
    desc:  'احراز هویت JWT، کنترل دسترسی نقش‌محور، ثبت تمام رویدادها و رمزگذاری داده',
    tags:  ['JWT Auth', 'RBAC', 'Audit Log'],
  },
  {
    icon: Globe,
    color: 'from-[#6366f1] to-[#8b5cf6]',
    glow:  'rgba(99,102,241,0.2)',
    title: 'چندزبانه & RTL',
    desc:  'پشتیبانی کامل از زبان فارسی با چینش RTL، فونت IranSansX و تقویم شمسی',
    tags:  ['فارسی', 'RTL', 'IranSansX'],
  },
];

function FeatureCard({ feature: f, index }: { feature: typeof FEATURES[0]; index: number }) {
  const Icon = f.icon;
  return (
    <div
      className="relative rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all duration-300 group overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.02)', animationDelay: `${index * 80}ms` }}
    >
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${f.glow} 0%, transparent 70%)` }}
      />

      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
        style={{
          background: `linear-gradient(135deg, ${f.color.replace('from-[', '').replace('] to-[', ', ').replace(']', '')})`,
          boxShadow: `0 0 20px ${f.glow}`,
        }}
      >
        <Icon className="h-5 w-5 text-white" />
      </div>

      <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
      <p className="text-sm text-white/45 leading-relaxed mb-4">{f.desc}</p>

      <div className="flex flex-wrap gap-1.5">
        {f.tags.map(tag => (
          <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-medium border border-white/8 text-white/40">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-28 bg-[#050b14] overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#050b14] to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <p className="text-xs text-[#3b82f6] font-mono uppercase tracking-[0.2em]">// ویژگی‌ها</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white text-balance">
            همه ابزارهای مهندسی برق<br />
            <span
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              در یک پلتفرم
            </span>
          </h2>
          <p className="text-white/45 max-w-xl mx-auto text-sm leading-relaxed">
            از محاسبات پایه تا تحلیل‌های پیچیده کیفیت توان — با استانداردهای بین‌المللی
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <FeatureCard key={i} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
