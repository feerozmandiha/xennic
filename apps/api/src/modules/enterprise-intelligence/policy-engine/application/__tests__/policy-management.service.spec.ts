import { Test, TestingModule } from '@nestjs/testing';
import { PolicyManagementService } from '../policy-management.service.js';
import type { IPolicyRepository } from '../../domain/policy-repository.interface.js';
import { InMemoryPolicyRepository } from '../../testing/adapters/in-memory-policy-repository.js';

describe('PolicyManagementService', () => {
  let service: PolicyManagementService;
  let repo: IPolicyRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PolicyManagementService,
        { provide: 'IPolicyRepository', useClass: InMemoryPolicyRepository },
      ],
    }).compile();

    service = module.get(PolicyManagementService);
    repo = module.get('IPolicyRepository');
  });

  afterEach(async () => {
    const all = await repo.list();
    for (const item of all.items) {
      await repo.delete(item.id);
    }
  });

  describe('create()', () => {
    it('should create a new policy', async () => {
      const policy = await service.create({
        name: 'admin-full-access',
        description: 'Full access for admin role',
        scope: 'global',
        resource: '*',
        action: '*',
        effect: 'allow',
        priority: 100,
        createdBy: 'user-1',
      });

      expect(policy).toBeDefined();
      expect(policy.id).toBeDefined();
      expect(policy.name).toBe('admin-full-access');
      expect(policy.effect).toBe('allow');
      expect(policy.priority).toBe(100);
      expect(policy.enabled).toBe(true);
      expect(policy.scopeId).toBe('*');
    });

    it('should create a policy with specific scope', async () => {
      const policy = await service.create({
        name: 'workspace-policy',
        description: '',
        scope: 'workspace',
        scopeId: 'ws-1',
        resource: 'document:*',
        action: 'read',
        effect: 'allow',
        priority: 50,
        createdBy: 'u1',
      });

      expect(policy.scope).toBe('workspace');
      expect(policy.scopeId).toBe('ws-1');
    });
  });

  describe('get()', () => {
    it('should retrieve a policy by id', async () => {
      const created = await service.create({
        name: 'get-test',
        description: '',
        scope: 'global',
        resource: '*',
        action: '*',
        effect: 'allow',
        priority: 1,
        createdBy: 'u1',
      });

      const found = await service.get(created.id);
      expect(found.id).toBe(created.id);
      expect(found.name).toBe('get-test');
    });

    it('should throw for non-existent id', async () => {
      await expect(service.get('non-existent')).rejects.toThrow('not found');
    });
  });

  describe('update()', () => {
    it('should update policy fields', async () => {
      const created = await service.create({
        name: 'original-name',
        description: '',
        scope: 'global',
        resource: '*',
        action: '*',
        effect: 'allow',
        priority: 1,
        createdBy: 'u1',
      });

      const updated = await service.update(created.id, {
        name: 'updated-name',
        priority: 99,
        updatedBy: 'u2',
      });

      expect(updated.name).toBe('updated-name');
      expect(updated.priority).toBe(99);
      expect(updated.metadata.updatedBy).toBe('u2');
    });
  });

  describe('enable() / disable()', () => {
    it('should disable a policy', async () => {
      const policy = await service.create({
        name: 'to-disable',
        description: '',
        scope: 'global',
        resource: '*',
        action: '*',
        effect: 'deny',
        priority: 1,
        createdBy: 'u1',
      });

      const disabled = await service.disable(policy.id, 'admin');
      expect(disabled.enabled).toBe(false);
    });

    it('should enable a disabled policy', async () => {
      const policy = await service.create({
        name: 'to-enable',
        description: '',
        scope: 'global',
        resource: '*',
        action: '*',
        effect: 'allow',
        priority: 1,
        createdBy: 'u1',
      });
      await service.disable(policy.id, 'admin');

      const enabled = await service.enable(policy.id, 'admin');
      expect(enabled.enabled).toBe(true);
    });
  });

  describe('delete()', () => {
    it('should delete a policy', async () => {
      const policy = await service.create({
        name: 'to-delete',
        description: '',
        scope: 'global',
        resource: '*',
        action: '*',
        effect: 'allow',
        priority: 1,
        createdBy: 'u1',
      });

      await service.delete(policy.id);
      await expect(service.get(policy.id)).rejects.toThrow('not found');
    });
  });

  describe('list()', () => {
    it('should list all policies', async () => {
      await service.create({
        name: 'a',
        description: '',
        scope: 'global',
        resource: '*',
        action: '*',
        effect: 'allow',
        priority: 1,
        createdBy: 'u1',
      });
      await service.create({
        name: 'b',
        description: '',
        scope: 'global',
        resource: '*',
        action: '*',
        effect: 'deny',
        priority: 2,
        createdBy: 'u1',
      });

      const result = await service.list();
      expect(result.total).toBe(2);
      expect(result.items).toHaveLength(2);
    });

    it('should respect offset and limit', async () => {
      for (let i = 0; i < 5; i++) {
        await service.create({
          name: `p-${i}`,
          description: '',
          scope: 'global',
          resource: '*',
          action: '*',
          effect: 'allow',
          priority: i,
          createdBy: 'u1',
        });
      }

      const page = await service.list({ offset: 1, limit: 2 });
      expect(page.items).toHaveLength(2);
      expect(page.total).toBe(5);
      expect(page.offset).toBe(1);
      expect(page.limit).toBe(2);
    });
  });

  describe('findByResource()', () => {
    it('should find policies by resource pattern', async () => {
      await service.create({
        name: 'doc-read',
        description: '',
        scope: 'global',
        resource: 'document:*',
        action: 'read',
        effect: 'allow',
        priority: 1,
        createdBy: 'u1',
      });
      await service.create({
        name: 'doc-write',
        description: '',
        scope: 'global',
        resource: 'document:*',
        action: 'write',
        effect: 'deny',
        priority: 1,
        createdBy: 'u1',
      });
      await service.create({
        name: 'user-read',
        description: '',
        scope: 'global',
        resource: 'user:*',
        action: 'read',
        effect: 'allow',
        priority: 1,
        createdBy: 'u1',
      });

      const results = await service.findByResource('document:*');
      expect(results).toHaveLength(2);
    });
  });

  describe('getEffectivePolicies()', () => {
    it('should return global and matching scope policies', async () => {
      await service.create({
        name: 'global-policy',
        description: '',
        scope: 'global',
        resource: '*',
        action: '*',
        effect: 'allow',
        priority: 1,
        createdBy: 'u1',
      });
      await service.create({
        name: 'workspace-policy',
        description: '',
        scope: 'workspace',
        scopeId: 'ws-1',
        resource: '*',
        action: '*',
        effect: 'deny',
        priority: 50,
        createdBy: 'u1',
      });

      const effective = await service.getEffectivePolicies('workspace', 'ws-1');
      expect(effective).toHaveLength(2);

      const onlyGlobal = await service.getEffectivePolicies('workspace', 'ws-2');
      expect(onlyGlobal).toHaveLength(1);
    });
  });
});
