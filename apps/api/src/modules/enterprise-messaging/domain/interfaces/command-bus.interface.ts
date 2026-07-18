export const ICOMMAND_BUS = 'ICommandBus' as const;

export interface ICommand {
  readonly commandName: string;
  readonly commandId: string;
  readonly timestamp: string;
  readonly correlationId: string;
  readonly causationId: string;
  readonly userId?: string;
  readonly workspaceId: string;
}

export interface ICommandHandler<TCommand extends ICommand, TResult = void> {
  readonly handledCommand: string;
  handle(command: TCommand): Promise<TResult>;
}

export interface ICommandBus {
  execute<TCommand extends ICommand, TResult = void>(command: TCommand): Promise<TResult>;
}
