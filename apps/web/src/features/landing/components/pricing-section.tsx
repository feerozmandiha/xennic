'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    name: 'رایگان',
    nameEn: 'Free',
    price: '۰',
    period: 'تومان / ماه',
    desc: 'برای آشنایی با پلتفرم',
    color: 'border-white/8',
    badge: null,
    features: [
      '۱۰۰ محاسبه در ماه',
      'محاسبات پایه (BASIC · CABLE)',
      '۱ فضای کاری',
      '۱ گیگابایت فضا',
      'پشتیبانی ایمیل',
    ],
    cta: 'شروع رایگان',
    ctaStyle: 'border border-white/10 text-white hover:bg-white/5',
  },
  {
    name: 'حرفه‌ای',
    nameEn: 'Pro',
    price: '۴۹۰,۰۰۰',
    period: 'تومان / ماه',
    desc: 'برای مهندسان حرفه‌ای',
    color: 'border-[#3b82f6]/40',
    badge: 'محبوب‌ترین',
    glow: 'rgba(59,130,246,0.15)',
    features: [
      'محاسبات نامحدود',
      'تمام ماژول‌ها + کیفیت توان',
      '۵ فضای کاری',
      '۵۰ گیگابایت فضا',
      'AI مهندسی (۵۰۰ درخواست/ماه)',
      'پشتیبانی اولویت‌دار',
    ],
    cta: 'شروع با Pro',
    ctaStyle: 'bg-gradient-to-r from-[#3b82f6] to-[#6366f1] text-white',
    shadow: '0 0 30px rgba(99,102,241,0.25)',
  },
  {
    name: 'سازمانی',
    nameEn: 'Enterprise',
    price: 'تماس',
    period: 'برای قیمت‌گذاری',
    desc: 'برای شرکت‌ها و سازمان‌ها',
    color: 'border-white/8',
    badge: null,
    features: [
      'همه امکانات Pro',
      'فضاهای کاری نامحدود',
      'AI نامحدود',
      'SSO & SAML',
      'SLA اختصاصی',
      'پشتیبانی ۲۴/۷',
    ],
    cta: 'تماس با ما',
    ctaStyle: 'border border-white/10 text-white hover:bg-white/5',
  },
];

export function PricingSection({ locale }: { locale: string }) {
  return (
    <section id="pricing" className="relative py-28 bg-[#050b14]">
      <div className="max-w-6xl mx-auto px-5">

        <div className="text-center mb-16 space-y-4">
          <p className="text-xs text-[#10b981] font-mono uppercase tracking-[0.2em]">// پلن‌ها</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            قیمت‌گذاری شفاف
          </h2>
          <p className="text-white/40 text-sm max-w-md mx-auto">
            پرداخت ماهانه، لغو هر زمان، بدون قرارداد بلندمدت
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
          {PLANS.map((plan, i) => (
            <div
              key={i}
              className={cn(
                'relative rounded-2xl border p-7 transition-all duration-300',
                plan.color,
                i === 1 && 'scale-[1.03] md:scale-[1.06]',
              )}
              style={{
                background: plan.glow
                  ? `radial-gradient(ellipse at 50% -20%, ${plan.glow} 0%, rgba(5,11,20,0.95) 70%)`
                  : 'rgba(255,255,255,0.02)',
                boxShadow: plan.shadow,
              }}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold text-white bg-gradient-to-r from-[#3b82f6] to-[#6366f1]">
                    ⭐ {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xs text-white/30 font-mono">{plan.nameEn}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-xs text-white/35">{plan.desc}</p>
              </div>

              <div className="mb-7 pb-7 border-b border-white/5">
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-black text-white tabular-nums">{plan.price}</span>
                  <span className="text-xs text-white/30 pb-1">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-2.5 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-white/60">
                    <CheckCircle2 className="h-4 w-4 text-[#10b981] shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={
                  plan.cta === 'تماس با ما'
                    ? '#footer'
                    : plan.nameEn === 'Pro'
                      ? `/${locale}/register?plan=pro`
                      : `/${locale}/register`
                }
                className={cn(
                  'block w-full text-center py-3 rounded-xl text-sm font-semibold transition-all',
                  plan.ctaStyle,
                  i === 1 && 'shadow-[0_0_20px_rgba(99,102,241,0.3)]',
                )}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
