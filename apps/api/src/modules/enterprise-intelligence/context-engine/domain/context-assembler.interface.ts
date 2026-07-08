import type { ContextScope } from '../../shared/types/index.js';
import type { ContextSnapshot } from './context-snapshot.vo.js';
import type { ContextSource } from './context-source.vo.js';

export interface IContextAssembler {
  assemble(
    scope: ContextScope,
    scopeId: string,
    sources?: ContextSource[],
  ): Promise<ContextSnapshot>;
  getSourcePriority(source: string): number;
}
