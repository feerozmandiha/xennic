import type { Metadata } from 'next';
import { VisionUploadClient } from '@/features/vision/components/vision-upload-client';

export const metadata: Metadata = {
  title: 'Xennic — بینایی ماشین',
};

export default function VisionPage() {
  return <VisionUploadClient />;
}
