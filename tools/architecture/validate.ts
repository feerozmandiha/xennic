#!/usr/bin/env npx tsx
import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, basename, extname, resolve } from 'path';
import { load } from 'js-yaml';

// ── Types ──

type Profile = 'all' | 'production' | 'test' | 'migration' | 'generated' | 'experimental';

interface RuleValidation {
  type: 'import-check' | 'file-location' | 'content-check' | 'regex-check' | 'file-exists' | 'implements-check' | 'naming-check';
  pattern?: string;
  forbidden?: string[];
  expected?: string;
  required?: string | string[];
  forbid?: boolean;
  exclude?: string[];
  check?: string;
  preferred?: string;
  content?: boolean;
  specAllowed?: boolean;
}

interface RuleProfile {
  appliesTo?: Profile[];
  excludes?: Profile[];
  severity?: string;
}

interface Rule {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  validation: RuleValidation;
  profile?: RuleProfile;
  examples?: { good?: string; bad?: string }[];
  autofix?: boolean | { command: string };
}

interface Violation {
  ruleId: string;
  severity: string;
  file: string;
  description: string;
  category: string;
}

interface AutofixEntry {
  ruleId: string;
  file: string;
  description: string;
  action: string;
}

interface ModuleInfo {
  name: string;
  path: string;
  files: string[];
  domains: string[];
  applications: string[];
  infrastructures: string[];
  presentations: string[];
}

interface DependencyEdge {
  from: string;
  to: string;
}

// ── Config ──

const ROOT = resolve(import.meta.dirname, '../../');
const RULES_DIR = join(ROOT, 'tools/architecture/rules');
const API_SRC = join(ROOT, 'apps/api/src');
const GENERATED_DIR = join(ROOT, 'docs/generated');
const MODULES_DIR = join(API_SRC, 'modules');

const EXCLUDED_DIRS = ['node_modules', 'dist', '.git', '.next', '__pycache__', 'generated', 'coverage'];
const EXCLUDED_PATHS = ['prisma/', 'generated/'];

// ── Glob Matching ──

function matchesGlob(filePath: string, pattern: string): boolean {
  const regexStr = pattern
    .split('/')
    .map(part => {
      if (part === '**') return '(?:.+/)?';
      if (part.includes('*')) {
        return part.replace(/\*\*/g, '___DS___').replace(/\*/g, '[^/]*').replace(/___DS___/g, '.*');
      }
      return part.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    })
    .join('/');
  return new RegExp('^' + regexStr + '$').test(filePath);
}

function isExcludedPath(filePath: string): boolean {
  return EXCLUDED_PATHS.some(p => filePath.includes(p));
}

// ── File Collection ──

function collectFiles(dir: string): string[] {
  const files: string[] = [];
  function walk(d: string, base: string) {
    try {
      const entries = readdirSync(d, { withFileTypes: true });
      for (const entry of entries) {
        if (EXCLUDED_DIRS.includes(entry.name)) continue;
        const fullPath = join(d, entry.name);
        const relPath = base ? join(base, entry.name) : entry.name;
        if (entry.isDirectory()) {
          walk(fullPath, relPath);
        } else {
          files.push(relPath);
        }
      }
    } catch { /* skip */ }
  }
  if (existsSync(dir)) walk(dir, '');
  return files;
}

function readFileContent(filePath: string): string {
  try { return readFileSync(filePath, 'utf8'); } catch { return ''; }
}

// ── Rule Loading ──

function loadRules(): Rule[] {
  const ruleFiles = readdirSync(RULES_DIR).filter(f => f.endsWith('.yaml'));
  const rules: Rule[] = [];
  for (const file of ruleFiles) {
    const content = readFileSync(join(RULES_DIR, file), 'utf8');
    const loaded = load(content) as Rule[];
    if (Array.isArray(loaded)) rules.push(...loaded);
  }
  return rules;
}

function profileApplies(rule: Rule, profile: Profile): boolean {
  if (profile === 'all') return true;
  if (!rule.profile || !rule.profile.appliesTo) return true;
  return rule.profile.appliesTo.includes(profile);
}

function getRuleSeverity(rule: Rule, profile: Profile): string {
  if (profile !== 'all' && rule.profile && rule.profile.severity) {
    return rule.profile.severity;
  }
  return rule.severity;
}

// ── Rule Checking ──

function checkRule(rule: Rule, allFiles: string[], sourceDir: string, profile: Profile): Violation[] {
  const violations: Violation[] = [];
  const validation = rule.validation;
  const pattern = validation.pattern || '**/*.ts';
  const excludeRaw = validation.exclude || [];
  const excludePatterns = Array.isArray(excludeRaw) ? excludeRaw : [excludeRaw];
  const effectiveSeverity = getRuleSeverity(rule, profile);

  const matchedFiles = allFiles.filter(f => {
    if (isExcludedPath(f)) return false;
    if (excludePatterns.some(ex => matchesGlob(f, ex))) return false;
    if (!f.endsWith('.ts')) return false;
    return matchesGlob(f, pattern);
  });

  for (const file of matchedFiles) {
    const fullPath = join(sourceDir, file);
    if (!existsSync(fullPath)) continue;
    const content = readFileContent(fullPath);
    const cat = extractCategory(rule);

    switch (validation.type) {
      case 'import-check': {
        const forbiddenRaw = validation.forbidden || [];
        const forbidden = Array.isArray(forbiddenRaw) ? forbiddenRaw : [forbiddenRaw];
        const importLines = content.match(/import\s+(?:{[^}]+}|\w+\s*,\s*{[^}]+}|\w+|\*\s+as\s+\w+)\s+from\s+['"](.+?)['"]/g) || [];
        for (const line of importLines) {
          const match = line.match(/from\s+['"](.+?)['"]/);
          if (match) {
            const importPath = match[1];
            for (const forb of forbidden) {
              if (importPath.includes(forb)) {
                violations.push({
                  ruleId: rule.id, severity: effectiveSeverity, file,
                  description: `forbidden import "${importPath}" matches "${forb}"`,
                  category: cat,
                });
              }
            }
          }
        }
        break;
      }

      case 'file-location': {
        const expectedDir = validation.expected || '';
        if (!file.includes(expectedDir)) {
          violations.push({
            ruleId: rule.id, severity: effectiveSeverity, file,
            description: `file not in expected location (expected path containing: "${expectedDir}")`,
            category: cat,
          });
        }
        break;
      }

      case 'content-check': {
        const requiredRaw = validation.required || [];
        const required = Array.isArray(requiredRaw) ? requiredRaw : [requiredRaw];
        for (const req of required) {
          if (!content.includes(req)) {
            violations.push({
              ruleId: rule.id, severity: effectiveSeverity, file,
              description: `missing required pattern "${req}"`,
              category: cat,
            });
          }
        }
        break;
      }

      case 'regex-check': {
        const forbidden = validation.forbidden || [];
        for (const forb of forbidden) {
          try {
            const re = new RegExp(forb);
            if (re.test(content)) {
              violations.push({
                ruleId: rule.id, severity: effectiveSeverity, file,
                description: `found forbidden regex pattern "${forb}"`,
                category: cat,
              });
            }
          } catch { /* skip bad regex */ }
        }

        if (validation.check) {
          try {
            const re = new RegExp(validation.check);
            const lines = content.split('\n');
            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('import ') && trimmed.includes('from ')) {
                const fromMatch = trimmed.match(/from\s+['"](\.\.?\/[^'"]+)['"]/);
                if (fromMatch && !re.test(trimmed)) {
                  violations.push({
                    ruleId: rule.id, severity: effectiveSeverity, file,
                    description: `import "${fromMatch[1]}" does not match required pattern`,
                    category: cat,
                  });
                }
              }
            }
          } catch { /* skip bad regex */ }
        }
        break;
      }

      case 'file-exists': {
        if (validation.forbid) {
          violations.push({
            ruleId: rule.id, severity: effectiveSeverity, file,
            description: 'file should not exist (forbidden)',
            category: cat,
          });
        }
        break;
      }

      case 'implements-check': {
        const classMatches = content.match(/export\s+class\s+(\w+)(?:<[^>]*>)?(?:\s+extends\s+\w+(?:<[^>]*>)?)?(?:\s+implements\s+\w+(?:<[^>]*>)?(?:\s*,\s*\w+(?:<[^>]*>)?)*)?\s*\{/g) || [];
        for (const match of classMatches) {
          if (!match.includes('implements')) {
            violations.push({
              ruleId: rule.id, severity: effectiveSeverity, file,
              description: 'class does not implement domain interface',
              category: cat,
            });
          }
        }
        break;
      }

      default:
        break;
    }
  }

  return violations;
}

function extractCategory(rule: Rule): string {
  if (rule.id.startsWith('DDD-')) return 'ddd';
  if (rule.id.startsWith('REPO-')) return 'repository';
  if (rule.id.startsWith('ENT-')) return 'entity';
  if (rule.id.startsWith('VO-')) return 'value-object';
  if (rule.id.startsWith('AGG-')) return 'aggregate';
  if (rule.id.startsWith('MOD-')) return 'module-boundary';
  if (rule.id.startsWith('IMP-')) return 'import';
  if (rule.id.startsWith('DEP-')) return 'dependency';
  if (rule.id.startsWith('NAME-')) return 'naming';
  if (rule.id.startsWith('FOLDER-')) return 'folder-structure';
  if (rule.id.startsWith('LAYER-')) return 'layer';
  return 'unknown';
}

// ── Module Discovery ──

function discoverModules(modulesDir: string): ModuleInfo[] {
  if (!existsSync(modulesDir)) return [];
  const moduleDirs = readdirSync(modulesDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.') && !d.name.startsWith('__'))
    .map(d => d.name);

  return moduleDirs.map(name => {
    const base = join(modulesDir, name);
    const allFiles = collectFiles(base);
    return {
      name,
      path: base,
      files: allFiles,
      domains: allFiles.filter(f => f.includes('/domain/')),
      applications: allFiles.filter(f => f.includes('/application/')),
      infrastructures: allFiles.filter(f => f.includes('/infrastructure/')),
      presentations: allFiles.filter(f => f.includes('/presentation/')),
    };
  });
}

// ── Layer Violation Check ──

function checkLayerViolations(modules: ModuleInfo[], profile: Profile): Violation[] {
  const violations: Violation[] = [];

  for (const mod of modules) {
    for (const f of mod.domains) {
      const content = readFileContent(join(mod.path, f));
      const imports = extractImports(content);
      for (const imp of imports) {
        if (imp.includes('../application/') || imp.includes('../infrastructure/') || imp.includes('../presentation/')) {
          violations.push({
            ruleId: 'LAYER-001',
            severity: 'critical',
            file: `${mod.name}/${f}`,
            description: `Domain layer imports outer layer: "${imp}"`,
            category: 'layer',
          });
        }
      }
    }

    for (const f of mod.applications) {
      const content = readFileContent(join(mod.path, f));
      const imports = extractImports(content);
      for (const imp of imports) {
        if (imp.includes('../infrastructure/') || imp.includes('../presentation/')) {
          violations.push({
            ruleId: 'LAYER-002',
            severity: 'critical',
            file: `${mod.name}/${f}`,
            description: `Application layer imports infrastructure/presentation: "${imp}"`,
            category: 'layer',
          });
        }
      }
    }

    for (const f of mod.presentations) {
      const content = readFileContent(join(mod.path, f));
      const imports = extractImports(content);
      for (const imp of imports) {
        if (imp.includes('../infrastructure/')) {
          violations.push({
            ruleId: 'LAYER-003',
            severity: 'high',
            file: `${mod.name}/${f}`,
            description: `Presentation layer imports infrastructure directly: "${imp}"`,
            category: 'layer',
          });
        }
      }
    }
  }

  return violations;
}

// ── Cross-Module Import Check ──

function checkCrossModuleImports(modules: ModuleInfo[]): Violation[] {
  const violations: Violation[] = [];
  for (const mod of modules) {
    for (const f of mod.files) {
      const content = readFileContent(join(mod.path, f));
      const imports = extractImports(content);
      for (const imp of imports) {
        const crossMatch = imp.match(/\.\.\/modules\/(\w+)\//);
        if (crossMatch && crossMatch[1] !== mod.name) {
          violations.push({
            ruleId: 'MOD-001',
            severity: 'high',
            file: `${mod.name}/${f}`,
            description: `Cross-module import from "${mod.name}" to "${crossMatch[1]}": "${imp}"`,
            category: 'module-boundary',
          });
        }
      }
    }
  }
  return violations;
}

// ── Circular Dependency Check ──

function buildDependencyGraph(modules: ModuleInfo[]): DependencyEdge[] {
  const edges: DependencyEdge[] = [];
  for (const mod of modules) {
    for (const f of mod.files) {
      const content = readFileContent(join(mod.path, f));
      const imports = extractImports(content);
      for (const imp of imports) {
        const crossMatch = imp.match(/\.\.\/modules\/(\w+)\//);
        if (crossMatch && crossMatch[1] !== mod.name) {
          edges.push({ from: mod.name, to: crossMatch[1] });
        }
      }
    }
  }
  return edges;
}

function findCircularDependencies(edges: DependencyEdge[]): string[][] {
  const graph = new Map<string, string[]>();
  for (const edge of edges) {
    if (!graph.has(edge.from)) graph.set(edge.from, []);
    graph.get(edge.from)!.push(edge.to);
    if (!graph.has(edge.to)) graph.set(edge.to, []);
  }

  const cycles: string[][] = [];
  const visited = new Set<string>();
  const stack = new Set<string>();

  function dfs(node: string, path: string[]) {
    if (stack.has(node)) {
      const idx = path.indexOf(node);
      if (idx >= 0) cycles.push([...path.slice(idx), node]);
      return;
    }
    if (visited.has(node)) return;
    visited.add(node);
    stack.add(node);
    path.push(node);
    for (const n of graph.get(node) || []) dfs(n, [...path]);
    stack.delete(node);
  }

  for (const node of graph.keys()) {
    if (!visited.has(node)) dfs(node, []);
  }
  return cycles;
}

// ── Naming Convention Check (fixed regex, handles compound extensions) ──

function isKebabCase(fileName: string): boolean {
  const baseName = fileName.replace(/\.ts$/, '');
  const parts = baseName.split('.');
  // Every dot-separated part must be lowercase kebab-case
  return parts.length > 0 && parts.every(p => /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(p));
}

function checkNamingConventions(modules: ModuleInfo[]): Violation[] {
  const violations: Violation[] = [];

  for (const mod of modules) {
    for (const f of mod.files) {
      if (extname(f) !== '.ts') continue;
      const fileName = basename(f);

      if (fileName === 'module.ts' || fileName === 'index.ts') continue;

      if (!isKebabCase(fileName)) {
        violations.push({
          ruleId: 'NAME-001',
          severity: 'medium',
          file: `${mod.name}/${f}`,
          description: `File name "${fileName}" does not follow kebab-case naming convention`,
          category: 'naming',
        });
      }

      const content = readFileContent(join(mod.path, f));
      const classMatches = content.match(/export\s+(default\s+)?class\s+(\w+)/g);
      if (classMatches) {
        for (const match of classMatches) {
          const className = match.split(/\s+/).pop()!;
          if (!className.match(/^[A-Z][a-zA-Z0-9]*$/)) {
            violations.push({
              ruleId: 'NAME-003',
              severity: 'medium',
              file: `${mod.name}/${f}`,
              description: `Class "${className}" should be PascalCase`,
              category: 'naming',
            });
          }
        }
      }
    }
  }

  return violations;
}

// ── Autofix Naming Violations ──

function autofixNamingViolations(modules: ModuleInfo[]): AutofixEntry[] {
  const fixes: AutofixEntry[] = [];

  for (const mod of modules) {
    const moduleDir = mod.path;
    for (const f of mod.files) {
      if (extname(f) !== '.ts') continue;
      const fileName = basename(f);
      if (fileName === 'module.ts' || fileName === 'index.ts') continue;
      if (isKebabCase(fileName)) continue;

      const oldPath = join(moduleDir, f);
      const dir = join(moduleDir, dirname ? dirname(f) : '');
      const ext = extname(fileName);
      const nameWithoutExt = fileName.replace(/\.ts$/, '');

      // Convert to kebab-case: lowercase, replace underscores/camelCase with hyphens
      const kebabName = nameWithoutExt
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/_/g, '-')
        .toLowerCase();

      const newFileName = kebabName + ext;
      const newPath = join(moduleDir, dirname(f), newFileName);

      if (oldPath === newPath) continue;

      // Only autofix if the new filename is actually kebab-case and different
      if (!isKebabCase(newFileName)) continue;

      try {
        // Rename file
        writeFileSync(newPath, readFileContent(oldPath));
        // We can't delete the old file easily with write tool
        // We'll track it for the bash rename
        fixes.push({
          ruleId: 'NAME-001',
          file: `${mod.name}/${f}`,
          description: `Renamed to "${dirname(f)}/${newFileName}"`,
          action: `mv "${oldPath}" "${newPath}"`,
        });
      } catch { /* skip */ }
    }
  }

  return fixes;
}

// ── .js Extension Check ──

function checkJsExtension(modules: ModuleInfo[]): Violation[] {
  const violations: Violation[] = [];

  for (const mod of modules) {
    for (const f of mod.files) {
      if (!f.endsWith('.ts')) continue;
      const content = readFileContent(join(mod.path, f));
      const importLines = content.match(/(?:import|export)\s+.+?\s+from\s+['"](\.\.?\/[^'"]+)['"]/g) || [];
      for (const line of importLines) {
        const match = line.match(/['"](\.\.?\/[^'"]+)['"]/);
        if (match) {
          const importPath = match[1];
          if (importPath.match(/^\.\.?\/[^.'"]+$/) && !importPath.endsWith('.js')) {
            violations.push({
              ruleId: 'IMP-001',
              severity: 'critical',
              file: `${mod.name}/${f}`,
              description: `Relative import "${importPath}" missing .js extension`,
              category: 'import',
            });
          }
        }
      }
    }
  }

  return violations;
}

// ── Prisma in Domain Check ──

function checkPrismaInDomain(modules: ModuleInfo[]): Violation[] {
  const violations: Violation[] = [];
  for (const mod of modules) {
    for (const f of mod.domains) {
      const content = readFileContent(join(mod.path, f));
      if (content.includes('PrismaClient') || content.includes('@prisma/')) {
        violations.push({
          ruleId: 'DDD-007',
          severity: 'critical',
          file: `${mod.name}/${f}`,
          description: 'Domain layer imports Prisma framework dependency',
          category: 'ddd',
        });
      }
    }
  }
  return violations;
}

// ── Repository Interface Check ──

function checkRepositoryPatterns(modules: ModuleInfo[]): Violation[] {
  const violations: Violation[] = [];
  for (const mod of modules) {
    const hasDomainInterface = mod.files.some(f => f.includes('/domain/') && f.includes('repository.interface'));
    const hasInfraRepo = mod.files.some(f => f.includes('/infrastructure/') && f.includes('.repository.'));
    const hasTestingRepo = mod.files.some(f => f.includes('/testing/') && f.includes('in-memory'));

    if (hasInfraRepo && !hasDomainInterface) {
      violations.push({
        ruleId: 'REPO-001',
        severity: 'high',
        file: `${mod.name}/`,
        description: `Module "${mod.name}" has infra repository but no domain interface`,
        category: 'repository',
      });
    }

    // Skip PrismaInApp check for testing/ adapters
    for (const f of mod.files) {
      if (f.includes('/testing/')) continue;
      if (f.includes('/application/') || f.includes('/presentation/')) {
        const content = readFileContent(join(mod.path, f));
        if (content.includes('PrismaClient')) {
          violations.push({
            ruleId: 'REPO-003',
            severity: 'high',
            file: `${mod.name}/${f}`,
            description: 'PrismaClient used outside infrastructure layer',
            category: 'repository',
          });
        }
      }
    }
  }
  return violations;
}

// ── .js Extension Autofix ──

function autofixJsExtensions(modules: ModuleInfo[]): AutofixEntry[] {
  const fixes: AutofixEntry[] = [];

  for (const mod of modules) {
    for (const f of mod.files) {
      if (!f.endsWith('.ts')) continue;
      const fullPath = join(mod.path, f);
      let content = readFileContent(fullPath);
      let changed = false;

      const updated = content.replace(
        /(from\s+['"])(\.\.?\/[^'"]+?)(['"])/g,
        (match, prefix, path, suffix) => {
          if (path.endsWith('.js')) return match;
          if (!path.startsWith('.') && !path.startsWith('..')) return match;
          if (path.includes('.')) return match; // already has an extension
          changed = true;
          return `${prefix}${path}.js${suffix}`;
        }
      );

      if (changed) {
        writeFileSync(fullPath, updated, 'utf8');
        fixes.push({
          ruleId: 'IMP-001',
          file: `${mod.name}/${f}`,
          description: 'Added .js extension to relative imports',
          action: 'autofix applied',
        });
      }
    }
  }

  return fixes;
}

// ── Helpers ──

function extractImports(content: string): string[] {
  const imports: string[] = [];
  const matches = content.matchAll(/from\s+['"](\.\.?\/[^'"]+)['"]/g);
  for (const match of matches) imports.push(match[1]);
  return imports;
}

function scoreColor(score: number): string {
  if (score >= 90) return '🟢';
  if (score >= 75) return '🟡';
  if (score >= 50) return '🟠';
  return '🔴';
}

// ── Dependency Graph Generator ──

function generateMermaidGraph(edges: DependencyEdge[], cycles: string[][]): string {
  const lines = ['graph TD;'];
  const added = new Set<string>();
  for (const edge of edges) {
    const key = `${edge.from}-->${edge.to}`;
    if (!added.has(key)) {
      added.add(key);
      cycles.some(c => c.includes(edge.from) && c.includes(edge.to));
      lines.push(`  ${edge.from}[${edge.from}] --> ${edge.to}[${edge.to}]`);
    }
  }
  return lines.join('\n');
}

function generateDepGraphMarkdown(edges: DependencyEdge[], cycles: string[][]): string {
  const nodes = new Set<string>();
  for (const edge of edges) { nodes.add(edge.from); nodes.add(edge.to); }

  let md = '# Module Dependency Graph\n\n';
  md += '> Auto-generated by `tools/architecture/validate.ts`\n\n';
  md += `**Modules:** ${nodes.size}  \n`;
  md += `**Dependencies:** ${edges.length}  \n`;
  md += `**Circular:** ${cycles.length}  \n\n`;

  if (cycles.length > 0) {
    md += '## ⚠️ Circular Dependencies\n\n';
    for (const c of cycles) md += `- \`${c.join(' → ')}\`\n`;
    md += '\n';
  }

  md += '## Dependency Matrix\n\n| Module | Depends On |\n|--------|------------|\n';
  for (const node of [...nodes].sort()) {
    const deps = edges.filter(e => e.from === node).map(e => e.to);
    md += `| ${node} | ${deps.length > 0 ? deps.join(', ') : '_(none)_'} |\n`;
  }

  md += '\n## Mermaid\n\n```mermaid\n' + generateMermaidGraph(edges, cycles) + '\n```\n';
  return md;
}

// ── Governance Report Generator ──

function generateGovernanceReport(
  allViolations: Violation[],
  modules: ModuleInfo[],
  cycles: string[][],
  fixes: AutofixEntry[],
  durationMs: number,
  profile: Profile,
): string {
  const critical = allViolations.filter(v => v.severity === 'critical').length;
  const high = allViolations.filter(v => v.severity === 'high').length;
  const medium = allViolations.filter(v => v.severity === 'medium').length;
  const low = allViolations.filter(v => v.severity === 'low').length;

  const maxWeight = (critical + high + medium + low) * 4 || 1;
  const totalWeight = critical * 4 + high * 3 + medium * 2 + low * 1;
  const archScore = Math.round(Math.max(0, 100 - (totalWeight / maxWeight) * 100));

  const moduleHealth = modules.map(mod => {
    const mv = allViolations.filter(v => v.file.startsWith(mod.name + '/'));
    const mc = mv.filter(v => v.severity === 'critical').length;
    const mh = mv.filter(v => v.severity === 'high').length;
    return { name: mod.name, violations: mv.length, critical: mc, high: mh, score: Math.max(0, 100 - mc * 15 - mh * 5) };
  });

  const categories = [...new Set(allViolations.map(v => v.category))];
  const catBreakdown = categories.map(cat => {
    const cv = allViolations.filter(v => v.category === cat);
    return { category: cat, total: cv.length, critical: cv.filter(v => v.severity === 'critical').length, high: cv.filter(v => v.severity === 'high').length };
  });

  const now = new Date().toISOString();
  let md = `# Architecture Governance Report\n\n`;
  md += `> **Profile:** ${profile}  \n`;
  md += `> **Generated:** ${now}  \n`;
  md += `> **Duration:** ${durationMs}ms  \n\n`;
  md += `## Overall Score\n\n${scoreColor(archScore)} **${archScore}/100**  \n\n`;
  md += '## Violations\n\n| Severity | Count |\n|----------|-------|\n';
  md += `| 🔴 Critical | ${critical} |\n| 🟠 High | ${high} |\n| 🟡 Medium | ${medium} |\n| 🔵 Low | ${low} |\n| **Total** | **${critical + high + medium + low}** |\n\n`;
  md += '## Category\n\n| Category | Total | Critical | High |\n|----------|-------|----------|------|\n';
  for (const cb of catBreakdown.sort((a, b) => b.total - a.total)) {
    md += `| ${cb.category} | ${cb.total} | ${cb.critical} | ${cb.high} |\n`;
  }
  md += '\n## Module Health\n\n| Module | Score | Violations | Critical | High |\n|--------|-------|------------|----------|------|\n';
  for (const mh of moduleHealth.sort((a, b) => a.score - b.score)) {
    md += `| ${mh.name} | ${scoreColor(mh.score)} ${mh.score} | ${mh.violations} | ${mh.critical} | ${mh.high} |\n`;
  }

  if (fixes.length > 0) {
    md += '\n## Autofixes Applied\n\n| Rule | File | Action |\n|------|------|--------|\n';
    for (const fx of fixes) {
      md += `| ${fx.ruleId} | \`${fx.file}\` | ${fx.description} |\n`;
    }
  }

  if (cycles.length > 0) {
    md += '\n## Circular Dependencies\n\n';
    for (const c of cycles) md += `- 🔴 \`${c.join(' → ')}\`\n`;
  }

  if (allViolations.length > 0) {
    md += '\n## Details\n\n| Rule | Severity | File | Description |\n|------|----------|------|-------------|\n';
    for (const v of allViolations) {
      const icon = v.severity === 'critical' ? '🔴' : v.severity === 'high' ? '🟠' : v.severity === 'medium' ? '🟡' : '🔵';
      md += `| ${v.ruleId} | ${icon} ${v.severity} | \`${v.file}\` | ${v.description} |\n`;
    }
  }

  return md;
}

// ── Main ──

async function main() {
  const start = Date.now();
  const args = process.argv.slice(2);
  const lightMode = args.includes('--light');
  const changedOnly = args.includes('--changed');
  const skipReports = args.includes('--no-reports') || lightMode;
  const autofixMode = args.includes('--autofix');

  let profile: Profile = 'all';
  const profileArg = args.find(a => a.startsWith('--profile='));
  if (profileArg) {
    const val = profileArg.split('=')[1] as Profile;
    if (['all', 'production', 'test', 'migration', 'generated', 'experimental'].includes(val)) profile = val;
  }

  console.log('🔍 Xennic Architecture Validator\n');
  console.log(`Rules dir: ${RULES_DIR}`);
  console.log(`API src:   ${API_SRC}`);
  console.log(`Modules:   ${MODULES_DIR}`);
  console.log(`Profile:   ${profile}`);
  if (lightMode) console.log('Mode:      light');
  if (changedOnly) console.log('Mode:      changed files only');
  if (autofixMode) console.log('Mode:      autofix');
  console.log('');

  // ── Load rules ──
  const rules = loadRules();
  console.log(`📋 Loaded ${rules.length} rules\n`);

  // ── Collect files ──
  let apiFiles: string[];
  if (changedOnly) {
    try {
      const { execSync } = await import('child_process');
      const staged = execSync('git diff --cached --name-only --diff-filter=ACMR', { encoding: 'utf8' });
      const unstaged = execSync('git diff --name-only --diff-filter=ACMR', { encoding: 'utf8' });
      const changedFiles = [...new Set([...staged.split('\n'), ...unstaged.split('\n')])].filter(Boolean);
      apiFiles = changedFiles.filter(f => f.startsWith('apps/api/src/') && f.endsWith('.ts'))
        .map(f => f.slice('apps/api/src/'.length));
      if (apiFiles.length === 0) { console.log('✅ No changed API files\n'); process.exit(0); }
    } catch {
      apiFiles = collectFiles(API_SRC);
    }
  } else {
    apiFiles = collectFiles(API_SRC);
  }

  const modules = discoverModules(MODULES_DIR);
  console.log(`📦 ${modules.length} modules, ${apiFiles.length} files\n`);

  // ── Autofix (Phase 4) ──
  let allFixes: AutofixEntry[] = [];
  if (autofixMode) {
    console.log('🔧 Applying autofixes...');
    const jsFixes = autofixJsExtensions(modules);
    allFixes.push(...jsFixes);
    if (jsFixes.length > 0) console.log(`  ✅ Fixed ${jsFixes.length} .js extension issues`);
    else console.log('  ✅ No .js extension issues to fix');
    // Naming autofix via bash commands (collected but not applied - too risky)
    console.log('');
  }

  // ── Check YAML rules (profile-filtered) ──
  let allViolations: Violation[] = [];
  for (const rule of rules) {
    if (!profileApplies(rule, profile)) continue;
    const violations = checkRule(rule, apiFiles, API_SRC, profile);
    allViolations.push(...violations);
  }

  // ── Hardcoded checks ──
  if (!changedOnly) {
    allViolations.push(...checkLayerViolations(modules, profile));
    allViolations.push(...checkCrossModuleImports(modules));
    allViolations.push(...checkNamingConventions(modules));
    allViolations.push(...checkJsExtension(modules));
    allViolations.push(...checkPrismaInDomain(modules));
    allViolations.push(...checkRepositoryPatterns(modules));
  }

  // ── Circular deps ──
  const edges = changedOnly ? [] : buildDependencyGraph(modules);
  const cycles = changedOnly ? [] : findCircularDependencies(edges);
  for (const cycle of cycles) {
    allViolations.push({ ruleId: 'DEP-006', severity: 'critical', file: cycle.join(' → '), description: `Circular: ${cycle.join(' → ')}`, category: 'dependency' });
  }

  // ── Summarize ──
  const criticalCount = allViolations.filter(v => v.severity === 'critical').length;
  const highCount = allViolations.filter(v => v.severity === 'high').length;
  const mediumCount = allViolations.filter(v => v.severity === 'medium').length;
  const lowCount = allViolations.filter(v => v.severity === 'low').length;

  console.log('═══════════════════════════════════════');
  console.log('  RESULTS');
  console.log('═══════════════════════════════════════');
  console.log(`  🔴 Critical: ${criticalCount}`);
  console.log(`  🟠 High:     ${highCount}`);
  console.log(`  🟡 Medium:   ${mediumCount}`);
  console.log(`  🔵 Low:      ${lowCount}`);
  console.log(`  ─────────────────────────────`);
  console.log(`  Total:       ${criticalCount + highCount + mediumCount + lowCount}`);
  console.log(`  ⏱  ${Date.now() - start}ms`);
  console.log('═══════════════════════════════════════\n');

  const topViolations = allViolations.filter(v => v.severity === 'critical' || v.severity === 'high');
  if (topViolations.length > 0) {
    console.log(`⚠️  Top (${topViolations.length}):\n`);
    for (const v of topViolations.slice(0, lightMode ? 10 : 40)) {
      console.log(`  ${v.severity === 'critical' ? '🔴' : '🟠'} [${v.ruleId}] ${v.file}`);
      console.log(`     ${v.description}\n`);
    }
    if (topViolations.length > (lightMode ? 10 : 40)) {
      console.log(`  ... +${topViolations.length - (lightMode ? 10 : 40)} more\n`);
    }
  }

  if (cycles.length > 0) {
    console.log('🔄 Circular:\n');
    for (const c of cycles) console.log(`  🔴 ${c.join(' → ')}\n`);
  }

  // ── Generate Reports ──
  if (!skipReports) {
    if (!existsSync(GENERATED_DIR)) mkdirSync(GENERATED_DIR, { recursive: true });

    const depMd = generateDepGraphMarkdown(edges, cycles);
    writeFileSync(join(GENERATED_DIR, 'module-dependency-graph.md'), depMd, 'utf8');

    const mermaid = generateMermaidGraph(edges, cycles);
    writeFileSync(join(GENERATED_DIR, 'dependency-graph.mmd'), mermaid, 'utf8');

    const report = generateGovernanceReport(allViolations, modules, cycles, allFixes, Date.now() - start, profile);
    writeFileSync(join(GENERATED_DIR, 'governance-report.md'), report, 'utf8');

    console.log('📊 Reports written to docs/generated/\n');
  }

  // ── Exit ──
  const failSeverities: string[] = lightMode ? ['critical'] : ['critical', 'high'];
  const shouldFail = allViolations.some(v => failSeverities.includes(v.severity));

  if (shouldFail) {
    console.log(`❌ FAILED — ${lightMode ? 'Critical' : 'Critical or high'} violations found`);
    process.exit(1);
  }

  console.log(`✅ PASSED — No ${lightMode ? 'critical' : 'critical or high'} violations`);
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(2);
});
