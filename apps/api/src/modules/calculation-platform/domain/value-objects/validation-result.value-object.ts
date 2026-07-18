export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code: string;
}

export class ValidationResult {
  private constructor(
    public readonly valid: boolean,
    public readonly errors: readonly ValidationError[],
    public readonly warnings: readonly ValidationError[],
    public readonly info: readonly ValidationError[],
  ) {}

  static create(
    errors: ValidationError[],
    warnings?: ValidationError[],
    info?: ValidationError[],
  ): ValidationResult {
    const errs = errors.filter((e) => e.severity === 'error');
    const warns = [...(warnings ?? []), ...errors.filter((e) => e.severity === 'warning')];
    const infos = [...(info ?? []), ...errors.filter((e) => e.severity === 'info')];
    return new ValidationResult(
      errs.length === 0,
      Object.freeze(errs),
      Object.freeze(warns),
      Object.freeze(infos),
    );
  }

  static success(): ValidationResult {
    return new ValidationResult(true, Object.freeze([]), Object.freeze([]), Object.freeze([]));
  }

  hasErrors(): boolean {
    return !this.valid;
  }
  hasWarnings(): boolean {
    return this.warnings.length > 0;
  }

  getAll(): ValidationError[] {
    return [...this.errors, ...this.warnings, ...this.info];
  }
}
