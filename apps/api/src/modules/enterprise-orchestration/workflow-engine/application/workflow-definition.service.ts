import { Injectable, Logger, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import type { Metadata } from '../../shared/types/index.js';
import { WorkflowDefinition } from '../domain/workflow-definition.entity.js';
import type {
  WorkflowStep,
  WorkflowTrigger,
  WorkflowDefinitionOptions,
} from '../domain/workflow-definition.entity.js';
import type {
  IWorkflowRepository,
  ListWorkflowOptions,
} from '../domain/workflow-repository.interface.js';
import type { IWorkflowValidator } from '../domain/workflow-validator.interface.js';
import type { PaginatedResult } from '../../shared/types/index.js';

export interface CreateWorkflowData {
  name: string;
  description: string;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  timeout: number | null;
  createdBy: string;
}

export interface UpdateWorkflowData {
  name?: string;
  description?: string;
  steps?: WorkflowStep[];
  triggers?: WorkflowTrigger[];
  timeout?: number | null;
}

@Injectable()
export class WorkflowDefinitionService {
  private readonly logger = new Logger(WorkflowDefinitionService.name);

  constructor(
    @Inject('IWorkflowRepository')
    private readonly repository: IWorkflowRepository,
    @Inject('IWorkflowValidator')
    private readonly validator: IWorkflowValidator,
  ) {}

  async create(data: CreateWorkflowData): Promise<WorkflowDefinition> {
    const existing = await this.repository.getByName(data.name);
    if (existing) {
      throw new ConflictException(`Workflow "${data.name}" already exists`);
    }

    const metadata: Metadata = {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: data.createdBy,
      updatedBy: null,
    };

    const opts: WorkflowDefinitionOptions = {
      name: data.name,
      description: data.description,
      steps: data.steps,
      triggers: data.triggers,
      timeout: data.timeout,
      metadata,
    };

    const entity = WorkflowDefinition.create(opts);

    const validation = this.validator.validate(entity);
    if (!validation.valid) {
      throw new Error(
        `Workflow validation failed: ${validation.errors.map((e) => `${e.path}: ${e.message}`).join('; ')}`,
      );
    }

    await this.repository.save(entity);
    this.logger.log(`Workflow created: ${entity.id} v${entity.version}`);
    return entity;
  }

  async get(id: string): Promise<WorkflowDefinition> {
    const entity = await this.repository.get(id);
    if (!entity) {
      throw new NotFoundException(`Workflow ${id} not found`);
    }
    return entity;
  }

  async getByName(name: string, version?: number): Promise<WorkflowDefinition> {
    const entity = await this.repository.getByName(name, version);
    if (!entity) {
      throw new NotFoundException(
        `Workflow "${name}"${version !== undefined ? ` v${version}` : ''} not found`,
      );
    }
    return entity;
  }

  async createVersion(id: string, updates: UpdateWorkflowData): Promise<WorkflowDefinition> {
    const existing = await this.get(id);

    const newVersion = existing.version + 1;
    const now = new Date();

    const steps = updates.steps ?? existing.steps;
    const triggers = updates.triggers ?? existing.triggers;

    const entity = WorkflowDefinition.reconstitute(
      existing.id,
      updates.name ?? existing.name,
      updates.description ?? existing.description,
      newVersion,
      steps,
      triggers,
      updates.timeout !== undefined ? updates.timeout : existing.timeout,
      {
        createdAt: existing.metadata.createdAt,
        updatedAt: now,
        createdBy: existing.metadata.createdBy,
        updatedBy: existing.metadata.updatedBy,
      },
      existing.createdAt,
      now,
      existing.status,
    );

    const validation = this.validator.validate(entity);
    if (!validation.valid) {
      throw new Error(
        `Workflow validation failed: ${validation.errors.map((e) => `${e.path}: ${e.message}`).join('; ')}`,
      );
    }

    await this.repository.save(entity);
    this.logger.log(`Workflow version created: ${entity.id} v${entity.version}`);
    return entity;
  }

  async activate(id: string): Promise<WorkflowDefinition> {
    const entity = await this.get(id);
    const now = new Date();

    const activated = WorkflowDefinition.reconstitute(
      entity.id,
      entity.name,
      entity.description,
      entity.version,
      entity.steps,
      entity.triggers,
      entity.timeout,
      {
        createdAt: entity.metadata.createdAt,
        updatedAt: now,
        createdBy: entity.metadata.createdBy,
        updatedBy: entity.metadata.updatedBy,
      },
      entity.createdAt,
      now,
      'active',
    );

    await this.repository.save(activated);
    this.logger.log(`Workflow activated: ${activated.id}`);
    return activated;
  }

  async archive(id: string): Promise<WorkflowDefinition> {
    const entity = await this.get(id);
    const now = new Date();

    const archived = WorkflowDefinition.reconstitute(
      entity.id,
      entity.name,
      entity.description,
      entity.version,
      entity.steps,
      entity.triggers,
      entity.timeout,
      {
        createdAt: entity.metadata.createdAt,
        updatedAt: now,
        createdBy: entity.metadata.createdBy,
        updatedBy: entity.metadata.updatedBy,
      },
      entity.createdAt,
      now,
      'archived',
    );

    await this.repository.save(archived);
    this.logger.log(`Workflow archived: ${archived.id}`);
    return archived;
  }

  async list(options?: ListWorkflowOptions): Promise<PaginatedResult<WorkflowDefinition>> {
    return this.repository.list(options);
  }

  async delete(id: string): Promise<void> {
    const entity = await this.get(id);
    await this.repository.delete(entity.id);
    this.logger.log(`Workflow deleted: ${id}`);
  }
}
