export type ContextScope = 'workspace' | 'user' | 'project' | 'global';

export interface Scoped {
  scope: ContextScope;
  scopeId: string;
}
