import { Injectable, Logger } from '@nestjs/common';
import type {
  IQuery,
  IQueryHandler,
  IQueryBus,
} from '../../domain/interfaces/query-bus.interface.js';

@Injectable()
export class InProcessQueryBus implements IQueryBus {
  private readonly logger = new Logger(InProcessQueryBus.name);
  private readonly handlers = new Map<string, IQueryHandler<any, any>>();

  register(handler: IQueryHandler<any, any>): void {
    this.handlers.set(handler.handledQuery, handler);
    this.logger.log(`Registered query handler for ${handler.handledQuery}`);
  }

  async ask<TQuery extends IQuery, TResult = unknown>(query: TQuery): Promise<TResult> {
    const handler = this.handlers.get(query.queryName);
    if (!handler) {
      throw new Error(`No handler registered for query: ${query.queryName}`);
    }
    this.logger.debug(`Executing query ${query.queryName} (${query.queryId})`);
    const startTime = Date.now();
    try {
      const result = await handler.handle(query);
      this.logger.debug(`Query ${query.queryName} completed in ${Date.now() - startTime}ms`);
      return result as TResult;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Query ${query.queryName} failed: ${message}`);
      throw error;
    }
  }
}
