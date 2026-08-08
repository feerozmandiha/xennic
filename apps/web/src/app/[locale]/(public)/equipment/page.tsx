import type { Metadata } from 'next';
import { EquipmentDirectory } from '@/features/knowledge/components/encyclopedia/equipment/equipment-directory';

export const metadata: Metadata = {
  title: 'تجهیزات الکتریکی | دانشنامه فنی Xennic',
  description: 'فهرست تجهیزات الکتریکی مرتبط با استانداردهای IEC/IEEE و محاسبات مهندسی برق',
};

export default function EquipmentPage() {
  return (
    <div className="max-w-7xl mx-auto px-5 py-10">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">تجهیزات الکتریکی</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-3xl leading-relaxed">
          این بخش بر اساس docs/engineering-standards-matrix.md و docs/calculation-catalog.md ساخته شده و هر تجهیز را به استانداردها، مقررات و محاسبات مرتبط لینک می‌کند.
        </p>
      </div>
      <EquipmentDirectory />
    </div>
  );
}
