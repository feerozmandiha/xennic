import { AsyncLocalStorage } from 'node:async_hooks';

export const tenantStorage = new AsyncLocalStorage<{ workspaceId: string }>();

export class TenantContext {
  static getWorkspaceId(): string | undefined {
    return tenantStorage.getStore()?.workspaceId;
  }

  static runWithWorkspaceId<T>(workspaceId: string, fn: () => T): T {
    return tenantStorage.run({ workspaceId }, fn);
  }
}
