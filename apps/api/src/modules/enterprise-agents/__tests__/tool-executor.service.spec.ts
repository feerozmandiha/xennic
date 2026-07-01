import { Test, TestingModule } from '@nestjs/testing';
import { ToolExecutor } from '../application/services/tool-executor.service.js';

describe('ToolExecutor', () => {
  let service: ToolExecutor;
  const baseRequest = { agentId: 'agent-1', sessionId: 'sess-1', workspaceId: 'ws-1' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ToolExecutor],
    }).compile();
    service = module.get<ToolExecutor>(ToolExecutor);
  });

  it('lists all registered tools', () => {
    const tools = service.listTools();
    expect(tools.length).toBeGreaterThanOrEqual(20);
    const names = tools.map((t) => t.toolId);
    expect(names).toContain('voltage-drop');
    expect(names).toContain('cable-sizing');
    expect(names).toContain('report-generation');
  });

  it('executes voltage-drop tool successfully', async () => {
    const result = await service.execute({
      ...baseRequest, toolId: 'voltage-drop',
      input: { current: 100, length: 50, resistance: 0.1, voltage: 230 },
    });
    expect(result.success).toBe(true);
    expect(result.toolName).toBe('Voltage Drop Calculator');
    expect(result.output).toHaveProperty('voltageDrop');
    expect(result.output).toHaveProperty('percentageDrop');
    expect(result.output).toHaveProperty('verdict');
    expect(result.executionTimeMs).toBeGreaterThanOrEqual(0);
    expect(result.provenance.inputHash).toBeTruthy();
    expect(result.provenance.outputHash).toBeTruthy();
  });

  it('returns compliant verdict when drop is under 4%', async () => {
    const result = await service.execute({
      ...baseRequest, toolId: 'voltage-drop',
      input: { current: 10, length: 20, resistance: 0.02, voltage: 230 },
    });
    expect(result.success).toBe(true);
    expect(result.output['verdict']).toContain('Compliant');
  });

  it('executes cable-sizing tool', async () => {
    const result = await service.execute({
      ...baseRequest, toolId: 'cable-sizing',
      input: { current: 150, length: 50, material: 'copper', installation: 'underground' },
    });
    expect(result.success).toBe(true);
    expect(typeof result.output['selectedCable']).toBe('string');
    expect(result.output['selectedCable']).toMatch(/mm²/);
  });

  it('executes transformer-sizing tool', async () => {
    const result = await service.execute({
      ...baseRequest, toolId: 'transformer-sizing',
      input: { loadKva: 320, primaryVoltage: 11000, secondaryVoltage: 400 },
    });
    expect(result.success).toBe(true);
    expect(result.output['recommendedKva']).toBe(350);
  });

  it('executes short-circuit tool', async () => {
    const result = await service.execute({
      ...baseRequest, toolId: 'short-circuit',
      input: { sourceMva: 500, voltageKv: 11, impedancePercent: 5 },
    });
    expect(result.success).toBe(true);
    expect(result.output['faultCurrent']).toBeGreaterThan(0);
  });

  it('executes harmonic-analysis tool', async () => {
    const result = await service.execute({
      ...baseRequest, toolId: 'harmonic-analysis',
      input: { currentHarmonics: [100, 5, 3, 2, 1, 0.5], voltageHarmonics: [100, 3, 2, 1, 0.5, 0.3], fundamentalCurrent: 100 },
    });
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('thdi');
    expect(result.output).toHaveProperty('thdv');
    expect(result.output).toHaveProperty('compliance');
  });

  it('executes solar-pv-sizing tool', async () => {
    const result = await service.execute({
      ...baseRequest, toolId: 'solar-pv-sizing',
      input: { peakPower: 10, location: 'tehran', roofArea: 80, moduleType: 'mono' },
    });
    expect(result.success).toBe(true);
    expect(result.output['panelCount']).toBeGreaterThan(0);
    expect(result.output['inverterKva']).toBeGreaterThan(0);
    expect(result.output['annualYield']).toBeGreaterThan(0);
  });

  it('executes roi-calculation tool', async () => {
    const result = await service.execute({
      ...baseRequest, toolId: 'roi-calculation',
      input: { installCost: 15000, annualSavings: 2500, lifespan: 25 },
    });
    expect(result.success).toBe(true);
    expect(result.output['paybackPeriod']).toBeGreaterThan(0);
  });

  it('executes arc-flash tool', async () => {
    const result = await service.execute({
      ...baseRequest, toolId: 'arc-flash',
      input: { faultCurrent: 5000, gapDistance: 32, workingDistance: 600, duration: 0.2 },
    });
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('incidentEnergy');
    expect(result.output).toHaveProperty('arcFlashBoundary');
    expect(result.output).toHaveProperty('ppe');
  });

  it('executes power-factor-correction tool', async () => {
    const result = await service.execute({
      ...baseRequest, toolId: 'power-factor-correction',
      input: { currentPf: 0.8, targetPf: 0.95, loadKva: 500 },
    });
    expect(result.success).toBe(true);
    expect(result.output['requiredKvar']).toBeGreaterThan(0);
  });

  it('executes knowledge-search tool', async () => {
    const result = await service.execute({
      ...baseRequest, toolId: 'knowledge-search',
      input: { query: 'cable sizing IEC', domain: 'power' },
    });
    expect(result.success).toBe(true);
    expect(result.output['results']).toBeInstanceOf(Array);
    expect(result.output['totalResults']).toBeGreaterThan(0);
  });

  it('executes classification tool', async () => {
    const result = await service.execute({
      ...baseRequest, toolId: 'classification',
      input: { content: 'technical document', categories: ['spec', 'report'] },
    });
    expect(result.success).toBe(true);
    expect(result.output['category']).toBeTruthy();
    expect(result.output['confidence']).toBeGreaterThan(0);
  });

  it('executes extraction tool', async () => {
    const result = await service.execute({
      ...baseRequest, toolId: 'extraction',
      input: { text: 'IEC 60364-5-52 specifies cable sizing', entityTypes: ['standard', 'parameter'] },
    });
    expect(result.success).toBe(true);
    expect(result.output['entities']).toBeInstanceOf(Array);
    expect(result.output['entities'].length).toBeGreaterThan(0);
  });

  it('executes drawing-parse tool', async () => {
    const result = await service.execute({
      ...baseRequest, toolId: 'drawing-parse',
      input: { drawingType: 'single-line', format: 'dwg' },
    });
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('symbols');
    expect(result.output).toHaveProperty('connections');
    expect(result.output).toHaveProperty('dimensions');
  });

  it('executes report-generation tool', async () => {
    const result = await service.execute({
      ...baseRequest, toolId: 'report-generation',
      input: { findings: ['Finding 1'], recommendations: ['Rec 1'] },
    });
    expect(result.success).toBe(true);
    expect(result.output['report']).toContain('Finding 1');
    expect(result.output['report']).toContain('Rec 1');
  });

  it('returns error for unknown tool', async () => {
    const result = await service.execute({
      ...baseRequest, toolId: 'nonexistent', input: {},
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Unknown tool');
  });

  it('batches multiple tool executions', async () => {
    const results = await service.batchExecute([
      { ...baseRequest, toolId: 'voltage-drop', input: { current: 50, length: 30, resistance: 0.05, voltage: 230 } },
      { ...baseRequest, toolId: 'cable-sizing', input: { current: 100, length: 25, material: 'copper', installation: 'air' } },
    ]);
    expect(results).toHaveLength(2);
    expect(results[0].success).toBe(true);
    expect(results[1].success).toBe(true);
  });

  it('returns tool config for valid tool', () => {
    const config = service.getTool('voltage-drop');
    expect(config).toBeDefined();
    expect(config!.name).toBe('Voltage Drop Calculator');
  });

  it('returns null for unknown tool config', () => {
    expect(service.getTool('nonexistent')).toBeNull();
  });
});
