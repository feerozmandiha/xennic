import { Test, TestingModule } from '@nestjs/testing';
import { OntologyResolverService } from '../application/services/ontology-resolver.service.js';
import type { ExtractedEntity } from '../domain/pipeline-events.js';

describe('OntologyResolverService', () => {
  let service: OntologyResolverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OntologyResolverService],
    }).compile();
    service = module.get<OntologyResolverService>(OntologyResolverService);
  });

  it('resolves known equipment entities to ontology concepts', () => {
    const entities: ExtractedEntity[] = [
      { id: 'e1', type: 'equipment', value: 'Transformer', confidence: 0.9, metadata: {} },
      { id: 'e2', type: 'equipment', value: 'Circuit Breaker', confidence: 0.85, metadata: {} },
    ];
    const concepts = service.resolve(entities);
    expect(concepts.length).toBe(2);
    expect(concepts.some((c) => c.conceptId === 'concept:transformer')).toBe(true);
    expect(concepts.some((c) => c.conceptId === 'concept:circuit-breaker')).toBe(true);
  });

  it('resolves to parent concepts', () => {
    const entities: ExtractedEntity[] = [
      { id: 'e1', type: 'equipment', value: 'Induction Motor', confidence: 0.8, metadata: {} },
    ];
    const concepts = service.resolve(entities);
    expect(concepts.length).toBe(1);
    expect(concepts[0].parentIds).toContain('concept:rotating-machine');
  });

  it('deduplicates repeated concept references', () => {
    const entities: ExtractedEntity[] = [
      { id: 'e1', type: 'equipment', value: 'Power Transformer', confidence: 0.9, metadata: {} },
      { id: 'e2', type: 'equipment', value: 'Distribution Transformer', confidence: 0.8, metadata: {} },
    ];
    const concepts = service.resolve(entities);
    const transformerConcepts = concepts.filter((c) => c.conceptId === 'concept:transformer');
    expect(transformerConcepts.length).toBe(1);
  });

  it('returns empty array for unrecognized entities', () => {
    const entities: ExtractedEntity[] = [
      { id: 'e1', type: 'standard', value: 'IEC 60947', confidence: 0.9, metadata: {} },
    ];
    const concepts = service.resolve(entities);
    expect(concepts).toHaveLength(0);
  });
});
