import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import { OntologyClass } from '../../domain/entities/ontology-class.entity.js';
import { OntologyRelation } from '../../domain/entities/ontology-relation.entity.js';
import type { IOntologyRepository } from '../../domain/interfaces/ontology.repository.interface.js';

const toProps = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});

@Injectable()
export class OntologyRepository implements IOntologyRepository {
  async findById(id: string): Promise<any | null> {
    const row = await prisma.ontologies.findUnique({ where: { id } });
    if (!row) return null;
    return {
      id: row.id,
      workspaceId: row.workspace_id,
      name: row.name,
      slug: row.slug,
      version: row.version,
      description: row.description,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async findBySlug(workspaceId: string, slug: string, version: string): Promise<any | null> {
    const row = await prisma.ontologies.findFirst({
      where: { workspace_id: workspaceId, slug, version },
    });
    if (!row) return null;
    return {
      id: row.id,
      workspaceId: row.workspace_id,
      name: row.name,
      slug: row.slug,
      version: row.version,
      description: row.description,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async findAllByWorkspace(workspaceId: string): Promise<any[]> {
    const rows = await prisma.ontologies.findMany({
      where: { workspace_id: workspaceId },
      orderBy: { created_at: 'desc' },
    });
    return rows.map((r) => ({
      id: r.id,
      workspaceId: r.workspace_id,
      name: r.name,
      slug: r.slug,
      version: r.version,
      description: r.description,
      isActive: r.is_active,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  }

  async create(data: {
    workspaceId: string;
    name: string;
    slug: string;
    version: string;
    description?: string | null;
  }): Promise<any> {
    const row = await prisma.ontologies.create({
      data: {
        workspace_id: data.workspaceId,
        name: data.name,
        slug: data.slug,
        version: data.version,
        description: data.description ?? null,
      },
    });
    return {
      id: row.id,
      workspaceId: row.workspace_id,
      name: row.name,
      slug: row.slug,
      version: row.version,
      description: row.description,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async findClassByUri(ontologyId: string, uri: string): Promise<OntologyClass | null> {
    const row = await prisma.ontology_classes.findFirst({
      where: { ontology_id: ontologyId, uri },
    });
    if (!row) return null;
    return OntologyClass.reconstitute({
      id: row.id,
      ontologyId: row.ontology_id,
      parentId: row.parent_id,
      uri: row.uri,
      label: row.label,
      description: row.description,
      properties: toProps(row.properties),
      sortOrder: row.sort_order,
      isAbstract: row.is_abstract,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async findAllClasses(ontologyId: string): Promise<OntologyClass[]> {
    const rows = await prisma.ontology_classes.findMany({
      where: { ontology_id: ontologyId },
      orderBy: { sort_order: 'asc' },
    });
    return rows.map((r) =>
      OntologyClass.reconstitute({
        id: r.id,
        ontologyId: r.ontology_id,
        parentId: r.parent_id,
        uri: r.uri,
        label: r.label,
        description: r.description,
        properties: toProps(r.properties),
        sortOrder: r.sort_order,
        isAbstract: r.is_abstract,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }),
    );
  }

  async findRelations(sourceUri: string, targetUri: string, relation?: string): Promise<any[]> {
    const where: any = {
      source_uri: sourceUri,
      target_uri: targetUri,
    };
    if (relation) where.relation = relation;
    return prisma.ontology_relations.findMany({ where });
  }

  async createClass(data: {
    ontologyId: string;
    parentId?: string | null;
    uri: string;
    label: string;
    description?: string | null;
    properties?: Record<string, unknown>;
    sortOrder?: number;
    isAbstract?: boolean;
  }): Promise<OntologyClass> {
    const row = await prisma.ontology_classes.create({
      data: {
        ontology_id: data.ontologyId,
        parent_id: data.parentId ?? null,
        uri: data.uri,
        label: data.label,
        description: data.description ?? null,
        properties: data.properties ?? {},
        sort_order: data.sortOrder ?? 0,
        is_abstract: data.isAbstract ?? false,
      },
    });
    return OntologyClass.reconstitute({
      id: row.id,
      ontologyId: row.ontology_id,
      parentId: row.parent_id,
      uri: row.uri,
      label: row.label,
      description: row.description,
      properties: toProps(row.properties),
      sortOrder: row.sort_order,
      isAbstract: row.is_abstract,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async createRelation(data: {
    ontologyId: string;
    sourceUri: string;
    targetUri: string;
    relation: string;
    properties?: Record<string, unknown>;
  }): Promise<OntologyRelation> {
    const row = await prisma.ontology_relations.create({
      data: {
        ontology_id: data.ontologyId,
        source_uri: data.sourceUri,
        target_uri: data.targetUri,
        relation: data.relation,
        properties: data.properties ?? {},
      },
    });
    return OntologyRelation.reconstitute({
      id: row.id,
      ontologyId: row.ontology_id,
      sourceUri: row.source_uri,
      targetUri: row.target_uri,
      relation: row.relation as any,
      properties: toProps(row.properties),
      createdAt: row.created_at,
    });
  }
}
