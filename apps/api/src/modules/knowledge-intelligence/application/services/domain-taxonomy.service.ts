import { Injectable, Logger, Inject } from '@nestjs/common';
import type { IOntologyRepository } from '../../domain/interfaces/ontology.repository.interface.js';
import type { IGraphNodeRepository } from '../../domain/interfaces/graph-node.repository.interface.js';

@Injectable()
export class DomainTaxonomyService {
  private readonly logger = new Logger(DomainTaxonomyService.name);

  constructor(
    @Inject('IOntologyRepository')
    private readonly ontologyRepo: IOntologyRepository,
    @Inject('IGraphNodeRepository')
    private readonly nodeRepo: IGraphNodeRepository,
  ) {}

  async classifyNode(nodeId: string, ontologyClassUri: string): Promise<any> {
    const node = await this.nodeRepo.findById(nodeId);
    if (!node) return null;

    const ontologies = await this.ontologyRepo.findAllByWorkspace(node.workspaceId);
    let ontologyClass = null;
    for (const ontology of ontologies) {
      ontologyClass = await this.ontologyRepo.findClassByUri(ontology.id, ontologyClassUri);
      if (ontologyClass) break;
    }

    if (!ontologyClass) {
      this.logger.warn(`Ontology class ${ontologyClassUri} not found`);
      return null;
    }

    // Ontology classes are not graph nodes and therefore cannot be used as the
    // target of a knowledge_graph_edges row (the database enforces a graph-node
    // foreign key). Persist classification on the node itself instead.
    const existing = Array.isArray(node.properties.taxonomyClasses)
      ? (node.properties.taxonomyClasses as unknown[])
      : [];
    const taxonomyClasses = [
      ...existing.filter(
        (item) =>
          !item ||
          typeof item !== 'object' ||
          (item as Record<string, unknown>).classUri !== ontologyClassUri,
      ),
      {
        classUri: ontologyClassUri,
        ontologyId: ontologyClass.ontologyId,
        label: ontologyClass.label,
        confidence: 1.0,
        classifiedAt: new Date().toISOString(),
      },
    ];
    await this.nodeRepo.update(nodeId, {
      properties: { ...node.properties, taxonomyClasses },
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
