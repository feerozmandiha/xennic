import { Test, TestingModule } from '@nestjs/testing';
import { AgentOrchestratorService } from '../application/services/agent-orchestrator.service.js';
import type { IAgentRegistry } from '../domain/interfaces/agent-registry.interface.js';
import type { IToolExecutor } from '../domain/interfaces/tool-executor.interface.js';
import type { IMultiAgentOrchestrator } from '../domain/interfaces/multi-agent-orchestrator.interface.js';
import type { IAgentMemory } from '../domain/interfaces/agent-memory.interface.js';
import type { IAgentSafety } from '../domain/interfaces/agent-safety.interface.js';

describe('AgentOrchestratorService', () => {
  let service: AgentOrchestratorService;

  const mockRegistry: jest.Mocked<IAgentRegistry> = {
    get: jest.fn().mockReturnValue({
      id: 'a1', name: 'Electrical Engineer', slug: 'electrical-engineer',
      description: '', type: 'electrical_engineer' as any,
      systemPrompt: 'You are an electrical engineer',
      capabilities: [{ type: 'calculate' as any, description: 'Calc', requiredTools: ['voltage-drop'] }],
      toolsConfig: [{ toolId: 'voltage-drop', name: 'Voltage Drop Calculator', description: '', inputSchema: { required: ['current', 'length', 'resistance', 'voltage'] }, outputSchema: {}, safetyLevel: 'safe' as any }],
      isActive: true, version: '1.0.0', createdAt: new Date(),
    }),
    getById: jest.fn(),
    findByType: jest.fn().mockReturnValue([]),
    findByCapability: jest.fn().mockReturnValue([]),
    list: jest.fn().mockReturnValue([]),
    listActive: jest.fn().mockReturnValue([]),
    register: jest.fn(),
  };

  const mockTools: jest.Mocked<IToolExecutor> = {
    execute: jest.fn().mockResolvedValue({
      toolId: 'voltage-drop', toolName: 'Voltage Drop Calculator',
      output: { voltageDrop: 3.45, percentageDrop: 1.5, verdict: 'Compliant' },
      success: true, executionTimeMs: 5,
      provenance: { toolId: 'voltage-drop', agentId: 'a1', sessionId: 's1', timestamp: Date.now(), inputHash: 'abc', outputHash: 'def' },
    }),
    batchExecute: jest.fn().mockResolvedValue([]),
    getTool: jest.fn(),
    listTools: jest.fn().mockReturnValue([]),
  };

  const mockMultiAgent: jest.Mocked<IMultiAgentOrchestrator> = {
    createPlan: jest.fn().mockReturnValue({
      planId: 'plan-1', query: 'test', tasks: [], coordinatorSlug: 'test', executionStrategy: 'sequential' as any, createdAt: Date.now(),
    }),
    executePlan: jest.fn().mockResolvedValue({ stepResults: [], toolsUsed: [] }),
    delegateTask: jest.fn(),
    getPlan: jest.fn(),
  };

  const mockMemory: jest.Mocked<IAgentMemory> = {
    createSession: jest.fn().mockReturnValue({
      sessionId: 'sess-1', agentId: 'a1', agentSlug: 'test', workspaceId: 'ws-1',
      entries: [], createdAt: Date.now(), updatedAt: Date.now(), metadata: {},
    }),
    getSession: jest.fn().mockReturnValue(null),
    store: jest.fn().mockImplementation((_sid, entry) => ({
      id: 'mem-1', sessionId: 'sess-1', agentId: entry.agentId,
      type: entry.type, content: entry.content, timestamp: Date.now(),
    })),
    retrieve: jest.fn().mockReturnValue([]),
    search: jest.fn().mockResolvedValue([]),
    clearSession: jest.fn(),
    deleteSession: jest.fn(),
  };

  const mockSafety: jest.Mocked<IAgentSafety> = {
    validate: jest.fn().mockReturnValue({
      passed: true, score: 0.92,
      checks: [{ name: 'input-safety', passed: true, score: 1, details: 'Safe', severity: 'low' as any },
        { name: 'output-consistency', passed: true, score: 1, details: 'Consistent', severity: 'low' as any },
        { name: 'tool-safety', passed: true, score: 1, details: 'Safe', severity: 'low' as any },
        { name: 'confidence', passed: true, score: 0.85, details: 'Good', severity: 'low' as any }],
      confidence: 1,
    }),
    checkInputSafety: jest.fn(),
    checkOutputConsistency: jest.fn(),
    checkToolSafety: jest.fn(),
    checkConfidence: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentOrchestratorService,
        { provide: 'IAgentRegistry', useValue: mockRegistry },
        { provide: 'IToolExecutor', useValue: mockTools },
        { provide: 'IMultiAgentOrchestrator', useValue: mockMultiAgent },
        { provide: 'IAgentMemory', useValue: mockMemory },
        { provide: 'IAgentSafety', useValue: mockSafety },
      ],
    }).compile();
    service = module.get<AgentOrchestratorService>(AgentOrchestratorService);
  });

  it('executes a query and returns response with metrics', async () => {
    const result = await service.execute({
      query: 'Calculate voltage drop for 100A at 50m', agentSlug: 'electrical-engineer', workspaceId: 'ws-1',
    });
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data!.agentSlug).toBe('electrical-engineer');
    expect(result.data!.agentName).toBe('Electrical Engineer');
    expect(result.data!.sessionId).toBeTruthy();
    expect(result.data!.metrics.totalTimeMs).toBeGreaterThanOrEqual(0);
    expect(result.data!.metrics.stepsExecuted).toBeGreaterThan(0);
    expect(result.data!.metrics.toolsCalled).toBeGreaterThan(0);
    expect(result.data!.safetyCheck).toBeDefined();
  });

  it('returns error for unknown agent', async () => {
    mockRegistry.get.mockReturnValueOnce(null);
    const result = await service.execute({
      query: 'test', agentSlug: 'nonexistent', workspaceId: 'ws-1',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });

  it('includes memory when available', async () => {
    mockMemory.retrieve.mockReturnValueOnce([{ id: 'm1', sessionId: 's1', agentId: 'a1', type: 'conversation' as any, content: { input: 'prev', output: 'prev-out' }, timestamp: 100 }]);
    const result = await service.execute({
      query: 'Calculate voltage drop', agentSlug: 'electrical-engineer', workspaceId: 'ws-1',
    });
    expect(result.data!.memoryUsed).toBeDefined();
    expect(result.data!.memoryUsed).toHaveLength(1);
    expect(result.data!.metrics.memoryRetrieved).toBe(1);
  });

  it('stores conversation in memory after execution', async () => {
    await service.execute({
      query: 'Calculate voltage drop', agentSlug: 'electrical-engineer', workspaceId: 'ws-1',
    });
    expect(mockMemory.store).toHaveBeenCalled();
  });

  it('continues existing session when sessionId provided', async () => {
    mockMemory.getSession.mockReturnValueOnce({
      sessionId: 'existing-sess', agentId: 'a1', agentSlug: 'test', workspaceId: 'ws-1',
      entries: [], createdAt: Date.now(), updatedAt: Date.now(), metadata: {},
    });
    const result = await service.execute({
      query: 'test', agentSlug: 'electrical-engineer', workspaceId: 'ws-1', sessionId: 'existing-sess',
    });
    expect(result.data!.sessionId).toBe('existing-sess');
  });

  it('handles errors gracefully', async () => {
    mockRegistry.get.mockImplementationOnce(() => { throw new Error('Registry failure'); });
    const result = await service.execute({
      query: 'test', agentSlug: 'electrical-engineer', workspaceId: 'ws-1',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Registry failure');
  });

  it('uses multi-agent for complex queries with multiple capabilities', async () => {
    mockRegistry.get.mockReturnValueOnce({
      id: 'a1', name: 'Multi Agent', slug: 'multi', description: '', type: 'researcher' as any,
      systemPrompt: '', capabilities: [
        { type: 'search' as any, description: 'Search', requiredTools: ['knowledge-search'] },
        { type: 'analyze' as any, description: 'Analyze', requiredTools: ['document-parse'] },
      ],
      toolsConfig: [], isActive: true, version: '1.0.0', createdAt: new Date(),
    });
    mockRegistry.findByCapability.mockReturnValueOnce([]);

    const result = await service.execute({
      query: 'compare and analyze all available standards and also check comprehensive documentation for complete review', agentSlug: 'multi', workspaceId: 'ws-1',
    });
    expect(result.success).toBe(true);
  });
});
