export function extractKnowledgeText(content: Record<string, unknown>): string {
  const parts: string[] = [];

  if (content.title && typeof content.title === 'string') {
    parts.push(content.title);
  }

  const doc = (content as any).doc;
  if (doc && typeof doc === 'object') {
    extractTextFromNode(doc, parts);
  }

  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

function extractTextFromNode(node: any, parts: string[]): void {
  if (!node || typeof node !== 'object') return;

  if (node.text && typeof node.text === 'string') {
    parts.push(node.text);
  }

  if (node.content && Array.isArray(node.content)) {
    for (const child of node.content) {
      extractTextFromNode(child, parts);
    }
  }

  if (node.attrs?.latex && typeof node.attrs.latex === 'string') {
    parts.push(node.attrs.latex);
  }
}
