export class ConfidenceScore {
  private constructor(public readonly value: number) {
    if (value < 0 || value > 1) {
      throw new Error(`Confidence score must be between 0 and 1, got ${value}`);
    }
  }

  static create(value: number): ConfidenceScore {
    return new ConfidenceScore(Math.max(0, Math.min(1, value)));
  }

  static low(): ConfidenceScore { return new ConfidenceScore(0.3); }
  static medium(): ConfidenceScore { return new ConfidenceScore(0.6); }
  static high(): ConfidenceScore { return new ConfidenceScore(0.9); }

  get level(): 'low' | 'medium' | 'high' {
    if (this.value >= 0.8) return 'high';
    if (this.value >= 0.5) return 'medium';
    return 'low';
  }

  toNumber(): number { return this.value; }
}
