import { randomUUID } from 'node:crypto';

export abstract class BaseCommand implements ICommand {
  readonly commandId: string;
  readonly timestamp: string;

  abstract readonly commandName: string;

  constructor(
    readonly correlationId: string,
    readonly causationId: string,
    readonly userId?: string,
    readonly workspaceId: string = '',
  ) {
    this.commandId = randomUUID();
    this.timestamp = new Date().toISOString();
  }
}

import type { ICommand } from '../../domain/interfaces/command-bus.interface.js';
