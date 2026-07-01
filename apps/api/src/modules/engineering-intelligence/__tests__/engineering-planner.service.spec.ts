import { Test, TestingModule } from '@nestjs/testing';
import { EngineeringPlanner } from '../application/services/engineering-planner.service.js';

describe('EngineeringPlanner', () => {
  let service: EngineeringPlanner;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EngineeringPlanner],
    }).compile();
    service = module.get<EngineeringPlanner>(EngineeringPlanner);
  });

  it('creates a DAG execution plan from a goal', async () => {
    const goal = { id: 'g1', description: 'Calculate load', type: 'calculation' as const, constraints: [], evidence: [] };
    const plan = await service.createPlan(goal);
    expect(plan.id).toBeTruthy();
    expect(plan.dag.length).toBeGreaterThanOrEqual(4);
    expect(plan.edges.length).toBeGreaterThanOrEqual(3);
  });

  it('plan contains retrieval node', async () => {
    const goal = { id: 'g1', description: 'Test', type: 'verification' as const, constraints: [], evidence: [] };
    const plan = await service.createPlan(goal);
    expect(plan.dag.some((n) => n.type === 'retrieval')).toBe(true);
  });

  it('plan contains decision node', async () => {
    const goal = { id: 'g1', description: 'Test', type: 'calculation' as const, constraints: [], evidence: [] };
    const plan = await service.createPlan(goal);
    expect(plan.dag.some((n) => n.type === 'decision')).toBe(true);
  });

  it('validates a valid plan', async () => {
    const goal = { id: 'g1', description: 'Test', type: 'calculation' as const, constraints: [], evidence: [] };
    const plan = await service.createPlan(goal);
    const valid = await service.validatePlan(plan);
    expect(valid).toBe(true);
  });

  it('invalidates a plan with dangling edges', async () => {
    const plan = { id: 'p1', goal: {} as any, dag: [{ id: 'n1', type: 'calculation' as any, label: 'test', input: {}, output: {}, evidence: [], config: {} }], edges: [{ from: 'n1', to: 'nonexistent', data: [] }], metadata: {} as any };
    const valid = await service.validatePlan(plan);
    expect(valid).toBe(false);
  });

  it('returns null for unknown plan', async () => {
    const plan = await service.getPlan('nonexistent');
    expect(plan).toBeNull();
  });

  it('supports all plan node types', () => {
    const types = service.getSupportedPlanTypes();
    expect(types).toContain('retrieval');
    expect(types).toContain('calculation');
    expect(types).toContain('decision');
    expect(types).toContain('report');
  });
});
