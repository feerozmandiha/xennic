import { Injectable, Logger, Inject } from '@nestjs/common';
import { DecisionLog, type DecisionType } from '../domain/decision-log.entity.js';
import type {
  IExplainabilityRepository,
  FindDecisionOptions,
} from '../domain/explainability-repository.interface.js';

export interface FullReport {
  executionId: string;
  decisions: DecisionLog[];
  total: number;
}

@Injectable()
export class DecisionLoggerService {
  private readonly logger = new Logger(DecisionLoggerService.name);

  constructor(
    @Inject('IExplainabilityRepository')
    private readonly repository: IExplainabilityRepository,
  ) {}

  async log(
    executionId: string,
    stepId: string,
    type: DecisionType,
    decision: string,
    rationale: string,
    alternatives?: string[],
    confidence?: number | null,
    actor?: string | null,
  ): Promise<DecisionLog> {
    const entity = DecisionLog.create({
      workflowExecutionId: executionId,
      stepId,
      decisionType: type,
      decision,
      rationale,
      alternatives,
      confidence,
      actor,
    });

    await this.repository.saveDecision(entity);
    this.logger.log(`Decision logged: ${type} for execution ${executionId} step ${stepId}`);
    return entity;
  }

  async getLog(
    executionId: string,
    options?: FindDecisionOptions,
  ): Promise<{ items: DecisionLog[]; total: number; offset: number; limit: number }> {
    return this.repository.getDecisions(executionId, options);
  }

  async getDecisionsByType(executionId: string, type: DecisionType): Promise<DecisionLog[]> {
    return this.repository.getDecisionsByType(executionId, type);
  }

  async getFullReport(executionId: string): Promise<FullReport> {
    const result = await this.repository.getDecisions(executionId);
    return {
      executionId,
      decisions: result.items,
      total: result.total,
    };
  }
}
