import { Injectable, Inject } from '@nestjs/common';
import type { IGraphNodeRepository } from '../../domain/interfaces/graph-node.repository.interface.js';

@Injectable()
export class KnowledgeFreshnessService {
  constructor(
    @Inject('IGraphNodeRepository')
    private readonly nodeRepo: IGraphNodeRepository,
  ) {}

  async calculateFreshness(nodeId: string): Promise<number> {
    const node = await this.nodeRepo.findById(nodeId);
    return node ? this.scoreForDate(node.updatedAt) : 0;
  }

  async analyzeWorkspaceFreshness(
    workspaceId: string,
    thresholdDays = 30,
  ): Promise<{ nodeId: string; stale: boolean; daysSinceUpdate: number }[]> {
    const { nodes } = await this.nodeRepo.findAllByWorkspace(workspaceId);

    return nodes.map((node) => {
      const daysSinceUpdate = this.daysSince(node.updatedAt);
      return {
        nodeId: node.id,
        stale: daysSinceUpdate > thresholdDays,
        daysSinceUpdate,
      };
    });
  }

  private scoreForDate(updatedAt: Date): number {
    const ageDays = this.daysSince(updatedAt);

    if (ageDays < 7) return 1;
    if (ageDays < 30) return 0.9;
    if (ageDays < 90) return 0.7;
    if (ageDays < 365) return 0.5;
    return 0.3;
  }

  private daysSince(date: Date): number {
    return Math.max(0, (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  }
}
