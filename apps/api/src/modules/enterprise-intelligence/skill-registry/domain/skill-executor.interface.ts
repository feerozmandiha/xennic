import type { SkillIO } from './skill.entity.js';
import type { SkillCompositionStep } from './skill-composition.vo.js';

export interface SkillResult {
  success: boolean;
  output: Record<string, unknown> | null;
  duration: number;
  steps?: SkillCompositionStep[];
}

export interface ISkillExecutor {
  execute(
    skillId: string,
    input: Record<string, unknown>,
    context?: Record<string, unknown>,
  ): Promise<SkillResult>;
  validate(skillId: string, input: Record<string, unknown>): Promise<boolean>;
  getRequirements(skillId: string): Promise<SkillIO[]>;
}
