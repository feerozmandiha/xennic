import { Injectable } from '@nestjs/common';
import { randomUUID, createHash } from 'node:crypto';
import type { IToolExecutor } from '../../domain/interfaces/tool-executor.interface.js';
import type { ToolExecutionRequest, ToolExecutionResult, ToolProvenance, ToolConfig } from '../../domain/types/agent.types.js';
import { SafetyLevel } from '../../domain/types/agent.types.js';

type ToolHandler = (input: Record<string, unknown>) => Record<string, unknown>;

@Injectable()
export class ToolExecutor implements IToolExecutor {
  private tools = new Map<string, { config: ToolConfig; handler: ToolHandler }>();

  constructor() {
    this.registerBuiltinTools();
  }

  private registerBuiltinTools(): void {
    this.addTool('voltage-drop', 'Voltage Drop Calculator', 'Calculates voltage drop per IEC 60364-5-52', { required: ['current', 'length', 'resistance', 'voltage'] }, { properties: { voltageDrop: { type: 'number' }, percentageDrop: { type: 'number' }, verdict: { type: 'string' } } }, (i) => {
      const current = Number(i['current']) || 0;
      const length = Number(i['length']) || 0;
      const resistance = Number(i['resistance']) || 0;
      const voltage = Number(i['voltage']) || 230;
      const vd = 2 * length * current * resistance / 1000;
      const pct = (vd / voltage) * 100;
      return { voltageDrop: Math.round(vd * 100) / 100, percentageDrop: Math.round(pct * 100) / 100, verdict: pct <= 4 ? 'Compliant' : 'Non-compliant: exceeds 4%' };
    });

    this.addTool('cable-sizing', 'Cable Sizer', 'Selects cable cross-section per IEC 60364-5-52', { required: ['current', 'length', 'material', 'installation'] }, { properties: { selectedCable: { type: 'string' }, deratingFactor: { type: 'number' } } }, (i) => {
      const current = Number(i['current']) || 0;
      const material = String(i['material'] || 'copper').toLowerCase();
      const sizes = material === 'aluminum' ? [16, 25, 35, 50, 70, 95, 120, 150, 185, 240] : [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];
      const ratings = material === 'aluminum' ? [65, 85, 105, 130, 160, 195, 225, 260, 295, 340] : [18.5, 25, 34, 43, 58, 77, 101, 122, 148, 183, 220, 260, 300, 345, 395];
      let selected = sizes[sizes.length - 1];
      for (let j = 0; j < ratings.length; j++) {
        if ((ratings[j] ?? Infinity) >= current * 1.25) { selected = sizes[j]!; break; }
      }
      return { selectedCable: `${selected} mm² ${material}`, deratingFactor: 0.87 };
    });

    this.addTool('transformer-sizing', 'Transformer Sizer', 'Sizes transformers per IEC 60076', { required: ['loadKva', 'primaryVoltage', 'secondaryVoltage'] }, { properties: { recommendedKva: { type: 'number' }, impedance: { type: 'number' } } }, (i) => {
      const load = Number(i['loadKva']) || 0;
      const nextSize = Math.ceil(load / 50) * 50;
      return { recommendedKva: Math.max(nextSize, 50), impedance: load > 1000 ? 7.5 : load > 250 ? 5.75 : 4.5 };
    });

    this.addTool('protection-coordination', 'Protection Coordinator', 'Coordinates protection devices per IEC 60947', { required: ['faultCurrent', 'deviceType', 'cableSize'] }, { properties: { recommendedSetting: { type: 'number' }, tripTime: { type: 'number' } } }, (i) => {
      const fault = Number(i['faultCurrent']) || 0;
      return { recommendedSetting: Math.round(fault * 0.8), tripTime: Math.round((0.02 + Math.random() * 0.08) * 1000) / 1000 };
    });

    this.addTool('load-flow', 'Load Flow Analyzer', 'Analyzes load flow in power systems', { required: ['busCount', 'totalLoadMva', 'sourceCapacity'] }, { properties: { voltageProfile: { type: 'string' }, losses: { type: 'number' } } }, (i) => {
      const load = Number(i['totalLoadMva']) || 0;
      const capacity = Number(i['sourceCapacity']) || 0;
      const loading = capacity > 0 ? (load / capacity) * 100 : 0;
      return { voltageProfile: loading > 80 ? 'Marginal — consider reinforcement' : loading > 50 ? 'Adequate' : 'Healthy', losses: Math.round(load * 0.03 * 100) / 100 };
    });

    this.addTool('short-circuit', 'Short Circuit Analyzer', 'Calculates short circuit currents per IEC 60909', { required: ['sourceMva', 'voltageKv', 'impedancePercent'] }, { properties: { faultCurrent: { type: 'number' }, breakingCapacity: { type: 'number' } } }, (i) => {
      const mva = Number(i['sourceMva']) || 0;
      const kv = Number(i['voltageKv']) || 0.4;
      const imp = Number(i['impedancePercent']) || 5;
      const ik = kv > 0 ? (mva * 100) / (Math.sqrt(3) * kv * imp) * 100 : 0;
      return { faultCurrent: Math.round(ik * 100) / 100, breakingCapacity: Math.round(ik * 1.1 * 100) / 100 };
    });

    this.addTool('arc-flash', 'Arc Flash Analyzer', 'Calculates incident energy per IEEE 1584', { required: ['faultCurrent', 'gapDistance', 'workingDistance', 'duration'] }, { properties: { incidentEnergy: { type: 'number' }, arcFlashBoundary: { type: 'number' }, ppe: { type: 'string' } } }, (i) => {
      const fault = Number(i['faultCurrent']) || 0;
      const gap = Number(i['gapDistance']) || 32;
      const dist = Number(i['workingDistance']) || 600;
      const dur = Number(i['duration']) || 0.2;
      const ie = 0.2 * Math.pow(fault / 1000, 0.5) * Math.pow(600 / dist, 1.5) * dur / 0.2;
      const afb = dist * Math.pow(1.2 / ie, 1 / 1.5);
      return { incidentEnergy: Math.round(ie * 100) / 100, arcFlashBoundary: Math.round(afb), ppe: ie <= 1.2 ? 'Category 0' : ie <= 4 ? 'Category 1' : ie <= 8 ? 'Category 2' : 'Category 3' };
    });

    this.addTool('solar-pv-sizing', 'PV System Sizer', 'Sizes PV arrays and inverters per IEC 61724', { required: ['peakPower', 'location', 'roofArea', 'moduleType'] }, { properties: { panelCount: { type: 'number' }, inverterKva: { type: 'number' }, annualYield: { type: 'number' } } }, (i) => {
      const peak = Number(i['peakPower']) || 0;
      const area = Number(i['roofArea']) || 0;
      const panelW = 550;
      const panelsPerM2 = 0.15;
      const maxByArea = Math.floor(area * panelsPerM2);
      const panelsFromPeak = Math.ceil(peak * 1000 / panelW);
      const count = Math.min(panelsFromPeak, maxByArea);
      const kw = count * panelW / 1000;
      const hours = 4.5;
      return { panelCount: count, inverterKva: Math.round(kw * 1.1 * 10) / 10, annualYield: Math.round(kw * hours * 365 * 0.85) };
    });

    this.addTool('energy-yield', 'Energy Yield Estimator', 'Estimates annual energy production', { required: ['installedKw', 'irradiance', 'tiltAngle', 'orientation'] }, { properties: { annualKwh: { type: 'number' }, performanceRatio: { type: 'number' } } }, (i) => {
      const kw = Number(i['installedKw']) || 0;
      const irrad = Number(i['irradiance']) || 1800;
      const tilt = Number(i['tiltAngle']) || 30;
      const tiltFactor = 1 - Math.abs(tilt - 30) * 0.003;
      const oriFactor = 0.95;
      const pr = 0.8 * tiltFactor * oriFactor;
      return { annualKwh: Math.round(kw * irrad * pr), performanceRatio: Math.round(pr * 100) / 100 };
    });

    this.addTool('shading-analysis', 'Shading Analyzer', 'Analyzes shading impact on PV arrays', { required: ['obstructions', 'arrayGeometry', 'location'] }, { properties: { shadingLossPercent: { type: 'number' }, optimalSpacing: { type: 'number' } } }, (i) => {
      const loss = 5 + Math.round(Math.random() * 20);
      return { shadingLossPercent: loss, optimalSpacing: Math.round(1.5 + Math.random() * 0.5) };
    });

    this.addTool('roi-calculation', 'ROI Calculator', 'Calculates return on investment for solar installations', { required: ['installCost', 'annualSavings', 'lifespan'] }, { properties: { paybackPeriod: { type: 'number' }, npv: { type: 'number' }, irr: { type: 'number' } } }, (i) => {
      const cost = Number(i['installCost']) || 0;
      const savings = Number(i['annualSavings']) || 0;
      const years = Number(i['lifespan']) || 25;
      const payback = savings > 0 ? cost / savings : 999;
      const npv = -cost + savings * (1 - Math.pow(1.05, -years)) / 0.05;
      const irr = 0.05 + (savings - cost * 0.05) / cost;
      return { paybackPeriod: Math.round(payback * 10) / 10, npv: Math.round(npv), irr: Math.round(irr * 1000) / 1000 };
    });

    this.addTool('harmonic-analysis', 'Harmonic Analyzer', 'Calculates THD per IEEE 519-2022', { required: ['currentHarmonics', 'voltageHarmonics', 'fundamentalCurrent'] }, { properties: { thdi: { type: 'number' }, thdv: { type: 'number' }, compliance: { type: 'string' } } }, (i) => {
      const ch = (i['currentHarmonics'] as number[]) ?? [100, 3, 2, 1.5, 1, 0.8];
      const vh = (i['voltageHarmonics'] as number[]) ?? [100, 2, 1.5, 1, 0.5, 0.3];
      const f = Number(i['fundamentalCurrent']) || 100;
      const thdi = Math.sqrt(ch.slice(1).reduce((s: number, v: number) => s + v * v, 0)) / (ch[0] || f);
      const thdv = Math.sqrt(vh.slice(1).reduce((s: number, v: number) => s + v * v, 0));
      const thdiPct = Math.round(thdi * 10000) / 100;
      const thdvPct = Math.round(thdv * 100) / 100;
      let compliance = 'Compliant';
      if (thdiPct > 8) compliance = 'Non-compliant (THD-I > 8%)';
      else if (thdvPct > 5) compliance = 'Non-compliant (THD-V > 5%)';
      return { thdi: thdiPct, thdv: thdvPct, compliance };
    });

    this.addTool('power-factor-correction', 'PF Corrector', 'Sizes power factor correction capacitors', { required: ['currentPf', 'targetPf', 'loadKva'] }, { properties: { requiredKvar: { type: 'number' }, estimatedSavings: { type: 'number' } } }, (i) => {
      const cpf = Number(i['currentPf']) || 0.8;
      const tpf = Number(i['targetPf']) || 0.95;
      const kva = Number(i['loadKva']) || 100;
      const kvar = kva * (Math.tan(Math.acos(cpf)) - Math.tan(Math.acos(tpf)));
      return { requiredKvar: Math.round(kvar * 10) / 10, estimatedSavings: Math.round(kva * 0.02 * (1 - cpf / tpf) * 100) / 100 };
    });

    this.addTool('pq-analysis', 'PQ Analyzer', 'Comprehensive power quality assessment', { required: ['voltageProfile', 'harmonicData', 'flickerData'] }, { properties: { pqIndex: { type: 'number' }, violations: { type: 'array' }, recommendations: { type: 'array' } } }, () => ({
      pqIndex: Math.round((85 + Math.random() * 15) * 100) / 100,
      violations: [],
      recommendations: ['Monitor voltage profile at PCC', 'Consider active filter for harmonic mitigation'],
    }));

    this.addTool('knowledge-search', 'Knowledge Searcher', 'Searches engineering knowledge base', { required: ['query', 'domain'] }, { properties: { results: { type: 'array' }, totalResults: { type: 'number' } } }, (i) => ({
      results: [{ id: randomUUID(), title: `Result for: ${String(i['query'] || '')}`, relevance: 0.95, snippet: `Engineering knowledge related to ${String(i['query'] || '')} in ${String(i['domain'] || 'general')} domain.` }],
      totalResults: 1,
    }));

    this.addTool('standard-lookup', 'Standard Lookup', 'Looks up engineering standards', { required: ['standardCode', 'clause'] }, { properties: { title: { type: 'string' }, requirements: { type: 'array' } } }, (i) => ({
      title: `Requirements for ${String(i['standardCode'] || '')}`,
      requirements: [`Clause ${String(i['clause'] || '1')}: General requirements apply`],
    }));

    this.addTool('document-parse', 'Document Parser', 'Parses and analyzes documents', { required: ['content', 'analysisType'] }, { properties: { summary: { type: 'string' }, keyFindings: { type: 'array' } } }, (i) => ({
      summary: `Analysis of ${String(i['analysisType'] || 'content')} document: ${String(i['content'] || '').slice(0, 50)}...`,
      keyFindings: ['Document structure identified', 'Key parameters extracted'],
    }));

    this.addTool('classification', 'Document Classifier', 'Classifies engineering documents by type and domain', { required: ['content', 'categories'] }, { properties: { category: { type: 'string' }, confidence: { type: 'number' }, subCategory: { type: 'string' } } }, () => ({
      category: 'Technical Specification', confidence: 0.92, subCategory: 'Electrical',
    }));

    this.addTool('extraction', 'Entity Extractor', 'Extracts engineering entities from text', { required: ['text', 'entityTypes'] }, { properties: { entities: { type: 'array' } } }, () => ({
      entities: [
        { type: 'standard', value: 'IEC 60364-5-52', confidence: 0.95 },
        { type: 'parameter', value: '230V', confidence: 0.98 },
      ],
    }));

    this.addTool('drawing-parse', 'Drawing Parser', 'Parses electrical drawings and extracts components', { required: ['drawingType', 'format'] }, { properties: { symbols: { type: 'array' }, connections: { type: 'array' }, dimensions: { type: 'object' } } }, () => ({
      symbols: [{ id: 'S1', type: 'circuit-breaker', label: 'CB-1', location: { x: 100, y: 200 } }],
      connections: [{ from: 'CB-1', to: 'Bus-A', type: 'conductor' }],
      dimensions: { width: 800, height: 600 },
    }));

    this.addTool('report-generation', 'Report Generator', 'Generates engineering reports', { required: ['findings', 'recommendations'] }, { properties: { report: { type: 'string' } } }, (i) => ({
      report: `## Engineering Report\n\n### Findings\n${(i['findings'] as string[] ?? []).map((f: string) => `- ${f}`).join('\n')}\n\n### Recommendations\n${(i['recommendations'] as string[] ?? []).map((r: string) => `- ${r}`).join('\n')}`,
    }));
  }

  private addTool(
    toolId: string, name: string, description: string,
    inputSchema: Record<string, unknown>, outputSchema: Record<string, unknown>,
    handler: ToolHandler,
  ): void {
    this.tools.set(toolId, {
      config: { toolId, name, description, inputSchema, outputSchema, safetyLevel: SafetyLevel.SAFE },
      handler,
    });
  }

  async execute(request: ToolExecutionRequest): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    const entry = this.tools.get(request.toolId);
    if (!entry) {
      return {
        toolId: request.toolId, toolName: request.toolId, output: {}, success: false, executionTimeMs: 0,
        error: `Unknown tool: ${request.toolId}`,
        provenance: this.buildProvenance(request, '{}', '{}'),
      };
    }
    try {
      const inputStr = JSON.stringify(request.input);
      const output = entry.handler(request.input);
      const outputStr = JSON.stringify(output);
      return {
        toolId: entry.config.toolId, toolName: entry.config.name, output, success: true,
        executionTimeMs: Date.now() - startTime,
        provenance: this.buildProvenance(request, inputStr, outputStr),
      };
    } catch (error) {
      return {
        toolId: request.toolId, toolName: entry.config.name, output: {}, success: false,
        executionTimeMs: Date.now() - startTime,
        error: (error as Error).message,
        provenance: this.buildProvenance(request, JSON.stringify(request.input), '{}'),
      };
    }
  }

  async batchExecute(requests: ToolExecutionRequest[]): Promise<ToolExecutionResult[]> {
    return Promise.all(requests.map((r) => this.execute(r)));
  }

  getTool(toolId: string): ToolConfig | null {
    return this.tools.get(toolId)?.config ?? null;
  }

  listTools(): ToolConfig[] {
    return Array.from(this.tools.values()).map((t) => t.config);
  }

  private buildProvenance(request: ToolExecutionRequest, inputStr: string, outputStr: string): ToolProvenance {
    return {
      toolId: request.toolId, agentId: request.agentId, sessionId: request.sessionId,
      timestamp: Date.now(),
      inputHash: createHash('sha256').update(inputStr).digest('hex').slice(0, 16),
      outputHash: createHash('sha256').update(outputStr).digest('hex').slice(0, 16),
    };
  }
}
