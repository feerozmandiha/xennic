import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AdminGuard } from './admin.guard';

// ── Mock Prisma ──────────────────────────────────────────────────────────────
jest.mock('@xennic/database', () => ({
  prisma: {
    $queryRaw: jest.fn(),
  },
}));

import { prisma } from '@xennic/database';

describe('AdminGuard', () => {
  let guard: AdminGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminGuard],
    }).compile();

    guard = module.get<AdminGuard>(AdminGuard);
    jest.clearAllMocks();
  });

  /**
   * Helper: ایجاد mock context
   */
  function createMockContext(user?: { userId: string }) {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user,
          ip: '127.0.0.1',
          url: '/api/v1/admin/dashboard',
          headers: {
            'user-agent': 'test-agent',
          },
        }),
      }),
    } as any;
  }

  // ── تست‌های احراز هویت ─────────────────────────────────────────────────────

  describe('Authentication', () => {
    it('should throw UnauthorizedException if no user', async () => {
      const ctx = createMockContext(undefined);
      await expect(guard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user has no userId', async () => {
      const ctx = createMockContext({} as any);
      await expect(guard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ── تست‌های دسترسی ادمین ──────────────────────────────────────────────────

  describe('Admin Access - RBAC', () => {
    it('should grant access for SUPER_ADMIN role', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([
        { role_slug: 'SUPER_ADMIN' },
      ]);

      const ctx = createMockContext({ userId: 'user-123' });
      const result = await guard.canActivate(ctx);
      expect(result).toBe(true);
    });

    it('should grant access for PLATFORM_ADMIN role', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([
        { role_slug: 'PLATFORM_ADMIN' },
      ]);

      const ctx = createMockContext({ userId: 'user-123' });
      const result = await guard.canActivate(ctx);
      expect(result).toBe(true);
    });

    it('should check is_admin column if RBAC returns no result', async () => {
      // RBAC returns no admin role
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);
      // is_admin column returns true
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([
        { is_admin: true },
      ]);

      const ctx = createMockContext({ userId: 'user-123' });
      const result = await guard.canActivate(ctx);
      expect(result).toBe(true);
    });
  });

  // ── تست‌های رد دسترسی ──────────────────────────────────────────────────────

  describe('Access Denial', () => {
    it('should deny access for regular user (no admin role)', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);

      const ctx = createMockContext({ userId: 'user-123' });
      await expect(guard.canActivate(ctx)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should deny access for ENGINEER role', async () => {
      // SQL query filters for ADMIN_ROLE_SLUGS only — ENGINEER won't match
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);

      const ctx = createMockContext({ userId: 'user-123' });
      await expect(guard.canActivate(ctx)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should deny access for MEMBER role', async () => {
      // SQL query filters for ADMIN_ROLE_SLUGS only — MEMBER won't match
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);

      const ctx = createMockContext({ userId: 'user-123' });
      await expect(guard.canActivate(ctx)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ── تست‌های امنیتی (مهم!) ─────────────────────────────────────────────────

  describe('Security - No Unsafe Fallbacks', () => {
    it('should NOT have email-based fallback (SECURITY CRITICAL)', async () => {
      // RBAC fails completely
      (prisma.$queryRaw as jest.Mock).mockRejectedValueOnce(
        new Error('Database connection failed'),
      );

      const ctx = createMockContext({ userId: 'user-123' });
      // Should throw, NOT grant access via email fallback
      await expect(guard.canActivate(ctx)).rejects.toThrow();
    });

    it('should NOT grant access based on email pattern', async () => {
      // RBAC returns no admin role
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);
      // is_admin column returns false
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);

      const ctx = createMockContext({ userId: 'admin-user' });
      // Should deny even if userId contains "admin"
      await expect(guard.canActivate(ctx)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should NOT grant access for empty roles array', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);

      const ctx = createMockContext({ userId: 'user-123' });
      await expect(guard.canActivate(ctx)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
