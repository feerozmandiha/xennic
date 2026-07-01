import { Test, TestingModule } from '@nestjs/testing';
import { ConflictResolver } from '../application/services/conflict-resolver.service.js';

let nextXid = 0;
function makeChunk(chunkId: string, tier: any, taxonomy: string[], authorityScore: number, content: string, status = 'active') {
  const xid = `XID-${++nextXid}`;
  return {
    chunkId, knowledgeObjectId: 'ko-1', content, score: 0.8,
    metadata: { title: '', xid, tier, language: 'en', version: 1, status: status as any, authorityScore, taxonomy, ontology: [] },
  };
}

describe('ConflictResolver', () => {
  let service: ConflictResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConflictResolver],
    }).compile();
    service = module.get<ConflictResolver>(ConflictResolver);
  });

  it('prefers project specification over other sources', async () => {
    const projectSpec = makeChunk('c1', 'platinum', ['project-spec'], 0.9, 'voltage must be 400kV');
    const academic = makeChunk('c2', 'bronze', ['academic'], 0.8, 'voltage should be 230kV');
    const result = await service.resolve([academic, projectSpec], 'voltage level');
    expect(result.preferredSource).toBe('XID-1');
    expect(result.explanation).toContain('Project Specification');
  });

  it('prefers national regulation over manufacturer docs', async () => {
    const regulation = makeChunk('c1', 'gold', ['regulation'], 0.8, 'safety class I required');
    const manufacturer = makeChunk('c2', 'silver', ['manufacturer'], 0.9, 'safety class II recommended');
    const result = await service.resolve([manufacturer, regulation], 'safety requirement');
    expect(result.preferredSource).toBe('XID-3');
    expect(result.explanation).toContain('National Regulation');
    expect(result.explanation).toContain('National Regulation');
  });

  it('prefers tier 1 standard over academic', async () => {
    const std = makeChunk('c1', 'silver', ['standard'], 0.7, 'test method A is required');
    const academic = makeChunk('c2', 'bronze', ['academic'], 0.9, 'test method B is sufficient');
    const result = await service.resolve([academic, std], 'testing method');
    expect(result.preferredSource).toBe('XID-5');
    expect(result.explanation).toContain('Tier 1 Standard');
  });

  it('uses authority score as tiebreaker for same priority', async () => {
    const higher = makeChunk('c1', 'silver', ['manufacturer'], 0.95, 'dimensions are 100x200mm');
    const lower = makeChunk('c2', 'silver', ['manufacturer'], 0.7, 'dimensions are 150x250mm');
    const result = await service.resolve([lower, higher], 'dimensions');
    expect(result.preferredSource).toBe('XID-7');
  });

  it('detects conflicts when claims differ', async () => {
    const c1 = makeChunk('c1', 'silver', ['standard'], 0.8, 'different content A');
    const c2 = makeChunk('c2', 'silver', ['standard'], 0.8, 'different content B');
    const result = await service.resolve([c1, c2], 'voltage level');
    // Both same priority and same authority score, so unresolvable
    expect(result.resolved).toBe(false);
    expect(result.preferredSource).toBe('XID-9'); // first has lower authority (0.8 === 0.8, so first wins by order)
  });

  it('returns priority score correctly', () => {
    const projectSpec = makeChunk('c1', 'platinum', ['project-spec'], 0.9);
    expect(service.getPriorityScore(projectSpec)).toBe(10);
    const regulation = makeChunk('c2', 'gold', ['regulation'], 0.8);
    expect(service.getPriorityScore(regulation)).toBe(8);
    const standard = makeChunk('c3', 'silver', ['standard'], 0.7);
    expect(service.getPriorityScore(standard)).toBe(6);
    const manufacturer = makeChunk('c4', 'silver', ['manufacturer'], 0.6);
    expect(service.getPriorityScore(manufacturer)).toBe(4);
    const academic = makeChunk('c5', 'bronze', ['academic'], 0.5);
    expect(service.getPriorityScore(academic)).toBe(2);
  });

  it('explains priority for a chunk', () => {
    const chunk = makeChunk('c1', 'platinum', ['project-spec'], 0.9, 'voltage must be 400kV');
    const explanation = service.explainPriority(chunk);
    expect(explanation).toContain('Project Specification');
    expect(explanation).toContain('10');
  });
});
