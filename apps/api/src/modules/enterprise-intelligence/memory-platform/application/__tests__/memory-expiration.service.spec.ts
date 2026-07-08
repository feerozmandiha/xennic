import { Test, TestingModule } from '@nestjs/testing';
import { MemoryExpirationService } from '../memory-expiration.service.js';
import { MemoryEntity, MemoryType } from '../../domain/memory.entity.js';
import type { IMemoryStore } from '../../domain/memory-store.interface.js';
import { InMemoryMemoryStore } from '../../../testing/adapters/in-memory-memory-store.js';

describe('MemoryExpirationService', () => {
  let service: MemoryExpirationService;
  let store: IMemoryStore;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemoryExpirationService,
        { provide: 'IMemoryStore', useClass: InMemoryMemoryStore },
      ],
    }).compile();

    service = module.get(MemoryExpirationService);
    store = module.get('IMemoryStore');
  });

  afterEach(() => {
    service.stopInterval();
  });

  describe('checkExpiration()', () => {
    it('should delete expired memories', async () => {
      const past = new Date(Date.now() - 3600000);
      const future = new Date(Date.now() + 3600000);

      const expired = MemoryEntity.create(
        MemoryType.SHORT_TERM,
        'workspace',
        'ws-1',
        'expired',
        {},
        'u1',
        [],
        null,
        past,
      );
      const valid = MemoryEntity.create(
        MemoryType.SHORT_TERM,
        'workspace',
        'ws-1',
        'valid',
        {},
        'u2',
        [],
        null,
        future,
      );

      await store.save(expired);
      await store.save(valid);

      const deleted = await service.checkExpiration();
      expect(deleted).toBe(1);

      const expiredFound = await store.findById(expired.id);
      expect(expiredFound).toBeNull();

      const validFound = await store.findById(valid.id);
      expect(validFound).toBeDefined();
    });

    it('should handle no expired memories', async () => {
      const future = new Date(Date.now() + 3600000);
      const entity = MemoryEntity.create(
        MemoryType.LONG_TERM,
        'workspace',
        'ws-1',
        'valid',
        {},
        'u1',
        [],
        null,
        future,
      );
      await store.save(entity);

      const deleted = await service.checkExpiration();
      expect(deleted).toBe(0);
    });

    it('should handle memories without expiration', async () => {
      const entity = MemoryEntity.create(
        MemoryType.LONG_TERM,
        'workspace',
        'ws-1',
        'persistent',
        {},
        'u1',
      );
      await store.save(entity);

      const deleted = await service.checkExpiration();
      expect(deleted).toBe(0);

      const found = await store.findById(entity.id);
      expect(found).toBeDefined();
    });

    it('should delete multiple expired memories', async () => {
      const past = new Date(Date.now() - 3600000);

      const e1 = MemoryEntity.create(
        MemoryType.SESSION, 'user', 'u-1', 's1', {}, 'u1', [], null, past,
      );
      const e2 = MemoryEntity.create(
        MemoryType.SESSION, 'user', 'u-1', 's2', {}, 'u2', [], null, past,
      );
      const e3 = MemoryEntity.create(
        MemoryType.SESSION, 'user', 'u-1', 's3', {}, 'u3', [], null, past,
      );

      await store.save(e1);
      await store.save(e2);
      await store.save(e3);

      const deleted = await service.checkExpiration();
      expect(deleted).toBe(3);
    });
  });

  describe('scheduleInterval()', () => {
    it('should schedule periodic expiration checks', async () => {
      const past = new Date(Date.now() - 1000);
      const entity = MemoryEntity.create(
        MemoryType.SHORT_TERM,
        'workspace',
        'ws-1',
        'quick-expire',
        {},
        'u1',
        [],
        null,
        past,
      );
      await store.save(entity);

      service.scheduleInterval(50);

      await new Promise(resolve => setTimeout(resolve, 150));

      const found = await store.findById(entity.id);
      expect(found).toBeNull();

      service.stopInterval();
    });

    it('should replace existing interval when called again', async () => {
      service.scheduleInterval(1000);
      const firstId = (service as any).intervalId;

      service.scheduleInterval(2000);
      const secondId = (service as any).intervalId;

      expect(firstId).not.toBe(secondId);

      service.stopInterval();
    });
  });

  describe('stopInterval()', () => {
    it('should stop the expiration interval', async () => {
      service.scheduleInterval(100);
      service.stopInterval();
      expect((service as any).intervalId).toBeNull();
    });

    it('should be safe to call when no interval is running', () => {
      expect(() => service.stopInterval()).not.toThrow();
    });
  });
});
