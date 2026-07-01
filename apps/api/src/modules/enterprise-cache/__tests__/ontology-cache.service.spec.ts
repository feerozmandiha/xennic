import { OntologyCacheService } from '../application/services/ontology-cache.service.js';

describe('OntologyCacheService', () => {
  let service: OntologyCacheService;

  beforeEach(() => {
    service = new OntologyCacheService();
  });

  it('stores and retrieves relationships', async () => {
    await service.storeRelationships('transformer', ['voltage-regulator', 'load-tap-changer']);
    const rels = await service.getRelationships('transformer');
    expect(rels).toEqual(['voltage-regulator', 'load-tap-changer']);
  });

  it('returns null for unknown concept', async () => {
    const rels = await service.getRelationships('nonexistent');
    expect(rels).toBeNull();
  });

  it('overwrites existing relationships', async () => {
    await service.storeRelationships('cable', ['wire']);
    await service.storeRelationships('cable', ['conductor', 'insulator']);
    const rels = await service.getRelationships('cable');
    expect(rels).toHaveLength(2);
    expect(rels).toContain('conductor');
  });
});
