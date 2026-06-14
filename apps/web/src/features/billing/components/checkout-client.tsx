'use client';

import { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, CreditCard, ArrowRight, Loader2, Shield, Zap } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/stores/auth.store';
import { useToast } from '@/stores/toast.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const CALLBACK_URL = typeof window !== 'undefined'
  ? `${window.location.origin}/api/v1/billing/payments/verify`
  : '';

const PLAN_INFO: Record<string, { name: string; nameEn: string; price: string; priceNum: number; features: string[] }> = {
  pro: {
    name: 'حرفه‌ای',
    nameEn: 'Pro',
    price: '۴۹۰,۰۰۰',
    priceNum: 490000,
    features: [
      'محاسبات نامحدود',
      'تمام ماژول‌ها + کیفیت توان',
      '۵ فضای کاری',
      '۵۰ گیگابایت فضا',
      'AI مهندسی (۵۰۰ درخواست/ماه)',
      'پشتیبانی اولویت‌دار',
    ],
  },
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
  const plan = PLAN_INFO[planSlug];

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'info' | 'processing' | 'redirecting'>('info');

  async function handlePay() {
    if (!wsId || !token || !plan) return;

    setLoading(true);
    setStep('processing');

    try {
      // 1. دریافت پلن‌ها برای پیدا کردن planId
      const plansRes = await apiClient.get<any>('/subscriptions/plans');
      const plans: any[] = plansRes?.data ?? [];
      const selectedPlan = plans.find((p: any) => p.slug === planSlug);

      if (!selectedPlan) {
        toast.error('پلن مورد نظر یافت نشد');
        setLoading(false);
        setStep('info');
        return;
      }

      // 2. اگر اشتراک فعال نیست، ایجاد کن
      const subRes = await apiClient.get<any>(`/workspaces/${wsId}/subscription`);
      const isActive = subRes?.data?.isActive;
      if (!isActive) {
        await apiClient.post<any>(`/workspaces/${wsId}/subscription`, {
          planId: selectedPlan.id,
        });
      }

      // 3. ایجاد فاکتور
      const invoice = await apiClient.post<any>('/billing/invoices', {
        subtotal: plan.priceNum,
        totalAmount: plan.priceNum,
        currency: 'IRR',
      });
      const invoiceId = invoice?.data?.id;
      if (!invoiceId) throw new Error('Failed to create invoice');

      // 4. ایجاد پرداخت
      const payment = await apiClient.post<any>('/billing/payments', {
        invoiceId,
        gateway: 'zarinpal',
        amount: plan.priceNum,
      });
      const paymentId = payment?.data?.id;
      if (!paymentId) throw new Error('Failed to create payment');

      // 5. درخواست URL درگاه
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
        router.push(`/${locale}/dashboard`);
      }
    } catch (err: any) {
      toast.error(err?.message ?? 'خطا در اتصال به درگاه پرداخت');
      setLoading(false);
      setStep('info');
    }
  }

  if (!plan) {
    return (
      <div className="max-w-lg mx-auto mt-12 text-center">
        <p className="text-[hsl(var(--muted-foreground))]">پلن مورد نظر یافت نشد</p>
        <Button className="mt-4" onClick={() => router.push(`/${locale}/dashboard`)}>
          بازگشت به داشبورد
        </Button>
      </div>
    );
  }

  const isProcessing = step !== 'info';

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">تکمیل خرید</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          پلن {plan.name} — برای استفاده از تمام امکانات حرفه‌ای
        </p>
      </div>

      {/* Plan Summary */}
      <Card className="border-[#3b82f6]/30 bg-[#3b82f6]/[0.03]">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))] font-mono mb-0.5">
                <Zap className="h-3 w-3" />
                {plan.nameEn}
              </div>
              <p className="text-xl font-bold">{plan.name}</p>
            </div>
            <Badge variant="default" className="text-sm px-3 py-1">
              {plan.name}
            </Badge>
          </div>

          <div className="flex items-end gap-1 pb-4 border-b border-white/10">
            <span className="text-4xl font-black tabular-nums">{plan.price}</span>
            <span className="text-sm text-[hsl(var(--muted-foreground))] pb-1">تومان / ماه</span>
          </div>

          <ul className="space-y-2.5">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-[hsl(var(--foreground)/0.7)]">
                <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))] shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Payment Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            پرداخت
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-[var(--radius)] bg-[hsl(var(--secondary)/0.5)]">
            <span className="text-sm">مبلغ قابل پرداخت</span>
            <span className="text-lg font-bold tabular-nums">{plan.price} تومان</span>
          </div>

          <Button
            onClick={handlePay}
            disabled={isProcessing}
            className="w-full h-11 text-base font-semibold"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {step === 'redirecting' ? 'در حال انتقال به درگاه پرداخت...' : 'در حال پردازش...'}
              </>
            ) : (
              <>
                پرداخت {plan.price} تومان
                <ArrowRight className="h-4 w-4 mr-1" />
              </>
            )}
          </Button>

          <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] justify-center">
            <Shield className="h-3.5 w-3.5" />
            پرداخت امن با درگاه Zarinpal
          </div>
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="border-[hsl(var(--warning)/0.2)] bg-[hsl(var(--warning)/0.03)]">
        <CardContent className="p-4 text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
          پس از پرداخت موفق، اشتراک شما بلافاصله فعال می‌شود.
          در صورت لغو در هر زمان، تا پایان دوره صورتحساب به امکانات Pro دسترسی دارید.
        </CardContent>
      </Card>
    </div>
  );
}
