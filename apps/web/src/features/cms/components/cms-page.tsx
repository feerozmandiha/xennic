'use client';

import { CmsDocumentRenderer } from '../blocks/cms-renderer';
import type { CmsDocument } from '../lib/types';

export function CmsPageView({ document }: { document?: CmsDocument | null }) {
  if (!document) return null;
  return <CmsDocumentRenderer document={document} />;
}
