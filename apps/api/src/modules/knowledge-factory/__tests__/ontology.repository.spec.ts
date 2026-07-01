jest.mock('@xennic/database', () => ({
  prisma: {
    ontology_entities: {
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
      findUnique: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
    },
    ontology_synonyms: {
      create: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
      findMany: jest.fn().mockResolvedValue([]),
    },
    ontology_relationships: {
      create: jest.fn().mockResolvedValue({}),
      findMany: jest.fn().mockResolvedValue([]),
    },
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { OntologyRepository } from '../infrastructure/repositories/ontology.repository.js';

describe('OntologyRepository', () => {
  let repo: OntologyRepository;
  const mockEntity = {
    id: 'onto-1', iri: 'xennic:transformer', canonicalId: 'concept:transformer',
    label: 'Transformer', confidence: 0.95, evidence: {}, metadata: {},
    createdAt: new Date(), updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OntologyRepository],
    }).compile();
    repo = module.get<OntologyRepository>(OntologyRepository);
  });

  it('saves an ontology entity', async () => {
    await expect(repo.saveEntity(mockEntity)).resolves.toBeUndefined();
  });

  it('updates an ontology entity', async () => {
    await expect(repo.updateEntity(mockEntity)).resolves.toBeUndefined();
  });

  it('deletes an ontology entity', async () => {
    await expect(repo.deleteEntity('onto-1')).resolves.toBeUndefined();
  });

  it('findEntityByIri returns null when not found', async () => {
    const result = await repo.findEntityByIri('xennic:nonexistent');
    expect(result).toBeNull();
  });

  it('findEntityByCanonicalId returns null when not found', async () => {
    const result = await repo.findEntityByCanonicalId('concept:nonexistent');
    expect(result).toBeNull();
  });

  it('findEntityByLabel returns empty', async () => {
    const results = await repo.findEntityByLabel('Transformer');
    expect(results).toHaveLength(0);
  });

  it('getSynonyms returns empty', async () => {
    const synonyms = await repo.getSynonyms('onto-1');
    expect(synonyms).toHaveLength(0);
  });

  it('adds and removes synonyms', async () => {
    await expect(repo.addSynonym({
      id: 'syn-1', entityId: 'onto-1',
      alias: 'ترانسفورماتور', language: 'fa', isPreferred: true,
    })).resolves.toBeUndefined();
    await expect(repo.removeSynonym('syn-1')).resolves.toBeUndefined();
  });

  it('handles relationships lifecycle', async () => {
    const rel = {
      id: 'rel-1', sourceEntityId: 'onto-1', targetEntityId: 'onto-2',
      relationshipType: 'is_a', confidence: 0.9, evidence: {}, createdAt: new Date(),
    };
    await expect(repo.saveRelationship(rel)).resolves.toBeUndefined();
    const rels = await repo.getRelationships('onto-1');
    expect(rels).toHaveLength(0);
  });
});
