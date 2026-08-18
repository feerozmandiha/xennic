import { Module } from '@nestjs/common';
import { GraphController } from './presentation/controllers/graph.controller.js';
import { OntologyController } from './presentation/controllers/ontology.controller.js';
import { CitationsController } from './presentation/controllers/citations.controller.js';
import { GraphSearchController } from './presentation/controllers/graph-search.controller.js';
import { MetricsController } from './presentation/controllers/metrics.controller.js';
import { ClustersController } from './presentation/controllers/clusters.controller.js';
import { GraphWorkspaceGuard } from './presentation/guards/graph-workspace.guard.js';

import { GraphTraversalService } from './application/services/graph-traversal.service.js';
import { SemanticExpansionService } from './application/services/semantic-expansion.service.js';
import { CitationExpansionService } from './application/services/citation-expansion.service.js';
import { DependencyResolutionService } from './application/services/dependency-resolution.service.js';
import { ConflictDetectionService } from './application/services/conflict-detection.service.js';
import { DuplicateDetectionService } from './application/services/duplicate-detection.service.js';
import { KnowledgeClusteringService } from './application/services/knowledge-clustering.service.js';
import { OntologyRegistryService } from './application/services/ontology-registry.service.js';
import { DomainTaxonomyService } from './application/services/domain-taxonomy.service.js';
import { KnowledgeProvenanceService } from './application/services/knowledge-provenance.service.js';
import { KnowledgeMetricsService } from './application/services/knowledge-metrics.service.js';
import { KnowledgeAuthorityService } from './application/services/knowledge-authority.service.js';
import { KnowledgeCompletenessService } from './application/services/knowledge-completeness.service.js';
import { KnowledgeFreshnessService } from './application/services/knowledge-freshness.service.js';
import { KnowledgeConfidenceService } from './application/services/knowledge-confidence.service.js';
import { HybridSearchService } from './application/services/hybrid-search.service.js';
import { GraphSearchService } from './application/services/graph-search.service.js';
import { DocumentSimilarityService } from './application/services/document-similarity.service.js';

import { GraphNodeRepository } from './infrastructure/repositories/graph-node.repository.js';
import { GraphEdgeRepository } from './infrastructure/repositories/graph-edge.repository.js';
import { GraphMetricsRepository } from './infrastructure/repositories/graph-metrics.repository.js';
import { GraphTraversalRepository } from './infrastructure/repositories/graph-traversal.repository.js';
import { OntologyRepository } from './infrastructure/repositories/ontology.repository.js';
import { CitationRepository } from './infrastructure/repositories/citation.repository.js';
import { DocumentSimilarityRepository } from './infrastructure/repositories/document-similarity.repository.js';
import { ClusterRepository } from './infrastructure/repositories/cluster.repository.js';

import { WorkspaceModule } from '../workspace/workspace.module.js';
import { RbacModule } from '../rbac/rbac.module.js';
import { KnowledgeModule } from '../knowledge/knowledge.module.js';
import { KnowledgeFactoryModule } from '../knowledge-factory/knowledge-factory.module.js';

@Module({
  imports: [WorkspaceModule, RbacModule, KnowledgeModule, KnowledgeFactoryModule],
  controllers: [
    GraphController,
    OntologyController,
    CitationsController,
    GraphSearchController,
    MetricsController,
    ClustersController,
  ],
  providers: [
    GraphWorkspaceGuard,
    GraphTraversalService,
    SemanticExpansionService,
    CitationExpansionService,
    DependencyResolutionService,
    ConflictDetectionService,
    DuplicateDetectionService,
    KnowledgeClusteringService,
    OntologyRegistryService,
    DomainTaxonomyService,
    KnowledgeProvenanceService,
    KnowledgeMetricsService,
    KnowledgeAuthorityService,
    KnowledgeCompletenessService,
    KnowledgeFreshnessService,
    KnowledgeConfidenceService,
    HybridSearchService,
    GraphSearchService,
    DocumentSimilarityService,
    { provide: 'IGraphNodeRepository', useClass: GraphNodeRepository },
    { provide: 'IGraphEdgeRepository', useClass: GraphEdgeRepository },
    { provide: 'IGraphMetricsRepository', useClass: GraphMetricsRepository },
    { provide: 'IGraphTraversalRepository', useClass: GraphTraversalRepository },
    GraphNodeRepository,
    GraphEdgeRepository,
    GraphMetricsRepository,
    { provide: 'IOntologyRepository', useClass: OntologyRepository },
    { provide: 'ICitationRepository', useClass: CitationRepository },
    { provide: 'IDocumentSimilarityRepository', useClass: DocumentSimilarityRepository },
    { provide: 'IClusterRepository', useClass: ClusterRepository },
  ],
  exports: [
    GraphTraversalService,
    SemanticExpansionService,
    CitationExpansionService,
    ConflictDetectionService,
    DuplicateDetectionService,
    KnowledgeClusteringService,
    OntologyRegistryService,
    DomainTaxonomyService,
    KnowledgeProvenanceService,
    KnowledgeMetricsService,
    KnowledgeAuthorityService,
    KnowledgeCompletenessService,
    KnowledgeFreshnessService,
    KnowledgeConfidenceService,
    HybridSearchService,
    GraphSearchService,
    DocumentSimilarityService,
    { provide: 'IGraphNodeRepository', useClass: GraphNodeRepository },
    { provide: 'IGraphEdgeRepository', useClass: GraphEdgeRepository },
    { provide: 'IGraphMetricsRepository', useClass: GraphMetricsRepository },
  ],
})
export class KnowledgeIntelligenceModule {}
