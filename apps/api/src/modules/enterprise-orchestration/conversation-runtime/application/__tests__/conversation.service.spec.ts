import { Test, TestingModule } from '@nestjs/testing';
import { ConversationService } from '../conversation.service.js';
import { InMemoryConversationRepository } from '../../testing/adapters/in-memory-conversation-repository.js';
import type { IConversationRepository } from '../../domain/conversation-repository.interface.js';

describe('ConversationService', () => {
  let service: ConversationService;
  let repository: IConversationRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationService,
        { provide: 'IConversationRepository', useClass: InMemoryConversationRepository },
      ],
    }).compile();

    service = module.get(ConversationService);
    repository = module.get('IConversationRepository');
  });

  describe('create', () => {
    it('should create a new conversation', async () => {
      const conversation = await service.create('exec-1', 'session-1', 'user-1');
      expect(conversation).toBeDefined();
      expect(conversation.workflowExecutionId).toBe('exec-1');
      expect(conversation.sessionId).toBe('session-1');
      expect(conversation.status).toBe('active');
      expect(conversation.messages).toHaveLength(0);

      const saved = await repository.getConversation(conversation.id);
      expect(saved).toBeDefined();
      expect(saved?.id).toBe(conversation.id);
    });
  });

  describe('sendMessage', () => {
    it('should add a message to the conversation', async () => {
      const conversation = await service.create('exec-1', 'session-1');
      const message = await service.sendMessage(conversation.id, 'user', 'Hello');

      expect(message).toBeDefined();
      expect(message.role).toBe('user');
      expect(message.content).toBe('Hello');
      expect(message.timestamp).toBeInstanceOf(Date);

      const messages = await service.getMessages(conversation.id);
      expect(messages.items).toHaveLength(1);
      expect(messages.items[0]?.content).toBe('Hello');
    });

    it('should throw for non-existent conversation', async () => {
      await expect(service.sendMessage('non-existent', 'user', 'test')).rejects.toThrow();
    });

    it('should throw for paused conversation', async () => {
      const conversation = await service.create('exec-1', 'session-1');
      await service.pause(conversation.id);
      await expect(service.sendMessage(conversation.id, 'user', 'test')).rejects.toThrow();
    });
  });

  describe('getMessages', () => {
    it('should return paginated messages', async () => {
      const conversation = await service.create('exec-1', 'session-1');
      await service.sendMessage(conversation.id, 'user', 'Message 1');
      await service.sendMessage(conversation.id, 'assistant', 'Reply 1');
      await service.sendMessage(conversation.id, 'user', 'Message 2');

      const all = await service.getMessages(conversation.id);
      expect(all.total).toBe(3);
      expect(all.items).toHaveLength(3);

      const page = await service.getMessages(conversation.id, { offset: 1, limit: 1 });
      expect(page.items).toHaveLength(1);
      expect(page.total).toBe(3);
    });
  });

  describe('pause / resume', () => {
    it('should pause and resume a conversation', async () => {
      const conversation = await service.create('exec-1', 'session-1');
      expect(conversation.status).toBe('active');

      await service.pause(conversation.id);
      const paused = await repository.getConversation(conversation.id);
      expect(paused?.status).toBe('paused');

      await service.resume(conversation.id);
      const resumed = await repository.getConversation(conversation.id);
      expect(resumed?.status).toBe('active');
    });

    it('should throw when pausing non-active conversation', async () => {
      const conversation = await service.create('exec-1', 'session-1');
      await service.end(conversation.id);
      await expect(service.pause(conversation.id)).rejects.toThrow();
    });
  });

  describe('end', () => {
    it('should complete a conversation', async () => {
      const conversation = await service.create('exec-1', 'session-1');
      await service.end(conversation.id);

      const saved = await repository.getConversation(conversation.id);
      expect(saved?.status).toBe('completed');
    });

    it('should throw for already completed conversation', async () => {
      const conversation = await service.create('exec-1', 'session-1');
      await service.end(conversation.id);
      await expect(service.end(conversation.id)).rejects.toThrow();
    });
  });

  describe('expireStale', () => {
    it('should expire conversations older than maxAge', async () => {
      await service.create('exec-1', 'session-1');
      await service.create('exec-2', 'session-2');

      const count = await service.expireStale(0);
      expect(count).toBe(2);
    });

    it('should not expire recent conversations', async () => {
      await service.create('exec-1', 'session-1');
      const count = await service.expireStale(3600000);
      expect(count).toBe(0);
    });
  });

  describe('getContext', () => {
    it('should return conversation state for an existing conversation', async () => {
      const conversation = await service.create('exec-1', 'session-1');
      const context = await service.getContext(conversation.id);
      expect(context).toBeDefined();
      expect(context?.conversationId).toBe(conversation.id);
      expect(context?.turnCount).toBe(0);
    });

    it('should return null for non-existent conversation', async () => {
      const context = await service.getContext('non-existent');
      expect(context).toBeNull();
    });
  });
});
