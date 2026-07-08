export const IQUERY_BUS = 'IQueryBus' as const;

export interface IQuery {
  readonly queryName: string;
  readonly queryId: string;
  readonly timestamp: string;
  readonly correlationId: string;
  readonly userId?: string;
  readonly workspaceId?: string;
}

export interface IQueryHandler<TQuery extends IQuery, TResult = unknown> {
  readonly handledQuery: string;
  handle(query: TQuery): Promise<TResult>;
}

export interface IQueryBus {
  ask<TQuery extends IQuery, TResult = unknown>(query: TQuery): Promise<TResult>;
}
