import { Test, TestingModule } from '@nestjs/testing';
import { AuditService } from '../application/services/audit.service.js';
import { PIPELINE_EVENTS } from '../domain/pipeline-events.js';

jest.mock('@xennic/database', () => ({
  prisma: {
    audit_logs: {
      create: jest.fn().mockResolvedValue({}),
      findFirst: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
    },
  },
}));

describe('AuditService', () => {
  let service: AuditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditService],
    }).compile();
    service = module.get<AuditService>(AuditService);
  });

  it('records an audit entry', async () => {
    const entry = await service.record(
      'doc-1', 'ws-1', PIPELINE_EVENTS.DOCUMENT_PARSED, 'success', 'Document parsed successfully',
    );
    expect(entry.id).toBeDefined();
    expect(entry.eventType).toBe(PIPELINE_EVENTS.DOCUMENT_PARSED);
    expect(entry.status).toBe('success');
    expect(entry.hash).toBeDefined();
    expect(entry.hash.length).toBe(64);
  });

  it('produces valid SHA-256 hashes', () => {
    const entry = {
      id: 'test-id',
      documentId: 'doc-1',
      workspaceId: 'ws-1',
      eventType: PIPELINE_EVENTS.DOCUMENT_UPLOADED,
      status: 'success' as const,
      detail: 'test',
      previousHash: '',
      hash: '',
      timestamp: new Date('2026-01-01'),
      metadata: {},
    };
    const hash1 = (service as any).computeHash({ ...entry, previousHash: '' });
    const hash2 = (service as any).computeHash({ ...entry, previousHash: 'prevhash' });
    expect(hash1).not.toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it('verifies a chain of audit entries', async () => {
    const entries = [
      await service.record('doc-1', 'ws-1', PIPELINE_EVENTS.DOCUMENT_UPLOADED, 'success', 'Uploaded'),
      await service.record('doc-1', 'ws-1', PIPELINE_EVENTS.DOCUMENT_PARSED, 'success', 'Parsed'),
      await service.record('doc-1', 'ws-1', PIPELINE_EVENTS.DOCUMENT_CLASSIFIED, 'success', 'Classified'),
    ];
    const valid = service.verifyChain('doc-1', entries);
    expect(valid).toBe(true);
  });

  it('detects tampering in audit chain', async () => {
    const entry1 = await service.record('doc-1', 'ws-1', PIPELINE_EVENTS.DOCUMENT_UPLOADED, 'success', 'Uploaded');
    const entry2 = await service.record('doc-1', 'ws-1', PIPELINE_EVENTS.DOCUMENT_PARSED, 'success', 'Parsed');

    entry2.detail = 'Tampered detail';
    const valid = service.verifyChain('doc-1', [entry1, entry2]);
    expect(valid).toBe(false);
  });
});
