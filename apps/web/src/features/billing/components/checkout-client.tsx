'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2, CreditCard, ArrowRight, Loader2, Shield,
  Zap, Crown, Building2, CheckCheck, XCircle, ArrowLeft,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/stores/auth.store';
import { useToast } from '@/stores/toast.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CALLBACK_URL = typeof window !== 'undefined'
  ? `${window.location.origin}/api/v1/billing/callback`
  : '';

const PLAN_CONFIG: Record<string, { icon: React.ElementType; color: string; monthlyPrice: string }> = {
  free:       { icon: Zap,      color: 'hsl(var(--muted-foreground))', monthlyPrice: 'رایگان' },
  pro:        { icon: Crown,    color: 'hsl(var(--primary))',          monthlyPrice: '' },
  enterprise: { icon: Building2, color: 'hsl(var(--foreground))',     monthlyPrice: '' },
};

export function CheckoutClient() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const locale = (params?.locale as string) ?? 'fa';
  const wsId = useAuthStore(s => s.workspaceId);
  const token = useAuthStore(s => s.token);
  const toast = useToast();

  const planSlug = searchParams?.get('plan') ?? 'pro';

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'info' | 'processing' | 'redirecting'>('info');
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | null>(null);

  const { data: plansData } = useQuery({
    queryKey: ['subscription-plans-checkout'],
    queryFn: () => apiClient.get<{ success: boolean; data: any[] }>('/subscriptions/plans'),
    staleTime: 60_000,
  });

  const plans = plansData?.data ?? [];
  const selectedPlan = plans.find((p: any) => p.slug === planSlug);
  const planConfig = PLAN_CONFIG[planSlug] ?? PLAN_CONFIG.pro;
  const Icon = planConfig.icon;
  const monthlyPrice = selectedPlan ? Number(selectedPlan.monthlyPrice) : 0;

  const [subCreated, setSubCreated] = useState(false);

  useEffect(() => {
    const p = searchParams?.get('payment');
    if (p === 'success') {
      setPaymentStatus('success');
      (async () => {
        if (!wsId || !token || subCreated) return;
        const planToActivate = selectedPlan || plans.find((p: any) => p.slug === planSlug);
        if (!planToActivate) return;
        try {
          const subRes = await apiClient.get<any>(`/workspaces/${wsId}/subscription`);
          if (!subRes?.data?.isActive) {
            await apiClient.post<any>(`/workspaces/${wsId}/subscription`, {
              planId: planToActivate.id,
            });
          }
          setSubCreated(true);
          toast.success('پرداخت با موفقیت انجام شد. اشتراک شما فعال شد.');
        } catch {
          toast.success('پرداخت با موفقیت انجام شد.');
        }
      })();
    } else if (p === 'failed') {
      setPaymentStatus('failed');
      toast.error('پرداخت ناموفق بود، لطفاً مجدداً تلاش کنید.');
    }
  }, [plans, selectedPlan]);

  async function handlePay() {
    if (!wsId || !token || !selectedPlan) return;

    setLoading(true);
    setStep('processing');

    try {
      const invoice = await apiClient.post<any>('/billing/invoices', {
        subtotal: monthlyPrice,
        totalAmount: monthlyPrice,
        currency: 'IRR',
      });
      const invoiceId = invoice?.data?.id;
      if (!invoiceId) throw new Error('Failed to create invoice');

      const payment = await apiClient.post<any>('/billing/payments', {
        invoiceId,
        gateway: 'zarinpal',
        amount: monthlyPrice,
      });
      const paymentId = payment?.data?.id;
      if (!paymentId) throw new Error('Failed to create payment');

      setStep('redirecting');
      const gatewayRes = await apiClient.post<any>('/billing/payments/request', {
        paymentId,
        callbackUrl: CALLBACK_URL,
      });
      const gatewayUrl = gatewayRes?.data?.url ?? gatewayRes?.data?.redirectUrl;

      if (gatewayUrl) {
        window.location.href = gatewayUrl;
      } else {
        toast.success('پرداخت با موفقیت ثبت شد');
        router.push(`/${locale}/settings?tab=plan`);
      }
    } catch (err: any) {
      toast.error(err?.message ?? 'خطا در اتصال به درگاه پرداخت');
      setLoading(false);
      setStep('info');
    }
  }

  if (!selectedPlan && plans.length > 0) {
    return (
      <div className="max-w-lg mx-auto mt-12 text-center space-y-4">
        <p className="text-[hsl(var(--muted-foreground))]">پلن مورد نظر یافت نشد</p>
        <Button onClick={() => router.push(`/${locale}/settings?tab=plan`)}>بازگشت به صفحه اشتراک</Button>
      </div>
    );
  }

  const isProcessing = step !== 'info';

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">تکمیل خرید</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          پلن {selectedPlan?.name ?? planSlug}
        </p>
      </div>

      {/* Payment Status */}
      {paymentStatus === 'success' && (
        <Card className="border-green-300 bg-green-50">
          <CardContent className="p-5 flex items-center gap-3">
            <CheckCheck className="h-6 w-6 text-green-600 shrink-0" />
            <div>
              <p className="font-semibold">پرداخت با موفقیت انجام شد</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">اشتراک شما فعال شد.</p>
            </div>
          </CardContent>
        </Card>
      )}
      {paymentStatus === 'failed' && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="p-5 flex items-center gap-3">
            <XCircle className="h-6 w-6 text-red-600 shrink-0" />
            <div>
              <p className="font-semibold">پرداخت ناموفق</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">پرداخت تأیید نشد. لطفاً مجدداً تلاش کنید.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Summary */}
      <Card className={cn('border', planSlug === 'pro' && 'border-[#3b82f6]/30 bg-[#3b82f6]/[0.03]')}>
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[hsl(var(--primary)/0.1)]">
                <Icon className="h-4.5 w-4.5" style={{ color: planConfig.color }} />
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--muted-foreground))] font-mono">{planSlug}</p>
                <p className="text-xl font-bold">{selectedPlan?.name ?? planSlug}</p>
              </div>
            </div>
            <Badge variant="default" className="text-sm px-3 py-1">{selectedPlan?.name ?? planSlug}</Badge>
          </div>

          <div className="flex items-end gap-1 pb-4 border-b border-[hsl(var(--border))]">
            {planSlug === 'free' ? (
              <span className="text-4xl font-black">رایگان</span>
            ) : planSlug === 'enterprise' ? (
              <span className="text-4xl font-black">تماس بگیرید</span>
            ) : (
              <>
                <span className="text-4xl font-black tabular-nums">
                  {monthlyPrice.toLocaleString('fa-IR')}
                </span>
                <span className="text-sm text-[hsl(var(--muted-foreground))] pb-1">تومان / ماه</span>
              </>
            )}
          </div>

          {selectedPlan?.features && (
            <ul className="space-y-2.5">
              {Object.entries(selectedPlan.features as Record<string, any>).map(([key, val]) => (
                <li key={key} className="flex items-start gap-2.5 text-sm text-[hsl(var(--foreground)/0.7)]">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                  {typeof val === 'boolean' ? (val ? key : null) : `${key}: ${val}`}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Payment */}
      {planSlug !== 'free' && planSlug !== 'enterprise' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              پرداخت
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--secondary)/0.5)]">
              <span className="text-sm">مبلغ قابل پرداخت</span>
              <span className="text-lg font-bold tabular-nums">
                {monthlyPrice.toLocaleString('fa-IR')} تومان
              </span>
            </div>

            <Button onClick={handlePay} disabled={isProcessing}
              className="w-full h-11 text-base font-semibold">
              {isProcessing ? (
                <><Loader2 className="h-4 w-4 animate-spin" />{step === 'redirecting' ? 'در حال انتقال به درگاه پرداخت...' : 'در حال پردازش...'}</>
              ) : (
                <>پرداخت {monthlyPrice.toLocaleString('fa-IR')} تومان<ArrowRight className="h-4 w-4 mr-1" /></>
              )}
            </Button>

            <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] justify-center">
              <Shield className="h-3.5 w-3.5" /> پرداخت امن با درگاه Zarinpal
            </div>
          </CardContent>
        </Card>
      )}

      {(planSlug === 'free' || planSlug === 'enterprise') && (
        <div className="text-center space-y-4">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {planSlug === 'free' ? 'پلن رایگان نیاز به پرداخت ندارد.' : 'برای پلن سازمانی با تیم فروش تماس بگیرید.'}
          </p>
          <Button onClick={() => router.push(`/${locale}/settings?tab=plan`)}>
            <ArrowLeft className="h-4 w-4 ml-1 rtl:rotate-180" />
            بازگشت
          </Button>
        </div>
      )}

      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4 text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
          پس از پرداخت موفق، اشتراک شما بلافاصله فعال می‌شود.
          در صورت لغو در هر زمان، تا پایان دوره صورتحساب به امکانات Pro دسترسی دارید.
        </CardContent>
      </Card>
    </div>
  );
}
