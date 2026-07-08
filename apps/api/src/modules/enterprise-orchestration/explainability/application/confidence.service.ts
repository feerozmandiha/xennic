import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfidenceScore, type ConfidenceFactor } from '../domain/confidence-score.vo.js';
import type { IExplainabilityRepository, ConfidenceSummary } from '../domain/explainability-repository.interface.js';

@Injectable()
export class ConfidenceService {
  private readonly logger = new Logger(ConfidenceService.name);

  constructor(
    @Inject('IExplainabilityRepository')
    private readonly repository: IExplainabilityRepository,
  ) {}

  async recordConfidence(
    executionId: string,
    stepId: string,
    score: number,
    factors: ConfidenceFactor[],
  ): Promise<ConfidenceScore> {
    const entity = ConfidenceScore.create({
      executionId,
      stepId,
      score,
      factors,
    });

    await this.repository.saveConfidence(entity);
    this.logger.log(`Confidence recorded: ${score} for execution ${executionId} step ${stepId}`);
    return entity;
  }

  async getConfidence(executionId: string): Promise<ConfidenceScore[]> {
    return this.repository.getConfidenceScores(executionId);
  }

  async getConfidenceSummary(executionId: string): Promise<ConfidenceSummary> {
    return this.repository.getConfidenceSummary(executionId);
  }

  async getLowConfidenceSteps(
    executionId: string,
    threshold: number,
  ): Promise<{ stepId: string; score: number; factors: ConfidenceFactor[] }[]> {
    const scores = await this.repository.getConfidenceScores(executionId);
    return scores
      .filter(s => s.score < threshold)
      .map(s => ({
        stepId: s.stepId,
        score: s.score,
        factors: s.factors,
      }));
  }
}
