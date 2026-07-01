import { Test, TestingModule } from '@nestjs/testing';
import { EiOrchestratorService } from '../application/services/ei-orchestrator.service.js';
import type { IReasoningKernel } from '../domain/interfaces/reasoning-kernel.interface.js';
import type { IEngineeringPlanner } from '../domain/interfaces/engineering-planner.interface.js';
import type { IWorkflowEngine } from '../domain/interfaces/workflow-engine.interface.js';
import type { IToolRegistry } from '../domain/interfaces/tool-registry.interface.js';
import type { ICalcOrchestrator } from '../domain/interfaces/calc-orchestrator.interface.js';
import type { IKnowledgeGraphService } from '../domain/interfaces/knowledge-graph.interface.js';
import type { IDecisionEngine } from '../domain/interfaces/decision-engine.interface.js';
import type { IReportGenerator } from '../domain/interfaces/report-generator.interface.js';
import type { IEngineeringMemory } from '../domain/interfaces/engineering-memory.interface.js';
import type { IAuditEngine } from '../domain/interfaces/audit-engine.interface.js';

describe('EiOrchestratorService', () => {
  let service: EiOrchestratorService;

  const mockKernel: jest.Mocked<IReasoningKernel> = {
    decompose: jest.fn().mockResolvedValue([
      { id: 's1', type: 'retrieve', input: {}, output: {}, evidence: [], assumptions: [], confidence: 0, trace: { stepId: 's1', parentId: null, timestamp: 0, duration: 0, status: 'pending' } },
      { id: 's2', type: 'calculate', input: {}, output: {}, evidence: [], assumptions: [], confidence: 0, trace: { stepId: 's2', parentId: 's1', timestamp: 0, duration: 0, status: 'pending' } },
      { id: 's3', type: 'decide', input: {}, output: {}, evidence: [], assumptions: [], confidence: 0, trace: { stepId: 's3', parentId: 's2', timestamp: 0, duration: 0, status: 'pending' } },
      { id: 's4', type: 'conclude', input: {}, output: {}, evidence: [], assumptions: [], confidence: 0, trace: { stepId: 's4', parentId: 's3', timestamp: 0, duration: 0, status: 'pending' } },
    ]),
    execute: jest.fn().mockImplementation(async (step) => ({ ...step, output: {}, confidence: 0.85, trace: { ...step.trace, status: 'completed', duration: 10 } })),
    propagateConstraints: jest.fn(),
    getDecisionTrace: jest.fn(),
  };

  const mockPlanner: jest.Mocked<IEngineeringPlanner> = {
    createPlan: jest.fn().mockResolvedValue({ id: 'plan-1', goal: {} as any, dag: [], edges: [], metadata: {} as any }),
    validatePlan: jest.fn(),
    getPlan: jest.fn(),
    getSupportedPlanTypes: jest.fn(),
  };

  const mockWorkflow: jest.Mocked<IWorkflowEngine> = {
    start: jest.fn().mockResolvedValue({ id: 'wf-1', status: 'running', nodes: [], checkpoint: null, version: 1, startTime: Date.now(), planId: 'plan-1' }),
    cancel: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    getStatus: jest.fn().mockResolvedValue({ id: 'wf-1', status: 'completed', nodes: [], checkpoint: null, version: 1, startTime: Date.now(), endTime: Date.now(), planId: 'plan-1' }),
    checkpoint: jest.fn(),
    recover: jest.fn(),
    executeNode: jest.fn(),
  };

  const mockDecisions: jest.Mocked<IDecisionEngine> = {
    make: jest.fn().mockResolvedValue({ id: 'dec-1', title: 'Test', description: '', inputs: {}, evidence: [], appliedStandards: [], reasoningSteps: [], calculations: [], confidence: 0.85, alternatives: [], rejectedAlternatives: [], finalDecision: 'Selected A', timestamp: Date.now() }),
    evaluateAlternatives: jest.fn(),
    getDecision: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EiOrchestratorService,
        { provide: 'IReasoningKernel', useValue: mockKernel },
        { provide: 'IEngineeringPlanner', useValue: mockPlanner },
        { provide: 'IWorkflowEngine', useValue: mockWorkflow },
        { provide: 'IToolRegistry', useValue: { register: jest.fn(), get: jest.fn(), find: jest.fn(), list: jest.fn(), validateInput: jest.fn() } },
        { provide: 'ICalcOrchestrator', useValue: { execute: jest.fn(), executeBatch: jest.fn(), getCacheKey: jest.fn(), invalidateCache: jest.fn(), getHistory: jest.fn() } },
        { provide: 'IKnowledgeGraphService', useValue: { getNode: jest.fn(), expandRelations: jest.fn(), shortestPath: jest.fn(), neighborhoodSearch: jest.fn(), traverseByType: jest.fn(), semanticExpand: jest.fn() } },
        { provide: 'IDecisionEngine', useValue: mockDecisions },
        { provide: 'IReportGenerator', useValue: { generate: jest.fn().mockResolvedValue({ id: 'rpt-1', title: 'Report', format: 'markdown', sections: [], generatedAt: Date.now(), traceId: 't1' }), renderSection: jest.fn(), toMarkdown: jest.fn(), toJson: jest.fn() } },
        { provide: 'IEngineeringMemory', useValue: { createSession: jest.fn().mockResolvedValue({ sessionId: 'sess-1', workflowId: 'wf-1', completedSteps: {}, intermediateCalculations: {}, evidenceCache: {}, reasoningState: {}, context: {} }), getSession: jest.fn(), updateStep: jest.fn(), cacheCalculation: jest.fn(), getCachedCalculation: jest.fn(), getEvidenceCache: jest.fn(), clearSession: jest.fn() } },
        { provide: 'IAuditEngine', useValue: { create: jest.fn().mockResolvedValue({ executionId: 'exec-1', traceId: 't1', workflowGraph: {}, reasoningLog: [], calculationLog: [], timing: { totalDuration: 0, perStep: {}, retrievalTime: 0, calculationTime: 0, decisionTime: 0 }, decisionHistory: [], validationStatus: 'pending', timestamp: Date.now() }), logStep: jest.fn(), logCalculation: jest.fn(), logDecision: jest.fn(), finalize: jest.fn().mockResolvedValue({ executionId: 'exec-1', traceId: 't1', workflowGraph: {}, reasoningLog: [], calculationLog: [], timing: { totalDuration: 0, perStep: {}, retrievalTime: 0, calculationTime: 0, decisionTime: 0 }, decisionHistory: [], validationStatus: 'passed', timestamp: Date.now() }), getRecord: jest.fn(), verifyImmutability: jest.fn() } },
      ],
    }).compile();
    service = module.get<EiOrchestratorService>(EiOrchestratorService);
  });

  it('executes full pipeline and returns response', async () => {
    const result = await service.execute({
      goal: 'Calculate voltage drop', goalType: 'calculation', workspaceId: 'ws-1', domain: 'power',
    });
    expect(result.executionId).toBeTruthy();
    expect(result.traceId).toBeTruthy();
    expect(result.decisions).toHaveLength(1);
    expect(result.metrics.stepCount).toBeGreaterThan(0);
  });

  it('includes report when requested', async () => {
    const result = await service.execute({
      goal: 'Test', goalType: 'analysis', workspaceId: 'ws-1', domain: 'power',
      options: { includeReport: true, format: 'markdown' },
    });
    expect(result.report).toBeDefined();
  });

  it('returns audit record', async () => {
    const result = await service.execute({
      goal: 'Test', goalType: 'verification', workspaceId: 'ws-1', domain: 'power',
    });
    expect(result.audit.validationStatus).toBe('passed');
  });

  it('handles errors gracefully', async () => {
    mockKernel.decompose.mockRejectedValueOnce(new Error('Decomposition failed'));
    const result = await service.execute({
      goal: 'Test', goalType: 'calculation', workspaceId: 'ws-1', domain: 'power',
    });
    expect(result.decisions).toHaveLength(0);
    expect(result.metrics.confidence).toBe(0);
  });
});
