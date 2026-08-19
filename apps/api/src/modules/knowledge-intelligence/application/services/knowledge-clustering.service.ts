import { Injectable, Logger, Inject } from '@nestjs/common';
import type { IDocumentSimilarityRepository } from '../../domain/interfaces/document-similarity.repository.interface.js';
import type { IClusterRepository } from '../../domain/interfaces/cluster.repository.interface.js';
import type { IGraphNodeRepository } from '../../domain/interfaces/graph-node.repository.interface.js';
import type { IGraphEdgeRepository } from '../../domain/interfaces/graph-edge.repository.interface.js';

@Injectable()
export class KnowledgeClusteringService {
  private readonly logger = new Logger(KnowledgeClusteringService.name);

  constructor(
    @Inject('IDocumentSimilarityRepository')
    private readonly similarityRepo: IDocumentSimilarityRepository,
    @Inject('IClusterRepository')
    private readonly clusterRepo: IClusterRepository,
    @Inject('IGraphNodeRepository')
    private readonly nodeRepo: IGraphNodeRepository,
    @Inject('IGraphEdgeRepository')
    private readonly edgeRepo: IGraphEdgeRepository,
  ) {}

  async computeClusters(workspaceId: string, threshold = 0.6): Promise<any[]> {
    const parsedThreshold = Number(threshold);
    const boundedThreshold = Number.isFinite(parsedThreshold)
      ? Math.max(0, Math.min(parsedThreshold, 1))
      : 0.6;
    const similarities = await this.similarityRepo.findByWorkspace(
      workspaceId,
      'semantic',
      boundedThreshold,
      200,
    );
    const clusters: Map<string, Set<string>> = new Map();
    const nodeToCluster = new Map<string, string>();

    for (const sim of similarities) {
      const sCluster = nodeToCluster.get(sim.sourceId);
      const tCluster = nodeToCluster.get(sim.targetId);

      if (sCluster && tCluster) {
        if (sCluster === tCluster) continue;
        const union = new Set([...clusters.get(sCluster)!, ...clusters.get(tCluster)!]);
        const newClusterId = crypto.randomUUID();
        clusters.set(newClusterId, union);
        for (const nodeId of union) {
          nodeToCluster.set(nodeId, newClusterId);
        }
        clusters.delete(sCluster);
        clusters.delete(tCluster);
      } else if (sCluster) {
        clusters.get(sCluster)!.add(sim.targetId);
        nodeToCluster.set(sim.targetId, sCluster);
      } else if (tCluster) {
        clusters.get(tCluster)!.add(sim.sourceId);
        nodeToCluster.set(sim.sourceId, tCluster);
      } else {
        const clusterId = crypto.randomUUID();
        clusters.set(clusterId, new Set([sim.sourceId, sim.targetId]));
        nodeToCluster.set(sim.sourceId, clusterId);
        nodeToCluster.set(sim.targetId, clusterId);
      }
    }

    const results = [];
    for (const [clusterId, nodeIds] of clusters) {
      if (nodeIds.size < 2) continue;
      const name = `Cluster-${clusterId.slice(0, 8)}`;
      const cluster = await this.clusterRepo.create({
        workspaceId,
        name,
        description: `Auto-detected cluster with ${nodeIds.size} nodes`,
        nodeIds: [...nodeIds],
        properties: { algorithm: 'semantic_threshold', threshold: boundedThreshold },
      });
      results.push(cluster);
    }
    return results;
  }

  async listClusters(workspaceId: string): Promise<any[]> {
    return this.clusterRepo.findByWorkspace(workspaceId);
  }

  async getRelatedClusters(clusterId: string, _workspaceId: string): Promise<any[]> {
    const cluster = await this.clusterRepo.findById(clusterId);
    if (!cluster) return [];
    const related: any[] = [];
    for (const nodeId of cluster.nodeIds) {
      const neighbors = await this.edgeRepo.findAllBySource(nodeId);
      for (const edge of neighbors) {
        const targetCluster = await this.clusterRepo.findById(edge.targetId);
        if (targetCluster && targetCluster.id !== clusterId) {
          related.push({ cluster: targetCluster, viaNode: nodeId, edgeType: edge.type });
        }
      }
    }
    return related;
  }
}
