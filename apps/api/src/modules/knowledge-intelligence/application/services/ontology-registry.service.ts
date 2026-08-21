import { ForbiddenException, Injectable, Logger, Inject } from '@nestjs/common';
import type { IOntologyRepository } from '../../domain/interfaces/ontology.repository.interface.js';

@Injectable()
export class OntologyRegistryService {
  private readonly logger = new Logger(OntologyRegistryService.name);

  constructor(
    @Inject('IOntologyRepository')
    private readonly ontologyRepo: IOntologyRepository,
  ) {}

  async registerOntology(data: {
    workspaceId: string;
    name: string;
    slug: string;
    version: string;
    description?: string;
  }): Promise<any> {
    const existing = await this.ontologyRepo.findBySlug(data.workspaceId, data.slug, data.version);
    if (existing) {
      this.logger.warn(
        `Ontology ${data.slug}@${data.version} already exists for workspace ${data.workspaceId}`,
      );
      return existing;
    }
    return this.ontologyRepo.create(data);
  }

  async getActiveOntologies(workspaceId: string): Promise<any[]> {
    const all = await this.ontologyRepo.findAllByWorkspace(workspaceId);
    return all.filter((o) => o.isActive);
  }

  async getOntologyClass(ontologyId: string, uri: string): Promise<any | null> {
    return this.ontologyRepo.findClassByUri(ontologyId, uri);
  }

  async listClasses(ontologyId: string, workspaceId: string): Promise<any[]> {
    const ontology = await this.ontologyRepo.findById(ontologyId);
    if (ontology && ontology.workspaceId !== workspaceId) {
      throw new ForbiddenException('Ontology does not belong to the active workspace');
    }
    return ontology ? this.ontologyRepo.findAllClasses(ontologyId) : [];
  }
}
