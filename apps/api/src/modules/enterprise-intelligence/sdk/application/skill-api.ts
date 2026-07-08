import { Injectable, Logger } from '@nestjs/common';
import type { SkillEntity } from '../../skill-registry/domain/skill.entity.js';
import type { SkillComposition } from '../../skill-registry/domain/skill-composition.vo.js';
import type { RegisterSkillData } from '../../skill-registry/application/skill-registry.service.js';
import type { CompositionGraph } from '../../skill-registry/application/skill-composer.service.js';
import { SkillRegistryService } from '../../skill-registry/application/skill-registry.service.js';
import { SkillComposerService } from '../../skill-registry/application/skill-composer.service.js';
import { SkillExecutorService } from '../../skill-registry/application/skill-executor.service.js';

@Injectable()
export class SkillApi {
  private readonly logger = new Logger(SkillApi.name);

  constructor(
    private readonly registry: SkillRegistryService,
    private readonly composer: SkillComposerService,
    private readonly executor: SkillExecutorService,
  ) {}

  async register(data: RegisterSkillData): Promise<SkillEntity> {
    this.logger.debug(`register(name=${data.name})`);
    return this.registry.register(data);
  }

  async get(id: string): Promise<SkillEntity | null> {
    return this.registry.get(id);
  }

  async compose(
    skillIds: string[],
    inputMappings: Record<string, string>[],
    outputMappings: Record<string, string>[],
    name?: string,
  ): Promise<SkillComposition> {
    this.logger.debug(`compose(skills=${skillIds.length})`);
    return this.composer.compose(skillIds, inputMappings, outputMappings, name);
  }

  async execute(
    skillId: string,
    input: Record<string, unknown>,
    context?: Record<string, unknown>,
  ): Promise<unknown> {
    this.logger.debug(`execute(skillId=${skillId})`);
    return this.executor.execute(skillId, input, context);
  }

  async getCompositionGraph(compositionId: string): Promise<CompositionGraph> {
    return this.composer.getCompositionGraph(compositionId);
  }
}
