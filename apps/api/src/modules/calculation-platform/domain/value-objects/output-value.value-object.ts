export class OutputValue {
  private constructor(
    public readonly name: string,
    public readonly value: unknown,
    public readonly unit: string | null,
    public readonly label: string | null,
  ) {}

  static create(
    name: string,
    value: unknown,
    unit?: string | null,
    label?: string | null,
  ): OutputValue {
    return new OutputValue(name, value, unit ?? null, label ?? null);
  }

  static fromJson(json: {
    name: string;
    value: unknown;
    unit?: string | null;
    label?: string | null;
  }): OutputValue {
    return new OutputValue(json.name, json.value, json.unit ?? null, json.label ?? null);
  }

  toJson(): Record<string, unknown> {
    return { name: this.name, value: this.value, unit: this.unit, label: this.label };
  }
}
