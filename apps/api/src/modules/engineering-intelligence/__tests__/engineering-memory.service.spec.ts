import { Test, TestingModule } from '@nestjs/testing';
import { EngineeringMemory } from '../application/services/engineering-memory.service.js';

describe('EngineeringMemory', () => {
  let service: EngineeringMemory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EngineeringMemory],
    }).compile();
    service = module.get<EngineeringMemory>(EngineeringMemory);
  });

  it('creates a session', async () => {
    const mem = await service.createSession('session-1', 'wf-1', { project: 'Test' });
    expect(mem.sessionId).toBe('session-1');
    expect(mem.workflowId).toBe('wf-1');
    expect(mem.context.project).toBe('Test');
  });

  it('returns null for unknown session', async () => {
    const mem = await service.getSession('nonexistent');
    expect(mem).toBeNull();
  });

  it('updates step state', async () => {
    await service.createSession('session-1', 'wf-1');
    await service.updateStep('session-1', 'node-1', { nodeId: 'node-1', status: 'completed', retryCount: 0, output: { result: 42 } });
    const mem = await service.getSession('session-1');
    expect(mem!.completedSteps['node-1'].status).toBe('completed');
    expect(mem!.completedSteps['node-1'].output.result).toBe(42);
  });

  it('caches and retrieves calculations', async () => {
    await service.createSession('session-1', 'wf-1');
    const calc = { id: 'calc-1', toolId: 't1', input: {}, output: { result: 100 }, cached: false, duration: 10, provenance: {} as any, checksum: 'abc' };
    await service.cacheCalculation('session-1', 'calc-1', calc);
    const cached = await service.getCachedCalculation('session-1', 'calc-1');
    expect(cached!.output.result).toBe(100);
  });

  it('returns null for unknown cached calculation', async () => {
    await service.createSession('session-1', 'wf-1');
    const cached = await service.getCachedCalculation('session-1', 'unknown');
    expect(cached).toBeNull();
  });

  it('clears session', async () => {
    await service.createSession('session-1', 'wf-1');
    await service.clearSession('session-1');
    const mem = await service.getSession('session-1');
    expect(mem).toBeNull();
  });
});
