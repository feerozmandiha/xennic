import { randomUUID } from 'node:crypto';

export interface ConfidenceFactor {
  name: string;
  weight: number;
  value: number;
  description: string;
}

export interface ConfidenceScoreOptions {
  executionId: string;
  stepId: string;
  score: number;
  factors: ConfidenceFactor[];
}

export interface ConfidenceScoreReconstituteOptions {
  id: string;
  executionId: string;
  stepId: string;
  score: number;
  factors: ConfidenceFactor[];
  timestamp: Date;
}

export class ConfidenceScore {
  public readonly id: string;
  public readonly executionId: string;
  public readonly stepId: string;
  public readonly score: number;
  public readonly factors: ConfidenceFactor[];
  public readonly timestamp: Date;

  private constructor(
    id: string,
    executionId: string,
    stepId: string,
    score: number,
    factors: ConfidenceFactor[],
    timestamp: Date,
  ) {
    this.id = id;
    this.executionId = executionId;
    this.stepId = stepId;
    this.score = score;
    this.factors = factors;
    this.timestamp = timestamp;
  }

  static create(opts: ConfidenceScoreOptions): ConfidenceScore {
    if (opts.score < 0 || opts.score > 1) {
      throw new Error('Confidence score must be between 0 and 1');
    }

    return new ConfidenceScore(
      randomUUID(),
      opts.executionId,
      opts.stepId,
      opts.score,
      opts.factors,
      new Date(),
    );
  }

  static reconstitute(opts: ConfidenceScoreReconstituteOptions): ConfidenceScore {
    return new ConfidenceScore(
      opts.id,
      opts.executionId,
      opts.stepId,
      opts.score,
      opts.factors,
      opts.timestamp,
    );
  }
}
