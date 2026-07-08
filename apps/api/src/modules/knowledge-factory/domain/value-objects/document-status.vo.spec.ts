import { DOCUMENT_STATUSES, VALID_STATUS_TRANSITIONS, DocumentStatusTransitionError } from './document-status.vo.js';

describe('DocumentStatus', () => {
  it('should have all expected statuses', () => {
    expect(Object.keys(DOCUMENT_STATUSES)).toEqual([
      'UPLOADED',
      'CLASSIFIED',
      'PARSING',
      'EXTRACTED',
      'CHUNKING',
      'EMBEDDING',
      'PUBLISHING',
      'PUBLISHED',
      'FAILED',
    ]);
  });

  it('should allow valid transitions', () => {
    expect(VALID_STATUS_TRANSITIONS.uploaded).toEqual(['classified']);
    expect(VALID_STATUS_TRANSITIONS.classified).toEqual(['parsing', 'failed']);
    expect(VALID_STATUS_TRANSITIONS.parsing).toEqual(['extracted', 'failed']);
    expect(VALID_STATUS_TRANSITIONS.extracted).toEqual(['chunking', 'failed']);
    expect(VALID_STATUS_TRANSITIONS.chunking).toEqual(['embedding', 'failed']);
    expect(VALID_STATUS_TRANSITIONS.embedding).toEqual(['publishing', 'failed']);
    expect(VALID_STATUS_TRANSITIONS.publishing).toEqual(['published', 'failed']);
    expect(VALID_STATUS_TRANSITIONS.published).toEqual(['uploaded']);
    expect(VALID_STATUS_TRANSITIONS.failed).toEqual(['uploaded']);
  });

  it('should create DocumentStatusTransitionError with message', () => {
    const error = new DocumentStatusTransitionError('uploaded', 'published');
    expect(error.message).toBe('Invalid status transition from "uploaded" to "published".');
    expect(error.name).toBe('DocumentStatusTransitionError');
  });
});
