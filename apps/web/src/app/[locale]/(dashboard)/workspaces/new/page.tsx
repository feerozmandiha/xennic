import type { Metadata } from 'next';
import { WorkspaceNewClient } from '@/features/workspace/components/workspace-new-client';

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'ایجاد فضای کاری جدید' };
}

export default function WorkspaceNewPage() {
  return <WorkspaceNewClient />;
}
