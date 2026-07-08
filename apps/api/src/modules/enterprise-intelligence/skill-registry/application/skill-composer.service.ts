import { Injectable, Inject, Logger } from '@nestjs/common';
import type { ISkillRegistry } from '../domain/skill-registry.interface.js';
import { SkillComposition } from '../domain/skill-composition.vo.js';
import type { SkillCompositionStep } from '../domain/skill-composition.vo.js';
import type { SkillEntity } from '../domain/skill.entity.js';

export interface CompositionGraph {
  adjacency: Map<string, string[]>;
  steps: SkillCompositionStep[];
}

export interface ValidationError {
  step: number;
  message: string;
}

export interface CompositionValidation {
  valid: boolean;
  errors: ValidationError[];
}

@Injectable()
export class SkillComposerService {
  private readonly logger = new Logger(SkillComposerService.name);
  private readonly compositions = new Map<string, SkillComposition>();

  constructor(
    @Inject('ISkillRegistry') private readonly registry: ISkillRegistry,
  ) {}

  async compose(
    skillIds: string[],
    inputMappings: Record<string, string>[],
    outputMappings: Record<string, string>[],
    name?: string,
  ): Promise<SkillComposition> {
    const steps: SkillCompositionStep[] = [];

    for (let i = 0; i < skillIds.length; i++) {
      const sid = skillIds[i]!;
      const skill = await this.registry.get(sid);
      if (!skill) {
        throw new Error(`Skill ${sid} not found at step ${i}`);
      }
      steps.push({
        skillId: sid,
        inputMapping: inputMappings[i] ?? {},
        outputMapping: outputMappings[i] ?? {},
        order: i,
      });
    }

    const compositionName = name ?? `composition-${Date.now()}`;
    const composition = SkillComposition.create(
      compositionName,
      steps,
    );
    this.compositions.set(composition.id, composition);
    this.logger.log(`Created composition "${composition.id}" with ${steps.length} steps`);
    return composition;
  }

  async decompose(compositionId: string): Promise<SkillEntity[]> {
    const composition = this.compositions.get(compositionId);
    if (!composition) {
      throw new Error(`Composition ${compositionId} not found`);
    }

    const skills: SkillEntity[] = [];
    for (const step of composition.steps) {
      const skill = await this.registry.get(step.skillId);
      if (skill) {
        skills.push(skill);
      }
    }
    return skills;
  }

  getCompositionGraph(compositionId: string): CompositionGraph {
    const composition = this.compositions.get(compositionId);
    if (!composition) {
      throw new Error(`Composition ${compositionId} not found`);
    }

    const adjacency = new Map<string, string[]>();
    for (let i = 0; i < composition.steps.length; i++) {
      const current = composition.steps[i]!;
      const edges: string[] = [];
      for (let j = i + 1; j < composition.steps.length; j++) {
        const downstream = composition.steps[j]!;
        const sharedInputs = Object.keys(downstream.inputMapping).filter(
          key => Object.values(current.outputMapping).includes(key),
        );
        if (sharedInputs.length > 0) {
          edges.push(downstream.skillId);
        }
      }
      adjacency.set(current.skillId, edges);
    }

    return { adjacency, steps: composition.steps };
  }

  async validateComposition(compositionId: string): Promise<CompositionValidation> {
    const composition = this.compositions.get(compositionId);
    if (!composition) {
      return { valid: false, errors: [{ step: -1, message: `Composition ${compositionId} not found` }] };
    }

    const errors: ValidationError[] = [];

    for (const step of composition.steps) {
      const skill = await this.registry.get(step.skillId);
      if (!skill) {
        errors.push({ step: step.order, message: `Skill ${step.skillId} not found` });
        continue;
      }

      for (const inputName of Object.keys(step.inputMapping)) {
        const matchingInput = skill.inputs.find(i => i.name === inputName);
        if (inputName !== '*' && !matchingInput) {
          errors.push({
            step: step.order,
            message: `Input "${inputName}" not found in skill "${skill.name}"`,
          });
        }
      }

      for (const outputName of Object.keys(step.outputMapping)) {
        const matchingOutput = skill.outputs.find(o => o.name === outputName);
        if (outputName !== '*' && !matchingOutput) {
          errors.push({
            step: step.order,
            message: `Output "${outputName}" not found in skill "${skill.name}"`,
          });
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }
}
