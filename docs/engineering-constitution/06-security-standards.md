# 6. Security Standards

> **Cross-References**: [Security Docs](../security/) · [Gap Analysis](../reference-architecture/09-gap-analysis.md)
>
> **Status**: Adopted · **Version**: 1.0.0 · **Last Updated**: 2026-06-26

---

## Table of Contents

1. [OWASP Top 10 Compliance](#1-owasp-top-10-compliance)
2. [JWT Standards](#2-jwt-standards)
3. [Secrets Management](#3-secrets-management)
4. [Encryption](#4-encryption)
5. [MFA](#5-mfa)
6. [RBAC](#6-rbac)
7. [Input Validation](#7-input-validation)
8. [Output Encoding](#8-output-encoding)
9. [Dependency Scanning](#9-dependency-scanning)
10. [SAST/DAST](#10-sastdast)
11. [Container Security](#11-container-security)
12. [Backup & DR](#12-backup--dr)
13. [Incident Response](#13-incident-response)
14. [Security Checklist for PRs](#14-security-checklist-for-prs)

---

## 1. OWASP Top 10 Compliance

### WHY

The OWASP Top 10 represents the most critical security risks to web applications. Compliance ensures systematic mitigation of the most common and dangerous attack vectors. Every team member must understand and apply these mitigations by default.

### RATIONALE

OWASP Top 10 is the industry-standard security baseline. Regulatory frameworks (SOC 2, ISO 27001, GDPR) reference it. Following these mitigations reduces our risk surface by an estimated 85% against common attacks. Verification must be automated where possible and manual where judgment is required.

### A01: Broken Access Control

**What we do:**
- Server-side authorization checks on every endpoint using the RBAC middleware
- Deny-by-default access control — resources are inaccessible unless explicitly permitted
- Vertical access control (admin vs user) AND horizontal access control (user A vs user B data)
- CORS policies restrict cross-origin requests to approved origins only

**What we check:**
- Every API endpoint has an authorization guard
- IDOR vulnerabilities: user can only access their own resources
- No direct object references without ownership verification
- HTTP method restrictions on all routes

**Verification method:**
- Automated: Custom ESLint rule enforces `@UseGuards()` decorator on every controller
- Automated: Integration tests attempt unauthorized access on every endpoint
- Manual: Quarterly penetration testing targets access control bypass

**GOOD example:**
```typescript
@Get('projects/:id')
@UseGuards(JwtAuthGuard, ProjectAccessGuard) // double guard
@ProjectAccess('read')
async getProject(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
  // RBAC middleware already verified user has read access to this project
  return this.projectService.findOne(id, user.workspaceId);
}
```

**BAD example:**
```typescript
@Get('projects/:id')
async getProject(@Param('id') id: string) {
  // No auth guard
  // No UUID validation
  // No workspace isolation
  return this.projectService.findOne(id);
}
```

### A02: Cryptographic Failures

**What we do:**
- TLS 1.3 for all traffic in transit
- Column-level encryption for PII using AES-256-GCM
- Passwords hashed with bcrypt (cost factor 12)
- All encryption uses well-audited libraries (Node.js crypto, Python cryptography)
- No custom cryptographic implementations

**What we check:**
- All database connections use TLS
- All external API calls use HTTPS
- Secrets are never transmitted in URLs or headers of outgoing requests
- Encryption keys are stored in a dedicated key management system

**Verification method:**
- Automated: CI checks for `http://` in production configuration
- Automated: tls-scanner runs weekly against all endpoints
- Automated: CodeQL detects weak cryptographic primitives

**GOOD example:**
```typescript
import { createCipheriv, randomBytes } from 'node:crypto';

export function encrypt(text: string, key: Buffer): { encrypted: string; iv: string } {
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return { encrypted: `${encrypted}:${authTag}`, iv: iv.toString('hex') };
}
```

**BAD example:**
```typescript
// Using MD5 for password hashing
import { createHash } from 'node:crypto';
const hash = createHash('md5').update(password).digest('hex');
```

### A03: Injection

**What we do:**
- Parameterized queries / prepared statements for ALL database operations
- Prisma ORM (parameterized by default) — no raw SQL without review
- Input validation on every user-supplied value
- No `eval()`, no `new Function()`, no dynamic `require()` with user input
- Content-Type validation to prevent deserialization attacks

**What we check:**
- No raw SQL in the codebase (guarded by ESLint)
- All user input is validated before reaching a query builder
- Serialization/deserialization uses safe parsers (JSON.parse with reviver, never `eval`)
- No command injection vectors (child_process with user input)

**Verification method:**
- Automated: ESLint plugin `no-restricted-syntax` blocks `$queryRaw` / `$executeRaw` in Prisma
- Automated: CodeQL injection queries run on every PR
- Automated: Fuzz testing on all input fields quarterly

**GOOD example:**
```typescript
// Prisma — parameterized by default, safe from injection
const user = await prisma.user.findUnique({
  where: { email: input.email }, // parameterized automatically
});
```

**BAD example:**
```typescript
// Raw SQL — injection vulnerability
const result = await prisma.$queryRawUnsafe(
  `SELECT * FROM users WHERE email = '${input.email}'`,
);
```

### A04: Insecure Design

**What we do:**
- Threat modeling in design phase for all new features
- Security review as part of RFC/ADR process
- Rate limiting on all endpoints (global: 100 req/min, auth: 10 req/min)
- Account lockout after 5 failed attempts
- Secure defaults: MFA enforced for admin, HTTPS only, HSTS enabled

**What we check:**
- Every new feature has a security consideration section in its RFC
- Rate limiting configuration exists per endpoint category
- Account lockout thresholds are configured and tested
- Secure defaults are documented and verified

**Verification method:**
- Automated: Rate limiting tested in integration tests
- Automated: Lockout mechanism verified in E2E tests
- Manual: Architecture review sign-off for every new feature

**GOOD example:**
```typescript
// Rate limiting middleware applied at bootstrap
app.register(import('@fastify/rate-limit'), {
  max: 100,
  timeWindow: '1 minute',
  keyGenerator: (request) => request.ip,
});
```

**BAD example:**
```typescript
// No rate limiting — vulnerable to brute force
app.post('/auth/login', loginHandler);
```

### A05: Security Misconfiguration

**What we do:**
- Hardened container images (non-root, minimal packages)
- Disabled directory listing on web servers
- No default credentials ever
- CORS configured with strict origin allowlist
- Security headers: HSTS, X-Content-Type-Options, X-Frame-Options, CSP
- Helm/Kubernetes security contexts enforced
- Debug/development endpoints disabled in production

**What we check:**
- `securityHeaders` middleware is registered in every Fastify instance
- No production config contains `allowAllOrigins: true`
- No debug endpoints accessible in production builds
- No default passwords in seed scripts or config files

**Verification method:**
- Automated: `security.txt` scanner runs monthly
- Automated: OWASP ZAP baseline scan in CI
- Manual: Quarterly configuration audit against CIS benchmarks

**GOOD example:**
```typescript
// Fastify security headers
app.register(import('@fastify/helmet'), {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
});
```

**BAD example:**
```typescript
// No security headers, no CORS restrictions
app.register(import('@fastify/cors'), { origin: true });
```

### A06: Vulnerable Components

**What we do:**
- Automated dependency scanning in CI (trivy, npm audit, pip audit)
- Weekly dependency update PRs via Renovate/Dependabot
- Lockfiles committed and reviewed (package-lock.json, yarn.lock, pnpm-lock.yaml)
- SBOM generation for every release (CycloneDX format)
- Component inventory tracked in security dashboard

**What we check:**
- No dependency with known CVSS >= 7.0 vulnerability in production
- All transitive dependencies are scanned
- Deprecated libraries are flagged and scheduled for replacement
- License compliance is validated for all dependencies

**Verification method:**
- Automated: CI fails if any dependency has CVSS >= 7.0
- Automated: Weekly full dependency audit report emailed to security team
- Manual: Quarterly review of outdated but not-yet-vulnerable dependencies

**GOOD example:**
```yaml
# .github/workflows/dependency-scan.yml
steps:
  - uses: actions/checkout@v4
  - name: Trivy scan
    uses: aquasecurity/trivy-action@master
    with:
      scan-type: 'fs'
      scan-ref: '.'
      severity: 'CRITICAL,HIGH'
      exit-code: '1'
```

**BAD example:**
```yaml
# No dependency scanning — vulnerable libraries ship to production
steps:
  - name: Build and push
    run: docker build -t app:latest .
```

### A07: Identification & Authentication Failures

**What we do:**
- JWT-based authentication with RS256 signatures
- MFA enforced for admin roles, optional for standard users
- Password policy: min 12 chars, complexity requirements, no common passwords
- Account lockout after 5 failed login attempts (15 minute cooldown)
- Session timeout: 15 min for access token, 7 days for refresh token
- Credential rotation every 90 days
- Breached password detection (Have I Been Pwned API)

**What we check:**
- Auth tokens are never logged, never sent in URLs
- Token revocation on password change
- Refresh token rotation invalidates old tokens
- Concurrent session limits enforced

**Verification method:**
- Automated: Integration tests verify token expiry and revocation
- Automated: E2E tests cover login, MFA, password reset flows
- Manual: Quarterly credential stuffing simulation

**GOOD example:**
```typescript
export class AuthService {
  async login(email: string, password: string): Promise<AuthTokens> {
    const user = await this.validateCredentials(email, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (await this.isAccountLocked(user.id)) {
      throw new TooManyRequestsException('Account temporarily locked');
    }
    if (user.mfaEnabled) {
      return { requiresMfa: true, sessionToken: generateSessionToken(user.id) };
    }
    return this.generateTokens(user);
  }
}
```

**BAD example:**
```typescript
// No MFA check, no lockout, no rate limiting
async login(email: string, password: string) {
  const user = await User.findOne({ where: { email } });
  if (user.password !== password) throw new Error('Invalid');
  return jwt.sign({ id: user.id }, 'secret', { expiresIn: '30d' });
}
```

### A08: Software & Data Integrity Failures

**What we do:**
- Signed commits (GPG) for all production code
- Signed container images with Cosign
- CI/CD pipeline integrity checks (no manual overrides)
- npm package integrity: `lockfile` committed, `npm audit` in CI
- Supply chain security: dependency review on every PR
- Reproducible builds where feasible

**What we check:**
- All CI pipeline steps are immutable (pinned action versions)
- No unsigned commits in main branch
- All containers have provenance attestation (SLSA Level 2+)
- CI pipeline cannot be bypassed for production deployments

**Verification method:**
- Automated: Branch protection rules require signed commits
- Automated: Cosign verification in deployment pipeline
- Manual: Quarterly supply chain security review

**GOOD example:**
```yaml
# Container signing in CI
steps:
  - name: Sign container
    uses: sigstore/cosign-installer@v3
  - name: Sign image
    run: cosign sign --key env://COSIGN_KEY ${{ env.REGISTRY }}/app:${{ github.sha }}
```

**BAD example:**
```yaml
# No signing, no provenance
steps:
  - name: Push image
    run: docker push ${{ env.REGISTRY }}/app:latest
```

### A09: Logging & Monitoring Failures

**What we do:**
- Structured JSON logging for all services
- Log ALL authentication events (login, logout, MFA, password reset)
- Log ALL authorization failures (403 responses)
- Log ALL admin operations (CRUD on sensitive resources)
- Centralized log aggregation (OpenObserve)
- Log retention: 90 days hot, 1 year cold, 3 year archive for security events
- Real-time alerting on security events (multiple failed logins, privilege escalation)

**What we check:**
- No sensitive data in logs (PII, credentials, tokens)
- Audit trail is immutable (append-only log shipper)
- All security events are logged at minimum WARN level
- Logs include correlation ID for traceability

**Verification method:**
- Automated: Log scrubber runs before log ingestion (detects and redacts PII)
- Automated: Integration tests verify log output for security events
- Manual: Quarterly audit log review

**GOOD example:**
```typescript
this.logger.warn({
  event: 'AUTH_FAILURE',
  userId: user.id,
  reason: 'INVALID_MFA_CODE',
  ip: request.ip,
  correlationId: request.correlationId,
  timestamp: new Date().toISOString(),
}, 'Authentication failed — invalid MFA code');
```

**BAD example:**
```typescript
console.log(`Login failed for user ${email} with password ${password}`);
```

### A10: Server-Side Request Forgery (SSRF)

**What we do:**
- URL allowlist for outbound requests from backend services
- No user-supplied URLs are fetched directly by the server
- Internal network is firewalled from application services
- Metadata service (cloud provider) is blocked via IMDS firewall
- HTTP client configured with no redirect following, restricted ports

**What we check:**
- No user input is passed to fetch/axios/request URL
- All outbound HTTP requests go through a proxy with allowlist
- Localhost, 127.0.0.1, 169.254.169.254, and internal CIDR blocks are not allowed
- URL parser validates protocol (rejects file://, gopher://, dict://)

**Verification method:**
- Automated: SAST rules flag any user-input-to-URL data flow
- Automated: Integration tests verify SSRF block on internal endpoints
- Manual: Quarterly SSRF-focused penetration testing

**GOOD example:**
```typescript
export class DocumentFetcher {
  private readonly allowedHosts = ['docs.example.com', 'cdn.example.com'];

  async fetchDocument(url: string): Promise<Buffer> {
    const parsed = new URL(url);
    if (!this.allowedHosts.includes(parsed.hostname)) {
      throw new ForbiddenException('Host not allowed');
    }
    if (parsed.protocol !== 'https:') {
      throw new ForbiddenException('Only HTTPS allowed');
    }
    return this.httpClient.get(url); // client blocks internal IPs
  }
}
```

**BAD example:**
```typescript
// Direct user-controlled URL fetch — SSRF vulnerability
async function fetchData(userUrl: string) {
  const response = await fetch(userUrl);
  return response.json();
}
```

---

## 2. JWT Standards

### WHY

JSON Web Tokens provide a stateless, portable authentication mechanism. Consistent token format and validation across all services prevents authentication bypass and session hijacking.

### RATIONALE

Standardized JWT implementation reduces integration errors between services. RS256 ensures asymmetric signing so any service can verify without holding the signing key. Short-lived access tokens limit exposure window if a token is compromised.

### Token Format

All JWTs MUST conform to RFC 7519 with the following header and payload structure:

```json
// HEADER
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "key-id-2026-q1"
}

// PAYLOAD (Access Token)
{
  "sub": "user_abc123def",
  "exp": 1712345678,
  "iat": 1712344778,
  "jti": "unique-token-id-xyz",
  "iss": "xennic-api",
  "aud": "xennic-web",
  "workspace_id": "ws_789ghi",
  "roles": ["admin", "engineer"],
  "mfa_verified": true
}
```

### Signing Algorithm

| Parameter | Value |
|-----------|-------|
| Algorithm | RS256 (RSA PKCS#1 v1.5 with SHA-256) |
| Key size | 2048 bits minimum |
| Key rotation | Every 90 days |
| Key storage | Vault/HashiCorp for private key, JWKS endpoint for public keys |

### Token Expiration

| Token Type | Lifetime | Refresh Behavior |
|------------|----------|-----------------|
| Access Token | 15 minutes | Must use refresh token |
| Refresh Token | 7 days | Rotation (old invalidated) |
| MFA Session Token | 5 minutes | Single-use |

### Claim Structure

**Registered claims (required):**
- `sub` — User identifier (UUID)
- `exp` — Expiration time (Unix timestamp, UTC)
- `iat` — Issued at (Unix timestamp, UTC)
- `jti` — Unique token identifier (UUID v4)
- `iss` — Issuer (`xennic-api`)
- `aud` — Audience (`xennic-web`, `xennic-mobile`)

**Private claims:**
- `workspace_id` — Multi-tenant workspace identifier
- `roles` — Array of role strings (e.g., `["admin", "engineer"]`)
- `mfa_verified` — Boolean, true if MFA was completed in this session

### Token Validation

All services MUST validate every incoming token:

1. Verify signature using the JWKS public key
2. Check `exp` is in the future (with 30s clock skew tolerance)
3. Verify `iss` matches trusted issuer
4. Verify `aud` includes the current service
5. Check `jti` is not in the blacklist
6. Verify `workspace_id` matches the requested resource's workspace

**GOOD example:**
```typescript
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    if (!token) return false;

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        issuer: 'xennic-api',
        audience: ['xennic-web', 'xennic-mobile'],
        clockTolerance: 30,
      });
      if (await this.tokenBlacklistService.isBlacklisted(payload.jti)) {
        return false;
      }
      request.user = payload;
      return true;
    } catch {
      return false;
    }
  }
}
```

**BAD example:**
```typescript
// No audience check, no issuer check, no blacklist check
const payload = jwt.verify(token, 'shared-secret');
return payload;
```

### Token Rotation

When a refresh token is used to obtain new tokens:
1. Validate the refresh token
2. Generate a new access token and refresh token
3. Blacklist the old refresh token's `jti`
4. Return new token pair

**GOOD example:**
```typescript
async refreshTokens(refreshToken: string): Promise<AuthTokens> {
  const payload = await this.validateRefreshToken(refreshToken);
  await this.tokenBlacklistService.add(payload.jti, payload.exp);
  return this.generateTokens(payload.sub, payload.workspace_id, payload.roles);
}
```

**BAD example:**
```typescript
// No rotation — same refresh token issued repeatedly
async refreshTokens(refreshToken: string) {
  const payload = jwt.verify(refreshToken, 'secret');
  return { accessToken: jwt.sign({ sub: payload.sub }, 'secret', { expiresIn: '15m' }), refreshToken };
}
```

### Blacklist on Logout

On explicit logout:
1. Blacklist the access token's `jti` (until its natural expiry)
2. Blacklist the refresh token's `jti`
3. Clear any server-side session storage

**GOOD example:**
```typescript
async logout(accessToken: string, refreshToken: string): Promise<void> {
  const accessPayload = this.decodeToken(accessToken);
  const refreshPayload = this.decodeToken(refreshToken);
  await Promise.all([
    this.tokenBlacklistService.add(accessPayload.jti, accessPayload.exp),
    this.tokenBlacklistService.add(refreshPayload.jti, refreshPayload.exp),
  ]);
  this.logger.info({ event: 'LOGOUT', userId: accessPayload.sub }, 'User logged out');
}
```

### Authentication Flow with MFA

```mermaid
sequenceDiagram
    actor U as User
    participant W as Web App
    participant A as API Gateway
    participant S as Auth Service
    participant V as Vault (Keys)

    U->>W: Enter credentials
    W->>A: POST /auth/login
    A->>S: Validate credentials
    S->>S: Check password hash
    S-->>A: Credentials valid
    A-->>W: Require MFA (session_token)

    U->>W: Enter TOTP code
    W->>A: POST /auth/mfa-verify
    A->>S: Verify TOTP
    S->>S: Validate TOTP against user secret
    S-->>A: MFA valid
    A->>V: Sign JWT with RS256
    V-->>A: Signed tokens
    A-->>W: access_token + refresh_token
    W->>A: GET /api/v1/projects (Authorization: Bearer access_token)
    A->>A: Validate JWT signature via JWKS
    A->>A: Check claims (exp, iss, aud, jti)
    A->>A: Verify jti not blacklisted
    A-->>W: 200 OK + data
```

---

## 3. Secrets Management

### WHY

Hardcoded secrets are the leading cause of credential exposure. A systematic secrets management process prevents accidental leaks and enables safe rotation.

### RATIONALE

Secrets must never exist in code, version control, or unencrypted files. Centralized secret storage with access auditing ensures that every secret access is traceable. Rotation limits the blast radius of any single credential exposure.

### Where Secrets Live

| Environment | Storage | Access Method |
|-------------|---------|---------------|
| Production | Docker Secrets (mounted at `/run/secrets/`) | File read at startup |
| Staging | HashiCorp Vault (k8s) | Vault sidecar injection |
| Development | 1Password CLI / .env.local (gitignored) | `op run` or dotenv |
| CI/CD | GitHub Actions Secrets | `${{ secrets.* }}` |
| Local | 1Password CLI | `op inject` |

### What Is a Secret

Everything below MUST be treated as a secret:

- Database credentials (username, password, connection string)
- API keys and tokens (third-party services, internal services)
- JWT signing keys (private keys)
- Encryption keys and passphrases
- TLS/SSL private keys
- OAuth client secrets
- SMTP/email credentials
- Cloud provider credentials
- Any token, key, or credential that grants access

### Secret Rotation Policy

| Secret Type | Rotation Interval | Method |
|-------------|------------------|--------|
| JWT signing keys | 90 days | Rotate JWKS, allow 24h overlap |
| Database passwords | 90 days | Zero-downtime rotation via master password |
| API keys (third-party) | 90 days or on revocation | Manual rotation with 1Password |
| Encryption keys | 180 days | Re-encrypt data with new key |
| TLS certificates | 60 days | Let's Encrypt auto-renewal |
| Cloud provider keys | 90 days | Automated via cloud IAM |

### Secret Rotation Flow

```mermaid
sequenceDiagram
    participant T as Team/Developer
    participant V as 1Password/Vault
    participant C as CI/CD
    participant P as Production
    participant M as Monitor

    Note over T,M: Scheduled Rotation (Every 90 days)
    T->>V: Trigger rotation
    V->>V: Generate new secret
    V->>C: Push new secret to CI
    C->>C: Update deployment config
    C->>P: Rolling restart with new secret
    P->>M: Health check passes with new secret
    M-->>C: All instances healthy
    C->>V: Mark old secret as decommissioned
    V->>V: Schedule old secret deletion (48h delay)

    Note over T,M: Emergency Rotation (Breach)
    T->>V: Emergency rotation trigger
    V->>V: Generate new secret immediately
    V->>C: Deploy new secret
    C->>P: Force restart all instances
    P->>M: Health check
    M-->>C: Verify all instances on new secret
    C->>V: Immediate old secret revocation
    V->>T: Rotation complete notification
```

### `.env.example` — Without Real Values

Every project MUST include a `.env.example` file with placeholder values:

```bash
# .env.example — Copy to .env.local and fill in real values
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/xennic_dev

# JWT
JWT_PRIVATE_KEY_PATH=/run/secrets/jwt_private_key.pem
JWT_PUBLIC_KEY_PATH=/run/secrets/jwt_public_key.pem

# Auth
MFA_ISSUER=XennicDev

# Third-party
OPENAI_API_KEY=sk-placeholder
```

### `.gitignore` for `.env`

Every project MUST include in `.gitignore`:

```gitignore
# Environment files
.env
.env.local
.env.*.local
.env.production
*.env
```

### Verification

- CI pipeline checks: fail if any file contains `-----BEGIN RSA PRIVATE KEY-----`
- gitleaks / truffleHog scan on every commit
- Quarterly secrets audit — verify no secrets in git history

**GOOD example:**
```typescript
// Production: read from Docker secrets
import { readFileSync } from 'node:fs';

function getSecret(name: string): string {
  if (process.env.NODE_ENV === 'production') {
    return readFileSync(`/run/secrets/${name}`, 'utf-8').trim();
  }
  return process.env[name] ?? '';
}

const jwtPrivateKey = getSecret('JWT_PRIVATE_KEY');
```

**BAD example:**
```typescript
// Hardcoded secret in source code
const jwtSecret = 'supersecretkey12345';
// or
const dbPassword = 'password123';
```

---

## 4. Encryption

### WHY

Encryption protects data at rest and in transit. Defense in depth requires multiple encryption layers so that a single breach does not expose sensitive data.

### RATIONALE

TLS 1.3 is the current gold standard for transit encryption. Column-level encryption protects PII even if the database is compromised. Key rotation limits the damage from key exposure. All encryption must use vetted libraries.

### TLS 1.3 for All Traffic

| Parameter | Requirement |
|-----------|-------------|
| Minimum TLS version | 1.3 |
| Cipher suites | TLS_AES_128_GCM_SHA256, TLS_AES_256_GCM_SHA384 |
| HTTP/2 | Required (reduces overhead, enforces TLS) |
| Certificate provider | Let's Encrypt (production), internal CA (staging) |

### HSTS Headers

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### Certificate Management

- All certificates provisioned via Let's Encrypt with ACME protocol
- Automatic renewal via cert-manager (Kubernetes) or acme.sh
- Certificate expiry monitoring with 30-day, 7-day, 24-hour alerts
- Certificate revocation procedure documented in runbook

### PGP for Sensitive Data at Rest

- PGP-encrypt all archived data exports
- PGP-encrypt all backup files
- PGP keys stored in Vault, never in code
- Public keys shared via keyserver, private keys in Vault

### Column-Level Encryption for PII

| Field | Encryption | Algorithm |
|-------|------------|-----------|
| Email | Deterministic (for lookups) | AES-256-GCM with deterministic IV derivation |
| Phone | Randomized | AES-256-GCM |
| Address | Randomized | AES-256-GCM |
| SSN/National ID | Randomized | AES-256-GCM |
| Date of birth | Randomized | AES-256-GCM |

**GOOD example:**
```typescript
export class EncryptionService {
  async encryptPII(plaintext: string, keyId: string): Promise<string> {
    const key = await this.keyManagementService.getKey(keyId, 'encryption');
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${keyId}:${iv.toString('hex')}:${encrypted}:${cipher.getAuthTag().toString('hex')}`;
  }
}
```

**BAD example:**
```typescript
// No encryption for PII
await prisma.user.create({
  data: { email: user.email, phone: user.phone }, // stored in plaintext
});
```

### Encryption Key Rotation

```mermaid
flowchart LR
    A[Current Key K1] --> B[Generate K2]
    B --> C[Mark K1 as read-only]
    C --> D[Re-encrypt data with K2]
    D --> E[Verify all data readable with K2]
    E --> F[Revoke K1]
    F --> G[Audit: all data encrypted with K2]

    style A fill:#f96
    style F fill:#9f6
    style G fill:#9f6
```

---

## 5. MFA

### WHY

Passwords alone are insufficient. MFA reduces the risk of account takeover by 99.9% according to Microsoft's analysis.

### RATIONALE

TOTP is the chosen MFA method because it is standards-based (RFC 6238), works without network connectivity, and is supported by all authenticator apps. Backup codes ensure account recovery if the authenticator device is lost.

### TOTP Implementation

- Algorithm: SHA-1 (per RFC 6238)
- Digits: 6
- Time step: 30 seconds
- Issuer: `Xennic` (env-configurable per workspace)
- Secret: 160-bit random, base32-encoded

**GOOD example:**
```typescript
import { authenticator } from 'otplib';

export class MfaService {
  generateSecret(): string {
    return authenticator.generateSecret();
  }

  generateQRCodeUri(secret: string, email: string, issuer: string): string {
    return authenticator.keyuri(email, issuer, secret);
  }

  verifyToken(token: string, secret: string): boolean {
    return authenticator.verify({ token, secret });
  }
}
```

### Backup Codes

- 10 single-use backup codes generated at MFA setup
- Each code is a 16-character alphanumeric string
- Stored as bcrypt hashes in the database
- User must save/download during setup
- Regeneration invalidates previous codes

**GOOD example:**
```typescript
async generateBackupCodes(userId: string): Promise<string[]> {
  const codes: string[] = [];
  const hashedCodes: string[] = [];
  for (let i = 0; i < 10; i++) {
    const code = crypto.randomBytes(8).toString('hex');
    codes.push(code);
    hashedCodes.push(await bcrypt.hash(code, 10));
  }
  await this.prisma.user.update({
    where: { id: userId },
    data: { mfaBackupCodes: hashedCodes },
  });
  return codes; // Return plaintext codes ONE TIME only
}
```

### Recovery Flow

```mermaid
sequenceDiagram
    actor U as User
    participant W as Web App
    participant S as Auth Service

    U->>W: Enter credentials
    W->>S: POST /auth/login
    S-->>W: MFA required (session_token)
    U->>W: Enter TOTP (wrong 3x)
    W->>S: POST /auth/mfa-verify
    S-->>W: MFA failed

    U->>W: Click "Use backup code"
    W->>S: POST /auth/recover
    S-->>W: Enter backup code
    U->>W: Enter backup code
    W->>S: POST /auth/recover-verify
    S->>S: Validate backup code hash
    S->>S: Invalidate used backup code
    S-->>W: Recovery success (temporary session)

    U->>W: Set up new MFA device
    W->>S: POST /auth/mfa/setup
    S->>S: Generate new secret
    S-->>W: New QR code + backup codes
    U->>W: Confirm new MFA setup
    W->>S: POST /auth/mfa/confirm
    S->>S: Verify TOTP against new secret
    S-->>W: MFA reconfigured
```

### MFA Enforced for Admin Roles

| Role | MFA Requirement |
|------|----------------|
| super_admin | Required |
| admin | Required |
| engineer | Optional (recommended) |
| viewer | Optional |
| api_only | Not applicable |

### MFA Setup in Onboarding

1. User completes initial registration (email + password)
2. System checks: if role is admin → MFA setup required
3. User scans QR code with authenticator app
4. User enters TOTP to verify setup
5. User saves 10 backup codes
6. User confirms backup codes saved (checkbox)
7. MFA marked as active

**BAD example:**
```typescript
// No MFA enforcement for admin
async registerAdmin(email: string, password: string) {
  const user = await this.prisma.user.create({ data: { email, password, role: 'admin' } });
  // MFA never mentioned
  return user;
}
```

---

## 6. RBAC

### WHY

Role-Based Access Control ensures that users can only perform actions their role permits. The principle of least privilege reduces the blast radius of compromised accounts.

### RATIONALE

RBAC is the most widely adopted access control model for enterprise applications. It scales well, is auditable, and maps naturally to organizational structures. Every action must be authorized at the API layer, not just hidden in the UI.

### Permission Definition

Permissions are atomic capabilities, defined as strings in the format `resource:action`:

```
project:create
project:read
project:update
project:delete
user:invite
user:deactivate
workspace:settings:read
workspace:settings:update
billing:read
billing:manage
audit:read
admin:all
```

### Role Assignment

```typescript
// Permission map definition — single source of truth
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: ['admin:all', ...ALL_PERMISSIONS],
  admin: [
    'project:create', 'project:read', 'project:update', 'project:delete',
    'user:invite', 'user:deactivate',
    'workspace:settings:read', 'workspace:settings:update',
    'billing:read', 'billing:manage',
    'audit:read',
  ],
  engineer: [
    'project:create', 'project:read', 'project:update',
    'project:delete', // own projects only (handled by horizontal guard)
  ],
  viewer: [
    'project:read',
  ],
  api_only: [
    'project:read', 'project:create',
  ],
};
```

### Permission Evaluation

```mermaid
flowchart TD
    A[Request arrives] --> B{Authenticated?}
    B -->|No| C[401 Unauthorized]
    B -->|Yes| D{Has permission?}
    D -->|No| E[403 Forbidden]
    D -->|Yes| F{Horizontal access check}
    F -->|Own resource| G[200 OK]
    F -->|Other's resource| H{Shared with workspace?}
    H -->|Yes| G
    H -->|No| E
```

**GOOD example:**
```typescript
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.get<string>('permission', context.getHandler());
    if (!requiredPermission) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const userPermissions = ROLE_PERMISSIONS[user.role] ?? [];

    if (!userPermissions.includes(requiredPermission) && !userPermissions.includes('admin:all')) {
      this.logger.warn({ event: 'UNAUTHORIZED_ACCESS', userId: user.sub, permission: requiredPermission });
      return false;
    }

    return true;
  }
}
```

**BAD example:**
```typescript
// No centralized permission check — ad-hoc logic everywhere
async deleteProject(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  // No role check, just ownership
  if (project.ownerId !== userId) throw new ForbiddenException();
  await prisma.project.delete({ where: { id: projectId } });
}
```

### Least Privilege Principle

- Default: no permissions
- Grant minimum permissions required for the task
- Elevate temporarily with audit trail (break-glass procedure)
- Review permissions quarterly
- Remove permissions from inactive users (90 days inactive)

### Permission Audit

- Daily: automated report of permission changes
- Weekly: review of escalated privileges
- Monthly: full permission matrix review
- Quarterly: role definition review with stakeholders
- On employee offboarding: immediate permission revocation

---

## 7. Input Validation

### WHY

All external input is untrusted. Validation is the first line of defense against injection attacks, malformed data, and business logic abuse.

### RATIONALE

A whitelist approach (accept known-good) is always safer than a blacklist approach (reject known-bad). Validation at the boundary prevents corrupted data from entering the system. Multiple encoding vulnerabilities are mitigated at the input validation layer.

### All Inputs Validated

Every input source MUST be validated:

| Source | Validation |
|--------|-----------|
| Body (JSON) | Zod/class-validator schema |
| Query params | Zod schema per route |
| Path params | ParseUUIDPipe, ParseIntPipe |
| Headers | Content-Type, Authorization format, API key format |
| Cookies | Session format validation |

### Whitelist Approach

Define what is ALLOWED, reject everything else:

**GOOD example:**
```typescript
import { z } from 'zod';

const createProjectSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  description: z.string().max(1000).trim().optional(),
  type: z.enum(['residential', 'commercial', 'industrial']),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

app.post('/projects', async (req, reply) => {
  const result = createProjectSchema.safeParse(req.body);
  if (!result.success) {
    return reply.status(400).send({ error: 'Validation failed', details: result.error.issues });
  }
  // result.data is typed and validated
});
```

**BAD example:**
```typescript
app.post('/projects', async (req, reply) => {
  // No validation — raw body used directly
  const project = await prisma.project.create({ data: req.body });
});
```

### Sanitization of User Input

- Strip HTML tags from text fields (DOMPurify server-side)
- Normalize Unicode to NFC form
- Trim whitespace
- Remove control characters (0x00–0x1F, except \n, \t)
- Normalize line endings to LF

### File Upload Validation

| Check | Implementation |
|-------|---------------|
| File type | Verify MIME type (not just extension) |
| File size | Max 10MB for documents, 50MB for CAD files |
| Content scan | ClamAV scan on upload |
| File name | Strip path separators, limit to 255 chars |
| File count | Max 10 files per upload |

**GOOD example:**
```typescript
export class FileValidationPipe implements PipeTransform {
  async transform(file: MultipartFile): Promise<MultipartFile> {
    const allowedMimes = [
      'application/pdf',
      'application/x-dwg',
      'image/png',
      'image/jpeg',
    ];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(`Unsupported file type: ${file.mimetype}`);
    }
    if (file.file.size > 50 * 1024 * 1024) {
      throw new BadRequestException('File exceeds 50MB limit');
    }
    file.filename = path.basename(file.filename).replace(/[^a-zA-Z0-9._-]/g, '');
    return file;
  }
}
```

**BAD example:**
```typescript
// No file validation — accepts anything
@Post('upload')
async uploadFile(@UploadedFile() file: Express.Multer.File) {
  await this.fileService.save(file.originalname, file.buffer);
}
```

---

## 8. Output Encoding

### WHY

Output encoding prevents injection attacks that target interpreters (HTML parser, JavaScript engine, SQL parser, URL parser). Context-aware encoding ensures data is safe for its intended output context.

### RATIONALE

Different output contexts require different encoding strategies. HTML-encoding a value destined for a JavaScript context is insufficient. Every output must be encoded for its specific context based on where it appears.

### Context-Aware Encoding

| Context | Encoding Method | Example |
|---------|----------------|---------|
| HTML body | HTML entity encode | `& < > " '` → `&amp; &lt; &gt; &quot; &#x27;` |
| HTML attribute | HTML attribute encode | `"` → `&quot;`, prevent breaking out of attribute |
| URL | URL percent encode | `? # %` → `%3F %23 %25` |
| JavaScript string | JS string escape | `\n \r \' \"` |
| JSON | JSON.stringify (automatic) | All special characters escaped |
| CSS | CSS escape | Prevent CSS injection |

**GOOD example:**
```typescript
import { escape } from 'entities';

function renderUserProfile(user: User): string {
  return `
    <div class="profile">
      <h1>${escape(user.displayName)}</h1>
      <p>${escape(user.bio)}</p>
    </div>
  `;
}
```

**BAD example:**
```typescript
// No encoding — XSS vulnerability
function renderUserProfile(user: User): string {
  return `
    <div class="profile">
      <h1>${user.displayName}</h1>
      <p>${user.bio}</p>
    </div>
  `;
}
```

### Prevent XSS

- React/Next.js auto-escapes for HTML context (default behavior — must not bypass with `dangerouslySetInnerHTML`)
- Never use `v-html` in Vue without sanitization
- Content Security Policy headers block inline scripts
- Server-side rendering does NOT blindly inject user content

### Prevent Injection Through Output

- Database: always parameterized queries (never concatenate user data into SQL)
- Command line: never pass user data to shell commands
- Logging: encode user data in log messages (prevent log injection with `\n` characters)
- Email: encode user content in email templates

**GOOD example:**
```typescript
// Log user input safely — strip newlines to prevent log injection
this.logger.info('User search query', { query: sanitizeForLogs(input.query) });

function sanitizeForLogs(value: string): string {
  return value.replace(/[\n\r]/g, ' ').substring(0, 1000);
}
```

**BAD example:**
```typescript
// Log injection — attacker can inject fake log entries
this.logger.info(`User search query: ${input.query}`);
```

---

## 9. Dependency Scanning

### WHY

Modern applications depend on hundreds of open-source packages. Each dependency is a potential attack vector. Automated vulnerability scanning ensures we detect and remediate known vulnerabilities quickly.

### RATIONALE

SCA (Software Composition Analysis) must be fully automated and enforced in CI. Manual tracking does not scale. Severity thresholds prevent blocking on low-risk vulnerabilities while ensuring critical issues are addressed immediately.

### Automated Scanning in CI

| Tool | Scope | Schedule |
|------|-------|----------|
| Trivy | Container images, filesystem, repos | Every PR + daily full scan |
| npm audit | JavaScript/TypeScript dependencies | Every PR |
| pip audit | Python dependencies | Every PR |
| Renovate/Dependabot | Automated dependency updates | Weekly PRs |
| Grype | Deep SBOM scanning | Weekly |
| Snyk (optional) | Additional coverage | Weekly |

### Severity Thresholds

| Severity | CVSS Range | CI Action | Response Time |
|----------|-----------|-----------|---------------|
| Critical | 9.0–10.0 | Block PR, alert security team | 24 hours |
| High | 7.0–8.9 | Block PR, flag for review | 7 days |
| Medium | 4.0–6.9 | Warn in PR, fix in next sprint | 30 days |
| Low | 0.1–3.9 | Log, review monthly | 90 days |

### Automated PR for Vulnerability Fixes

```mermaid
flowchart TD
    A[Vulnerability detected] --> B{Severity >= High?}
    B -->|Yes| C[Create automated PR with fix]
    B -->|No| D[Log to dashboard]
    C --> E[Run full CI suite]
    E --> F{CI passes?}
    F -->|Yes| G[Auto-merge if patch + tests pass]
    F -->|No| H[Flag for manual review]
    G --> I[Notify security team]
    H --> I
    D --> J[Review in sprint planning]
```

### CVE Tracking

- All CVEs affecting production dependencies tracked in security dashboard
- CVE-to-service mapping maintained
- Quarterly CVE review: identify trends, adjust dependency strategy
- SLA for CVE remediation: Critical 24h, High 7d, Medium 30d

**GOOD example:**
```yaml
# trivy-scan.yml
steps:
  - name: Scan filesystem
    uses: aquasecurity/trivy-action@master
    with:
      scan-type: 'fs'
      scan-ref: '.'
      severity: 'CRITICAL,HIGH'
      exit-code: '1'
      format: 'sarif'
      output: 'trivy-results.sarif'
```

**BAD example:**
```yaml
# No dependency scanning
steps:
  - name: Build
    run: npm run build
```

---

## 10. SAST/DAST

### WHY

Static analysis catches vulnerabilities during development (shift left). Dynamic analysis catches vulnerabilities in running applications. Both are required for comprehensive coverage.

### RATIONALE

SAST and DAST complement each other. SAST finds issues in code logic and configuration. DAST finds runtime issues and deployment misconfigurations. Running both in CI prevents vulnerable code from reaching production.

### Static Analysis

| Tool | Language | Rules |
|------|----------|-------|
| ESLint + `eslint-plugin-security` | TypeScript/JavaScript | Detect eval, regex DoS, path traversal, unsafe regex |
| `@typescript-eslint` strict rules | TypeScript | No `any`, strict null checks, no unsafe assignment |
| CodeQL | All | Injection, XSS, SSRF, path traversal |
| Bandit | Python | Command injection, SQL injection, hardcoded passwords |
| Semgrep | All | Custom rules for business logic vulnerabilities |
| SonarQube | All | Code quality, security hotspots, technical debt |

**GOOD example:**
```json
// .eslintrc.js — security rules
{
  "plugins": ["security"],
  "rules": {
    "security/detect-object-injection": "error",
    "security/detect-non-literal-fs-filename": "error",
    "security/detect-eval-with-expression": "error",
    "security/detect-pseudoRandomBytes": "warn",
    "security/detect-possible-timing-attacks": "error",
    "no-eval": "error"
  }
}
```

### Dynamic Analysis

| Tool | Phase | Scope |
|------|-------|-------|
| OWASP ZAP | Pre-release | Full scan: active + passive |
| Nuclei | Weekly | Template-based vulnerability scanning |
| Custom fuzzer | Quarterly | API fuzzing, input boundary testing |
| OWASP ZAP Baseline | Every PR | Passive scan only (non-blocking) |

**GOOD example:**
```yaml
# ZAP baseline scan in CI
steps:
  - name: OWASP ZAP Baseline Scan
    uses: zaproxy/action-baseline@v0.12.0
    with:
      target: 'https://staging.xennic.com'
      rules_file_name: '.zap/rules.tsv'
      cmd_options: '-a -j'
```

### Secret Scanning

| Tool | Scope | Schedule |
|------|-------|----------|
| gitleaks | Git history, commits | Every push |
| truffleHog | Git history, files | Daily full scan |
| GitHub secret scanning | All repos | Real-time |

**GOOD example:**
```yaml
# pre-commit hook for secret scanning
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.0
    hooks:
      - id: gitleaks
```

**BAD example:**
```yaml
# No secret scanning — secrets leak into git history
```

---

## 11. Container Security

### WHY

Containers are the primary deployment unit. A compromised container can expose the entire application, data, and infrastructure.

### RATIONALE

Minimal images reduce attack surface. Non-root users prevent privilege escalation. Read-only root filesystems prevent container tampering. Image signing ensures supply chain integrity.

### Minimal Base Images

| Service | Base Image | Size Target |
|---------|-----------|-------------|
| NestJS API | `node:22-alpine` | < 250 MB |
| Next.js Web | `node:22-alpine` | < 300 MB |
| Python services | `python:3.12-slim` | < 400 MB |
| Base infrastructure | `gcr.io/distroless/*` | < 50 MB |

### Non-Root User

```dockerfile
# Dockerfile — always run as non-root
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Create and switch to non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000
CMD ["node", "dist/main.js"]
```

**BAD example:**
```dockerfile
FROM node:22
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
# Runs as root by default
CMD ["node", "dist/main.js"]
```

### Read-Only Root Filesystem

In Kubernetes security context:

```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1001
  runAsGroup: 1001
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
  capabilities:
    drop:
      - ALL
    add:
      - NET_BIND_SERVICE  # only if binding to privileged port
  seccompProfile:
    type: RuntimeDefault
```

### Image Signing

- All container images signed with Cosign
- Signature verified at deployment time
- Admission controller rejects unsigned images
- Keyless signing with GitHub OIDC for CI

### Image Vulnerability Scanning

- All images scanned by Trivy on push to registry
- Critical and High severity findings block deployment
- Weekly full registry scan
- Historical vulnerability report per image tag

### Distroless Where Possible

Use `gcr.io/distroless` base images for production services:

```dockerfile
FROM gcr.io/distroless/nodejs22-debian12
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER nonroot:nonroot
EXPOSE 3000
CMD ["dist/main.js"]
```

---

## 12. Backup & DR

### WHY

Data loss is catastrophic. A robust backup and disaster recovery plan ensures business continuity even in the face of infrastructure failure, data corruption, or security incidents.

### RATIONALE

The 3-2-1 rule: three copies of data, on two different media, one offsite. Regular testing ensures backups are restorable. Encryption prevents data exposure through backup media.

### Database Backup Schedule

| Backup Type | Frequency | Method | Retention |
|-------------|-----------|--------|-----------|
| Full backup | Daily | `pg_dump` (compressed) | 30 days |
| WAL archiving | Continuous | `pg_receivewal` | 7 days |
| Monthly snapshot | Monthly | Full backup + snapshot | 12 months |
| Annual archive | Yearly | Full backup (cold storage) | 7 years |

### Backup Encryption

- All backups encrypted with PGP (AES-256)
- Encryption keys stored in Vault, separate from backup system
- Backup integrity verified with SHA-256 checksums
- Checksums stored separately from backup files

### DR Test Schedule

| Test Type | Frequency | Scope |
|-----------|-----------|-------|
| Backup restore test | Weekly | Single service, automated |
| Full DR drill | Quarterly | Full infrastructure restore |
| Chaos engineering | Semi-annual | Random service failure simulation |
| Tabletop exercise | Annual | Incident response walkthrough |

### DR Test Goals

- RPO (Recovery Point Objective): 5 minutes
- RTO (Recovery Time Objective): 1 hour for critical services
- RTO (non-critical): 4 hours

**GOOD example:**
```bash
#!/bin/bash
# Automated backup script
BACKUP_DIR="/backups/$(date +%Y-%m-%d)"
mkdir -p "$BACKUP_DIR"

# Full database backup with compression
pg_dump \
  --host="$PGHOST" \
  --port="$PGPORT" \
  --username="$PGUSER" \
  --dbname="$PGDATABASE" \
  --format=custom \
  --compress=9 \
  --file="$BACKUP_DIR/full_backup.dump"

# Encrypt backup
gpg --encrypt \
  --recipient "$BACKUP_ENCRYPTION_KEY_ID" \
  --output "$BACKUP_DIR/full_backup.dump.gpg" \
  "$BACKUP_DIR/full_backup.dump"

# Upload to offsite storage
aws s3 cp "$BACKUP_DIR/full_backup.dump.gpg" "s3://xennic-backups/$BACKUP_DIR/"
```

**BAD example:**
```bash
# No backup strategy
# (silence — no backups configured)
```

---

## 13. Incident Response

### WHY

A structured incident response process minimizes damage, reduces recovery time, and ensures learning from incidents.

### RATIONALE

Every second counts during a security incident. Predefined severity levels, response times, and escalation paths remove ambiguity. Post-mortems ensure continuous improvement.

### Severity Classification

| Severity | Definition | Response Time | Examples |
|----------|-----------|---------------|----------|
| SEV-1 | Critical — data breach, service down, customer data exposed | Immediate (< 15 min) | Ransomware, database exfiltration, full outage |
| SEV-2 | High — significant functionality loss, potential data exposure | < 1 hour | Auth bypass, PII exposure, partial outage |
| SEV-3 | Moderate — degraded experience, isolated vulnerability | < 4 hours | Rate limiting bypass, XSS in non-critical page |
| SEV-4 | Low — informational, minor misconfiguration | < 1 week | Missing security header, outdated version |

### Response Times

| Phase | SEV-1 | SEV-2 | SEV-3 | SEV-4 |
|-------|-------|-------|-------|-------|
| Initial acknowledgment | 15 min | 1 hour | 4 hours | 1 week |
| Triage | 30 min | 2 hours | 8 hours | 1 week |
| Containment | 1 hour | 4 hours | 24 hours | N/A |
| Root cause identified | 4 hours | 8 hours | 48 hours | 2 weeks |
| Remediation | 24 hours | 48 hours | 7 days | 30 days |

### Escalation Path

```mermaid
flowchart TD
    A[Alert triggers] --> B{SEV-1 or SEV-2?}
    B -->|SEV-3/4| C[Log ticket, assign to on-call]
    B -->|SEV-1/2| D[Page on-call engineer]
    D --> E[5 min acknowledge]
    E -->|No response| F[Escalate to on-call backup]
    F -->|No response| G[Escalate to engineering manager]
    G -->|No response| H[Escalate to CTO/VP Engineering]
    H -->|No response| I[CEO notification]

    C --> J[Investigate and resolve]
    E --> J
    J --> K{Incident contained?}
    K -->|Yes| L[Post-mortem within 48h]
    K -->|No| M[Escalate to next level]
    M --> J
```

### Incident Documentation Template

Every incident MUST be documented in a dedicated incident ticket:

```markdown
## Incident Report

**Severity**: SEV-[1-4]
**Status**: [Detecting / Responding / Resolved / Post-Mortem]
**Date**: YYYY-MM-DD HH:MM UTC
**Detected By**: [Monitoring / User Report / Manual]
**Duration**: [Start] → [End] ([X] minutes/hours)

### Timeline
- HH:MM — Detection / alert triggered
- HH:MM — Initial investigation began
- HH:MM — Root cause identified
- HH:MM — Containment action taken
- HH:MM — Service restored
- HH:MM — Post-mortem scheduled

### Impact
- Services affected: [list]
- Users affected: [number]
- Data exposed: [yes/no — if yes, type]
- Financial impact: [estimated cost]

### Root Cause
[Description of root cause]

### Containment Actions
1. [Action taken]
2. [Action taken]

### Resolution
[Description of fix applied]

### Lessons Learned
- What went well:
- What went wrong:
- What to improve:

### Action Items
- [ ] [Action item] — Owner — Due date
```

### Post-Mortem Process

1. Schedule within 48 hours of resolution (SEV-1/2) or 1 week (SEV-3/4)
2. Blameless — focus on systems and processes, not individuals
3. All stakeholders participate
4. Document root cause, timeline, and action items
5. Action items tracked to completion in project management tool
6. Post-mortem added to incident database for trend analysis

### Incident Response Workflow

```mermaid
flowchart LR
    A[Alert] --> B[Detection & Acknowledgment]
    B --> C[Triage & Classification]
    C --> D[Containment]
    D --> E[Investigation & Root Cause]
    E --> F[Remediation & Recovery]
    F --> G[Post-Mortem]
    G --> H[Action Items]
    H --> I[Close Incident]
    I -.-> J[Playbook update?]
    J -->|Yes| K[Update runbook]
    J -->|No| L[End]

    style A fill:#f96
    style B fill:#ff9
    style G fill:#9f6
    style H fill:#9f6
```

---

## 14. Security Checklist for PRs

### WHY

A security checklist ensures consistent review coverage for every pull request. Many vulnerabilities are introduced through seemingly innocuous code changes.

### RATIONALE

Peer review is most effective when reviewers have a structured checklist. Without one, security issues are easily overlooked, especially under time pressure.

### Pre-Merge Security Checklist

Before merging ANY PR, verify ALL applicable items:

```markdown
## 🔒 Security Review Checklist

### Authentication & Authorization
- [ ] Does the PR add a new endpoint? → Authorization guard applied
- [ ] Does the PR modify an existing endpoint? → Authorization still correct
- [ ] Does the PR handle user-owned resources? → Horizontal access check in place
- [ ] Does the PR expose user data? → Only minimum required data returned

### Input Validation
- [ ] All new input fields validated (Zod/class-validator, type, length, format)
- [ ] File uploads: type, size, content validation
- [ ] No raw SQL or unsafe query construction
- [ ] Parameterized queries used throughout

### Output & Data Handling
- [ ] No sensitive data returned in API responses (passwords, tokens, secrets)
- [ ] Output encoded appropriately for context (HTML, JSON, URL)
- [ ] PII not logged or exposed in error messages

### Dependencies
- [ ] New dependencies reviewed for security and maintenance status
- [ ] Dependency version pins are specific (not ranges)
- [ ] Dependency scan passes (no Critical/High vulnerabilities)

### Secrets & Configuration
- [ ] No hardcoded secrets, tokens, or credentials
- [ ] No committed `.env` files
- [ ] No API keys in code, tests, or documentation
- [ ] Configuration values validated and typed

### Logging & Monitoring
- [ ] Security-relevant events logged (auth, authorization failures, admin actions)
- [ ] No sensitive data in log messages
- [ ] Errors handled gracefully (no stack traces in responses)

### Performance & DoS
- [ ] Rate limiting considered for new endpoints
- [ ] Pagination for list endpoints (no unbounded queries)
- [ ] Input length limits applied

### Security Headers
- [ ] CORS configured correctly (not allow-all for production)
- [ ] Content Security Policy updated if new resources loaded
```

### Security Review Triggers

A full security review (not just checklist) is REQUIRED for any PR that:

1. Introduces a new authentication or authorization mechanism
2. Handles PII, financial data, or other sensitive information
3. Introduces file upload or download functionality
4. Modifies cryptographic code or encryption schemes
5. Adds new third-party API integrations
6. Changes database schema (especially adding columns for sensitive data)
7. Introduces new external network connections
8. Changes the CI/CD pipeline
9. Modifies container or deployment configuration
10. Adds or modifies admin-level functionality

### Security-Sensitive Code Patterns

The following patterns ALWAYS require security team review:

```typescript
// 1. Eval or dynamic code execution
eval(userInput);
new Function(userInput);
setTimeout(userInput, 100);

// 2. Dynamic require
const module = require(userInput);

// 3. Raw SQL
prisma.$queryRawUnsafe(userQuery);
prisma.$executeRawUnsafe(userQuery);

// 4. Shell command execution
exec(userInput);
spawn('sh', ['-c', userInput]);

// 5. Dynamic file paths
fs.readFileSync(path.join(rootDir, userInput));
fs.writeFileSync(userSuppliedPath, data);

// 6. URL fetch with user input
fetch(userInput);
axios.get(userInput);

// 7. Deserialization
JSON.parse(userInput); // if userInput is from an untrusted source
```

### Review Escalation

- PR author completes checklist → PR reviewer verifies
- If checklist item cannot be verified → flag for security team
- If trigger condition met → assign security engineer as additional reviewer
- Security review sign-off required before merge for trigger conditions

**GOOD example:**
```markdown
PR Description: Add project export endpoint

Security checklist completed:
- [x] Authorization guard: JwtAuthGuard + ProjectAccessGuard
- [x] Input validation: Zod schema for query params
- [x] Output: only export-eligible fields, no PII
- [x] Rate limiting: 5 requests per minute per user
- [x] No new dependencies
- [x] No sensitive data logged
- [x] CORS: reuses existing config

Security review: Not required (no trigger conditions met)
```

**BAD example:**
```markdown
PR Description: Add project export endpoint

Security: N/A
```

---

## References

- [OWASP Top 10 — 2021](https://owasp.org/Top10/)
- [RFC 7519 — JSON Web Token](https://datatracker.ietf.org/doc/html/rfc7519)
- [RFC 6238 — TOTP](https://datatracker.ietf.org/doc/html/rfc6238)
- [Let's Encrypt ACME](https://letsencrypt.org/docs/acme-protocol/)
- [CIS Benchmarks](https://www.cisecurity.org/cis-benchmarks)
- [SLSA Supply Chain Levels](https://slsa.dev/spec/v1.0/)
- [NIST SP 800-53 — Security Controls](https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final)
- [Security Documentation](../security/)
- [Gap Analysis](../reference-architecture/09-gap-analysis.md)
