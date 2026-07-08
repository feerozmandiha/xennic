import { Injectable, Inject, Logger } from '@nestjs/common';
import type { ISkillRegistry } from '../domain/skill-registry.interface.js';
import type { ISkillExecutor, SkillResult } from '../domain/skill-executor.interface.js';
import type { SkillIO, SkillEntity } from '../domain/skill.entity.js';

@Injectable()
export class SkillExecutorService implements ISkillExecutor {
  private readonly logger = new Logger(SkillExecutorService.name);

  constructor(
    @Inject('ISkillRegistry') private readonly registry: ISkillRegistry,
  ) {}

  async execute(
    skillId: string,
    input: Record<string, unknown>,
    _context?: Record<string, unknown>,
  ): Promise<SkillResult> {
    const start = Date.now();

    const valid = await this.validate(skillId, input);
    if (!valid) {
      return {
        success: false,
        output: null,
        duration: Date.now() - start,
      };
    }

    const skill = await this.registry.get(skillId);
    if (!skill) {
      return {
        success: false,
        output: null,
        duration: Date.now() - start,
      };
    }

    this.logger.debug(`Executing skill "${skill.name}" (${skillId})`);

    const output = this.simulateExecution(skill, input);

    return {
      success: true,
      output,
      duration: Date.now() - start,
    };
  }

  async validate(skillId: string, input: Record<string, unknown>): Promise<boolean> {
    const skill = await this.registry.get(skillId);
    if (!skill) return false;

    for (const io of skill.inputs) {
      if (io.required && !(io.name in input)) {
        return false;
      }
    }
    return true;
  }

  async getRequirements(skillId: string): Promise<SkillIO[]> {
    const skill = await this.registry.get(skillId);
    if (!skill) {
      throw new Error(`Skill ${skillId} not found`);
    }
    return skill.inputs;
  }

  private simulateExecution(
    skill: SkillEntity,
    input: Record<string, unknown>,
  ): Record<string, unknown> {
    const output: Record<string, unknown> = {};

    for (const io of skill.outputs) {
      output[io.name] = input[io.name] ?? `simulated-${io.name}`;
    }

    return output;
  }
}
