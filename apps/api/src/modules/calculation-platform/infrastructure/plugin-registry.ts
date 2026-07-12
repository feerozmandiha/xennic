import { Injectable, Logger } from '@nestjs/common';

export interface PluginCapability {
  name: string;
  description: string;
  config: Record<string, unknown>;
}

export interface RegisteredPlugin {
  slug: string;
  name: string;
  description: string | null;
  version: string;
  enabled: boolean;
  capabilities: PluginCapability[];
}

export const DEFAULT_PLUGINS: RegisteredPlugin[] = [
  {
    slug: 'voltage-drop',
    name: 'Voltage Drop',
    description: 'Cable voltage drop calculation per IEC 60287',
    version: '1.0.0',
    enabled: true,
    capabilities: [
      { name: 'voltage-drop', description: 'Calculates voltage drop in cables', config: {} },
    ],
  },
  {
    slug: 'short-circuit',
    name: 'Short Circuit',
    description: 'Short-circuit current calculation per IEC 60909',
    version: '1.0.0',
    enabled: true,
    capabilities: [
      { name: 'short-circuit', description: 'Calculates short-circuit currents', config: {} },
    ],
  },
  {
    slug: 'load-flow',
    name: 'Load Flow',
    description: 'Power flow analysis for electrical networks',
    version: '1.0.0',
    enabled: true,
    capabilities: [{ name: 'load-flow', description: 'Power flow analysis', config: {} }],
  },
  {
    slug: 'motor-starting',
    name: 'Motor Starting',
    description: 'Motor starting current and voltage dip analysis',
    version: '1.0.0',
    enabled: true,
    capabilities: [{ name: 'motor-starting', description: 'Motor starting analysis', config: {} }],
  },
  {
    slug: 'transformer',
    name: 'Transformer',
    description: 'Transformer sizing and regulation calculation',
    version: '1.0.0',
    enabled: true,
    capabilities: [{ name: 'transformer', description: 'Transformer calculations', config: {} }],
  },
  {
    slug: 'relay-coordination',
    name: 'Relay Coordination',
    description: 'Protective relay coordination study',
    version: '1.0.0',
    enabled: true,
    capabilities: [
      { name: 'relay-coordination', description: 'Relay coordination analysis', config: {} },
    ],
  },
  {
    slug: 'arc-flash',
    name: 'Arc Flash',
    description: 'Arc flash hazard analysis per IEEE 1584-2018',
    version: '1.0.0',
    enabled: true,
    capabilities: [{ name: 'arc-flash', description: 'Arc flash hazard calculation', config: {} }],
  },
  {
    slug: 'grounding',
    name: 'Grounding',
    description: 'Grounding system design calculations',
    version: '1.0.0',
    enabled: true,
    capabilities: [{ name: 'grounding', description: 'Grounding calculations', config: {} }],
  },
  {
    slug: 'cable-ampacity',
    name: 'Cable Ampacity',
    description: 'Cable current-carrying capacity per IEC 60287',
    version: '1.0.0',
    enabled: true,
    capabilities: [
      { name: 'cable-ampacity', description: 'Cable ampacity calculation', config: {} },
    ],
  },
  {
    slug: 'pv',
    name: 'PV System',
    description: 'Photovoltaic system sizing and energy yield',
    version: '1.0.0',
    enabled: true,
    capabilities: [{ name: 'pv', description: 'PV system calculations', config: {} }],
  },
  {
    slug: 'battery',
    name: 'Battery',
    description: 'Battery energy storage system sizing',
    version: '1.0.0',
    enabled: true,
    capabilities: [{ name: 'battery', description: 'Battery system calculations', config: {} }],
  },
  {
    slug: 'ups',
    name: 'UPS',
    description: 'Uninterruptible Power Supply sizing',
    version: '1.0.0',
    enabled: true,
    capabilities: [{ name: 'ups', description: 'UPS sizing calculations', config: {} }],
  },
  {
    slug: 'lighting',
    name: 'Lighting',
    description: 'Lighting system design and illuminance calculation',
    version: '1.0.0',
    enabled: true,
    capabilities: [{ name: 'lighting', description: 'Lighting calculations', config: {} }],
  },
  {
    slug: 'harmonics',
    name: 'Harmonics',
    description: 'Harmonic distortion analysis per IEEE 519',
    version: '1.0.0',
    enabled: true,
    capabilities: [{ name: 'harmonics', description: 'Harmonic analysis', config: {} }],
  },
  {
    slug: 'power-quality',
    name: 'Power Quality',
    description: 'Power quality parameter analysis',
    version: '1.0.0',
    enabled: true,
    capabilities: [{ name: 'power-quality', description: 'Power quality analysis', config: {} }],
  },
  {
    slug: 'economic-analysis',
    name: 'Economic Analysis',
    description: 'Lifecycle cost and economic comparison',
    version: '1.0.0',
    enabled: true,
    capabilities: [{ name: 'economic-analysis', description: 'Economic analysis', config: {} }],
  },
];

@Injectable()
export class PluginRegistry {
  private readonly logger = new Logger(PluginRegistry.name);
  private plugins: Map<string, RegisteredPlugin> = new Map();

  constructor() {
    for (const plugin of DEFAULT_PLUGINS) {
      this.plugins.set(plugin.slug, plugin);
    }
  }

  getPlugin(slug: string): RegisteredPlugin | undefined {
    return this.plugins.get(slug);
  }

  getAllPlugins(): RegisteredPlugin[] {
    return Array.from(this.plugins.values());
  }

  getEnabledPlugins(): RegisteredPlugin[] {
    return this.getAllPlugins().filter((p) => p.enabled);
  }

  isEnabled(slug: string): boolean {
    const plugin = this.plugins.get(slug);
    return plugin ? plugin.enabled : false;
  }

  getCapabilities(): PluginCapability[] {
    return this.getEnabledPlugins().flatMap((p) => p.capabilities);
  }

  findPluginsByCapability(capabilityName: string): RegisteredPlugin[] {
    return this.getEnabledPlugins().filter((p) =>
      p.capabilities.some((c) => c.name === capabilityName),
    );
  }

  getPluginCount(): number {
    return this.plugins.size;
  }
  getEnabledCount(): number {
    return this.getEnabledPlugins().length;
  }
}
