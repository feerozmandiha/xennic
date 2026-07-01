import { Test, TestingModule } from '@nestjs/testing';
import { AgentRegistry } from '../application/services/agent-registry.service.js';
import { AgentType, AgentCapabilityType } from '../domain/types/agent.types.js';

describe('AgentRegistry', () => {
  let service: AgentRegistry;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AgentRegistry],
    }).compile();
    service = module.get<AgentRegistry>(AgentRegistry);
  });

  it('registers 7 built-in agents', () => {
    const agents = service.list();
    expect(agents).toHaveLength(7);
  });

  it('returns agent by slug', () => {
    const agent = service.get('electrical-engineer');
    expect(agent).toBeDefined();
    expect(agent!.name).toBe('Electrical Engineer');
    expect(agent!.type).toBe(AgentType.ELECTRICAL_ENGINEER);
  });

  it('returns null for unknown slug', () => {
    expect(service.get('nonexistent')).toBeNull();
  });

  it('returns agent by id', () => {
    const agent = service.get('solar-consultant')!;
    const byId = service.getById(agent.id);
    expect(byId).toBeDefined();
    expect(byId!.slug).toBe('solar-consultant');
  });

  it('finds agents by type', () => {
    const agents = service.findByType(AgentType.RESEARCHER);
    expect(agents).toHaveLength(1);
    expect(agents[0]!.slug).toBe('researcher');
  });

  it('finds agents by capability', () => {
    const agents = service.findByCapability(AgentCapabilityType.CALCULATE);
    expect(agents.length).toBeGreaterThanOrEqual(3);
    const slugs = agents.map((a) => a.slug);
    expect(slugs).toContain('electrical-engineer');
    expect(slugs).toContain('solar-consultant');
    expect(slugs).toContain('protection-engineer');
  });

  it('finds agents by search capability', () => {
    const agents = service.findByCapability(AgentCapabilityType.SEARCH);
    expect(agents).toHaveLength(1);
    expect(agents[0]!.slug).toBe('researcher');
  });

  it('lists only active agents', () => {
    const active = service.listActive();
    expect(active).toHaveLength(7);
    expect(active.every((a) => a.isActive)).toBe(true);
  });

  it('registers a custom agent', () => {
    service.register({
      id: 'custom-1', name: 'Custom Agent', slug: 'custom', description: '',
      type: AgentType.RESEARCHER, systemPrompt: '', capabilities: [],
      toolsConfig: [], isActive: true, version: '1.0.0', createdAt: new Date(),
    });
    expect(service.get('custom')).toBeDefined();
    expect(service.list()).toHaveLength(8);
  });

  it('overwrites existing agent on re-register', () => {
    service.register({
      id: 'custom-2', name: 'Updated', slug: 'electrical-engineer', description: '',
      type: AgentType.ELECTRICAL_ENGINEER, systemPrompt: '', capabilities: [],
      toolsConfig: [], isActive: true, version: '2.0.0', createdAt: new Date(),
    });
    const agent = service.get('electrical-engineer')!;
    expect(agent.version).toBe('2.0.0');
  });
});
