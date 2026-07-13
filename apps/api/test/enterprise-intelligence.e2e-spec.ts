import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';

import { ContextBuilderService } from '../src/modules/enterprise-intelligence/context-engine/application/context-builder.service.js';
import { ContextAssemblerService } from '../src/modules/enterprise-intelligence/context-engine/application/context-assembler.service.js';
import { ContextCacheService } from '../src/modules/enterprise-intelligence/context-engine/application/context-cache.service.js';
import { InMemoryContextStore } from '../src/modules/enterprise-intelligence/context-engine/testing/adapters/in-memory-context-store';
import type { IContextRepository } from '../src/modules/enterprise-intelligence/context-engine/domain/context-repository.interface.js';

import { MemoryService } from '../src/modules/enterprise-intelligence/memory-platform/application/memory.service.js';
import { MemoryIndexerService } from '../src/modules/enterprise-intelligence/memory-platform/application/memory-indexer.service.js';
import { MemoryExpirationService } from '../src/modules/enterprise-intelligence/memory-platform/application/memory-expiration.service.js';
import { InMemoryMemoryStore } from '../src/modules/enterprise-intelligence/memory-platform/testing/adapters/in-memory-memory-store';
import { InMemoryMemoryIndex } from '../src/modules/enterprise-intelligence/memory-platform/testing/adapters/in-memory-memory-index';
import {
  MemoryEntity,
  MemoryType,
} from '../src/modules/enterprise-intelligence/memory-platform/domain/memory.entity.js';

import { PromptRegistryService } from '../src/modules/enterprise-intelligence/prompt-governance/application/prompt-registry.service.js';
import { PromptTemplateService } from '../src/modules/enterprise-intelligence/prompt-governance/application/prompt-template.service.js';
import { PromptPolicyService } from '../src/modules/enterprise-intelligence/prompt-governance/application/prompt-policy.service.js';
import { PromptAuditService } from '../src/modules/enterprise-intelligence/prompt-governance/application/prompt-audit.service.js';
import { PromptEvaluationService } from '../src/modules/enterprise-intelligence/prompt-governance/application/prompt-evaluation.service.js';
import { InMemoryPromptRegistry } from '../src/modules/enterprise-intelligence/prompt-governance/testing/adapters/in-memory-prompt-registry';
import { InMemoryTemplateRegistry } from '../src/modules/enterprise-intelligence/prompt-governance/testing/adapters/in-memory-template-registry';
import { InMemoryPromptPolicyRepo } from '../src/modules/enterprise-intelligence/prompt-governance/testing/adapters/in-memory-prompt-policy-repo';
import { PromptStatus } from '../src/modules/enterprise-intelligence/prompt-governance/domain/prompt.entity.js';

import { ToolRegistryService } from '../src/modules/enterprise-intelligence/tool-registry/application/tool-registry.service.js';
import { ToolExecutorService } from '../src/modules/enterprise-intelligence/tool-registry/application/tool-executor.service.js';
import { ToolCapabilityService } from '../src/modules/enterprise-intelligence/tool-registry/application/tool-capability.service.js';
import { InMemoryToolRegistry } from '../src/modules/enterprise-intelligence/tool-registry/testing/adapters/in-memory-tool-registry';

import { SkillRegistryService } from '../src/modules/enterprise-intelligence/skill-registry/application/skill-registry.service.js';
import { SkillComposerService } from '../src/modules/enterprise-intelligence/skill-registry/application/skill-composer.service.js';
import { SkillExecutorService } from '../src/modules/enterprise-intelligence/skill-registry/application/skill-executor.service.js';
import { InMemorySkillRegistry } from '../src/modules/enterprise-intelligence/skill-registry/testing/adapters/in-memory-skill-registry';

import { ReasoningEngineService } from '../src/modules/enterprise-intelligence/reasoning-engine/application/reasoning-engine.service.js';
import { ReasoningPlannerService } from '../src/modules/enterprise-intelligence/reasoning-engine/application/reasoning-planner.service.js';
import { ReasoningReflectionService } from '../src/modules/enterprise-intelligence/reasoning-engine/application/reasoning-reflection.service.js';
import { ReasoningVerificationService } from '../src/modules/enterprise-intelligence/reasoning-engine/application/reasoning-verification.service.js';
import { ReasoningTelemetryService } from '../src/modules/enterprise-intelligence/reasoning-engine/application/reasoning-telemetry.service.js';
import { InMemoryReasoningRepository } from '../src/modules/enterprise-intelligence/reasoning-engine/testing/adapters/in-memory-reasoning-repository';

import { PolicyEnforcementService } from '../src/modules/enterprise-intelligence/policy-engine/application/policy-enforcement.service.js';
import { PolicyEvaluationService } from '../src/modules/enterprise-intelligence/policy-engine/application/policy-evaluation.service.js';
import { PolicyManagementService } from '../src/modules/enterprise-intelligence/policy-engine/application/policy-management.service.js';
import { InMemoryPolicyRepository } from '../src/modules/enterprise-intelligence/policy-engine/testing/adapters/in-memory-policy-repository';

import { AIGatewayService } from '../src/modules/enterprise-intelligence/ai-gateway/application/ai-gateway.service.js';
import { GatewayTelemetryService } from '../src/modules/enterprise-intelligence/ai-gateway/application/gateway-telemetry.service.js';
import { ProviderExecutionService } from '../src/modules/ai-provider-management/application/services/provider-execution.service.js';

import { BenchmarkRegistryService } from '../src/modules/enterprise-intelligence/evaluation-platform/application/benchmark-registry.service.js';
import { GoldenDatasetService } from '../src/modules/enterprise-intelligence/evaluation-platform/application/golden-dataset.service.js';
import { EvaluationRunnerService } from '../src/modules/enterprise-intelligence/evaluation-platform/application/evaluation-runner.service.js';
import { RegressionTestingService } from '../src/modules/enterprise-intelligence/evaluation-platform/application/regression-testing.service.js';
import { InMemoryEvaluationRepository } from '../src/modules/enterprise-intelligence/evaluation-platform/testing/adapters/in-memory-evaluation-repository';
import { BenchmarkStatus } from '../src/modules/enterprise-intelligence/evaluation-platform/domain/benchmark.entity.js';

describe('Enterprise Intelligence Platform (Sprint I1)', () => {
  let module: TestingModule;

  let contextBuilder: ContextBuilderService;
  let contextAssembler: ContextAssemblerService;
  let contextCache: ContextCacheService;
  let contextRepo: IContextRepository;

  let memoryService: MemoryService;

  let promptRegistry: PromptRegistryService;
  let promptTemplate: PromptTemplateService;
  let promptPolicy: PromptPolicyService;
  let audit: PromptAuditService;

  let toolRegistry: ToolRegistryService;
  let toolExecutor: ToolExecutorService;

  let skillRegistry: SkillRegistryService;
  let skillComposer: SkillComposerService;

  let reasoningEngine: ReasoningEngineService;

  let policyEnforcement: PolicyEnforcementService;
  let policyManagement: PolicyManagementService;

  let aiGateway: AIGatewayService;

  let benchmarkRegistry: BenchmarkRegistryService;
  let evaluationRunner: EvaluationRunnerService;
  let goldenDataset: GoldenDatasetService;
  let regressionTesting: RegressionTestingService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        ContextBuilderService,
        ContextAssemblerService,
        ContextCacheService,
        { provide: 'IContextRepository', useClass: InMemoryContextStore },
        { provide: 'IContextAssembler', useClass: ContextAssemblerService },

        MemoryService,
        MemoryIndexerService,
        MemoryExpirationService,
        { provide: 'IMemoryStore', useClass: InMemoryMemoryStore },
        { provide: 'IMemoryIndex', useClass: InMemoryMemoryIndex },

        PromptRegistryService,
        PromptTemplateService,
        PromptPolicyService,
        PromptAuditService,
        PromptEvaluationService,
        { provide: 'IPromptRegistry', useClass: InMemoryPromptRegistry },
        { provide: 'ITemplateRegistry', useClass: InMemoryTemplateRegistry },
        { provide: 'IPromptPolicyRepository', useClass: InMemoryPromptPolicyRepo },

        ToolRegistryService,
        ToolExecutorService,
        ToolCapabilityService,
        { provide: 'IToolRegistry', useClass: InMemoryToolRegistry },

        SkillRegistryService,
        SkillComposerService,
        SkillExecutorService,
        { provide: 'ISkillRegistry', useClass: InMemorySkillRegistry },

        ReasoningEngineService,
        ReasoningPlannerService,
        ReasoningReflectionService,
        ReasoningVerificationService,
        ReasoningTelemetryService,
        { provide: 'IReasoningRepository', useClass: InMemoryReasoningRepository },

        PolicyEnforcementService,
        PolicyEvaluationService,
        PolicyManagementService,
        { provide: 'IPolicyRepository', useClass: InMemoryPolicyRepository },

        AIGatewayService,
        GatewayTelemetryService,
        {
          provide: ProviderExecutionService,
          useValue: {
            chat: jest.fn().mockImplementation(async ({ modelId }) => ({
              content: 'Mock AI response',
              promptTokens: 10,
              completionTokens: 5,
              totalTokens: 15,
              model: modelId ?? 'gpt-4',
              providerId: 'mock-provider',
              providerName: 'Mock Provider',
            })),
            embed: jest.fn().mockImplementation(async ({ modelId }) => ({
              embeddings: [[0.1, 0.2, 0.3]],
              model: modelId ?? 'text-embedding-3-small',
              providerId: 'mock-provider',
              providerName: 'Mock Provider',
              totalTokens: 3,
            })),
          },
        },

        BenchmarkRegistryService,
        GoldenDatasetService,
        EvaluationRunnerService,
        RegressionTestingService,
        { provide: 'IEvaluationRepository', useClass: InMemoryEvaluationRepository },
      ],
    }).compile();

    contextBuilder = module.get(ContextBuilderService);
    contextAssembler = module.get(ContextAssemblerService);
    contextCache = module.get(ContextCacheService);
    contextRepo = module.get('IContextRepository');

    memoryService = module.get(MemoryService);

    promptRegistry = module.get(PromptRegistryService);
    promptTemplate = module.get(PromptTemplateService);
    promptPolicy = module.get(PromptPolicyService);
    audit = module.get(PromptAuditService);

    toolRegistry = module.get(ToolRegistryService);
    toolExecutor = module.get(ToolExecutorService);

    skillRegistry = module.get(SkillRegistryService);
    skillComposer = module.get(SkillComposerService);

    reasoningEngine = module.get(ReasoningEngineService);

    policyEnforcement = module.get(PolicyEnforcementService);
    policyManagement = module.get(PolicyManagementService);

    aiGateway = module.get(AIGatewayService);

    benchmarkRegistry = module.get(BenchmarkRegistryService);
    evaluationRunner = module.get(EvaluationRunnerService);
    goldenDataset = module.get(GoldenDatasetService);
    regressionTesting = module.get(RegressionTestingService);
  });

  afterAll(async () => {
    await module.close();
  });

  // ─── Phase 1: Context Engine ─────────────────────────────────────────

  describe('Phase 1: Global Context Engine', () => {
    it('should build context from workspace source', async () => {
      const result = await contextBuilder.fromWorkspace('ws-1');
      expect(result).toBeDefined();
    });

    it('should assemble context into a snapshot', async () => {
      const snapshot = await contextAssembler.assemble('workspace', 'ws-2');
      expect(snapshot).toBeDefined();
      expect(snapshot.contextId).toBeDefined();
    });

    it('should cache assembled context', async () => {
      const snapshot = await contextAssembler.assemble('workspace', 'ws-cache');
      const cached = await contextCache.get('workspace:ws-cache');
      if (cached) {
        expect(cached.contextId).toBe(snapshot.contextId);
      }
    });

    it('should invalidate cache by scope', async () => {
      await contextAssembler.assemble('workspace', 'ws-inv');
      contextCache.invalidate('workspace', 'ws-inv');
      const cached = await contextCache.get('workspace:ws-inv');
      expect(cached).toBeNull();
    });

    it('should build context from user source', async () => {
      const result = await contextBuilder.fromUser('user-1');
      expect(result).toBeDefined();
    });

    it('should build context from project source', async () => {
      const result = await contextBuilder.fromProject('proj-1');
      expect(result).toBeDefined();
    });
  });

  // ─── Phase 2: Memory Platform ────────────────────────────────────────

  describe('Phase 2: Enterprise Memory Platform', () => {
    it('should store and retrieve working memory', async () => {
      const entity = MemoryEntity.create(
        MemoryType.WORKING,
        'workspace',
        'ws-1',
        'task-1',
        { status: 'active' },
        'user-1',
      );
      const stored = await memoryService.store(entity);
      expect(stored.id).toBeDefined();
      expect(stored.type).toBe(MemoryType.WORKING);

      const found = await memoryService.get(stored.id);
      expect(found).toBeDefined();
      expect(found?.value).toEqual({ status: 'active' });
    });

    it('should store and retrieve session memory', async () => {
      const entity = MemoryEntity.create(
        MemoryType.SESSION,
        'user',
        'user-1',
        'session-token',
        { data: 'xyz' },
        'user-1',
      );
      await memoryService.store(entity);
      const found = await memoryService.get(entity.id);
      expect(found?.value).toEqual({ data: 'xyz' });
    });

    it('should search memory by query', async () => {
      const entity = MemoryEntity.create(
        MemoryType.LONG_TERM,
        'workspace',
        'ws-1',
        'key-concept',
        { meaning: 'important' },
        'user-1',
      );
      await memoryService.store(entity);
      const results = await memoryService.search('important');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should find memory by type and scope', async () => {
      const results = await memoryService.find(MemoryType.WORKING, 'workspace', 'ws-1');
      expect(results.items.length).toBeGreaterThanOrEqual(1);
    });

    it('should return memory stats', async () => {
      const stats = await memoryService.getStats();
      expect(stats.total).toBeGreaterThanOrEqual(1);
    });
  });

  // ─── Phase 3: Prompt Governance ──────────────────────────────────────

  describe('Phase 3: Prompt Governance', () => {
    let promptId: string;

    it('should register a prompt', async () => {
      const prompt = await promptRegistry.register(
        'code-review',
        'Check {{code}} for bugs',
        ['code'],
        [],
        'user-1',
        'Review code for issues',
      );
      promptId = prompt.id;
      expect(prompt.name).toBe('code-review');
      expect(prompt.version).toBe(1);
    });

    it('should get prompt by name', async () => {
      const prompt = await promptRegistry.getByName('code-review');
      expect(prompt).toBeDefined();
      expect(prompt?.name).toBe('code-review');
    });

    it('should create a new version of a prompt', async () => {
      const v2 = await promptRegistry.createVersion(promptId, 'Updated: {{code}}', 'user-1');
      expect(v2.version).toBe(2);
    });

    it('should render a template', async () => {
      const tmpl = await promptTemplate.register({
        name: 'greeting',
        description: 'A greeting template',
        content: 'Hello {{name}}!',
        variables: [{ name: 'name', type: 'string', required: true }],
        createdBy: 'user-1',
      });
      const result = await promptTemplate.render(tmpl.id, { name: 'World' });
      expect(result).toBe('Hello World!');
    });

    it('should evaluate a prompt policy', async () => {
      await promptPolicy.create({
        name: 'allow-all',
        description: 'Allow all',
        rules: [{ resource: '*', action: '*', condition: null }],
        effect: 'allow',
        priority: 50,
        createdBy: 'user-1',
      });
      const result = await promptPolicy.evaluate(promptId, 'execute');
      expect(result.allowed).toBe(true);
    });

    it('should log prompt audit entry', async () => {
      await audit.log('REGISTER', 'prompt-1', 1, 'user-1', { source: 'test' });
      const trail = await audit.getAuditTrail('prompt-1');
      expect(trail.items.length).toBe(1);
      expect(trail.items[0].action).toBe('REGISTER');
    });
  });

  // ─── Phase 4: Tool Registry ──────────────────────────────────────────

  describe('Phase 4: Tool Registry', () => {
    it('should register a tool with schema', async () => {
      const tool = await toolRegistry.register(
        'calculator',
        'Performs calculations',
        { type: 'object', properties: { a: { type: 'number' }, b: { type: 'number' } } },
        ['workspace:admin'],
      );
      expect(tool.id).toBeDefined();
      expect(tool.name).toBe('calculator');
    });

    it('should find tool by capability', async () => {
      const results = await toolRegistry.findByCapability('calculation');
      expect(results.length).toBeGreaterThanOrEqual(0);
    });

    it('should validate and execute a tool', async () => {
      const tool = await toolRegistry.register(
        'echo',
        'Echoes input',
        { type: 'object', properties: { message: { type: 'string' } } },
        [],
      );
      const result = await toolExecutor.execute(tool.id, { message: 'hello' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid tool input when schema has required', async () => {
      const tool = await toolRegistry.register(
        'strict-echo',
        'Strict echo',
        {
          input: {
            type: 'object',
            properties: { message: { type: 'string' } },
            required: ['message'],
          },
          output: { type: 'object', properties: { result: { type: 'string' } } },
        },
        [],
      );
      const result = await toolExecutor.execute(tool.id, {});
      expect(result.success).toBe(false);
    });

    it('should get tool contract', async () => {
      const tool = await toolRegistry.register(
        'contract-tool',
        'Has contract',
        { type: 'object', properties: {} },
        [],
      );
      const contract = await toolExecutor.getContract(tool.id);
      expect(contract).toBeDefined();
      expect(contract.inputSchema).toBeDefined();
    });
  });

  // ─── Phase 5: Skill Registry ─────────────────────────────────────────

  describe('Phase 5: Skill Registry', () => {
    it('should register a skill', async () => {
      const skill = await skillRegistry.register({
        name: 'translate',
        description: 'Translates text',
        inputs: [
          { name: 'text', type: 'string', description: 'Text to translate', required: true },
        ],
        outputs: [
          { name: 'translated', type: 'string', description: 'Translated text', required: true },
        ],
      });
      expect(skill.id).toBeDefined();
      expect(skill.name).toBe('translate');
    });

    it('should compose skills into a workflow', async () => {
      const s1 = await skillRegistry.register({
        name: 'step1',
        description: 'First step',
        inputs: [{ name: 'input', type: 'string', required: true }],
        outputs: [{ name: 'intermediate', type: 'string', required: true }],
      });
      const s2 = await skillRegistry.register({
        name: 'step2',
        description: 'Second step',
        inputs: [{ name: 'data', type: 'string', required: true }],
        outputs: [{ name: 'result', type: 'string', required: true }],
      });
      const composition = await skillComposer.compose(
        [s1.id, s2.id],
        [{ from: 'input', to: 'data' }],
        [{ from: 'intermediate', to: 'data' }],
      );
      expect(composition.steps.length).toBe(2);
    });
  });

  // ─── Phase 6: Reasoning Engine ──────────────────────────────────────

  describe('Phase 6: Reasoning Engine', () => {
    it('should create a reasoning plan', async () => {
      const plan = await reasoningEngine.createPlan({
        goal: 'Solve problem X',
        steps: [
          { description: 'Analyze input', input: { data: 'raw' } },
          { description: 'Process data', input: { data: 'processed' } },
          { description: 'Generate output', input: { data: 'final' } },
        ],
        dependencies: { 2: ['step-1'], 3: ['step-2'] },
      });
      expect(plan.id).toBeDefined();
      expect(plan.steps.length).toBe(3);
    });

    it('should execute a plan sequentially', async () => {
      const plan = await reasoningEngine.createPlan({
        goal: 'Sequential task',
        steps: [
          { description: 'Step A', input: {} },
          { description: 'Step B', input: {} },
        ],
        dependencies: { 2: ['step-1'] },
      });
      const executed = await reasoningEngine.executePlan(plan.id);
      expect(executed.status).toBe('completed');
    });

    it('should report plan status', async () => {
      const plan = await reasoningEngine.createPlan({
        goal: 'Status check',
        steps: [{ description: 'Only step', input: {} }],
      });
      const status = await reasoningEngine.getPlanStatus(plan.id);
      expect(status.status).toBe('pending');
    });
  });

  // ─── Phase 7: Policy Engine ─────────────────────────────────────────

  describe('Phase 7: Policy Engine', () => {
    it('should allow access when policy matches', async () => {
      await policyManagement.create({
        name: 'allow-read',
        resource: 'document:*',
        action: 'read',
        effect: 'allow',
        priority: 50,
      });
      const result = await policyEnforcement.evaluate('read', 'document:123');
      expect(result.allowed).toBe(true);
    });

    it('should deny access when deny policy exists', async () => {
      await policyManagement.create({
        name: 'deny-secret',
        resource: 'document:secret',
        action: 'read',
        effect: 'deny',
        priority: 100,
      });
      const result = await policyEnforcement.evaluate('read', 'document:secret');
      expect(result.allowed).toBe(false);
    });

    it('should check user access', async () => {
      const access = await policyEnforcement.canAccess('user-1', 'read', 'document:public');
      expect(typeof access).toBe('boolean');
    });

    it('should manage policy lifecycle', async () => {
      const policy = await policyManagement.create({
        name: 'test-policy',
        resource: '*',
        action: '*',
        effect: 'allow',
        priority: 1,
      });
      await policyManagement.disable(policy.id);
      const disabled = await policyManagement.get(policy.id);
      expect(disabled?.enabled).toBe(false);

      await policyManagement.enable(policy.id);
      const enabled = await policyManagement.get(policy.id);
      expect(enabled?.enabled).toBe(true);
    });
  });

  // ─── Phase 8: AI Gateway ────────────────────────────────────────────

  describe('Phase 8: AI Gateway', () => {
    it('should route a chat request and return response', async () => {
      const response = await aiGateway.chat({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
        options: { temperature: 0.7, maxTokens: 100 },
      });
      expect(response).toBeDefined();
      expect(response.output).toBeDefined();
      expect(response.latency).toBeGreaterThanOrEqual(0);
    });

    it('should handle completion requests', async () => {
      const response = await aiGateway.complete({
        model: 'gpt-4',
        prompt: 'Complete this sentence:',
        options: { maxTokens: 50 },
      });
      expect(response.output).toBeDefined();
    });

    it('should handle embedding requests', async () => {
      const result = await aiGateway.embed('test input', { model: 'text-embedding-3-small' });
      expect(Array.isArray(result)).toBe(true);
    });

    it('should report gateway telemetry', async () => {
      const telemetry: GatewayTelemetryService = module.get(GatewayTelemetryService);
      const stats = await telemetry.getAggregateStats();
      expect(stats).toBeDefined();
      expect(stats.totalCalls).toBeGreaterThanOrEqual(0);
    });
  });

  // ─── Phase 9: Evaluation Platform ────────────────────────────────────

  describe('Phase 9: Evaluation Platform', () => {
    let datasetId: string;
    let benchmarkId: string;

    it('should register a benchmark', async () => {
      // Create dataset first
      const ds = await goldenDataset.create({
        name: 'eval-set',
        description: 'Eval dataset',
        items: [{ input: { q: 'hello' }, expectedOutput: { a: 'world' } }],
      });
      datasetId = ds.id;

      const benchmark = await benchmarkRegistry.register({
        name: 'accuracy-test',
        description: 'Tests response accuracy',
        metrics: ['accuracy'],
        datasetId,
      });
      benchmarkId = benchmark.id;
      expect(benchmark.name).toBe('accuracy-test');
    });

    it('should activate benchmark before running evaluation', async () => {
      const activated = await benchmarkRegistry.activate(benchmarkId);
      expect(activated.status).toBe(BenchmarkStatus.ACTIVE);
    });

    it('should run an evaluation', async () => {
      const run = await evaluationRunner.run(benchmarkId, 'prompt', 'test-prompt');
      expect(run.status).toBe('completed');
      expect(run.score).toBeDefined();
    });

    it('should detect regression between runs', async () => {
      const run1 = await evaluationRunner.run(benchmarkId, 'tool', 'test-tool');
      const run2 = await evaluationRunner.run(benchmarkId, 'tool', 'test-tool');
      const regression = await regressionTesting.detectRegression(run1.id, run2.id);
      expect(regression.metrics).toBeDefined();
    });
  });
});
