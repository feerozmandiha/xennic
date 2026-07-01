import { Test, TestingModule } from '@nestjs/testing';
import { EngineeringUnits } from '../application/services/engineering-units.service.js';

describe('EngineeringUnits', () => {
  let service: EngineeringUnits;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EngineeringUnits],
    }).compile();
    service = module.get<EngineeringUnits>(EngineeringUnits);
  });

  it('converts meters to kilometers', () => {
    const result = service.convert(1000, 'm', 'km');
    expect(result.value).toBe(1);
    expect(result.unit).toBe('km');
  });

  it('converts kilometers to meters', () => {
    const result = service.convert(1, 'km', 'm');
    expect(result.value).toBe(1000);
  });

  it('converts amperes to kiloamperes', () => {
    const result = service.convert(1500, 'A', 'kA');
    expect(result.value).toBe(1.5);
  });

  it('converts volts to kilovolts', () => {
    const result = service.convert(11000, 'V', 'kV');
    expect(result.value).toBe(11);
  });

  it('converts watts to kilowatts', () => {
    const result = service.convert(5000, 'W', 'kW');
    expect(result.value).toBe(5);
  });

  it('converts kVA to MVA', () => {
    const result = service.convert(2000, 'kVA', 'MVA');
    expect(result.value).toBe(2);
  });

  it('converts percent to per-unit', () => {
    const result = service.convert(50, '%', '');
    expect(result.value).toBe(0.5);
  });

  it('detects compatible units (mm² ↔ m²)', () => {
    expect(service.areCompatible('mm²', 'm²')).toBe(true);
  });

  it('detects incompatible units', () => {
    expect(service.areCompatible('m', 'A')).toBe(false);
  });

  it('throws on unknown unit', () => {
    expect(() => service.convert(1, 'xyz', 'm')).toThrow('Unknown unit');
  });

  it('throws on incompatible conversion', () => {
    expect(() => service.convert(1, 'm', 'A')).toThrow('Incompatible units');
  });

  it('converts to SI base', () => {
    const result = service.toSi(1, 'km');
    expect(result.siValue).toBe(1000);
  });

  it('converts from SI base', () => {
    const result = service.fromSi(1000, 'km');
    expect(result.value).toBe(1);
  });

  it('lists all units', () => {
    const units = service.listUnits();
    expect(units.length).toBe(30);
  });

  it('lists units by category', () => {
    const units = service.listUnits('voltage');
    expect(units.length).toBeGreaterThan(0);
    expect(units.every((u) => u.category === 'voltage' || u.name.includes('voltage'))).toBe(true);
  });

  it('returns unit definition by symbol', () => {
    const unit = service.getUnit('kV');
    expect(unit).toBeDefined();
    expect(unit!.name).toBe('kilovolt');
    expect(unit!.siFactor).toBe(1000);
  });

  it('returns null for unknown symbol', () => {
    expect(service.getUnit('xyz')).toBeNull();
  });
});
