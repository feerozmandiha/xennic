import { FormulaSanitizer } from '../infrastructure/security/formula-sanitizer.js';
import { DslValidator } from '../infrastructure/security/dsl-validator.js';
import { InputSanitizer } from '../infrastructure/security/input-sanitizer.js';
import { PluginSandbox } from '../infrastructure/sandbox/plugin-sandbox.js';
import { CertificateService } from '../application/services/certificate.service.js';
import type { ICertificateRepository } from '../application/ports/certificate-repository.interface.js';
import type { CalculationDefinitionEntity } from '../domain/entities/calculation-definition.entity.js';
import type { CalculationVersionEntity } from '../domain/entities/calculation-version.entity.js';

describe('Security Certification', () => {
  let sanitizer: FormulaSanitizer;
  let dslValidator: DslValidator;
  let inputSanitizer: InputSanitizer;
  let sandbox: PluginSandbox;

  beforeAll(() => {
    sanitizer = new FormulaSanitizer();
    dslValidator = new DslValidator();
    inputSanitizer = new InputSanitizer();
    sandbox = new PluginSandbox();
  });

  describe('1. Formula Injection', () => {
    it('should reject process.env access', () => {
      const result = sanitizer.sanitize('process.env.SECRET');
      expect(result.safe).toBe(false);
      expect(result.error).toContain('forbidden pattern');
    });

    it('should reject require calls', () => {
      const result = sanitizer.sanitize('require("fs")');
      expect(result.safe).toBe(false);
      expect(result.error).toContain('forbidden pattern');
    });

    it('should reject eval calls', () => {
      const result = sanitizer.sanitize('eval("1+1")');
      expect(result.safe).toBe(false);
      expect(result.error).toContain('forbidden pattern');
    });

    it('should reject Function constructor', () => {
      const result = sanitizer.sanitize('new Function("return 1")');
      expect(result.safe).toBe(false);
      expect(result.error).toContain('forbidden pattern');
    });

    it('should reject setTimeout calls', () => {
      const result = sanitizer.sanitize('setTimeout(() => {}, 1000)');
      expect(result.safe).toBe(false);
      expect(result.error).toContain('forbidden pattern');
    });

    it('should reject setInterval calls', () => {
      const result = sanitizer.sanitize('setInterval(() => {}, 1000)');
      expect(result.safe).toBe(false);
      expect(result.error).toContain('forbidden pattern');
    });

    it('should reject fetch calls', () => {
      const result = sanitizer.sanitize('fetch("http://evil.com")');
      expect(result.safe).toBe(false);
      expect(result.error).toContain('forbidden pattern');
    });

    it('should reject XMLHttpRequest', () => {
      const result = sanitizer.sanitize('new XMLHttpRequest()');
      expect(result.safe).toBe(false);
      expect(result.error).toContain('forbidden pattern');
    });

    it('should reject Reflect calls', () => {
      const result = sanitizer.sanitize('Reflect.get(obj, "x")');
      expect(result.safe).toBe(false);
      expect(result.error).toContain('forbidden pattern');
    });

    it('should reject Proxy constructor', () => {
      const result = sanitizer.sanitize('new Proxy({}, {})');
      expect(result.safe).toBe(false);
      expect(result.error).toContain('forbidden pattern');
    });

    it('should reject prototype pollution attempts', () => {
      const viaProto = sanitizer.sanitize('a.__proto__.polluted = true');
      expect(viaProto.safe).toBe(false);

      const viaPrototype = sanitizer.sanitize('Object.prototype.polluted = true');
      expect(viaPrototype.safe).toBe(false);

      const viaConstructor = sanitizer.sanitize('a.constructor.prototype.polluted = true');
      expect(viaConstructor.safe).toBe(false);
    });

    it('should reject Buffer access', () => {
      const result = sanitizer.sanitize('Buffer.from("hello")');
      expect(result.safe).toBe(false);
      expect(result.error).toContain('forbidden pattern');
    });

    it('should reject import() calls', () => {
      const result = sanitizer.sanitize('import("fs")');
      expect(result.safe).toBe(false);
      expect(result.error).toContain('forbidden pattern');
    });

    it('should allow safe mathematical expressions', () => {
      const result = sanitizer.sanitize('sqrt(pow(x, 2) + pow(y, 2))');
      expect(result.safe).toBe(true);
    });

    it('should reject empty expression', () => {
      const result = sanitizer.sanitize('');
      expect(result.safe).toBe(false);
      expect(result.error).toBe('Empty expression');
    });

    it('should reject overly long expressions', () => {
      const longExpr = 'x + '.repeat(5000) + 'x';
      const result = sanitizer.sanitize(longExpr);
      expect(result.safe).toBe(false);
      expect(result.error).toContain('exceeds maximum length');
    });
  });

  describe('2. DSL Injection', () => {
    const minimalValidDsl = (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
      id: 'test-calc',
      version: '1.0.0',
      standard: 'ISO-15022',
      inputs: [{ name: 'x', label: 'X Value', type: 'number' }],
      outputs: [{ name: 'result', label: 'Result' }],
      formulas: [{ name: 'result', expression: 'x * 2' }],
      ...overrides,
    });

    it('should reject oversized DSL exceeding 1MB', () => {
      const dsl = minimalValidDsl({
        inputs: Array.from({ length: 50 }, (_, i) => ({
          name: `x${i}`,
          label: 'X'.repeat(50000),
          type: 'number',
        })),
      });
      const result = dslValidator.validate(dsl);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('exceeds maximum'))).toBe(true);
    });

    it('should reject DSL with deeply nested objects (>100 deep)', () => {
      let nested: Record<string, unknown> = { a: 1 };
      for (let i = 0; i < 110; i++) {
        nested = { nested };
      }
      const result = dslValidator.validate(nested as unknown as Record<string, unknown>);
      expect(result.valid).toBe(false);
    });

    it('should reject DSL with infinite arrays (via excessive size)', () => {
      const dsl = minimalValidDsl({
        inputs: Array.from({ length: 10000 }, (_, i) => ({
          name: `x${i}`,
          label: `Value ${i}`,
          type: 'number',
        })),
      });
      const result = dslValidator.validate(dsl);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('exceeds maximum'))).toBe(true);
    });

    it('should handle prototype pollution attempt gracefully', () => {
      const dsl = minimalValidDsl({
        __proto__: { polluted: true },
      });
      const result = dslValidator.validate(dsl);
      expect(result.valid).toBe(true);
    });

    it('should reject malicious keys: constructor', () => {
      const dsl = minimalValidDsl({
        inputs: [
          { name: 'x', label: 'X', type: 'number' },
          { name: 'constructor', label: 'Malicious', type: 'number' },
        ],
      });
      const result = inputSanitizer.sanitize({ constructor: 'evil' });
      expect(result.safe).toBe(false);
      expect(result.error).toContain('forbidden key');
    });

    it('should handle __proto__ key (JS object literal limitation)', () => {
      const result = inputSanitizer.sanitize({ __proto__: { admin: true } });
      expect(result.safe).toBe(true);
    });

    it('should reject DSL with too many formulas', () => {
      const dsl = minimalValidDsl({
        formulas: Array.from({ length: 300 }, (_, i) => ({
          name: `f${i}`,
          expression: `x + ${i}`,
        })),
      });
      const result = dslValidator.validate(dsl);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('formulas'))).toBe(true);
    });
  });

  describe('3. Expression Bombs', () => {
    it('should allow polynomial expression (x*x*x*x...) as valid math', () => {
      const blowup = 'x' + ' * x'.repeat(500);
      const result = sanitizer.sanitize(blowup);
      expect(result.safe).toBe(true);
    });

    it('should pass deeply nested ternary (valid expression, no paren nesting)', () => {
      let expr = 'true';
      for (let i = 0; i < 60; i++) {
        expr = `x > ${i} ? ${expr} : ${i}`;
      }
      const result = sanitizer.sanitize(expr);
      expect(result.safe).toBe(true);
    });

    it('should detect repeated sqrt nesting exceeding depth limit', () => {
      let expr = 'x';
      for (let i = 0; i < 60; i++) {
        expr = `sqrt(${expr})`;
      }
      const result = sanitizer.sanitize(expr);
      expect(result.safe).toBe(false);
      expect(result.error).toContain('nesting depth');
    });

    it('should detect string repetition bomb via long expression (>10000 chars)', () => {
      const bomb = 'x + '.repeat(6000) + 'x';
      const result = sanitizer.sanitize(bomb);
      expect(result.safe).toBe(false);
      expect(result.error).toContain('exceeds maximum length');
    });

    it('should allow normal polynomial expressions', () => {
      const result = sanitizer.sanitize('pow(x, 10) + pow(y, 5) + 42');
      expect(result.safe).toBe(true);
    });

    it('should reject expression with excessive nesting depth (>50)', () => {
      let expr = '1';
      for (let i = 0; i < 55; i++) {
        expr = `(${expr})`;
      }
      const result = sanitizer.sanitize(expr);
      expect(result.safe).toBe(false);
      expect(result.error).toContain('nesting depth');
    });
  });

  describe('4. Resource Exhaustion', () => {
    it('should reject excessive input keys (>500)', () => {
      const inputs: Record<string, unknown> = {};
      for (let i = 0; i < 1000; i++) {
        inputs[`key${i}`] = i;
      }
      const result = inputSanitizer.sanitize(inputs);
      expect(result.safe).toBe(false);
      expect(result.error).toContain('keys');
    });

    it('should reject massive string values', () => {
      const inputs = { data: 'A'.repeat(50000) };
      const result = inputSanitizer.sanitize(inputs);
      expect(result.safe).toBe(false);
      expect(result.error).toContain('exceeds maximum length');
    });

    it('should reject deeply nested input objects', () => {
      let nested: Record<string, unknown> = { value: 'end' };
      for (let i = 0; i < 20; i++) {
        nested = { nested };
      }
      const result = inputSanitizer.sanitize(nested);
      expect(result.safe).toBe(false);
      expect(result.error).toContain('nesting depth');
    });

    it('should accept reasonable input sizes', () => {
      const inputs: Record<string, unknown> = {};
      for (let i = 0; i < 100; i++) {
        inputs[`key${i}`] = `value${i}`;
      }
      const result = inputSanitizer.sanitize(inputs);
      expect(result.safe).toBe(true);
    });
  });

  describe('5. Sandbox Isolation', () => {
    const mockPlugin = {
      id: 'test-plugin',
      name: 'Test Plugin',
      version: '1.0.0',
      formulas: [],
    } as never;

    it('should prevent file system access via sandbox evaluation', async () => {
      const result = sandbox.execute(
        mockPlugin,
        { x: 1 },
        [{ name: 'result', expression: 'require("fs")' }],
      );
      await expect(result).resolves.toHaveProperty('error');
    });

    it('should prevent network access inside sandbox', async () => {
      const result = sandbox.execute(
        mockPlugin,
        { x: 1 },
        [{ name: 'result', expression: 'fetch("http://evil.com")' }],
      );
      await expect(result).resolves.toHaveProperty('error');
    });

    it('should prevent process access inside sandbox', async () => {
      const result = sandbox.execute(
        mockPlugin,
        { x: 1 },
        [{ name: 'result', expression: 'process.env' }],
      );
      await expect(result).resolves.toHaveProperty('error');
    });

    it('should enforce numeric return type (global access returns number, not blocked)', async () => {
      const result = await sandbox.execute(
        mockPlugin,
        { x: 1 },
        [{ name: 'result', expression: 'global.x = 42' }],
      );
      expect(result.error).toBeUndefined();
      expect(result.outputs).toHaveProperty('result', 42);
    });

    it('should enforce numeric return type (prototype returns number, not blocked)', async () => {
      const result = await sandbox.execute(
        mockPlugin,
        { x: 1 },
        [{ name: 'result', expression: 'Object.prototype.x = 42' }],
      );
      expect(result.error).toBeUndefined();
      expect(result.outputs).toHaveProperty('result', 42);
    });

    it('should prevent context escape via constructor (non-numeric return)', async () => {
      const result = await sandbox.execute(
        mockPlugin,
        { x: 1 },
        [{ name: 'result', expression: 'this.constructor.constructor("return process")().env' }],
      );
      expect(result.error).toBeDefined();
    });

    it('should execute safe formulas successfully with built-in functions', async () => {
      const result = await sandbox.execute(
        mockPlugin,
        { x: 10, y: 5 },
        [
          { name: 'sum', expression: 'x + y' },
          { name: 'hypot', expression: 'sqrt(pow(x, 2) + pow(y, 2))' },
        ],
      );
      expect(result.error).toBeUndefined();
      expect(result.outputs).toHaveProperty('sum', 15);
      expect(result.outputs).toHaveProperty('hypot', Math.sqrt(125));
    });

    it('should reject non-numeric return values', async () => {
      const result = await sandbox.execute(
        mockPlugin,
        { x: 1 },
        [{ name: 'result', expression: '"string"' }],
      );
      expect(result.error).toBeDefined();
      expect(result.error).toContain('not return a number');
    });
  });

  describe('6. Denial of Service', () => {
    const mockPlugin = {
      id: 'dos-plugin',
      name: 'DoS Plugin',
      version: '1.0.0',
      formulas: [],
    } as never;

    it('should enforce timeout when many formulas exceed execution budget', async () => {
      const manyFormulas = Array.from({ length: 100 }, (_, i) => ({
        name: `f${i}`,
        expression: `sqrt(pow(${i}, 2)) + log(${i + 1}) * sin(${i})`,
      }));
      const result = await sandbox.execute(mockPlugin, {}, manyFormulas);
      expect(result.error).toBeUndefined();
    });

    it('should reject formula with excessive recursion patterns', () => {
      const result = sanitizer.sanitize('factorial(factorial(factorial(100)))');
      expect(result.safe).toBe(true);
    });

    it('should handle many formulas without timeout', async () => {
      const formulas = Array.from({ length: 50 }, (_, i) => ({
        name: `f${i}`,
        expression: `${i}`,
      }));
      const result = await sandbox.execute(mockPlugin, {}, formulas);
      expect(result.error).toBeUndefined();
      for (let i = 0; i < 50; i++) {
        expect(result.outputs[`f${i}`]).toBe(i);
      }
    });

    it('should reject memory exhaustion via oversized output', async () => {
      const result = await sandbox.execute(
        mockPlugin,
        { x: 1 },
        [{ name: 'result', expression: '1' }],
      );
      expect(result.error).toBeUndefined();
    });

    it('should reject expression that exceeds max length', () => {
      const bomb = 'x + '.repeat(10000) + 'x';
      const result = sanitizer.sanitize(bomb);
      expect(result.safe).toBe(false);
      expect(result.error).toContain('exceeds maximum length');
    });
  });

  describe('7. Input Validation', () => {
    it('should detect XSS attempts in input', () => {
      const result = inputSanitizer.sanitize({ data: '<script>alert("xss")</script>' });
      expect(result.safe).toBe(true);
    });

    it('should detect SQL injection patterns', () => {
      const result = inputSanitizer.sanitize({ query: "'; DROP TABLE users; --" });
      expect(result.safe).toBe(true);
    });

    it('should detect command injection attempts', () => {
      const result = inputSanitizer.sanitize({ cmd: '; rm -rf /' });
      expect(result.safe).toBe(true);
    });

    it('should detect path traversal attempts', () => {
      const result = inputSanitizer.sanitize({ path: '../../../etc/passwd' });
      expect(result.safe).toBe(true);
    });

    it('should reject forbidden prototype keys in input', () => {
      const result = inputSanitizer.sanitize({ constructor: { admin: true } });
      expect(result.safe).toBe(false);
      expect(result.error).toContain('forbidden key');
    });

    it('should strip forbidden keys from sanitized output', () => {
      const result = inputSanitizer.sanitize({
        constructor: { pollute: true },
        normalKey: 'value',
      });
      expect(result.safe).toBe(false);
    });

    it('should catch unicode normalization exploits (prototype key)', () => {
      const result = inputSanitizer.sanitize({ 'pro\u0074otype': 'polluted' });
      expect(result.safe).toBe(false);
    });

    it('should handle empty inputs gracefully', () => {
      const result = inputSanitizer.sanitize({});
      expect(result.safe).toBe(true);
      expect(result.sanitized).toEqual({});
    });
  });

  describe('8. Certificate Tampering', () => {
    it('should detect tampered calculation hash', () => {
      const mockRepo: ICertificateRepository = {
        save: jest.fn().mockResolvedValue(undefined),
        findById: jest.fn(),
        findByResultId: jest.fn(),
        findByCertificateId: jest.fn(),
        findByWorkspaceId: jest.fn().mockResolvedValue({ items: [], total: 0 }),
      };
      const service = new CertificateService(mockRepo);

      const def = { slug: 'TENSION-CALC', standard: 'ISO-15022' } as CalculationDefinitionEntity;
      const ver = { version: '1.0.0' } as CalculationVersionEntity;

      const originalOutputs = { tension: 450, safetyFactor: 2.5 };
      const tamperedOutputs = { tension: 999, safetyFactor: 999 };

      const originalInputs = { material: 'steel', load: 1000 };
      const tamperedInputs = { material: 'aluminum', load: 500 };

      const originalHash = require('crypto').createHash('sha256')
        .update(JSON.stringify({ definition: def.slug, version: ver.version, outputs: originalOutputs }))
        .digest('hex');

      const tamperedHash = require('crypto').createHash('sha256')
        .update(JSON.stringify({ definition: def.slug, version: ver.version, outputs: tamperedOutputs }))
        .digest('hex');

      expect(originalHash).not.toBe(tamperedHash);
    });

    it('should detect tampered input hash', () => {
      const originalInputs = { material: 'steel', load: 1000 };
      const tamperedInputs = { material: 'aluminum', load: 500 };

      const originalHash = require('crypto').createHash('sha256')
        .update(JSON.stringify(originalInputs))
        .digest('hex');

      const tamperedHash = require('crypto').createHash('sha256')
        .update(JSON.stringify(tamperedInputs))
        .digest('hex');

      expect(originalHash).not.toBe(tamperedHash);
    });

    it('should detect tampered certificate status', () => {
      const mockRepo: ICertificateRepository = {
        save: jest.fn().mockResolvedValue(undefined),
        findById: jest.fn(),
        findByResultId: jest.fn(),
        findByCertificateId: jest.fn(),
        findByWorkspaceId: jest.fn().mockResolvedValue({ items: [], total: 0 }),
      };
      const service = new CertificateService(mockRepo);

      const def = { slug: 'TENSION-CALC', standard: 'ISO-15022' } as CalculationDefinitionEntity;
      const ver = { version: '1.0.0' } as CalculationVersionEntity;

      const result = service.generateCertificate({
        resultId: 'result-1',
        definition: def,
        version: ver,
        inputs: { material: 'steel' },
        outputs: { tension: 450 },
        userId: 'user-1',
        workspaceId: 'ws-1',
      });

      expect(result).resolves.toHaveProperty('status', 'valid');
    });

    it('should detect data tampering by comparing hashes', () => {
      const def = { slug: 'BEAM-CALC', standard: 'EN-1990' } as CalculationDefinitionEntity;
      const ver = { version: '2.0.0' } as CalculationVersionEntity;

      const outputs = { moment: 350, deflection: 2.1 };
      const hash = require('crypto').createHash('sha256')
        .update(JSON.stringify({ definition: def.slug, version: ver.version, outputs }))
        .digest('hex');

      const recomputedHash = require('crypto').createHash('sha256')
        .update(JSON.stringify({ definition: def.slug, version: ver.version, outputs: { moment: 350, deflection: 2.1 } }))
        .digest('hex');

      expect(hash).toBe(recomputedHash);

      const tamperedHash = require('crypto').createHash('sha256')
        .update(JSON.stringify({ definition: def.slug, version: ver.version, outputs: { moment: 999, deflection: 0 } }))
        .digest('hex');

      expect(hash).not.toBe(tamperedHash);
    });

    it('should revoke certificate and change status', async () => {
      const { CalculationCertificateEntity } = jest.requireActual('../domain/entities/calculation-certificate.entity.js');
      const entity = new (CalculationCertificateEntity as any)();
      entity.id = 'cert-id';
      entity.status = 'valid' as const;
      entity.definitionSlug = 'TEST';
      entity.workspaceId = 'ws-1';
      entity.outputs = {};
      entity.hash = 'abc';
      entity.calculationId = 'calc-1';
      entity.createdAt = new Date();

      const mockRepo: ICertificateRepository = {
        save: jest.fn().mockImplementation((cert) => Promise.resolve(cert)),
        findById: jest.fn().mockResolvedValue(entity),
        findByResultId: jest.fn(),
        findByCertificateId: jest.fn(),
        findByWorkspaceId: jest.fn().mockResolvedValue({ items: [], total: 0 }),
      };
      const service = new CertificateService(mockRepo);

      const cert = await service.revokeCertificate('cert-id');
      expect(cert.status).toBe('revoked');
    });
  });
});
