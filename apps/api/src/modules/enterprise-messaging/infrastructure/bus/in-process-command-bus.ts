import { Injectable, Logger } from '@nestjs/common';
import type {
  ICommand,
  ICommandHandler,
  ICommandBus,
} from '../../domain/interfaces/command-bus.interface.js';

@Injectable()
export class InProcessCommandBus implements ICommandBus {
  private readonly logger = new Logger(InProcessCommandBus.name);
  private readonly handlers = new Map<string, ICommandHandler<any, any>>();

  register(handler: ICommandHandler<any, any>): void {
    this.handlers.set(handler.handledCommand, handler);
    this.logger.log(`Registered command handler for ${handler.handledCommand}`);
  }

  async execute<TCommand extends ICommand, TResult = void>(command: TCommand): Promise<TResult> {
    const handler = this.handlers.get(command.commandName);
    if (!handler) {
      throw new Error(`No handler registered for command: ${command.commandName}`);
    }
    this.logger.debug(`Executing command ${command.commandName} (${command.commandId})`);
    const startTime = Date.now();
    try {
      const result = await handler.handle(command);
      this.logger.debug(`Command ${command.commandName} completed in ${Date.now() - startTime}ms`);
      return result as TResult;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Command ${command.commandName} failed: ${message}`);
      throw error;
    }
  }
}
