export * from './client.js';

// Repository exports - Workspace instead of Tenant
export * from './repositories/workspace.repository.js';

// Tenant context for multi-tenant isolation
export { TenantContext, tenantStorage } from './tenant-context.js';

// Export Prisma types
export type { workspaces as PrismaWorkspace } from '@prisma/client';