export type RelationType =
  | 'subclass_of'
  | 'equivalent_to'
  | 'disjoint_with'
  | 'part_of'
  | 'has_part';

export const RELATION_TYPES: RelationType[] = [
  'subclass_of',
  'equivalent_to',
  'disjoint_with',
  'part_of',
  'has_part',
];
