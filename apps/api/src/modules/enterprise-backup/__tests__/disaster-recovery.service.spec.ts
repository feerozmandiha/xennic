import { DisasterRecoveryService } from '../application/services/disaster-recovery.service.js';
import type { DisasterRecoveryPlan } from '../domain/types/backup.types.js';

describe('DisasterRecoveryService', () => {
  let service: DisasterRecoveryService;

  beforeEach(() => {
    service = new DisasterRecoveryService();
  });

  const makePlan = (): DisasterRecoveryPlan => ({
    id: 'plan-1',
    name: 'Full DR Plan',
    description: 'Complete disaster recovery',
    steps: [
      { order: 1, name: 'Restore DB', action: 'restore_database', timeout: 300, required: true, dependsOn: [] },
      { order: 2, name: 'Verify', action: 'verify_integrity', timeout: 60, required: true, dependsOn: [1] },
    ],
    estimatedRto: 300,
    estimatedRpo: 900,
    lastTested: undefined,
    enabled: true,
  });

  it('returns empty plans initially', async () => {
    const plans = await service.getPlans();
    expect(plans).toEqual([]);
  });

  it('executes a DR plan', async () => {
    (service as any).plans.set('plan-1', makePlan());
    const executionId = await service.execute('plan-1');
    expect(executionId).toBeDefined();
  });

  it('throws on execute for unknown plan', async () => {
    await expect(service.execute('unknown')).rejects.toThrow('DR plan not found');
  });

  it('tests a DR plan', async () => {
    (service as any).plans.set('plan-1', makePlan());
    const result = await service.test('plan-1');
    expect(result.passed).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it('returns execution status', async () => {
    (service as any).plans.set('plan-1', makePlan());
    const executionId = await service.execute('plan-1');
    // Should be running or completed
    const status = await service.getStatus(executionId);
    expect(status.status).toBeDefined();
  });

  it('returns unknown status for unknown execution', async () => {
    const status = await service.getStatus('unknown');
    expect(status.status).toBe('unknown');
  });
});
