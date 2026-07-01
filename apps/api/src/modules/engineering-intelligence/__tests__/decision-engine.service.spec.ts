import { Test, TestingModule } from '@nestjs/testing';
import { DecisionEngine } from '../application/services/decision-engine.service.js';

describe('DecisionEngine', () => {
  let service: DecisionEngine;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DecisionEngine],
    }).compile();
    service = module.get<DecisionEngine>(DecisionEngine);
  });

  it('creates a decision with alternatives', async () => {
    const decision = await service.make({
      title: 'Select Transformer', description: 'Choose appropriate transformer', inputs: { load: '100 MVA' },
      evidence: ['XID-001'], appliedStandards: ['IEC 60076'], reasoningSteps: [], calculations: [],
      alternatives: [
        { id: 'alt-1', description: 'Oil-filled transformer', pros: ['Proven'], cons: ['Heavy'], score: 0.85 },
        { id: 'alt-2', description: 'Dry-type transformer', pros: ['Light'], cons: ['Expensive'], score: 0.65 },
      ],
    });
    expect(decision.id).toBeTruthy();
    expect(decision.confidence).toBe(0.85);
    expect(decision.finalDecision).toContain('Oil-filled');
    expect(decision.alternatives).toHaveLength(2);
  });

  it('rejects alternatives below threshold', async () => {
    const decision = await service.make({
      title: 'Test', description: '', inputs: {}, evidence: [], appliedStandards: [],
      reasoningSteps: [], calculations: [],
      alternatives: [
        { id: 'good', description: 'Good option', pros: [], cons: [], score: 0.8 },
        { id: 'bad', description: 'Bad option', pros: [], cons: [], score: 0.2 },
      ],
    });
    expect(decision.alternatives).toHaveLength(1);
    expect(decision.rejectedAlternatives).toHaveLength(1);
  });

  it('returns null for unknown decision', async () => {
    const decision = await service.getDecision('nonexistent');
    expect(decision).toBeNull();
  });

  it('sorts alternatives by score descending', async () => {
    const { scored } = await service.evaluateAlternatives([
      { id: 'a', description: 'A', pros: [], cons: [], score: 0.5 },
      { id: 'b', description: 'B', pros: [], cons: [], score: 0.9 },
      { id: 'c', description: 'C', pros: [], cons: [], score: 0.7 },
    ]);
    expect(scored[0].id).toBe('b');
    expect(scored[1].id).toBe('c');
    expect(scored[2].id).toBe('a');
  });
});
