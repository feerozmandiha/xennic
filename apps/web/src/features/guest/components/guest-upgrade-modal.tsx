'use client';

import { useLocale } from 'next-intl';
import Link from 'next/link';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Zap, Sparkles, ArrowRight } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GuestUpgradeModal({ open, onOpenChange }: Props) {
  const locale = useLocale();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[#0a0f1e] p-8 shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out">
          <Dialog.Close className="absolute left-4 top-4 text-white/30 hover:text-white/70 transition-colors">
            <X className="h-4 w-4" />
          </Dialog.Close>

          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#6366f1] flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-white" />
            </div>

            <Dialog.Title className="text-xl font-bold text-white">
              {locale === 'fa' ? 'به محدودیت محاسبات رایگان رسیدید!' : 'Free calculation limit reached!'}
            </Dialog.Title>

            <Dialog.Description className="text-sm text-white/50 leading-relaxed">
              {locale === 'fa'
                ? 'برای دسترسی نامحدود به محاسبات مهندسی برق، گزارش‌های حرفه‌ای و مقالات تخصصی، همین حالا عضو شوید.'
                : 'Sign up now for unlimited electrical engineering calculations, professional reports, and expert articles.'}
            </Dialog.Description>

            <div className="flex flex-col w-full gap-3 pt-2">
              <Link
                href={`/${locale}/register`}
                onClick={() => onOpenChange(false)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#6366f1] px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-all"
              >
                <Zap className="h-4 w-4" />
                {locale === 'fa' ? 'ثبت‌نام رایگان' : 'Sign up free'}
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href={`/${locale}/login`}
                onClick={() => onOpenChange(false)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-white transition-all"
              >
                {locale === 'fa' ? 'قبلاً عضو هستم — ورود' : 'Already a member — Login'}
              </Link>
            </div>

            <p className="text-xs text-white/20">
              {locale === 'fa'
                ? 'بدون نیاز به کارت بانکی • لغو در هر زمان'
                : 'No credit card required • Cancel anytime'}
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
