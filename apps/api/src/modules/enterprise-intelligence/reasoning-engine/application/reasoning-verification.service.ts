import { Injectable, Logger } from '@nestjs/common';
import { VerificationResult } from '../domain/verification-result.vo.js';

@Injectable()
export class ReasoningVerificationService {
  private readonly logger = new Logger(ReasoningVerificationService.name);
  private readonly verifications = new Map<string, VerificationResult[]>();

  async verify(
    stepId: string,
    result: Record<string, unknown>,
    expected?: Record<string, unknown>,
  ): Promise<VerificationResult> {
    const errors: string[] = [];
    const details: Record<string, unknown> = {};

    if (result.error) {
      errors.push(String(result.error));
    }

    if (expected) {
      const comparison = this.compareResults(result, expected);
      errors.push(...comparison.errors);
      details.comparison = comparison;
    }

    const confidence = this.computeConfidence(result, errors);
    const verified = errors.length === 0;

    const vr = VerificationResult.create(stepId, verified, confidence, errors, details);

    const existing = this.verifications.get(stepId) ?? [];
    existing.push(vr);
    this.verifications.set(stepId, existing);

    this.logger.debug(`Verification for step ${stepId}: verified=${verified}, confidence=${confidence}`);
    return vr;
  }

  async calculateConfidence(verifications: VerificationResult[]): Promise<number> {
    if (verifications.length === 0) return 1;

    const avgConfidence = verifications.reduce((sum, v) => sum + v.confidence, 0) / verifications.length;

    const verifiedCount = verifications.filter(v => v.verified).length;
    const successRate = verifiedCount / verifications.length;

    return avgConfidence * 0.6 + successRate * 0.4;
  }

  compareResults(
    actual: Record<string, unknown>,
    expected: Record<string, unknown>,
  ): { match: boolean; errors: string[]; similarity: number } {
    const errors: string[] = [];
    const allKeys = new Set([...Object.keys(actual), ...Object.keys(expected)]);
    let matchedKeys = 0;

    for (const key of allKeys) {
      if (!(key in actual)) {
        errors.push(`Missing key: ${key}`);
        continue;
      }
      if (!(key in expected)) {
        errors.push(`Unexpected key: ${key}`);
        continue;
      }

      const aVal = actual[key];
      const eVal = expected[key];

      if (typeof aVal === 'object' && typeof eVal === 'object' && aVal !== null && eVal !== null) {
        const nested = this.compareResults(
          aVal as Record<string, unknown>,
          eVal as Record<string, unknown>,
        );
        errors.push(...nested.errors.map(e => `${key}.${e}`));
        if (nested.match) matchedKeys++;
      } else if (aVal === eVal) {
        matchedKeys++;
      } else if (String(aVal) === String(eVal)) {
        matchedKeys++;
      } else {
        errors.push(`Mismatch for ${key}: expected ${JSON.stringify(eVal)}, got ${JSON.stringify(aVal)}`);
      }
    }

    const similarity = allKeys.size > 0 ? matchedKeys / allKeys.size : 1;

    return {
      match: errors.length === 0,
      errors,
      similarity,
    };
  }

  getVerificationsForStep(stepId: string): VerificationResult[] {
    return this.verifications.get(stepId) ?? [];
  }

  private computeConfidence(
    result: Record<string, unknown>,
    errors: string[],
  ): number {
    let confidence = 1;

    if (errors.length > 0) {
      confidence -= errors.length * 0.2;
    }

    if (result.data === undefined || result.data === null) {
      confidence -= 0.1;
    }

    if (result.error) {
      confidence -= 0.3;
    }

    return Math.max(0, Math.min(1, confidence));
  }
}
