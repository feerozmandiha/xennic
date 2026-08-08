import type { Metadata } from 'next';
import { KnowledgeGraphView } from '@/features/knowledge/components/encyclopedia/graph/knowledge-graph-view';

export const metadata: Metadata = {
  title: 'گراف دانش | دانشنامه فنی Xennic',
  description: 'نمایش گراف دانش - ارتباط مقالات، استانداردها، تجهیزات و مفاهیم',
};

export default function KnowledgeGraphPage() {
  return (
    <div className="max-w-7xl mx-auto px-5 py-8">
      <KnowledgeGraphView />
    </div>
  );
}
