import { Test, TestingModule } from '@nestjs/testing';
import { PromptPolicyService } from '../prompt-policy.service.js';
import { InMemoryPromptPolicyRepo } from '../../testing/adapters/in-memory-prompt-policy-repo.js';

describe('PromptPolicyService', () => {
  let service: PromptPolicyService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromptPolicyService,
        { provide: 'IPromptPolicyRepository', useClass: InMemoryPromptPolicyRepo },
      ],
    }).compile();

    service = module.get(PromptPolicyService);
  });

  describe('create()', () => {
    it('should create a policy', async () => {
      const policy = await service.create({
        name: 'allow-admin',
        description: 'Allow admin access',
        rules: [{ resource: 'prompt:*', action: 'execute', condition: null }],
        effect: 'allow',
        priority: 100,
        createdBy: 'user-1',
      });

      expect(policy).toBeDefined();
      expect(policy.name).toBe('allow-admin');
      expect(policy.effect).toBe('allow');
      expect(policy.priority).toBe(100);
    });
  });

  describe('get()', () => {
    it('should retrieve a policy by id', async () => {
      const created = await service.create({
        name: 'get-test',
        description: '',
        rules: [],
        effect: 'allow',
        priority: 1,
        createdBy: 'u1',
      });

      const found = await service.get(created.id);
      expect(found.id).toBe(created.id);
    });

    it('should throw for non-existent id', async () => {
      await expect(service.get('bad-id')).rejects.toThrow('not found');
    });
  });

  describe('evaluate()', () => {
    it('should allow when no policies match', async () => {
      const result = await service.evaluate('prompt-1', 'execute');
      expect(result.allowed).toBe(true);
      expect(result.matchedRules).toHaveLength(0);
    });

    it('should allow when allow policy matches', async () => {
      await service.create({
        name: 'allow-all',
        description: '',
        rules: [{ resource: '*', action: '*', condition: null }],
        effect: 'allow',
        priority: 1,
        createdBy: 'u1',
      });

      const result = await service.evaluate('any-prompt', 'any-action');
      expect(result.allowed).toBe(true);
      expect(result.matchedRules).toHaveLength(1);
    });

    it('should deny when deny policy matches', async () => {
      await service.create({
        name: 'deny-specific',
        description: '',
        rules: [{ resource: 'prompt:sensitive', action: 'execute', condition: null }],
        effect: 'deny',
        priority: 100,
        createdBy: 'u1',
      });

      const result = await service.evaluate('prompt:sensitive', 'execute');
      expect(result.allowed).toBe(false);
      expect(result.matchedRules).toHaveLength(1);
    });

    it('should deny take precedence over allow at same priority', async () => {
      await service.create({
        name: 'allow',
        description: '',
        rules: [{ resource: '*', action: '*', condition: null }],
        effect: 'allow',
        priority: 50,
        createdBy: 'u1',
      });

      await service.create({
        name: 'deny',
        description: '',
        rules: [{ resource: 'prompt:secret', action: 'execute', condition: null }],
        effect: 'deny',
        priority: 50,
        createdBy: 'u1',
      });

      const result = await service.evaluate('prompt:secret', 'execute');
      expect(result.allowed).toBe(false);
    });

    it('should respect priority ordering (higher wins)', async () => {
      await service.create({
        name: 'low-priority-deny',
        description: '',
        rules: [{ resource: '*', action: '*', condition: null }],
        effect: 'deny',
        priority: 1,
        createdBy: 'u1',
      });

      await service.create({
        name: 'high-priority-allow',
        description: '',
        rules: [{ resource: '*', action: '*', condition: null }],
        effect: 'allow',
        priority: 100,
        createdBy: 'u1',
      });

      const result = await service.evaluate('anything', 'anything');
      expect(result.allowed).toBe(true);
    });

    it('should evaluate condition match', async () => {
      await service.create({
        name: 'role-based-deny',
        description: '',
        rules: [
          {
            resource: '*',
            action: 'delete',
            condition: { role: 'viewer' },
          },
        ],
        effect: 'deny',
        priority: 50,
        createdBy: 'u1',
      });

      const denied = await service.evaluate('any-prompt', 'delete', { role: 'viewer' });
      expect(denied.allowed).toBe(false);

      const allowed = await service.evaluate('any-prompt', 'delete', { role: 'admin' });
      expect(allowed.allowed).toBe(true);
    });
  });

  describe('list()', () => {
    it('should list all policies', async () => {
      await service.create({
        name: 'a',
        description: '',
        rules: [],
        effect: 'allow',
        priority: 1,
        createdBy: 'u1',
      });
      await service.create({
        name: 'b',
        description: '',
        rules: [],
        effect: 'deny',
        priority: 2,
        createdBy: 'u1',
      });

      const result = await service.list();
      expect(result.total).toBe(2);
    });
  });

  describe('delete()', () => {
    it('should delete a policy', async () => {
      const policy = await service.create({
        name: 'to-delete',
        description: '',
        rules: [],
        effect: 'allow',
        priority: 1,
        createdBy: 'u1',
      });

      await service.delete(policy.id);
      await expect(service.get(policy.id)).rejects.toThrow('not found');
    });
  });
});
