import { Injectable, Logger, Inject } from '@nestjs/common';
import type { IDocumentSimilarityRepository } from '../../domain/interfaces/document-similarity.repository.interface.js';
import type { IGraphNodeRepository } from '../../domain/interfaces/graph-node.repository.interface.js';
import type { IGraphEdgeRepository } from '../../domain/interfaces/graph-edge.repository.interface.js';

@Injectable()
export class DocumentSimilarityService {
  private readonly logger = new Logger(DocumentSimilarityService.name);

  constructor(
    @Inject('IDocumentSimilarityRepository')
    private readonly similarityRepo: IDocumentSimilarityRepository,
    @Inject('IGraphNodeRepository')
    private readonly nodeRepo: IGraphNodeRepository,
    @Inject('IGraphEdgeRepository')
    private readonly edgeRepo: IGraphEdgeRepository,
  ) {}

  async computeSimilarity(
    sourceId: string,
    targetId: string,
    workspaceId: string,
  ): Promise<{ similarity: number; method: string }> {
    const sourceNode = await this.nodeRepo.findById(sourceId);
    const targetNode = await this.nodeRepo.findById(targetId);
    if (!sourceNode || !targetNode) return { similarity: 0, method: 'unknown' };

    const sourceEdges = await this.edgeRepo.findAllBySource(sourceId);
    const targetEdges = await this.edgeRepo.findAllBySource(targetId);

    const sourceTargets = new Set(sourceEdges.map((e) => e.targetId));
    const targetTargets = new Set(targetEdges.map((e) => e.targetId));

    let intersection = 0;
    for (const t of sourceTargets) {
      if (targetTargets.has(t)) intersection++;
    }
    const union = new Set([...sourceTargets, ...targetTargets]).size;
    const jaccard = union === 0 ? 0 : intersection / union;

    const existing = await this.similarityRepo.findByPair(
      workspaceId,
      sourceId,
      targetId,
      'graph_overlap',
    );
    if (existing) {
      await this.similarityRepo.create({
        workspaceId,
        sourceId,
        targetId,
        similarity: jaccard,
        method: 'graph_overlap',
      });
    }

    return { similarity: jaccard, method: 'graph_overlap' };
  }

  async recomputeAllSimilarities(workspaceId: string): Promise<{ pairs: number; updated: number }> {
    const { nodes } = await this.nodeRepo.findAllByWorkspace(workspaceId);
    if (!nodes || nodes.length === 0) return { pairs: 0, updated: 0 };
    let updated = 0;
    for (let i = 0; i < nodes.length; i++) {
      const sourceId = nodes[i]?.id;
      if (!sourceId) continue;
      for (let j = i + 1; j < nodes.length; j++) {
        const targetId = nodes[j]?.id;
        if (!targetId) continue;
        const result = await this.computeSimilarity(sourceId, targetId, workspaceId);
        if (result.similarity > 0.3) updated++;
      }
    }
    return { pairs: nodes.length * (nodes.length - 1), updated };
  }
}
