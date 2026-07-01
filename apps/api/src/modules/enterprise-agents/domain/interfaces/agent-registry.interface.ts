import type { AgentDefinition, AgentType, AgentCapabilityType } from '../types/agent.types.js';

export interface IAgentRegistry {
  register(def: AgentDefinition): void;
  get(slug: string): AgentDefinition | null;
  getById(id: string): AgentDefinition | null;
  findByType(type: AgentType): AgentDefinition[];
  findByCapability(capability: AgentCapabilityType): AgentDefinition[];
  list(): AgentDefinition[];
  listActive(): AgentDefinition[];
}
