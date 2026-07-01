import { Test, TestingModule } from '@nestjs/testing';
import { ReasoningKernel } from '../application/services/reasoning-kernel.service.js';

describe('ReasoningKernel', () => {
  let service: ReasoningKernel;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReasoningKernel],
    }).compile();
    service = module.get<ReasoningKernel>(ReasoningKernel);
  });

  it('decomposes a goal into 5 reasoning steps', async () => {
    const goal = { id: 'g1', description: 'Calculate transformer rating', type: 'calculation' as const, constraints: [], evidence: [] };
    const steps = await service.decompose(goal);
    expect(steps).toHaveLength(5);
    expect(steps[0].type).toBe('retrieve');
    expect(steps[1].type).toBe('calculate');
    expect(steps[2].type).toBe('decide');
    expect(steps[3].type).toBe('verify');
    expect(steps[4].type).toBe('conclude');
  });

  it('assigns unique step IDs', async () => {
    const goal = { id: 'g1', description: 'Test', type: 'calculation' as const, constraints: [], evidence: [] };
    const steps = await service.decompose(goal);
    const ids = new Set(steps.map((s) => s.id));
    expect(ids.size).toBe(5);
  });

  it('creates parent-child trace chain', async () => {
    const goal = { id: 'g1', description: 'Test', type: 'calculation' as const, constraints: [], evidence: [] };
    const steps = await service.decompose(goal);
    expect(steps[0].trace.parentId).toBeNull();
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i].trace.parentId).toBe(steps[i - 1].id);
    }
  });

  it('executes a step and produces output', async () => {
    const goal = { id: 'g1', description: 'Test calculation', type: 'calculation' as const, constraints: [], evidence: [] };
    const steps = await service.decompose(goal);
    const executed = await service.execute(steps[0], { goal, constraints: goal.constraints });
    expect(executed.trace.status).toBe('completed');
    expect(executed.output).toBeDefined();
    expect(executed.confidence).toBeGreaterThan(0);
  });

  it('marks step as failed on error', async () => {
    const step: any = { id: 'bad', type: 'calculate', trace: { stepId: 'bad', parentId: null, timestamp: 0, duration: 0, status: 'pending' } };
    const executed = await service.execute(step, {});
    expect(executed.trace.status).toBe('failed');
  });
});
