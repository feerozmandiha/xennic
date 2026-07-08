jest.mock('@xennic/database', () => ({
  prisma: {},
}));

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { AIProviderRegistry } from './ai-provider-registry.service.js';

describe('AIProviderRegistry', () => {
  let registry: AIProviderRegistry;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [AIProviderRegistry],
    }).compile();

    registry = module.get<AIProviderRegistry>(AIProviderRegistry);
  });

  it('should be defined', () => {
    expect(registry).toBeDefined();
  });

  it('should register providers from config', () => {
    const providers = registry.getProvidersByPriority();
    expect(providers.length).toBeGreaterThan(0);
  });

  it('should get provider by type', () => {
    registry.register({
      type: 'openai',
      name: 'OpenAI',
      priority: 100,
      model: 'text-embedding-3-small',
      dimensions: 1536,
      timeoutMs: 30000,
      maxRetries: 3,
      enabled: true,
    });

    const provider = registry.getProvider('openai');
    expect(provider).toBeDefined();
    expect(provider?.name).toBe('OpenAI');
  });

  it('should mark providers unhealthy and healthy', () => {
    registry.register({
      type: 'openai',
      name: 'OpenAI',
      priority: 100,
      model: 'text-embedding-3-small',
      dimensions: 1536,
      timeoutMs: 30000,
      maxRetries: 3,
      enabled: true,
    });

    expect(registry.getProvider('openai')).toBeDefined();
    registry.markUnhealthy('openai');
    expect(registry.getProvider('openai')).toBeUndefined();
    registry.markHealthy('openai');
    expect(registry.getProvider('openai')).toBeDefined();
  });

  it('should return providers sorted by priority', () => {
    registry.register({
      type: 'local',
      name: 'Local',
      priority: 200,
      model: 'all-MiniLM-L6-v2',
      dimensions: 384,
      timeoutMs: 60000,
      maxRetries: 3,
      enabled: true,
    });
    registry.register({
      type: 'openai',
      name: 'OpenAI',
      priority: 100,
      model: 'text-embedding-3-small',
      dimensions: 1536,
      timeoutMs: 30000,
      maxRetries: 3,
      enabled: true,
    });

    const providers = registry.getProvidersByPriority();
    expect(providers[0]?.name).toBe('OpenAI');
    expect(providers[1]?.name).toBe('Local');
  });
});
