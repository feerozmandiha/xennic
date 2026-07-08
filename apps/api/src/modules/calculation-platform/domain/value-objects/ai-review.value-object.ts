export interface AiReviewSuggestion {
  type: 'explanation' | 'warning' | 'recommendation' | 'alternative' | 'error_analysis';
  message: string;
  confidence?: number;
}

export class AiReview {
  private constructor(
    public readonly provider: string,
    public readonly model: string | null,
    public readonly confidence: number,
    public readonly explanation: string | null,
    public readonly suggestions: readonly AiReviewSuggestion[],
    public readonly raw: Record<string, unknown> | null,
    public readonly durationMs: number,
  ) {}

  static create(data: {
    provider: string;
    model?: string | null;
    confidence: number;
    explanation?: string | null;
    suggestions?: AiReviewSuggestion[];
    raw?: Record<string, unknown> | null;
    durationMs: number;
  }): AiReview {
    return new AiReview(
      data.provider,
      data.model ?? null,
      data.confidence,
      data.explanation ?? null,
      Object.freeze([...(data.suggestions ?? [])]),
      data.raw ?? null,
      data.durationMs,
    );
  }

  toJson(): Record<string, unknown> {
    return {
      provider: this.provider,
      model: this.model,
      confidence: this.confidence,
      explanation: this.explanation,
      suggestions: [...this.suggestions],
      raw: this.raw,
      durationMs: this.durationMs,
    };
  }
}
