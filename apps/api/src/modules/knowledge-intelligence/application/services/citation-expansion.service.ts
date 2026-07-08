import { Injectable, Logger, Inject } from '@nestjs/common';
import type { ICitationRepository } from '../../domain/interfaces/citation.repository.interface.js';
import type { IGraphNodeRepository } from '../../domain/interfaces/graph-node.repository.interface.js';

@Injectable()
export class CitationExpansionService {
  private readonly logger = new Logger(CitationExpansionService.name);

  constructor(
    @Inject('ICitationRepository')
    private readonly citationRepo: ICitationRepository,
    @Inject('IGraphNodeRepository')
    private readonly nodeRepo: IGraphNodeRepository,
  ) {}

  async expand(sourceId: string, maxDepth = 3): Promise<{ targetId: string; depth: number; path: string[]; confidence: number }[]> {
    const results: { targetId: string; depth: number; path: string[]; confidence: number }[] = [];
    const visited = new Set<string>();
    const queue: { nodeId: string; depth: number; path: string[]; confidence: number }[] = [
      { nodeId: sourceId, depth: 0, path: [sourceId], confidence: 1.0 },
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.depth >= maxDepth) continue;

      const citations = await this.citationRepo.findBySource(current.nodeId);
      for (const citation of citations) {
        if (visited.has(citation.targetId)) continue;
        visited.add(citation.targetId);

        const newConfidence = current.confidence * citation.confidence;
        const newPath = [...current.path, citation.targetId];
        results.push({ targetId: citation.targetId, depth: current.depth + 1, path: newPath, confidence: newConfidence });

        queue.push({ nodeId: citation.targetId, depth: current.depth + 1, path: newPath, confidence: newConfidence });
      }
    }

    return results.sort((a, b) => b.confidence - a.confidence);
  }

  async getCitationGraph(workspaceId: string, sourceId?: string, targetId?: string): Promise<any[]> {
    const citations = await this.citationRepo.findByWorkspace(workspaceId, sourceId, targetId);
    const sourceNodes = new Set(citations.map((c) => c.sourceId));
    const targetNodes = new Set(citations.map((c) => c.targetId));
    const allNodeIds = [...new Set([...sourceNodes, ...targetNodes])];

    const nodeMap = new Map<string, any>();
    for (const nodeId of allNodeIds) {
      const node = await this.nodeRepo.findById(nodeId);
      if (node) nodeMap.set(nodeId, node);
    }

    return citations.map((c) => ({
      id: c.id,
      source: nodeMap.get(c.sourceId) ? { id: c.sourceId, label: nodeMap.get(c.sourceId).label } : { id: c.sourceId, label: null },
      target: nodeMap.get(c.targetId) ? { id: c.targetId, label: nodeMap.get(c.targetId).label } : { id: c.targetId, label: null },
      context: c.context,
      location: c.location,
      method: c.method,
      confidence: c.confidence,
    }));
  }
}
