import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { DslExecutionContext } from '../../engines/dsl-runtime.js';
import { DslRuntime } from '../../engines/dsl-runtime.js';
import { DslDefinition } from '../../../domain/value-objects/dsl-definition.value-object.js';
import { ELECTRICAL_PLUGINS, ELECTRICAL_PLUGIN_LIST } from './electrical-plugin-catalog.js';

export interface ElectricalPluginExecutionRequest {
  pluginId: string;
  inputs: Record<string, unknown>;
}

export interface ElectricalPluginExecutionResult {
  pluginId: string;
  pluginName: string;
  outputs: Record<string, unknown>;
  errors: string[];
  warnings: string[];
  duration: number;
}

export interface ElectricalPluginInfo {
  id: string;
  name: string;
  standard: string;
  category: string;
  tags: string[];
  inputCount: number;
  outputCount: number;
  formulaCount: number;
  validationCount: number;
  aiReview: boolean;
  certificate: boolean;
}

@Injectable()
export class ElectricalPluginService implements OnModuleInit {
  private readonly logger = new Logger(ElectricalPluginService.name);
  private readonly pluginCache = new Map<string, DslDefinition>();

  constructor(private readonly runtime: DslRuntime) {}

  onModuleInit(): void {
    for (const [id, factory] of Object.entries(ELECTRICAL_PLUGINS)) {
      try {
        const dsl = factory();
        this.pluginCache.set(id, dsl);
        this.logger.log(`Registered electrical plugin: ${id} (${dsl.formulas.length} formulas)`);
      } catch (error) {
        this.logger.error(`Failed to register electrical plugin: ${id} - ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    }
    this.logger.log(`Electrical Plugin Service initialized with ${this.pluginCache.size} plugins`);
  }

  getPluginIds(): string[] {
    return Array.from(this.pluginCache.keys());
  }

  getPlugin(id: string): DslDefinition | undefined {
    return this.pluginCache.get(id);
  }

  getPluginInfo(id: string): ElectricalPluginInfo | undefined {
    const dsl = this.pluginCache.get(id);
    if (!dsl) return undefined;
    const meta = dsl.metadata as Record<string, unknown>;
    return {
      id: dsl.id,
      name: dsl.id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      standard: dsl.standard ?? 'N/A',
      category: (meta.category as string) ?? 'general',
      tags: (meta.tags as string[]) ?? [],
      inputCount: dsl.inputs.length,
      outputCount: dsl.outputs.length,
      formulaCount: dsl.formulas.length,
      validationCount: dsl.validations.length,
      aiReview: dsl.aiReview,
      certificate: dsl.certificate,
    };
  }

  getAllPluginInfos(): ElectricalPluginInfo[] {
    return this.getPluginIds()
      .map(id => this.getPluginInfo(id))
      .filter((info): info is ElectricalPluginInfo => info !== undefined)
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  getPluginsByCategory(category: string): ElectricalPluginInfo[] {
    return this.getAllPluginInfos().filter(p => p.category === category);
  }

  getPluginCount(): number {
    return this.pluginCache.size;
  }

  async execute(request: ElectricalPluginExecutionRequest): Promise<ElectricalPluginExecutionResult> {
    const start = Date.now();
    const dsl = this.pluginCache.get(request.pluginId);
    if (!dsl) {
      return {
        pluginId: request.pluginId,
        pluginName: request.pluginId,
        outputs: {},
        errors: [`Plugin '${request.pluginId}' not found`],
        warnings: [],
        duration: 0,
      };
    }

    try {
      const ctx: DslExecutionContext = {
        inputs: request.inputs,
        workspaceId: 'system',
        userId: 'system',
      };
      const result = await this.runtime.execute(dsl, ctx);
      return {
        pluginId: request.pluginId,
        pluginName: dsl.id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        outputs: result.outputs,
        errors: result.errors,
        warnings: [],
        duration: Date.now() - start,
      };
    } catch (error) {
      return {
        pluginId: request.pluginId,
        pluginName: dsl.id,
        outputs: {},
        errors: [error instanceof Error ? error.message : 'Execution error'],
        warnings: [],
        duration: Date.now() - start,
      };
    }
  }

  async executeBatch(requests: ElectricalPluginExecutionRequest[]): Promise<ElectricalPluginExecutionResult[]> {
    return Promise.all(requests.map(r => this.execute(r)));
  }

  getFormulasByPlugin(id: string): Array<{ name: string; expression: string }> | undefined {
    const dsl = this.pluginCache.get(id);
    if (!dsl) return undefined;
    return dsl.formulas.map(f => ({ name: f.name, expression: f.expression }));
  }

  searchPlugins(query: string): ElectricalPluginInfo[] {
    const q = query.toLowerCase();
    return this.getAllPluginInfos().filter(p => {
      const meta = this.pluginCache.get(p.id)?.metadata as Record<string, unknown> | undefined;
      const tags = (meta?.tags as string[]) ?? [];
      return p.id.includes(q) || p.standard.toLowerCase().includes(q) || p.category.includes(q) || tags.some(t => t.includes(q));
    });
  }

  getCategories(): string[] {
    const cats = new Set(this.getAllPluginInfos().map(p => p.category));
    return Array.from(cats).sort();
  }

  getStandardsCovered(): string[] {
    const stds = new Set(this.getAllPluginInfos().map(p => p.standard));
    return Array.from(stds).sort();
  }

  getTotalFormulaCount(): number {
    return Array.from(this.pluginCache.values()).reduce((sum, dsl) => sum + dsl.formulas.length, 0);
  }

  getStatsSummary(): Record<string, number | string> {
    return {
      totalPlugins: this.pluginCache.size,
      totalFormulas: this.getTotalFormulaCount(),
      categories: this.getCategories().length,
      standards: this.getStandardsCovered().length,
      aiEnabled: this.getAllPluginInfos().filter(p => p.aiReview).length,
      certificateEnabled: this.getAllPluginInfos().filter(p => p.certificate).length,
    };
  }
}
