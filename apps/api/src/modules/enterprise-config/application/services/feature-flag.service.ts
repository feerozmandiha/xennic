import { Injectable } from '@nestjs/common';
import type { IFeatureFlagService } from '../../domain/interfaces/config-interfaces.js';
import type { FeatureFlag, FeatureFlagRule } from '../../domain/types/config.types.js';
import { ConfigScope } from '../../domain/types/config.types.js';

@Injectable()
export class FeatureFlagService implements IFeatureFlagService {
  private flags = new Map<string, FeatureFlag>();

  async isEnabled(key: string, context?: { workspaceId?: string; userId?: string }): Promise<boolean> {
    const flag = this.flags.get(key);
    if (!flag || !flag.enabled) return false;
    if (!flag.rules || flag.rules.length === 0) return true;
    if (!context) return false;
    for (const rule of flag.rules) {
      if (this.evaluateRule(rule, context)) return true;
    }
    return false;
  }

  async enable(key: string): Promise<void> {
    const existing = this.flags.get(key);
    if (existing) { existing.enabled = true; return; }
    this.flags.set(key, {
      key, enabled: true, scope: ConfigScope.SYSTEM,
      description: '', rules: [],
    });
  }

  async disable(key: string): Promise<void> {
    const existing = this.flags.get(key);
    if (existing) { existing.enabled = false; return; }
    this.flags.set(key, {
      key, enabled: false, scope: ConfigScope.SYSTEM,
      description: '', rules: [],
    });
  }

  async list(): Promise<FeatureFlag[]> {
    return Array.from(this.flags.values());
  }

  async addRule(key: string, rule: FeatureFlagRule): Promise<void> {
    const flag = this.flags.get(key);
    if (!flag) throw new Error(`Feature flag not found: ${key}`);
    if (!flag.rules) flag.rules = [];
    flag.rules.push(rule);
  }

  async removeRule(key: string, ruleIndex: number): Promise<void> {
    const flag = this.flags.get(key);
    if (!flag || !flag.rules) throw new Error(`Feature flag not found: ${key}`);
    flag.rules.splice(ruleIndex, 1);
  }

  private evaluateRule(rule: FeatureFlagRule, context: Record<string, unknown>): boolean {
    const value = context[rule.attribute];
    if (value === undefined) return false;
    switch (rule.operator) {
      case 'eq': return value === rule.value;
      case 'neq': return value !== rule.value;
      case 'in': return Array.isArray(rule.value) && rule.value.includes(value);
      case 'nin': return !Array.isArray(rule.value) || !rule.value.includes(value);
      case 'contains': return typeof value === 'string' && value.includes(String(rule.value));
      case 'gt': return typeof value === 'number' && typeof rule.value === 'number' && value > rule.value;
      case 'lt': return typeof value === 'number' && typeof rule.value === 'number' && value < rule.value;
      default: return false;
    }
  }
}
