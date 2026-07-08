import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IReasoningRepository } from '../domain/reasoning-repository.interface.js';
import { ReflectionResult } from '../domain/reflection-result.vo.js';

interface AggregateInsight {
  totalReflections: number;
  averageScore: number;
  commonObservations: string[];
  topSuggestions: string[];
  scoreDistribution: { low: number; medium: number; high: number };
}

@Injectable()
export class ReasoningReflectionService {
  private readonly logger = new Logger(ReasoningReflectionService.name);
  private readonly reflections = new Map<string, ReflectionResult[]>();

  constructor(
    @Inject('IReasoningRepository') private readonly repo: IReasoningRepository,
  ) {}

  async reflect(stepId: string, result: Record<string, unknown>): Promise<ReflectionResult> {
    const observations = this.generateObservations(result);
    const score = this.calculateScore(observations);
    const suggestions = this.generateSuggestions(observations, result);

    const reflection = ReflectionResult.create(stepId, observations, score, suggestions);

    const existing = this.reflections.get(stepId) ?? [];
    existing.push(reflection);
    this.reflections.set(stepId, existing);

    this.logger.debug(`Reflection for step ${stepId}: score=${score}, observations=${observations.length}`);
    return reflection;
  }

  async analyze(reflections: ReflectionResult[]): Promise<AggregateInsight> {
    if (reflections.length === 0) {
      return {
        totalReflections: 0,
        averageScore: 0,
        commonObservations: [],
        topSuggestions: [],
        scoreDistribution: { low: 0, medium: 0, high: 0 },
      };
    }

    const totalScore = reflections.reduce((sum, r) => sum + r.score, 0);
    const averageScore = totalScore / reflections.length;

    const obsCount = new Map<string, number>();
    for (const r of reflections) {
      for (const obs of r.observations) {
        obsCount.set(obs, (obsCount.get(obs) ?? 0) + 1);
      }
    }
    const commonObservations = Array.from(obsCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([obs]) => obs);

    const suggestionCount = new Map<string, number>();
    for (const r of reflections) {
      for (const sug of r.suggestions) {
        suggestionCount.set(sug, (suggestionCount.get(sug) ?? 0) + 1);
      }
    }
    const topSuggestions = Array.from(suggestionCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([sug]) => sug);

    const scoreDistribution = {
      low: reflections.filter(r => r.score < 0.4).length,
      medium: reflections.filter(r => r.score >= 0.4 && r.score < 0.7).length,
      high: reflections.filter(r => r.score >= 0.7).length,
    };

    return {
      totalReflections: reflections.length,
      averageScore,
      commonObservations,
      topSuggestions,
      scoreDistribution,
    };
  }

  async getSuggestions(planId: string): Promise<string[]> {
    const plan = await this.repo.getPlan(planId);
    if (!plan) {
      return [];
    }

    const allSuggestions: string[] = [];
    for (const step of plan.steps) {
      const stepReflections = this.reflections.get(step.id) ?? [];
      for (const r of stepReflections) {
        allSuggestions.push(...r.suggestions);
      }
    }

    return [...new Set(allSuggestions)];
  }

  getReflectionsForStep(stepId: string): ReflectionResult[] {
    return this.reflections.get(stepId) ?? [];
  }

  private generateObservations(result: Record<string, unknown>): string[] {
    const observations: string[] = [];

    if (result.executed === true) {
      observations.push('Step executed successfully');
    }

    if (result.timestamp) {
      observations.push(`Execution timestamp: ${result.timestamp}`);
    }

    if (result.data) {
      observations.push(`Output data available with ${typeof result.data === 'object' ? Object.keys(result.data as Record<string, unknown>).length : 1} field(s)`);
    }

    if (result.error) {
      observations.push(`Execution encountered error: ${result.error}`);
    }

    if (observations.length === 0) {
      observations.push('Step completed with no observable side effects');
    }

    return observations;
  }

  private calculateScore(observations: string[]): number {
    const positive = observations.filter(o =>
      o.includes('successfully') || o.includes('available') || o.includes('completed'),
    ).length;
    const negative = observations.filter(o =>
      o.includes('error') || o.includes('warning') || o.includes('failed'),
    ).length;

    if (observations.length === 0) return 0.5;
    const raw = (positive - negative + observations.length) / (2 * observations.length);
    return Math.max(0, Math.min(1, raw));
  }

  private generateSuggestions(observations: string[], result: Record<string, unknown>): string[] {
    const suggestions: string[] = [];

    if (result.error) {
      suggestions.push('Add error handling for this step type');
      suggestions.push('Consider adding retry logic');
    }

    if (observations.length <= 1) {
      suggestions.push('Add more detailed logging to improve observability');
    }

    if (!result.data && !result.error && result.executed !== true) {
      suggestions.push('Ensure step produces output or explicit success signal');
    }

    return suggestions;
  }
}
