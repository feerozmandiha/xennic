'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Crown, Zap, Building2, CheckCircle2, ArrowLeft, Sparkles,
  CreditCard, Receipt, Wallet, TrendingUp, AlertTriangle,
  Loader2, Plus, X, Trash2, Edit3, Star, Ban,
  LayoutDashboard, FileText, History, CreditCard as CreditCardIcon,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlan } from '@/features/subscription/hooks/use-plan';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/stores/toast.store';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Invoice {
  id: string; invoiceNumber: string; status: string; currency: string;
  subtotal: number; taxAmount: number; totalAmount: number;
  issuedAt: string; dueAt: string | null; paidAt: string | null; createdAt: string;
}

interface Payment {
  id: string; invoiceId: string; gateway: string; status: string; amount: number;
  paidAt: string | null; createdAt: string;
}

interface PaymentMethod {
  id: string; gateway: string; maskedNumber: string | null;
  cardHolderName: string | null; isDefault: boolean; createdAt: string;
}

interface BillingDashboard {
  totalInvoiced: number; totalPaid: number; totalPending: number; totalOverdue: number;
  recentPayments: Payment[];
}

interface Plan {
  id: string; name: string; slug: string; monthlyPrice: string;
  yearlyPrice: string; features: Record<string, any>; isActive: boolean;
}

type Section = 'plans' | 'invoices' | 'payments';

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ title, value, icon: Icon, color, sub }: {
  title: string; value: string; icon: React.ElementType; color: string; sub?: string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{title}</p>
            <p className="text-xl font-black">{value}</p>
            {sub && <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{sub}</p>}
          </div>
          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', color)}>
            <Icon className="h-4 w-4 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── MAIN ──────────────────────────────────────────────────────────────────────

export function BillingClient() {
  const toast = useToast();
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) ?? 'fa';
  const wsId = useAuthStore(s => s.workspaceId);
  const isAdmin = useAuthStore(s => s.isAdmin);

  const [section, setSection] = useState<Section>('plans');

  const { planSlug, calcUsed, calcLimit, aiUsed, aiLimit, isLoading: usageLoading } = usePlan();

  const { data: dashData, isLoading: dashLoading } = useQuery({
    queryKey: ['billing-dashboard', wsId],
    queryFn: () => apiClient.get<{ success: boolean; data: BillingDashboard }>('/billing/dashboard'),
    enabled: !!wsId,
  });

  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => apiClient.get<{ success: boolean; data: Plan[] }>('/subscriptions/plans'),
  });

  const { data: invData, isLoading: invLoading } = useQuery({
    queryKey: ['billing-invoices', wsId],
    queryFn: () => apiClient.get<{ success: boolean; data: Invoice[]; meta: any }>('/billing/invoices?limit=10'),
    enabled: !!wsId,
  });

  const { data: payData, isLoading: payLoading } = useQuery({
    queryKey: ['billing-payments', wsId],
    queryFn: () => apiClient.get<{ success: boolean; data: Payment[]; meta: any }>('/billing/payments?limit=10'),
    enabled: !!wsId,
  });

  const dash = dashData?.data;
  const plans = plansData?.data ?? [];
  const invoices = invData?.data ?? [];
  const payments = payData?.data ?? [];

  const SECTIONS = [
    { key: 'plans' as Section, label: 'پلن‌ها', icon: Crown },
    { key: 'invoices' as Section, label: 'فاکتورها', icon: FileText },
    { key: 'payments' as Section, label: 'تراکنش‌ها', icon: History },
  ];

  function formatPrice(num: number): string {
    return (num / 10).toLocaleString('fa-IR');
  }

  function statusBadge(status: string, type: 'invoice' | 'payment') {
    const styles: Record<string, string> = {
      paid: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      overdue: 'bg-red-100 text-red-600',
      cancelled: 'bg-gray-100 text-gray-500',
      refunded: 'bg-purple-100 text-purple-700',
      processing: 'bg-blue-100 text-blue-700',
      failed: 'bg-red-100 text-red-600',
    };
    const labels: Record<string, string> = {
      paid: 'پرداخت شده',
      pending: 'در انتظار',
      overdue: 'سررسید شده',
      cancelled: 'لغو شده',
      refunded: 'برگشت داده شده',
      processing: 'در حال پردازش',
      failed: 'ناموفق',
    };
    return (
      <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', styles[status] ?? 'bg-gray-100 text-gray-500')}>
        {labels[status] ?? status}
      </span>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Admin notice */}
      {isAdmin && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.05)] text-sm">
          <Sparkles className="h-4 w-4 text-[hsl(var(--primary))] shrink-0" />
          <span>به عنوان <span className="font-semibold">ادمین سیستم</span>، دسترسی کامل به تمام محاسبات و ویژگی‌ها برقرار است.</span>
        </div>
      )}

      {/* Dashboard Summary */}
      {!dashLoading && dash && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard title="مجموع صورتحساب" value={`${formatPrice(dash.totalInvoiced)} تومان`} icon={TrendingUp} color="bg-blue-500" />
          <StatCard title="پرداخت شده" value={`${formatPrice(dash.totalPaid)} تومان`} icon={Wallet} color="bg-green-500" sub={`${dash.recentPayments?.length ?? 0} تراکنش`} />
          <StatCard title="در انتظار پرداخت" value={`${formatPrice(dash.totalPending)} تومان`} icon={AlertTriangle} color="bg-yellow-500" />
          {dash.totalOverdue > 0 && (
            <StatCard title="سررسید شده" value={`${formatPrice(dash.totalOverdue)} تومان`} icon={Ban} color="bg-red-500" />
          )}
        </div>
      )}

      {/* Current plan + usage */}
      {!usageLoading && planSlug && (
        <Card className="border-[hsl(var(--border))]">
          <CardContent className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">پلن فعلی شما</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold capitalize">{planSlug}</span>
                  <Badge variant={planSlug === 'free' ? 'secondary' : 'default'}>
                    {planSlug === 'free' ? 'رایگان' : planSlug === 'pro' ? 'حرفه‌ای' : 'سازمانی'}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-6 text-sm">
                <div className="text-center">
                  <p className="font-bold text-lg tabular-nums">
                    {calcLimit === -1 ? '∞' : calcUsed}
                    {calcLimit !== -1 && <span className="text-[hsl(var(--muted-foreground))] font-normal text-xs"> / {calcLimit}</span>}
                  </p>
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))]">محاسبه این ماه</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg tabular-nums">
                    {aiLimit === -1 ? '∞' : aiUsed}
                    {aiLimit !== -1 && <span className="text-[hsl(var(--muted-foreground))] font-normal text-xs"> / {aiLimit}</span>}
                  </p>
                  <p className="text-[10px] text-[hsl(var(--muted-foreground))]">درخواست AI</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section tabs */}
      <div className="flex gap-1.5">
        {SECTIONS.map(s => {
          const Icon = s.icon;
          return (
            <button key={s.key} onClick={() => setSection(s.key)}
              className={cn(
                'flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium transition-all',
                section === s.key
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                  : 'bg-[hsl(var(--secondary)/0.5)] text-[hsl(var(--foreground)/0.7)] hover:bg-[hsl(var(--secondary))]',
              )}>
              <Icon className="h-3.5 w-3.5" />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* ── PLANS SECTION ───────────────────────────────────── */}
      {section === 'plans' && (
        <div className="space-y-6">
          {/* Plan cards from API */}
          {plansLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-96 rounded-xl bg-[hsl(var(--secondary)/0.5)] animate-pulse" />
              ))}
            </div>
          ) : plans.length === 0 ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">پلنی یافت نشد</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {plans.map((plan) => {
                const isCurrent = plan.slug === planSlug;
                const isHighlight = plan.slug === 'pro';
                const PlanIcon = plan.slug === 'free' ? Zap : plan.slug === 'pro' ? Crown : Building2;
                const planFeatures = plan.features as Record<string, any> ?? {};

                const FEATURE_LIST: { label: string; ok: boolean }[] = [];
                if (planFeatures.projects !== undefined) FEATURE_LIST.push({ label: `${planFeatures.projects} پروژه`, ok: true });
                if (planFeatures.calculations_month !== undefined) FEATURE_LIST.push({ label: planFeatures.calculations_month === -1 ? 'محاسبات نامحدود' : `${planFeatures.calculations_month} محاسبه/ماه`, ok: true });
                if (planFeatures.ai_requests_month !== undefined) FEATURE_LIST.push({ label: planFeatures.ai_requests_month === -1 ? 'AI نامحدود' : `${planFeatures.ai_requests_month} AI/ماه`, ok: true });
                if (planFeatures.storage_gb !== undefined) FEATURE_LIST.push({ label: planFeatures.storage_gb === -1 ? 'فضای نامحدود' : `${planFeatures.storage_gb} گیگابایت`, ok: true });
                if (planFeatures.api_access) FEATURE_LIST.push({ label: `دسترسی API سطح ${planFeatures.api_access}`, ok: true });
                if (planFeatures.report_formats) FEATURE_LIST.push({ label: `گزارش‌های ${planFeatures.report_formats}`, ok: true });
                FEATURE_LIST.push({ label: 'پشتیبانی اولیه', ok: true });

                return (
                  <div key={plan.id}
                    className={cn(
                      'relative flex flex-col rounded-xl border transition-shadow',
                      isHighlight ? 'border-[hsl(var(--primary)/0.5)] shadow-[0_0_0_1px_hsl(var(--primary)/0.15),0_4px_24px_hsl(var(--primary)/0.08)]' : 'border-[hsl(var(--border))]',
                    )}>
                    {isHighlight && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                        <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-bold text-white bg-[hsl(var(--primary))]">
                          <Sparkles className="h-3 w-3" />
                          پیشنهادی
                        </span>
                      </div>
                    )}
                    <div className={cn('p-6 rounded-t-xl', isHighlight ? 'bg-[hsl(var(--primary)/0.04)]' : '')}>
                      <div className="flex items-center gap-2.5 mb-4">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[hsl(var(--primary)/0.1)]">
                          <PlanIcon className="h-4.5 w-4.5 text-[hsl(var(--primary))]" />
                        </div>
                        <div>
                          <p className="font-bold text-base">{plan.name}</p>
                          <p className="text-[10px] text-[hsl(var(--muted-foreground))] font-mono">{plan.slug}</p>
                        </div>
                        {isCurrent && (
                          <Badge variant="outline" className="mr-auto text-[10px]">پلن فعلی</Badge>
                        )}
                      </div>
                      <div className="mb-5">
                        {plan.slug === 'enterprise' ? (
                          <p className="text-2xl font-black">تماس بگیرید</p>
                        ) : (
                          <div className="flex items-end gap-1.5">
                            <span className="text-3xl font-black tabular-nums">
                              {Number(plan.monthlyPrice).toLocaleString('fa-IR')}
                            </span>
                            <span className="text-xs text-[hsl(var(--muted-foreground))] pb-1">تومان / ماه</span>
                          </div>
                        )}
                      </div>
                      {plan.slug === 'enterprise' ? (
                        <button onClick={() => window.open('mailto:sales@xennic.ir', '_blank')}
                          className="w-full h-10 rounded-lg border border-[hsl(var(--border))] text-sm font-semibold hover:bg-[hsl(var(--secondary))] transition-colors">
                          تماس با فروش
                        </button>
                      ) : isCurrent ? (
                        <div className="w-full h-10 rounded-lg border border-[hsl(var(--border))] text-sm font-medium flex items-center justify-center gap-1.5 text-[hsl(var(--muted-foreground))]">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          پلن فعلی شما
                        </div>
                      ) : (
                        <button onClick={() => router.push(`/${locale}/billing/checkout?plan=${plan.slug}`)}
                          className={cn('w-full h-10 rounded-lg text-sm font-semibold transition-opacity flex items-center justify-center gap-1.5',
                            isHighlight ? 'bg-[hsl(var(--primary))] text-white hover:opacity-90' : 'border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))]')}>
                          {plan.slug === 'pro' ? <><Crown className="h-3.5 w-3.5" /> ارتقا به Pro<ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" /></> : 'انتخاب این پلن'}
                        </button>
                      )}
                    </div>
                    <div className="p-6 pt-5 flex-1 border-t border-[hsl(var(--border))] rounded-b-xl">
                      <p className="text-[10px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3">امکانات</p>
                      <ul className="space-y-2">
                        {FEATURE_LIST.map((f) => (
                          <li key={f.label} className="flex items-start gap-2 text-xs">
                            <CheckCircle2 className={cn('h-3.5 w-3.5 shrink-0 mt-0.5', f.ok ? 'text-green-600' : 'text-[hsl(var(--muted-foreground)/0.3)]')} />
                            <span className={cn(!f.ok && 'text-[hsl(var(--muted-foreground)/0.5)] line-through')}>{f.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-center text-xs text-[hsl(var(--muted-foreground))]">
            تمام پلن‌ها شامل پشتیبانی اولیه هستند · برای سوال با <a href="mailto:support@xennic.ir" className="underline">support@xennic.ir</a> تماس بگیرید
          </p>
        </div>
      )}

      {/* ── INVOICES SECTION ─────────────────────────────────── */}
      {section === 'invoices' && (
        <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[hsl(var(--secondary)/0.5)]">
              <tr>
                <th className="text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] px-4 py-3">شماره</th>
                <th className="text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] px-4 py-3">وضعیت</th>
                <th className="text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] px-4 py-3">مبلغ</th>
                <th className="text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] px-4 py-3">تاریخ</th>
                <th className="text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] px-4 py-3">سررسید</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
              {invLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-4 bg-[hsl(var(--secondary)/0.5)] rounded animate-pulse" /></td></tr>
                ))
              ) : invoices.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">هیچ فاکتوری یافت نشد</td></tr>
              ) : invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[hsl(var(--secondary)/0.3)] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs ltr">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3">{statusBadge(inv.status, 'invoice')}</td>
                  <td className="px-4 py-3 font-medium tabular-nums">{formatPrice(inv.totalAmount)} تومان</td>
                  <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">{new Date(inv.issuedAt).toLocaleDateString('fa-IR')}</td>
                  <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">{inv.dueAt ? new Date(inv.dueAt).toLocaleDateString('fa-IR') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── PAYMENTS SECTION ─────────────────────────────────── */}
      {section === 'payments' && (
        <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[hsl(var(--secondary)/0.5)]">
              <tr>
                <th className="text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] px-4 py-3">درگاه</th>
                <th className="text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] px-4 py-3">وضعیت</th>
                <th className="text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] px-4 py-3">مبلغ</th>
                <th className="text-right text-xs font-semibold text-[hsl(var(--muted-foreground))] px-4 py-3">تاریخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border)/0.5)]">
              {payLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}><td colSpan={4} className="px-4 py-3"><div className="h-4 bg-[hsl(var(--secondary)/0.5)] rounded animate-pulse" /></td></tr>
                ))
              ) : payments.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">هیچ تراکنشی یافت نشد</td></tr>
              ) : payments.map((pay) => (
                <tr key={pay.id} className="hover:bg-[hsl(var(--secondary)/0.3)] transition-colors">
                  <td className="px-4 py-3 font-medium text-xs">{pay.gateway}</td>
                  <td className="px-4 py-3">{statusBadge(pay.status, 'payment')}</td>
                  <td className="px-4 py-3 font-medium tabular-nums">{formatPrice(pay.amount)} تومان</td>
                  <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">{new Date(pay.createdAt).toLocaleDateString('fa-IR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
