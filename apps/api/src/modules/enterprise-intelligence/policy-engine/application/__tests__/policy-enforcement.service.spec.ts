import { Test, TestingModule } from '@nestjs/testing';
import { PolicyEnforcementService } from '../policy-enforcement.service.js';
import { PolicyEvaluationService } from '../policy-evaluation.service.js';
import { PolicyEntity } from '../../domain/policy.entity.js';
import type { IPolicyRepository } from '../../domain/policy-repository.interface.js';
import { InMemoryPolicyRepository } from '../../../testing/adapters/in-memory-policy-repository.js';

describe('PolicyEnforcementService', () => {
  let service: PolicyEnforcementService;
  let repo: IPolicyRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PolicyEnforcementService,
        PolicyEvaluationService,
        { provide: 'IPolicyRepository', useClass: InMemoryPolicyRepository },
      ],
    }).compile();

    service = module.get(PolicyEnforcementService);
    repo = module.get('IPolicyRepository');
  });

  afterEach(async () => {
    const all = await repo.list();
    for (const item of all.items) {
      await repo.delete(item.id);
    }
  });

  describe('evaluate()', () => {
    it('should allow when no policies match', async () => {
      const result = await service.evaluate('execute', 'document:report');
      expect(result.allowed).toBe(true);
      expect(result.matchedPolicies).toHaveLength(0);
      expect(result.reason).toContain('default');
    });

    it('should allow when allow policy matches', async () => {
      await repo.save(
        PolicyEntity.create({
          name: 'allow-all',
          description: '',
          scope: 'global',
          resource: '*',
          action: '*',
          effect: 'allow',
          priority: 1,
          createdBy: 'u1',
        }),
      );

      const result = await service.evaluate('read', 'document:anything');
      expect(result.allowed).toBe(true);
      expect(result.matchedPolicies).toHaveLength(1);
    });

    it('should deny when deny policy matches', async () => {
      await repo.save(
        PolicyEntity.create({
          name: 'deny-sensitive',
          description: '',
          scope: 'global',
          resource: 'document:sensitive',
          action: 'read',
          effect: 'deny',
          priority: 100,
          createdBy: 'u1',
        }),
      );

      const result = await service.evaluate('read', 'document:sensitive');
      expect(result.allowed).toBe(false);
      expect(result.matchedPolicies).toHaveLength(1);
    });

    it('should deny take precedence over allow at same priority', async () => {
      await repo.save(
        PolicyEntity.create({
          name: 'allow-all', description: '', scope: 'global', resource: '*', action: '*', effect: 'allow', priority: 50, createdBy: 'u1',
        }),
      );
      await repo.save(
        PolicyEntity.create({
          name: 'deny-secret', description: '', scope: 'global', resource: 'document:secret', action: 'read', effect: 'deny', priority: 50, createdBy: 'u1',
        }),
      );

      const result = await service.evaluate('read', 'document:secret');
      expect(result.allowed).toBe(false);
    });

    it('should respect priority ordering (higher wins)', async () => {
      await repo.save(
        PolicyEntity.create({
          name: 'low-deny', description: '', scope: 'global', resource: '*', action: '*', effect: 'deny', priority: 1, createdBy: 'u1',
        }),
      );
      await repo.save(
        PolicyEntity.create({
          name: 'high-allow', description: '', scope: 'global', resource: '*', action: '*', effect: 'allow', priority: 100, createdBy: 'u1',
        }),
      );

      const result = await service.evaluate('anything', 'anything');
      expect(result.allowed).toBe(true);
    });

    it('should evaluate conditional policies', async () => {
      await repo.save(
        PolicyEntity.create({
          name: 'role-deny',
          description: '',
          scope: 'global',
          resource: '*',
          action: 'delete',
          effect: 'deny',
          priority: 50,
          createdBy: 'u1',
          conditions: { roles: ['viewer'] },
        }),
      );

      const denied = await service.evaluate('delete', 'any-resource', { roles: ['viewer'] });
      expect(denied.allowed).toBe(false);

      const allowed = await service.evaluate('delete', 'any-resource', { roles: ['admin'] });
      expect(allowed.allowed).toBe(true);
    });

    it('should not match disabled policies by default', async () => {
      const policy = PolicyEntity.create({
        name: 'disabled-deny', description: '', scope: 'global', resource: '*', action: '*', effect: 'deny', priority: 100, createdBy: 'u1',
      });
      const disabled = PolicyEntity.reconstitute({
        id: policy.id,
        name: policy.name,
        description: policy.description,
        scope: policy.scope,
        scopeId: policy.scopeId,
        resource: policy.resource,
        action: policy.action,
        effect: policy.effect,
        priority: policy.priority,
        conditions: policy.conditions,
        metadata: { ...policy.metadata },
        enabled: false,
        createdAt: policy.createdAt,
        updatedAt: policy.updatedAt,
      });
      await repo.save(disabled);

      const result = await service.evaluate('anything', 'anything');
      expect(result.allowed).toBe(true);
    });
  });

  describe('canAccess()', () => {
    it('should return true when access is allowed', async () => {
      const result = await service.canAccess('user-1', 'read', 'public-doc');
      expect(result).toBe(true);
    });

    it('should return false when access is denied', async () => {
      await repo.save(
        PolicyEntity.create({
          name: 'deny-all', description: '', scope: 'global', resource: '*', action: '*', effect: 'deny', priority: 100, createdBy: 'admin',
        }),
      );

      const result = await service.canAccess('user-1', 'read', 'anything');
      expect(result).toBe(false);
    });
  });

  describe('getUserPolicies()', () => {
    it('should return all policies applicable to user', async () => {
      await repo.save(
        PolicyEntity.create({
          name: 'user-specific', description: '', scope: 'user', resource: '*', action: '*', effect: 'allow', priority: 1, createdBy: 'u1', conditions: { userId: 'user-1' },
        }),
      );
      await repo.save(
        PolicyEntity.create({
          name: 'global-allow', description: '', scope: 'global', resource: '*', action: '*', effect: 'allow', priority: 1, createdBy: 'u1',
        }),
      );

      const policies = await service.getUserPolicies('user-1');
      expect(policies.length).toBeGreaterThanOrEqual(1);
    });
  });
});
