import { KnowledgeDocument } from './knowledge-document.entity.js';

describe('KnowledgeDocument', () => {
  const base = {
    workspaceId: 'workspace-1',
    filename: 'test.pdf',
    originalName: 'Test Document',
    mimeType: 'application/pdf',
    sizeBytes: 1024,
    documentType: 'pdf',
  };

  it('should create with UPLOADED status', () => {
    const doc = KnowledgeDocument.create(base);
    expect(doc.status).toBe('uploaded');
    expect(doc.publishedKnowledgeId).toBeNull();
    expect(doc.errorMessage).toBeNull();
    expect(doc.retryCount).toBe(0);
  });

  it('should transition through lifecycle', () => {
    const doc = KnowledgeDocument.create(base);

    doc.classify({ domain: 'electrical', confidence: 0.9 });
    expect(doc.status).toBe('classified');

    doc.startParsing();
    expect(doc.status).toBe('parsing');

    doc.markExtracted();
    expect(doc.status).toBe('extracted');

    doc.markChunking();
    expect(doc.status).toBe('chunking');

    doc.markEmbedding();
    expect(doc.status).toBe('embedding');

    doc.markPublishing();
    expect(doc.status).toBe('publishing');

    doc.publish('knowledge-123');
    expect(doc.status).toBe('published');
    expect(doc.publishedKnowledgeId).toBe('knowledge-123');
  });

  it('should fail and retry', () => {
    const doc = KnowledgeDocument.create(base);
    doc.fail('OCR failed');
    expect(doc.status).toBe('failed');
    expect(doc.errorMessage).toBe('OCR failed');

    doc.retry();
    expect(doc.status).toBe('uploaded');
    expect(doc.errorMessage).toBeNull();
    expect(doc.retryCount).toBe(1);
  });

  it('should not retry beyond max attempts', () => {
    const doc = KnowledgeDocument.create(base);
    doc._retryCount = 10;

    expect(() => doc.retry()).toThrow('Maximum retry count exceeded');
  });

  it('should reject invalid status transitions', () => {
    const doc = KnowledgeDocument.create(base);
    expect(() => doc.publish('knowledge-1')).toThrow();
  });

  it('should update metadata', () => {
    const doc = KnowledgeDocument.create(base);
    doc.updateMetadata({ pages: 5 });
    expect(doc.metadata).toEqual({ pages: 5 });
  });
});
