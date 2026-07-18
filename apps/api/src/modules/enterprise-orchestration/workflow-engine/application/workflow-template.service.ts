import { Injectable, Logger, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import type { Metadata } from '../../shared/types/index.js';
import { WorkflowTemplate } from '../domain/workflow-template.entity.js';
import type { VariableDef } from '../domain/workflow-template.entity.js';
import type { WorkflowStep, WorkflowTrigger } from '../domain/workflow-definition.entity.js';
import { WorkflowDefinition } from '../domain/workflow-definition.entity.js';
import type {
  IWorkflowRepository,
  ListTemplateOptions,
} from '../domain/workflow-repository.interface.js';
import type { IWorkflowValidator } from '../domain/workflow-validator.interface.js';
import type { PaginatedResult } from '../../shared/types/index.js';

@Injectable()
export class WorkflowTemplateService {
  private readonly logger = new Logger(WorkflowTemplateService.name);

  constructor(
    @Inject('IWorkflowRepository')
    private readonly repository: IWorkflowRepository,
    @Inject('IWorkflowValidator')
    private readonly validator: IWorkflowValidator,
  ) {}

  async createTemplate(
    name: string,
    description: string,
    definition: { steps: WorkflowStep[]; triggers: WorkflowTrigger[]; timeout: number | null },
    variables: VariableDef[],
    category: string,
    tags: string[],
    createdBy: string,
  ): Promise<WorkflowTemplate> {
    const metadata: Metadata = {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy,
      updatedBy: null,
    };

    const template = WorkflowTemplate.create({
      name,
      description,
      definition,
      variables,
      category,
      tags,
      metadata,
    });

    await this.repository.saveTemplate(template);
    this.logger.log(`Workflow template created: ${template.id}`);
    return template;
  }

  async getTemplate(id: string): Promise<WorkflowTemplate> {
    const templates = await this.repository.findTemplates();
    const template = templates.items.find((t) => t.id === id);
    if (!template) {
      throw new NotFoundException(`Workflow template ${id} not found`);
    }
    return template;
  }

  async instantiate(
    templateId: string,
    variableValues: Record<string, unknown>,
    createdBy: string,
  ): Promise<WorkflowDefinition> {
    const template = await this.getTemplate(templateId);

    for (const v of template.variables) {
      if (v.required && variableValues[v.name] === undefined) {
        throw new BadRequestException(
          `Required variable "${v.name}" not provided for template "${template.name}"`,
        );
      }
    }

    const substitute = (val: unknown): unknown => {
      if (typeof val === 'string') {
        return val.replace(/\{\{(\w+)\}\}/g, (_, key) => {
          if (variableValues[key] !== undefined) {
            return String(variableValues[key]);
          }
          const def = template.variables.find((v) => v.name === key);
          if (def?.default !== undefined) {
            return String(def.default);
          }
          return `{{${key}}}`;
        });
      }
      return val;
    };

    const substituteDeep = (obj: unknown): unknown => {
      if (Array.isArray(obj)) {
        return obj.map(substituteDeep);
      }
      if (obj !== null && typeof obj === 'object') {
        return Object.fromEntries(
          Object.entries(obj as Record<string, unknown>).map(([k, v]) => [k, substituteDeep(v)]),
        );
      }
      return substitute(obj);
    };

    const steps = substituteDeep(template.definition.steps) as WorkflowStep[];
    const triggers = substituteDeep(template.definition.triggers) as WorkflowTrigger[];

    const metadata: Metadata = {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy,
      updatedBy: null,
    };

    const definition = WorkflowDefinition.create({
      name: template.name,
      description: template.description,
      steps,
      triggers,
      timeout: template.definition.timeout,
      metadata,
    });

    const validation = this.validator.validate(definition);
    if (!validation.valid) {
      throw new Error(
        `Instantiated workflow validation failed: ${validation.errors.map((e) => `${e.path}: ${e.message}`).join('; ')}`,
      );
    }

    await this.repository.save(definition);
    this.logger.log(`Workflow instantiated from template ${templateId}: ${definition.id}`);
    return definition;
  }

  async listTemplates(options?: ListTemplateOptions): Promise<PaginatedResult<WorkflowTemplate>> {
    return this.repository.findTemplates(options);
  }
}
