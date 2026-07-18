import { randomUUID } from 'node:crypto';

export interface SkillCompositionStep {
  skillId: string;
  inputMapping: Record<string, string>;
  outputMapping: Record<string, string>;
  order: number;
}

export class SkillComposition {
  public readonly id: string;
  public readonly name: string;
  public readonly steps: SkillCompositionStep[];
  public readonly metadata: Record<string, unknown>;

  private constructor(
    id: string,
    name: string,
    steps: SkillCompositionStep[],
    metadata: Record<string, unknown>,
  ) {
    this.id = id;
    this.name = name;
    this.steps = steps;
    this.metadata = metadata;
  }

  static create(
    name: string,
    steps: SkillCompositionStep[],
    metadata?: Record<string, unknown>,
  ): SkillComposition {
    return new SkillComposition(randomUUID(), name, steps, metadata ?? {});
  }
}
