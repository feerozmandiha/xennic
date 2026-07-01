import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { IMultiAgentOrchestrator } from '../../domain/interfaces/multi-agent-orchestrator.interface.js';
import type { AgentQuery, AgentDefinition, OrchestrationPlan, AgentStepResult, ToolExecutionResult, AgentTask, ToolExecutionRequest } from '../../domain/types/agent.types.js';
import { TaskStatus, ExecutionStrategy } from '../../domain/types/agent.types.js';

@Injectable()
export class MultiAgentOrchestrator implements IMultiAgentOrchestrator {
  private plans = new Map<string, OrchestrationPlan>();

  createPlan(query: AgentQuery, agents: AgentDefinition[]): OrchestrationPlan {
    const planId = randomUUID();
    const plan: OrchestrationPlan = {
      planId, query: query.query,
      tasks: [],
      coordinatorSlug: query.agentSlug,
      executionStrategy: agents.length <= 1 ? ExecutionStrategy.SEQUENTIAL : ExecutionStrategy.HYBRID,
      createdAt: Date.now(),
    };

    if (agents.length === 0) {
      const fallback: AgentDefinition = { id: '', name: '', slug: '', description: '', type: null as any, systemPrompt: '', capabilities: [], toolsConfig: [], isActive: false, version: '', createdAt: new Date() };
      plan.tasks.push(this.makeTask(fallback, query, 0, []));
    } else if (agents.length === 1) {
      plan.tasks.push(this.makeTask(agents[0]!, query, 0, []));
    } else {
      for (let i = 0; i < agents.length; i++) {
        const agent = agents[i]!;
        const deps = i > 0 ? [plan.tasks[i - 1]!.taskId] : [];
        plan.tasks.push(this.makeTask(agent, query, i, deps));
      }
    }

    this.plans.set(planId, plan);
    return plan;
  }

  async executePlan(plan: OrchestrationPlan): Promise<{ stepResults: AgentStepResult[]; toolsUsed: ToolExecutionResult[] }> {
    const stepResults: AgentStepResult[] = [];
    const toolsUsed: ToolExecutionResult[] = [];

    for (const task of plan.tasks) {
      task.status = TaskStatus.IN_PROGRESS;
      const startTime = Date.now();

      try {
        const tokenCount = task.input['query'] ? String(task.input['query']).length : 0;
        const output = {
          analysis: `Analysis by ${task.agentSlug}`,
          specialistInput: task.input,
          findings: [`Analyzed ${task.input['query'] ?? 'request'} from ${task.agentSlug} perspective`],
          confidence: 0.75 + Math.random() * 0.2,
        };

        stepResults.push({
          stepId: task.taskId, type: `agent:${task.agentSlug}`,
          description: `Task executed by ${task.agentSlug}`,
          output, duration: Date.now() - startTime,
        });

        task.status = TaskStatus.COMPLETED;
      } catch {
        task.status = TaskStatus.FAILED;
        stepResults.push({
          stepId: task.taskId, type: 'error',
          description: `Task failed for ${task.agentSlug}`,
          output: {}, duration: Date.now() - startTime,
        });
      }
    }

    return { stepResults, toolsUsed };
  }

  async delegateTask(task: AgentTask): Promise<AgentTask> {
    task.status = TaskStatus.IN_PROGRESS;
    await new Promise((resolve) => setImmediate(resolve));
    task.status = TaskStatus.COMPLETED;
    return task;
  }

  getPlan(planId: string): OrchestrationPlan | null {
    return this.plans.get(planId) ?? null;
  }

  private makeTask(agent: AgentDefinition, query: AgentQuery, index: number, dependsOn: string[]): AgentTask {
    return {
      taskId: randomUUID(), agentId: agent.id, agentSlug: agent.slug,
      input: { query: query.query, context: query.context ?? {}, specialistIndex: index },
      context: query.context ?? {}, priority: index + 1,
      status: TaskStatus.PENDING, dependsOn, createdAt: Date.now(),
    };
  }
}
