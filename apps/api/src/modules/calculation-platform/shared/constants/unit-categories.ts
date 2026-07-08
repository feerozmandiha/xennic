export const UNIT_CONVERSION_MATRIX: Record<string, { base: string; units: Record<string, { factor: number; offset?: number }> }> = {
  voltage: {
    base: 'V',
    units: {
      V: { factor: 1 },
      kV: { factor: 1000 },
      mV: { factor: 0.001 },
      MV: { factor: 1000000 },
    },
  },
  current: {
    base: 'A',
    units: {
      A: { factor: 1 },
      kA: { factor: 1000 },
      mA: { factor: 0.001 },
    },
  },
  power: {
    base: 'W',
    units: {
      W: { factor: 1 },
      kW: { factor: 1000 },
      MW: { factor: 1000000 },
      GW: { factor: 1000000000 },
      VA: { factor: 1 },
      kVA: { factor: 1000 },
      MVA: { factor: 1000000 },
      VAR: { factor: 1 },
      kVAR: { factor: 1000 },
      MVAR: { factor: 1000000 },
    },
  },
  energy: {
    base: 'Wh',
    units: {
      Wh: { factor: 1 },
      kWh: { factor: 1000 },
      MWh: { factor: 1000000 },
      J: { factor: 0.000277778 },
      MJ: { factor: 0.277778 },
      GJ: { factor: 277.778 },
    },
  },
  resistance: {
    base: 'Ω',
    units: {
      'Ω': { factor: 1 },
      'mΩ': { factor: 0.001 },
      'kΩ': { factor: 1000 },
      'MΩ': { factor: 1000000 },
    },
  },
  impedance: {
    base: 'Ω',
    units: {
      'Ω': { factor: 1 },
      'mΩ': { factor: 0.001 },
      'kΩ': { factor: 1000 },
      'MΩ': { factor: 1000000 },
    },
  },
  temperature: {
    base: 'K',
    units: {
      K: { factor: 1 },
      '°C': { factor: 1, offset: 273.15 },
      '°F': { factor: 0.5555555555555556, offset: 459.67 },
    },
  },
  pressure: {
    base: 'Pa',
    units: {
      Pa: { factor: 1 },
      kPa: { factor: 1000 },
      MPa: { factor: 1000000 },
      bar: { factor: 100000 },
      psi: { factor: 6894.76 },
      atm: { factor: 101325 },
    },
  },
  length: {
    base: 'm',
    units: {
      m: { factor: 1 },
      km: { factor: 1000 },
      cm: { factor: 0.01 },
      mm: { factor: 0.001 },
      ft: { factor: 0.3048 },
      in: { factor: 0.0254 },
      mi: { factor: 1609.34 },
    },
  },
  weight: {
    base: 'kg',
    units: {
      kg: { factor: 1 },
      g: { factor: 0.001 },
      mg: { factor: 0.000001 },
      t: { factor: 1000 },
      lb: { factor: 0.453592 },
      oz: { factor: 0.0283495 },
    },
  },
  force: {
    base: 'N',
    units: {
      N: { factor: 1 },
      kN: { factor: 1000 },
      lbf: { factor: 4.44822 },
    },
  },
  speed: {
    base: 'm/s',
    units: {
      'm/s': { factor: 1 },
      'km/h': { factor: 0.277778 },
      'ft/s': { factor: 0.3048 },
      mph: { factor: 0.44704 },
    },
  },
  frequency: {
    base: 'Hz',
    units: {
      Hz: { factor: 1 },
      kHz: { factor: 1000 },
      MHz: { factor: 1000000 },
      GHz: { factor: 1000000000 },
    },
  },
  time: {
    base: 's',
    units: {
      s: { factor: 1 },
      ms: { factor: 0.001 },
      min: { factor: 60 },
      h: { factor: 3600 },
      day: { factor: 86400 },
      year: { factor: 31536000 },
    },
  },
  area: {
    base: 'm²',
    units: {
      'm²': { factor: 1 },
      'cm²': { factor: 0.0001 },
      'mm²': { factor: 0.000001 },
      'ft²': { factor: 0.092903 },
      'in²': { factor: 0.00064516 },
    },
  },
  volume: {
    base: 'm³',
    units: {
      'm³': { factor: 1 },
      mL: { factor: 0.000001 },
      gal: { factor: 0.00378541 },
      'ft³': { factor: 0.0283168 },
    },
  },
  mass: {
    base: 'kg',
    units: {
      kg: { factor: 1 },
      g: { factor: 0.001 },
      mg: { factor: 0.000001 },
      t: { factor: 1000 },
      lb: { factor: 0.453592 },
    },
  },
};
