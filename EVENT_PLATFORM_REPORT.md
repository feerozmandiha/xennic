# Event Platform Report

_Sprint A2 — 2026-06-27_

## RabbitMQ Event Infrastructure

**Status: ✅ Complete**

### EventPublisher
- **File:** `apps/api/src/shared/events/event-publisher.service.ts`
- **Connect:** Connects to RabbitMQ on module init
- **Channel:** Single channel per publisher instance
- **Exchange:** Topic exchange (durable, auto-declared)

### Publish Methods
| Method | Description |
|--------|-------------|
| `publish(exchange, routingKey, event)` | Standard publish to topic exchange |
| `publishWithDelay(exchange, routingKey, event, delayMs)` | Delayed message via `x-delayed-message` exchange |

### Event Envelope
```typescript
interface EventEnvelope<T> {
  eventId: string;       // UUID v4
  eventType: string;     // e.g. "user.created"
  eventVersion: number;  // Semantic version of event schema
  correlationId: string; // Traces through request chain
  timestamp: string;     // ISO 8601
  data: T;               // Payload
}
```

### EventConsumer
- **File:** `apps/api/src/shared/events/event-consumer.service.ts`
- **Subscribe:** Binds to exchange with routing key
- **Queue:** Auto-declared queue per subscription

### Subscribe Methods
| Method | Description |
|--------|-------------|
| `subscribe(queue, exchange, routingKey, handler)` | Standard subscription |
| `subscribeWithRetry(queue, exchange, routingKey, handler, maxRetries?)` | Retry with DLQ |

### Dead Letter Queue
- Failed messages routed to DLX → DLQ → retry queue
- Exponential backoff: `2^retry * 1s` (max 30s)
- Max retries: 3 (default, configurable)

### EventIdempotencyService
- **File:** `apps/api/src/shared/events/event-idempotency.service.ts`
- **Backend:** Redis (via RedisService)
- **Key Pattern:** `event:idempotency:{eventId}`
- **Default TTL:** 1 hour
- **Methods:** `isProcessed(eventId)`, `markProcessed(eventId, ttl?)`

### EventModule
- **File:** `apps/api/src/shared/events/event-module.ts`
- **Scope:** Global
- **Lifecycle:** Connect on init, disconnect on destroy
- **Dependencies:** RedisModule

### Event Types
- **File:** `apps/api/src/shared/events/event-types.ts`
- **Constants:** `USER_CREATED`, `USER_LOGGED_IN`, `WORKSPACE_CREATED`, `PROJECT_CREATED`, `CALCULATION_COMPLETED`, `KNOWLEDGE_ARTICLE_CREATED`, `SUBSCRIPTION_CHANGED`, `BILLING_INVOICED`
- **Types:** `EventHandler<T>`, `EventName`, `EventEnvelope<T>`

## Cache Platform Report

**Status: ✅ Complete**

### RedisModule
- **File:** `apps/api/src/shared/redis/redis.module.ts`
- **Scope:** Global
- **Graceful Degradation:** App runs without Redis if unavailable
- **Lifecycle:** Connect on init, quit on destroy

### RedisService
- **File:** `apps/api/src/shared/redis/redis.service.ts`
- **Library:** `redis` v6
- **Methods:** `get`, `set`, `del`, `exists`, `ping`, `getClient`
- **Error Handling:** Logs warning on connection failure, throws on use when disconnected

### CacheService
- **File:** `apps/api/src/shared/redis/cache.service.ts`
- **JSON-aware:** Auto-serializes/deserializes
- **Methods:**
  - `get<T>(key)` — JSON parse
  - `set<T>(key, value, ttl?)` — JSON stringify
  - `delete(key)` — Remove key
  - `invalidate(pattern)` — SCAN + DEL keys matching pattern
  - `remember<T>(key, ttl, factory)` — Cache-aside pattern
- **TTL Constants:** `SHORT = 60s`, `MEDIUM = 300s`, `LONG = 3600s`, `DAY = 86400s`
- **Metrics:** Tracks cache hits/misses via MetricsService

### DistributedLockService
- **File:** `apps/api/src/shared/redis/distributed-lock.service.ts`
- **Mechanism:** Redis `SET NX EX`
- **Methods:**
  - `acquire(lockKey, ttl)` — Returns boolean
  - `release(lockKey)` — DEL key
  - `withLock(lockKey, ttl, fn)` — Acquire → Execute → Release

### SessionStoreService
- **File:** `apps/api/src/shared/redis/session-store.service.ts`
- **Key Pattern:** `session:{sessionId}`
- **Interface:** `SessionData { userId, workspaceId, roles, refreshToken?, deviceInfo?, createdAt, lastAccessAt }`
- **Methods:** `createSession`, `getSession`, `updateSession`, `deleteSession`

### CacheDecorator
- **File:** `apps/api/src/shared/redis/cache.decorator.ts`
- **Decorator:** `@Cacheable(cacheKey, ttl?)`
- **Placeholders:** `{arg}`, `{0}`, `{0.property}` in cache key
- **Interceptor:** `CacheInterceptor` auto-caches method return values
