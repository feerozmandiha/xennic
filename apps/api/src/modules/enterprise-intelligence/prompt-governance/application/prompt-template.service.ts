import { Injectable, Inject, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import type { PaginatedResult } from '../../shared/types/index.js';
import { PromptTemplateEntity, type VariableDef } from '../domain/prompt-template.entity.js';
import type { ITemplateRegistry, TemplateFindOptions } from '../domain/prompt-template-registry.interface.js';

@Injectable()
export class PromptTemplateService {
  private readonly logger = new Logger(PromptTemplateService.name);

  constructor(
    @Inject('ITemplateRegistry') private readonly registry: ITemplateRegistry,
  ) {}

  async register(
    data: {
      name: string;
      description: string;
      content: string;
      variables: VariableDef[];
      createdBy: string;
    },
  ): Promise<PromptTemplateEntity> {
    const entity = PromptTemplateEntity.create(
      data.name,
      data.description,
      data.content,
      data.variables,
      data.createdBy,
    );
    await this.registry.register(entity);
    this.logger.debug(`Registered template ${entity.id} (${data.name})`);
    return entity;
  }

  async get(id: string): Promise<PromptTemplateEntity> {
    const entity = await this.registry.get(id);
    if (!entity) {
      throw new NotFoundException(`Template ${id} not found`);
    }
    return entity;
  }

  async render(
    templateId: string,
    variables: Record<string, string>,
  ): Promise<string> {
    const template = await this.get(templateId);

    for (const def of template.variables) {
      if (def.required && !(def.name in variables) && def.default === undefined) {
        throw new BadRequestException(
          `Missing required variable "${def.name}" for template "${template.name}"`,
        );
      }
    }

    let result = template.content;
    for (const def of template.variables) {
      const value = variables[def.name] ?? def.default;
      if (value !== undefined) {
        result = result.replaceAll(`{{${def.name}}}`, value);
      }
    }

    return result;
  }

  async list(options?: TemplateFindOptions): Promise<PaginatedResult<PromptTemplateEntity>> {
    return this.registry.list(options);
  }

  async delete(id: string): Promise<void> {
    await this.get(id);
    await this.registry.delete(id);
    this.logger.debug(`Deleted template ${id}`);
  }
}
