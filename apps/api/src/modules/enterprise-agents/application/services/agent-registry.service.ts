import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { IAgentRegistry } from '../../domain/interfaces/agent-registry.interface.js';
import type { AgentDefinition, AgentCapability } from '../../domain/types/agent.types.js';
import { AgentType, AgentCapabilityType, SafetyLevel } from '../../domain/types/agent.types.js';

function cap(type: AgentCapabilityType, description: string, tools: string[]): AgentCapability {
  return { type, description, requiredTools: tools };
}

function tool(toolId: string, name: string, description: string, inputSchema: Record<string, unknown>, outputSchema: Record<string, unknown>, safetyLevel: SafetyLevel = SafetyLevel.SAFE) {
  return { toolId, name, description, inputSchema, outputSchema, safetyLevel };
}

const BUILTIN_AGENTS: AgentDefinition[] = [
  {
    id: randomUUID(), name: 'Electrical Engineer', slug: 'electrical-engineer',
    description: 'Expert in power systems, load flow, short circuit, cable sizing, protection coordination, and transformer design per IEC/IEEE standards.',
    type: AgentType.ELECTRICAL_ENGINEER, isActive: true, version: '1.0.0', createdAt: new Date(),
    systemPrompt: 'You are an expert electrical engineer specializing in power systems. Provide calculations and recommendations per IEC 60364, IEC 60076, IEEE 80, and IEEE 519 standards.',
    capabilities: [cap(AgentCapabilityType.CALCULATE, 'Voltage drop and cable sizing', ['voltage-drop', 'cable-sizing']),
      cap(AgentCapabilityType.CALCULATE, 'Transformer sizing and protection', ['transformer-sizing', 'protection-coordination']),
      cap(AgentCapabilityType.ANALYZE, 'Load flow and short circuit analysis', ['load-flow', 'short-circuit']),
      cap(AgentCapabilityType.RECOMMEND, 'Engineering recommendations', ['report-generation'])],
    toolsConfig: [tool('voltage-drop', 'Voltage Drop Calculator', 'Calculates voltage drop per IEC 60364-5-52', { required: ['current', 'length', 'resistance', 'voltage'] }, { properties: { voltageDrop: { type: 'number' }, percentageDrop: { type: 'number' }, verdict: { type: 'string' } } }),
      tool('cable-sizing', 'Cable Sizer', 'Selects cable cross-section per IEC 60364-5-52', { required: ['current', 'length', 'material', 'installation'] }, { properties: { selectedCable: { type: 'string' }, deratingFactor: { type: 'number' } } }),
      tool('transformer-sizing', 'Transformer Sizer', 'Sizes transformers per IEC 60076', { required: ['loadKva', 'primaryVoltage', 'secondaryVoltage'] }, { properties: { recommendedKva: { type: 'number' }, impedance: { type: 'number' } } }),
      tool('protection-coordination', 'Protection Coordinator', 'Coordinates protection devices per IEC 60947', { required: ['faultCurrent', 'deviceType', 'cableSize'] }, { properties: { recommendedSetting: { type: 'number' }, tripTime: { type: 'number' } } }),
      tool('load-flow', 'Load Flow Analyzer', 'Analyzes load flow in power systems', { required: ['busCount', 'totalLoadMva', 'sourceCapacity'] }, { properties: { voltageProfile: { type: 'string' }, losses: { type: 'number' } } }),
      tool('short-circuit', 'Short Circuit Analyzer', 'Calculates short circuit currents per IEC 60909', { required: ['sourceMva', 'voltageKv', 'impedancePercent'] }, { properties: { faultCurrent: { type: 'number' }, breakingCapacity: { type: 'number' } } }),
      tool('report-generation', 'Report Generator', 'Generates engineering reports', { required: ['findings', 'recommendations'] }, { properties: { report: { type: 'string' } } })],
  },
  {
    id: randomUUID(), name: 'Solar Consultant', slug: 'solar-consultant',
    description: 'Expert in solar PV system design, energy yield estimation, ROI analysis, and shading assessment.',
    type: AgentType.SOLAR_CONSULTANT, isActive: true, version: '1.0.0', createdAt: new Date(),
    systemPrompt: 'You are a solar energy consultant specializing in PV system design per IEC 61724, IEC 62446, and local grid codes.',
    capabilities: [cap(AgentCapabilityType.CALCULATE, 'Solar PV sizing and energy yield', ['solar-pv-sizing', 'energy-yield']),
      cap(AgentCapabilityType.ANALYZE, 'Shading analysis and ROI calculation', ['shading-analysis', 'roi-calculation']),
      cap(AgentCapabilityType.RECOMMEND, 'System design recommendations', ['report-generation'])],
    toolsConfig: [tool('solar-pv-sizing', 'PV System Sizer', 'Sizes PV arrays and inverters per IEC 61724', { required: ['peakPower', 'location', 'roofArea', 'moduleType'] }, { properties: { panelCount: { type: 'number' }, inverterKva: { type: 'number' }, annualYield: { type: 'number' } } }),
      tool('energy-yield', 'Energy Yield Estimator', 'Estimates annual energy production', { required: ['installedKw', 'irradiance', 'tiltAngle', 'orientation'] }, { properties: { annualKwh: { type: 'number' }, performanceRatio: { type: 'number' } } }),
      tool('shading-analysis', 'Shading Analyzer', 'Analyzes shading impact on PV arrays', { required: ['obstructions', 'arrayGeometry', 'location'] }, { properties: { shadingLossPercent: { type: 'number' }, optimalSpacing: { type: 'number' } } }),
      tool('roi-calculation', 'ROI Calculator', 'Calculates return on investment for solar installations', { required: ['installCost', 'annualSavings', 'lifespan'] }, { properties: { paybackPeriod: { type: 'number' }, npv: { type: 'number' }, irr: { type: 'number' } } }),
      tool('report-generation', 'Report Generator', 'Generates solar consultation reports', { required: ['findings', 'recommendations'] }, { properties: { report: { type: 'string' } } })],
  },
  {
    id: randomUUID(), name: 'Protection Engineer', slug: 'protection-engineer',
    description: 'Expert in protection relay coordination, arc flash analysis, fault calculation per IEEE 1584 and IEC 60947.',
    type: AgentType.PROTECTION_ENGINEER, isActive: true, version: '1.0.0', createdAt: new Date(),
    systemPrompt: 'You are a protection engineer specializing in relay coordination, arc flash analysis, and fault studies.',
    capabilities: [cap(AgentCapabilityType.CALCULATE, 'Relay coordination settings', ['protection-coordination']),
      cap(AgentCapabilityType.ANALYZE, 'Arc flash and fault analysis', ['arc-flash', 'short-circuit']),
      cap(AgentCapabilityType.RECOMMEND, 'Protection scheme design', ['report-generation'])],
    toolsConfig: [tool('protection-coordination', 'Relay Coordinator', 'Coordinates protective relays per IEC 60947', { required: ['faultCurrent', 'relayType', 'tCharacteristics'] }, { properties: { tms: { type: 'number' }, pickup: { type: 'number' }, coordinationTime: { type: 'number' } } }),
      tool('arc-flash', 'Arc Flash Analyzer', 'Calculates incident energy per IEEE 1584', { required: ['faultCurrent', 'gapDistance', 'workingDistance', 'duration'] }, { properties: { incidentEnergy: { type: 'number' }, arcFlashBoundary: { type: 'number' }, ppe: { type: 'string' } } }),
      tool('short-circuit', 'Short Circuit Analyzer', 'Calculates fault levels per IEC 60909', { required: ['sourceMva', 'voltageKv', 'impedancePercent'] }, { properties: { faultCurrent: { type: 'number' }, breakingCapacity: { type: 'number' } } }),
      tool('report-generation', 'Report Generator', 'Generates protection study reports', { required: ['findings', 'recommendations'] }, { properties: { report: { type: 'string' } } })],
  },
  {
    id: randomUUID(), name: 'Power Quality Engineer', slug: 'power-quality',
    description: 'Expert in harmonic analysis, power factor correction, and power quality mitigation per IEEE 519-2022.',
    type: AgentType.POWER_QUALITY, isActive: true, version: '1.0.0', createdAt: new Date(),
    systemPrompt: 'You are a power quality engineer specializing in harmonic analysis, power factor correction, and PQ mitigation per IEEE 519-2022.',
    capabilities: [cap(AgentCapabilityType.CALCULATE, 'THD analysis and harmonic filter sizing', ['harmonic-analysis', 'power-factor-correction']),
      cap(AgentCapabilityType.ANALYZE, 'Power quality assessment', ['pq-analysis']),
      cap(AgentCapabilityType.RECOMMEND, 'Mitigation recommendations', ['report-generation'])],
    toolsConfig: [tool('harmonic-analysis', 'Harmonic Analyzer', 'Calculates THD per IEEE 519-2022', { required: ['currentHarmonics', 'voltageHarmonics', 'fundamentalCurrent'] }, { properties: { thdi: { type: 'number' }, thdv: { type: 'number' }, compliance: { type: 'string' } } }),
      tool('power-factor-correction', 'PF Corrector', 'Sizes power factor correction capacitors', { required: ['currentPf', 'targetPf', 'loadKva'] }, { properties: { requiredKvar: { type: 'number' }, estimatedSavings: { type: 'number' } } }),
      tool('pq-analysis', 'PQ Analyzer', 'Comprehensive power quality assessment', { required: ['voltageProfile', 'harmonicData', 'flickerData'] }, { properties: { pqIndex: { type: 'number' }, violations: { type: 'array' }, recommendations: { type: 'array' } } }),
      tool('report-generation', 'Report Generator', 'Generates PQ assessment reports', { required: ['findings', 'recommendations'] }, { properties: { report: { type: 'string' } } })],
  },
  {
    id: randomUUID(), name: 'Research Agent', slug: 'researcher',
    description: 'Searches and synthesizes information from engineering knowledge base, standards, and technical documents.',
    type: AgentType.RESEARCHER, isActive: true, version: '1.0.0', createdAt: new Date(),
    systemPrompt: 'You are a research assistant specialized in electrical engineering knowledge retrieval and synthesis.',
    capabilities: [cap(AgentCapabilityType.SEARCH, 'Knowledge base and standards search', ['knowledge-search', 'standard-lookup']),
      cap(AgentCapabilityType.ANALYZE, 'Document analysis and synthesis', ['document-parse', 'extraction']),
      cap(AgentCapabilityType.REPORT, 'Research report generation', ['report-generation'])],
    toolsConfig: [tool('knowledge-search', 'Knowledge Searcher', 'Searches engineering knowledge base', { required: ['query', 'domain'] }, { properties: { results: { type: 'array' }, totalResults: { type: 'number' } } }),
      tool('standard-lookup', 'Standard Lookup', 'Looks up engineering standards', { required: ['standardCode', 'clause'] }, { properties: { title: { type: 'string' }, requirements: { type: 'array' } } }),
      tool('document-parse', 'Document Parser', 'Parses and analyzes documents', { required: ['content', 'analysisType'] }, { properties: { summary: { type: 'string' }, keyFindings: { type: 'array' } } }),
      tool('extraction', 'Entity Extractor', 'Extracts engineering entities from text', { required: ['text', 'entityTypes'] }, { properties: { entities: { type: 'array' } } }),
      tool('report-generation', 'Report Generator', 'Generates research reports', { required: ['findings', 'recommendations'] }, { properties: { report: { type: 'string' } } })],
  },
  {
    id: randomUUID(), name: 'Document Analyst', slug: 'document-analyst',
    description: 'Analyzes technical documents, extracts specifications, classifies content, and identifies standards references.',
    type: AgentType.DOCUMENT_ANALYST, isActive: true, version: '1.0.0', createdAt: new Date(),
    systemPrompt: 'You are a document analysis specialist for electrical engineering documents, drawings, and technical specifications.',
    capabilities: [cap(AgentCapabilityType.CLASSIFY, 'Document classification and categorization', ['classification']),
      cap(AgentCapabilityType.EXTRACT, 'Specification and entity extraction', ['extraction']),
      cap(AgentCapabilityType.ANALYZE, 'Technical content analysis', ['document-parse'])],
    toolsConfig: [tool('classification', 'Document Classifier', 'Classifies engineering documents by type and domain', { required: ['content', 'categories'] }, { properties: { category: { type: 'string' }, confidence: { type: 'number' }, subCategory: { type: 'string' } } }),
      tool('extraction', 'Specification Extractor', 'Extracts technical specifications from documents', { required: ['content', 'extractTypes'] }, { properties: { specifications: { type: 'array' }, standards: { type: 'array' } } }),
      tool('document-parse', 'Document Analyzer', 'Analyzes document structure and content', { required: ['content', 'analysisType'] }, { properties: { summary: { type: 'string' }, keyFindings: { type: 'array' } } })],
  },
  {
    id: randomUUID(), name: 'Drawing Analyst', slug: 'drawing-analyst',
    description: 'Analyzes electrical drawings, identifies symbols, extracts dimensions, and validates against standards.',
    type: AgentType.DRAWING_ANALYST, isActive: true, version: '1.0.0', createdAt: new Date(),
    systemPrompt: 'You are a drawing analysis specialist for electrical schematics, single-line diagrams, and panel layouts.',
    capabilities: [cap(AgentCapabilityType.EXTRACT, 'Symbol and dimension extraction', ['drawing-parse', 'extraction']),
      cap(AgentCapabilityType.ANALYZE, 'Drawing validation and compliance check', ['classification']),
      cap(AgentCapabilityType.REPORT, 'Drawing review report', ['report-generation'])],
    toolsConfig: [tool('drawing-parse', 'Drawing Parser', 'Parses electrical drawings and extracts components', { required: ['drawingType', 'format'] }, { properties: { symbols: { type: 'array' }, connections: { type: 'array' }, dimensions: { type: 'object' } } }),
      tool('extraction', 'Symbol Extractor', 'Extracts and identifies electrical symbols', { required: ['drawingData', 'symbolLibrary'] }, { properties: { identifiedSymbols: { type: 'array' }, unknownSymbols: { type: 'array' } } }),
      tool('classification', 'Drawing Classifier', 'Classifies drawing type and validates compliance', { required: ['drawingFeatures', 'standard'] }, { properties: { drawingType: { type: 'string' }, compliance: { type: 'string' }, issues: { type: 'array' } } }),
      tool('report-generation', 'Report Generator', 'Generates drawing review reports', { required: ['findings', 'recommendations'] }, { properties: { report: { type: 'string' } } })],
  },
];

@Injectable()
export class AgentRegistry implements IAgentRegistry {
  private agents = new Map<string, AgentDefinition>();

  constructor() {
    for (const agent of BUILTIN_AGENTS) {
      this.agents.set(agent.slug, agent);
    }
  }

  register(def: AgentDefinition): void {
    this.agents.set(def.slug, def);
  }

  get(slug: string): AgentDefinition | null {
    return this.agents.get(slug) ?? null;
  }

  getById(id: string): AgentDefinition | null {
    for (const agent of this.agents.values()) {
      if (agent.id === id) return agent;
    }
    return null;
  }

  findByType(type: AgentType): AgentDefinition[] {
    return Array.from(this.agents.values()).filter((a) => a.type === type);
  }

  findByCapability(capability: AgentCapabilityType): AgentDefinition[] {
    return Array.from(this.agents.values()).filter((a) =>
      a.capabilities.some((c) => c.type === capability),
    );
  }

  list(): AgentDefinition[] {
    return Array.from(this.agents.values());
  }

  listActive(): AgentDefinition[] {
    return Array.from(this.agents.values()).filter((a) => a.isActive);
  }
}
