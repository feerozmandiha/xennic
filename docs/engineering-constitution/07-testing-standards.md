# 7. Testing Standards

> **Cross-References**: [ADR-010 Testing Strategy](../decisions/ADR-010-testing-strategy.md)
>
> **Status**: Adopted · **Version**: 1.0.0 · **Last Updated**: 2026-06-26

---

## Table of Contents

1. [Unit Testing](#1-unit-testing)
2. [Integration Testing](#2-integration-testing)
3. [E2E Testing](#3-e2e-testing)
4. [Performance Testing](#4-performance-testing)
5. [Security Testing](#5-security-testing)
6. [Coverage Goals](#6-coverage-goals)
7. [Mocking Policy](#7-mocking-policy)
8. [Test Data](#8-test-data)
9. [Regression Testing](#9-regression-testing)
10. [CI Quality Gates](#10-ci-quality-gates)
11. [Test Organization](#11-test-organization)

---

## 1. Unit Testing

### WHY

Unit tests verify that individual units of code (functions, methods, classes) behave correctly in isolation. They provide the fastest feedback loop, catch regressions early, and serve as living documentation.

### RATIONALE

Unit tests are the foundation of the testing pyramid. They are cheap to write, fast to run (milliseconds per test), and pinpoint failures precisely. Focusing on domain logic and business rules yields the highest ROI.

### What to Unit Test

| Layer | What to Test | Framework |
|-------|-------------|-----------|
| Services | Business logic, state transitions, error handling | Vitest / Jest |
| Use Cases | Orchestration logic, validation, authorization | Vitest / Jest |
| Utilities | Pure functions, transformers, validators | Vitest / Jest |
| Domain Logic | Entity methods, value objects, domain invariants | Vitest / Jest |
| Guards/Pipes | Authorization logic, input transformation | Vitest / Jest |
| Custom Decorators | Metaprogramming logic | Vitest / Jest |

### What NOT to Unit Test

| Item | Reason | Instead |
|------|--------|---------|
| Framework internals | Tested by framework authors | Integration test your usage |
| Database operations | Requires database connection | Integration test |
| Network requests | Requires external service | Mock the client, integration test |
| Configuration/DI | Framework managed | Verify via integration test |
| Third-party library | Tested by library authors | Write integration test for wrapper |
| Simple getters/setters | Trivial — no logic | Skip or test if transformation exists |

### AAA Pattern

Every unit test MUST follow Arrange–Act–Assert:

```typescript
// ARRANGE: Set up the test scenario
const userId = 'user-123';
const projectData = { name: 'Test Project', type: 'residential' as const };
const mockRepository = {
  findById: vi.fn().mockResolvedValue({ id: userId, role: 'engineer' }),
  create: vi.fn().mockResolvedValue({ id: 'project-456', ...projectData }),
};
const service = new ProjectService(mockRepository as any);

// ACT: Execute the method under test
const result = await service.createProject(userId, projectData);

// ASSERT: Verify the expected outcome
expect(result).toMatchObject({ name: 'Test Project' });
expect(mockRepository.create).toHaveBeenCalledWith({
  ...projectData,
  ownerId: userId,
});
```

**GOOD example:**
```typescript
describe('ProjectService', () => {
  describe('createProject', () => {
    it('creates a project with the correct owner', async () => {
      const userId = 'user-123';
      const projectData: CreateProjectInput = {
        name: 'Test Project',
        type: 'residential',
      };
      const mockRepo = { create: vi.fn().mockResolvedValue({ id: 'proj-1', ...projectData }) };
      const service = new ProjectService(mockRepo as any);

      const result = await service.createProject(userId, projectData);

      expect(mockRepo.create).toHaveBeenCalledWith({
        ...projectData,
        ownerId: userId,
      });
      expect(result.id).toBe('proj-1');
    });
  });
});
```

**BAD example:**
```typescript
describe('project service', () => {
  it('should create a project', async () => {
    // No arrange — test uses real database
    // No act — test is a mess
    // No assert — no expectations
    const srv = new ProjectService();
    const r = await srv.createProject('1', { name: 'test', type: 'hmm' });
    console.log(r);
  });
});
```

### Test Naming Convention

- Test file: `<filename>.spec.ts` (co-located with source)
- Describe: `describe('<ClassName>', ...)`
- Nested describe: `describe('<methodName>', ...)`
- Test case: `it('<should ... when ...>', ...)`

```typescript
// Name templates
it('returns the project when the user has read access')
it('throws ForbiddenException when the user lacks read access')
it('returns 404 when the project does not exist')
it('caches the result on first call')
it('returns cached result on subsequent calls')
```

### Per-Test Isolation

- Each test starts with a clean state
- Mocks reset between tests (`afterEach` or `beforeEach`)
- No shared mutable state between tests
- No test order dependencies
- `describe` blocks are NOT executed in parallel if tests share state

```typescript
describe('ProjectService', () => {
  let service: ProjectService;
  let mockRepo: MockRepository;

  beforeEach(() => {
    mockRepo = { create: vi.fn(), findById: vi.fn() };
    service = new ProjectService(mockRepo as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // tests here...
});
```

---

## 2. Integration Testing

### WHY

Integration tests verify that components work together correctly. They catch interface mismatches, configuration errors, and assumptions that unit tests miss.

### RATIONALE

Integration tests provide confidence that the system works end-to-end at the service level. They are slower than unit tests but faster than E2E tests. They are the sweet spot for API testing.

### What to Integration Test

| Scope | What to Test | Tools |
|-------|-------------|-------|
| API endpoints | Request/response, status codes, headers, body | Supertest, Vitest |
| Database operations | Queries, transactions, migrations, constraints | Testcontainers, Prisma |
| Message queues | Publish/consume, retry, DLQ | Testcontainers (RabbitMQ) |
| Cache layer | Set/get/delete, TTL, cache miss | Testcontainers (Redis) |
| File storage | Upload, download, delete, metadata | MinIO (S3-compatible) |
| External API wrappers | HTTP client behavior, error mapping | nock / MSW |

### Test Container Pattern

Use Testcontainers for real infrastructure in tests:

```typescript
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis';

describe('ProjectRepository (integration)', () => {
  let postgres: StartedPostgreSqlContainer;
  let redis: StartedRedisContainer;
  let prisma: PrismaClient;

  beforeAll(async () => {
    postgres = await new PostgreSqlContainer('postgres:17-alpine')
      .withDatabase('xennic_test')
      .withUsername('test')
      .withPassword('test')
      .start();

    process.env.DATABASE_URL = postgres.getConnectionUri();
    prisma = new PrismaClient();
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await runMigrations(prisma);
  }, 120_000);

  afterAll(async () => {
    await prisma.$disconnect();
    await postgres.stop();
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Project" CASCADE`);
  });

  it('creates a project and returns it', async () => {
    const project = await prisma.project.create({
      data: { name: 'Integration Test Project', type: 'residential', ownerId: uuidv4() },
    });
    expect(project).toMatchObject({ name: 'Integration Test Project' });
    expect(project.id).toBeDefined();
  });
});
```

### Database Test Lifecycle

```typescript
// 1. Global setup (once per test suite)
beforeAll(async () => {
  await runMigrations(prisma);
});

// 2. Per-test cleanup (truncate tables)
beforeEach(async () => {
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Project" CASCADE`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "User" CASCADE`);
});

// 3. Test executes
it('...', async () => { /* test */ });

// 4. Global teardown (once per test suite)
afterAll(async () => {
  await prisma.$disconnect();
});
```

### Test Factories/Fixtures

**GOOD example — factory function:**
```typescript
// test/factories/user.factory.ts
import { faker } from '@faker-js/faker';

export function buildUser(overrides: Partial<UserInput> = {}): UserInput {
  return {
    email: faker.internet.email(),
    name: faker.person.fullName(),
    role: 'engineer',
    workspaceId: uuidv4(),
    ...overrides,
  };
}

export async function createUser(prisma: PrismaClient, overrides: Partial<UserInput> = {}) {
  const data = buildUser(overrides);
  return prisma.user.create({ data });
}
```

**BAD example — deeply nested inline fixtures:**
```typescript
it('tests something', async () => {
  const user = await prisma.user.create({
    data: {
      email: 'test@test.com',
      name: 'Test User',
      role: 'engineer',
      workspace: { create: { name: 'Test Workspace', slug: 'test' } },
      settings: { create: { theme: 'dark', notifications: true } },
      // 30 more lines...
    },
  });
  // test
});
```

---

## 3. E2E Testing

### WHY

End-to-end tests verify the system from the user's perspective. They catch integration failures across service boundaries, authentication flows, and frontend-backend compatibility.

### RATIONALE

E2E tests are the slowest and most expensive test type. They should be reserved for critical user journeys. Too many E2E tests create maintenance burden and slow CI. Focus on quality over quantity.

### Playwright for Frontend

```typescript
// test/e2e/login.e2e-spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('completes login with MFA', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'engineer@xennic.com');
    await page.fill('[data-testid="password"]', process.env.E2E_USER_PASSWORD!);
    await page.click('[data-testid="login-button"]');

    // MFA screen appears
    await expect(page.locator('[data-testid="mfa-input"]')).toBeVisible();
    // Note: MFA TOTP is pre-configured with known secret for E2E test user
    const totpCode = generateTOTP(process.env.E2E_MFA_SECRET!);
    await page.fill('[data-testid="mfa-input"]', totpCode);
    await page.click('[data-testid="mfa-verify-button"]');

    // Redirected to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('[data-testid="user-name"]')).toContainText('Engineer');
  });
});
```

### Critical User Journeys

Every E2E test MUST cover one of these critical paths:

1. **Login flow**: credentials → MFA → dashboard
2. **Password reset**: request → email → reset → login
3. **Search**: enter query → view results → paginate
4. **Calculate**: load calculator → input values → run calculation → view results
5. **Upload**: select file → upload → view in project
6. **Project CRUD**: create → read → update → delete
7. **Admin user management**: list users → invite → change role → deactivate
8. **Billing flow**: view plan → upgrade → confirmation
9. **Logout**: session clear → redirect to login
10. **Multi-workspace**: switch workspace → see correct data

### Headless CI Execution

```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on: [deployment_status]
jobs:
  e2e:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps chromium
      - name: Run E2E tests
        run: npx playwright test
        env:
          PLAYWRIGHT_BASE_URL: ${{ github.event.deployment_status.environment_url }}
          E2E_USER_PASSWORD: ${{ secrets.E2E_USER_PASSWORD }}
          E2E_MFA_SECRET: ${{ secrets.E2E_MFA_SECRET }}
```

### Visual Regression Testing

```typescript
test('dashboard matches visual snapshot', async ({ page }) => {
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveScreenshot('dashboard.png', {
    maxDiffPixels: 100,
    threshold: 0.2,
  });
});
```

**GOOD example:**
```typescript
test('user can search and view calculation results', async ({ page }) => {
  await page.goto('/search');
  await page.fill('[data-testid="search-input"]', 'transformer 100kVA');
  await page.click('[data-testid="search-button"]');
  await expect(page.locator('[data-testid="result-item"]').first()).toBeVisible();
  await page.locator('[data-testid="result-item"]').first().click();
  await expect(page).toHaveURL(/\/calculations\//);
  await expect(page.locator('[data-testid="calculation-result"]')).toBeVisible();
});
```

**BAD example:**
```typescript
test('tests the app', async ({ page }) => {
  // Vague, no clear journey
  await page.goto('/');
  await page.click('button');
  await page.fill('input', 'test');
  // No assertions
});
```

---

## 4. Performance Testing

### WHY

Performance issues cause user frustration, churn, and revenue loss. Proactive performance testing prevents regression and ensures the platform can handle expected and peak load.

### RATIONALE

Performance testing must be automated and integrated into CI. Manual ad-hoc testing is inconsistent and misses regressions. k6 is the chosen tool because it is developer-friendly, scriptable, and supports CI integration.

### k6 Scripts for Critical Endpoints

```javascript
// tests/performance/calculate-load.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // ramp up
    { duration: '5m', target: 100 }, // sustain
    { duration: '1m', target: 0 },   // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95) < 3000'], // 95% under 3s
    errors: ['rate < 0.01'],             // < 1% error rate
  },
};

export default function () {
  const payload = JSON.stringify({
    conductorSize: '35mm2',
    cableLength: 100,
    current: 200,
    voltage: 400,
  });
  const params = {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'calculate_voltage_drop' },
  };
  const res = http.post(
    `${__ENV.BASE_URL}/api/v1/calculations/voltage-drop`,
    payload,
    params,
  );

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 3s': (r) => r.timings.duration < 3000,
  });

  errorRate.add(res.status !== 200);
  responseTime.add(res.timings.duration);
  sleep(1);
}
```

### Load Testing Profile

| Metric | Target |
|--------|--------|
| Concurrent users | 100 |
| Ramp-up time | 2 minutes |
| Sustain time | 5 minutes |
| Ramp-down time | 1 minute |

### Stress Testing Profile

| Metric | Target |
|--------|--------|
| Concurrent users | 200 (2x expected load) |
| Ramp-up time | 2 minutes |
| Sustain time | 3 minutes |
| Expected behavior | Graceful degradation, no crash |

### Soak Testing Profile

| Metric | Target |
|--------|--------|
| Concurrent users | 50 (sustained) |
| Duration | 60 minutes |
| Expected behavior | No memory leak, no slowdown |

### Performance Budgets

| Endpoint | P95 Target | P99 Target | Error Rate |
|----------|-----------|-----------|------------|
| GET /api/v1/projects | < 500ms | < 2s | < 0.1% |
| POST /api/v1/calculations/* | < 3s | < 10s | < 1% |
| GET /api/v1/search | < 3s | < 8s | < 0.5% |
| POST /api/v1/documents/upload | < 5s | < 15s | < 1% |
| GET /api/v1/dashboard | < 1s | < 3s | < 0.1% |
| POST /api/v1/auth/login | < 2s | < 5s | < 0.5% |

**GOOD example:**
```yaml
# Performance test CI step
steps:
  - name: Run k6 load test
    uses: grafana/k6-action@v0.3.0
    with:
      filename: tests/performance/calculate-load.js
      flags: |
        --env BASE_URL=${{ env.STAGING_URL }}
        --out json=results.json
  - name: Upload results
    uses: actions/upload-artifact@v4
    with:
      name: k6-results
      path: results.json
```

**BAD example:**
```yaml
# No performance testing in CI
steps:
  - name: Deploy
    run: ./deploy.sh
```

---

## 5. Security Testing

### WHY

Security vulnerabilities must be caught early. Dedicated security tests verify that authentication, authorization, and input handling are correctly implemented.

### RATIONALE

Security testing cannot rely solely on SAST/DAST tools. Automated security tests in the test suite verify that defensive code actually works. They serve as regression tests for security fixes.

### OWASP ZAP Automated Scans

```yaml
steps:
  - name: ZAP Full Scan
    uses: zaproxy/action-full-scan@v0.12.0
    with:
      target: 'https://staging.xennic.com'
      rules_file_name: '.zap/rules.tsv'
      cmd_options: '-a -j -I'
```

### Auth Bypass Tests

```typescript
describe('Auth Bypass', () => {
  it('rejects requests without auth token', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/projects')
      .expect(401);

    expect(res.body).toMatchObject({
      success: false,
      error: { code: 'UNAUTHORIZED' },
    });
  });

  it('rejects requests with expired token', async () => {
    const expiredToken = jwt.sign({ sub: 'user-1', exp: Math.floor(Date.now() / 1000) - 3600 }, 'test-key');
    const res = await request(app.getHttpServer())
      .get('/api/v1/projects')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);

    expect(res.body).toMatchObject({ success: false });
  });

  it('rejects requests with invalid signature', async () => {
    const fakeToken = jwt.sign({ sub: 'user-1' }, 'wrong-key');
    const res = await request(app.getHttpServer())
      .get('/api/v1/projects')
      .set('Authorization', `Bearer ${fakeToken}`)
      .expect(401);

    expect(res.body).toMatchObject({ success: false });
  });

  it('rejects requests with tampered payload', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/projects')
      .set('Authorization', 'Bearer eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJhZG1pbiJ9.fake-signature')
      .expect(401);

    expect(res.body).toMatchObject({ success: false });
  });
});
```

### Injection Tests

```typescript
describe('Injection Prevention', () => {
  it('rejects SQL injection in search query', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/search')
      .query({ q: "'; DROP TABLE projects; --" })
      .set('Authorization', `Bearer ${validToken}`)
      .expect(400);

    expect(res.body).toMatchObject({
      success: false,
      error: { code: 'VALIDATION_ERROR' },
    });
  });

  it('rejects XSS in project name', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ name: '<script>alert("xss")</script>', type: 'residential' })
      .expect(400);

    expect(res.body).toMatchObject({
      success: false,
      error: { code: 'VALIDATION_ERROR' },
    });
  });
});
```

**GOOD example:**
```typescript
it('rejects path traversal in file download', async () => {
  const res = await request(app.getHttpServer())
    .get('/api/v1/documents/download')
    .query({ path: '../../../etc/passwd' })
    .set('Authorization', `Bearer ${validToken}`)
    .expect(400);

  expect(res.body).toMatchObject({
    success: false,
    error: { code: 'VALIDATION_ERROR' },
  });
});
```

**BAD example:**
```typescript
it('does not test security', async () => {
  // No security tests
});
```

---

## 6. Coverage Goals

### WHY

Coverage metrics provide visibility into testing completeness. While coverage is not a guarantee of quality, low coverage areas are high-risk for undetected bugs and regressions.

### RATIONALE

Coverage thresholds are minimums, not targets. Tests should be written based on risk and complexity, not to chase coverage numbers. Critical paths require higher standards.

### Coverage Targets by Layer

| Layer | Line Coverage | Branch Coverage | Critical Path Coverage |
|-------|---------------|----------------|----------------------|
| Backend (TypeScript) | ≥ 80% | ≥ 70% | 100% |
| Python microservices | ≥ 80% | ≥ 70% | 100% |
| Frontend (React/Next.js) | ≥ 60% | ≥ 50% | 100% |
| Infrastructure (Pulumi/Terraform) | ≥ 50% | N/A | 100% |
| Shared packages | ≥ 80% | ≥ 70% | 100% |

### Critical Paths Requiring 100% Coverage

1. Authentication and authorization code
2. Payment and billing logic
3. Data export and PII handling
4. Encryption and decryption
5. Input validation and sanitization
6. Error handling and fallback paths
7. Database migration scripts
8. Idempotency handling
9. Rate limiting logic
10. Webhook processing

### Coverage Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      thresholds: {
        lines: 80,
        branches: 70,
        functions: 80,
        statements: 80,
      },
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.spec.ts',
        'src/**/*.e2e-spec.ts',
        'src/**/*.int-spec.ts',
        'src/main.ts',
        'src/**/*.module.ts',
      ],
    },
  },
});
```

**GOOD example:**
```typescript
// Coverage report shows:
// Lines: 85.3% (exceeds 80% threshold)
// Branches: 72.1% (exceeds 70% threshold)
// ✓ Coverage thresholds passed
```

**BAD example:**
```typescript
// No coverage thresholds configured
// CI always passes regardless of coverage
// Coverage drops to 45% without alerting
```

---

## 7. Mocking Policy

### WHY

Mocking isolates the unit under test from its dependencies. A clear mocking policy prevents over-mocking (which produces brittle tests) and under-mocking (which creates slow, non-deterministic tests).

### RATIONALE

Mock external boundaries. Mock what makes tests slow or non-deterministic. Never mock what you own and can run in-process. The goal is to maximize confidence per test execution second.

### What to Mock

| Dependency | Mock? | Reason |
|-----------|-------|--------|
| External HTTP APIs | ✅ Always | Slow, non-deterministic, costs money |
| LLM/AI providers | ✅ Always | Slow, non-deterministic, costs money |
| File system | ✅ Yes | Stateful, test isolation |
| System clock / time | ✅ Yes | Non-deterministic |
| Random/ID generation | ✅ Yes | Non-deterministic |
| Email/SMS providers | ✅ Always | External, costs money |
| Third-party SDKs | ✅ Yes | External dependency |
| Database | ❌ Integration tests | Testcontainers provides real DB |
| Redis | ❌ Cache integration tests | Testcontainers provides real Redis |
| Message queue | ❌ Integration tests | Testcontainers provides real broker |
| Internal services | ✅ Yes | Unit boundary |
| Configuration/env | ✅ Yes | Environment-dependent |

### Mock vs Stub vs Fake

| Term | Definition | Use Case |
|------|-----------|----------|
| **Mock** | Expects specific calls, asserts interactions | Verify behavior (e.g., "was save called?") |
| **Stub** | Returns predefined values | Provide data to the unit under test |
| **Fake** | Lightweight working implementation | Replace a dependency with simpler version (e.g., in-memory DB) |
| **Spy** | Wraps real object, records calls | Verify real implementation was called correctly |

**GOOD example — mock for external API:**
```typescript
it('calls the LLM provider with the correct prompt', async () => {
  const mockLLM = { generate: vi.fn().mockResolvedValue('Analysis result') };
  const service = new AnalysisService(mockLLM as any);

  await service.analyzeProject('project-1');

  expect(mockLLM.generate).toHaveBeenCalledWith(
    expect.stringContaining('project-1'),
    expect.objectContaining({ model: 'gpt-4' }),
  );
});
```

**GOOD example — stub for configuration:**
```typescript
it('uses the configured max file size', () => {
  vi.stubEnv('MAX_UPLOAD_SIZE_MB', '50');
  const validator = new FileValidator();

  expect(validator.maxSizeBytes).toBe(50 * 1024 * 1024);
  vi.unstubAllEnvs();
});
```

**BAD example — over-mocking:**
```typescript
// Mocking everything, including the kitchen sink
it('creates a project', async () => {
  const mockPrisma = {
    project: { create: vi.fn() },
    user: { findUnique: vi.fn() },
    workspace: { findFirst: vi.fn() },
    $transaction: vi.fn(),
  };
  // Test mocks 6 different objects...
  // Tests the mock, not the real behavior
});
```

---

## 8. Test Data

### WHY

Consistent test data makes tests readable, maintainable, and deterministic. Each test should control exactly the data it needs.

### RATIONALE

Factory functions provide reusable, composable test data. Seed scripts provide consistent data for integration and E2E tests. Isolation between tests prevents data pollution.

### Factory Pattern

```typescript
// test/factories/project.factory.ts
import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

interface ProjectInput {
  name?: string;
  type?: 'residential' | 'commercial' | 'industrial';
  ownerId?: string;
  workspaceId?: string;
  status?: 'draft' | 'active' | 'archived';
}

export function buildProject(input: ProjectInput = {}) {
  return {
    name: input.name ?? faker.lorem.words(3),
    type: input.type ?? faker.helpers.arrayElement(['residential', 'commercial', 'industrial']),
    status: input.status ?? 'draft',
    ownerId: input.ownerId ?? uuidv4(),
    workspaceId: input.workspaceId ?? uuidv4(),
  };
}

export async function createProject(prisma: PrismaClient, input: ProjectInput = {}) {
  const data = buildProject(input);
  return prisma.project.create({ data });
}

// Usage in tests:
const project = await createProject(prisma, { type: 'industrial' });
```

### Seed Scripts for Integration

```typescript
// test/seed.ts
import { PrismaClient } from '@prisma/client';
import { createUser } from './factories/user.factory';
import { createProject } from './factories/project.factory';
import { createCalculation } from './factories/calculation.factory';

export async function seedTestData(prisma: PrismaClient) {
  // Create workspace
  const workspace = await prisma.workspace.create({
    data: { name: 'Test Workspace', slug: 'test-workspace' },
  });

  // Create users
  const admin = await createUser(prisma, {
    role: 'admin',
    workspaceId: workspace.id,
  });
  const engineer = await createUser(prisma, {
    role: 'engineer',
    workspaceId: workspace.id,
  });

  // Create projects with calculations
  const project = await createProject(prisma, {
    ownerId: engineer.id,
    workspaceId: workspace.id,
    status: 'active',
  });
  await createCalculation(prisma, { projectId: project.id });

  return { workspace, admin, engineer, project };
}
```

### Test Data Isolation

- Each test suite creates its own data
- Never share test data between test suites
- Integration tests truncate tables in `beforeEach`
- E2E tests use dedicated test accounts (not real users)
- Parallel test execution uses separate database schemas

### Data Cleanup Between Tests

```typescript
// Integration tests: truncate affected tables
beforeEach(async () => {
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Project" CASCADE`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "User" CASCADE`);
});

// E2E tests: reset state via API calls
test.beforeEach(async ({ page }) => {
  // Reset test user state via admin API
  await api.resetTestUser();
  await page.goto('/login');
});
```

### Snapshot Testing Rules

1. Use snapshots only for stable, deterministic output
2. Review snapshot diffs carefully — they hide real bugs
3. Keep snapshots small (< 100 lines)
4. Update snapshots intentionally (`npx vitest --update`)
5. Never auto-accept snapshot updates in CI

**GOOD example:**
```typescript
it('renders calculation results in expected format', () => {
  const result = renderCalculationOutput(sampleData);
  expect(result).toMatchSnapshot();
});
```

**BAD example:**
```typescript
it('generates correct output', () => {
  // 500-line snapshot that nobody reviews
  const result = complexTransformation(deeplyNestedData);
  expect(result).toMatchSnapshot();
});
```

---

## 9. Regression Testing

### WHY

Regression testing ensures that new changes do not break existing functionality. Automated regression suites catch regressions early and reduce the risk of shipping bugs.

### RATIONALE

Every release carries regression risk. Manual regression testing is slow and inconsistent. Automated regression suites provide consistent coverage with minimal human effort.

### Automated Regression Suite Before Every Release

The full regression suite runs before every release:

```yaml
# release-pipeline.yml
jobs:
  regression:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run build
      - run: npm run test:regression  # unit + integration
      - run: npm run test:e2e:critical # critical E2E journeys
      - run: npm run test:perf         # performance budgets
```

### Visual Regression for UI

```typescript
// Playwright visual regression test
test('project list page matches snapshot', async ({ page }) => {
  await page.goto('/projects');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveScreenshot('project-list.png', {
    // 0.2% max difference
    maxDiffPixelRatio: 0.002,
  });
});
```

### API Regression Tests

```typescript
describe('API Regression — Projects', () => {
  // Run against every release to catch API contract changes
  const endpoints = [
    { method: 'GET', path: '/api/v1/projects', status: 200 },
    { method: 'GET', path: '/api/v1/projects/:id', status: 200 },
    { method: 'POST', path: '/api/v1/projects', status: 201 },
    { method: 'PATCH', path: '/api/v1/projects/:id', status: 200 },
    { method: 'DELETE', path: '/api/v1/projects/:id', status: 204 },
  ] as const;

  endpoints.forEach(({ method, path, status }) => {
    it(`${method} ${path} returns ${status}`, async () => {
      const resolvedPath = path.replace(':id', existingProjectId);
      const res = await request(app.getHttpServer())
        [method.toLowerCase()](resolvedPath)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(status);
    });
  });
});
```

### Database Migration Regression

```typescript
describe('Database migration regression', () => {
  it('rolls forward and backward without data loss', async () => {
    // Apply migration
    await runMigration('20260601_add_calculation_type');
    // Verify schema
    const columns = await prisma.$queryRaw`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'Calculation' AND column_name = 'type'
    `;
    expect(columns).toHaveLength(1);
    // Rollback
    await runMigration('20260601_add_calculation_type', 'down');
    // Verify column removed
    const columnsAfter = await prisma.$queryRaw`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'Calculation' AND column_name = 'type'
    `;
    expect(columnsAfter).toHaveLength(0);
  });
});
```

**GOOD example:**
```typescript
it('creating a project does not break search indexing', async () => {
  const before = await searchService.count();
  await projectService.createProject(userId, projectData);
  const after = await searchService.count();
  expect(after).toBe(before + 1);
});
```

**BAD example:**
```typescript
// No regression tests — hope for the best
```

---

## 10. CI Quality Gates

### WHY

CI quality gates enforce testing standards automatically. They prevent low-quality or broken code from reaching production.

### RATIONALE

Manual quality checks are inconsistent and bypassed under pressure. Automated gates ensure every change meets the same standards. Gates should fail fast to minimize feedback time.

### CI Quality Gate Pipeline

```mermaid
flowchart LR
    A[PR Created] --> B[Lint & Format]
    B -->|Pass| C[Typecheck]
    B -->|Fail| Z[Block PR]
    C -->|Pass| D[Unit Tests]
    C -->|Fail| Z
    D -->|Pass & Coverage OK| E[Build]
    D -->|Fail| Z
    E -->|Pass| F[Integration Tests]
    E -->|Fail| Z
    F -->|Pass| G[Quality Gate Passed]
    F -->|Fail| Z

    H[Release] --> I[All PR gates]
    I -->|Pass| J[E2E Tests]
    J -->|Pass| K[Performance Tests]
    K -->|Pass| L[Security Scan]
    L -->|Pass| M[Release Gate Passed]
    L -->|Fail| Z
    K -->|Fail| Z
    J -->|Fail| Z

    subgraph PR Gates
        B
        C
        D
        E
        F
    end

    subgraph Release Gates
        J
        K
        L
    end

    style A fill:#8cf
    style G fill:#9f6
    style M fill:#9f6
    style Z fill:#f96
```

### PR Gates (Every Pull Request)

| Gate | Tool | Failure Action | Time Budget |
|------|------|---------------|-------------|
| Lint & Format | ESLint + Prettier | Block PR | 2 min |
| Typecheck | TypeScript / mypy | Block PR | 3 min |
| Unit Tests | Vitest / pytest | Block PR | 5 min |
| Build | tsc / esbuild / webpack | Block PR | 5 min |
| Integration Tests | Vitest + Testcontainers | Block PR | 15 min |
| Coverage Check | c8 / coverage.py | Block PR | 1 min |

### Release Gates (Before Deployment)

| Gate | Tool | Failure Action | Time Budget |
|------|------|---------------|-------------|
| All PR gates | (as above) | Block release | — |
| E2E Tests | Playwright | Block release | 20 min |
| Performance Tests | k6 | Block release | 15 min |
| Security Scan | Trivy + OWASP ZAP | Block release | 10 min |
| Dependency Audit | npm audit / pip audit | Warn | 2 min |
| SBOM Generation | CycloneDX | Log | 2 min |

### Quality Gate Thresholds

| Metric | Threshold |
|--------|-----------|
| Unit test pass rate | 100% |
| Integration test pass rate | 100% |
| Lint errors | 0 errors, 0 warnings |
| Type errors | 0 errors |
| Build success | 100% |
| Line coverage (backend) | ≥ 80% |
| Branch coverage (backend) | ≥ 70% |
| Line coverage (frontend) | ≥ 60% |
| Performance P95 | Within budget |
| Dependency CVEs (Critical/High) | 0 blocking |

**GOOD example:**
```yaml
# .github/workflows/pr.yml
name: PR Quality Gates
on: [pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run typecheck
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:unit -- --coverage
  integration:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:integration
```

**BAD example:**
```yaml
# No quality gates — anything goes
steps:
  - run: npm run build
  - run: npm run deploy
```

---

## 11. Test Organization

### WHY

Consistent test organization makes it easy to find, run, and understand tests. Naming conventions convey the test type and scope at a glance.

### RATIONALE

Convention over configuration. Every developer should know exactly where to find and where to add tests. Test file names encode the test type, enabling targeted CI execution.

### Naming Conventions

| Test Type | File Suffix | Location | Runner |
|-----------|-------------|----------|--------|
| Unit test | `*.spec.ts` | Co-located with source | `vitest` |
| Integration test | `*.int-spec.ts` | `__tests__/` directory | `vitest` |
| E2E test | `*.e2e-spec.ts` | `test/e2e/` | `playwright` |
| Performance test | `*.perf.js` / `*.perf.ts` | `tests/performance/` | `k6` |

### Directory Structure

```
src/
  projects/
    project.service.ts
    project.service.spec.ts         # unit test — co-located
    project.controller.ts
    project.controller.spec.ts      # unit test — co-located
    __tests__/
      project.int-spec.ts           # integration test
      project.factory.ts            # test factory
test/
  e2e/
    login.e2e-spec.ts               # E2E test
    search.e2e-spec.ts              # E2E test
    upload.e2e-spec.ts              # E2E test
  performance/
    calculate-load.perf.js          # k6 load test
    search-load.perf.js             # k6 load test
  seed.ts                           # integration test seed data
  setup.ts                          # global test setup
```

### Co-location for Unit Tests

Unit tests live next to the source file they test:

```
src/projects/project.service.ts
src/projects/project.service.spec.ts
src/projects/project.guard.ts
src/projects/project.guard.spec.ts
```

### Decision Tree: What Type of Test to Write

```mermaid
flowchart TD
    A[What am I testing?] --> B{Pure logic or<br/>data transformation?}
    B -->|Yes| C[Unit test]
    B -->|No| D{Involves database,<br/>queue, or external?}
    D -->|No| C
    D -->|Yes| E{Testing a user-facing<br/>flow across services?}
    E -->|Yes| F[E2E test]
    E -->|No| G{Testing performance<br/>or load characteristics?}
    G -->|Yes| H[Performance test]
    G -->|No| I{Testing security<br/>or auth behavior?}
    I -->|Yes| J[Security test]
    I -->|No| K{Testing multiple<br/>components together?}
    K -->|Yes| L[Integration test]
    K -->|No| C

    style C fill:#9f6
    style F fill:#6cf
    style H fill:#fc6
    style J fill:#f96
    style L fill:#6f9
```

### Testing Checklist for PR Submission

Before submitting a PR, complete this checklist:

```markdown
## ✅ Testing Checklist

### Unit Tests
- [ ] All new public methods have unit tests
- [ ] All new business logic branches are covered
- [ ] Error paths are tested (not just happy paths)
- [ ] Edge cases covered (empty, null, max length, etc.)
- [ ] Tests follow AAA pattern
- [ ] Test names follow convention: `it('should ... when ...')`
- [ ] Mocks use proper types (not `as any`)
- [ ] No test depends on another test's state

### Integration Tests
- [ ] All new API endpoints have integration tests
- [ ] Response status codes verified (200, 201, 400, 401, 403, 404, 500)
- [ ] Response body shape matches expected schema
- [ ] Error responses include proper error codes
- [ ] Database state changes verified
- [ ] Authorization tests: valid role, insufficient role, no auth

### E2E Tests (if applicable)
- [ ] Critical user journeys covered
- [ ] Tests run in headless mode
- [ ] Test accounts are dedicated (not shared with manual testing)

### Coverage
- [ ] Line coverage meets threshold (80% backend / 60% frontend)
- [ ] New code has adequate coverage
- [ ] Critical paths have 100% coverage

### Performance (if applicable)
- [ ] New endpoints have k6 scripts (if performance-critical)
- [ ] Performance budgets defined
- [ ] Load test passes at 2x expected concurrency

### Security (if applicable)
- [ ] Auth bypass tests added for new endpoints
- [ ] Injection tests added for new input fields
- [ ] Rate limiting tested

### CI
- [ ] All CI quality gates pass
- [ ] No test flakiness introduced
- [ ] Test run time is within budget (< 30 min total)
```

---

## References

- [ADR-010: Testing Strategy](../decisions/ADR-010-testing-strategy.md)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [k6 Documentation](https://k6.io/docs/)
- [Testcontainers Documentation](https://node.testcontainers.org/)
- [OWASP ZAP Documentation](https://www.zaproxy.org/docs/)
- [Martin Fowler — Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
