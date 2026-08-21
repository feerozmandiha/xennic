import { validate } from 'class-validator';
import { ClassifyGraphNodeDto, RegisterOntologyDto } from './ontology.dto.js';

describe('Knowledge Intelligence ontology DTOs', () => {
  it('rejects blank ontology identifiers', async () => {
    const dto = Object.assign(new RegisterOntologyDto(), {
      name: 'Ontology',
      slug: '   ',
      version: '1.0.0',
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'slug')).toBe(true);
  });

  it('bounds class URIs and rejects whitespace-only values', async () => {
    const dto = Object.assign(new ClassifyGraphNodeDto(), { classUri: '   ' });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'classUri')).toBe(true);
  });
});
