export interface TenantContext {
  workspaceId: string;

  userId: string;

  userRoles: string[];

  permissions: string[];

  tenantType: 'single' | 'system' | 'cross';

  isolationLevel: 'strict' | 'relaxed' | 'system';
}
