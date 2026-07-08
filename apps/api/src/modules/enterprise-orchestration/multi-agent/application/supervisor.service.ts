import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import type { ICoordinationRepository } from '../domain/coordination-repository.interface.js';

export type SupervisionDecision = 'approved' | 'rejected' | 'rerequest';

export interface SupervisionDecisionResult {
  taskId: string;
  decision: SupervisionDecision;
  feedback: string | null;
  confidence: number;
}

export interface SupervisionStatus {
  planId: string;
  totalTasks: number;
  supervised: number;
  approved: number;
  rejected: number;
  rerequested: number;
  pending: number;
}

@Injectable()
export class SupervisorService {
  private readonly logger = new Logger(SupervisorService.name);
  private readonly decisions = new Map<string, SupervisionDecisionResult[]>();

  constructor(
    @Inject('ICoordinationRepository')
    private readonly repository: ICoordinationRepository,
  ) {}

  async supervise(planId: string): Promise<SupervisionDecisionResult[]> {
    const plan = await this.repository.getPlan(planId);
    if (!plan) {
      throw new NotFoundException(`Plan ${planId} not found`);
    }

    const results: SupervisionDecisionResult[] = [];
    const completedTasks = plan.tasks.filter(t => t.status === 'completed' || t.status === 'failed');

    for (const task of completedTasks) {
      const decision = await this.makeDecision(task.id, {
        status: task.status,
        output: task.output,
        hasError: task.status === 'failed',
      });

      results.push(decision);
      this.logger.log(
        `Supervised task ${task.id}: ${decision.decision} (confidence: ${decision.confidence})`,
      );
    }

    this.decisions.set(planId, results);
    return results;
  }

  async makeDecision(
    taskId: string,
    result: { status: string; output?: unknown; hasError?: boolean },
  ): Promise<SupervisionDecisionResult> {
    const task = await this.repository.updateTask(taskId, { status: 'running' });
    if (!task) {
      throw new NotFoundException(`Task ${taskId} not found`);
    }

    let decision: SupervisionDecision;
    let feedback: string | null = null;
    let confidence: number;

    if (result.hasError) {
      decision = 'rejected';
      feedback = `Task failed with status: ${result.status}`;
      confidence = 0.9;
      await this.repository.updateTask(taskId, { status: 'failed' });
    } else if (result.output && typeof result.output === 'object' && Object.keys(result.output as Record<string, unknown>).length > 0) {
      decision = 'approved';
      confidence = 0.85;
      await this.repository.updateTask(taskId, { status: 'completed' });
    } else {
      decision = 'rerequest';
      feedback = 'Output is empty or invalid, please re-execute';
      confidence = 0.6;
      await this.repository.updateTask(taskId, { status: 'pending' });
    }

    this.logger.log(`Decision for task ${taskId}: ${decision} (confidence: ${confidence})`);

    return { taskId, decision, feedback, confidence };
  }

  async getSupervisionStatus(planId: string): Promise<SupervisionStatus> {
    const plan = await this.repository.getPlan(planId);
    if (!plan) {
      throw new NotFoundException(`Plan ${planId} not found`);
    }

    const planDecisions = this.decisions.get(planId) ?? [];
    const totalTasks = plan.tasks.length;
    const supervised = planDecisions.length;
    const approved = planDecisions.filter(d => d.decision === 'approved').length;
    const rejected = planDecisions.filter(d => d.decision === 'rejected').length;
    const rerequested = planDecisions.filter(d => d.decision === 'rerequest').length;
    const pending = totalTasks - supervised;

    return {
      planId,
      totalTasks,
      supervised,
      approved,
      rejected,
      rerequested,
      pending,
    };
  }
}