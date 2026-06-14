'use client';

import { useState } from 'react';
import { Zap, ArrowRight, Calculator, Lock } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function CableSizingSamplePage() {
  const locale = useParams().locale as string;
  const [current, setCurrent] = useState<number | null>(null);
  const [length, setLength] = useState<number | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [showCta, setShowCta] = useState(false);

  function handleCalc() {
    if (!current || !length) return;
    const size = Math.ceil((current * length * 0.018) / 10) * 10;
    setResult(`سایز کابل پیشنهادی: ${Math.max(size, 4)} mm²`);
    setShowCta(true);
  }

  return (
    <div className="min-h-screen bg-[#050b14]">
      <div className="max-w-2xl mx-auto px-5 py-16 space-y-8">
        <Link
          href={`/${locale}/register`}
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          بازگشت
        </Link>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#3b82f6] text-xs font-semibold mb-2">
            <Zap className="h-3.5 w-3.5" />
            نمونه رایگان
          </div>
          <h1 className="text-2xl font-black text-white">محاسبه سایز کابل</h1>
          <p className="text-sm text-white/50">بر اساس جریان بار، طول کابل و ولتاژ — استاندارد IEC 60364</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">جریان بار (A)</label>
              <input
                type="number"
                value={current ?? ''}
                onChange={e => setCurrent(Number(e.target.value))}
                className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-[#3b82f6]"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">طول کابل (m)</label>
              <input
                type="number"
                value={length ?? ''}
                onChange={e => setLength(Number(e.target.value))}
                className="w-full h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-[#3b82f6]"
                dir="ltr"
              />
            </div>
          </div>

          <button
            onClick={handleCalc}
            disabled={!current || !length}
            className="w-full h-10 rounded-lg bg-[#3b82f6] text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-40"
          >
            <Calculator className="h-4 w-4 inline ml-1.5" />
            محاسبه نمونه
          </button>

          {result && (
            <div className="rounded-lg bg-[#3b82f6]/10 border border-[#3b82f6]/20 p-4 text-center">
              <p className="text-sm text-white font-semibold">{result}</p>
              <p className="text-[10px] text-white/40 mt-1">تخمین ساده — محاسبه دقیق نیاز به عضویت دارد</p>
            </div>
          )}
        </div>

        {showCta && (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6 text-center space-y-3">
            <Lock className="h-6 w-6 mx-auto text-amber-400" />
            <p className="text-sm text-white/70">
              برای محاسبات کامل با در نظر گرفتن ضریب تصحیح دما، روش نصب و تلفات، عضو شوید
            </p>
            <Link
              href={`/${locale}/register`}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#6366f1] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-all"
            >
              عضویت رایگان
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
