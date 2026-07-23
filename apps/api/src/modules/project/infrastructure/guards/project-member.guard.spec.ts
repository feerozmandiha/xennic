jest.mock('@xennic/database', () => ({ prisma: {} }));

import { ProjectMemberGuard } from './project-member.guard.js';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

function createMockContext(overrides?: {
  userId?: string;
  workspaceId?: string;
  projectId?: string;
}) {
  const req: any = {
    user: overrides?.userId ? { userId: overrides.userId } : undefined,
    workspaceId: overrides?.workspaceId ?? 'ws-1',
    params: overrides?.projectId ? { projectId: overrides.projectId } : {},
  };
  return {
    switchToHttp: () => ({
      getRequest: () => req,
    }),
  } as any;
}

function createProject(overrides?: { workspaceId?: string; deleted?: boolean }) {
  return {
    id: 'proj-1',
    workspaceId: overrides?.workspaceId ?? 'ws-1',
    isDeleted: () => overrides?.deleted ?? false,
    deletedAt: overrides?.deleted ? new Date() : null,
  };
}

describe('ProjectMemberGuard', () => {
  let guard: ProjectMemberGuard;
  let mockProjectRepo: { findById: jest.Mock; isMember: jest.Mock };

  beforeEach(() => {
    mockProjectRepo = {
      findById: jest.fn(),
      isMember: jest.fn(),
    };
    guard = new ProjectMemberGuard(mockProjectRepo as any);
  });

  // ── Positive ────────────────────────────────────────────────────────────────

  it('should allow access for a project member', async () => {
    mockProjectRepo.findById.mockResolvedValue(createProject());
    mockProjectRepo.isMember.mockResolvedValue(true);

    const ctx = createMockContext({ userId: 'u1', projectId: 'proj-1' });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(mockProjectRepo.isMember).toHaveBeenCalledWith('proj-1', 'u1');
  });

  // ── Negative — Authentication ───────────────────────────────────────────────

  it('should deny when user is not authenticated', async () => {
    const ctx = createMockContext({ userId: undefined, projectId: 'proj-1' });

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  // ── Negative — Project ID ───────────────────────────────────────────────────

  it('should deny when projectId is missing from route', async () => {
    const ctx = createMockContext({ userId: 'u1', projectId: undefined });

    await expect(guard.canActivate(ctx)).rejects.toThrow(NotFoundException);
  });

  // ── Negative — Project Not Found ────────────────────────────────────────────

  it('should deny when project is not found', async () => {
    mockProjectRepo.findById.mockResolvedValue(null);
    const ctx = createMockContext({ userId: 'u1', projectId: 'nonexistent' });

    await expect(guard.canActivate(ctx)).rejects.toThrow(NotFoundException);
  });

  // ── Negative — Deleted Project ──────────────────────────────────────────────

  it('should deny when project is deleted', async () => {
    mockProjectRepo.findById.mockResolvedValue(createProject({ deleted: true }));
    const ctx = createMockContext({ userId: 'u1', projectId: 'proj-1' });

    await expect(guard.canActivate(ctx)).rejects.toThrow(NotFoundException);
  });

  // ── Negative — Workspace Mismatch ───────────────────────────────────────────

  it('should deny when project belongs to a different workspace', async () => {
    mockProjectRepo.findById.mockResolvedValue(createProject({ workspaceId: 'other-ws' }));
    const ctx = createMockContext({
      userId: 'u1',
      workspaceId: 'ws-1',
      projectId: 'proj-1',
    });

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  // ── Negative — Not a Member ─────────────────────────────────────────────────

  it('should deny when user is not a project member', async () => {
    mockProjectRepo.findById.mockResolvedValue(createProject());
    mockProjectRepo.isMember.mockResolvedValue(false);
    const ctx = createMockContext({ userId: 'u1', projectId: 'proj-1' });

    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  // ── Workspace ID from request ───────────────────────────────────────────────

  it('should use workspaceId from request context', async () => {
    mockProjectRepo.findById.mockResolvedValue(createProject({ workspaceId: 'ws-2' }));
    mockProjectRepo.isMember.mockResolvedValue(true);
    const ctx = createMockContext({
      userId: 'u1',
      workspaceId: 'ws-2',
      projectId: 'proj-1',
    });

    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });
});
