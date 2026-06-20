import { PrismaClient } from '@prisma/client';
import { createTenantExtension } from './tenant-extension.js';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient | ReturnType<typeof createExtendedPrisma>;
};

function createExtendedPrisma() {
  return new PrismaClient().$extends(createTenantExtension());
}

export const prisma = createExtendedPrisma();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
