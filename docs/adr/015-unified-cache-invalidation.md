# ADR-015: Unified Enterprise Cache with Tag-Based Invalidation

## Status

Accepted — Sprint E1

## Context

The AI Runtime already uses in-memory caches (session, memory, prompt stores). The Semantic Integration module needs cache invalidation on events. Without a unified cache manager, each module implements its own caching, leading to inconsistency.

## Decision

Create a unified enterprise cache manager:

1. **Namespace isolation**: `semantic`, `prompt`, `embedding`, `session`, `memory`, `config`, `search`
2. **TTL per entry**: Configurable per cache set operation
3. **Tag-based invalidation**: Entries can have tags; invalidation by tag clears all matching entries
4. **Pattern-based invalidation**: Regex patterns against cache keys
5. **In-memory initially**: `Map`-based implementation with expiry checking on get

The cache module is `@Global()` so any module can inject `CacheManagerService`.

## Consequences

- Single cache interface replaces ad-hoc in-memory stores
- Tag-based invalidation allows precise cache clearing
- Namespace isolation prevents key collisions
- In-memory implementation sufficient for single-instance deployments
- Redis implementation can be swapped in without API changes
- Cache entries are lost on restart (acceptable for current TTL-based strategy)
