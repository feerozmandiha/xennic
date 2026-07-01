import { Test, TestingModule } from '@nestjs/testing';
import { AuditEngine } from '../application/services/audit-engine.service.js';

describe('AuditEngine', () => {
  let service: AuditEngine;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditEngine],
    }).compile();
    service = module.get<AuditEngine>(AuditEngine);
  });

  it('creates an audit record', async () => {
    const record = await service.create('exec-1', 'trace-1');
    expect(record.executionId).toBe('exec-1');
    expect(record.validationStatus).toBe('pending');
    expect(record.timestamp).toBeGreaterThan(0);
  });

  it('logs reasoning steps', async () => {
    await service.create('exec-1', 'trace-1');
    const step = { id: 'step-1', type: 'calculate' as const, input: {}, output: {}, evidence: [], assumptions: [], confidence: 0.8, trace: { stepId: 'step-1', parentId: null, timestamp: 0, duration: 100, status: 'completed' as const } };
    await service.logStep('exec-1', step);
    const record = await service.getRecord('exec-1');
    expect(record!.reasoningLog).toHaveLength(1);
  });

  it('logs calculations', async () => {
    await service.create('exec-1', 'trace-1');
    const calc = { id: 'calc-1', toolId: 't1', input: {}, output: {}, cached: false, duration: 50, provenance: {} as any, checksum: 'abc' };
    await service.logCalculation('exec-1', calc);
    const record = await service.getRecord('exec-1');
    expect(record!.calculationLog).toHaveLength(1);
  });

  it('logs decisions', async () => {
    await service.create('exec-1', 'trace-1');
    const decision = { id: 'dec-1', title: 'Test', description: '', inputs: {}, evidence: [], appliedStandards: [], reasoningSteps: [], calculations: [], confidence: 0.9, alternatives: [], rejectedAlternatives: [], finalDecision: 'A', timestamp: Date.now() };
    await service.logDecision('exec-1', decision);
    const record = await service.getRecord('exec-1');
    expect(record!.decisionHistory).toHaveLength(1);
  });

  it('finalizes audit record', async () => {
    await service.create('exec-1', 'trace-1');
    const wf = { id: 'wf-1', status: 'completed' as const, nodes: [], checkpoint: null, version: 1, startTime: 100, planId: 'plan-1', endTime: 200 };
    const finalized = await service.finalize('exec-1', wf as any, 'passed');
    expect(finalized.validationStatus).toBe('passed');
    expect(finalized.workflowGraph.id).toBe('wf-1');
  });

  it('throws for unknown execution', async () => {
    await expect(service.logStep('nonexistent', {} as any)).rejects.toThrow();
  });

  it('verifies immutability of valid record', () => {
    const valid = service.verifyImmutability({ timestamp: 100, executionId: 'e1' } as any);
    expect(valid).toBe(true);
    const invalid = service.verifyImmutability({ timestamp: 0, executionId: '' } as any);
    expect(invalid).toBe(false);
  });

  it('returns null for unknown record', async () => {
    const record = await service.getRecord('nonexistent');
    expect(record).toBeNull();
  });
});
