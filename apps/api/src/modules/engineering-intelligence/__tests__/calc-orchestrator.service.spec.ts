import { Test, TestingModule } from '@nestjs/testing';
import { CalcOrchestrator } from '../application/services/calc-orchestrator.service.js';

describe('CalcOrchestrator', () => {
  let service: CalcOrchestrator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CalcOrchestrator],
    }).compile();
    service = module.get<CalcOrchestrator>(CalcOrchestrator);
  });

  it('executes a calculation and returns result', async () => {
    const result = await service.execute('calc-1', { current: 100, resistance: 0.5 });
    expect(result.id).toBeTruthy();
    expect(result.toolId).toBe('calc-1');
    expect(result.cached).toBe(false);
    expect(result.checksum).toBeTruthy();
  });

  it('caches results for identical inputs', async () => {
    const r1 = await service.execute('calc-1', { a: 1, b: 2 });
    const r2 = await service.execute('calc-1', { a: 1, b: 2 });
    expect(r2.cached).toBe(true);
  });

  it('does not cache different inputs', async () => {
    await service.execute('calc-1', { x: 1 });
    const r2 = await service.execute('calc-1', { x: 2 });
    expect(r2.cached).toBe(false);
  });

  it('executes batch calculations', async () => {
    const results = await service.executeBatch([
      { toolId: 'calc-1', input: { val: 1 } },
      { toolId: 'calc-1', input: { val: 2 } },
    ]);
    expect(results).toHaveLength(2);
  });

  it('maintains execution history', async () => {
    await service.execute('tool-a', { p: 1 });
    await service.execute('tool-a', { p: 2 });
    const history = await service.getHistory('tool-a');
    expect(history).toHaveLength(2);
  });

  it('invalidates cache for specific tool', async () => {
    await service.execute('tool-x', { d: 1 });
    await service.invalidateCache('tool-x');
    const r2 = await service.execute('tool-x', { d: 1 });
    expect(r2.cached).toBe(false);
  });

  it('invalidates all cache', async () => {
    await service.execute('t1', { a: 1 });
    await service.execute('t2', { b: 2 });
    await service.invalidateCache();
    const r1 = await service.execute('t1', { a: 1 });
    const r2 = await service.execute('t2', { b: 2 });
    expect(r1.cached).toBe(false);
    expect(r2.cached).toBe(false);
  });

  it('generates consistent cache keys', () => {
    const key1 = service.getCacheKey('tool', { x: 1 });
    const key2 = service.getCacheKey('tool', { x: 1 });
    expect(key1).toBe(key2);
  });
});
