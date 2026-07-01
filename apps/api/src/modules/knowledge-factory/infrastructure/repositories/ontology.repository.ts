import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { OntologyEntityProps, OntologyRelationshipProps, OntologySynonymProps } from '../../domain/ontology.types.js';
import type { IOntologyRepository } from '../../domain/interfaces/ontology.repository.interface.js';

@Injectable()
export class OntologyRepository implements IOntologyRepository {
  async saveEntity(entity: OntologyEntityProps): Promise<void> {
    await prisma.ontology_entities.create({
      data: {
        id: entity.id,
        iri: entity.iri,
        canonical_id: entity.canonicalId,
        label: entity.label,
        description: entity.description,
        entity_type: entity.entityType,
        confidence: entity.confidence,
        evidence: entity.evidence,
        metadata: entity.metadata,
      },
    });
  }

  async updateEntity(entity: OntologyEntityProps): Promise<void> {
    await prisma.ontology_entities.update({
      where: { id: entity.id },
      data: {
        iri: entity.iri,
        canonical_id: entity.canonicalId,
        label: entity.label,
        description: entity.description,
        entity_type: entity.entityType,
        confidence: entity.confidence,
        evidence: entity.evidence,
        metadata: entity.metadata,
      },
    });
  }

  async deleteEntity(id: string): Promise<void> {
    await prisma.ontology_entities.delete({ where: { id } });
  }

  async findEntityByIri(iri: string): Promise<OntologyEntityProps | null> {
    const row = await prisma.ontology_entities.findUnique({ where: { iri } });
    return row ? this.toEntityProps(row) : null;
  }

  async findEntityByCanonicalId(canonicalId: string): Promise<OntologyEntityProps | null> {
    const row = await prisma.ontology_entities.findUnique({ where: { canonical_id: canonicalId } });
    return row ? this.toEntityProps(row) : null;
  }

  async findEntityByLabel(label: string): Promise<OntologyEntityProps[]> {
    const rows = await prisma.ontology_entities.findMany({
      where: {
        OR: [
          { label: { contains: label, mode: 'insensitive' } },
          { synonyms: { some: { alias: { contains: label, mode: 'insensitive' } } } },
        ],
      },
    });
    return rows.map(this.toEntityProps);
  }

  async getSynonyms(entityId: string): Promise<OntologySynonymProps[]> {
    const rows = await prisma.ontology_synonyms.findMany({
      where: { entity_id: entityId },
    });
    return rows.map((r) => ({
      id: r.id,
      entityId: r.entity_id,
      alias: r.alias,
      language: r.language,
      isPreferred: r.is_preferred,
    }));
  }

  async addSynonym(synonym: OntologySynonymProps): Promise<void> {
    await prisma.ontology_synonyms.create({
      data: {
        id: synonym.id,
        entity_id: synonym.entityId,
        alias: synonym.alias,
        language: synonym.language,
        is_preferred: synonym.isPreferred,
      },
    });
  }

  async removeSynonym(id: string): Promise<void> {
    await prisma.ontology_synonyms.delete({ where: { id } });
  }

  async saveRelationship(rel: OntologyRelationshipProps): Promise<void> {
    await prisma.ontology_relationships.create({
      data: {
        id: rel.id,
        source_entity_id: rel.sourceEntityId,
        target_entity_id: rel.targetEntityId,
        relationship_type: rel.relationshipType,
        confidence: rel.confidence,
        evidence: rel.evidence,
      },
    });
  }

  async getRelationships(entityId: string): Promise<OntologyRelationshipProps[]> {
    const rows = await prisma.ontology_relationships.findMany({
      where: {
        OR: [{ source_entity_id: entityId }, { target_entity_id: entityId }],
      },
    });
    return rows.map((r) => ({
      id: r.id,
      sourceEntityId: r.source_entity_id,
      targetEntityId: r.target_entity_id,
      relationshipType: r.relationship_type,
      confidence: r.confidence,
      evidence: r.evidence as Record<string, unknown>,
      createdAt: r.created_at,
    }));
  }

  private toEntityProps(row: any): OntologyEntityProps {
    return {
      id: row.id,
      iri: row.iri,
      canonicalId: row.canonical_id,
      label: row.label,
      description: row.description ?? undefined,
      entityType: row.entity_type ?? undefined,
      confidence: row.confidence,
      evidence: row.evidence as Record<string, unknown>,
      metadata: row.metadata as Record<string, unknown>,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
