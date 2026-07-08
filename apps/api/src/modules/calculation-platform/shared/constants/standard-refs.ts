export interface StandardReference {
  code: string;
  title: string;
  organization: string;
  year?: number;
}

export const STANDARD_REFERENCES: StandardReference[] = [
  { code: 'IEEE1584-2018', title: 'IEEE Guide for Performing Arc-Flash Hazard Calculations', organization: 'IEEE', year: 2018 },
  { code: 'IEC-60909', title: 'Short-circuit currents in three-phase AC systems', organization: 'IEC' },
  { code: 'IEC-60287', title: 'Electric cables - Calculation of the current rating', organization: 'IEC' },
  { code: 'NEC-2023', title: 'National Electrical Code', organization: 'NFPA', year: 2023 },
  { code: 'IEC-60364', title: 'Low-voltage electrical installations', organization: 'IEC' },
  { code: 'IEEE-399', title: 'IEEE Recommended Practice for Industrial and Commercial Power Systems Analysis', organization: 'IEEE' },
  { code: 'IEC-61439', title: 'Low-voltage switchgear and controlgear assemblies', organization: 'IEC' },
  { code: 'IEEE-519', title: 'IEEE Standard for Harmonic Control in Electric Power Systems', organization: 'IEEE' },
  { code: 'IEC-62305', title: 'Protection against lightning', organization: 'IEC' },
  { code: 'IEEE-C37', title: 'IEEE Standard for Relays and Relay Systems', organization: 'IEEE' },
  { code: 'IEC-62271', title: 'High-voltage switchgear and controlgear', organization: 'IEC' },
  { code: 'IEEE-446', title: 'IEEE Recommended Practice for Emergency and Standby Power Systems', organization: 'IEEE' },
];
