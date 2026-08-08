'use client';

import { ArticleReading } from './encyclopedia/detail/article-reading';

interface Props {
  slug: string;
}

export function PublicKnowledgeDetailClient({ slug }: Props) {
  return <ArticleReading slug={slug} />;
}
