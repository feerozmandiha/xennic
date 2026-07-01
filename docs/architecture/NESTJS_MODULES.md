# NestJS Module Architecture — معماری ماژول‌های NestJS

**نسخه**: ۱.۰.۰ | **فریم‌ورک**: NestJS 11 | **تعداد ماژول‌ها**: ۲۳

---

## الگوی معماری

تمامی ماژول‌ها از معماری **Domain-Driven Design (DDD)** با **Clean Architecture** و چهار لایه پیروی می‌کنند:

```
module/
├── application/    # Use cases, application services, DTOs
├── domain/         # Entities, value objects, interfaces, domain services
├── infrastructure/ # Repositories, external services, ORM adapters
├── presentation/   # Controllers, request/response DTOs
└── {module}.module.ts  # Module definition
```

---

## ساختار یک ماژول نمونه (User)

```
user/
├── application/
│   └── services/
│       └── user.service.ts
├── domain/
│   ├── entities/
│   │   └── user.entity.ts
│   ├── interfaces/
│   │   └── user.repository.interface.ts
│   └── value-objects/
│       ├── email.vo.ts
│       └── password.vo.ts
├── infrastructure/
│   ├── hashing/
│   │   └── argon2.service.ts
│   └── repositories/
│       └── user.repository.ts
├── presentation/
│   ├── controllers/
│   │   └── user.controller.ts
│   └── dtos/
│       ├── user-request.dto.ts
│       └── user-response.dto.ts
└── user.module.ts
```

---

## ماژول‌های موجود

| ماژول | دامنه | لایه‌ها |
|-------|-------|---------|
| `admin` | مدیریت پلتفرم | application, infrastructure (guards), presentation |
| `ai` | هوش مصنوعی | application, domain, infrastructure, presentation |
| `api-keys` | مدیریت API Key | application, domain, infrastructure, presentation |
| `auth` | احراز هویت | application, domain, infrastructure, presentation |
| `billing` | صورتحساب | application, domain, infrastructure, presentation |
| `consultations` | مشاوره | application, domain, infrastructure, presentation |
| `email` | ایمیل | application, domain, infrastructure, presentation |
| `engineering` | محاسبات مهندسی | application, domain, infrastructure, presentation |
| `feature-flags` | ویژگی‌های اشتراک | application, domain, infrastructure, presentation |
| `health` | health check | flat (controller + service) |
| `knowledge` | مدیریت دانش | application, domain, infrastructure, presentation |
| `marketplace` | بازارگاه | application, domain, infrastructure, presentation |
| `notification` | اعلان‌ها | application, domain, infrastructure, presentation |
| `project` | پروژه‌ها | application, domain, infrastructure, presentation |
| `rbac` | نقش و مجوز | application, domain, infrastructure, presentation |
| `search` | جستجو | application, domain, infrastructure, presentation |
| `standards` | استانداردها | application, domain, infrastructure, presentation |
| `storage` | فایل‌ها | application, domain, infrastructure, presentation |
| `subscription` | اشتراک | application, domain, infrastructure, presentation |
| `user` | کاربران | application, domain (VO, Entity, Interface), infrastructure (hashing, repo), presentation |
| `vision` | بینایی | application, infrastructure, presentation |
| `webhooks` | وب‌هوک | application, domain, infrastructure, presentation |
| `workspace` | فضای کاری | application, domain, infrastructure, presentation |

---

## پر استفاده‌ترین الگوها

### Value Objects
```typescript
// email.vo.ts
export class Email {
  constructor(private readonly value: string) {
    if (!this.isValid(value)) throw new InvalidEmailError(value);
  }
  private isValid(email: string): boolean { ... }
  toString(): string { return this.value; }
}
```

### Repository Interface
```typescript
// user.repository.interface.ts
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<User>;
  softDelete(id: string): Promise<void>;
}
```

### Application Service
```typescript
// user.service.ts
@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepo: IUserRepository,
    private readonly hashingService: HashingService,
  ) {}
  
  async create(dto: CreateUserDto): Promise<UserResponse> { ... }
  async update(id: string, dto: UpdateUserDto): Promise<UserResponse> { ... }
}
```

---

## Common Infrastructure

| مسیر | محتوا |
|------|-------|
| `common/guards/` | ThrottlerGuard, AuthThrottlerGuard, SuperAdminGuard |
| `common/decorators/` | `@SuperAdminOnly()` |
| `common/interceptors/` | HardDeleteAuditInterceptor |
| `common/tenant/` | TenantContext, TenantInterceptor |
| `shared/filters/` | AllExceptionsFilter |

---

## اصول معماری NestJS

1. **هیچ منطق تجاری در Controllerها نیست** — Controller فقط validation کرده و به لایه application delegate می‌کند
2. **Repository Pattern** — دسترسی به دیتابیس فقط از طریق repository interfaces
3. **Dependency Injection** — تمام وابستگی‌ها از طریق DI تزریق می‌شوند
4. **DTOها** — هر endpoint دارای Request/Response DTO مجزا
5. **Validation** — class-validator با whitelist + forbidNonWhitelisted
6. **پاسخ یکتا** — `{success, data/meta}` یا `{success, error}`
