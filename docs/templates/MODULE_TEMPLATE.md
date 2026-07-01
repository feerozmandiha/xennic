# [نام ماژول] — قالب مستندات ماژول (NestJS DDD)

**نسخه**: ۱.۰.۰ | **وضعیت**: Draft | **آخرین بروزرسانی**: [تاریخ]

---

## Purpose

هدف این ماژول در معماری DDD/CQRS چیست؟

---

## Scope

Entities, use cases, commands, queries, events.

---

## Structure

```
src/modules/[module]/
├── commands/
│   ├── [action].command.ts
│   └── [action].handler.ts
├── queries/
│   ├── [action].query.ts
│   └── [action].handler.ts
├── events/
│   └── [event].event.ts
├── interfaces/
│   ├── [entity].entity.ts
│   ├── [entity].repository.interface.ts
│   └── dto/
├── infrastructure/
│   ├── [entity].repository.ts
│   └── [entity].mapper.ts
└── [module].module.ts
```

## Domain Events

| Event | Producer | Consumers |
|-------|----------|-----------|
| [EventName] | [Handler] | [List] |

## CQRS

| دسته | Command/Query | Handler |
|------|--------------|---------|
| Commands | [Command] | [Handler] |
| Queries | [Query] | [Handler] |

---

## Related Documents

| سند | مسیر |
|-----|------|
| NestJS Modules | `architecture/NESTJS_MODULES.md` |
| System Architecture | `architecture/SYSTEM_ARCHITECTURE.md` |

---

## Revision History

| نسخه | تاریخ | تغییرات |
|------|-------|---------|
| ۱.۰.۰ | [تاریخ] | انتشار اولیه |
