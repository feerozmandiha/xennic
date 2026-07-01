import { Test, TestingModule } from '@nestjs/testing';
import { MultiAgentOrchestrator } from '../application/services/multi-agent-orchestrator.service.js';
import { AgentType, ExecutionStrategy } from '../domain/types/agent.types.js';
import type { AgentDefinition, AgentQuery } from '../domain/types/agent.types.js';

describe('MultiAgentOrchestrator', () => {
  let service: MultiAgentOrchestrator;
  const mockAgent: AgentDefinition = {
    id: 'a1', name: 'Test Agent', slug: 'test-agent', description: '',
    type: AgentType.RESEARCHER, systemPrompt: '', capabilities: [],
    toolsConfig: [], isActive: true, version: '1.0.0', createdAt: new Date(),
  };
  const mockAgent2: AgentDefinition = {
    id: 'a2', name: 'Test Agent 2', slug: 'test-agent-2', description: '',
    type: AgentType.DOCUMENT_ANALYST, systemPrompt: '', capabilities: [],
    toolsConfig: [], isActive: true, version: '1.0.0', createdAt: new Date(),
  };
  const mockQuery: AgentQuery = { query: 'test query', agentSlug: 'test-agent', workspaceId: 'ws-1' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MultiAgentOrchestrator],
    }).compile();
    service = module.get<MultiAgentOrchestrator>(MultiAgentOrchestrator);
  });

  it('creates sequential plan for single agent', () => {
    const plan = service.createPlan(mockQuery, [mockAgent]);
    expect(plan.tasks).toHaveLength(1);
    expect(plan.executionStrategy).toBe(ExecutionStrategy.SEQUENTIAL);
    expect(plan.tasks[0].agentSlug).toBe('test-agent');
  });

  it('creates hybrid plan for multiple agents', () => {
    const plan = service.createPlan(mockQuery, [mockAgent, mockAgent2]);
    expect(plan.tasks).toHaveLength(2);
    expect(plan.executionStrategy).toBe(ExecutionStrategy.HYBRID);
  });

  it('sets dependency chain for multi-agent plan', () => {
    const plan = service.createPlan(mockQuery, [mockAgent, mockAgent2, mockAgent]);
    expect(plan.tasks[0].dependsOn).toHaveLength(0);
    expect(plan.tasks[1].dependsOn).toHaveLength(1);
    expect(plan.tasks[1].dependsOn[0]).toBe(plan.tasks[0].taskId);
    expect(plan.tasks[2].dependsOn).toHaveLength(1);
  });

  it('sets priorities based on order', () => {
    const plan = service.createPlan(mockQuery, [mockAgent, mockAgent2]);
    expect(plan.tasks[0].priority).toBe(1);
    expect(plan.tasks[1].priority).toBe(2);
  });

  it('stores and retrieves plan', () => {
    const plan = service.createPlan(mockQuery, [mockAgent]);
    const retrieved = service.getPlan(plan.planId);
    expect(retrieved).toBeDefined();
    expect(retrieved!.query).toBe('test query');
  });

  it('returns null for unknown plan', () => {
    expect(service.getPlan('nonexistent')).toBeNull();
  });

  it('executes single-agent plan successfully', async () => {
    const plan = service.createPlan(mockQuery, [mockAgent]);
    const result = await service.executePlan(plan);
    expect(result.stepResults).toHaveLength(1);
    expect(result.stepResults[0].type).toContain('test-agent');
    expect(result.toolsUsed).toHaveLength(0);
  });

  it('executes multi-agent plan successfully', async () => {
    const plan = service.createPlan(mockQuery, [mockAgent, mockAgent2]);
    const result = await service.executePlan(plan);
    expect(result.stepResults).toHaveLength(2);
    expect(result.stepResults[0].type).toContain('test-agent');
    expect(result.stepResults[1].type).toContain('test-agent-2');
  });

  it('delegates a task and marks it completed', async () => {
    const plan = service.createPlan(mockQuery, [mockAgent]);
    const delegated = await service.delegateTask(plan.tasks[0]);
    expect(delegated.status).toBe('completed');
  });

  it('handles empty agents list gracefully', () => {
    const plan = service.createPlan(mockQuery, []);
    expect(plan.tasks).toHaveLength(1);
  });
});
