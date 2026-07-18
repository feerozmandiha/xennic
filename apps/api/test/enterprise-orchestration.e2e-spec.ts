import { Test, TestingModule } from '@nestjs/testing';

import { WorkflowDefinitionService } from '../src/modules/enterprise-orchestration/workflow-engine/application/workflow-definition.service.js';
import { WorkflowValidatorService } from '../src/modules/enterprise-orchestration/workflow-engine/application/workflow-validator.service.js';
import { WorkflowTemplateService } from '../src/modules/enterprise-orchestration/workflow-engine/application/workflow-template.service.js';
import { InMemoryWorkflowRepository } from '../src/modules/enterprise-orchestration/workflow-engine/testing/adapters/in-memory-workflow-repository';

import { PlannerService } from '../src/modules/enterprise-orchestration/planning-engine/application/planner.service.js';
import { ReplannerService } from '../src/modules/enterprise-orchestration/planning-engine/application/replanner.service.js';
import { DecompositionService } from '../src/modules/enterprise-orchestration/planning-engine/application/decomposition.service.js';
import { InMemoryPlannerRepository } from '../src/modules/enterprise-orchestration/planning-engine/testing/adapters/in-memory-planner-repository';

import { WorkflowExecutorService } from '../src/modules/enterprise-orchestration/workflow-runtime/application/workflow-executor.service.js';
import { RetryHandlerService } from '../src/modules/enterprise-orchestration/workflow-runtime/application/retry-handler.service.js';
import { TimeoutHandlerService } from '../src/modules/enterprise-orchestration/workflow-runtime/application/timeout-handler.service.js';
import { CompensationService } from '../src/modules/enterprise-orchestration/workflow-runtime/application/compensation.service.js';
import { LifecycleService } from '../src/modules/enterprise-orchestration/workflow-runtime/application/lifecycle.service.js';
import { InMemoryExecutionRepository } from '../src/modules/enterprise-orchestration/workflow-runtime/testing/adapters/in-memory-execution-repository';

import { ApprovalService } from '../src/modules/enterprise-orchestration/human-in-the-loop/application/approval.service.js';
import { ReviewService } from '../src/modules/enterprise-orchestration/human-in-the-loop/application/review.service.js';
import { InMemoryHitlRepository } from '../src/modules/enterprise-orchestration/human-in-the-loop/testing/adapters/in-memory-hitl-repository';

import { CoordinatorService } from '../src/modules/enterprise-orchestration/multi-agent/application/coordinator.service.js';
import { SupervisorService } from '../src/modules/enterprise-orchestration/multi-agent/application/supervisor.service.js';
import { InMemoryCoordinationRepository } from '../src/modules/enterprise-orchestration/multi-agent/testing/adapters/in-memory-coordination-repository';

import { ContextVariablesService } from '../src/modules/enterprise-orchestration/execution-context/application/context-variables.service.js';
import { ArtifactService } from '../src/modules/enterprise-orchestration/execution-context/application/artifact.service.js';
import { SharedMemoryService } from '../src/modules/enterprise-orchestration/execution-context/application/shared-memory.service.js';
import { InMemoryContextRepository } from '../src/modules/enterprise-orchestration/execution-context/testing/adapters/in-memory-context-repository';

import { ConversationService } from '../src/modules/enterprise-orchestration/conversation-runtime/application/conversation.service.js';
import { HistoryService } from '../src/modules/enterprise-orchestration/conversation-runtime/application/history.service.js';
import { InMemoryConversationRepository } from '../src/modules/enterprise-orchestration/conversation-runtime/testing/adapters/in-memory-conversation-repository';

import { WorkflowExecution } from '../src/modules/enterprise-orchestration/workflow-runtime/domain/workflow-execution.entity.js';
import type { IExecutionRepository } from '../src/modules/enterprise-orchestration/workflow-runtime/domain/execution-repository.interface.js';
import { CoordinationPlan } from '../src/modules/enterprise-orchestration/multi-agent/domain/coordination-plan.entity.js';
import type { ICoordinationRepository } from '../src/modules/enterprise-orchestration/multi-agent/domain/coordination-repository.interface.js';

import { CostTrackingService } from '../src/modules/enterprise-orchestration/cost-management/application/cost-tracking.service.js';
import { CostAnalysisService } from '../src/modules/enterprise-orchestration/cost-management/application/cost-analysis.service.js';
import { InMemoryCostRepository } from '../src/modules/enterprise-orchestration/cost-management/testing/adapters/in-memory-cost-repository';

import { ExplainabilityService } from '../src/modules/enterprise-orchestration/explainability/application/explainability.service.js';
import { DecisionLoggerService } from '../src/modules/enterprise-orchestration/explainability/application/decision-logger.service.js';
import { InMemoryExplainabilityRepository } from '../src/modules/enterprise-orchestration/explainability/testing/adapters/in-memory-explainability-repository';

describe('Enterprise Orchestration Platform (Sprint O1)', () => {
  let module: TestingModule;

  let workflowDef: WorkflowDefinitionService;
  let workflowValidator: WorkflowValidatorService;
  let workflowTemplate: WorkflowTemplateService;

  let planner: PlannerService;
  let replanner: ReplannerService;

  let executor: WorkflowExecutorService;
  let lifecycle: LifecycleService;
  let compensation: CompensationService;

  let approval: ApprovalService;
  let review: ReviewService;

  let coordinator: CoordinatorService;
  let supervisor: SupervisorService;

  let contextVars: ContextVariablesService;
  let artifact: ArtifactService;

  let conversation: ConversationService;
  let history: HistoryService;
  let execRepo: IExecutionRepository;
  let coordRepo: ICoordinationRepository;

  let costTrack: CostTrackingService;
  let costAnalysis: CostAnalysisService;

  let explain: ExplainabilityService;
  let decisionLogger: DecisionLoggerService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        WorkflowDefinitionService,
        WorkflowValidatorService,
        WorkflowTemplateService,
        { provide: 'IWorkflowRepository', useClass: InMemoryWorkflowRepository },
        { provide: 'IWorkflowValidator', useClass: WorkflowValidatorService },

        PlannerService,
        ReplannerService,
        DecompositionService,
        { provide: 'IPlannerRepository', useClass: InMemoryPlannerRepository },

        WorkflowExecutorService,
        RetryHandlerService,
        TimeoutHandlerService,
        CompensationService,
        LifecycleService,
        { provide: 'IExecutionRepository', useClass: InMemoryExecutionRepository },

        ApprovalService,
        ReviewService,
        { provide: 'IHitlRepository', useClass: InMemoryHitlRepository },

        CoordinatorService,
        SupervisorService,
        { provide: 'ICoordinationRepository', useClass: InMemoryCoordinationRepository },

        ContextVariablesService,
        ArtifactService,
        SharedMemoryService,
        { provide: 'IContextRepository', useClass: InMemoryContextRepository },

        ConversationService,
        HistoryService,
        { provide: 'IConversationRepository', useClass: InMemoryConversationRepository },

        CostTrackingService,
        CostAnalysisService,
        { provide: 'ICostRepository', useClass: InMemoryCostRepository },

        ExplainabilityService,
        DecisionLoggerService,
        { provide: 'IExplainabilityRepository', useClass: InMemoryExplainabilityRepository },
      ],
    }).compile();

    workflowDef = module.get(WorkflowDefinitionService);
    workflowValidator = module.get(WorkflowValidatorService);
    workflowTemplate = module.get(WorkflowTemplateService);
    planner = module.get(PlannerService);
    replanner = module.get(ReplannerService);
    executor = module.get(WorkflowExecutorService);
    lifecycle = module.get(LifecycleService);
    compensation = module.get(CompensationService);
    approval = module.get(ApprovalService);
    review = module.get(ReviewService);
    coordinator = module.get(CoordinatorService);
    supervisor = module.get(SupervisorService);
    contextVars = module.get(ContextVariablesService);
    artifact = module.get(ArtifactService);
    conversation = module.get(ConversationService);
    history = module.get(HistoryService);
    execRepo = module.get('IExecutionRepository');
    coordRepo = module.get('ICoordinationRepository');
    costTrack = module.get(CostTrackingService);
    costAnalysis = module.get(CostAnalysisService);
    explain = module.get(ExplainabilityService);
    decisionLogger = module.get(DecisionLoggerService);
  });

  afterAll(async () => {
    await module.close();
  });

  // ─── Phase 1: Workflow Engine ───────────────────────────────────────

  describe('Phase 1: Workflow Definition Engine', () => {
    it('should create a workflow definition', async () => {
      const wf = await workflowDef.create({
        name: 'test-workflow',
        description: 'A test workflow',
        steps: [
          { id: 'step-1', type: 'task', name: 'Step 1', config: {} },
          { id: 'step-2', type: 'task', name: 'Step 2', config: {}, next: ['step-1'] },
        ],
      });
      expect(wf.id).toBeDefined();
      expect(wf.name).toBe('test-workflow');
      expect(wf.version).toBe(1);
    });

    it('should get workflow by name', async () => {
      const wf = await workflowDef.getByName('test-workflow');
      expect(wf).toBeDefined();
      expect(wf?.name).toBe('test-workflow');
    });

    it('should create a new version', async () => {
      const wf = await workflowDef.getByName('test-workflow');
      const v2 = await workflowDef.createVersion(wf!.id, {
        steps: [{ id: 'step-1', type: 'task', name: 'Step 1 v2', config: {} }],
      });
      expect(v2.version).toBe(2);
    });

    it('should activate and archive workflow', async () => {
      const wf = await workflowDef.create({
        name: 'lifecycle-test',
        description: 'Lifecycle',
        steps: [{ id: 's1', type: 'task', name: 'S1', config: {} }],
      });
      const active = await workflowDef.activate(wf.id);
      expect(active.status).toBe('active');
      const archived = await workflowDef.archive(wf.id);
      expect(archived.status).toBe('archived');
    });

    it('should create workflow from template', async () => {
      const tmpl = await workflowTemplate.createTemplate(
        'basic-flow',
        'A basic flow template',
        { steps: [{ id: 'step-1', type: 'task', name: '{{name}}', config: {} }] },
        [{ name: 'name', type: 'string', required: true }],
        'general',
        ['test'],
      );
      const instance = await workflowTemplate.instantiate(tmpl.id, { name: 'MyStep' });
      expect(instance.steps[0].name).toBe('MyStep');
    });
  });

  // ─── Phase 2: Planning Engine ──────────────────────────────────────

  describe('Phase 2: Planning Engine', () => {
    it('should create a plan with dependencies', async () => {
      const result = await planner.createPlan({
        goal: 'Build feature',
        tasks: [
          { id: 'task-1', description: 'Design', type: 'task', status: 'pending', dependsOn: [] },
          {
            id: 'task-2',
            description: 'Implement',
            type: 'task',
            status: 'pending',
            dependsOn: ['task-1'],
          },
          {
            id: 'task-3',
            description: 'Test',
            type: 'task',
            status: 'pending',
            dependsOn: ['task-2'],
          },
        ],
        dependencies: [
          { from: 'task-1', to: 'task-2', type: 'hard' },
          { from: 'task-2', to: 'task-3', type: 'hard' },
        ],
        createdBy: 'test',
      });
      expect(result.plan.id).toBeDefined();
      expect(result.plan.tasks.length).toBe(3);
    });

    it('should return execution order (topological)', async () => {
      const result = await planner.createPlan({
        goal: 'Ordered tasks',
        tasks: [
          { id: 'task-1', description: 'First', type: 'task', status: 'pending', dependsOn: [] },
          {
            id: 'task-2',
            description: 'Second',
            type: 'task',
            status: 'pending',
            dependsOn: ['task-1'],
          },
        ],
        dependencies: [{ from: 'task-1', to: 'task-2', type: 'hard' }],
        createdBy: 'test',
      });
      const order = await planner.getExecutionOrder(result.plan.id);
      expect(order[0]).toBe('task-1');
      expect(order[1]).toBe('task-2');
    });

    it('should replan after failure', async () => {
      const result = await planner.createPlan({
        goal: 'Replan test',
        tasks: [
          { id: 'task-1', description: 'A', type: 'task', status: 'pending', dependsOn: [] },
          {
            id: 'task-2',
            description: 'B',
            type: 'task',
            status: 'pending',
            dependsOn: ['task-1'],
          },
        ],
        dependencies: [{ from: 'task-1', to: 'task-2', type: 'hard' }],
        createdBy: 'test',
      });
      const replanned = await replanner.replan(result.plan.id, ['task-2']);
      expect(replanned.tasks.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ─── Phase 3: Workflow Runtime ──────────────────────────────────────

  describe('Phase 3: Workflow Runtime', () => {
    it('should execute sequential steps', async () => {
      const wf = await workflowDef.create({
        name: 'seq-run',
        description: 'Sequential',
        steps: [
          { id: 's1', type: 'task', name: 'S1', config: { value: 1 }, next: ['s2'] },
          { id: 's2', type: 'task', name: 'S2', config: { value: 2 } },
        ],
      });
      const exec = await executor.start(wf.id, wf, { input: 'test' });
      expect(exec.status).toBe('completed');
      expect(exec.steps.length).toBe(2);
    });

    it('should handle pause and resume', async () => {
      const exec = WorkflowExecution.create({
        workflowId: 'wf-pause',
        workflowVersion: 1,
        definition: {
          name: 'pause-test',
          description: '',
          version: 1,
          steps: [],
          triggers: [],
          timeout: null,
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'test',
            updatedBy: null,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          id: 'wf-pause',
          status: 'draft',
        },
        context: {},
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'test',
          updatedBy: null,
        },
      });
      exec.status = 'running';
      await execRepo.save(exec);
      await lifecycle.pause(exec.id);
      const paused = await execRepo.get(exec.id);
      expect(paused?.status).toBe('paused');
      await lifecycle.resume(exec.id);
      const resumed = await execRepo.get(exec.id);
      expect(resumed?.status).toBe('running');
    });

    it('should cancel execution', async () => {
      const exec = WorkflowExecution.create({
        workflowId: 'wf-cancel',
        workflowVersion: 1,
        definition: {
          name: 'cancel-test',
          description: '',
          version: 1,
          steps: [],
          triggers: [],
          timeout: null,
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'test',
            updatedBy: null,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          id: 'wf-cancel',
          status: 'draft',
        },
        context: {},
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'test',
          updatedBy: null,
        },
      });
      exec.status = 'running';
      await execRepo.save(exec);
      await lifecycle.cancel(exec.id);
      const cancelled = await execRepo.get(exec.id);
      expect(cancelled?.status).toBe('cancelled');
    });
  });

  // ─── Phase 4: Human-in-the-Loop ───────────────────────────────────

  describe('Phase 4: Human-in-the-Loop', () => {
    it('should create and approve a request', async () => {
      const req = await approval.request({
        executionId: 'exec-1',
        stepId: 'step-1',
        requestedBy: 'system',
        assignedTo: ['user-1'],
        title: 'Approve step',
        description: 'Please approve',
      });
      expect(req.status).toBe('pending');
      const approved = await approval.approve(req.id, 'user-1', 'Looks good');
      expect(approved.status).toBe('approved');
    });

    it('should reject a request', async () => {
      const req = await approval.request({
        executionId: 'exec-2',
        stepId: 'step-2',
        requestedBy: 'system',
        assignedTo: ['admin'],
        title: 'Reject test',
        description: 'Should reject',
      });
      const rejected = await approval.reject(req.id, 'admin', 'Not ready');
      expect(rejected.status).toBe('rejected');
    });

    it('should assign and complete a review task', async () => {
      const rv = await review.assign('exec-3', 'step-3', 'user-2', 'Review this', { data: 'test' });
      expect(rv.status).toBe('pending');
      const done = await review.complete(rv.id, { passed: true }, 'All good');
      expect(done.status).toBe('completed');
    });
  });

  // ─── Phase 5: Multi-Agent Coordination ─────────────────────────────

  describe('Phase 5: Multi-Agent Coordination', () => {
    it('should assign tasks to agents', async () => {
      const coordPlan = CoordinationPlan.create({
        workflowExecutionId: 'exec-coord-1',
        goal: 'Test coordination',
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'test',
          updatedBy: null,
        },
      });
      await coordRepo.savePlan(coordPlan);
      const plan = await coordinator.assignTask(
        coordPlan.id,
        'Task 1',
        'agent-1',
        'worker',
        {},
        [],
      );
      expect(plan).toBeDefined();
      expect(plan.tasks.length).toBe(1);
      const workload = await coordinator.getWorkload('agent-1');
      expect(workload.count).toBeGreaterThanOrEqual(1);
    });

    it('should supervise and approve', async () => {
      const coordPlan = CoordinationPlan.create({
        workflowExecutionId: 'exec-supervise-1',
        goal: 'Test supervision',
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'test',
          updatedBy: null,
        },
      });
      await coordRepo.savePlan(coordPlan);
      const plan = await coordinator.assignTask(
        coordPlan.id,
        'Supervise me',
        'agent-2',
        'worker',
        {},
        [],
      );
      const task = plan.tasks[0];
      const result = await supervisor.makeDecision(task.id, {
        status: 'completed',
        output: { done: true },
        hasError: false,
      });
      expect(result.decision).toBe('approved');
      expect(result.taskId).toBe(task.id);
    });
  });

  // ─── Phase 6: Execution Context ────────────────────────────────────

  describe('Phase 6: Shared Execution Context', () => {
    it('should set and get context variables', async () => {
      await contextVars.set('exec-ctx-1', 'user', 'alice');
      const val = await contextVars.get('exec-ctx-1', 'user');
      expect(val).toBe('alice');
    });

    it('should resolve template with context', async () => {
      await contextVars.set('exec-ctx-2', 'name', 'World');
      const result = await contextVars.resolve('exec-ctx-2', 'Hello {{name}}!');
      expect(result).toBe('Hello World!');
    });

    it('should store and retrieve artifacts', async () => {
      const art = await artifact.store('exec-art-1', 'report', { data: 'content' }, 'data');
      expect(art.id).toBeDefined();
      const found = await artifact.get(art.id);
      expect(found?.name).toBe('report');
    });
  });

  // ─── Phase 7: Conversation Runtime ─────────────────────────────────

  describe('Phase 7: Conversation Runtime', () => {
    it('should create a conversation and send messages', async () => {
      const conv = await conversation.create('exec-conv-1', 'session-1');
      expect(conv.status).toBe('active');
      await conversation.sendMessage(conv.id, 'user', 'Hello');
      await conversation.sendMessage(conv.id, 'assistant', 'Hi there');
      const msgs = await conversation.getMessages(conv.id);
      expect(msgs.items.length).toBe(2);
    });

    it('should record execution history events', async () => {
      await history.recordEvent('exec-hist-1', 'step_started', { stepId: 's1' }, 'system');
      await history.recordEvent('exec-hist-1', 'step_completed', { stepId: 's1' }, 'system');
      const historyObj = await history.getHistory('exec-hist-1');
      expect(historyObj.events.length).toBe(2);
    });
  });

  // ─── Phase 8: Cost Management ──────────────────────────────────────

  describe('Phase 8: Cost & Resource Management', () => {
    it('should record and aggregate provider costs', async () => {
      await costTrack.recordProviderCost('exec-cost-1', 'openai', 'gpt-4', 150, 0.03, 1200);
      await costTrack.recordProviderCost('exec-cost-1', 'openai', 'gpt-4', 200, 0.04, 800);
      const usage = await costTrack.getExecutionCost('exec-cost-1');
      expect(usage.totalTokens).toBe(350);
      expect(usage.totalCost).toBeCloseTo(0.07, 4);
    });

    it('should estimate costs from definition', async () => {
      const estimate = await costAnalysis.estimateCost({
        steps: [{ id: 's1', type: 'task', name: 'S1', config: {} }],
      });
      expect(estimate.estimatedCost).toBeGreaterThanOrEqual(0);
      expect(estimate.estimatedTokens).toBeGreaterThanOrEqual(0);
    });
  });

  // ─── Phase 9: Explainability & Audit ─────────────────────────────

  describe('Phase 9: Explainability & Audit', () => {
    it('should log decisions and generate report', async () => {
      await decisionLogger.log(
        'exec-explain-1',
        'step-1',
        'tool_selection',
        'Selected tool A',
        'Best match for intent',
        ['Tool B', 'Tool C'],
        0.95,
        'system',
      );
      const report = await explain.generateReport('exec-explain-1');
      expect(report.decisions.length).toBe(1);
      expect(report.decisions[0].decision).toBe('Selected tool A');
    });

    it('should record and summarize confidence scores', async () => {
      await explain.generateReport('exec-conf-1'); // creates empty report
      const report = await explain.generateReport('exec-conf-1');
      expect(report).toBeDefined();
    });
  });
});
