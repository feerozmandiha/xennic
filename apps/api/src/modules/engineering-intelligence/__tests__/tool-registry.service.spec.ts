import { Test, TestingModule } from '@nestjs/testing';
import { ToolRegistry } from '../application/services/tool-registry.service.js';

describe('ToolRegistry', () => {
  let service: ToolRegistry;
  const mockTool = { id: 'calc-1', name: 'Voltage Drop Calculator', description: 'Calculates voltage drop', version: '1.0.0', inputSchema: { required: ['current', 'length', 'resistance'] }, outputSchema: {}, capability: ['voltage-drop'], safetyLevel: 'advisory' as const, requiredEvidence: ['cable-spec'], supportedDomains: ['power'] };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ToolRegistry],
    }).compile();
    service = module.get<ToolRegistry>(ToolRegistry);
    await service.register(mockTool);
  });

  it('registers and retrieves a tool', async () => {
    const tool = await service.get('calc-1');
    expect(tool).toBeDefined();
    expect(tool!.name).toBe('Voltage Drop Calculator');
  });

  it('returns null for unknown tool', async () => {
    const tool = await service.get('nonexistent');
    expect(tool).toBeNull();
  });

  it('finds tools by capability', async () => {
    const tools = await service.find({ capability: 'voltage-drop' });
    expect(tools).toHaveLength(1);
  });

  it('finds tools by domain', async () => {
    const tools = await service.find({ domain: 'power' });
    expect(tools).toHaveLength(1);
  });

  it('finds tools by safety level', async () => {
    const tools = await service.find({ safetyLevel: 'advisory' });
    expect(tools).toHaveLength(1);
  });

  it('returns empty for non-matching query', async () => {
    const tools = await service.find({ domain: 'mechanical' });
    expect(tools).toHaveLength(0);
  });

  it('lists all registered tools', async () => {
    await service.register({ id: 'calc-2', name: 'Cable Sizer', description: '', version: '1.0.0', inputSchema: {}, outputSchema: {}, capability: ['cable-sizing'], safetyLevel: 'informational' as const, requiredEvidence: [], supportedDomains: [] });
    const tools = await service.list();
    expect(tools).toHaveLength(2);
  });

  it('validates input against schema', async () => {
    const valid = await service.validateInput('calc-1', { current: 100, length: 50, resistance: 0.1 });
    expect(valid).toBe(true);
    const invalid = await service.validateInput('calc-1', { current: 100 });
    expect(invalid).toBe(false);
  });
});
