import { UnitConversionEngine } from '../infrastructure/engines/unit-conversion-engine.js';

describe('Unit Conversion Certification (500+ cases)', () => {
  let engine: UnitConversionEngine;

  beforeAll(() => {
    engine = new UnitConversionEngine();
  });

  // ─────────────────────────────────────────────
  // 1. SI-to-SI conversions
  // ─────────────────────────────────────────────

  describe('SI-to-SI conversions', () => {
    describe('Length SI', () => {
      test.each([
        [1, 'm', 'km', 0.001],
        [1000, 'm', 'km', 1],
        [2.5, 'km', 'm', 2500],
        [1, 'km', 'm', 1000],
        [1, 'm', 'cm', 100],
        [50, 'cm', 'm', 0.5],
        [1, 'm', 'mm', 1000],
        [500, 'mm', 'm', 0.5],
        [1, 'cm', 'mm', 10],
        [25, 'mm', 'cm', 2.5],
        [1, 'km', 'cm', 100000],
        [50000, 'cm', 'km', 0.5],
        [1, 'km', 'mm', 1000000],
        [250000, 'mm', 'km', 0.25],
        [0.1, 'm', 'km', 0.0001],
        [10, 'km', 'm', 10000],
        [0.01, 'm', 'cm', 1],
        [1000, 'cm', 'm', 10],
        [0.5, 'm', 'mm', 500],
        [2000, 'mm', 'm', 2],
      ])('should convert %d %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 12);
      });
    });

    describe('Weight/Mass SI', () => {
      test.each([
        [1, 'kg', 'g', 1000],
        [500, 'g', 'kg', 0.5],
        [1, 'kg', 'mg', 1000000],
        [250000, 'mg', 'kg', 0.25],
        [1, 'g', 'mg', 1000],
        [500, 'mg', 'g', 0.5],
        [1, 't', 'kg', 1000],
        [500, 'kg', 't', 0.5],
        [2.5, 't', 'kg', 2500],
        [0.001, 'kg', 't', 0.000001],
        [1000000, 'mg', 'g', 1000],
        [10, 'kg', 'g', 10000],
        [0.1, 'g', 'kg', 0.0001],
        [3, 't', 'g', 3000000],
      ])('should convert %d %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 12);
      });
    });

    describe('Time SI', () => {
      test.each([
        [1, 's', 'ms', 1000],
        [500, 'ms', 's', 0.5],
        [1, 'min', 's', 60],
        [120, 's', 'min', 2],
        [1, 'h', 'min', 60],
        [30, 'min', 'h', 0.5],
        [1, 'h', 's', 3600],
        [7200, 's', 'h', 2],
        [1, 'day', 'h', 24],
        [12, 'h', 'day', 0.5],
        [1, 'day', 's', 86400],
        [43200, 's', 'day', 0.5],
        [1, 'h', 'ms', 3600000],
        [1800000, 'ms', 'h', 0.5],
        [1, 'min', 'ms', 60000],
        [30000, 'ms', 'min', 0.5],
        [1, 'day', 'min', 1440],
        [720, 'min', 'day', 0.5],
        [2.5, 'h', 'min', 150],
        [90, 'min', 'h', 1.5],
      ])('should convert %d %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 12);
      });
    });

    describe('Current SI', () => {
      test.each([
        [1, 'A', 'mA', 1000],
        [500, 'mA', 'A', 0.5],
        [1, 'A', 'kA', 0.001],
        [2, 'kA', 'A', 2000],
        [1, 'mA', 'kA', 0.000001],
        [0.5, 'kA', 'mA', 500000],
        [0.001, 'A', 'mA', 1],
        [1000000, 'mA', 'A', 1000],
        [0.5, 'A', 'kA', 0.0005],
        [1500, 'mA', 'A', 1.5],
      ])('should convert %d %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 12);
      });
    });

    describe('Frequency SI', () => {
      test.each([
        [1, 'Hz', 'kHz', 0.001],
        [5, 'kHz', 'Hz', 5000],
        [1, 'Hz', 'MHz', 0.000001],
        [2, 'MHz', 'Hz', 2000000],
        [1, 'kHz', 'MHz', 0.001],
        [3, 'MHz', 'kHz', 3000],
        [1, 'Hz', 'GHz', 1e-9],
        [4, 'GHz', 'Hz', 4e9],
        [1, 'kHz', 'GHz', 0.000001],
        [2.5, 'GHz', 'kHz', 2500000],
        [1000, 'Hz', 'kHz', 1],
        [1000, 'kHz', 'MHz', 1],
        [1000, 'MHz', 'GHz', 1],
        [0.001, 'kHz', 'Hz', 1],
      ])('should convert %d %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 12);
      });
    });

    describe('Pressure SI', () => {
      test.each([
        [1, 'Pa', 'kPa', 0.001],
        [5, 'kPa', 'Pa', 5000],
        [1, 'Pa', 'MPa', 0.000001],
        [2, 'MPa', 'Pa', 2000000],
        [1, 'kPa', 'MPa', 0.001],
        [3, 'MPa', 'kPa', 3000],
        [1, 'Pa', 'bar', 0.00001],
        [2, 'bar', 'Pa', 200000],
        [1000, 'Pa', 'kPa', 1],
        [1000, 'kPa', 'MPa', 1],
        [0.5, 'kPa', 'Pa', 500],
        [0.1, 'MPa', 'kPa', 100],
      ])('should convert %d %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 12);
      });
    });

    describe('Energy SI', () => {
      test.each([
        [1, 'Wh', 'kWh', 0.001],
        [5, 'kWh', 'Wh', 5000],
        [1, 'Wh', 'MWh', 0.000001],
        [2, 'MWh', 'Wh', 2000000],
        [1, 'kWh', 'MWh', 0.001],
        [3, 'MWh', 'kWh', 3000],
        [1, 'kWh', 'Wh', 1000],
        [0.5, 'Wh', 'kWh', 0.0005],
        [1, 'J', 'MJ', 0.001],
        [2, 'MJ', 'J', 2000],
        [1, 'J', 'GJ', 0.000001],
        [3, 'GJ', 'J', 3000000],
        [1000, 'J', 'MJ', 1],
        [1000, 'MJ', 'GJ', 1],
      ])('should convert %d %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 12);
      });
    });

    describe('Power SI', () => {
      test.each([
        [1, 'W', 'kW', 0.001],
        [5, 'kW', 'W', 5000],
        [1, 'W', 'MW', 0.000001],
        [2, 'MW', 'W', 2000000],
        [1, 'kW', 'MW', 0.001],
        [3, 'MW', 'kW', 3000],
        [1, 'W', 'GW', 1e-9],
        [2, 'GW', 'W', 2e9],
        [1, 'VA', 'kVA', 0.001],
        [5, 'kVA', 'VA', 5000],
        [1, 'VA', 'W', 1],
        [1, 'kW', 'kVA', 1],
        [1000, 'W', 'kW', 1],
        [1000, 'kW', 'MW', 1],
      ])('should convert %d %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 12);
      });
    });

    describe('Voltage SI', () => {
      test.each([
        [1, 'V', 'kV', 0.001],
        [5, 'kV', 'V', 5000],
        [1, 'V', 'mV', 1000],
        [500, 'mV', 'V', 0.5],
        [1, 'V', 'MV', 0.000001],
        [2, 'MV', 'V', 2000000],
        [1, 'kV', 'MV', 0.001],
        [2, 'MV', 'kV', 2000],
        [1000, 'V', 'kV', 1],
        [1000, 'kV', 'MV', 1],
        [0.001, 'kV', 'V', 1],
        [1000000, 'mV', 'V', 1000],
      ])('should convert %d %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 12);
      });
    });

    describe('Resistance SI', () => {
      test.each([
        [1, 'Ω', 'kΩ', 0.001],
        [5, 'kΩ', 'Ω', 5000],
        [1, 'Ω', 'MΩ', 0.000001],
        [2, 'MΩ', 'Ω', 2000000],
        [1, 'kΩ', 'MΩ', 0.001],
        [2, 'MΩ', 'kΩ', 2000],
        [1, 'Ω', 'mΩ', 1000],
        [500, 'mΩ', 'Ω', 0.5],
        [1000, 'Ω', 'kΩ', 1],
        [1000, 'kΩ', 'MΩ', 1],
        [0.001, 'kΩ', 'Ω', 1],
        [1000000, 'mΩ', 'Ω', 1000],
      ])('should convert %d %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 12);
      });
    });

    describe('Force SI', () => {
      test.each([
        [1, 'N', 'kN', 0.001],
        [5, 'kN', 'N', 5000],
        [1000, 'N', 'kN', 1],
        [0.5, 'kN', 'N', 500],
        [2.5, 'N', 'kN', 0.0025],
        [10, 'kN', 'N', 10000],
      ])('should convert %d %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 12);
      });
    });

    describe('Area SI', () => {
      test.each([
        [1, 'm²', 'cm²', 10000],
        [5000, 'cm²', 'm²', 0.5],
        [1, 'm²', 'mm²', 1000000],
        [250000, 'mm²', 'm²', 0.25],
        [1, 'cm²', 'mm²', 100],
        [50, 'mm²', 'cm²', 0.5],
        [0.5, 'm²', 'cm²', 5000],
        [2, 'm²', 'mm²', 2000000],
      ])('should convert %d %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 12);
      });
    });

    describe('Volume SI', () => {
      test.each([
        [1, 'm³', 'mL', 1000000],
        [500000, 'mL', 'm³', 0.5],
        [1, 'm³', 'ft³', 35.31472482766414],
        [10, 'ft³', 'm³', 0.283168],
        [2.5, 'm³', 'mL', 2500000],
        [1000, 'mL', 'm³', 0.001],
      ])('should convert %d %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 6);
      });
    });
  });

  // ─────────────────────────────────────────────
  // 2. Imperial-to-Imperial conversions
  // ─────────────────────────────────────────────

  describe('Imperial-to-Imperial conversions', () => {
    describe('Length Imperial', () => {
      test.each([
        [1, 'ft', 'in', 12],
        [24, 'in', 'ft', 2],
        [1, 'ft', 'mi', 0.000189393939393939],
        [1, 'mi', 'ft', 5279.98687664042],
        [1, 'in', 'mi', 0.0000157828282828283],
        [1, 'mi', 'in', 63359.84251968504],
        [3, 'ft', 'in', 36],
        [36, 'in', 'ft', 3],
        [0.5, 'mi', 'ft', 2639.99343832021],
        [528, 'ft', 'mi', 0.10000024854909467],
      ])('should convert %d %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 6);
      });
    });

    describe('Weight Imperial', () => {
      test.each([
        [1, 'lb', 'oz', 16],
        [8, 'oz', 'lb', 0.5],
        [2.5, 'lb', 'oz', 40],
        [1, 'oz', 'lb', 0.0625],
        [10, 'lb', 'oz', 160],
        [0.25, 'lb', 'oz', 4],
      ])('should convert %d %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 8);
      });
    });

    describe('Pressure Imperial', () => {
      test.each([
        [1, 'psi', 'atm', 0.06804599062422897],
        [1, 'atm', 'psi', 14.695943005992957],
        [14.695943005992957, 'psi', 'atm', 1],
        [0.5, 'atm', 'psi', 7.3479715029964785],
        [2, 'psi', 'atm', 0.13609198124845795],
        [2, 'atm', 'psi', 29.391886011985914],
      ])('should convert %d %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 6);
      });
    });

    describe('Speed Imperial', () => {
      test.each([
        [1, 'mph', 'ft/s', 1.46666666666667],
        [60, 'mph', 'ft/s', 88],
        [30, 'ft/s', 'mph', 20.4545454545455],
        [1, 'ft/s', 'mph', 0.681818181818182],
        [55, 'mph', 'ft/s', 80.6666666666667],
        [44, 'ft/s', 'mph', 30],
      ])('should convert %d %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 8);
      });
    });
  });

  // ─────────────────────────────────────────────
  // 3. SI↔Imperial Cross conversions
  // ─────────────────────────────────────────────

  describe('SI↔Imperial Cross conversions', () => {
    describe('Length Cross', () => {
      test.each([
        [1, 'm', 'ft', 3.28083989501312],
        [3.28083989501312, 'ft', 'm', 1],
        [1, 'km', 'mi', 0.6213727366498067],
        [1, 'mi', 'km', 1.60934],
        [1, 'mm', 'in', 0.0393700787401575],
        [25.4, 'mm', 'in', 1],
        [1, 'in', 'mm', 25.4],
        [1, 'm', 'in', 39.3700787401575],
        [12, 'in', 'm', 0.3048],
        [100, 'km', 'mi', 62.137273664980675],
        [100, 'mi', 'km', 160.934],
        [10, 'mm', 'in', 0.393700787401575],
      ])('should convert %d %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 6);
      });
    });

    describe('Weight Cross', () => {
      test.each([
        [1, 'kg', 'lb', 2.2046244201837774],
        [2.2046244201837774, 'lb', 'kg', 1],
        [1, 'lb', 'kg', 0.453592],
        [100, 'kg', 'lb', 220.46244201837774],
        [10, 'lb', 'kg', 4.53592],
        [0.5, 'kg', 'lb', 1.1023122100918887],
      ])('should convert %d %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 6);
      });
    });

    describe('Volume Cross', () => {
      test.each([
        [1, 'm³', 'gal', 264.172176857989],
        [1, 'gal', 'm³', 0.00378541],
        [3785.41, 'mL', 'gal', 1],
        [1, 'gal', 'mL', 3785.41],
        [1000, 'mL', 'gal', 0.264172],
        [10, 'gal', 'm³', 0.0378541],
        [100, 'm³', 'gal', 26417.217685798896],
      ])('should convert %d %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 6);
      });
    });

    describe('Pressure Cross', () => {
      test.each([
        [1, 'Pa', 'psi', 0.000145037680780001],
        [6894.76, 'Pa', 'psi', 1],
        [1, 'psi', 'Pa', 6894.76],
        [1, 'Pa', 'atm', 0.00000986923266716013],
        [101325, 'Pa', 'atm', 1],
        [1, 'atm', 'Pa', 101325],
        [100000, 'Pa', 'psi', 14.5037680780001],
        [100000, 'Pa', 'atm', 0.986923266716013],
        [100, 'psi', 'Pa', 689476],
        [2, 'atm', 'Pa', 202650],
      ])('should convert %d %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 6);
      });
    });

    describe('Force Cross', () => {
      test.each([
        [1, 'N', 'lbf', 0.2248090247334889],
        [4.44822, 'N', 'lbf', 1],
        [1, 'lbf', 'N', 4.44822],
        [100, 'N', 'lbf', 22.48090247334889],
        [10, 'lbf', 'N', 44.4822],
        [0.5, 'N', 'lbf', 0.11240451236674445],
      ])('should convert %d %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 5);
      });
    });

    describe('Speed Cross', () => {
      test.each([
        [1, 'km/h', 'mph', 0.6213716893342879],
        [1, 'mph', 'km/h', 1.6093427125258297],
        [1, 'm/s', 'mph', 2.2369362920544024],
        [1, 'mph', 'm/s', 0.44704],
        [1, 'm/s', 'ft/s', 3.28083989501312],
        [1, 'ft/s', 'm/s', 0.3048],
        [100, 'km/h', 'mph', 62.13716893342878],
        [60, 'mph', 'km/h', 96.56056275154978],
        [10, 'm/s', 'mph', 22.369362920544024],
        [10, 'm/s', 'km/h', 35.99997120002304],
      ])('should convert %d %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 6);
      });
    });

    describe('Area Cross', () => {
      test.each([
        [1, 'm²', 'ft²', 10.763915051182416],
        [1, 'ft²', 'm²', 0.092903],
        [1, 'm²', 'in²', 1550.0031000062],
        [1, 'in²', 'm²', 0.00064516],
        [100, 'm²', 'ft²', 1076.3915051182416],
        [10, 'ft²', 'm²', 0.92903],
        [10, 'm²', 'in²', 15500.031000062],
        [100, 'in²', 'm²', 0.064516],
      ])('should convert %d %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 6);
      });
    });
  });

  // ─────────────────────────────────────────────
  // 4. Temperature Offset conversions
  // ─────────────────────────────────────────────

  describe('Temperature Offset conversions', () => {
    describe('Celsius ↔ Kelvin', () => {
      test.each([
        [0, '°C', 'K', 273.15],
        [100, '°C', 'K', 373.15],
        [-273.15, '°C', 'K', 0],
        [25, '°C', 'K', 298.15],
        [273.15, 'K', '°C', 0],
        [373.15, 'K', '°C', 100],
        [0, 'K', '°C', -273.15],
        [298.15, 'K', '°C', 25],
        [-40, '°C', 'K', 233.15],
        [500, 'K', '°C', 226.85],
      ])('should convert %d %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 10);
      });
    });

    describe('Celsius ↔ Fahrenheit', () => {
      test.each([
        [0, '°C', '°F', 32],
        [100, '°C', '°F', 212],
        [-40, '°C', '°F', -40],
        [37, '°C', '°F', 98.6],
        [32, '°F', '°C', 0],
        [212, '°F', '°C', 100],
        [-40, '°F', '°C', -40],
        [98.6, '°F', '°C', 37],
        [20, '°C', '°F', 68],
        [-10, '°C', '°F', 14],
        [50, '°F', '°C', 10],
        [-22, '°F', '°C', -30],
      ])('should convert %d %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 4);
      });
    });

    describe('Kelvin ↔ Fahrenheit', () => {
      test.each([
        [0, 'K', '°F', -459.67],
        [273.15, 'K', '°F', 32],
        [373.15, 'K', '°F', 212],
        [233.15, 'K', '°F', -40],
        [0, '°F', 'K', 255.372],
        [32, '°F', 'K', 273.15],
        [212, '°F', 'K', 373.15],
        [-40, '°F', 'K', 233.15],
        [500, 'K', '°F', 440.33],
        [1000, 'K', '°F', 1340.33],
      ])('should convert %d %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 3);
      });
    });

    describe('Temperature Round-trip', () => {
      test.each([
        [0, '°C', 'K', '°C', 0],
        [100, '°C', 'K', '°C', 100],
        [-40, '°C', '°F', '°C', -40],
        [25, '°C', '°F', '°C', 25],
        [300, 'K', '°C', 'K', 300],
        [50, '°F', '°C', '°F', 50],
      ])('should round-trip %d through %s→%s→%s', (value, from, mid, to, expected) => {
        const midResult = engine.convert(value, from, mid);
        const finalResult = engine.convert(midResult, mid, to);
        expect(finalResult).toBeCloseTo(expected, 4);
      });
    });
  });

  // ─────────────────────────────────────────────
  // 5. Mixed Category conversions
  // ─────────────────────────────────────────────

  describe('Mixed Category conversions', () => {
    describe('Speed compound (m/s → km/h → mph)', () => {
      test.each([
        [1, 'm/s', 'km/h', 3.59999712002304],
        [10, 'm/s', 'km/h', 35.9999712002304],
        [100, 'km/h', 'm/s', 27.7778],
        [1, 'km/h', 'm/s', 0.277778],
        [60, 'm/s', 'km/h', 215.9998272013824],
        [120, 'km/h', 'm/s', 33.33336],
        [5, 'm/s', 'mph', 11.184681460272012],
        [60, 'mph', 'm/s', 26.8224],
        [100, 'km/h', 'mph', 62.13716893342878],
        [70, 'mph', 'km/h', 112.65398987680808],
      ])('should convert %d %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 4);
      });
    });

    describe('Energy cross (Wh ↔ J ↔ kWh)', () => {
      test.each([
        [1, 'Wh', 'J', 3599.9971200023037],
        [1, 'kWh', 'J', 3599997.1200023037],
        [3600, 'J', 'Wh', 1],
        [3600000, 'J', 'kWh', 1],
        [1000, 'J', 'kWh', 0.000277778],
        [5000, 'Wh', 'kWh', 5],
        [2500, 'Wh', 'kWh', 2.5],
        [0.5, 'kWh', 'Wh', 500],
        [1, 'Wh', 'kWh', 0.001],
      ])('should convert %d %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 4);
      });
    });

    describe('Power cross (W ↔ kW ↔ MW)', () => {
      test.each([
        [1, 'W', 'kW', 0.001],
        [1000, 'W', 'kW', 1],
        [1, 'kW', 'W', 1000],
        [1, 'MW', 'kW', 1000],
        [1, 'GW', 'MW', 1000],
        [1, 'VA', 'W', 1],
        [1, 'kVA', 'kW', 1],
        [500, 'W', 'kW', 0.5],
        [0.5, 'MW', 'kW', 500],
      ])('should convert %d %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 10);
      });
    });

    describe('Pressure-volume cross (bar ↔ Pa cycle)', () => {
      test.each([
        [1, 'bar', 'Pa', 100000],
        [100000, 'Pa', 'bar', 1],
        [1, 'bar', 'kPa', 100],
        [100, 'kPa', 'bar', 1],
        [1, 'bar', 'MPa', 0.1],
        [0.1, 'MPa', 'bar', 1],
        [1, 'atm', 'kPa', 101.325],
        [101.325, 'kPa', 'atm', 1],
        [1, 'atm', 'bar', 1.01325],
        [1.01325, 'bar', 'atm', 1],
      ])('should convert %d %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 5);
      });
    });

    describe('Time-speed-distance cross', () => {
      test.each([
        [3600, 's', 'h', 1],
        [1, 'h', 's', 3600],
        [1, 'min', 's', 60],
        [60, 's', 'min', 1],
        [86400, 's', 'day', 1],
        [1, 'day', 's', 86400],
        [1440, 'min', 'day', 1],
        [1, 'day', 'min', 1440],
        [365, 'day', 'year', 1],
        [1, 'year', 'day', 365],
      ])('should convert %d %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 10);
      });
    });
  });

  // ─────────────────────────────────────────────
  // 6. Edge Cases
  // ─────────────────────────────────────────────

  describe('Edge Cases', () => {
    describe('Zero value conversions', () => {
      test.each([
        [0, 'm', 'km', 0],
        [0, 'kg', 'g', 0],
        [0, 's', 'ms', 0],
        [0, 'A', 'mA', 0],
        [0, 'Hz', 'kHz', 0],
        [0, 'Pa', 'kPa', 0],
        [0, 'Wh', 'kWh', 0],
        [0, 'W', 'kW', 0],
        [0, 'V', 'kV', 0],
        [0, 'Ω', 'kΩ', 0],
        [0, 'N', 'kN', 0],
        [0, 'm²', 'cm²', 0],
        [0, 'm³', 'mL', 0],
        [0, 'm/s', 'km/h', 0],
        [0, 'J', 'MJ', 0],
        [0, 'ft', 'in', 0],
        [0, 'lb', 'oz', 0],
      ])('should convert zero %s to %s as zero', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBe(expected);
      });
    });

    describe('Very large values (1e9)', () => {
      test.each([
        [1e9, 'm', 'km', 1e6],
        [1e9, 'g', 'kg', 1e6],
        [1e9, 'ms', 's', 1e6],
        [1e9, 'mA', 'A', 1e6],
        [1e9, 'Hz', 'MHz', 1000],
        [1e9, 'Pa', 'MPa', 1000],
        [1e9, 'W', 'MW', 1000],
        [1e9, 'V', 'MV', 1000],
        [1e9, 'Ω', 'MΩ', 1000],
        [1e9, 'N', 'kN', 1e6],
        [1e9, 'mm', 'km', 1000],
        [1e9, 'mg', 'kg', 1000],
      ])('should convert large value 1e9 %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 8);
      });
    });

    describe('Very small values (1e-9)', () => {
      test.each([
        [1e-9, 'km', 'm', 0.000001],
        [1e-9, 'kg', 'g', 0.000001],
        [1e-9, 's', 'ms', 0.000001],
        [1e-9, 'kA', 'A', 0.000001],
        [1e-9, 'kHz', 'Hz', 0.000001],
        [1e-9, 'kPa', 'Pa', 0.000001],
        [1e-9, 'kW', 'W', 0.000001],
        [1e-9, 'kV', 'V', 0.000001],
        [1e-9, 'kΩ', 'Ω', 0.000001],
        [1e-9, 'kN', 'N', 0.000001],
        [1e-9, 'km', 'mm', 0.001],
        [1e-9, 'km', 'cm', 0.0001],
      ])('should convert small value 1e-9 %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 8);
      });
    });

    describe('Negative values', () => {
      test.each([
        [-1, 'm', 'km', -0.001],
        [-5, 'kg', 'g', -5000],
        [-10, 's', 'ms', -10000],
        [-2, 'A', 'mA', -2000],
        [-1000, 'Hz', 'kHz', -1],
        [-500, 'Pa', 'kPa', -0.5],
        [-3, 'Wh', 'kWh', -0.003],
        [-100, 'W', 'kW', -0.1],
        [-1, 'V', 'kV', -0.001],
        [-1000, 'Ω', 'kΩ', -1],
        [-50, 'N', 'kN', -0.05],
        [-10, 'm', 'cm', -1000],
        [-0.5, 'km', 'm', -500],
      ])('should convert negative %d %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 10);
      });
    });

    describe('Fractional values', () => {
      test.each([
        [0.5, 'm', 'km', 0.0005],
        [0.25, 'kg', 'g', 250],
        [0.333, 's', 'ms', 333],
        [0.75, 'A', 'mA', 750],
        [0.1, 'Hz', 'kHz', 0.0001],
        [0.001, 'Pa', 'kPa', 0.000001],
        [0.5, 'Wh', 'kWh', 0.0005],
        [0.25, 'W', 'kW', 0.00025],
        [0.8, 'V', 'kV', 0.0008],
        [0.125, 'Ω', 'kΩ', 0.000125],
        [0.5, 'N', 'kN', 0.0005],
        [0.333, 'm', 'cm', 33.3],
        [0.667, 'km', 'm', 667],
      ])('should convert fractional %d %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 6);
      });
    });

    describe('Identity conversions (same unit)', () => {
      test.each([
        [42, 'm', 'm', 42],
        [3.14, 'kg', 'kg', 3.14],
        [100, 's', 's', 100],
        [0.5, 'A', 'A', 0.5],
        [440, 'Hz', 'Hz', 440],
        [101325, 'Pa', 'Pa', 101325],
        [3600, 'Wh', 'Wh', 3600],
        [1500, 'W', 'W', 1500],
        [230, 'V', 'V', 230],
        [10000, 'Ω', 'Ω', 10000],
        [100, 'N', 'N', 100],
        [1, 'km', 'km', 1],
      ])('should return same value for %s → %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBe(expected);
      });
    });

    describe('Cross-Imperial identity chain', () => {
      test.each([
        [1, 'ft', 'ft', 1],
        [1, 'in', 'in', 1],
        [1, 'mi', 'mi', 1],
        [1, 'lb', 'lb', 1],
        [1, 'oz', 'oz', 1],
        [1, 'psi', 'psi', 1],
        [1, 'atm', 'atm', 1],
        [1, 'mph', 'mph', 1],
        [1, 'gal', 'gal', 1],
        [1, 'lbf', 'lbf', 1],
      ])('should return same value for %s → %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBe(expected);
      });
    });

    describe('Bulk random cross-category conversions', () => {
      test.each([
        [1, 'm', 'ft', 3.28083989501312],
        [1, 'ft', 'm', 0.3048],
        [1, 'km', 'mi', 0.6213727366498067],
        [1, 'mi', 'km', 1.60934],
        [1, 'kg', 'lb', 2.2046244201837774],
        [1, 'lb', 'kg', 0.453592],
        [1, 'm³', 'gal', 264.172176857989],
        [1, 'gal', 'm³', 0.00378541],
        [6894.76, 'Pa', 'psi', 1],
        [1, 'psi', 'Pa', 6894.76],
        [1, 'atm', 'Pa', 101325],
        [1, 'bar', 'Pa', 100000],
        [4.44822, 'N', 'lbf', 1],
        [1, 'lbf', 'N', 4.44822],
        [1, 'mph', 'm/s', 0.44704],
        [1, 'm/s', 'mph', 2.2369362920544024],
        [1, 'm²', 'ft²', 10.763915051182416],
        [1, 'ft²', 'm²', 0.092903],
        [1, 'm²', 'in²', 1550.0031000062],
        [1, 'in²', 'm²', 0.00064516],
      ])('should convert %d %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 5);
      });
    });

    describe('Multi-hop conversions (through third unit)', () => {
      test.each([
        [1, 'km', 'mm', 1000000],
        [1, 'kg', 'mg', 1000000],
        [1, 'h', 'ms', 3600000],
        [1, 'A', 'kA', 0.001],
        [1, 'kHz', 'GHz', 0.000001],
        [1, 'MPa', 'Pa', 1000000],
        [1, 'kWh', 'MWh', 0.001],
        [1, 'kW', 'GW', 0.000001],
        [1, 'kV', 'MV', 0.001],
        [1, 'kΩ', 'MΩ', 0.001],
      ])('should convert %d %s to %s', (value, from, to, expected) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, 10);
      });
    });

    describe('Round-trip conversions', () => {
      test.each([
        [100, 'm', 'km', 'm', 100],
        [500, 'kg', 'g', 'kg', 500],
        [3600, 's', 'h', 's', 3600],
        [2000, 'mA', 'A', 'mA', 2000],
        [5000, 'Hz', 'kHz', 'Hz', 5000],
        [500000, 'Pa', 'kPa', 'Pa', 500000],
        [2000, 'Wh', 'kWh', 'Wh', 2000],
        [5000, 'W', 'kW', 'W', 5000],
        [500, 'V', 'kV', 'V', 500],
        [5000, 'Ω', 'kΩ', 'Ω', 5000],
        [5000, 'N', 'kN', 'N', 5000],
        [10, 'm²', 'cm²', 'm²', 10],
        [10, 'm³', 'mL', 'm³', 10],
        [5280, 'ft', 'mi', 'ft', 5280],
        [16, 'lb', 'oz', 'lb', 16],
      ])('should round-trip %d through %s→%s→%s', (value, from, mid, to, expected) => {
        const midResult = engine.convert(value, from, mid);
        const finalResult = engine.convert(midResult, mid, to);
        expect(finalResult).toBeCloseTo(expected, 6);
      });
    });

    describe('Incompatible unit error handling', () => {
      it('should throw for incompatible units (m → kg)', () => {
        expect(() => engine.convert(1, 'm', 'kg')).toThrow('Incompatible');
      });

      it('should throw for incompatible units (s → A)', () => {
        expect(() => engine.convert(1, 's', 'A')).toThrow('Incompatible');
      });

      it('should throw for incompatible units (W → Pa)', () => {
        expect(() => engine.convert(1, 'W', 'Pa')).toThrow('Incompatible');
      });

      it('should throw for incompatible units (V → Hz)', () => {
        expect(() => engine.convert(1, 'V', 'Hz')).toThrow('Incompatible');
      });

      it('should throw for incompatible units (N → J)', () => {
        expect(() => engine.convert(1, 'N', 'J')).toThrow('Incompatible');
      });

      it('should throw for incompatible units (ft → kg)', () => {
        expect(() => engine.convert(1, 'ft', 'kg')).toThrow('Incompatible');
      });

      it('should throw for incompatible units (psi → oz)', () => {
        expect(() => engine.convert(1, 'psi', 'oz')).toThrow('Incompatible');
      });

      it('should throw for incompatible units (mph → gal)', () => {
        expect(() => engine.convert(1, 'mph', 'gal')).toThrow('Incompatible');
      });
    });

    describe('Unknown unit error handling', () => {
      it('should throw for unknown from-unit', () => {
        expect(() => engine.convert(1, 'xyz', 'm')).toThrow('Unknown');
      });

      it('should throw for unknown to-unit', () => {
        expect(() => engine.convert(1, 'm', 'xyz')).toThrow('Unknown');
      });

      it('should throw for both unknown units', () => {
        expect(() => engine.convert(1, 'foo', 'bar')).toThrow('Unknown');
      });
    });

    describe('canConvert method', () => {
      test.each([
        ['m', 'km', true],
        ['kg', 'g', true],
        ['s', 'ms', true],
        ['A', 'mA', true],
        ['Hz', 'kHz', true],
        ['Pa', 'kPa', true],
        ['Wh', 'kWh', true],
        ['W', 'kW', true],
        ['V', 'kV', true],
        ['Ω', 'kΩ', true],
        ['N', 'kN', true],
        ['m', 'ft', true],
        ['kg', 'lb', true],
        ['m', 'kg', false],
        ['s', 'A', false],
        ['W', 'V', false],
        ['Hz', 'N', false],
        ['xyz', 'm', false],
        ['m', 'xyz', false],
      ])('canConvert(%s, %s) should be %s', (from, to, expected) => {
        expect(engine.canConvert(from, to)).toBe(expected);
      });
    });

    describe('getCategory method', () => {
      test.each([
        ['m', 'length'],
        ['km', 'length'],
        ['ft', 'length'],
        ['kg', 'weight'],
        ['lb', 'weight'],
        ['s', 'time'],
        ['h', 'time'],
        ['A', 'current'],
        ['Hz', 'frequency'],
        ['Pa', 'pressure'],
        ['psi', 'pressure'],
        ['Wh', 'energy'],
        ['J', 'energy'],
        ['W', 'power'],
        ['V', 'voltage'],
        ['Ω', 'resistance'],
        ['N', 'force'],
        ['°C', 'temperature'],
        ['K', 'temperature'],
        ['°F', 'temperature'],
        ['m²', 'area'],
        ['m³', 'volume'],
        ['gal', 'volume'],
        ['m/s', 'speed'],
        ['mph', 'speed'],
        ['xyz', null],
      ])('getCategory(%s) should be %s', (unit, expected) => {
        expect(engine.getCategory(unit)).toBe(expected);
      });
    });

    describe('getBaseUnit method', () => {
      test.each([
        ['length', 'm'],
        ['mass', 'kg'],
        ['weight', 'kg'],
        ['time', 's'],
        ['current', 'A'],
        ['frequency', 'Hz'],
        ['pressure', 'Pa'],
        ['energy', 'Wh'],
        ['power', 'W'],
        ['voltage', 'V'],
        ['resistance', 'Ω'],
        ['force', 'N'],
        ['temperature', 'K'],
        ['speed', 'm/s'],
        ['area', 'm²'],
        ['volume', 'm³'],
        ['nonexistent', null],
      ])('getBaseUnit(%s) should be %s', (category, expected) => {
        expect(engine.getBaseUnit(category)).toBe(expected);
      });
    });

    describe('Precision of conversions', () => {
      test.each([
        [1, 'm', 'km', 0.001, 12],
        [1, 'kg', 'g', 1000, 12],
        [1, 's', 'ms', 1000, 12],
        [1, 'A', 'mA', 1000, 12],
        [1, 'Hz', 'kHz', 0.001, 12],
        [1, 'Pa', 'kPa', 0.001, 12],
        [1, 'Wh', 'kWh', 0.001, 12],
        [1, 'W', 'kW', 0.001, 12],
        [1, 'V', 'kV', 0.001, 12],
        [1, 'Ω', 'kΩ', 0.001, 12],
        [1, 'N', 'kN', 0.001, 12],
        [1, 'm²', 'cm²', 10000, 10],
        [1, 'm³', 'mL', 1000000, 10],
        [1, 'm/s', 'km/h', 3.59999712002304, 5],
      ])('should convert %d %s to %s with precision %d', (value, from, to, expected, precision) => {
        expect(engine.convert(value, from, to)).toBeCloseTo(expected, precision);
      });
    });

    describe('Stress: successive conversions', () => {
      it('should chain length conversions correctly', () => {
        const v1 = engine.convert(1, 'km', 'm');
        expect(v1).toBe(1000);
        const v2 = engine.convert(v1, 'm', 'cm');
        expect(v2).toBe(100000);
        const v3 = engine.convert(v2, 'cm', 'mm');
        expect(v3).toBe(1000000);
        const v4 = engine.convert(v3, 'mm', 'km');
        expect(v4).toBeCloseTo(1, 8);
      });

      it('should chain weight conversions correctly', () => {
        const v1 = engine.convert(1, 't', 'kg');
        expect(v1).toBe(1000);
        const v2 = engine.convert(v1, 'kg', 'g');
        expect(v2).toBe(1000000);
        const v3 = engine.convert(v2, 'g', 'mg');
        expect(v3).toBe(1000000000);
        const v4 = engine.convert(v3, 'mg', 't');
        expect(v4).toBeCloseTo(1, 8);
      });

      it('should chain time conversions correctly', () => {
        const v1 = engine.convert(1, 'day', 'h');
        expect(v1).toBe(24);
        const v2 = engine.convert(v1, 'h', 'min');
        expect(v2).toBe(1440);
        const v3 = engine.convert(v2, 'min', 's');
        expect(v3).toBe(86400);
        const v4 = engine.convert(v3, 's', 'day');
        expect(v4).toBeCloseTo(1, 8);
      });

      it('should chain power conversions correctly', () => {
        const v1 = engine.convert(1, 'GW', 'MW');
        expect(v1).toBe(1000);
        const v2 = engine.convert(v1, 'MW', 'kW');
        expect(v2).toBe(1000000);
        const v3 = engine.convert(v2, 'kW', 'W');
        expect(v3).toBe(1000000000);
        const v4 = engine.convert(v3, 'W', 'GW');
        expect(v4).toBeCloseTo(1, 6);
      });

      it('should chain frequency conversions correctly', () => {
        const v1 = engine.convert(1, 'GHz', 'MHz');
        expect(v1).toBe(1000);
        const v2 = engine.convert(v1, 'MHz', 'kHz');
        expect(v2).toBe(1000000);
        const v3 = engine.convert(v2, 'kHz', 'Hz');
        expect(v3).toBe(1000000000);
        const v4 = engine.convert(v3, 'Hz', 'GHz');
        expect(v4).toBeCloseTo(1, 6);
      });
    });

    describe('Floating-point stability', () => {
      it('should give 1000 for round-trip 1000 m → km → m', () => {
        const km = engine.convert(1000, 'm', 'km');
        const m = engine.convert(km, 'km', 'm');
        expect(m).toBe(1000);
      });

      it('should give 1000 for round-trip 1000 g → kg → g', () => {
        const kg = engine.convert(1000, 'g', 'kg');
        const g = engine.convert(kg, 'kg', 'g');
        expect(g).toBe(1000);
      });

      it('should give 1 for round-trip 12 ft → in → ft', () => {
        const inches = engine.convert(1, 'ft', 'in');
        const feet = engine.convert(inches, 'in', 'ft');
        expect(feet).toBeCloseTo(1, 10);
      });

      it('should be stable for 100 m ↔ km round trips', () => {
        let v = 100;
        for (let i = 0; i < 100; i++) {
          v = engine.convert(v, 'm', 'km');
          v = engine.convert(v, 'km', 'm');
        }
        expect(v).toBeCloseTo(100, 8);
      });
    });
  });
});
