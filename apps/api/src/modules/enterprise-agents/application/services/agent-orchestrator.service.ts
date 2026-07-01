import { Injectable, Inject, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { IAgentRegistry } from '../../domain/interfaces/agent-registry.interface.js';
import type { IToolExecutor } from '../../domain/interfaces/tool-executor.interface.js';
import type { IMultiAgentOrchestrator } from '../../domain/interfaces/multi-agent-orchestrator.interface.js';
import type { IAgentMemory } from '../../domain/interfaces/agent-memory.interface.js';
import type { IAgentSafety } from '../../domain/interfaces/agent-safety.interface.js';
import type { AgentQuery, AgentResponse, AgentMetrics, AgentStepResult, ToolExecutionRequest } from '../../domain/types/agent.types.js';
import { MemoryType } from '../../domain/types/agent.types.js';

@Injectable()
export class AgentOrchestratorService {
  private readonly logger = new Logger(AgentOrchestratorService.name);

  constructor(
    @Inject('IAgentRegistry') private readonly registry: IAgentRegistry,
    @Inject('IToolExecutor') private readonly toolExecutor: IToolExecutor,
    @Inject('IMultiAgentOrchestrator') private readonly multiAgent: IMultiAgentOrchestrator,
    @Inject('IAgentMemory') private readonly memory: IAgentMemory,
    @Inject('IAgentSafety') private readonly safety: IAgentSafety,
  ) {}

  async execute(query: AgentQuery): Promise<AgentResponse> {
    const startTime = Date.now();
    const steps: AgentStepResult[] = [];
    const sessionId = query.sessionId ?? randomUUID();

    try {
      const agent = this.registry.get(query.agentSlug);
      if (!agent) {
        return { success: false, error: `Agent '${query.agentSlug}' not found` };
      }

      let session = this.memory.getSession(sessionId);
      if (!session) {
        session = this.memory.createSession(agent.id, agent.slug, query.workspaceId);
      }

      const relevantMemory = query.options?.includeMemory !== false
        ? this.memory.retrieve(sessionId)
        : [];

      if (relevantMemory.length > 0) {
        steps.push({
          stepId: randomUUID(), type: 'memory-retrieval',
          description: `Retrieved ${relevantMemory.length} memory entries`,
          output: { memoryCount: relevantMemory.length, types: [...new Set(relevantMemory.map((e) => e.type))] },
          duration: 0,
        });
      }

      const isComplex = this.isComplexQuery(query.query, agent.capabilities.length);
      let stepResults: AgentStepResult[] = [];
      let toolResults: import('../../domain/types/agent.types.js').ToolExecutionResult[] = [];

      if (isComplex && agent.capabilities.length > 1) {
        const firstCapType = agent.capabilities[0]!.type;
        const agents = this.registry.findByCapability(firstCapType);
        const relatedAgents = agents.length > 0 ? agents : [agent];

        const plan = this.multiAgent.createPlan(query, relatedAgents);

        steps.push({
          stepId: randomUUID(), type: 'multi-agent-plan',
          description: `Created plan with ${plan.tasks.length} tasks (${plan.executionStrategy})`,
          output: { planId: plan.planId, taskCount: plan.tasks.length },
          duration: 0,
        });

        const result = await this.multiAgent.executePlan(plan);
        stepResults = result.stepResults;
        toolResults = result.toolsUsed;
      } else {
        for (const toolConfig of agent.toolsConfig) {
          const request: ToolExecutionRequest = {
            toolId: toolConfig.toolId, agentId: agent.id, sessionId, workspaceId: query.workspaceId,
            input: { ...query.context, query: query.query, ...this.extractToolInput(query.query, toolConfig) },
          };
          const result = await this.toolExecutor.execute(request);
          toolResults.push(result);

          stepResults.push({
            stepId: randomUUID(), type: `tool:${toolConfig.toolId}`,
            description: `Executed ${toolConfig.name}`,
            output: result.output, duration: result.executionTimeMs,
          });
        }
      }

      steps.push(...stepResults);

      const responseText = this.buildResponse(query.query, agent, toolResults, stepResults);

      const safetyResult = this.safety.validate({
        agentId: agent.id, agentSlug: agent.slug,
        input: query.query, output: responseText,
        context: { ...query.context, sessionId, stepCount: steps.length },
        toolsUsed: toolResults.filter((t) => t.success).map((t) => t.toolId),
      });

      this.memory.store(sessionId, {
        sessionId, agentId: agent.id, type: MemoryType.CONVERSATION,
        content: { input: query.query, output: responseText }, metadata: { toolsUsed: toolResults.length, steps: steps.length },
      });

      for (const tr of toolResults.filter((t) => t.success)) {
        this.memory.store(sessionId, {
          sessionId, agentId: agent.id, type: MemoryType.CALCULATION,
          content: tr, metadata: { toolId: tr.toolId },
        });
      }

      const metrics: AgentMetrics = {
        totalTimeMs: Date.now() - startTime, stepsExecuted: steps.length,
        toolsCalled: toolResults.length, memoryRetrieved: relevantMemory.length,
        safetyScore: safetyResult.score,
      };

      this.logger.debug(`Agent ${agent.slug} executed in ${metrics.totalTimeMs}ms, ${metrics.stepsExecuted} steps`);

      return {
        success: true,
        data: {
          response: responseText, agentSlug: agent.slug, agentName: agent.name, sessionId,
          steps: steps.length > 0 ? steps : undefined,
          toolsUsed: toolResults.length > 0 ? toolResults : undefined,
          memoryUsed: relevantMemory.length > 0 ? relevantMemory : undefined,
          safetyCheck: safetyResult,
          metrics,
        },
      };
    } catch (error) {
      this.logger.error(`Agent execution failed: ${(error as Error).message}`);
      return {
        success: false, error: `Agent execution failed: ${(error as Error).message}`,
      };
    }
  }

  private isComplexQuery(query: string, capabilityCount: number): boolean {
    const complexIndicators = ['compare', 'versus', 'vs', 'difference between', 'all', 'every',
      'comprehensive', 'complete', 'full analysis', 'multiple', 'several', 'and also'];
    const ql = query.toLowerCase();
    const matches = complexIndicators.filter((ind) => ql.includes(ind));
    return matches.length >= 2 || (capabilityCount > 1 && query.length > 200);
  }

  private extractToolInput(query: string, toolConfig: import('../../domain/types/agent.types.js').ToolConfig): Record<string, unknown> {
    const input: Record<string, unknown> = {};
    const schema = toolConfig.inputSchema;
    const required = (schema['required'] as string[]) ?? [];

    for (const field of required) {
      const match = query.match(new RegExp(`(${field})\\s*[:=]\\s*(\\d+\\.?\\d*|\\w+)`, 'i'));
      if (match) {
        const val = match[2];
        input[field] = isNaN(Number(val)) ? val : Number(val);
      }
    }

    return input;
  }

  private buildResponse(
    query: string, agent: import('../../domain/types/agent.types.js').AgentDefinition,
    toolResults: import('../../domain/types/agent.types.js').ToolExecutionResult[],
    stepResults: AgentStepResult[],
  ): string {
    const lines: string[] = [
      `## ${agent.name} Response`,
      '',
      `**Agent:** ${agent.name} (${agent.slug})`,
      `**Query:** ${query}`,
      '',
    ];

    if (toolResults.length > 0) {
      lines.push('### Tools Used');
      for (const tr of toolResults) {
        lines.push(`- **${tr.toolName}**: ${tr.success ? '✅ Success' : '❌ Failed'} (${tr.executionTimeMs}ms)`);
        if (tr.success && Object.keys(tr.output).length > 0) {
          for (const [key, val] of Object.entries(tr.output)) {
            lines.push(`  - ${key}: ${JSON.stringify(val)}`);
          }
        }
        if (tr.error) lines.push(`  - Error: ${tr.error}`);
      }
      lines.push('');
    }

    if (stepResults.length > 0) {
      lines.push('### Execution Steps');
      for (const step of stepResults) {
        lines.push(`- ${step.type}: ${step.description} (${step.duration}ms)`);
      }
      lines.push('');
    }

    const successfulTools = toolResults.filter((t) => t.success);
    const summary = successfulTools.length > 0
      ? `Analysis complete. ${successfulTools.length} tools executed successfully.`
      : 'Analysis completed. Review the results above for details.';

    lines.push('### Summary');
    lines.push(summary);
    lines.push('');

    if (agent.slug === 'electrical-engineer') {
      lines.push('**Standards referenced:** IEC 60364, IEC 60076, IEEE 80, IEEE 519');
    } else if (agent.slug === 'solar-consultant') {
      lines.push('**Standards referenced:** IEC 61724, IEC 62446');
    } else if (agent.slug === 'protection-engineer') {
      lines.push('**Standards referenced:** IEC 60947, IEEE 1584, IEC 60909');
    } else if (agent.slug === 'power-quality') {
      lines.push('**Standards referenced:** IEEE 519-2022, IEC 61000');
    }

    return lines.join('\n');
  }
}
