import type { Metadata } from 'next';
import { AiChatClient } from '@/features/ai/components/ai-chat-client';

export const metadata: Metadata = {
  title: 'Xennic AI — مشاور مهندسی برق',
};

type SearchParams = Promise<{ prompt?: string; title?: string; ref?: string }>;

export default async function AiPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const prompt = sp.prompt ? decodeURIComponent(sp.prompt) : undefined;
  const title = sp.title ? decodeURIComponent(sp.title) : undefined;
  const url = sp.ref ? decodeURIComponent(sp.ref) : undefined;
  return <AiChatClient initialPrompt={prompt} initialContext={{ title, url }} />;
}
