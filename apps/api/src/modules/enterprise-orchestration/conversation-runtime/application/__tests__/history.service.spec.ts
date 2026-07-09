import { Test, TestingModule } from '@nestjs/testing';
import { HistoryService } from '../history.service.js';
import { InMemoryConversationRepository } from '../../testing/adapters/in-memory-conversation-repository.js';
import type { IConversationRepository } from '../../domain/conversation-repository.interface.js';

describe('HistoryService', () => {
  let service: HistoryService;
  let repository: IConversationRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HistoryService,
        { provide: 'IConversationRepository', useClass: InMemoryConversationRepository },
      ],
    }).compile();

    service = module.get(HistoryService);
    repository = module.get('IConversationRepository');
  });

  describe('recordEvent', () => {
    it('should record an event and create history if needed', async () => {
      const event = await service.recordEvent(
        'exec-1',
        'message_sent',
        { content: 'hello' },
        'user-1',
      );
      expect(event).toBeDefined();
      expect(event.type).toBe('message_sent');
      expect(event.actor).toBe('user-1');
      expect(event.id).toBeDefined();
      expect(event.timestamp).toBeInstanceOf(Date);

      const history = await repository.getHistory('exec-1');
      expect(history).toBeDefined();
      expect(history?.events).toHaveLength(1);
    });

    it('should append to existing history', async () => {
      await service.recordEvent('exec-1', 'first', {});
      await service.recordEvent('exec-1', 'second', {});

      const history = await repository.getHistory('exec-1');
      expect(history?.events).toHaveLength(2);
    });

    it('should use default actor when not provided', async () => {
      const event = await service.recordEvent('exec-1', 'system_event', {});
      expect(event.actor).toBeNull();
    });
  });

  describe('getHistory', () => {
    it('should return the full history', async () => {
      await service.recordEvent('exec-1', 'event_1', { key: 'value' });
      await service.recordEvent('exec-1', 'event_2', { num: 42 });

      const history = await service.getHistory('exec-1');
      expect(history).toBeDefined();
      expect(history?.workflowExecutionId).toBe('exec-1');
      expect(history?.events).toHaveLength(2);
    });

    it('should throw for non-existent history', async () => {
      await expect(service.getHistory('non-existent')).rejects.toThrow();
    });
  });

  describe('getEventsByType', () => {
    it('should filter events by type', async () => {
      await service.recordEvent('exec-1', 'message_sent', {});
      await service.recordEvent('exec-1', 'status_change', {});
      await service.recordEvent('exec-1', 'message_sent', {});

      const events = await service.getEventsByType('exec-1', 'message_sent');
      expect(events).toHaveLength(2);
      expect(events.every((e) => e.type === 'message_sent')).toBe(true);
    });

    it('should return empty array for non-existent history', async () => {
      const events = await service.getEventsByType('non-existent', 'any');
      expect(events).toEqual([]);
    });
  });

  describe('getTimeline', () => {
    it('should return events sorted chronologically', async () => {
      await service.recordEvent('exec-1', 'first', { order: 1 });
      await new Promise((resolve) => setTimeout(resolve, 5));
      await service.recordEvent('exec-1', 'second', { order: 2 });
      await new Promise((resolve) => setTimeout(resolve, 5));
      await service.recordEvent('exec-1', 'third', { order: 3 });

      const timeline = await service.getTimeline('exec-1');
      expect(timeline).toHaveLength(3);
      expect(timeline[0]?.type).toBe('first');
      expect(timeline[2]?.type).toBe('third');
    });

    it('should return empty array for non-existent history', async () => {
      const timeline = await service.getTimeline('non-existent');
      expect(timeline).toEqual([]);
    });
  });

  describe('clear', () => {
    it('should clear all events from history', async () => {
      await service.recordEvent('exec-1', 'event_1', {});
      await service.recordEvent('exec-1', 'event_2', {});

      await service.clear('exec-1');

      const history = await repository.getHistory('exec-1');
      expect(history?.events).toHaveLength(0);
    });

    it('should not throw for non-existent history', async () => {
      await expect(service.clear('non-existent')).resolves.toBeUndefined();
    });
  });
});
