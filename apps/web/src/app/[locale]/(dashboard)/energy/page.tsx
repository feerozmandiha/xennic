import type { Metadata } from 'next';
import { BillAnalyzer } from '@/features/energy/components/bill-analyzer';

export const metadata: Metadata = {
  title: 'Xennic — تحلیل هوشمند قبض برق',
};

export default function EnergyPage() {
  return <BillAnalyzer />;
}
