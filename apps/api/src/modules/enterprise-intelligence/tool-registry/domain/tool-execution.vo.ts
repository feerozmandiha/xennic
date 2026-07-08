import { randomUUID } from 'node:crypto';

export class ToolExecutionVO {
  public readonly id: string;
  public readonly toolId: string;
  public readonly input: Record<string, unknown>;
  public readonly output: Record<string, unknown> | null;
  public readonly success: boolean;
  public readonly duration: number;
  public readonly error: string | null;
  public readonly timestamp: Date;

  private constructor(
    id: string,
    toolId: string,
    input: Record<string, unknown>,
    output: Record<string, unknown> | null,
    success: boolean,
    duration: number,
    error: string | null,
    timestamp: Date,
  ) {
    this.id = id;
    this.toolId = toolId;
    this.input = input;
    this.output = output;
    this.success = success;
    this.duration = duration;
    this.error = error;
    this.timestamp = timestamp;
  }

  static create(
    toolId: string,
    input: Record<string, unknown>,
    output: Record<string, unknown> | null,
    success: boolean,
    duration: number,
    error: string | null,
  ): ToolExecutionVO {
    return new ToolExecutionVO(
      randomUUID(),
      toolId,
      input,
      output,
      success,
      duration,
      error,
      new Date(),
    );
  }
}
