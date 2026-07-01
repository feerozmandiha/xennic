# Cache Platform Report

_Sprint A2 — 2026-06-27_

## Redis Platform

**Status: ✅ Complete**

### RedisModule
- **File:** `apps/api/src/shared/redis/redis.module.ts`
- **Scope:** Global
- **Graceful Degradation:** App runs without Redis if unavailable
- **Lifecycle:** Connect on init, quit on destroy

### RedisService
- **File:** `apps/api/src/shared/redis/redis.service.ts`
- **Library:** `redis` v6
- **Connection:** `REDIS_URL` or `redis://{REDIS_HOST}:{REDIS_PORT}`
- **Methods:** `get`, `set`, `del`, `exists`, `ping`, `getClient`
- **Error Handling:** Logs warning on connection failure, throws on use when disconnected
- **Lifecycle:** `onModuleInit` connects, `onModuleDestroy` quits

### CacheService
- **File:** `apps/api/src/shared/redis/cache.service.ts`
- **JSON-aware:** Auto-serializes/deserializes via `JSON.stringify`/`JSON.parse`

| Method | Description |
|--------|-------------|
| `get<T>(key)` | Retrieve and JSON-parse cached value |
| `set<T>(key, value, ttl?)` | JSON-stringify and store |
| `delete(key)` | Remove key |
| `invalidate(pattern)` | SCAN + DEL keys matching glob pattern |
| `remember<T>(key, ttl, factory)` | Cache-aside: check cache → call factory → store |

#### TTL Policies
| Constant | Value | Use Case |
|----------|-------|----------|
| `TTL.SHORT` | 60s | Rate-limited data, temporary tokens |
| `TTL.MEDIUM` | 300s (5m) | User profiles, resource lists |
| `TTL.LONG` | 3600s (1h) | Lookup tables, reference data |
| `TTL.DAY` | 86400s (24h) | Static content, rarely changing data |

### DistributedLockService
- **File:** `apps/api/src/shared/redis/distributed-lock.service.ts`
- **Mechanism:** Redis `SET key value NX EX <ttl>`
- **Methods:**
  - `acquire(lockKey, ttl): Promise<boolean>` — Attempts to acquire lock
  - `release(lockKey): Promise<void>` — Releases lock via DEL
  - `withLock<T>(lockKey, ttl, fn): Promise<T>` — Acquire → Execute → Auto-release

### SessionStoreService
- **File:** `apps/api/src/shared/redis/session-store.service.ts`
- **Key Pattern:** `session:{sessionId}`
- **SessionData Interface:**
  ```typescript
  interface SessionData {
    userId: string;
    workspaceId: string;
    roles: string[];
    refreshToken?: string;
    deviceInfo?: string;
    createdAt: string;
    lastAccessAt: string;
  }
  ```
- **Methods:** `createSession`, `getSession`, `updateSession` (merge + KEEPTTL), `deleteSession`

### CacheDecorator
- **File:** `apps/api/src/shared/redis/cache.decorator.ts`
- **Decorator:** `@Cacheable(cacheKey, ttl?)`
  ```typescript
  @Cacheable('user:{0.id}', TTL.MEDIUM)
  async getUser(id: string): Promise<User> { ... }
  ```
- **Placeholders:** `{arg}`, `{N}`, `{N.property}` resolved from method arguments
- **Interceptor:** `CacheInterceptor` — registered as global `APP_INTERCEPTOR`
  - On cache hit: returns cached value, increments `cache_hits_total`
  - On cache miss: calls method, stores result, increments `cache_misses_total`
- **Metadata Keys:** `CACHE_KEY_METADATA`, `CACHE_TTL_METADATA`
