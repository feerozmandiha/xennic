import { Injectable, Logger, Inject } from '@nestjs/common';
import type { ICitationRepository } from '../../domain/interfaces/citation.repository.interface.js';
import type { IGraphNodeRepository } from '../../domain/interfaces/graph-node.repository.interface.js';
import type { IGraphEdgeRepository } from '../../domain/interfaces/graph-edge.repository.interface.js';

@Injectable()
export class KnowledgeProvenanceService {
  private readonly logger = new Logger(KnowledgeProvenanceService.name);

  constructor(
    @Inject('ICitationRepository')
    private readonly citationRepo: ICitationRepository,
    @Inject('IGraphNodeRepository')
    private readonly nodeRepo: IGraphNodeRepository,
    @Inject('IGraphEdgeRepository')
    private readonly edgeRepo: IGraphEdgeRepository,
  ) {}

  async buildProvenanceChain(
    nodeId: string,
    maxDepth = 10,
  ): Promise<{
    nodeId: string;
    provenance: { step: number; nodeId: string; source: string; evidence: string }[];
  }> {
    const provenance: { step: number; nodeId: string; source: string; evidence: string }[] = [];
    const visited = new Set<string>();
    let step = 0;

    const outgoing = await this.edgeRepo.findAllBySource(nodeId);
    for (const edge of outgoing) {
      if (edge.type === 'derived_from' || edge.type === 'references' || edge.type === 'cites') {
        const targetNode = await this.nodeRepo.findById(edge.targetId);
        if (targetNode && !visited.has(edge.targetId)) {
          visited.add(edge.targetId);
          step += 1;
          provenance.push({
            step,
            nodeId: edge.targetId,
            source: targetNode.entityType,
            evidence: edge.type,
          });
          await this._recursiveProvenance(edge.targetId, visited, provenance, maxDepth, step);
        }
      }
    }

    return { nodeId, provenance };
  }

  private async _recursiveProvenance(
    nodeId: string,
    visited: Set<string>,
    provenance: { step: number; nodeId: string; source: string; evidence: string }[],
    maxDepth: number,
    currentStep: number,
  ): Promise<void> {
    if (currentStep >= maxDepth) return;
    const outgoing = await this.edgeRepo.findAllBySource(nodeId);
    for (const edge of outgoing) {
      if (edge.type === 'derived_from' || edge.type === 'references') {
        const targetNode = await this.nodeRepo.findById(edge.targetId);
        if (targetNode && !visited.has(edge.targetId)) {
          visited.add(edge.targetId);
          const step = provenance.length + 1;
          provenance.push({
            step,
            nodeId: edge.targetId,
            source: targetNode.entityType,
            evidence: edge.type,
          });
          await this._recursiveProvenance(edge.targetId, visited, provenance, maxDepth, step);
        }
      }
    }
  }

  async traceKnowledgeOrigin(
    nodeId: string,
  ): Promise<{ originId: string; path: string[]; hops: number } | null> {
    const ancestors = await this.edgeRepo.findAllByTarget(nodeId);
    if (ancestors.length === 0) return { originId: nodeId, path: [nodeId], hops: 0 };

    let currentId = nodeId;
    const path: string[] = [nodeId];
    const visited = new Set<string>([nodeId]);

    while (ancestors.length > 0 && path.length < 20) {
      const parent = ancestors.find((a) => !visited.has(a.sourceId));
      if (!parent) break;
      visited.add(parent.sourceId);
      currentId = parent.sourceId;
      path.unshift(currentId);
      const nextAncestors = await this.edgeRepo.findAllByTarget(currentId);
      ancestors.splice(0, ancestors.length, ...nextAncestors);
    }

    return { originId: currentId, path, hops: path.length - 1 };
  }
}
