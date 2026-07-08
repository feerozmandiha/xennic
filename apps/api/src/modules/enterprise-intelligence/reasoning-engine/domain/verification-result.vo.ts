import { randomUUID } from 'node:crypto';

export class VerificationResult {
  public readonly id: string;
  public readonly stepId: string;
  public readonly verified: boolean;
  public readonly confidence: number;
  public readonly errors: string[];
  public readonly details: Record<string, unknown>;
  public readonly timestamp: Date;

  private constructor(
    id: string,
    stepId: string,
    verified: boolean,
    confidence: number,
    errors: string[],
    details: Record<string, unknown>,
    timestamp: Date,
  ) {
    this.id = id;
    this.stepId = stepId;
    this.verified = verified;
    this.confidence = confidence;
    this.errors = errors;
    this.details = details;
    this.timestamp = timestamp;
  }

  static create(
    stepId: string,
    verified: boolean,
    confidence: number,
    errors: string[] = [],
    details: Record<string, unknown> = {},
  ): VerificationResult {
    return new VerificationResult(
      randomUUID(),
      stepId,
      verified,
      Math.max(0, Math.min(1, confidence)),
      errors,
      details,
      new Date(),
    );
  }
}
