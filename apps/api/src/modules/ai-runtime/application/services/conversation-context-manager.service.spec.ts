import { Test, TestingModule } from '@nestjs/testing';
import { ConversationContextManagerService } from './conversation-context-manager.service';

describe('ConversationContextManagerService', () => {
  let service: ConversationContextManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConversationContextManagerService],
    }).compile();
    service = module.get<ConversationContextManagerService>(ConversationContextManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should build context with history', () => {
    const { messages, totalTokens } = service.buildContext(
      'user input',
      [
        { role: 'system', content: 'System prompt' },
        { role: 'user', content: 'Previous message' },
        { role: 'assistant', content: 'Previous response' },
      ],
      4000,
    );
    expect(messages.length).toBeGreaterThan(0);
    expect(totalTokens).toBeGreaterThan(0);
    const systemMsgs = messages.filter((m) => m.role === 'system');
    expect(systemMsgs.length).toBeGreaterThan(0);
  });

  it('should respect max tokens limit', () => {
    const longHistory = Array.from({ length: 100 }, (_, _i) => ({
      role: 'user' as const,
      content: 'A'.repeat(200),
    }));
    const { messages, totalTokens } = service.buildContext('input', longHistory, 500);
    expect(totalTokens).toBeLessThanOrEqual(600);
    expect(messages.length).toBeLessThan(50);
  });
});
