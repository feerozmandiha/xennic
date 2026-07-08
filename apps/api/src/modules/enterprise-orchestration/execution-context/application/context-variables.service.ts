import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import { ExecutionContext } from '../domain/execution-context.entity.js';
import type { IContextRepository } from '../domain/context-repository.interface.js';

@Injectable()
export class ContextVariablesService {
  private readonly logger = new Logger(ContextVariablesService.name);

  constructor(
    @Inject('IContextRepository')
    private readonly repository: IContextRepository,
  ) {}

  async set(
    executionId: string,
    key: string,
    value: unknown,
    createdBy: string,
  ): Promise<ExecutionContext> {
    let context = await this.repository.getContext(executionId);

    if (!context) {
      context = ExecutionContext.create({
        executionId,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy,
          updatedBy: null,
        },
      });
    }

    const updated = context.set(key, value);
    await this.repository.saveContext(updated);
    this.logger.debug(`Set variable ${key} in context ${executionId}`);
    return updated;
  }

  async get(executionId: string, key: string): Promise<unknown | undefined> {
    const context = await this.getContextOrThrow(executionId);
    return context.get(key);
  }

  async getAll(executionId: string): Promise<Record<string, unknown>> {
    const context = await this.getContextOrThrow(executionId);
    return context.snapshot();
  }

  async delete(executionId: string, key: string): Promise<ExecutionContext> {
    const context = await this.getContextOrThrow(executionId);
    const updated = context.delete(key);
    await this.repository.saveContext(updated);
    this.logger.debug(`Deleted variable ${key} from context ${executionId}`);
    return updated;
  }

  async merge(
    executionId: string,
    values: Record<string, unknown>,
    createdBy: string,
  ): Promise<ExecutionContext> {
    let context = await this.repository.getContext(executionId);

    if (!context) {
      context = ExecutionContext.create({
        executionId,
        variables: new Map(Object.entries(values)),
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy,
          updatedBy: null,
        },
      });

      await this.repository.saveContext(context);
      this.logger.debug(`Created context ${executionId} with merged values`);
      return context;
    }

    let updated = context;
    for (const [key, value] of Object.entries(values)) {
      updated = updated.set(key, value);
    }
    await this.repository.saveContext(updated);
    this.logger.debug(`Merged ${Object.keys(values).length} variables into context ${executionId}`);
    return updated;
  }

  async snapshot(executionId: string): Promise<Record<string, unknown>> {
    const context = await this.getContextOrThrow(executionId);
    return context.snapshot();
  }

  async resolve(executionId: string, template: string): Promise<string> {
    const context = await this.getContextOrThrow(executionId);
    const snapshot = context.snapshot();

    return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
      const value = snapshot[key];
      if (value === undefined || value === null) {
        return `{{${key}}}`;
      }
      return String(value);
    });
  }

  private async getContextOrThrow(executionId: string): Promise<ExecutionContext> {
    const context = await this.repository.getContext(executionId);
    if (!context) {
      throw new NotFoundException(`ExecutionContext ${executionId} not found`);
    }
    return context;
  }
}
