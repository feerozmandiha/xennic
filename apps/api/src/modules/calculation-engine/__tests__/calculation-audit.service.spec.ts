import { CalculationAudit } from '../application/services/calculation-audit.service.js';
import type { AuditRecord } from '../domain/types/calculation.types.js';

describe('CalculationAudit', () => {
  let service: CalculationAudit;
  const mockRecord: AuditRecord = {
    executionId: 'exec-1', formulaId: 'vd-1', formulaVersion: '1.0',
    inputs: { current: { value: 100, unit: 'A' } },
    intermediates: [{ name: 'totalResistance', value: 0.019, unit: 'Ω', description: 'R total' }],
    outputs: { voltageDrop: { value: 3.5, unit: 'V' } },
    standards: [{ code: 'IEC 60364', title: '', clause: '§525', version: '2022' }],
    unitConversions: [{ from: 'm', to: 'km', factor: 0.001 }],
    executionTrace: [{ step: 1, operation: 'calculate', input: {}, output: {}, duration: 5 }],
    timestamp: Date.now(), duration: 0, checksum: '',
  };

  beforeEach(() => {
    service = new CalculationAudit();
  });

  it('creates pending audit record', async () => {
    await service.create('exec-1');
    const finalized = await service.finalize('exec-1', mockRecord);
    expect(finalized.checksum).toBeTruthy();
    expect(finalized.checksum.length).toBe(16);
  });

  it('retrieves finalized record', async () => {
    await service.create('exec-2');
    await service.finalize('exec-2', mockRecord);
    const record = await service.getRecord('exec-2');
    expect(record).toBeDefined();
    expect(record!.formulaId).toBe('vd-1');
  });

  it('returns null for unknown record', async () => {
    const record = await service.getRecord('nonexistent');
    expect(record).toBeNull();
  });

  it('appends intermediate values', async () => {
    await service.create('exec-3');
    await service.append('exec-3', { intermediates: [{ name: 'step1', value: 1, unit: 'A', description: '' }] });
    await service.append('exec-3', { intermediates: [{ name: 'step2', value: 2, unit: 'V', description: '' }] });
    const finalized = await service.finalize('exec-3', mockRecord);
    expect(finalized.intermediates.length).toBeGreaterThanOrEqual(3);
  });

  it('appends execution trace', async () => {
    await service.create('exec-4');
    await service.append('exec-4', { executionTrace: [{ step: 1, operation: 'validate', input: {}, output: {}, duration: 2 }] });
    const finalized = await service.finalize('exec-4', mockRecord);
    expect(finalized.executionTrace.length).toBeGreaterThanOrEqual(1);
  });

  it('lists records by formula ID', async () => {
    await service.create('exec-5');
    await service.finalize('exec-5', mockRecord);
    const records = await service.listByFormula('vd-1');
    expect(records.length).toBeGreaterThanOrEqual(1);
    expect(records.every((r) => r.formulaId === 'vd-1')).toBe(true);
  });

  it('checksum is deterministic for same inputs', async () => {
    await service.create('exec-6a');
    await service.create('exec-6b');
    const recA = await service.finalize('exec-6a', { ...mockRecord, inputs: { current: { value: 100, unit: 'A' } } });
    const recB = await service.finalize('exec-6b', { ...mockRecord, inputs: { current: { value: 100, unit: 'A' } } });
    expect(recA.checksum).toBe(recB.checksum);
  });

  it('records duration on finalization', async () => {
    await service.create('exec-7');
    const finalized = await service.finalize('exec-7', mockRecord);
    expect(finalized.duration).toBeGreaterThanOrEqual(0);
  });
});
