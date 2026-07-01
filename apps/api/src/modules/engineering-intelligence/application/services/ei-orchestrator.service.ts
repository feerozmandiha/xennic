import { Injectable, Inject, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { IReasoningKernel } from '../../domain/interfaces/reasoning-kernel.interface.js';
import type { IEngineeringPlanner } from '../../domain/interfaces/engineering-planner.interface.js';
import type { IWorkflowEngine } from '../../domain/interfaces/workflow-engine.interface.js';
import type { IToolRegistry } from '../../domain/interfaces/tool-registry.interface.js';
import type { ICalcOrchestrator } from '../../domain/interfaces/calc-orchestrator.interface.js';
import type { IKnowledgeGraphService } from '../../domain/interfaces/knowledge-graph.interface.js';
import type { IDecisionEngine } from '../../domain/interfaces/decision-engine.interface.js';
import type { IReportGenerator } from '../../domain/interfaces/report-generator.interface.js';
import type { IEngineeringMemory } from '../../domain/interfaces/engineering-memory.interface.js';
import type { IAuditEngine } from '../../domain/interfaces/audit-engine.interface.js';
import type { IntelligenceQuery, IntelligenceResponse, ReasoningGoal, Constraint, ReasoningStep } from '../../domain/types/ei.types.js';

@Injectable()
export class EiOrchestratorService {
  private readonly logger = new Logger(EiOrchestratorService.name);

  constructor(
    @Inject('IReasoningKernel') private readonly kernel: IReasoningKernel,
    @Inject('IEngineeringPlanner') private readonly planner: IEngineeringPlanner,
    @Inject('IWorkflowEngine') private readonly workflow: IWorkflowEngine,
    @Inject('IToolRegistry') private readonly toolRegistry: IToolRegistry,
    @Inject('ICalcOrchestrator') private readonly calcOrchestrator: ICalcOrchestrator,
    @Inject('IKnowledgeGraphService') private readonly kg: IKnowledgeGraphService,
    @Inject('IDecisionEngine') private readonly decisionEngine: IDecisionEngine,
    @Inject('IReportGenerator') private readonly reportGenerator: IReportGenerator,
    @Inject('IEngineeringMemory') private readonly memory: IEngineeringMemory,
    @Inject('IAuditEngine') private readonly audit: IAuditEngine,
  ) {}

  async execute(query: IntelligenceQuery): Promise<IntelligenceResponse> {
    const traceId = randomUUID();
    const executionId = randomUUID();
    const startTime = Date.now();

    try {
      // 1. Create audit record
      await this.audit.create(executionId, traceId);

      // 2. Create memory session
      const session = await this.memory.createSession(randomUUID(), executionId, { query: query.goal });

      // 3. Build reasoning goal
      const goal: ReasoningGoal = {
        id: randomUUID(), description: query.goal, type: query.goalType,
        constraints: query.constraints ?? [], evidence: [],
      };

      // 4. Decompose into reasoning steps
      const steps = await this.kernel.decompose(goal);
      for (const step of steps) {
        await this.audit.logStep(executionId, step);
      }

      // 5. Create execution plan
      const plan = await this.planner.createPlan(goal);
      await this.workflow.start(plan, session.sessionId);

      // 6. Execute each step
      const executedSteps: ReasoningStep[] = [];
      for (const step of steps) {
        const executed = await this.kernel.execute(step, { goal, constraints: goal.constraints });
        executedSteps.push(executed);
        await this.audit.logStep(executionId, executed);
        await this.memory.updateStep(session.sessionId, executed.id, { nodeId: executed.id, status: 'completed', retryCount: 0, output: executed.output });
      }

      // 7. Generate decision
      const decision = await this.decisionEngine.make({
        title: `Engineering Decision: ${query.goal}`,
        description: `Decision based on ${executedSteps.length} reasoning steps`,
        inputs: { goal: query.goal, constraints: query.constraints },
        evidence: executedSteps.flatMap((s) => s.evidence),
        appliedStandards: [],
        reasoningSteps: executedSteps,
        calculations: [],
        alternatives: [
          { id: randomUUID(), description: 'Recommended approach', pros: ['Based on evidence'], cons: [], score: 0.85 },
          { id: randomUUID(), description: 'Alternative approach', pros: ['Simpler'], cons: ['Less accurate'], score: 0.6 },
        ],
      });
      await this.audit.logDecision(executionId, decision);

      // 8. Generate report if requested
      let report = undefined;
      if (query.options?.includeReport) {
        report = await this.reportGenerator.generate({
          title: `Engineering Analysis: ${query.goal}`,
          format: query.options?.format ?? 'markdown',
          traceId,
          sections: [
            { type: 'executive-summary', title: 'Executive Summary', content: decision.finalDecision },
            { type: 'analysis', title: 'Engineering Analysis', content: `Analysis of ${query.goal}` },
            { type: 'evidence', title: 'Evidence', content: executedSteps.map((s) => `${s.type}: ${JSON.stringify(s.output)}`).join('\n') },
            { type: 'decision', title: 'Decision', content: decision.finalDecision, data: { confidence: decision.confidence } },
          ],
        });
      }

      // 9. Finalize audit
      const workflowExec = await this.workflow.getStatus(executionId);
      const audit = await this.audit.finalize(executionId, workflowExec, 'passed');

      const totalDuration = Date.now() - startTime;
      this.logger.debug(`EI execution ${executionId} completed in ${totalDuration}ms`);

      return {
        executionId, traceId,
        decisions: [decision],
        report,
        audit,
        metrics: {
          totalDuration, stepCount: executedSteps.length, calculationCount: 0,
          evidenceCount: executedSteps.reduce((s, step) => s + step.evidence.length, 0),
          confidence: decision.confidence,
        },
      };
    } catch (error) {
      this.logger.error(`EI execution ${executionId} failed: ${(error as Error).message}`);
      const workflowExec = await this.workflow.getStatus(executionId).catch(() => ({ id: executionId, planId: '', status: 'failed' as const, nodes: [], checkpoint: null, version: 0, startTime: 0 }));
      const audit = await this.audit.finalize(executionId, workflowExec as any, 'failed').catch(() => null);
      return {
        executionId, traceId, decisions: [], audit: audit ?? {} as any,
        metrics: { totalDuration: Date.now() - startTime, stepCount: 0, calculationCount: 0, evidenceCount: 0, confidence: 0 },
      };
    }
  }
}
