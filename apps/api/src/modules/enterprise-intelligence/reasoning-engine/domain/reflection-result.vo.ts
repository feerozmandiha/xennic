import { randomUUID } from 'node:crypto';

export class ReflectionResult {
  public readonly id: string;
  public readonly stepId: string;
  public readonly observations: string[];
  public readonly score: number;
  public readonly suggestions: string[];
  public readonly timestamp: Date;

  private constructor(
    id: string,
    stepId: string,
    observations: string[],
    score: number,
    suggestions: string[],
    timestamp: Date,
  ) {
    this.id = id;
    this.stepId = stepId;
    this.observations = observations;
    this.score = score;
    this.suggestions = suggestions;
    this.timestamp = timestamp;
  }

  static create(
    stepId: string,
    observations: string[],
    score: number,
    suggestions: string[] = [],
  ): ReflectionResult {
    return new ReflectionResult(
      randomUUID(),
      stepId,
      observations,
      Math.max(0, Math.min(1, score)),
      suggestions,
      new Date(),
    );
  }
}
