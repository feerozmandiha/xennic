import { Injectable, Logger, Inject } from '@nestjs/common';
import type { IGraphNodeRepository } from '../../domain/interfaces/graph-node.repository.interface.js';
import type { IGraphEdgeRepository } from '../../domain/interfaces/graph-edge.repository.interface.js';
import type { IGraphTraversalRepository } from '../../domain/interfaces/graph-traversal.repository.interface.js';

@Injectable()
export class ConflictDetectionService {
  private readonly logger = new Logger(ConflictDetectionService.name);

  constructor(
    @Inject('IGraphNodeRepository')
    private readonly nodeRepo: IGraphNodeRepository,
    @Inject('IGraphEdgeRepository')
    private readonly edgeRepo: IGraphEdgeRepository,
    @Inject('IGraphTraversalRepository')
    private readonly traversalRepo: IGraphTraversalRepository,
  ) {}

  async detectSupersededConflicts(
    nodeId: string,
  ): Promise<{ nodeId: string; supersededBy: string[]; conflictType: string }[]> {
    const supersededBy = await this.edgeRepo.findAllByTarget(nodeId, 'supersedes');
    const supersedes = await this.edgeRepo.findAllBySource(nodeId, 'supersedes');

    const conflicts: { nodeId: string; supersededBy: string[]; conflictType: string }[] = [];
    for (const edge of supersededBy) {
      conflicts.push({
        nodeId: edge.sourceId,
        supersededBy: [nodeId],
        conflictType: 'superseded_by_active',
      });
    }
    for (const edge of supersedes) {
      conflicts.push({
        nodeId: edge.targetId,
        supersededBy: [nodeId],
        conflictType: 'supersedes_active',
      });
    }
    return conflicts;
  }

  async detectEquivalentConflicts(
    nodeId: string,
  ): Promise<{ nodeId: string; equivalentNodes: string[]; conflictType: string }[]> {
    const equivalents = await this.edgeRepo.findAllBySource(nodeId, 'equivalent_to');
    if (equivalents.length > 0) {
      return [
        {
          nodeId,
          equivalentNodes: equivalents.map((e) => e.targetId),
          conflictType: 'multiple_equivalents',
        },
      ];
    }
    return [];
  }

  async detectDisjointViolations(
    nodeId: string,
    _ontologyId: string,
  ): Promise<{ source: string; target: string; relation: string }[]> {
    const ancestors = await this.traversalRepo.ancestors(nodeId, 5);
    const violations: { source: string; target: string; relation: string }[] = [];
    for (const ancestor of ancestors) {
      const equivalentTo = await this.edgeRepo.findAllBySource(ancestor.nodeId, 'equivalent_to');
      for (const eq of equivalentTo) {
        const otherAncestors = await this.traversalRepo.ancestors(eq.targetId, 5);
        for (const other of otherAncestors) {
          if (ancestor.nodeId !== other.nodeId) {
            violations.push({
              source: ancestor.nodeId,
              target: other.nodeId,
              relation: 'disjoint_with',
            });
          }
        }
      }
    }
    return violations;
  }
}
