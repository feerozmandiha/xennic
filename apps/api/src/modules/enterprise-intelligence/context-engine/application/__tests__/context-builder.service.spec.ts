import { Test, TestingModule } from '@nestjs/testing';
import { ContextBuilderService } from '../context-builder.service.js';
import type { IContextRepository } from '../../domain/context-repository.interface.js';
import { InMemoryContextStore } from '../../testing/adapters/in-memory-context-store.js';

describe('ContextBuilderService', () => {
  let service: ContextBuilderService;
  let repository: IContextRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContextBuilderService,
        { provide: 'IContextRepository', useClass: InMemoryContextStore },
      ],
    }).compile();

    service = module.get(ContextBuilderService);
    repository = module.get('IContextRepository');
  });

  describe('source builders', () => {
    it('should build from workspace', async () => {
      const result = await service.fromWorkspace('ws-1');
      expect(result).toEqual({ workspaceId: 'ws-1', type: 'workspace' });
    });

    it('should build from user', async () => {
      const result = await service.fromUser('user-1');
      expect(result).toEqual({ userId: 'user-1', type: 'user' });
    });

    it('should build from project', async () => {
      const result = await service.fromProject('proj-1');
      expect(result).toEqual({ projectId: 'proj-1', type: 'project' });
    });

    it('should build from role', async () => {
      const result = await service.fromRole('role-1');
      expect(result).toEqual({ roleId: 'role-1', type: 'role' });
    });

    it('should build from knowledge', async () => {
      const result = await service.fromKnowledge('know-1');
      expect(result).toEqual({ knowledgeId: 'know-1', type: 'knowledge' });
    });

    it('should build from standards', async () => {
      const result = await service.fromStandards('std-1');
      expect(result).toEqual({ standardsId: 'std-1', type: 'standards' });
    });

    it('should build from engineering', async () => {
      const result = await service.fromEngineering('eng-1');
      expect(result).toEqual({ engineeringId: 'eng-1', type: 'engineering' });
    });

    it('should build from marketplace', async () => {
      const result = await service.fromMarketplace('mkt-1');
      expect(result).toEqual({ marketplaceId: 'mkt-1', type: 'marketplace' });
    });

    it('should build from billing', async () => {
      const result = await service.fromBilling('bill-1');
      expect(result).toEqual({ billingId: 'bill-1', type: 'billing' });
    });

    it('should build from storage', async () => {
      const result = await service.fromStorage('stor-1');
      expect(result).toEqual({ storageId: 'stor-1', type: 'storage' });
    });

    it('should build from notification', async () => {
      const result = await service.fromNotification('notif-1');
      expect(result).toEqual({ notificationId: 'notif-1', type: 'notification' });
    });
  });

  describe('combine sources', () => {
    it('should build and persist a context entity', async () => {
      const entity = await service.build(
        'workspace',
        'ws-1',
        'user',
        'current-user',
        { userId: 'user-1', role: 'admin' },
        'test-user',
      );

      expect(entity.scope).toBe('workspace');
      expect(entity.scopeId).toBe('ws-1');
      expect(entity.source).toBe('user');
      expect(entity.key).toBe('current-user');
      expect(entity.version).toBe(1);
      expect(entity.createdBy).toBe('test-user');
      expect(entity.value).toEqual({ userId: 'user-1', role: 'admin' });

      const saved = await repository.findById(entity.id);
      expect(saved).toBeDefined();
      expect(saved!.id).toBe(entity.id);
    });
  });

  describe('empty sources', () => {
    it('should handle empty value', async () => {
      const entity = await service.build('workspace', 'ws-1', 'test', 'empty', {}, 'tester');
      expect(entity.value).toEqual({});
    });
  });
});
