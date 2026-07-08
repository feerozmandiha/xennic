export class InputValue {
  private constructor(
    public readonly name: string,
    public readonly value: unknown,
    public readonly unit: string | null,
  ) {}

  static create(name: string, value: unknown, unit?: string | null): InputValue {
    return new InputValue(name, value, unit ?? null);
  }

  static fromJson(json: { name: string; value: unknown; unit?: string | null }): InputValue {
    return new InputValue(json.name, json.value, json.unit ?? null);
  }

  toJson(): Record<string, unknown> {
    return { name: this.name, value: this.value, unit: this.unit };
  }
}
