import type { Metadata } from 'next';
import { AiChatClient } from '@/features/ai/components/ai-chat-client';

export const metadata: Metadata = {
  title: 'Xennic AI — مشاور مهندسی برق',
};

export default function AiPage() {
  return <AiChatClient />;
}
