import type { Metadata } from 'next';
import { StandardsMatrixView } from '@/features/knowledge/components/encyclopedia/standards/standards-matrix-view';

export const metadata: Metadata = {
  title: 'استانداردهای مهندسی برق | دانشنامه فنی Xennic',
  description: 'ماتریس استانداردهای IEC, IEEE, NEC, NEMA مرتبط با محاسبات و تجهیزات',
};

export default function StandardsPage() {
  return (
    <div className="max-w-7xl mx-auto px-5 py-10">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">استانداردهای مهندسی برق</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-3xl leading-relaxed">
          ماتریس کامل ۲۸ استاندارد (IEC 60027, 60076, 60364-5-52, 60909, IEEE 80, 519, NEC 2023 و ...) در ۸ دسته.
        </p>
      </div>
      <StandardsMatrixView />
    </div>
  );
}
