import { validate } from 'class-validator';
import { GraphSearchQueryDto, NeighborQueryDto, SubgraphQueryDto } from './graph-query.dto.js';

describe('Knowledge Intelligence graph query DTOs', () => {
  it.each(['   ', '...'])(
    'rejects a graph search query without searchable text: %j',
    async (query) => {
      const dto = Object.assign(new GraphSearchQueryDto(), { query });

      expect(await validate(dto)).not.toHaveLength(0);
    },
  );

  it('accepts only supported neighbor directions', async () => {
    const dto = Object.assign(new NeighborQueryDto(), { direction: 'sideways' });

    expect(await validate(dto)).not.toHaveLength(0);
  });

  it('requires a non-blank node list for subgraph requests', async () => {
    const dto = Object.assign(new SubgraphQueryDto(), { nodeIds: '' });

    expect(await validate(dto)).not.toHaveLength(0);
  });
});
