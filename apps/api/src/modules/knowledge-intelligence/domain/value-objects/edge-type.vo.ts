import type { NodeType } from './node-type.vo.js';

export type EdgeType =
  | 'cites'
  | 'depends_on'
  | 'related_to'
  | 'regulates'
  | 'supersedes'
  | 'equivalent_to'
  | 'part_of'
  | 'derived_from'
  | 'references'
  | 'includes'
  | 'calculated_by'
  | 'defined_in'
  | 'belongs_to'
  | 'version_of'
  | 'subclass_of';

export const EDGE_TYPES: EdgeType[] = [
  'cites',
  'depends_on',
  'related_to',
  'regulates',
  'supersedes',
  'equivalent_to',
  'part_of',
  'derived_from',
  'references',
  'includes',
  'calculated_by',
  'defined_in',
  'belongs_to',
  'version_of',
  'subclass_of',
];

export const ALLOWED_OUTGOING_EDGES: Record<NodeType, EdgeType[]> = {
  document: ['cites', 'references', 'includes', 'part_of', 'version_of'],
  entity: ['cites', 'references', 'related_to', 'equivalent_to', 'part_of'],
  concept: ['related_to', 'equivalent_to', 'subclass_of', 'part_of'],
  standard: ['regulates', 'supersedes', 'references', 'defined_in'],
  formula: ['derived_from', 'defined_in', 'calculated_by'],
  calculation: ['calculated_by', 'derived_from', 'references'],
  person: ['belongs_to'],
  organization: ['belongs_to', 'part_of'],
  equipment: ['calculated_by', 'defined_in', 'part_of', 'related_to'],
  formula_instance: ['derived_from', 'calculated_by'],
  calculation_instance: ['calculated_by', 'derived_from'],
};
