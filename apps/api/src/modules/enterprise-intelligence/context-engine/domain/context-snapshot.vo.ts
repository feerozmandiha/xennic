import type { ContextScope } from '../../shared/types/index.js';
import type { ContextEntity } from './context.entity.js';

export class ContextSnapshot {
  public readonly contextId: string;
  public readonly scope: ContextScope;
  public readonly scopeId: string;
  public readonly data: Readonly<Record<string, unknown>>;
  public readonly version: number;
  public readonly timestamp: Date;

  private constructor(
    contextId: string,
    scope: ContextScope,
    scopeId: string,
    data: Record<string, unknown>,
    version: number,
    timestamp: Date,
  ) {
    this.contextId = contextId;
    this.scope = scope;
    this.scopeId = scopeId;
    this.data = Object.freeze({ ...data });
    this.version = version;
    this.timestamp = timestamp;
  }

  static create(entities: ContextEntity[]): ContextSnapshot {
    const merged = entities.reduce(
      (acc, entity) => ({ ...acc, [entity.key]: entity.value }),
      {} as Record<string, unknown>,
    );
    const first = entities[0];
    const maxVersion = entities.reduce((max, e) => Math.max(max, e.version), 0);
    const contextId = first?.id ?? '';
    const scope: ContextScope = first?.scope ?? 'global';
    const scopeId = first?.scopeId ?? '';

    return new ContextSnapshot(contextId, scope, scopeId, merged, maxVersion, new Date());
  }
}
