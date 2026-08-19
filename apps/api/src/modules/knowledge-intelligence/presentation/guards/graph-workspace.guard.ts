import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import type { IGraphNodeRepository } from '../../domain/interfaces/graph-node.repository.interface.js';

/** Prevents graph-node identifiers from being used across workspace boundaries. */
@Injectable()
export class GraphWorkspaceGuard implements CanActivate {
  constructor(
    @Inject('IGraphNodeRepository')
    private readonly graphNodeRepository: IGraphNodeRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const workspaceId = request.workspaceId as string | undefined;
    if (!workspaceId) return true;

    const identifiers = new Set<string>();
    for (const value of [
      request.params?.nodeId,
      request.params?.sourceId,
      request.params?.targetId,
      request.query?.sourceId,
      request.query?.targetId,
      request.query?.nodeIds,
    ]) {
      if (typeof value !== 'string') continue;
      for (const id of value.split(',')) {
        if (id.trim()) identifiers.add(id.trim());
      }
    }

    if (identifiers.size > 100) {
      throw new BadRequestException('At most 100 graph node identifiers are allowed');
    }

    const nodes = await Promise.all(
      [...identifiers].map((id) => this.graphNodeRepository.findById(id)),
    );
    if (nodes.some((node) => node && node.workspaceId !== workspaceId)) {
      throw new ForbiddenException('Graph node does not belong to the active workspace');
    }

    return true;
  }
}
