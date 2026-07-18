import { Injectable, Logger, Inject } from '@nestjs/common';
import type { IDocumentSimilarityRepository } from '../../domain/interfaces/document-similarity.repository.interface.js';
import type { IGraphNodeRepository } from '../../domain/interfaces/graph-node.repository.interface.js';
import type { IGraphEdgeRepository } from '../../domain/interfaces/graph-edge.repository.interface.js';

@Injectable()
export class DuplicateDetectionService {
  private readonly logger = new Logger(DuplicateDetectionService.name);

  constructor(
    @Inject('IDocumentSimilarityRepository')
    private readonly similarityRepo: IDocumentSimilarityRepository,
    @Inject('IGraphNodeRepository')
    private readonly nodeRepo: IGraphNodeRepository,
    @Inject('IGraphEdgeRepository')
    private readonly edgeRepo: IGraphEdgeRepository,
  ) {}

  async findDuplicates(
    workspaceId: string,
    entityId: string,
    threshold = 0.85,
  ): Promise<{ entityId: string; similarity: number; method: string }[]> {
    const all = await this.similarityRepo.similarTo(
      entityId,
      workspaceId,
      'semantic',
      threshold,
      20,
    );
    return all.filter((s) => s.similarity >= threshold).map((s) => ({ ...s, method: 'semantic' }));
  }

  async findNearDuplicatesGraph(
    workspaceId: string,
    threshold = 0.7,
  ): Promise<{ pair: [string, string]; similarity: number }[]> {
    const all = await this.similarityRepo.findByWorkspace(
      workspaceId,
      'graph_overlap',
      threshold,
      100,
    );
    return all.map((s) => ({
      pair: [s.sourceId, s.targetId] as [string, string],
      similarity: s.similarity,
    }));
  }

  async analyzeDuplicateCandidates(
    nodeId: string,
    workspaceId: string,
  ): Promise<{
    nodeId: string;
    duplicates: string[];
    nearDuplicates: string[];
    confidence: number;
  }> {
    const duplicates = await this.findDuplicates(workspaceId, nodeId, 0.9);
    const nearDuplicates = await this.findDuplicates(workspaceId, nodeId, 0.7);

    await this.edgeRepo.findAllBySource(nodeId, 'equivalent_to');
    return {
      nodeId,
      duplicates: duplicates.map((d) => d.entityId),
      nearDuplicates: nearDuplicates.map((d) => d.entityId),
      confidence: duplicates.length > 0 ? Math.min(1, duplicates.length / 3) : 0,
    };
  }
}
