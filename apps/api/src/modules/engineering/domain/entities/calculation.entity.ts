/**
 * Calculation Aggregate Root
 *
 * هر محاسبه مهندسی که از طریق Gateway اجرا می‌شود
 * در این Entity ذخیره می‌شود.
 */
export class CalculationEntity {
  private constructor(
    public readonly id: string,
    public readonly workspaceId: string,
    public readonly projectId: string | null,
    public readonly userId: string,
    public readonly type: string,          // e.g. "BASIC-001", "CABLE-002"
    public readonly version: string,       // formula version از Python service
    public readonly inputs: Record<string, unknown>,
    public readonly results: Record<string, unknown>,
    public readonly engineVersion: string,
    public readonly standardVersion: string,
    public readonly durationMs: number,    // زمان اجرای محاسبه
    public readonly createdAt: Date,
  ) {}

  static create(data: {
    workspaceId: string;
    projectId?: string | null;
    userId: string;
    type: string;
    version: string;
    inputs: Record<string, unknown>;
    results: Record<string, unknown>;
    engineVersion: string;
    standardVersion: string;
    durationMs: number;
  }): CalculationEntity {
    return new CalculationEntity(
      crypto.randomUUID(),
      data.workspaceId,
      data.projectId ?? null,
      data.userId,
      data.type,
      data.version,
      data.inputs,
      data.results,
      data.engineVersion,
      data.standardVersion,
      data.durationMs,
      new Date(),
    );
  }

  static reconstitute(data: {
    id: string;
    workspaceId: string;
    projectId: string | null;
    userId: string;
    type: string;
    version: string;
    inputs: Record<string, unknown>;
    results: Record<string, unknown>;
    engineVersion: string;
    standardVersion: string;
    durationMs: number;
    createdAt: Date;
  }): CalculationEntity {
    return new CalculationEntity(
      data.id,
      data.workspaceId,
      data.projectId,
      data.userId,
      data.type,
      data.version,
      data.inputs,
      data.results,
      data.engineVersion,
      data.standardVersion,
      data.durationMs,
      data.createdAt,
    );
  }
}
