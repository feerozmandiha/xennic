// ============================================================================
// Xennic Engineering Constants Library
// All values versioned and centralized. No duplicated constants anywhere.
// ============================================================================

// --- Fundamental Constants ---
export const PI = Math.PI;
export const E = Math.E;
export const SQRT3 = Math.sqrt(3);
export const SQRT2 = Math.sqrt(2);
export const DEG_TO_RAD = PI / 180;
export const RAD_TO_DEG = 180 / PI;

// --- Temperature Coefficients ---
export const TEMP_COEFF_COPPER = 0.00393;  // 1/°C at 20°C
export const TEMP_COEFF_ALUMINUM = 0.00403; // 1/°C at 20°C
export const TEMP_REFERENCE = 20;           // °C
export const TEMP_AMBIENT_DEFAULT = 40;     // °C
export const TEMP_OPERATING_MAX_CU = 90;    // °C XLPE
export const TEMP_OPERATING_MAX_AL = 90;    // °C XLPE
export const TEMP_SHORT_CIRCUIT_MAX_CU = 250; // °C
export const TEMP_SHORT_CIRCUIT_MAX_AL = 200; // °C

// --- Material Resistivity at 20°C (Ω·m) ---
export const RESISTIVITY_COPPER = 1.724e-8;   // Ω·m IEC 60028
export const RESISTIVITY_ALUMINUM = 2.826e-8; // Ω·m IEC 60028
export const RESISTIVITY_COPPER_ANNEALED = 1.7241e-8;
export const RESISTIVITY_ALUMINUM_1350 = 2.8264e-8;

// --- Conductivity (%IACS) ---
export const IACS_COPPER = 100;     // % 
export const IACS_ALUMINUM = 61;    // %

// --- Skin Effect Constants ---
export const SKIN_EFFECT_K = 1.0;   // general factor
export const SKIN_EFFECT_KS_60HZ = 1.02;  // typical at 60Hz
export const SKIN_EFFECT_KS_50HZ = 1.015; // typical at 50Hz

// --- Frequency ---
export const FREQ_50HZ = 50;
export const FREQ_60HZ = 60;
export const FREQ_RATED = 50;       // default

// --- Voltage ---
export const VOLTAGE_LV_MAX = 1000;     // V (IEC low voltage)
export const VOLTAGE_MV_MIN = 1001;     // V
export const VOLTAGE_MV_MAX = 35000;    // V
export const VOLTAGE_HV_MIN = 35001;    // V
export const VOLTAGE_TOLERANCE_NOMINAL = 0.05;  // ±5%
export const VOLTAGE_TOLERANCE_UTILITY = 0.10;   // ±10%
export const VOLTAGE_DROP_MAX_LV = 0.03;  // 3% IEC
export const VOLTAGE_DROP_MAX_MV = 0.05;  // 5%
export const VOLTAGE_DROP_TOTAL_MAX = 0.08; // 8% total

// --- Power Factor ---
export const PF_DEFAULT = 0.85;
export const PF_MOTOR = 0.85;
export const PF_LIGHTING = 0.95;
export const PF_OFFICE = 0.90;
export const PF_INDUSTRIAL = 0.80;
export const PF_TARGET_TYPICAL = 0.95;
export const PF_MIN_UTILITY = 0.90;

// --- IEC 60909 Voltage Factors ---
export const IEC_C_MAX_HV = 1.10;  // HV > 35kV
export const IEC_C_MAX_MV = 1.10;  // MV 1-35kV
export const IEC_C_MAX_LV = 1.05;  // LV < 1kV (tolerance +5%)
export const IEC_C_MIN_HV = 1.00;
export const IEC_C_MIN_MV = 1.00;
export const IEC_C_MIN_LV = 0.95;  // LV < 1kV (tolerance -5%)

// --- IEC 60909 Factors ---
export const IEC_KAPPA_FAR_FROM_GEN = 1.8;   // peak factor
export const IEC_KAPPA_NEAR_GEN = 2.0;
export const IEC_CHI_FAR_FROM_GEN = 0.85;    // DC component factor
export const IEC_CHI_NEAR_GEN = 1.0;
export const IEC_MU_FAR = 1.0;     // thermal equivalent factor
export const IEC_MU_NEAR = 1.15;
export const IEC_N_FAR = 0.5;      // thermal equivalent for 3ph
export const IEC_N_NEAR = 1.0;

// --- IEEE 80 Grounding ---
export const IEEE80_DEPTH_BURIED_DEFAULT = 0.5;   // m
export const IEEE80_CRUSHED_ROCK_RESISTIVITY = 3000; // Ω·m
export const IEEE80_SURFACE_LAYER_DEFAULT = 0.15;  // m
export const IEEE80_FATALITY_THRESHOLD_50KG = 0.116; // √s factor for 50kg
export const IEEE80_FATALITY_THRESHOLD_70KG = 0.157; // √s factor for 70kg
export const IEEE80_GRID_CONDUCTOR_KC = 1.0;
export const IEEE80_GRID_CONDUCTOR_KI = 1.0;

// --- IEC 60364 Factors ---
export const IEC60364_C1 = 0.95;   // voltage factor for L-N faults
export const IEC60364_C2 = 1.0;
export const IEC60364_C3 = 1.05;
export const IEC60364_ZERO_SEQUENCE_FACTOR_GEN = 0.3;

// --- Cable Factors ---
export const CABLE_GROUPING_RATING_FACTOR_SINGLE = 1.0;
export const CABLE_GROUPING_RATING_FACTOR_TWO = 0.80;
export const CABLE_GROUPING_RATING_FACTOR_THREE = 0.70;
export const CABLE_GROUPING_RATING_FACTOR_FOUR = 0.65;
export const CABLE_GROUPING_RATING_FACTOR_FIVE = 0.60;
export const CABLE_GROUPING_RATING_FACTOR_SIX_PLUS = 0.55;
export const CABLE_AMBIENT_TEMP_AIR_30 = 1.0;
export const CABLE_AMBIENT_TEMP_AIR_40 = 0.87;
export const CABLE_AMBIENT_TEMP_AIR_50 = 0.71;
export const CABLE_SOIL_THERMAL_RESISTIVITY_DEFAULT = 1.0;  // K·m/W
export const CABLE_SOIL_THERMAL_DRY = 2.5;   // K·m/W
export const CABLE_SOIL_THERMAL_WET = 0.7;   // K·m/W
export const CABLE_INSTALLATION_DEPTH_DEFAULT = 0.7;  // m
export const CABLE_INSTALLATION_DEPTH_DERATING_1M = 0.97;
export const CABLE_INSTALLATION_DEPTH_DERATING_1_5M = 0.93;

// --- Motor Constants ---
export const MOTOR_LRC_KVA_PER_HP_CODE_A = 3.15;  // NEMA MG-1
export const MOTOR_LRC_KVA_PER_HP_CODE_B = 3.55;
export const MOTOR_LRC_KVA_PER_HP_CODE_C = 4.0;
export const MOTOR_LRC_KVA_PER_HP_CODE_D = 4.5;
export const MOTOR_LRC_KVA_PER_HP_CODE_E = 5.0;
export const MOTOR_LRC_KVA_PER_HP_CODE_F = 5.6;
export const MOTOR_LRC_KVA_PER_HP_CODE_G = 6.29;
export const MOTOR_LRC_KVA_PER_HP_CODE_H = 7.1;
export const MOTOR_LRC_KVA_PER_HP_DEFAULT = 6.0;
export const MOTOR_EFFICIENCY_IE1 = 0.85;
export const MOTOR_EFFICIENCY_IE2 = 0.90;
export const MOTOR_EFFICIENCY_IE3 = 0.93;
export const MOTOR_EFFICIENCY_IE4 = 0.95;
export const MOTOR_PF_DEFAULT = 0.85;
export const MOTOR_START_PF = 0.30;
export const MOTOR_START_TIME_DEFAULT = 5;  // seconds
export const MOTOR_MAX_START_VOLTAGE_DIP = 0.15;  // 15%

// --- Transformer Constants ---
export const TRANSFORMER_EFF_DEFAULT = 0.98;
export const TRANSFORMER_IMPEDANCE_DEFAULT = 0.0575;  // 5.75%
export const TRANSFORMER_X_R_RATIO_DEFAULT = 5.0;
export const TRANSFORMER_NO_LOAD_LOSS_PCT = 0.005;  // 0.5%
export const TRANSFORMER_LOAD_LOSS_PCT = 0.01;       // 1.0%
export const TRANSFORMER_TEMP_RISE_DELTA = 65;       // K
export const TRANSFORMER_AMBIENT_MAX = 40;           // °C
export const TRANSFORMER_ALTITUDE_DERATING_1000M = 0.995; // per 100m above 1000m
export const TRANSFORMER_PARALLEL_IMPEDANCE_TOLERANCE = 0.10;  // 10%

// --- Protection Constants ---
export const PROTECTION_FUSE_MIN_RATIO = 1.25;    // fuse ≥ 125% of FLA
export const PROTECTION_MCB_TRIP_CLASS_B = 3;     // 3-5x In
export const PROTECTION_MCB_TRIP_CLASS_C = 5;     // 5-10x In
export const PROTECTION_MCB_TRIP_CLASS_D = 10;    // 10-20x In
export const PROTECTION_RELAY_CT_RATIO_MIN = 1.25;
export const PROTECTION_RELAY_PICKUP_MIN = 0.5;   // A
export const PROTECTION_COORDINATION_MARGIN = 0.2; // 20% margin
export const PROTECTION_BREAKING_CAPACITY_DEFAULT = 50000; // 50kA

// --- Grounding Constants ---
export const GROUNDING_K_FACTOR_COPPER = 7.01;     // IEEE 80 Table 2
export const GROUNDING_K_FACTOR_ALUMINUM = 4.45;
export const GROUNDING_K_FACTOR_GALVANIZED = 5.38;
export const GROUNDING_COPPER_CLAD_30 = 5.38;
export const GROUNDING_RESISTIVITY_DEFAULT = 100;   // Ω·m
export const GROUNDING_ROD_DIAMETER_DEFAULT = 0.016; // 5/8" in m
export const GROUNDING_ROD_LENGTH_DEFAULT = 2.4;    // 8 ft in m
export const GROUNDING_GRID_SPACING_DEFAULT = 3.0;  // m
export const GROUNDING_TOUCH_VOLTAGE_LIMIT_DEFAULT = 865; // V (50kg)
export const GROUNDING_STEP_VOLTAGE_LIMIT_DEFAULT = 2835; // V (50kg)

// --- Power Quality Constants ---
export const PQ_HARMONIC_VOLTAGE_THD_LIMIT_IEEE519 = 0.08;  // 8% for LV
export const PQ_HARMONIC_CURRENT_TDD_LIMIT_IEEE519 = 0.12;  // 12% for LV
export const PQ_CAPACITOR_BANK_STEP_MIN = 50;   // kVAR
export const PQ_CAPACITOR_BANK_STEP_MAX = 1000;  // kVAR
export const PQ_CAPACITOR_VOLTAGE_DETUNING = 0.07; // 7% detuning

// --- Environment ---
export const ENV_AIR_DENSITY_SEA_LEVEL = 1.225;  // kg/m³
export const ENV_AIR_DENSITY_1000M = 1.112;      // kg/m³
export const ENV_SOLAR_RADIATION_DEFAULT = 1000;  // W/m²
export const ENV_AMBIENT_TEMP_DEFAULT = 25;       // °C

// --- Wire Sizing ---
export const AWG_SIZES: Record<string, number> = {
  '18': 0.823, '16': 1.31, '14': 2.08, '12': 3.31, '10': 5.26,
  '8': 8.37, '6': 13.3, '4': 21.2, '3': 26.7, '2': 33.6,
  '1': 42.4, '1/0': 53.5, '2/0': 67.4, '3/0': 85.0, '4/0': 107.2,
  '250': 127, '300': 152, '350': 177, '400': 203, '500': 253,
  '600': 304, '750': 380, '1000': 507,
};

export const MM2_TO_KCMIL = 1.9735;  // conversion factor

// --- Metric Wire Sizes (mm²) ---
export const METRIC_CABLE_SIZES = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400, 500, 630, 800, 1000];

// --- NEC Table 250.66 GEC Sizing ---
export const NEC_GEC_SIZING: Array<{ min_kcmil: number; max_kcmil: number; gec_awg: string; gec_mm2: number }> = [
  { min_kcmil: 0, max_kcmil: 2, gec_awg: '8', gec_mm2: 8.37 },
  { min_kcmil: 2, max_kcmil: 3, gec_awg: '6', gec_mm2: 13.3 },
  { min_kcmil: 3, max_kcmil: 4, gec_awg: '4', gec_mm2: 21.2 },
  { min_kcmil: 4, max_kcmil: 250, gec_awg: '2', gec_mm2: 33.6 },
  { min_kcmil: 250, max_kcmil: 500, gec_awg: '1/0', gec_mm2: 53.5 },
  { min_kcmil: 500, max_kcmil: 900, gec_awg: '2/0', gec_mm2: 67.4 },
  { min_kcmil: 900, max_kcmil: 1200, gec_awg: '3/0', gec_mm2: 85.0 },
  { min_kcmil: 1200, max_kcmil: 2000, gec_awg: '4/0', gec_mm2: 107.2 },
];

// --- Safety Factors ---
export const SAFETY_FACTOR_CABLE = 1.1;
export const SAFETY_FACTOR_TRANSFORMER = 1.15;
export const SAFETY_FACTOR_PROTECTION = 1.25;
export const SAFETY_FACTOR_MOTOR = 1.1;
export const SAFETY_FACTOR_GROUNDING = 1.2;
