import { BadRequestException, ForbiddenException, type ExecutionContext } from '@nestjs/common';
import type { IGraphNodeRepository } from '../../domain/interfaces/graph-node.repository.interface.js';
import { GraphWorkspaceGuard } from './graph-workspace.guard.js';

function contextFor(request: Record<string, unknown>): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('GraphWorkspaceGuard', () => {
  const repository = {
    findById: jest.fn(),
  } as unknown as IGraphNodeRepository;
  const guard = new GraphWorkspaceGuard(repository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows graph nodes from the active workspace', async () => {
    (repository.findById as jest.Mock).mockResolvedValue({ workspaceId: 'workspace-1' });

    await expect(
      guard.canActivate(
        contextFor({
          workspaceId: 'workspace-1',
          params: { nodeId: 'node-1' },
          query: {},
        }),
      ),
    ).resolves.toBe(true);
  });

  it('rejects graph nodes from another workspace', async () => {
    (repository.findById as jest.Mock).mockResolvedValue({ workspaceId: 'workspace-2' });

    await expect(
      guard.canActivate(
        contextFor({
          workspaceId: 'workspace-1',
          params: { nodeId: 'node-1' },
          query: {},
        }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('bounds batched graph-node checks', async () => {
    const nodeIds = Array.from({ length: 101 }, (_, index) => `node-${index}`).join(',');

    await expect(
      guard.canActivate(
        contextFor({
          workspaceId: 'workspace-1',
          params: {},
          query: { nodeIds },
        }),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.findById).not.toHaveBeenCalled();
  });

  it('rejects oversized graph-node identifiers before repository access', async () => {
    await expect(
      guard.canActivate(
        contextFor({
          workspaceId: 'workspace-1',
          params: { nodeId: 'n'.repeat(129) },
          query: {},
        }),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.findById).not.toHaveBeenCalled();
  });
});
