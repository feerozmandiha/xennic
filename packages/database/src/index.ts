export * from './client.js';

// Repository exports - Workspace instead of Tenant
export * from './repositories/workspace.repository.js';

// Tenant context for multi-tenant isolation
export { TenantContext, tenantStorage } from './tenant-context.js';

// Export Prisma types - resilient to missing model (e.g. during partial generation)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PrismaWorkspace = any;
