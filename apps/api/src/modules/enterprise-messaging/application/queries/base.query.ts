import { randomUUID } from 'node:crypto';

export abstract class BaseQuery implements IQuery {
  readonly queryId: string;
  readonly timestamp: string;

  abstract readonly queryName: string;

  constructor(
    readonly correlationId: string,
    readonly userId?: string,
    readonly workspaceId?: string,
  ) {
    this.queryId = randomUUID();
    this.timestamp = new Date().toISOString();
  }
}

import type { IQuery } from '../../domain/interfaces/query-bus.interface.js';
