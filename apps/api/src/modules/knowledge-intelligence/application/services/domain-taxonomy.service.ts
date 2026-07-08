import { Injectable, Logger, Inject } from '@nestjs/common';
import type { IOntologyRepository } from '../../domain/interfaces/ontology.repository.interface.js';
import type { IGraphNodeRepository } from '../../domain/interfaces/graph-node.repository.interface.js';
import type { IGraphEdgeRepository } from '../../domain/interfaces/graph-edge.repository.interface.js';

@Injectable()
export class DomainTaxonomyService {
  private readonly logger = new Logger(DomainTaxonomyService.name);

  constructor(
    @Inject('IOntologyRepository')
    private readonly ontologyRepo: IOntologyRepository,
    @Inject('IGraphNodeRepository')
    private readonly nodeRepo: IGraphNodeRepository,
    @Inject('IGraphEdgeRepository')
    private readonly edgeRepo: IGraphEdgeRepository,
  ) {}

  async classifyNode(nodeId: string, ontologyClassUri: string): Promise<any> {
    const node = await this.nodeRepo.findById(nodeId);
    if (!node) return null;

    const ontologyClass = await this.ontologyRepo.findClassByUri(node.workspaceId, ontologyClassUri);

    if (!ontologyClass) {
      this.logger.warn(`Ontology class ${ontologyClassUri} not found`);
      return null;
    }

    await this.edgeRepo.create({
      workspaceId: node.workspaceId,
      sourceId: nodeId,
      targetId: ontologyClassUri,
      type: 'equivalent_to',
      weight: 1.0,
      properties: { classificationSource: 'taxonomy' },
    });

    return { nodeId, classUri: ontologyClassUri, label: ontologyClass.label, confidence: 1.0 };
  }

  async getTaxonomyHierarchy(workspaceId: string): Promise<any[]> {
    const ontologies = await this.ontologyRepo.findAllByWorkspace(workspaceId);
    const hierarchy: any[] = [];
    for (const ontology of ontologies) {
      const classes = await this.ontologyRepo.findAllClasses(ontology.id);
      hierarchy.push({
        ontology: { id: ontology.id, name: ontology.name, version: ontology.version },
        classes: classes.map((c) => ({
          id: c.id,
          uri: c.uri,
          label: c.label,
          parentId: c.parentId,
          isAbstract: c.isAbstract,
        })),
      });
    }
    return hierarchy;
  }
}
