import type { KnowledgeGraphMetrics } from '../../domain/entities/graph-metrics.entity.js';

export interface IGraphMetricsRepository {
  findByNodeId(nodeId: string): Promise<KnowledgeGraphMetrics | null>;
  save(metrics: { nodeId: string; confidence: number; freshness: number; authority: number; completeness: number; accessCount?: number; lastAccessedAt?: Date | null }): Promise<KnowledgeGraphMetrics>;
  incrementAccess(nodeId: string): Promise<void>;
  topNodesByMetric(workspaceId: string, metric: 'confidence' | 'freshness' | 'authority' | 'completeness', limit: number): Promise<{ nodeId: string; score: number }[]>;
}
