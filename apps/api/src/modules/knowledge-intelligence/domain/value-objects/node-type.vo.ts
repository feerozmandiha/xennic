export type NodeType =
  | 'document'
  | 'entity'
  | 'concept'
  | 'standard'
  | 'formula'
  | 'calculation'
  | 'person'
  | 'organization'
  | 'equipment'
  | 'formula_instance'
  | 'calculation_instance';

export const NODE_TYPES: NodeType[] = [
  'document',
  'entity',
  'concept',
  'standard',
  'formula',
  'calculation',
  'person',
  'organization',
  'equipment',
  'formula_instance',
  'calculation_instance',
];
