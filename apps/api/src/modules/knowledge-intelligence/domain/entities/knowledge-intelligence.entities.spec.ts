import {
  KnowledgeGraphNode,
  KnowledgeGraphEdge,
  KnowledgeGraphMetrics,
  KnowledgeCitation,
  KnowledgeCluster,
} from '../entities/index.js';

describe('Knowledge Intelligence Layer - Domain Entities', () => {
  describe('KnowledgeGraphNode', () => {
    it('should create a node', () => {
      const node = KnowledgeGraphNode.create({
        workspaceId: 'ws-1',
        type: 'document',
        entityType: 'knowledge',
        entityId: 'doc-1',
        label: 'Transformer Manual',
      });
      expect(node.id).toBeDefined();
      expect(node.workspaceId).toBe('ws-1');
      expect(node.label).toBe('Transformer Manual');
    });

    it('should update properties', () => {
      const node = KnowledgeGraphNode.create({
        workspaceId: 'ws-1',
        type: 'concept',
        entityType: 'knowledge',
        entityId: 'doc-1',
      });
      node.setProperty('language', 'fa');
      expect(node.properties.language).toBe('fa');
      expect(node.updatedAt).toBeDefined();
    });

    it('should reconstitute from data', () => {
      const now = new Date();
      const node = KnowledgeGraphNode.reconstitute({
        id: 'node-1',
        workspaceId: 'ws-1',
        type: 'standard',
        entityType: 'engineering_standard',
        entityId: 'std-1',
        label: 'IEC 60909',
        properties: { code: 'IEC-60909' },
        embeddingId: 'emb-1',
        createdAt: now,
        updatedAt: now,
      });
      expect(node.id).toBe('node-1');
      expect(node.type).toBe('standard');
      expect(node.entityId).toBe('std-1');
    });
  });

  describe('KnowledgeGraphEdge', () => {
    it('should create an edge', () => {
      const edge = KnowledgeGraphEdge.create({
        workspaceId: 'ws-1',
        sourceId: 'node-1',
        targetId: 'node-2',
        type: 'cites',
        weight: 0.8,
        properties: { context: 'Introduction section' },
      });
      expect(edge.sourceId).toBe('node-1');
      expect(edge.targetId).toBe('node-2');
      expect(edge.type).toBe('cites');
      expect(edge.weight).toBe(0.8);
    });
  });

  describe('KnowledgeGraphMetrics', () => {
    it('should create metrics with default scores', () => {
      const metrics = KnowledgeGraphMetrics.create({ nodeId: 'node-1' });
      expect(metrics.confidence).toBe(0.5);
      expect(metrics.freshness).toBe(0.5);
      expect(metrics.compositeScore()).toBe(0.5);
    });

    it('should update scores with clamping', () => {
      const metrics = KnowledgeGraphMetrics.create({ nodeId: 'node-1' });
      metrics.updateScores({ confidence: 1.5, freshness: -0.1 });
      expect(metrics.confidence).toBe(1.0);
      expect(metrics.freshness).toBe(0.0);
    });

    it('should record access', () => {
      const metrics = KnowledgeGraphMetrics.create({ nodeId: 'node-1' });
      expect(metrics.accessCount).toBe(0);
      metrics.recordAccess();
      expect(metrics.accessCount).toBe(1);
      expect(metrics.lastAccessedAt).not.toBeNull();
    });
  });

  describe('KnowledgeCitation', () => {
    it('should create a citation', () => {
      const citation = KnowledgeCitation.create({
        workspaceId: 'ws-1',
        sourceId: 'src-1',
        targetId: 'tgt-1',
        context: 'According to IEC 60909...',
        location: 'page 12',
        method: 'explicit',
        confidence: 0.95,
      });
      expect(citation.sourceId).toBe('src-1');
      expect(citation.method).toBe('explicit');
      expect(citation.confidence).toBe(0.95);
    });
  });

  describe('KnowledgeCluster', () => {
    it('should create a cluster', () => {
      const cluster = KnowledgeCluster.create({
        workspaceId: 'ws-1',
        name: 'Transformer Documents',
        description: 'All documents related to transformers',
        nodeIds: ['node-1', 'node-2', 'node-3'],
      });
      expect(cluster.nodeIds).toHaveLength(3);
      expect(cluster.name).toBe('Transformer Documents');
    });

    it('should update cluster data', () => {
      const cluster = KnowledgeCluster.create({
        workspaceId: 'ws-1',
        name: 'Old Name',
        nodeIds: ['node-1'],
      });
      cluster.update({ name: 'New Name', nodeIds: ['node-1', 'node-2'] });
      expect(cluster.name).toBe('New Name');
      expect(cluster.nodeIds).toHaveLength(2);
    });
  });
});
