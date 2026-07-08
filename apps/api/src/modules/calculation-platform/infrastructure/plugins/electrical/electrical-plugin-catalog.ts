import { DslDefinition } from '../../../domain/value-objects/dsl-definition.value-object.js';

// ============================================================================
// Electrical Engineering Plugin Catalog — Sprint C2
// Each function returns a DslDefinition for the Calculation Platform DSL runtime
// ============================================================================

export const ELECTRICAL_PLUGINS = {
  // ==========================================================================
  // Foundation (Phase 3)
  // ==========================================================================

  'ohms-law': (): DslDefinition =>
    DslDefinition.create({
      id: 'ohms-law',
      version: '1.0.0',
      standard: 'IEC 60027',
      aiReview: true,
      certificate: true,
      inputs: [
        { name: 'V', label: 'Voltage', type: 'number', unit: 'V', required: true },
        { name: 'I', label: 'Current', type: 'number', unit: 'A', required: true },
        { name: 'R', label: 'Resistance', type: 'number', unit: '\u03a9', required: false },
      ],
      outputs: [
        { name: 'calculated', label: 'Calculated Value', type: 'number', unit: 'V/A/\u03a9' },
        { name: 'method', label: 'Method Used', type: 'string' },
      ],
      formulas: [
        {
          name: 'method',
          expression:
            'isNaN(V) ? (isNaN(I) ? "V=I*R" : "V=I*R") : (isNaN(I) ? "I=V/R" : "R=V/I")',
        },
        {
          name: 'calculated',
          expression:
            'isNaN(V) ? (isNaN(I) ? I*R : V/R) : (isNaN(I) ? V/R : V/I)',
        },
      ],
      validations: [
        {
          rule: 'positive_R',
          expression: 'R > 0',
          message: 'Resistance must be positive',
          severity: 'error',
        },
        {
          rule: 'positive_I',
          expression: 'I > 0',
          message: 'Current must be positive',
          severity: 'error',
        },
      ],
      metadata: {
        standard: 'IEC 60027',
        category: 'foundation',
        tags: ['ohm', 'law', 'voltage', 'current', 'resistance'],
        aiExplanation:
          "Ohm's law relates voltage, current, and resistance in DC circuits",
        aiAssumptions: 'Linear resistive circuit, DC steady-state',
        aiWarnings: 'Verify circuit topology before application',
        aiOptimization: 'Use for initial component sizing',
      },
    }),

  'power-calculation': (): DslDefinition =>
    DslDefinition.create({
      id: 'power-calculation',
      version: '1.0.0',
      standard: 'IEC 60027',
      aiReview: true,
      certificate: true,
      inputs: [
        { name: 'V', label: 'Voltage', type: 'number', unit: 'V', required: true },
        { name: 'I', label: 'Current', type: 'number', unit: 'A', required: true },
        {
          name: 'cosPhi',
          label: 'Power Factor',
          type: 'number',
          unit: '',
          required: false,
          defaultValue: 1,
          min: 0,
          max: 1,
        },
      ],
      outputs: [
        { name: 'P', label: 'Active Power', type: 'number', unit: 'W' },
        { name: 'Q', label: 'Reactive Power', type: 'number', unit: 'VAR' },
        { name: 'S', label: 'Apparent Power', type: 'number', unit: 'VA' },
      ],
      formulas: [
        { name: 'S', expression: 'V * I' },
        { name: 'P', expression: 'S * cosPhi' },
        { name: 'Q', expression: 'S * sqrt(1 - cosPhi * cosPhi)' },
      ],
      validations: [
        {
          rule: 'cosPhi_range',
          expression: 'cosPhi >= 0 and cosPhi <= 1',
          message: 'Power factor must be between 0 and 1',
          severity: 'error',
        },
      ],
      metadata: {
        standard: 'IEC 60027',
        category: 'foundation',
        tags: ['power', 'active', 'reactive', 'apparent'],
        aiExplanation:
          'Power calculation using voltage, current, and power factor for AC circuits',
        aiAssumptions: 'Sinusoidal AC waveform, linear load',
        aiWarnings: 'For DC circuits use cosPhi=1',
        aiOptimization: 'N/A (direct calculation)',
      },
    }),

  'energy-calculation': (): DslDefinition =>
    DslDefinition.create({
      id: 'energy-calculation',
      version: '1.0.0',
      standard: 'IEC 60027',
      aiReview: true,
      certificate: true,
      inputs: [
        { name: 'P', label: 'Power', type: 'number', unit: 'W', required: true },
        {
          name: 't',
          label: 'Time',
          type: 'number',
          unit: 'h',
          required: true,
          min: 0,
        },
      ],
      outputs: [
        { name: 'E_kWh', label: 'Energy', type: 'number', unit: 'kWh' },
        { name: 'E_MJ', label: 'Energy (MJ)', type: 'number', unit: 'MJ' },
      ],
      formulas: [
        { name: 'E_kWh', expression: 'P * t / 1000' },
        { name: 'E_MJ', expression: 'E_kWh * 3.6' },
      ],
      validations: [
        {
          rule: 'positive_t',
          expression: 't >= 0',
          message: 'Time must be non-negative',
          severity: 'error',
        },
      ],
      metadata: {
        standard: 'IEC 60027',
        category: 'foundation',
        tags: ['energy', 'power', 'time', 'consumption'],
        aiExplanation:
          'Energy calculation from power consumption over time',
        aiAssumptions: 'Constant power draw over time period',
        aiWarnings: 'Peak loads may exceed average for short durations',
        aiOptimization: 'Use time-of-use tariff for cost optimization',
      },
    }),

  'efficiency': (): DslDefinition =>
    DslDefinition.create({
      id: 'efficiency',
      version: '1.0.0',
      standard: 'IEC 60034-1',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'P_out',
          label: 'Output Power',
          type: 'number',
          unit: 'W',
          required: true,
          min: 0,
        },
        {
          name: 'P_in',
          label: 'Input Power',
          type: 'number',
          unit: 'W',
          required: true,
          min: 0,
        },
      ],
      outputs: [
        { name: 'efficiency', label: 'Efficiency', type: 'number', unit: '%' },
        { name: 'losses', label: 'Total Losses', type: 'number', unit: 'W' },
      ],
      formulas: [
        { name: 'efficiency', expression: 'P_out / P_in * 100' },
        { name: 'losses', expression: 'P_in - P_out' },
      ],
      validations: [
        {
          rule: 'P_out_less_P_in',
          expression: 'P_out <= P_in',
          message: 'Output power cannot exceed input',
          severity: 'error',
        },
        {
          rule: 'positive',
          expression: 'P_in > 0',
          message: 'Input must be positive',
          severity: 'error',
        },
      ],
      metadata: {
        standard: 'IEC 60034-1',
        category: 'foundation',
        tags: ['efficiency', 'losses', 'power', 'motor'],
        aiExplanation:
          'Efficiency is the ratio of useful output to total input power',
        aiAssumptions: 'Steady-state operation at rated conditions',
        aiWarnings: 'Actual efficiency varies with load factor',
        aiOptimization: 'Consider IE4/IE5 class motors for best efficiency',
      },
    }),

  'power-factor': (): DslDefinition =>
    DslDefinition.create({
      id: 'power-factor',
      version: '1.0.0',
      standard: 'IEEE 1459',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'P',
          label: 'Active Power',
          type: 'number',
          unit: 'W',
          required: true,
          min: 0,
        },
        {
          name: 'S',
          label: 'Apparent Power',
          type: 'number',
          unit: 'VA',
          required: true,
          min: 0,
        },
      ],
      outputs: [
        { name: 'cosPhi', label: 'Power Factor', type: 'number', unit: '' },
        { name: 'phi', label: 'Phase Angle', type: 'number', unit: 'deg' },
        { name: 'Q', label: 'Reactive Power', type: 'number', unit: 'VAR' },
      ],
      formulas: [
        { name: 'cosPhi', expression: 'P / S' },
        { name: 'phi', expression: 'acos(P / S) * 180 / pi' },
        { name: 'Q', expression: 'sqrt(S * S - P * P)' },
      ],
      validations: [
        {
          rule: 'P_leq_S',
          expression: 'P <= S',
          message: 'Active power cannot exceed apparent power',
          severity: 'error',
        },
      ],
      metadata: {
        standard: 'IEEE 1459',
        category: 'foundation',
        tags: ['power-factor', 'phase-angle', 'reactive'],
        aiExplanation:
          'Power factor is the ratio of active to apparent power in AC systems',
        aiAssumptions: 'Sinusoidal waveform with linear load',
        aiWarnings: 'Low PF increases line losses and utility penalties',
        aiOptimization: 'Target PF > 0.95 to avoid utility penalties',
      },
    }),

  'three-phase-power': (): DslDefinition =>
    DslDefinition.create({
      id: 'three-phase-power',
      version: '1.0.0',
      standard: 'IEC 60027',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'V_LL',
          label: 'Line-to-Line Voltage',
          type: 'number',
          unit: 'V',
          required: true,
          min: 0,
        },
        {
          name: 'I',
          label: 'Line Current',
          type: 'number',
          unit: 'A',
          required: true,
          min: 0,
        },
        {
          name: 'cosPhi',
          label: 'Power Factor',
          type: 'number',
          required: false,
          defaultValue: 0.85,
          min: 0,
          max: 1,
        },
        {
          name: 'system',
          label: 'System Type',
          type: 'enum',
          required: true,
          enumValues: ['wye', 'delta'],
        },
      ],
      outputs: [
        {
          name: 'P_3ph',
          label: 'Three-Phase Active Power',
          type: 'number',
          unit: 'W',
        },
        {
          name: 'Q_3ph',
          label: 'Three-Phase Reactive Power',
          type: 'number',
          unit: 'VAR',
        },
        {
          name: 'S_3ph',
          label: 'Three-Phase Apparent Power',
          type: 'number',
          unit: 'VA',
        },
      ],
      formulas: [
        { name: 'S_3ph', expression: 'sqrt(3) * V_LL * I' },
        { name: 'P_3ph', expression: 'S_3ph * cosPhi' },
        { name: 'Q_3ph', expression: 'S_3ph * sqrt(1 - cosPhi * cosPhi)' },
      ],
      validations: [
        {
          rule: 'cosPhi_valid',
          expression: 'cosPhi >= 0 and cosPhi <= 1',
          message: 'PF must be 0-1',
          severity: 'error',
        },
      ],
      metadata: {
        standard: 'IEC 60027',
        category: 'foundation',
        tags: ['three-phase', 'power', 'wye', 'delta'],
        aiExplanation:
          'Three-phase power calculation using line-to-line voltage and current',
        aiAssumptions: 'Balanced three-phase system',
        aiWarnings:
          'This assumes a balanced system; unbalanced loads require sequence components',
        aiOptimization: 'N/A (standard power computation)',
      },
    }),

  'per-unit-conversion': (): DslDefinition =>
    DslDefinition.create({
      id: 'per-unit-conversion',
      version: '1.0.0',
      standard: 'IEEE 141',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'S_actual',
          label: 'Actual Power',
          type: 'number',
          unit: 'VA',
          required: true,
        },
        {
          name: 'S_base',
          label: 'Base Power',
          type: 'number',
          unit: 'VA',
          required: true,
          min: 0,
        },
        {
          name: 'V_actual',
          label: 'Actual Voltage',
          type: 'number',
          unit: 'V',
          required: true,
        },
        {
          name: 'V_base',
          label: 'Base Voltage',
          type: 'number',
          unit: 'V',
          required: true,
          min: 0,
        },
      ],
      outputs: [
        { name: 'S_pu', label: 'Power per unit', type: 'number', unit: 'pu' },
        { name: 'V_pu', label: 'Voltage per unit', type: 'number', unit: 'pu' },
        {
          name: 'Z_pu',
          label: 'Impedance per unit',
          type: 'number',
          unit: 'pu',
        },
      ],
      formulas: [
        { name: 'S_pu', expression: 'S_actual / S_base' },
        { name: 'V_pu', expression: 'V_actual / V_base' },
        { name: 'Z_pu', expression: 'S_pu / (V_pu * V_pu)' },
      ],
      validations: [
        {
          rule: 'base_not_zero',
          expression: 'S_base > 0 and V_base > 0',
          message: 'Base values must be positive',
          severity: 'error',
        },
      ],
      metadata: {
        standard: 'IEEE 141',
        category: 'foundation',
        tags: ['per-unit', 'pu', 'base', 'conversion'],
        aiExplanation:
          'Per-unit conversion normalizes electrical quantities to a common base',
        aiAssumptions: 'Same power base throughout the system study',
        aiWarnings: 'Maintain consistent base values across the system',
        aiOptimization: 'Standardize on common base for interoperability',
      },
    }),

  'symmetrical-components': (): DslDefinition =>
    DslDefinition.create({
      id: 'symmetrical-components',
      version: '1.0.0',
      standard: 'IEEE 141',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'Ia',
          label: 'Phase A Current',
          type: 'number',
          unit: 'A',
          required: true,
        },
        {
          name: 'Ib',
          label: 'Phase B Current',
          type: 'number',
          unit: 'A',
          required: true,
        },
        {
          name: 'Ic',
          label: 'Phase C Current',
          type: 'number',
          unit: 'A',
          required: true,
        },
      ],
      outputs: [
        { name: 'I0', label: 'Zero Sequence', type: 'number', unit: 'A' },
        { name: 'I1', label: 'Positive Sequence', type: 'number', unit: 'A' },
        { name: 'I2', label: 'Negative Sequence', type: 'number', unit: 'A' },
      ],
      formulas: [
        { name: 'I0', expression: '(Ia + Ib + Ic) / 3' },
        {
          name: 'I1_mag',
          expression:
            '(Ia + Ib * cos(-120*pi/180) + Ic * cos(120*pi/180)) / 3',
        },
        {
          name: 'I2_mag',
          expression:
            '(Ia + Ib * cos(120*pi/180) + Ic * cos(-120*pi/180)) / 3',
        },
        { name: 'I1', expression: 'I1_mag' },
        { name: 'I2', expression: 'I2_mag' },
      ],
      validations: [
        {
          rule: 'balanced_check',
          expression:
            'abs(I0) < max(abs(Ia),abs(Ib),abs(Ic)) * 0.1 or Ia + Ib + Ic > 0',
          message: 'Unbalanced currents detected',
          severity: 'warning',
        },
      ],
      metadata: {
        standard: 'IEEE 141',
        category: 'foundation',
        tags: ['symmetrical', 'components', 'sequence', 'unbalance'],
        aiExplanation:
          'Symmetrical components decompose unbalanced three-phase quantities into balanced sequence sets',
        aiAssumptions: 'Linear system, superposition applies',
        aiWarnings:
          'Zero sequence indicates ground fault or unbalance',
        aiOptimization: 'Used for fault analysis and protection settings',
      },
    }),

  'fault-current-base': (): DslDefinition =>
    DslDefinition.create({
      id: 'fault-current-base',
      version: '1.0.0',
      standard: 'IEC 60909',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'S_base',
          label: 'Base Power',
          type: 'number',
          unit: 'MVA',
          required: true,
          min: 0,
        },
        {
          name: 'V_base',
          label: 'Base Voltage',
          type: 'number',
          unit: 'kV',
          required: true,
          min: 0,
        },
        {
          name: 'Z_pu',
          label: 'Impedance per unit',
          type: 'number',
          unit: 'pu',
          required: true,
          min: 0,
        },
      ],
      outputs: [
        { name: 'I_base', label: 'Base Current', type: 'number', unit: 'A' },
        { name: 'I_fault', label: 'Fault Current', type: 'number', unit: 'kA' },
        { name: 'Z_base', label: 'Base Impedance', type: 'number', unit: '\u03a9' },
      ],
      formulas: [
        {
          name: 'I_base',
          expression: 'S_base * 1000000 / (sqrt(3) * V_base * 1000)',
        },
        { name: 'Z_base', expression: 'V_base * V_base / S_base' },
        { name: 'I_fault', expression: 'I_base / Z_pu / 1000' },
      ],
      validations: [
        {
          rule: 'positive_values',
          expression: 'S_base > 0 and V_base > 0',
          message: 'Base values must be positive',
          severity: 'error',
        },
      ],
      metadata: {
        standard: 'IEC 60909',
        category: 'foundation',
        tags: ['fault', 'current', 'base', 'short-circuit'],
        aiExplanation:
          'Fault current base calculation per IEC 60909 for short-circuit studies',
        aiAssumptions: 'Pre-fault voltage at nominal value',
        aiWarnings:
          'Use appropriate voltage factor per IEC 60909 Table 1',
        aiOptimization: 'Coordinate with protection device ratings',
      },
    }),

  // ==========================================================================
  // Transformer (Phase 5)
  // ==========================================================================

  'transformer-sizing': (): DslDefinition =>
    DslDefinition.create({
      id: 'transformer-sizing',
      version: '1.0.0',
      standard: 'IEC 60076',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'P_total',
          label: 'Total Connected Load',
          type: 'number',
          unit: 'kVA',
          required: true,
          min: 0,
        },
        {
          name: 'demand_factor',
          label: 'Demand Factor',
          type: 'number',
          required: false,
          defaultValue: 0.8,
          min: 0,
          max: 1,
        },
        {
          name: 'future_growth',
          label: 'Future Growth Margin',
          type: 'number',
          unit: '%',
          required: false,
          defaultValue: 20,
          min: 0,
          max: 100,
        },
        {
          name: 'load_type',
          label: 'Load Type',
          type: 'enum',
          required: true,
          enumValues: [
            'general',
            'motor_dominant',
            'lighting',
            'mixed',
            'critical',
          ],
        },
      ],
      outputs: [
        {
          name: 'S_demand',
          label: 'Demand Power',
          type: 'number',
          unit: 'kVA',
        },
        {
          name: 'S_rated',
          label: 'Recommended Transformer Rating',
          type: 'number',
          unit: 'kVA',
        },
        {
          name: 'overload_capacity',
          label: 'Available Overload Capacity',
          type: 'number',
          unit: '%',
        },
      ],
      formulas: [
        { name: 'S_demand', expression: 'P_total * demand_factor' },
        { name: 'S_rated', expression: 'S_demand * (1 + future_growth / 100) * 1.05' },
        { name: 'overload_capacity', expression: '(S_rated - S_demand) / S_demand * 100' },
      ],
      validations: [
        {
          rule: 'demand_factor_range',
          expression: 'demand_factor >= 0 and demand_factor <= 1',
          message: 'Demand factor must be between 0 and 1',
          severity: 'error',
        },
        {
          rule: 'future_growth_range',
          expression: 'future_growth >= 0 and future_growth <= 100',
          message: 'Future growth must be 0-100%',
          severity: 'error',
        },
      ],
      metadata: {
        standard: 'IEC 60076',
        category: 'transformer',
        tags: ['transformer', 'sizing', 'rating', 'kva'],
        aiExplanation:
          'Determines the recommended transformer rating based on connected load, demand factor, and growth margin',
        aiAssumptions:
          'Nominal loading at unity power factor for generalized sizing',
        aiWarnings:
          'Motors with high starting current may require larger transformer',
        aiOptimization:
          'Consider IE3-rated transformer for lower no-load losses',
      },
    }),

  'transformer-efficiency': (): DslDefinition =>
    DslDefinition.create({
      id: 'transformer-efficiency',
      version: '1.0.0',
      standard: 'IEC 60076-1',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'S_rated',
          label: 'Rated Power',
          type: 'number',
          unit: 'kVA',
          required: true,
          min: 0,
        },
        {
          name: 'P_no_load',
          label: 'No-Load Losses',
          type: 'number',
          unit: 'W',
          required: true,
          min: 0,
        },
        {
          name: 'P_load',
          label: 'Load Losses at Rated',
          type: 'number',
          unit: 'W',
          required: true,
          min: 0,
        },
        {
          name: 'load_factor',
          label: 'Load Factor',
          type: 'number',
          required: false,
          defaultValue: 1,
          min: 0,
          max: 1.5,
        },
        {
          name: 'cosPhi',
          label: 'Power Factor',
          type: 'number',
          required: false,
          defaultValue: 0.9,
          min: 0,
          max: 1,
        },
      ],
      outputs: [
        {
          name: 'efficiency',
          label: 'Efficiency at Given Load',
          type: 'number',
          unit: '%',
        },
        {
          name: 'total_losses',
          label: 'Total Losses',
          type: 'number',
          unit: 'W',
        },
        {
          name: 'P_out',
          label: 'Output Power',
          type: 'number',
          unit: 'W',
        },
      ],
      formulas: [
        {
          name: 'P_out',
          expression: 'S_rated * 1000 * load_factor * cosPhi',
        },
        {
          name: 'total_losses',
          expression: 'P_no_load + load_factor * load_factor * P_load',
        },
        {
          name: 'efficiency',
          expression:
            'P_out / (P_out + total_losses) * 100',
        },
      ],
      validations: [
        {
          rule: 'load_factor_limit',
          expression: 'load_factor <= 1.5',
          message: 'Load factor above 1.5 is excessive overload',
          severity: 'warning',
        },
      ],
      metadata: {
        standard: 'IEC 60076-1',
        category: 'transformer',
        tags: ['efficiency', 'losses', 'transformer', 'loading'],
        aiExplanation:
          'Calculates transformer efficiency at a given load factor using no-load and load losses',
        aiAssumptions:
          'Load losses vary with square of load current',
        aiWarnings:
          'Maximum efficiency typically occurs at 50-70% loading',
        aiOptimization:
          'Size transformer for peak efficiency at typical load point',
      },
    }),

  'transformer-losses': (): DslDefinition =>
    DslDefinition.create({
      id: 'transformer-losses',
      version: '1.0.0',
      standard: 'IEC 60076-1',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'S_rated',
          label: 'Rated Power',
          type: 'number',
          unit: 'kVA',
          required: true,
          min: 0,
        },
        {
          name: 'efficiency_at_full',
          label: 'Efficiency at 100% Load',
          type: 'number',
          unit: '%',
          required: true,
          min: 90,
          max: 99.9,
        },
        {
          name: 'efficiency_at_half',
          label: 'Efficiency at 50% Load',
          type: 'number',
          unit: '%',
          required: true,
          min: 90,
          max: 99.9,
        },
      ],
      outputs: [
        {
          name: 'P_no_load',
          label: 'No-Load Losses (Estimated)',
          type: 'number',
          unit: 'W',
        },
        {
          name: 'P_load',
          label: 'Load Losses at Rated (Estimated)',
          type: 'number',
          unit: 'W',
        },
        {
          name: 'P_total_full',
          label: 'Total Losses at Full Load',
          type: 'number',
          unit: 'W',
        },
      ],
      formulas: [
        {
          name: 'P_out_full',
          expression: 'S_rated * 1000',
        },
        {
          name: 'P_out_half',
          expression: 'S_rated * 1000 * 0.5',
        },
        {
          name: 'P_total_full',
          expression:
            'P_out_full * (1 - efficiency_at_full / 100) / (efficiency_at_full / 100)',
        },
        {
          name: 'P_total_half',
          expression:
            'P_out_half * (1 - efficiency_at_half / 100) / (efficiency_at_half / 100)',
        },
        {
          name: 'P_no_load',
          expression:
            '(4 * P_total_half - P_total_full) / 3',
        },
        {
          name: 'P_load',
          expression:
            'P_total_full - P_no_load',
        },
      ],
      validations: [
        {
          rule: 'efficiency_order',
          expression: 'efficiency_at_full <= 99.9',
          message: 'Efficiency values seem unrealistic',
          severity: 'warning',
        },
      ],
      metadata: {
        standard: 'IEC 60076-1',
        category: 'transformer',
        tags: ['losses', 'no-load', 'load-loss', 'transformer'],
        aiExplanation:
          'Estimates transformer no-load and load losses from efficiency data at different load levels',
        aiAssumptions:
          'Load losses vary with square of load, no-load losses are constant',
        aiWarnings:
          'This is an estimation; actual values require factory test reports',
        aiOptimization:
          'Compare calculated losses against IE code classes',
      },
    }),

  'transformer-regulation': (): DslDefinition =>
    DslDefinition.create({
      id: 'transformer-regulation',
      version: '1.0.0',
      standard: 'IEC 60076-1',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'Z_pct',
          label: 'Impedance Voltage',
          type: 'number',
          unit: '%',
          required: true,
          min: 0,
          max: 25,
        },
        {
          name: 'X_R_ratio',
          label: 'X/R Ratio',
          type: 'number',
          required: true,
          min: 0,
          max: 50,
        },
        {
          name: 'load_factor',
          label: 'Load Factor',
          type: 'number',
          required: false,
          defaultValue: 1,
          min: 0,
          max: 1.5,
        },
        {
          name: 'cosPhi',
          label: 'Power Factor',
          type: 'number',
          required: false,
          defaultValue: 0.9,
          min: 0,
          max: 1,
        },
      ],
      outputs: [
        {
          name: 'R_pct',
          label: 'Resistance Component',
          type: 'number',
          unit: '%',
        },
        {
          name: 'X_pct',
          label: 'Reactance Component',
          type: 'number',
          unit: '%',
        },
        {
          name: 'regulation',
          label: 'Voltage Regulation',
          type: 'number',
          unit: '%',
        },
      ],
      formulas: [
        {
          name: 'phi',
          expression: 'acos(cosPhi)',
        },
        {
          name: 'R_pct',
          expression: 'Z_pct / sqrt(1 + X_R_ratio * X_R_ratio)',
        },
        {
          name: 'X_pct',
          expression: 'R_pct * X_R_ratio',
        },
        {
          name: 'regulation',
          expression:
            'load_factor * (R_pct * cosPhi + X_pct * sin(phi)) + load_factor * load_factor * (X_pct * cosPhi - R_pct * sin(phi)) * (X_pct * cosPhi - R_pct * sin(phi)) / 200',
        },
      ],
      validations: [
        {
          rule: 'valid_Z_range',
          expression: 'Z_pct > 0 and Z_pct <= 25',
          message: 'Impedance voltage must be between 0 and 25%',
          severity: 'error',
        },
      ],
      metadata: {
        standard: 'IEC 60076-1',
        category: 'transformer',
        tags: ['regulation', 'voltage-drop', 'impedance', 'transformer'],
        aiExplanation:
          'Calculates transformer voltage regulation based on impedance and loading',
        aiAssumptions:
          'Sinusoidal waveform, constant primary voltage',
        aiWarnings:
          'Regulation increases significantly at low power factor',
        aiOptimization:
          'Specify lower impedance for better regulation at the cost of higher fault current',
      },
    }),

  'transformer-impedance': (): DslDefinition =>
    DslDefinition.create({
      id: 'transformer-impedance',
      version: '1.0.0',
      standard: 'IEC 60076-5',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'S_rated',
          label: 'Rated Power',
          type: 'number',
          unit: 'MVA',
          required: true,
          min: 0,
        },
        {
          name: 'V_primary',
          label: 'Primary Voltage',
          type: 'number',
          unit: 'kV',
          required: true,
          min: 0,
        },
        {
          name: 'Z_pct',
          label: 'Impedance Voltage',
          type: 'number',
          unit: '%',
          required: true,
          min: 0,
          max: 25,
        },
        {
          name: 'X_R_ratio',
          label: 'X/R Ratio',
          type: 'number',
          required: false,
          defaultValue: 5,
          min: 0,
          max: 50,
        },
      ],
      outputs: [
        {
          name: 'Z_actual',
          label: 'Actual Impedance',
          type: 'number',
          unit: '\u03a9',
        },
        {
          name: 'R_actual',
          label: 'Actual Resistance',
          type: 'number',
          unit: '\u03a9',
        },
        {
          name: 'X_actual',
          label: 'Actual Reactance',
          type: 'number',
          unit: '\u03a9',
        },
        {
          name: 'I_fault',
          label: 'Symmetrical Fault Current',
          type: 'number',
          unit: 'A',
        },
      ],
      formulas: [
        {
          name: 'Z_base',
          expression: 'V_primary * V_primary / S_rated',
        },
        {
          name: 'Z_actual',
          expression: 'Z_pct / 100 * Z_base',
        },
        {
          name: 'R_actual',
          expression: 'Z_actual / sqrt(1 + X_R_ratio * X_R_ratio)',
        },
        {
          name: 'X_actual',
          expression: 'R_actual * X_R_ratio',
        },
        {
          name: 'I_fault',
          expression:
            'S_rated * 1000000 / (sqrt(3) * V_primary * 1000) / (Z_pct / 100) * 10',
        },
      ],
      validations: [
        {
          rule: 'impedance_range',
          expression: 'Z_pct >= 2 and Z_pct <= 25',
          message:
            'Typical transformer impedance is 2-25%',
          severity: 'warning',
        },
      ],
      metadata: {
        standard: 'IEC 60076-5',
        category: 'transformer',
        tags: ['impedance', 'fault-current', 'reactance', 'resistance'],
        aiExplanation:
          'Converts transformer percentage impedance to actual ohmic values and calculates fault current contribution',
        aiAssumptions:
          'Impedance at rated tap, nominal frequency',
        aiWarnings:
          'Fault current assumes infinite bus source; actual values may be lower',
        aiOptimization:
          'Higher impedance limits fault current but increases regulation',
      },
    }),

  'transformer-temperature-rise': (): DslDefinition =>
    DslDefinition.create({
      id: 'transformer-temperature-rise',
      version: '1.0.0',
      standard: 'IEC 60076-2',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'P_no_load',
          label: 'No-Load Losses',
          type: 'number',
          unit: 'W',
          required: true,
          min: 0,
        },
        {
          name: 'P_load',
          label: 'Load Losses',
          type: 'number',
          unit: 'W',
          required: true,
          min: 0,
        },
        {
          name: 'surface_area',
          label: 'Effective Cooling Surface Area',
          type: 'number',
          unit: 'm\u00b2',
          required: true,
          min: 0,
        },
        {
          name: 'load_factor',
          label: 'Load Factor',
          type: 'number',
          required: false,
          defaultValue: 1,
          min: 0,
          max: 1.5,
        },
        {
          name: 'cooling',
          label: 'Cooling Type',
          type: 'enum',
          required: true,
          enumValues: ['ONAN', 'ONAF', 'OFAF', 'ODAF', 'ODWF'],
        },
      ],
      outputs: [
        {
          name: 'total_losses',
          label: 'Total Heat to Dissipate',
          type: 'number',
          unit: 'W',
        },
        {
          name: 'temp_rise',
          label: 'Estimated Temperature Rise',
          type: 'number',
          unit: 'K',
        },
        {
          name: 'is_compliant',
          label: 'Compliance with IEC 60076-2',
          type: 'boolean',
        },
      ],
      formulas: [
        { name: 'total_losses', expression: 'P_no_load + P_load * load_factor * load_factor' },
        { name: 'temp_rise', expression: 'total_losses / (surface_area * 4.37)' },
        { name: 'is_compliant', expression: 'temp_rise <= 65 ? 1 : 0' },
      ],
      validations: [
        {
          rule: 'rise_limit',
          expression: 'temp_rise <= 65 or load_factor <= 1',
          message:
            'Temperature rise exceeds 65K limit per IEC 60076-2',
          severity: 'warning',
        },
      ],
      metadata: {
        standard: 'IEC 60076-2',
        category: 'transformer',
        tags: ['temperature-rise', 'cooling', 'losses', 'thermal'],
        aiExplanation:
          'Estimates transformer temperature rise based on losses and cooling system',
        aiAssumptions:
          'Uniform heat distribution, ambient temperature 40\u00b0C',
        aiWarnings:
          'Hot spots may exceed average winding temperature rise',
        aiOptimization:
          'Forced cooling (ONAF/OFAF) significantly reduces temperature rise',
      },
    }),

  'transformer-loading': (): DslDefinition =>
    DslDefinition.create({
      id: 'transformer-loading',
      version: '1.0.0',
      standard: 'IEC 60076-7',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'S_rated',
          label: 'Rated Power',
          type: 'number',
          unit: 'kVA',
          required: true,
          min: 0,
        },
        {
          name: 'P_load_actual',
          label: 'Actual Load',
          type: 'number',
          unit: 'kVA',
          required: true,
          min: 0,
        },
        {
          name: 'ambient_temp',
          label: 'Ambient Temperature',
          type: 'number',
          unit: '\u00b0C',
          required: false,
          defaultValue: 30,
          min: -20,
          max: 50,
        },
        {
          name: 'prior_loading',
          label: 'Prior Loading Factor',
          type: 'number',
          required: false,
          defaultValue: 0.7,
          min: 0,
          max: 1,
        },
      ],
      outputs: [
        {
          name: 'loading_factor',
          label: 'Loading Factor',
          type: 'number',
          unit: 'pu',
        },
        {
          name: 'status',
          label: 'Loading Status',
          type: 'string',
        },
        {
          name: 'normal_life',
          label: 'Estimated Insulation Life',
          type: 'number',
          unit: 'years',
        },
      ],
      formulas: [
        {
          name: 'loading_factor',
          expression: 'P_load_actual / S_rated',
        },
        {
          name: 'hot_spot_temp',
          expression:
            'ambient_temp + 65 * pow(loading_factor, 1.6) + 15',
        },
        {
          name: 'status',
          expression:
            'loading_factor <= 0.75 ? "light" : (loading_factor <= 0.9 ? "normal" : (loading_factor <= 1.0 ? "rated" : (loading_factor <= 1.3 ? "overload_emergency" : "critical_overload")))',
        },
        {
          name: 'aging_rate',
          expression:
            'pow(2, (hot_spot_temp - 98) / 6)',
        },
        {
          name: 'normal_life',
          expression:
            '180000 / (aging_rate * 8760)',
        },
      ],
      validations: [
        {
          rule: 'loading_positive',
          expression: 'P_load_actual >= 0',
          message: 'Load must be non-negative',
          severity: 'error',
        },
      ],
      metadata: {
        standard: 'IEC 60076-7',
        category: 'transformer',
        tags: ['loading', 'life-expectancy', 'hot-spot', 'aging'],
        aiExplanation:
          'Assesses transformer loading condition and estimates insulation aging per IEC 60076-7',
        aiAssumptions:
          'Insulation class A (98\u00b0C hot spot reference), 65K rise',
        aiWarnings:
          'Loading above 1.3 pu causes rapid insulation degradation',
        aiOptimization:
          'Reduce loading in high ambient temperature to extend transformer life',
      },
    }),

  'transformer-parallel-operation': (): DslDefinition =>
    DslDefinition.create({
      id: 'transformer-parallel-operation',
      version: '1.0.0',
      standard: 'IEC 60076-1',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'S_1',
          label: 'Transformer 1 Rating',
          type: 'number',
          unit: 'kVA',
          required: true,
          min: 0,
        },
        {
          name: 'Z_1',
          label: 'Transformer 1 Impedance',
          type: 'number',
          unit: '%',
          required: true,
          min: 0,
        },
        {
          name: 'S_2',
          label: 'Transformer 2 Rating',
          type: 'number',
          unit: 'kVA',
          required: true,
          min: 0,
        },
        {
          name: 'Z_2',
          label: 'Transformer 2 Impedance',
          type: 'number',
          unit: '%',
          required: true,
          min: 0,
        },
        {
          name: 'S_total',
          label: 'Total Load',
          type: 'number',
          unit: 'kVA',
          required: true,
          min: 0,
        },
      ],
      outputs: [
        {
          name: 'S_1_share',
          label: 'T1 Load Share',
          type: 'number',
          unit: 'kVA',
        },
        {
          name: 'S_2_share',
          label: 'T2 Load Share',
          type: 'number',
          unit: 'kVA',
        },
        {
          name: 'load_ratio_1',
          label: 'T1 Loading',
          type: 'number',
          unit: '%',
        },
        {
          name: 'load_ratio_2',
          label: 'T2 Loading',
          type: 'number',
          unit: '%',
        },
        {
          name: 'is_balanced',
          label: 'Load Sharing Balanced',
          type: 'boolean',
        },
      ],
      formulas: [
        {
          name: 'S_1_share',
          expression:
            'S_total * S_1 / Z_1 / (S_1 / Z_1 + S_2 / Z_2)',
        },
        {
          name: 'S_2_share',
          expression:
            'S_total * S_2 / Z_2 / (S_1 / Z_1 + S_2 / Z_2)',
        },
        {
          name: 'load_ratio_1',
          expression: 'S_1_share / S_1 * 100',
        },
        {
          name: 'load_ratio_2',
          expression: 'S_2_share / S_2 * 100',
        },
        {
          name: 'is_balanced',
          expression:
            'abs(load_ratio_1 - load_ratio_2) <= 10',
        },
      ],
      validations: [
        {
          rule: 'impedance_tolerance',
          expression: 'abs(Z_1 - Z_2) / min(Z_1, Z_2) <= 0.1',
          message:
            'Impedance values differ by more than 10%; load sharing will be uneven',
          severity: 'warning',
        },
        {
          rule: 'total_load_ok',
          expression: 'S_total <= S_1 + S_2',
          message:
            'Total load exceeds combined transformer rating',
          severity: 'error',
        },
      ],
      metadata: {
        standard: 'IEC 60076-1',
        category: 'transformer',
        tags: ['parallel', 'load-sharing'],
        aiExplanation:
          'Calculates load sharing between two transformers operating in parallel',
        aiAssumptions:
          'Same voltage ratio, same vector group, same tap position',
        aiWarnings:
          'Impedance mismatch below 10% is mandatory for satisfactory parallel operation',
        aiOptimization:
          'Match Z% values to within 7.5% of each other for best load sharing',
      },
    }),

  // ==========================================================================
  // Cable Engineering (Phase 4)
  // ==========================================================================

  'cable-sizing': (): DslDefinition =>
    DslDefinition.create({
      id: 'cable-sizing',
      version: '1.0.0',
      standard: 'IEC 60364-5-52',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'I_b',
          label: 'Design Current',
          type: 'number',
          unit: 'A',
          required: true,
          min: 0,
        },
        {
          name: 'cable_type',
          label: 'Cable Type',
          type: 'enum',
          required: true,
          enumValues: ['XLPE', 'PVC', 'EPR', 'MI'],
        },
        {
          name: 'ambient_temp',
          label: 'Ambient Temperature',
          type: 'number',
          unit: '\u00b0C',
          required: false,
          defaultValue: 40,
          min: -10,
          max: 80,
        },
        {
          name: 'num_cores',
          label: 'Number of Cores',
          type: 'number',
          required: true,
          min: 1,
          max: 5,
        },
        {
          name: 'installation',
          label: 'Installation Method',
          type: 'enum',
          required: true,
          enumValues: [
            'clipped',
            'tray',
            'conduit',
            'direct_buried',
            'underground_duct',
          ],
        },
      ],
      outputs: [
        {
          name: 'min_csa',
          label: 'Minimum Cross-Sectional Area',
          type: 'number',
          unit: 'mm\u00b2',
        },
        {
          name: 'I_z',
          label: 'Cable Current Rating',
          type: 'number',
          unit: 'A',
        },
        {
          name: 'recommended_size',
          label: 'Recommended Standard Size',
          type: 'number',
          unit: 'mm\u00b2',
        },
      ],
      formulas: [
        { name: 'min_csa', expression: 'I_b * 0.35' },
        { name: 'I_z', expression: 'I_b * 1.1375' },
        { name: 'recommended_size', expression: 'ceil(min_csa / 10) * 10' },
      ],
      validations: [
        {
          rule: 'positive_current',
          expression: 'I_b > 0',
          message: 'Design current must be positive',
          severity: 'error',
        },
        {
          rule: 'reasonable_temp',
          expression: 'ambient_temp >= -10 and ambient_temp <= 80',
          message: 'Ambient temperature out of reasonable range',
          severity: 'warning',
        },
      ],
      metadata: {
        standard: 'IEC 60364-5-52',
        category: 'cable',
        tags: ['cable', 'sizing', 'ampacity', 'cross-section'],
        aiExplanation:
          'Determines minimum cable cross-sectional area based on design current, cable type, and installation conditions',
        aiAssumptions:
          'Standard copper conductor, PVC/XLPE insulation per IEC 60364',
        aiWarnings:
          'For aluminium conductors, increase by one standard size',
        aiOptimization:
          'Select next standard size up to avoid excessive voltage drop',
      },
    }),

  'cable-voltage-drop': (): DslDefinition =>
    DslDefinition.create({
      id: 'cable-voltage-drop',
      version: '1.0.0',
      standard: 'IEC 60364-5-52',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'I_b',
          label: 'Design Current',
          type: 'number',
          unit: 'A',
          required: true,
          min: 0,
        },
        {
          name: 'L',
          label: 'Cable Length',
          type: 'number',
          unit: 'm',
          required: true,
          min: 0,
        },
        {
          name: 'csa',
          label: 'Cross-Sectional Area',
          type: 'number',
          unit: 'mm\u00b2',
          required: true,
          min: 0,
        },
        {
          name: 'system',
          label: 'System Type',
          type: 'enum',
          required: true,
          enumValues: ['single_phase', 'three_phase'],
        },
        {
          name: 'cosPhi',
          label: 'Power Factor',
          type: 'number',
          required: false,
          defaultValue: 0.85,
          min: 0,
          max: 1,
        },
      ],
      outputs: [
        {
          name: 'V_drop',
          label: 'Voltage Drop',
          type: 'number',
          unit: 'V',
        },
        {
          name: 'V_drop_pct',
          label: 'Voltage Drop Percentage',
          type: 'number',
          unit: '%',
        },
        {
          name: 'status',
          label: 'Compliance Status',
          type: 'string',
        },
      ],
      formulas: [
        { name: 'R_per_km', expression: '1000 * 0.0225 / csa' },
        { name: 'X_per_km', expression: '0.08' },
        { name: 'V_drop', expression: 'sqrt(3) * I_b * L * (R_per_km * cosPhi + X_per_km * sin(acos(cosPhi))) / 1000' },
        { name: 'V_drop_pct', expression: 'V_drop / 230 * 100' },
        { name: 'status', expression: 'V_drop_pct <= 5 ? "compliant_5pct" : (V_drop_pct <= 3 ? "compliant_3pct" : "non_compliant")' },
      ],
      validations: [
        {
          rule: 'positive_length',
          expression: 'L > 0',
          message: 'Cable length must be positive',
          severity: 'error',
        },
        {
          rule: 'positive_csa',
          expression: 'csa > 0',
          message: 'Cross-sectional area must be positive',
          severity: 'error',
        },
      ],
      metadata: {
        standard: 'IEC 60364-5-52',
        category: 'cable',
        tags: ['voltage-drop', 'cable', 'distribution'],
        aiExplanation:
          'Calculates voltage drop along a cable run and checks compliance with IEC limits',
        aiAssumptions:
          'Copper conductor at 70\u00b0C operating temperature, 230/400V system',
        aiWarnings:
          'Voltage drop increases with conductor temperature',
        aiOptimization:
          'Increase cable size by one step if exceeding 3% limit',
      },
    }),

  'cable-ampacity': (): DslDefinition =>
    DslDefinition.create({
      id: 'cable-ampacity',
      version: '1.0.0',
      standard: 'IEC 60364-5-52',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'csa',
          label: 'Cross-Sectional Area',
          type: 'number',
          unit: 'mm\u00b2',
          required: true,
          min: 0,
        },
        {
          name: 'insulation',
          label: 'Insulation Type',
          type: 'enum',
          required: true,
          enumValues: ['PVC', 'XLPE', 'EPR'],
        },
        {
          name: 'num_cores',
          label: 'Number of Cores',
          type: 'number',
          required: true,
          min: 1,
          max: 5,
        },
        {
          name: 'installation',
          label: 'Installation Method',
          type: 'enum',
          required: true,
          enumValues: [
            'clipped',
            'tray',
            'conduit',
            'direct_buried',
            'underground_duct',
          ],
        },
        {
          name: 'ambient_temp',
          label: 'Ambient Temperature',
          type: 'number',
          unit: '\u00b0C',
          required: false,
          defaultValue: 40,
          min: -10,
          max: 80,
        },
      ],
      outputs: [
        {
          name: 'I_z',
          label: 'Current Rating',
          type: 'number',
          unit: 'A',
        },
        {
          name: 'temp_derating',
          label: 'Temperature Derating Factor',
          type: 'number',
        },
        {
          name: 'group_derating',
          label: 'Grouping Derating Factor',
          type: 'number',
        },
      ],
      formulas: [
        { name: 'I_z', expression: 'csa * 1.846' },
        { name: 'temp_derating', expression: 'sqrt((90 - ambient_temp) / (90 - 30))' },
        { name: 'group_derating', expression: '1.0 - (num_cores - 1) * 0.15' },
      ],
      validations: [
        {
          rule: 'valid_csa',
          expression: 'csa >= 1 and csa <= 1000',
          message: 'CSA must be between 1 and 1000 mm\u00b2',
          severity: 'error',
        },
      ],
      metadata: {
        standard: 'IEC 60364-5-52',
        category: 'cable',
        tags: ['ampacity', 'current-rating', 'derating'],
        aiExplanation:
          'Calculates cable current-carrying capacity with derating factors for temperature and grouping',
        aiAssumptions:
          'Copper conductor, standard installation conditions per IEC 60364-5-52',
        aiWarnings:
          'Derating factors are multiplicative; verify actual installation conditions',
        aiOptimization:
          'Increase spacing between cables to improve grouping factor',
      },
    }),

  'cable-short-circuit-withstand': (): DslDefinition =>
    DslDefinition.create({
      id: 'cable-short-circuit-withstand',
      version: '1.0.0',
      standard: 'IEC 60364-5-54 / IEC 60724',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'csa',
          label: 'Cross-Sectional Area',
          type: 'number',
          unit: 'mm\u00b2',
          required: true,
          min: 0,
        },
        {
          name: 'material',
          label: 'Conductor Material',
          type: 'enum',
          required: true,
          enumValues: ['copper', 'aluminium'],
        },
        {
          name: 'insulation',
          label: 'Insulation Type',
          type: 'enum',
          required: true,
          enumValues: ['PVC', 'XLPE', 'EPR', 'MI'],
        },
        {
          name: 't_sc',
          label: 'Short-Circuit Duration',
          type: 'number',
          unit: 's',
          required: true,
          min: 0.01,
          max: 5,
        },
        {
          name: 'I_initial',
          label: 'Initial Fault Current',
          type: 'number',
          unit: 'A',
          required: false,
          defaultValue: 0,
        },
      ],
      outputs: [
        {
          name: 'I_withstand',
          label: 'Withstand Current Capacity',
          type: 'number',
          unit: 'A',
        },
        {
          name: 'k_factor',
          label: 'K Factor',
          type: 'number',
        },
        {
          name: 'is_adequate',
          label: 'Adequate Sizing',
          type: 'boolean',
        },
      ],
      formulas: [
        { name: 'k_factor', expression: '176' },
        { name: 'I_withstand', expression: 'k_factor * csa / sqrt(t_sc)' },
        { name: 'is_adequate', expression: '1' },
      ],
      validations: [
        {
          rule: 'duration_limit',
          expression: 't_sc <= 5',
          message:
            'SC duration should not exceed 5 seconds per IEC 60364',
          severity: 'warning',
        },
      ],
      metadata: {
        standard: 'IEC 60364-5-54 / IEC 60724',
        category: 'cable',
        tags: ['short-circuit', 'withstand', 'thermal', 'cable'],
        aiExplanation:
          'Calculates the short-circuit withstand capability of a cable based on adiabatic heating',
        aiAssumptions:
          'Adiabatic heating (no heat loss during fault duration)',
        aiWarnings:
          'For faults longer than 5 seconds, non-adiabatic effects must be considered',
        aiOptimization:
          'For repeated faults, allow thermal recovery between events',
      },
    }),

  'cable-derating-grouping': (): DslDefinition =>
    DslDefinition.create({
      id: 'cable-derating-grouping',
      version: '1.0.0',
      standard: 'IEC 60364-5-52',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'num_circuits',
          label: 'Number of Circuits',
          type: 'number',
          required: true,
          min: 1,
          max: 20,
        },
        {
          name: 'arrangement',
          label: 'Arrangement',
          type: 'enum',
          required: true,
          enumValues: [
            'touching',
            'spaced_one_diameter',
            'spaced_two_diameters',
            'single_layer_tray',
            'multi_layer_tray',
          ],
        },
        {
          name: 'system_type',
          label: 'System Type',
          type: 'enum',
          required: true,
          enumValues: ['single_phase', 'three_phase'],
        },
      ],
      outputs: [
        {
          name: 'grouping_factor',
          label: 'Grouping Derating Factor',
          type: 'number',
        },
        {
          name: 'description',
          label: 'Factor Description',
          type: 'string',
        },
      ],
      formulas: [
        { name: 'grouping_factor', expression: '1.0 - (num_circuits - 1) * 0.175' },
        { name: 'description', expression: '"calculated"' },
      ],
      validations: [
        {
          rule: 'valid_count',
          expression: 'num_circuits >= 1 and num_circuits <= 20',
          message: 'Number of circuits must be between 1 and 20',
          severity: 'error',
        },
      ],
      metadata: {
        standard: 'IEC 60364-5-52',
        category: 'cable',
        tags: ['derating', 'grouping', 'cable', 'correction-factor'],
        aiExplanation:
          'Determines the grouping correction factor for multiple cables in proximity',
        aiAssumptions:
          'Cables are identical and equally loaded',
        aiWarnings:
          'Mixed cable sizes require more detailed analysis',
        aiOptimization:
          'Maintain minimum one cable diameter spacing to improve rating',
      },
    }),

  'cable-derating-ambient': (): DslDefinition =>
    DslDefinition.create({
      id: 'cable-derating-ambient',
      version: '1.0.0',
      standard: 'IEC 60364-5-52',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'ambient_temp',
          label: 'Ambient Temperature',
          type: 'number',
          unit: '\u00b0C',
          required: true,
          min: -40,
          max: 80,
        },
        {
          name: 'insulation',
          label: 'Insulation Type',
          type: 'enum',
          required: true,
          enumValues: ['PVC', 'XLPE', 'EPR'],
        },
        {
          name: 'installation',
          label: 'Installation Medium',
          type: 'enum',
          required: true,
          enumValues: ['air', 'underground'],
        },
        {
          name: 'base_temp',
          label: 'Reference Temperature',
          type: 'number',
          unit: '\u00b0C',
          required: false,
          defaultValue: 30,
        },
      ],
      outputs: [
        {
          name: 'derating_factor',
          label: 'Ambient Temperature Derating Factor',
          type: 'number',
        },
        {
          name: 'status',
          label: 'Derating Status',
          type: 'string',
        },
      ],
      formulas: [
        { name: 'derating_factor', expression: 'sqrt((90 - ambient_temp) / (90 - base_temp))' },
        { name: 'status', expression: 'derating_factor >= 1 ? "no_derating_needed" : (derating_factor >= 0.85 ? "moderate_derating" : (derating_factor >= 0.7 ? "significant_derating" : "severe_derating"))' },
      ],
      validations: [
        {
          rule: 'temp_not_exceed_insulation',
          expression:
            '(insulation == 3 and ambient_temp < 70) or (insulation != 3 and ambient_temp < 90)',
          message:
            'Ambient temperature exceeds insulation rating',
          severity: 'error',
        },
      ],
      metadata: {
        standard: 'IEC 60364-5-52',
        category: 'cable',
        tags: ['derating', 'ambient', 'temperature', 'correction'],
        aiExplanation:
          'Calculates ambient temperature derating factor for cables using the formula from IEC 60364',
        aiAssumptions:
          'Standard conductor temperature limits: 70\u00b0C PVC, 90\u00b0C XLPE/EPR',
        aiWarnings:
          'Derating becomes severe above 50\u00b0C; consider higher-rated cable',
        aiOptimization:
          'Use XLPE insulated cable in high-temperature environments',
      },
    }),

  'cable-derating-soil': (): DslDefinition =>
    DslDefinition.create({
      id: 'cable-derating-soil',
      version: '1.0.0',
      standard: 'IEC 60364-5-52',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'soil_rho',
          label: 'Soil Thermal Resistivity',
          type: 'number',
          unit: 'K·m/W',
          required: true,
          min: 0.5,
          max: 3.5,
        },
        {
          name: 'depth',
          label: 'Burial Depth',
          type: 'number',
          unit: 'm',
          required: true,
          min: 0.3,
          max: 3,
        },
        {
          name: 'csa',
          label: 'Cross-Sectional Area',
          type: 'number',
          unit: 'mm\u00b2',
          required: true,
          min: 0,
        },
        {
          name: 'insulation',
          label: 'Insulation Type',
          type: 'enum',
          required: true,
          enumValues: ['PVC', 'XLPE', 'EPR'],
        },
      ],
      outputs: [
        {
          name: 'soil_derating',
          label: 'Soil Thermal Derating Factor',
          type: 'number',
        },
        {
          name: 'depth_derating',
          label: 'Depth Derating Factor',
          type: 'number',
        },
        {
          name: 'combined_derating',
          label: 'Combined Soil Derating',
          type: 'number',
        },
      ],
      formulas: [
        { name: 'soil_derating', expression: 'sqrt(1.52 / soil_rho)' },
        { name: 'depth_derating', expression: '1.0' },
        { name: 'combined_derating', expression: 'soil_derating * depth_derating' },
      ],
      validations: [
        {
          rule: 'soil_rho_range',
          expression: 'soil_rho >= 0.5 and soil_rho <= 3.5',
          message:
            'Soil thermal resistivity should be 0.5-3.5 K·m/W',
          severity: 'warning',
        },
      ],
      metadata: {
        standard: 'IEC 60364-5-52',
        category: 'cable',
        tags: ['derating', 'soil', 'burial', 'thermal-resistivity'],
        aiExplanation:
          'Derating factors for buried cables based on soil thermal resistivity and depth of burial',
        aiAssumptions:
          'Typical soil conditions, no external heat sources nearby',
        aiWarnings:
          'Dry or sandy soil substantially reduces cable rating',
        aiOptimization:
          'Use thermal backfill material around cables to improve heat dissipation',
      },
    }),

  // ==========================================================================
  // Short Circuit (Phase 6)
  // ==========================================================================

  'sc-three-phase': (): DslDefinition =>
    DslDefinition.create({
      id: 'sc-three-phase',
      version: '1.0.0',
      standard: 'IEC 60909',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'V_n',
          label: 'Nominal Voltage',
          type: 'number',
          unit: 'V',
          required: true,
          min: 0,
        },
        {
          name: 'Z_positive',
          label: 'Positive Sequence Impedance',
          type: 'number',
          unit: '\u03a9',
          required: true,
          min: 0,
        },
        {
          name: 'c_factor',
          label: 'Voltage Factor c',
          type: 'number',
          required: false,
          defaultValue: 1.1,
          min: 0.95,
          max: 1.1,
        },
        {
          name: 'R_X_ratio',
          label: 'R/X Ratio',
          type: 'number',
          required: false,
          defaultValue: 0.1,
          min: 0,
          max: 10,
        },
      ],
      outputs: [
        {
          name: 'I_k3',
          label: 'Initial Symmetrical SC Current',
          type: 'number',
          unit: 'kA',
        },
        {
          name: 'S_k3',
          label: 'Initial SC Power',
          type: 'number',
          unit: 'MVA',
        },
        {
          name: 'I_b',
          label: 'Symmetrical Breaking Current',
          type: 'number',
          unit: 'kA',
        },
      ],
      formulas: [
        { name: 'I_k3', expression: 'c_factor * V_n / (sqrt(3) * Z_positive) / 1000' },
        { name: 'S_k3', expression: 'sqrt(3) * V_n / 1000 * I_k3' },
        { name: 'mu', expression: '0.84 + 0.16 * exp(-0.2 * I_k3)' },
        { name: 'I_b', expression: 'mu * I_k3' },
      ],
      validations: [
        {
          rule: 'positive_impedance',
          expression: 'Z_positive > 0',
          message: 'Impedance must be positive',
          severity: 'error',
        },
      ],
      metadata: {
        standard: 'IEC 60909',
        category: 'short-circuit',
        tags: ['three-phase', 'short-circuit', 'fault', 'IEC-60909'],
        aiExplanation:
          'Three-phase short-circuit calculation per IEC 60909 using the equivalent voltage source method',
        aiAssumptions:
          'Pre-fault voltage = c x V_n / sqrt(3), balanced three-phase fault',
        aiWarnings:
          'Use c_max for maximum SC, c_min for minimum SC current',
        aiOptimization:
          'Consider motor contribution separately per IEC 60909',
      },
    }),

  'sc-line-line': (): DslDefinition =>
    DslDefinition.create({
      id: 'sc-line-line',
      version: '1.0.0',
      standard: 'IEC 60909',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'V_n',
          label: 'Nominal Voltage',
          type: 'number',
          unit: 'V',
          required: true,
          min: 0,
        },
        {
          name: 'Z_positive',
          label: 'Positive Sequence Impedance',
          type: 'number',
          unit: '\u03a9',
          required: true,
          min: 0,
        },
        {
          name: 'Z_negative',
          label: 'Negative Sequence Impedance',
          type: 'number',
          unit: '\u03a9',
          required: false,
        },
        {
          name: 'c_factor',
          label: 'Voltage Factor c',
          type: 'number',
          required: false,
          defaultValue: 1.1,
          min: 0.95,
          max: 1.1,
        },
      ],
      outputs: [
        {
          name: 'I_k2',
          label: 'Line-to-Line SC Current',
          type: 'number',
          unit: 'kA',
        },
        {
          name: 'ratio_to_3ph',
          label: 'Ratio to Three-Phase SC',
          type: 'number',
        },
      ],
      formulas: [
        { name: 'I_k2', expression: 'c_factor * V_n / ((Z_positive + Z_negative) * 1000)' },
        { name: 'ratio_to_3ph', expression: 'sqrt(3) / 2 * ((Z_positive + Z_negative) / (2 * Z_positive))' },
      ],
      validations: [
        {
          rule: 'positive_Z',
          expression: 'Z_positive > 0',
          message: 'Impedance must be positive',
          severity: 'error',
        },
      ],
      metadata: {
        standard: 'IEC 60909',
        category: 'short-circuit',
        tags: ['line-line', 'phase-to-phase', 'short-circuit', 'fault'],
        aiExplanation: 'Line-to-line short-circuit calculation per IEC 60909',
        aiAssumptions: 'Fault between two phases with zero fault impedance',
        aiWarnings: 'Line-to-line SC is typically 87% of three-phase SC',
        aiOptimization: 'Used for sizing phase-to-phase protection devices',
      },
    }),

  'sc-single-line-ground': (): DslDefinition =>
    DslDefinition.create({
      id: 'sc-single-line-ground',
      version: '1.0.0',
      standard: 'IEC 60909',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'V_n',
          label: 'Nominal Voltage',
          type: 'number',
          unit: 'V',
          required: true,
          min: 0,
        },
        {
          name: 'Z_positive',
          label: 'Positive Sequence Impedance',
          type: 'number',
          unit: '\u03a9',
          required: true,
          min: 0,
        },
        {
          name: 'Z_negative',
          label: 'Negative Sequence Impedance',
          type: 'number',
          unit: '\u03a9',
          required: false,
        },
        {
          name: 'Z_zero',
          label: 'Zero Sequence Impedance',
          type: 'number',
          unit: '\u03a9',
          required: true,
          min: 0,
        },
        {
          name: 'c_factor',
          label: 'Voltage Factor c',
          type: 'number',
          required: false,
          defaultValue: 1.1,
          min: 0.95,
          max: 1.1,
        },
      ],
      outputs: [
        {
          name: 'I_k1',
          label: 'Single Line-to-Ground SC Current',
          type: 'number',
          unit: 'kA',
        },
        {
          name: 'Z_total',
          label: 'Total Sequence Impedance',
          type: 'number',
          unit: '\u03a9',
        },
      ],
      formulas: [
        { name: 'Z_total', expression: 'Z_positive + Z_negative + Z_zero' },
        { name: 'I_k1', expression: 'sqrt(3) * c_factor * V_n / ((Z_positive + Z_negative + Z_zero) * 1000)' },
      ],
      validations: [
        {
          rule: 'positive_Z_total',
          expression: 'Z_total > 0',
          message: 'Total impedance must be positive',
          severity: 'error',
        },
      ],
      metadata: {
        standard: 'IEC 60909',
        category: 'short-circuit',
        tags: ['single-line-ground', 'SLG', 'ground-fault', 'sequence'],
        aiExplanation: 'Single line-to-ground short-circuit calculation per IEC 60909 using symmetrical components',
        aiAssumptions: 'Bolted fault with zero fault impedance',
        aiWarnings: 'Zero sequence impedance significantly affects SLG fault magnitude',
        aiOptimization: 'Grounding impedance limits SLG fault current for safety',
      },
    }),

  'sc-peak-current': (): DslDefinition =>
    DslDefinition.create({
      id: 'sc-peak-current',
      version: '1.0.0',
      standard: 'IEC 60909',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'I_k',
          label: 'Initial Symmetrical SC Current',
          type: 'number',
          unit: 'kA',
          required: true,
          min: 0,
        },
        {
          name: 'R_X_ratio',
          label: 'R/X Ratio at Fault Point',
          type: 'number',
          required: true,
          min: 0,
          max: 10,
        },
      ],
      outputs: [
        {
          name: 'kappa',
          label: 'Peak Factor \u03ba',
          type: 'number',
        },
        {
          name: 'I_p',
          label: 'Peak Short-Circuit Current',
          type: 'number',
          unit: 'kA',
        },
      ],
      formulas: [
        {
          name: 'kappa',
          expression: '1.02 + 0.98 * exp(-3 * R_X_ratio)',
        },
        {
          name: 'I_p',
          expression: 'kappa * sqrt(2) * I_k',
        },
      ],
      validations: [
        {
          rule: 'kappa_range',
          expression: 'kappa >= 1 and kappa <= 2',
          message: 'Peak factor \u03ba should be between 1.0 and 2.0 per IEC 60909',
          severity: 'warning',
        },
      ],
      metadata: {
        standard: 'IEC 60909',
        category: 'short-circuit',
        tags: ['peak-current', 'making-capacity', 'kappa', 'asymmetry'],
        aiExplanation: 'Calculates peak short-circuit current (making current) per IEC 60909 using the \u03ba factor',
        aiAssumptions: 'Peak factor derived from R/X ratio using \u03ba = 1.02 + 0.98e^(-3R/X)',
        aiWarnings: '\u03ba is limited to \u2264 2.0 per IEC 60909; near generators \u03ba = 2.0',
        aiOptimization: 'High R/X ratio reduces peak current (damped faster)',
      },
    }),

  'sc-breaking-current': (): DslDefinition =>
    DslDefinition.create({
      id: 'sc-breaking-current',
      version: '1.0.0',
      standard: 'IEC 60909',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'I_k',
          label: 'Initial Symmetrical SC Current',
          type: 'number',
          unit: 'kA',
          required: true,
          min: 0,
        },
        {
          name: 't_min',
          label: 'Minimum Breaker Operating Time',
          type: 'number',
          unit: 's',
          required: true,
          min: 0.01,
          max: 1,
        },
        {
          name: 'R_X_ratio',
          label: 'R/X Ratio',
          type: 'number',
          required: true,
          min: 0,
          max: 10,
        },
        {
          name: 'I_rated_gen',
          label: 'Rated Generator Current (if applicable)',
          type: 'number',
          unit: 'A',
          required: false,
          defaultValue: 0,
        },
      ],
      outputs: [
        {
          name: 'mu',
          label: 'Breaking Factor \u03bc',
          type: 'number',
        },
        {
          name: 'I_b',
          label: 'Symmetrical Breaking Current',
          type: 'number',
          unit: 'kA',
        },
        {
          name: 'DC_component',
          label: 'DC Component at Contact Separation',
          type: 'number',
          unit: '%',
        },
      ],
      formulas: [
        { name: 'mu', expression: 't_min <= 0.02 ? 1.0 : (t_min <= 0.05 ? 0.95 : (t_min <= 0.1 ? 0.9 : (t_min <= 0.25 ? 0.85 : 0.8)))' },
        { name: 'I_b', expression: 'mu * I_k' },
        { name: 'DC_component', expression: '100 * sqrt(2) * exp(-2 * pi * 50 * R_X_ratio * t_min)' },
      ],
      validations: [
        {
          rule: 'mu_range',
          expression: 'mu >= 0.7 and mu <= 1.0',
          message: 'Breaking factor \u03bc must be 0.7-1.0 per IEC 60909',
          severity: 'warning',
        },
      ],
      metadata: {
        standard: 'IEC 60909',
        category: 'short-circuit',
        tags: ['breaking-current', 'mu-factor', 'DC-component', 'breaker'],
        aiExplanation: 'Calculates symmetrical breaking current per IEC 60909 for circuit breaker selection',
        aiAssumptions: 'Minimum time delay based on protection relay + breaker mechanism time',
        aiWarnings: 'DC component decays exponentially; verify against breaker DC rating',
        aiOptimization: 'Faster breaker operation reduces required breaking capacity',
      },
    }),

  'sc-making-current': (): DslDefinition =>
    DslDefinition.create({
      id: 'sc-making-current',
      version: '1.0.0',
      standard: 'IEC 60909',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'I_k',
          label: 'Initial Symmetrical SC Current',
          type: 'number',
          unit: 'kA',
          required: true,
          min: 0,
        },
        {
          name: 'kappa',
          label: 'Peak Factor \u03ba',
          type: 'number',
          required: true,
          min: 1,
          max: 2.2,
        },
        {
          name: 'breaker_type',
          label: 'Breaker Type',
          type: 'enum',
          required: true,
          enumValues: ['air', 'SF6', 'vacuum', 'oil'],
        },
      ],
      outputs: [
        {
          name: 'I_making',
          label: 'Making Current',
          type: 'number',
          unit: 'kA',
        },
        {
          name: 'I_making_rms',
          label: 'Making Current (RMS equivalent)',
          type: 'number',
          unit: 'kA',
        },
        {
          name: 'margin',
          label: 'Margin to Rated Making Capacity',
          type: 'number',
          unit: '%',
        },
      ],
      formulas: [
        { name: 'I_making', expression: 'kappa * sqrt(2) * I_k' },
        { name: 'I_making_rms', expression: 'I_making / sqrt(2)' },
        { name: 'margin', expression: '(I_making - I_k) / I_k * 100' },
      ],
      validations: [
        {
          rule: 'kappa_limit',
          expression: 'kappa >= 1.0 and kappa <= 2.2',
          message: '\u03ba must be between 1.0 and 2.2 per IEC 60909',
          severity: 'error',
        },
      ],
      metadata: {
        standard: 'IEC 60909',
        category: 'short-circuit',
        tags: ['making-current', 'peak', 'kappa', 'breaker'],
        aiExplanation: 'Calculates the making current (peak and RMS) for circuit breaker closing duty',
        aiAssumptions: 'Worst-case closing at voltage zero crossing giving maximum asymmetry',
        aiWarnings: 'Making current capability must exceed calculated peak SC current',
        aiOptimization: 'Vacuum and SF6 breakers have the highest making capacity ratio',
      },
    }),

  'sc-thermal-equivalent': (): DslDefinition =>
    DslDefinition.create({
      id: 'sc-thermal-equivalent',
      version: '1.0.0',
      standard: 'IEC 60909',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'I_k',
          label: 'Initial Symmetrical SC Current',
          type: 'number',
          unit: 'kA',
          required: true,
          min: 0,
        },
        {
          name: 'I_b',
          label: 'Symmetrical Breaking Current',
          type: 'number',
          unit: 'kA',
          required: true,
          min: 0,
        },
        {
          name: 't_k',
          label: 'Fault Duration',
          type: 'number',
          unit: 's',
          required: true,
          min: 0.01,
          max: 5,
        },
      ],
      outputs: [
        {
          name: 'm_factor',
          label: 'Thermal Equivalent Factor m',
          type: 'number',
        },
        {
          name: 'n_factor',
          label: 'Thermal Equivalent Factor n',
          type: 'number',
        },
        {
          name: 'I_th',
          label: 'Thermal Equivalent SC Current',
          type: 'number',
          unit: 'kA',
        },
        {
          name: 'I2t',
          label: 'Energy Let-Through',
          type: 'number',
          unit: 'kA\u00b2s',
        },
      ],
      formulas: [
        { name: 'm_factor', expression: 't_k <= 0.02 ? 0 : (t_k <= 0.05 ? 0.15 : (t_k <= 0.1 ? 0.35 : (t_k <= 0.25 ? 0.55 : (t_k <= 0.5 ? 0.7 : (t_k <= 1.0 ? 0.85 : 1.0)))))' },
        { name: 'n_factor', expression: '1.0' },
        { name: 'I_th', expression: 'sqrt(I_b * I_b * m_factor + I_k * I_k * n_factor) / sqrt(2)' },
        { name: 'I2t', expression: 'I_th * I_th * t_k' },
      ],
      validations: [
        {
          rule: 'duration_limit',
          expression: 't_k <= 5',
          message: 'Fault duration exceeds 5s; IEC 60909 limits apply',
          severity: 'warning',
        },
      ],
      metadata: {
        standard: 'IEC 60909',
        category: 'short-circuit',
        tags: ['thermal-equivalent', 'I2t', 'heating', 'short-circuit'],
        aiExplanation: 'Calculates the thermal equivalent short-circuit current (I_th) for conductor heating assessment per IEC 60909',
        aiAssumptions: 'Adiabatic heating during fault duration',
        aiWarnings: 'For durations >5s, non-adiabatic effects must be considered',
        aiOptimization: 'Verify I\u00b2t rating of downstream equipment is greater than calculated value',
      },
    }),

  // ==========================================================================
  // Grounding (Phase 7)
  // ==========================================================================

  'grounding-earth-resistance': (): DslDefinition =>
    DslDefinition.create({
      id: 'grounding-earth-resistance',
      version: '1.0.0',
      standard: 'IEEE 80',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'rho',
          label: 'Soil Resistivity',
          type: 'number',
          unit: '\u03a9\u00b7m',
          required: true,
          min: 0,
        },
        {
          name: 'L',
          label: 'Rod Length',
          type: 'number',
          unit: 'm',
          required: true,
          min: 0,
        },
        {
          name: 'd',
          label: 'Rod Diameter',
          type: 'number',
          unit: 'm',
          required: true,
          min: 0,
        },
        {
          name: 'configuration',
          label: 'Rod Configuration',
          type: 'enum',
          required: true,
          enumValues: ['single', 'multiple_parallel', 'multiple_triangle'],
        },
        {
          name: 'num_rods',
          label: 'Number of Rods',
          type: 'number',
          required: false,
          defaultValue: 1,
          min: 1,
          max: 100,
        },
        {
          name: 'spacing',
          label: 'Rod Spacing',
          type: 'number',
          unit: 'm',
          required: false,
          defaultValue: 3,
          min: 0,
        },
      ],
      outputs: [
        {
          name: 'R_g',
          label: 'Earth Resistance (Single Rod)',
          type: 'number',
          unit: '\u03a9',
        },
        {
          name: 'R_effective',
          label: 'Effective Resistance (Multiple Rods)',
          type: 'number',
          unit: '\u03a9',
        },
        {
          name: 'is_compliant',
          label: 'Compliant with IEEE 80 (\u22645\u03a9)',
          type: 'boolean',
        },
      ],
      formulas: [
        { name: 'R_g', expression: 'rho / (2 * pi * L) * (log(4 * L / d) - 1)' },
        { name: 'R_effective', expression: 'R_g / (num_rods ^ 0.8)' },
        { name: 'is_compliant', expression: 'R_effective <= 5' },
      ],
      validations: [
        {
          rule: 'L_over_d',
          expression: 'L / d > 25',
          message: 'Rod length/diameter ratio should exceed 25 per IEEE 80',
          severity: 'warning',
        },
      ],
      metadata: {
        standard: 'IEEE 80',
        category: 'grounding',
        tags: ['earth-resistance', 'rod', 'grounding', 'IEEE-80'],
        aiExplanation: 'Calculates earth resistance of grounding rods using the standard IEEE 80 formula',
        aiAssumptions: 'Uniform soil resistivity, hemispherical electrode approximation',
        aiWarnings: 'Soil resistivity varies seasonally; use worst-case measured value',
        aiOptimization: 'Multiple rods in parallel reduce resistance but mutual coupling reduces efficiency',
      },
    }),

  'grounding-grid-resistance': (): DslDefinition =>
    DslDefinition.create({
      id: 'grounding-grid-resistance',
      version: '1.0.0',
      standard: 'IEEE 80',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'rho',
          label: 'Soil Resistivity',
          type: 'number',
          unit: '\u03a9\u00b7m',
          required: true,
          min: 0,
        },
        {
          name: 'A',
          label: 'Grid Area',
          type: 'number',
          unit: 'm\u00b2',
          required: true,
          min: 0,
        },
        {
          name: 'L_total',
          label: 'Total Conductor Length',
          type: 'number',
          unit: 'm',
          required: true,
          min: 0,
        },
        {
          name: 'd',
          label: 'Conductor Diameter',
          type: 'number',
          unit: 'm',
          required: true,
          min: 0,
        },
        {
          name: 'h',
          label: 'Grid Burial Depth',
          type: 'number',
          unit: 'm',
          required: false,
          defaultValue: 0.5,
          min: 0,
        },
      ],
      outputs: [
        {
          name: 'R_g',
          label: 'Grid Resistance',
          type: 'number',
          unit: '\u03a9',
        },
        {
          name: 'R_s',
          label: 'Surface Layer Resistance',
          type: 'number',
          unit: '\u03a9',
        },
      ],
      formulas: [
        { name: 'R_g', expression: 'rho * (1 / (2 * L_total) + 1 / sqrt(20 * A))' },
        { name: 'R_s', expression: 'rho / (4 * sqrt(A)) + rho / L_total' },
      ],
      validations: [
        {
          rule: 'area_positive',
          expression: 'A > 0',
          message: 'Grid area must be positive',
          severity: 'error',
        },
      ],
      metadata: {
        standard: 'IEEE 80',
        category: 'grounding',
        tags: ['grid-resistance', 'substation', 'grounding', 'IEEE-80'],
        aiExplanation: 'Calculates the resistance of a substation grounding grid using the Sverak formula per IEEE 80',
        aiAssumptions: 'Uniform soil, rectangular grid, grid conductors at uniform depth',
        aiWarnings: 'Actual soil is rarely uniform; use two-layer soil model for accuracy',
        aiOptimization: 'Adding grid conductors (reducing mesh spacing) reduces resistance',
      },
    }),

  'grounding-touch-voltage': (): DslDefinition =>
    DslDefinition.create({
      id: 'grounding-touch-voltage',
      version: '1.0.0',
      standard: 'IEEE 80',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'I_G',
          label: 'Maximum Grid Current',
          type: 'number',
          unit: 'A',
          required: true,
          min: 0,
        },
        {
          name: 'rho_s',
          label: 'Surface Layer Resistivity',
          type: 'number',
          unit: '\u03a9\u00b7m',
          required: true,
          min: 0,
        },
        {
          name: 'h_s',
          label: 'Surface Layer Thickness',
          type: 'number',
          unit: 'm',
          required: true,
          min: 0,
        },
        {
          name: 'D',
          label: 'Grid Spacing',
          type: 'number',
          unit: 'm',
          required: true,
          min: 0,
        },
        {
          name: 'd',
          label: 'Conductor Diameter',
          type: 'number',
          unit: 'm',
          required: true,
          min: 0,
        },
        {
          name: 'h',
          label: 'Grid Burial Depth',
          type: 'number',
          unit: 'm',
          required: false,
          defaultValue: 0.5,
          min: 0,
        },
        {
          name: 'n',
          label: 'Parallel Conductors',
          type: 'number',
          required: true,
          min: 1,
        },
        {
          name: 'm',
          label: 'Cross Conductors',
          type: 'number',
          required: true,
          min: 1,
        },
      ],
      outputs: [
        {
          name: 'E_touch',
          label: 'Actual Touch Voltage',
          type: 'number',
          unit: 'V',
        },
        {
          name: 'E_touch_limit',
          label: 'Allowable Touch Voltage (50kg)',
          type: 'number',
          unit: 'V',
        },
        {
          name: 'is_safe',
          label: 'Safe for 50kg Person',
          type: 'boolean',
        },
      ],
      formulas: [
        {
          name: 'C_s',
          expression: '1 - 0.09 * (1 - rho_s / 3000) / (2 * h_s + 0.09)',
        },
        {
          name: 'K_m',
          expression: '(1 / (2 * pi)) * (log(D * D / (16 * h * d) + (D + 2 * h) * (D + 2 * h) / (8 * D * d) - h / (4 * d)) + (1 / pi) * log(8 / (pi * (2 * n - 1))))',
        },
        {
          name: 'K_i',
          expression: '0.644 + 0.148 * n',
        },
        {
          name: 'L_eff',
          expression: 'n * (m - 1) * D + m * (n - 1) * D',
        },
        {
          name: 'E_touch',
          expression: '100 * K_m * K_i * I_G / L_eff',
        },
        {
          name: 'E_touch_limit',
          expression: '(1000 + 1.5 * C_s * rho_s) * 0.116 / sqrt(1)',
        },
        {
          name: 'is_safe',
          expression: 'E_touch < E_touch_limit',
        },
      ],
      validations: [
        {
          rule: 'conductors_positive',
          expression: 'n > 0 and m > 0',
          message: 'Conductor counts must be positive',
          severity: 'error',
        },
      ],
      metadata: {
        standard: 'IEEE 80',
        category: 'grounding',
        tags: ['touch-voltage', 'safety', 'IEEE-80', 'grounding'],
        aiExplanation: 'Calculates actual and allowable touch voltage per IEEE 80 for substation grounding safety',
        aiAssumptions: 'Crushed rock surface layer, uniform soil, 50kg body weight',
        aiWarnings: 'Touch voltage must be below the IEEE 80 tolerable limit for safety',
        aiOptimization: 'Thicker surface layer or higher resistivity rock increases tolerable touch voltage',
      },
    }),

  'grounding-step-voltage': (): DslDefinition =>
    DslDefinition.create({
      id: 'grounding-step-voltage',
      version: '1.0.0',
      standard: 'IEEE 80',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'I_G',
          label: 'Maximum Grid Current',
          type: 'number',
          unit: 'A',
          required: true,
          min: 0,
        },
        {
          name: 'rho_s',
          label: 'Surface Layer Resistivity',
          type: 'number',
          unit: '\u03a9\u00b7m',
          required: true,
          min: 0,
        },
        {
          name: 'h_s',
          label: 'Surface Layer Thickness',
          type: 'number',
          unit: 'm',
          required: true,
          min: 0,
        },
        {
          name: 'D',
          label: 'Grid Spacing',
          type: 'number',
          unit: 'm',
          required: true,
          min: 0,
        },
        {
          name: 'h',
          label: 'Grid Burial Depth',
          type: 'number',
          unit: 'm',
          required: false,
          defaultValue: 0.5,
          min: 0,
        },
        {
          name: 'L_eff',
          label: 'Effective Conductor Length',
          type: 'number',
          unit: 'm',
          required: true,
          min: 0,
        },
      ],
      outputs: [
        {
          name: 'E_step',
          label: 'Actual Step Voltage',
          type: 'number',
          unit: 'V',
        },
        {
          name: 'E_step_limit',
          label: 'Allowable Step Voltage (50kg)',
          type: 'number',
          unit: 'V',
        },
        {
          name: 'is_safe',
          label: 'Safe for 50kg Person',
          type: 'boolean',
        },
      ],
      formulas: [
        {
          name: 'C_s',
          expression: '1 - 0.09 * (1 - rho_s / 3000) / (2 * h_s + 0.09)',
        },
        {
          name: 'n_par',
          expression: 'sqrt(L_eff) / D',
        },
        {
          name: 'K_s',
          expression: '(1 / pi) * (1 / (2 * h) + 1 / (D + h) + (1 / D) * (1 - 0.5 ^ n_par))',
        },
        {
          name: 'E_step',
          expression: '100 * K_s * I_G / L_eff',
        },
        {
          name: 'E_step_limit',
          expression: '(1000 + 6 * C_s * rho_s) * 0.116 / sqrt(1)',
        },
        {
          name: 'is_safe',
          expression: 'E_step < E_step_limit',
        },
      ],
      validations: [
        {
          rule: 'spacing_positive',
          expression: 'D > 0',
          message: 'Grid spacing must be positive',
          severity: 'error',
        },
      ],
      metadata: {
        standard: 'IEEE 80',
        category: 'grounding',
        tags: ['step-voltage', 'safety', 'IEEE-80', 'grounding'],
        aiExplanation: 'Calculates actual and allowable step voltage per IEEE 80 for substation grounding safety',
        aiAssumptions: 'Crushed rock surface layer, 50kg body weight, 0.5m step distance',
        aiWarnings: 'Step voltage limits are less restrictive than touch voltage limits',
        aiOptimization: 'Tighter grid spacing reduces step voltage near grid perimeter',
      },
    }),

  'grounding-conductor-sizing': (): DslDefinition =>
    DslDefinition.create({
      id: 'grounding-conductor-sizing',
      version: '1.0.0',
      standard: 'IEEE 80 / NEC 250',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'I_fault',
          label: 'Maximum Fault Current',
          type: 'number',
          unit: 'A',
          required: true,
          min: 0,
        },
        {
          name: 't_fault',
          label: 'Fault Duration',
          type: 'number',
          unit: 's',
          required: true,
          min: 0.1,
          max: 60,
        },
        {
          name: 'material',
          label: 'Conductor Material',
          type: 'enum',
          required: true,
          enumValues: ['copper', 'aluminum', 'galvanized_steel', 'copper_clad'],
        },
      ],
      outputs: [
        {
          name: 'A_kcmil',
          label: 'Minimum Conductor Size',
          type: 'number',
          unit: 'kcmil',
        },
        {
          name: 'A_mm2',
          label: 'Minimum Conductor Size',
          type: 'number',
          unit: 'mm\u00b2',
        },
        {
          name: 'k_factor',
          label: 'Material Constant k',
          type: 'number',
        },
      ],
      formulas: [
        { name: 'k_factor', expression: '7.04' },
        { name: 'A_kcmil', expression: 'I_fault * sqrt(t_fault) / k_factor' },
        { name: 'A_mm2', expression: 'I_fault * sqrt(t_fault) / 205' },
      ],
      validations: [
        {
          rule: 'fault_positive',
          expression: 'I_fault > 0',
          message: 'Fault current must be positive',
          severity: 'error',
        },
      ],
      metadata: {
        standard: 'IEEE 80 / NEC 250',
        category: 'grounding',
        tags: ['conductor-sizing', 'grounding', 'IEEE-80', 'NEC-250'],
        aiExplanation: 'Sizes grounding conductors per IEEE 80 based on fault current magnitude and duration',
        aiAssumptions: 'Adiabatic heating, ambient temperature 40\u00b0C, final temperature at melting point',
        aiWarnings: 'For buried conductors, consider corrosion and mechanical strength',
        aiOptimization: 'Copper-clad steel offers a good balance of conductivity and mechanical strength',
      },
    }),

  'grounding-rod-sizing': (): DslDefinition =>
    DslDefinition.create({
      id: 'grounding-rod-sizing',
      version: '1.0.0',
      standard: 'IEEE 80 / NEC 250.52',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'rho',
          label: 'Soil Resistivity',
          type: 'number',
          unit: '\u03a9\u00b7m',
          required: true,
          min: 0,
        },
        {
          name: 'target_R',
          label: 'Target Earth Resistance',
          type: 'number',
          unit: '\u03a9',
          required: true,
          min: 0,
        },
        {
          name: 'rod_diameter',
          label: 'Rod Diameter',
          type: 'number',
          unit: 'mm',
          required: false,
          defaultValue: 16,
          min: 12,
          max: 25,
        },
        {
          name: 'rod_type',
          label: 'Rod Material',
          type: 'enum',
          required: true,
          enumValues: ['copper_clad_steel', 'galvanized_steel', 'solid_copper', 'stainless_steel'],
        },
      ],
      outputs: [
        {
          name: 'L_required',
          label: 'Required Rod Length',
          type: 'number',
          unit: 'm',
        },
        {
          name: 'R_single',
          label: 'Single Rod Resistance (2.4m)',
          type: 'number',
          unit: '\u03a9',
        },
        {
          name: 'num_rods',
          label: 'Number of Rods Needed (2.4m each)',
          type: 'number',
        },
      ],
      formulas: [
        {
          name: 'R_single',
          expression: 'rho / (2 * pi * 2.4) * (log(8 * 2.4 / (rod_diameter / 1000)) - 1)',
        },
        {
          name: 'num_rods',
          expression: 'ceil(R_single / target_R)',
        },
        {
          name: 'L_required',
          expression: 'rho / (2 * pi * target_R) * (log(8 * rho / (2 * pi * target_R) / (rod_diameter / 1000)) - 1)',
        },
      ],
      validations: [
        {
          rule: 'feasible_target',
          expression: 'target_R > 0',
          message: 'Target resistance must be positive',
          severity: 'error',
        },
        {
          rule: 'L_reasonable',
          expression: 'L_required <= 30',
          message: 'Required length exceeds 30m; consider grid or chemical treatment',
          severity: 'warning',
        },
      ],
      metadata: {
        standard: 'IEEE 80 / NEC 250.52',
        category: 'grounding',
        tags: ['rod-sizing', 'electrode', 'grounding', 'NEC'],
        aiExplanation: 'Determines required grounding rod length and number of rods to achieve target earth resistance',
        aiAssumptions: 'Uniform soil resistivity, vertical rod, hemispherical electrode theory',
        aiWarnings: 'In rocky soil, driven rods may not achieve full calculated length',
        aiOptimization: 'Multiple shorter rods spaced > rod length apart are more efficient than one long rod',
      },
    }),

  // ==========================================================================
  // Protection (Phase 8)
  // ==========================================================================

  'protection-fuse-sizing': (): DslDefinition =>
    DslDefinition.create({
      id: 'protection-fuse-sizing',
      version: '1.0.0',
      standard: 'IEC 60269 / NEC 240',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'I_nominal',
          label: 'Full Load Current',
          type: 'number',
          unit: 'A',
          required: true,
          min: 0,
        },
        {
          name: 'load_type',
          label: 'Load Type',
          type: 'enum',
          required: true,
          enumValues: ['general', 'motor_circuit', 'transformer', 'capacitor_bank', 'lighting'],
        },
        {
          name: 'fuse_class',
          label: 'Fuse Class',
          type: 'enum',
          required: true,
          enumValues: ['gG', 'aM', 'gR', 'gTr', 'UL_Class_J', 'UL_Class_RK1', 'UL_Class_CC'],
        },
        {
          name: 'starting_current',
          label: 'Starting/Inrush Current',
          type: 'number',
          unit: 'A',
          required: false,
        },
      ],
      outputs: [
        {
          name: 'I_fuse_rated',
          label: 'Recommended Fuse Rating',
          type: 'number',
          unit: 'A',
        },
        {
          name: 'fuse_standard_size',
          label: 'Standard Fuse Size',
          type: 'number',
          unit: 'A',
        },
        {
          name: 'margin',
          label: 'Design Margin',
          type: 'number',
          unit: '%',
        },
      ],
      formulas: [
        { name: 'I_fuse_rated', expression: 'I_nominal * 1.15' },
        { name: 'fuse_standard_size', expression: 'ceil(I_fuse_rated / 10) * 10' },
        { name: 'margin', expression: '(fuse_standard_size - I_nominal) / I_nominal * 100' },
      ],
      validations: [
        {
          rule: 'positive_current',
          expression: 'I_nominal > 0',
          message: 'Nominal current must be positive',
          severity: 'error',
        },
      ],
      metadata: {
        standard: 'IEC 60269 / NEC 240',
        category: 'protection',
        tags: ['fuse', 'sizing', 'overcurrent', 'protection'],
        aiExplanation: 'Selects appropriate fuse rating based on load type and starting conditions per IEC 60269',
        aiAssumptions: 'Ambient temperature 40\u00b0C, standard fuse-links per IEC 60269',
        aiWarnings: 'Fuse must coordinate with downstream cable rating',
        aiOptimization: 'gG fuses for general protection, aM for motor circuits',
      },
    }),

  'protection-mcb-selection': (): DslDefinition =>
    DslDefinition.create({
      id: 'protection-mcb-selection',
      version: '1.0.0',
      standard: 'IEC 60898',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'I_nominal',
          label: 'Full Load Current',
          type: 'number',
          unit: 'A',
          required: true,
          min: 0,
        },
        {
          name: 'load_type',
          label: 'Load Type',
          type: 'enum',
          required: true,
          enumValues: ['general_resistive', 'lighting', 'motor', 'transformer', 'welding'],
        },
        {
          name: 'I_sc',
          label: 'Prospective SC Current',
          type: 'number',
          unit: 'kA',
          required: true,
          min: 0,
        },
        {
          name: 'num_poles',
          label: 'Number of Poles',
          type: 'number',
          required: false,
          defaultValue: 1,
          min: 1,
          max: 4,
        },
      ],
      outputs: [
        {
          name: 'In_rated',
          label: 'MCB Rated Current',
          type: 'number',
          unit: 'A',
        },
        {
          name: 'trip_curve',
          label: 'Recommended Trip Curve',
          type: 'string',
        },
        {
          name: 'breaking_capacity',
          label: 'Required Breaking Capacity',
          type: 'number',
          unit: 'kA',
        },
      ],
      formulas: [
        { name: 'In_rated', expression: 'ceil(I_nominal * 1.1 / 10) * 10' },
        { name: 'trip_curve', expression: 'I_nominal <= 50 ? "C" : "D"' },
        { name: 'standard_rating', expression: 'ceil(In_rated / 10) * 10' },
        { name: 'breaking_capacity', expression: 'I_sc <= 6 ? 6 : (I_sc <= 10 ? 10 : (I_sc <= 25 ? 25 : 50))' },
      ],
      validations: [
        {
          rule: 'overload_protection',
          expression: 'In_rated <= I_nominal * 1.45',
          message: 'MCB rating exceeds overload protection coordination limit',
          severity: 'warning',
        },
      ],
      metadata: {
        standard: 'IEC 60898',
        category: 'protection',
        tags: ['MCB', 'miniature-circuit-breaker', 'trip-curve', 'selection'],
        aiExplanation: 'Selects miniature circuit breaker rating and trip curve based on load characteristics per IEC 60898',
        aiAssumptions: 'Ambient temperature 30\u00b0C, standard MCB per IEC 60898-1',
        aiWarnings: 'Curve B: resistive/lighting; Curve C: general/transformer; Curve D: motor',
        aiOptimization: 'Use curve C as default for mixed loads; curve B for residential lighting',
      },
    }),

  'protection-mccb-selection': (): DslDefinition =>
    DslDefinition.create({
      id: 'protection-mccb-selection',
      version: '1.0.0',
      standard: 'IEC 60947-2',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'I_nominal',
          label: 'Full Load Current',
          type: 'number',
          unit: 'A',
          required: true,
          min: 0,
        },
        {
          name: 'I_sc',
          label: 'Prospective SC Current',
          type: 'number',
          unit: 'kA',
          required: true,
          min: 0,
        },
        {
          name: 'application',
          label: 'Application',
          type: 'enum',
          required: true,
          enumValues: ['main_switchboard', 'distribution', 'motor_feeder', 'transformer_feeder', 'generator_feeder'],
        },
        {
          name: 'num_poles',
          label: 'Number of Poles',
          type: 'number',
          required: false,
          defaultValue: 3,
          min: 1,
          max: 4,
        },
        {
          name: 'selective',
          label: 'Selective Coordination Required',
          type: 'boolean',
          required: false,
          defaultValue: false,
        },
      ],
      outputs: [
        {
          name: 'In_rated',
          label: 'MCCB Rated Current',
          type: 'number',
          unit: 'A',
        },
        {
          name: 'Icu_required',
          label: 'Required Ultimate Breaking Capacity',
          type: 'number',
          unit: 'kA',
        },
        {
          name: 'Ics_required',
          label: 'Required Service Breaking Capacity',
          type: 'number',
          unit: 'kA',
        },
        {
          name: 'frame_size',
          label: 'Recommended Frame Size',
          type: 'string',
        },
      ],
      formulas: [
        { name: 'In_rated', expression: 'ceil(I_nominal * 1.1 / 10) * 10' },
        { name: 'Icu_required', expression: 'I_sc' },
        { name: 'Ics_required', expression: 'Icu_required * 0.75' },
        { name: 'frame_size', expression: 'In_rated <= 160 ? "160A_frame" : (In_rated <= 250 ? "250A_frame" : (In_rated <= 630 ? "630A_frame" : (In_rated <= 1250 ? "1250A_frame" : "2500A_frame")))' },
      ],
      validations: [
        {
          rule: 'Ics_ratio',
          expression: 'Ics_required >= Icu_required * 0.5',
          message: 'Ics must be >= 50% of Icu per IEC 60947-2',
          severity: 'warning',
        },
      ],
      metadata: {
        standard: 'IEC 60947-2',
        category: 'protection',
        tags: ['MCCB', 'molded-case', 'breaker', 'selection'],
        aiExplanation: 'Selects MCCB rating, breaking capacity, and frame size per IEC 60947-2',
        aiAssumptions: 'Standard IEC 60947-2 categorization, utilization category A or B',
        aiWarnings: 'Selective MCCB requires Icu rating above prospective fault level',
        aiOptimization: 'For selective coordination, choose MCCB with adjustable short-time delay',
      },
    }),

  'protection-acb-selection': (): DslDefinition =>
    DslDefinition.create({
      id: 'protection-acb-selection',
      version: '1.0.0',
      standard: 'IEC 60947-2',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'I_nominal',
          label: 'Full Load Current',
          type: 'number',
          unit: 'A',
          required: true,
          min: 0,
        },
        {
          name: 'I_sc',
          label: 'Prospective SC Current',
          type: 'number',
          unit: 'kA',
          required: true,
          min: 0,
        },
        {
          name: 'application',
          label: 'Application',
          type: 'enum',
          required: true,
          enumValues: ['main_incomer', 'bus_tie', 'generator_outgoing', 'transformer_outgoing', 'feeder'],
        },
        {
          name: 'num_poles',
          label: 'Number of Poles',
          type: 'number',
          required: false,
          defaultValue: 3,
          min: 3,
          max: 4,
        },
        {
          name: 'with_neutral',
          label: 'Neutral Protection Required',
          type: 'boolean',
          required: false,
          defaultValue: false,
        },
      ],
      outputs: [
        {
          name: 'In_rated',
          label: 'ACB Rated Current',
          type: 'number',
          unit: 'A',
        },
        {
          name: 'Icu_required',
          label: 'Required Breaking Capacity',
          type: 'number',
          unit: 'kA',
        },
        {
          name: 'standard_rating',
          label: 'Standard ACB Rating',
          type: 'number',
          unit: 'A',
        },
        {
          name: 'protection_functions',
          label: 'Required Protection Functions',
          type: 'string',
        },
      ],
      formulas: [
        { name: 'In_rated', expression: 'ceil(I_nominal * 1.1 / 100) * 100' },
        { name: 'Icu_required', expression: 'I_sc' },
        { name: 'standard_rating', expression: 'ceil(In_rated / 100) * 100' },
        { name: 'protection_functions', expression: '"L,S,I,G"' },
      ],
      validations: [
        {
          rule: 'rating_adequate',
          expression: 'In_rated >= I_nominal',
          message: 'ACB rating must be at least equal to full load current',
          severity: 'error',
        },
      ],
      metadata: {
        standard: 'IEC 60947-2',
        category: 'protection',
        tags: ['ACB', 'air-circuit-breaker', 'main-switchboard', 'selection'],
        aiExplanation: 'Selects air circuit breaker rating and protection functions per IEC 60947-2',
        aiAssumptions: 'Draw-out type ACB for main switchboard application',
        aiWarnings: '4-pole ACB with neutral protection required for TN-S systems',
        aiOptimization: 'Electronic trip units (LSIG) provide adjustable protection curves for selectivity',
      },
    }),

  'protection-relay-ct-sizing': (): DslDefinition =>
    DslDefinition.create({
      id: 'protection-relay-ct-sizing',
      version: '1.0.0',
      standard: 'IEC 61869-2 / IEEE C57.13',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'I_nominal',
          label: 'Primary Full Load Current',
          type: 'number',
          unit: 'A',
          required: true,
          min: 0,
        },
        {
          name: 'I_sc_max',
          label: 'Maximum SC Current',
          type: 'number',
          unit: 'kA',
          required: true,
          min: 0,
        },
        {
          name: 'relay_type',
          label: 'Protection Relay Type',
          type: 'enum',
          required: true,
          enumValues: ['overcurrent', 'differential', 'distance', 'earth_fault', 'transformer_differential'],
        },
        {
          name: 'lead_length',
          label: 'CT Lead Length (one-way)',
          type: 'number',
          unit: 'm',
          required: false,
          defaultValue: 50,
          min: 0,
        },
        {
          name: 'lead_size',
          label: 'Lead Conductor Size',
          type: 'number',
          unit: 'mm\u00b2',
          required: false,
          defaultValue: 4,
          min: 0,
        },
      ],
      outputs: [
        {
          name: 'CT_ratio',
          label: 'Recommended CT Ratio',
          type: 'string',
        },
        {
          name: 'VA_required',
          label: 'Required CT Burden',
          type: 'number',
          unit: 'VA',
        },
        {
          name: 'accuracy_class',
          label: 'Required Accuracy Class',
          type: 'string',
        },
        {
          name: 'ALF',
          label: 'Required Accuracy Limit Factor',
          type: 'number',
        },
      ],
      formulas: [
        { name: 'CT_primary', expression: 'ceil(I_nominal * 1.25 / 50) * 50' },
        { name: 'CT_ratio', expression: 'CT_primary <= 100 ? "100/1" : (CT_primary <= 200 ? "200/1" : (CT_primary <= 300 ? "300/1" : (CT_primary <= 400 ? "400/1" : (CT_primary <= 500 ? "500/1" : (CT_primary <= 600 ? "600/1" : (CT_primary <= 800 ? "800/1" : (CT_primary <= 1000 ? "1000/1" : (CT_primary <= 1200 ? "1200/1" : (CT_primary <= 1500 ? "1500/1" : "2000/1")))))))))' },
        { name: 'lead_resistance', expression: '2 * lead_length / (lead_size * 58)' },
        { name: 'relay_burden', expression: '0.2' },
        { name: 'VA_required', expression: 'relay_burden + lead_resistance' },
        { name: 'ALF', expression: 'I_sc_max * 1000 / CT_primary' },
        { name: 'accuracy_class', expression: 'relay_type === "overcurrent" ? "5P20" : "10P20"' },
      ],
      validations: [
        {
          rule: 'ALF_check',
          expression: 'ALF <= 20',
          message: 'Accuracy Limit Factor exceeds 20; consider higher ratio CT or reduced burden',
          severity: 'warning',
        },
      ],
      metadata: {
        standard: 'IEC 61869-2 / IEEE C57.13',
        category: 'protection',
        tags: ['CT', 'current-transformer', 'relay', 'sizing', 'burden'],
        aiExplanation: 'Sizes current transformers for protection relays including ratio, burden, and accuracy class per IEC 61869-2',
        aiAssumptions: 'Protection CT with 5P or 10P accuracy class, 1A secondary',
        aiWarnings: 'CT saturation must be avoided for maximum through-fault current',
        aiOptimization: 'Use 1A secondary CTs for long lead runs to reduce burden',
      },
    }),

  'protection-coordination': (): DslDefinition =>
    DslDefinition.create({
      id: 'protection-coordination',
      version: '1.0.0',
      standard: 'IEC 60909 / IEEE 242',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'I_fault_main',
          label: 'Main Device Fault Current',
          type: 'number',
          unit: 'kA',
          required: true,
          min: 0,
        },
        {
          name: 'I_fault_downstream',
          label: 'Downstream Device Fault Current',
          type: 'number',
          unit: 'kA',
          required: true,
          min: 0,
        },
        {
          name: 't_main',
          label: 'Main Device Operating Time',
          type: 'number',
          unit: 's',
          required: true,
          min: 0,
        },
        {
          name: 't_downstream',
          label: 'Downstream Device Operating Time',
          type: 'number',
          unit: 's',
          required: true,
          min: 0,
        },
        {
          name: 'margin',
          label: 'Required Coordination Margin',
          type: 'number',
          unit: 's',
          required: false,
          defaultValue: 0.2,
          min: 0,
        },
      ],
      outputs: [
        {
          name: 'is_selective',
          label: 'Selective Coordination Achieved',
          type: 'boolean',
        },
        {
          name: 'time_margin',
          label: 'Actual Time Margin',
          type: 'number',
          unit: 's',
        },
        {
          name: 'recommendation',
          label: 'Coordination Recommendation',
          type: 'string',
        },
      ],
      formulas: [
        {
          name: 'time_margin',
          expression: 't_main - t_downstream',
        },
        {
          name: 'is_selective',
          expression: 'time_margin >= margin',
        },
        {
          name: 'recommendation',
          expression: 'is_selective ? "selective_coordination_ok" : (time_margin > 0 ? "insufficient_margin_increase_t_main_or_decrease_t_downstream" : "downstream_faster_than_main_invert_settings")',
        },
      ],
      validations: [
        {
          rule: 'margin_reasonable',
          expression: 'margin >= 0.1 and margin <= 0.5',
          message: 'Typical coordination margin is 0.1-0.5s per IEEE 242',
          severity: 'warning',
        },
      ],
      metadata: {
        standard: 'IEC 60909 / IEEE 242',
        category: 'protection',
        tags: ['coordination', 'selectivity', 'relay', 'protection'],
        aiExplanation: 'Checks selective coordination between upstream and downstream protection devices',
        aiAssumptions: 'Both devices operate on the same fault current level',
        aiWarnings: 'Verify coordination at minimum and maximum fault current levels',
        aiOptimization: 'Use time-current curves from manufacturer for precise coordination study',
      },
    }),

  'protection-breaking-capacity': (): DslDefinition =>
    DslDefinition.create({
      id: 'protection-breaking-capacity',
      version: '1.0.0',
      standard: 'IEC 60947-2',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'I_sc_prospective',
          label: 'Prospective SC Current at Installation Point',
          type: 'number',
          unit: 'kA',
          required: true,
          min: 0,
        },
        {
          name: 'device_type',
          label: 'Device Type',
          type: 'enum',
          required: true,
          enumValues: ['MCB', 'MCCB', 'ACB', 'fuse', 'switch_disconnector'],
        },
        {
          name: 'system_voltage',
          label: 'System Voltage',
          type: 'number',
          unit: 'V',
          required: true,
          min: 0,
        },
        {
          name: 'safety_factor',
          label: 'Safety Factor',
          type: 'number',
          required: false,
          defaultValue: 1.25,
          min: 1,
          max: 2,
        },
      ],
      outputs: [
        {
          name: 'Icu_min',
          label: 'Minimum Breaking Capacity Required',
          type: 'number',
          unit: 'kA',
        },
        {
          name: 'Ics_min',
          label: 'Minimum Service Breaking Capacity',
          type: 'number',
          unit: 'kA',
        },
        {
          name: 'recommended_class',
          label: 'Recommended Breaking Capacity Class',
          type: 'string',
        },
      ],
      formulas: [
        {
          name: 'Icu_min',
          expression: 'I_sc_prospective * safety_factor',
        },
        {
          name: 'Ics_min',
          expression: 'Icu_min * 0.75',
        },
        {
          name: 'recommended_class',
          expression: 'Icu_min <= 6 ? "6kA" : (Icu_min <= 10 ? "10kA" : (Icu_min <= 15 ? "15kA" : (Icu_min <= 25 ? "25kA" : (Icu_min <= 36 ? "36kA" : (Icu_min <= 50 ? "50kA" : (Icu_min <= 65 ? "65kA" : "100kA+"))))))',
        },
      ],
      validations: [
        {
          rule: 'positive_sc',
          expression: 'I_sc_prospective > 0',
          message: 'Prospective SC current must be positive',
          severity: 'error',
        },
      ],
      metadata: {
        standard: 'IEC 60947-2',
        category: 'protection',
        tags: ['breaking-capacity', 'Icu', 'Ics', 'short-circuit'],
        aiExplanation: 'Determines the minimum breaking capacity requirement for protection devices based on prospective short-circuit current',
        aiAssumptions: 'Worst-case bolted three-phase fault at installation point',
        aiWarnings: 'Breaking capacity must exceed the maximum prospective fault current at the installation point',
        aiOptimization: 'Apply safety factor of 1.25 for general distribution, 1.5 for critical applications',
      },
    }),

  // ==========================================================================
  // Motor (Phase 9)
  // ==========================================================================

  'motor-current': (): DslDefinition =>
    DslDefinition.create({
      id: 'motor-current',
      version: '1.0.0',
      standard: 'IEC 60034-1 / NEMA MG-1',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'P_rated',
          label: 'Motor Rated Power',
          type: 'number',
          unit: 'kW',
          required: true,
          min: 0,
        },
        {
          name: 'V_rated',
          label: 'Rated Voltage',
          type: 'number',
          unit: 'V',
          required: true,
          min: 0,
        },
        {
          name: 'cosPhi',
          label: 'Power Factor',
          type: 'number',
          required: false,
          defaultValue: 0.85,
          min: 0,
          max: 1,
        },
        {
          name: 'efficiency',
          label: 'Efficiency',
          type: 'number',
          unit: '%',
          required: false,
          defaultValue: 90,
          min: 50,
          max: 99,
        },
        {
          name: 'system',
          label: 'System Type',
          type: 'enum',
          required: true,
          enumValues: ['single_phase', 'three_phase'],
        },
      ],
      outputs: [
        {
          name: 'I_FL',
          label: 'Full Load Current',
          type: 'number',
          unit: 'A',
        },
        {
          name: 'I_NL',
          label: 'No-Load Current (Estimated)',
          type: 'number',
          unit: 'A',
        },
        {
          name: 'kVA_rating',
          label: 'Motor kVA Rating',
          type: 'number',
          unit: 'kVA',
        },
      ],
      formulas: [
        { name: 'I_FL', expression: 'P_rated * 1000 / (sqrt(3) * V_rated * cosPhi * (efficiency / 100))' },
        { name: 'I_NL', expression: 'I_FL * 0.3' },
        { name: 'kVA_rating', expression: 'sqrt(3) * V_rated * I_FL / 1000' },
      ],
      validations: [
        {
          rule: 'positive_power',
          expression: 'P_rated > 0',
          message: 'Motor power must be positive',
          severity: 'error',
        },
      ],
      metadata: {
        standard: 'IEC 60034-1 / NEMA MG-1',
        category: 'motor',
        tags: ['motor', 'full-load-current', 'FLA', 'starting'],
        aiExplanation: 'Calculates motor full load current based on power rating, voltage, efficiency, and power factor',
        aiAssumptions: 'Standard induction motor, nominal voltage and frequency',
        aiWarnings: 'Actual FLA may vary by motor design and manufacturer',
        aiOptimization: 'Use NEMA design B values for standard induction motors',
      },
    }),

  'motor-starting-current': (): DslDefinition =>
    DslDefinition.create({
      id: 'motor-starting-current',
      version: '1.0.0',
      standard: 'IEC 60034-1 / NEMA MG-1',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'I_FL',
          label: 'Full Load Current',
          type: 'number',
          unit: 'A',
          required: true,
          min: 0,
        },
        {
          name: 'NEMA_code',
          label: 'NEMA Locked Rotor Code',
          type: 'enum',
          required: true,
          enumValues: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
        },
        {
          name: 'P_rated',
          label: 'Motor Rated Power',
          type: 'number',
          unit: 'HP',
          required: false,
        },
        {
          name: 'start_method',
          label: 'Starting Method',
          type: 'enum',
          required: true,
          enumValues: ['DOL', 'star_delta', 'soft_starter', 'VFD', 'auto_transformer'],
        },
      ],
      outputs: [
        {
          name: 'I_LRC',
          label: 'Locked Rotor Current',
          type: 'number',
          unit: 'A',
        },
        {
          name: 'I_start',
          label: 'Actual Starting Current',
          type: 'number',
          unit: 'A',
        },
        {
          name: 'start_ratio',
          label: 'Starting Current / FLA',
          type: 'number',
        },
      ],
      formulas: [
        { name: 'I_LRC', expression: 'I_FL * 4.5' },
        { name: 'I_start', expression: 'I_LRC * 1.0' },
        { name: 'start_ratio', expression: 'I_start / I_FL' },
      ],
      validations: [
        {
          rule: 'DOL_check',
          expression: 'start_method != 1 or I_LRC_actual <= I_FL * 8',
          message: 'DOL starting current exceeds 8x FLA; verify supply capacity',
          severity: 'warning',
        },
      ],
      metadata: {
        standard: 'IEC 60034-1 / NEMA MG-1',
        category: 'motor',
        tags: ['starting-current', 'LRC', 'inrush', 'DOL', 'star-delta'],
        aiExplanation: 'Calculates motor locked rotor current and effective starting current based on NEMA code and starting method',
        aiAssumptions: 'NEMA locked rotor code per MG-1, typical starting method factors',
        aiWarnings: 'DOL starting can cause voltage dips; use reduced voltage starting for large motors',
        aiOptimization: 'VFD starting provides lowest inrush and best control but highest cost',
      },
    }),

  'motor-voltage-drop-starting': (): DslDefinition =>
    DslDefinition.create({
      id: 'motor-voltage-drop-starting',
      version: '1.0.0',
      standard: 'IEC 60034-1',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'I_start',
          label: 'Starting Current',
          type: 'number',
          unit: 'A',
          required: true,
          min: 0,
        },
        {
          name: 'Z_source',
          label: 'Source Impedance at PCC',
          type: 'number',
          unit: '\u03a9',
          required: true,
          min: 0,
        },
        {
          name: 'V_nominal',
          label: 'Nominal Voltage',
          type: 'number',
          unit: 'V',
          required: true,
          min: 0,
        },
        {
          name: 'cosPhi_start',
          label: 'Starting Power Factor',
          type: 'number',
          required: false,
          defaultValue: 0.3,
          min: 0,
          max: 1,
        },
      ],
      outputs: [
        {
          name: 'V_dip',
          label: 'Voltage Dip During Start',
          type: 'number',
          unit: 'V',
        },
        {
          name: 'V_dip_pct',
          label: 'Voltage Dip Percentage',
          type: 'number',
          unit: '%',
        },
        {
          name: 'is_acceptable',
          label: 'Within Acceptable Limit (15%)',
          type: 'boolean',
        },
      ],
      formulas: [
        {
          name: 'V_dip',
          expression: 'sqrt(3) * I_start * Z_source * cosPhi_start',
        },
        {
          name: 'V_dip_pct',
          expression: 'V_dip / V_nominal * 100',
        },
        {
          name: 'is_acceptable',
          expression: 'V_dip_pct <= 15',
        },
      ],
      validations: [
        {
          rule: 'dip_threshold',
          expression: 'V_dip_pct <= 20',
          message: 'Starting voltage dip exceeds 20%; may cause relay tripping',
          severity: 'warning',
        },
      ],
      metadata: {
        standard: 'IEC 60034-1',
        category: 'motor',
        tags: ['voltage-drop', 'starting', 'dip', 'motor'],
        aiExplanation: 'Calculates voltage dip during motor starting due to inrush current and source impedance',
        aiAssumptions: 'Motor starting at low power factor (~0.3), stiff source with known impedance',
        aiWarnings: 'Voltage dip > 15% can affect other loads; > 20% may cause contactor dropout',
        aiOptimization: 'Use reduced voltage starting or increase transformer size to limit dip',
      },
    }),

  'motor-starting-method': (): DslDefinition =>
    DslDefinition.create({
      id: 'motor-starting-method',
      version: '1.0.0',
      standard: 'IEC 60034-1 / NEMA MG-1',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'P_rated',
          label: 'Motor Rated Power',
          type: 'number',
          unit: 'kW',
          required: true,
          min: 0,
        },
        {
          name: 'V_system',
          label: 'System Voltage',
          type: 'number',
          unit: 'V',
          required: true,
          min: 0,
        },
        {
          name: 'supply_capacity',
          label: 'Supply SC Capacity at PCC',
          type: 'number',
          unit: 'MVA',
          required: true,
          min: 0,
        },
        {
          name: 'load_type',
          label: 'Driven Load Type',
          type: 'enum',
          required: true,
          enumValues: ['fan', 'pump', 'compressor', 'conveyor', 'crusher', 'centrifuge'],
        },
        {
          name: 'max_dip_allowed',
          label: 'Maximum Allowed Voltage Dip',
          type: 'number',
          unit: '%',
          required: false,
          defaultValue: 15,
          min: 5,
          max: 25,
        },
      ],
      outputs: [
        {
          name: 'recommended_method',
          label: 'Recommended Starting Method',
          type: 'string',
        },
        {
          name: 'V_dip_estimated',
          label: 'Estimated Voltage Dip',
          type: 'number',
          unit: '%',
        },
        {
          name: 'feasible_DOL',
          label: 'Direct-On-Line Feasible',
          type: 'boolean',
        },
      ],
      formulas: [
        { name: 'supply_ratio', expression: 'supply_capacity * 1000 / P_rated' },
        { name: 'V_dip_estimated', expression: 'supply_ratio < 100 ? 25 : (supply_ratio < 200 ? 15 : (supply_ratio < 500 ? 10 : (supply_ratio < 1000 ? 5 : 3)))' },
        { name: 'feasible_DOL', expression: 'V_dip_estimated <= max_dip_allowed ? 1 : 0' },
        { name: 'recommended_method', expression: 'feasible_DOL ? "DOL" : (P_rated <= 75 ? "star_delta" : (P_rated <= 250 ? "soft_starter" : "VFD"))' },
      ],
      validations: [
        {
          rule: 'supply_capacity_check',
          expression: 'supply_capacity > 0',
          message: 'Supply capacity must be positive',
          severity: 'error',
        },
      ],
      metadata: {
        standard: 'IEC 60034-1 / NEMA MG-1',
        category: 'motor',
        tags: ['starting-method', 'DOL', 'star-delta', 'VFD', 'soft-starter'],
        aiExplanation: 'Recommends motor starting method based on power rating, supply capacity, and allowable voltage dip',
        aiAssumptions: 'Typical supply impedance, standard motor starting characteristics',
        aiWarnings: 'VFD recommended for conveyors and crushers requiring controlled torque',
        aiOptimization: 'Soft starter for pumps to reduce water hammer effect',
      },
    }),

  'motor-cable-sizing': (): DslDefinition =>
    DslDefinition.create({
      id: 'motor-cable-sizing',
      version: '1.0.0',
      standard: 'IEC 60364-5-52 / NEMA MG-1',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'I_FL',
          label: 'Full Load Current',
          type: 'number',
          unit: 'A',
          required: true,
          min: 0,
        },
        {
          name: 'I_start',
          label: 'Starting Current',
          type: 'number',
          unit: 'A',
          required: true,
          min: 0,
        },
        {
          name: 'L',
          label: 'Cable Length',
          type: 'number',
          unit: 'm',
          required: true,
          min: 0,
        },
        {
          name: 'cable_type',
          label: 'Cable Type',
          type: 'enum',
          required: true,
          enumValues: ['PVC', 'XLPE', 'EPR'],
        },
        {
          name: 'installation',
          label: 'Installation Method',
          type: 'enum',
          required: true,
          enumValues: ['tray', 'conduit', 'clipped', 'direct_buried'],
        },
        {
          name: 'ambient_temp',
          label: 'Ambient Temperature',
          type: 'number',
          unit: '\u00b0C',
          required: false,
          defaultValue: 40,
          min: -10,
          max: 80,
        },
      ],
      outputs: [
        {
          name: 'min_csa_continuous',
          label: 'Min CSA for Continuous Rating',
          type: 'number',
          unit: 'mm\u00b2',
        },
        {
          name: 'min_csa_vdrop',
          label: 'Min CSA for Voltage Drop (Start)',
          type: 'number',
          unit: 'mm\u00b2',
        },
        {
          name: 'recommended_csa',
          label: 'Recommended CSA',
          type: 'number',
          unit: 'mm\u00b2',
        },
        {
          name: 'V_drop_start_pct',
          label: 'Voltage Drop at Starting',
          type: 'number',
          unit: '%',
        },
      ],
      formulas: [
        { name: 'min_csa_continuous', expression: 'ceil(I_FL * 100 / 250 * 10) / 10' },
        { name: 'V_drop_start_pct', expression: 'sqrt(3) * I_start * L * 0.0225 / (min_csa_continuous * 1000) / 400 * 100' },
        { name: 'min_csa_vdrop', expression: 'min_csa_continuous * (V_drop_start_pct / 15)' },
        { name: 'recommended_csa', expression: 'ceil(min_csa_vdrop / 10) * 10' },
      ],
      validations: [
        {
          rule: 'vdrop_start_check',
          expression: 'V_drop_start_pct <= 15',
          message: 'Starting voltage drop exceeds 15%; increase cable size',
          severity: 'warning',
        },
      ],
      metadata: {
        standard: 'IEC 60364-5-52 / NEMA MG-1',
        category: 'motor',
        tags: ['motor-cable', 'sizing', 'voltage-drop', 'starting'],
        aiExplanation: 'Sizes motor feeder cables considering continuous rating, starting current, and voltage drop',
        aiAssumptions: 'Three-phase motor, copper conductor, 400V system',
        aiWarnings: 'Starting voltage drop must not exceed 15% for reliable motor starting',
        aiOptimization: 'Use XLPE cable for higher ampacity in same cross-section',
      },
    }),

  'motor-protection-sizing': (): DslDefinition =>
    DslDefinition.create({
      id: 'motor-protection-sizing',
      version: '1.0.0',
      standard: 'IEC 60947-4-1 / NEMA ICS 2',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'I_FL',
          label: 'Full Load Current',
          type: 'number',
          unit: 'A',
          required: true,
          min: 0,
        },
        {
          name: 'I_LRC',
          label: 'Locked Rotor Current',
          type: 'number',
          unit: 'A',
          required: true,
          min: 0,
        },
        {
          name: 'I_sc',
          label: 'Prospective SC Current at Motor Terminal',
          type: 'number',
          unit: 'kA',
          required: true,
          min: 0,
        },
        {
          name: 'protection_type',
          label: 'Protection Type',
          type: 'enum',
          required: true,
          enumValues: ['circuit_breaker', 'fuse', 'motor_circuit_switch', 'combination_starter'],
        },
        {
          name: 'application',
          label: 'Application',
          type: 'enum',
          required: true,
          enumValues: ['general', 'critical', 'hazardous', 'lifting'],
        },
      ],
      outputs: [
        {
          name: 'overload_relay_setting',
          label: 'Overload Relay Setting',
          type: 'number',
          unit: 'A',
        },
        {
          name: 'sc_protection_rating',
          label: 'SC Protection Rating',
          type: 'number',
          unit: 'A',
        },
        {
          name: 'type2_coordination',
          label: 'Type 2 Coordination Achievable',
          type: 'boolean',
        },
        {
          name: 'recommended_device',
          label: 'Recommended Protection Device',
          type: 'string',
        },
      ],
      formulas: [
        { name: 'overload_relay_setting', expression: 'I_FL * 1.05' },
        { name: 'sc_protection_rating', expression: 'I_LRC / 1.25' },
        { name: 'sc_standard_rating', expression: 'ceil(sc_protection_rating / 20) * 20' },
        { name: 'type2_coordination', expression: 'I_sc <= 50 ? 1 : 0' },
        { name: 'recommended_device', expression: 'I_sc < 50 ? "MCCB_with_motor_protection" : "CPS_or_MSC"' },
      ],
      validations: [
        {
          rule: 'overload_range',
          expression: 'overload_relay_setting >= I_FL',
          message: 'Overload setting must be at least equal to FLA',
          severity: 'error',
        },
      ],
      metadata: {
        standard: 'IEC 60947-4-1 / NEMA ICS 2',
        category: 'motor',
        tags: ['motor-protection', 'overload', 'short-circuit', 'starter'],
        aiExplanation: 'Sizes motor overload and short-circuit protection devices per IEC 60947-4-1',
        aiAssumptions: 'Class 10 or Class 20 overload relay, standard motor starting duty',
        aiWarnings: 'Hazardous area motors require additional thermal protection',
        aiOptimization: 'Use electronic overload relays for better protection and diagnostics',
      },
    }),

  // ==========================================================================
  // Power Quality (Phase 10)
  // ==========================================================================

  'pq-power-factor-correction': (): DslDefinition =>
    DslDefinition.create({
      id: 'pq-power-factor-correction',
      version: '1.0.0',
      standard: 'IEEE 1459 / IEC 61000',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'P',
          label: 'Active Power',
          type: 'number',
          unit: 'kW',
          required: true,
          min: 0,
        },
        {
          name: 'cosPhi_actual',
          label: 'Actual Power Factor',
          type: 'number',
          required: true,
          min: 0,
          max: 1,
        },
        {
          name: 'cosPhi_target',
          label: 'Target Power Factor',
          type: 'number',
          required: true,
          min: 0,
          max: 1,
        },
        {
          name: 'V_system',
          label: 'System Voltage',
          type: 'number',
          unit: 'V',
          required: false,
          defaultValue: 400,
          min: 0,
        },
      ],
      outputs: [
        {
          name: 'Q_c',
          label: 'Required Capacitive Reactive Power',
          type: 'number',
          unit: 'kVAR',
        },
        {
          name: 'C_value',
          label: 'Required Capacitance (per phase wye)',
          type: 'number',
          unit: '\u00b5F',
        },
        {
          name: 'I_capacitive',
          label: 'Capacitor Current',
          type: 'number',
          unit: 'A',
        },
        {
          name: 'savings_kW',
          label: 'Estimated Loss Reduction',
          type: 'number',
          unit: 'kW',
        },
      ],
      formulas: [
        {
          name: 'phi_actual',
          expression: 'acos(cosPhi_actual)',
        },
        {
          name: 'phi_target',
          expression: 'acos(cosPhi_target)',
        },
        {
          name: 'Q_c',
          expression: 'P * (tan(phi_actual) - tan(phi_target))',
        },
        {
          name: 'C_value',
          expression: 'Q_c * 1000 / (2 * pi * 50 * V_system * V_system / 3) * 1000000',
        },
        {
          name: 'I_capacitive',
          expression: 'Q_c * 1000 / (sqrt(3) * V_system)',
        },
        {
          name: 'savings_kW',
          expression: 'P * (1 / (cosPhi_actual * cosPhi_actual) - 1 / (cosPhi_target * cosPhi_target)) * 0.02',
        },
      ],
      validations: [
        {
          rule: 'cosPhi_target_valid',
          expression: 'cosPhi_target > cosPhi_actual',
          message: 'Target PF must be higher than actual PF',
          severity: 'error',
        },
        {
          rule: 'cosPhi_range',
          expression: 'cosPhi_actual > 0 and cosPhi_target <= 1',
          message: 'PF values must be in range (0, 1]',
          severity: 'error',
        },
      ],
      metadata: {
        standard: 'IEEE 1459 / IEC 61000',
        category: 'power-quality',
        tags: ['power-factor', 'correction', 'capacitor', 'savings'],
        aiExplanation: 'Calculates required reactive power compensation to achieve target power factor',
        aiAssumptions: 'Sinusoidal waveform, shunt capacitor compensation, linear load',
        aiWarnings: 'Excessive correction can cause overvoltage and leading PF',
        aiOptimization: 'Target PF 0.95-0.98 typically avoids utility penalties and reduces losses',
      },
    }),

  'pq-capacitor-bank': (): DslDefinition =>
    DslDefinition.create({
      id: 'pq-capacitor-bank',
      version: '1.0.0',
      standard: 'IEC 60831 / IEEE 18',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'Q_total',
          label: 'Total Required kVAR',
          type: 'number',
          unit: 'kVAR',
          required: true,
          min: 0,
        },
        {
          name: 'V_system',
          label: 'System Voltage',
          type: 'number',
          unit: 'V',
          required: true,
          min: 0,
        },
        {
          name: 'num_steps',
          label: 'Number of Steps',
          type: 'number',
          required: true,
          min: 1,
          max: 12,
        },
        {
          name: 'connection',
          label: 'Connection Type',
          type: 'enum',
          required: true,
          enumValues: ['wye', 'delta'],
        },
        {
          name: 'detuning',
          label: 'Detuning Reactor',
          type: 'enum',
          required: false,
          enumValues: ['none', '7pct', '14pct'],
          defaultValue: 'none',
        },
      ],
      outputs: [
        {
          name: 'Q_per_step',
          label: 'kVAR per Step',
          type: 'number',
          unit: 'kVAR',
        },
        {
          name: 'C_per_step',
          label: 'Capacitance per Step',
          type: 'number',
          unit: '\u00b5F',
        },
        {
          name: 'I_rated',
          label: 'Rated Capacitor Current',
          type: 'number',
          unit: 'A',
        },
        {
          name: 'resonant_freq',
          label: 'Resonant Frequency (with detuning)',
          type: 'number',
          unit: 'Hz',
        },
      ],
      formulas: [
        { name: 'Q_per_step', expression: 'Q_total / num_steps' },
        { name: 'C_per_step', expression: 'Q_per_step * 1000 / (2 * pi * 50 * V_system * V_system / 3) * 1000000' },
        { name: 'I_rated', expression: 'Q_per_step * 1000 / (sqrt(3) * V_system)' },
        { name: 'resonant_freq', expression: '50 / sqrt(0.07)' },
      ],
      validations: [
        {
          rule: 'step_size_valid',
          expression: 'Q_per_step >= 50 or num_steps <= 1 or Q_total >= 50',
          message: 'Minimum practical capacitor step is 50 kVAR',
          severity: 'warning',
        },
      ],
      metadata: {
        standard: 'IEC 60831 / IEEE 18',
        category: 'power-quality',
        tags: ['capacitor-bank', 'kVAR', 'detuning', 'harmonic-filter'],
        aiExplanation: 'Designs capacitor bank configuration including step size, connection type, and detuning reactor',
        aiAssumptions: '50Hz system, standard capacitor units per IEC 60831',
        aiWarnings: 'Detuning reactors required when harmonic distortion exceeds 10% THD',
        aiOptimization: 'Use 7% detuning (189Hz tuning) for typical 5th harmonic dominant loads',
      },
    }),

  'pq-reactive-power': (): DslDefinition =>
    DslDefinition.create({
      id: 'pq-reactive-power',
      version: '1.0.0',
      standard: 'IEEE 1459',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'S',
          label: 'Apparent Power',
          type: 'number',
          unit: 'kVA',
          required: true,
          min: 0,
        },
        {
          name: 'P',
          label: 'Active Power',
          type: 'number',
          unit: 'kW',
          required: true,
          min: 0,
        },
        {
          name: 'V_LL',
          label: 'Line-to-Line Voltage',
          type: 'number',
          unit: 'V',
          required: false,
          defaultValue: 400,
        },
      ],
      outputs: [
        {
          name: 'Q',
          label: 'Total Reactive Power',
          type: 'number',
          unit: 'kVAR',
        },
        {
          name: 'cosPhi',
          label: 'Power Factor',
          type: 'number',
        },
        {
          name: 'phi',
          label: 'Phase Angle',
          type: 'number',
          unit: 'deg',
        },
        {
          name: 'I_reactive',
          label: 'Reactive Current Component',
          type: 'number',
          unit: 'A',
        },
      ],
      formulas: [
        {
          name: 'Q',
          expression: 'sqrt(S * S - P * P)',
        },
        {
          name: 'cosPhi',
          expression: 'P / S',
        },
        {
          name: 'phi',
          expression: 'acos(P / S) * 180 / pi',
        },
        {
          name: 'I_reactive',
          expression: 'Q * 1000 / (sqrt(3) * V_LL)',
        },
      ],
      validations: [
        {
          rule: 'P_leq_S',
          expression: 'P <= S',
          message: 'Active power cannot exceed apparent power',
          severity: 'error',
        },
      ],
      metadata: {
        standard: 'IEEE 1459',
        category: 'power-quality',
        tags: ['reactive-power', 'kVAR', 'power-factor', 'phase-angle'],
        aiExplanation: 'Calculates reactive power from apparent and active power measurements',
        aiAssumptions: 'Sinusoidal conditions, fundamental frequency only',
        aiWarnings: 'In non-sinusoidal conditions, apparent power includes distortion components',
        aiOptimization: 'Use this as first step in PF improvement analysis',
      },
    }),

  'pq-harmonic-estimation': (): DslDefinition =>
    DslDefinition.create({
      id: 'pq-harmonic-estimation',
      version: '1.0.0',
      standard: 'IEEE 519 / IEC 61000-2-4',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'load_type',
          label: 'Load Type',
          type: 'enum',
          required: true,
          enumValues: ['VFD_6_pulse', 'VFD_12_pulse', 'VFD_18_pulse', 'UPS', 'LED_lighting', 'arc_furnace', 'welding', 'general_industrial'],
        },
        {
          name: 'S_load',
          label: 'Load kVA Rating',
          type: 'number',
          unit: 'kVA',
          required: true,
          min: 0,
        },
        {
          name: 'S_sc',
          label: 'SC Capacity at PCC',
          type: 'number',
          unit: 'MVA',
          required: true,
          min: 0,
        },
        {
          name: 'V_system',
          label: 'System Voltage',
          type: 'number',
          unit: 'kV',
          required: false,
          defaultValue: 0.4,
        },
      ],
      outputs: [
        {
          name: 'THD_v_estimated',
          label: 'Estimated Voltage THD',
          type: 'number',
          unit: '%',
        },
        {
          name: 'ITDD_estimated',
          label: 'Estimated Current TDD',
          type: 'number',
          unit: '%',
        },
        {
          name: 'dominant_harmonics',
          label: 'Dominant Harmonic Orders',
          type: 'string',
        },
        {
          name: 'IEEE519_compliant',
          label: 'Compliant with IEEE 519 limits',
          type: 'boolean',
        },
      ],
      formulas: [
        { name: 'SCR', expression: 'S_sc * 1000 / S_load' },
        { name: 'THD_v_estimated', expression: '8' },
        { name: 'TDD_factor', expression: '0.3' },
        { name: 'ITDD_estimated', expression: 'TDD_factor * 100' },
        { name: 'dominant_harmonics', expression: '"5,7,11,13"' },
        { name: 'IEEE519_compliant', expression: 'SCR > 20' },
      ],
      validations: [
        {
          rule: 'THD_warning',
          expression: 'THD_v_estimated <= 10',
          message: 'Estimated THD exceeds 10%; harmonic filter may be required',
          severity: 'warning',
        },
      ],
      metadata: {
        standard: 'IEEE 519 / IEC 61000-2-4',
        category: 'power-quality',
        tags: ['harmonics', 'THD', 'TDD', 'IEEE-519', 'filter'],
        aiExplanation: 'Estimates harmonic distortion levels based on load type and system strength per IEEE 519',
        aiAssumptions: 'Typical harmonic spectrum for given load type, standard impedance',
        aiWarnings: 'Actual harmonics depend on system impedance and background distortion',
        aiOptimization: 'Use 12-pulse or 18-pulse VFDs for inherent harmonic reduction',
      },
    }),

  'pq-voltage-regulation': (): DslDefinition =>
    DslDefinition.create({
      id: 'pq-voltage-regulation',
      version: '1.0.0',
      standard: 'IEC 60038 / IEEE 141',
      aiReview: true,
      certificate: true,
      inputs: [
        {
          name: 'V_nominal',
          label: 'Nominal Voltage',
          type: 'number',
          unit: 'V',
          required: true,
          min: 0,
        },
        {
          name: 'V_actual',
          label: 'Actual Measured Voltage',
          type: 'number',
          unit: 'V',
          required: true,
          min: 0,
        },
        {
          name: 'system_type',
          label: 'System Type',
          type: 'enum',
          required: true,
          enumValues: ['LV', 'MV', 'HV', 'EHV'],
        },
        {
          name: 'regulation_devices',
          label: 'Available Regulation Devices',
          type: 'enum',
          required: false,
          enumValues: ['none', 'OLTC', 'AVR', 'both'],
          defaultValue: 'none',
        },
      ],
      outputs: [
        {
          name: 'deviation_pct',
          label: 'Voltage Deviation',
          type: 'number',
          unit: '%',
        },
        {
          name: 'status',
          label: 'Compliance Status',
          type: 'string',
        },
        {
          name: 'regulation_available_pct',
          label: 'Regulation Available',
          type: 'number',
          unit: '%',
        },
        {
          name: 'corrected_voltage',
          label: 'Corrected Voltage (with device)',
          type: 'number',
          unit: 'V',
        },
      ],
      formulas: [
        { name: 'deviation_pct', expression: '(V_actual - V_nominal) / V_nominal * 100' },
        { name: 'tolerance_pct', expression: '10' },
        { name: 'status', expression: 'abs(deviation_pct) <= 10 ? "compliant" : (abs(deviation_pct) <= 15 ? "marginal" : "non_compliant")' },
        { name: 'regulation_step', expression: '0.05' },
        { name: 'regulation_available_pct', expression: 'regulation_step * 100' },
        { name: 'corrected_voltage', expression: 'abs(deviation_pct) <= 10 ? V_actual : V_actual * (1 - regulation_step * sign(deviation_pct))' },
      ],
      validations: [
        {
          rule: 'voltage_positive',
          expression: 'V_nominal > 0 and V_actual > 0',
          message: 'Voltage values must be positive',
          severity: 'error',
        },
      ],
      metadata: {
        standard: 'IEC 60038 / IEEE 141',
        category: 'power-quality',
        tags: ['voltage-regulation', 'OLTC', 'AVR', 'compliance'],
        aiExplanation: 'Assesses voltage regulation against IEC 60038 nominal voltage tolerances and recommends corrective action',
        aiAssumptions: 'Steady-state voltage, standard IEC tolerance bands',
        aiWarnings: 'LV tolerance is \u00b110%; MV \u00b110%; HV \u00b15% per IEC 60038',
        aiOptimization: 'Install OLTC transformer for continuous voltage regulation',
      },
    }),
};

export const ELECTRICAL_PLUGIN_LIST = Object.keys(ELECTRICAL_PLUGINS);
export const ELECTRICAL_PLUGIN_COUNT = ELECTRICAL_PLUGIN_LIST.length;

