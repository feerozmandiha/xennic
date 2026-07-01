import { Injectable, Logger } from '@nestjs/common';
import type { ParsedContent } from '../../infrastructure/parsers/parsed-content.type.js';
import type { NormalizedDocument, NormalizedUnit, StandardizedTerm } from '../../domain/pipeline-events.js';

const UNIT_MAP: Record<string, { normalized: string; system: 'si' | 'imperial' }> = {
  kv: { normalized: 'kV', system: 'si' },
  v: { normalized: 'V', system: 'si' },
  a: { normalized: 'A', system: 'si' },
  kw: { normalized: 'kW', system: 'si' },
  mw: { normalized: 'MW', system: 'si' },
  kva: { normalized: 'kVA', system: 'si' },
  mva: { normalized: 'MVA', system: 'si' },
  hz: { normalized: 'Hz', system: 'si' },
  'mm2': { normalized: 'mm²', system: 'si' },
  mm: { normalized: 'mm', system: 'si' },
  m: { normalized: 'm', system: 'si' },
  km: { normalized: 'km', system: 'si' },
  '°c': { normalized: '°C', system: 'si' },
  '%': { normalized: '%', system: 'si' },
  bar: { normalized: 'bar', system: 'si' },
  psi: { normalized: 'psi', system: 'imperial' },
  ft: { normalized: 'ft', system: 'imperial' },
  inch: { normalized: 'in', system: 'imperial' },
};

const TERM_MAP: Record<string, { canonical: string; confidence: number }> = {
  'volt': { canonical: 'Voltage', confidence: 0.95 },
  'voltage': { canonical: 'Voltage', confidence: 1.0 },
  'current': { canonical: 'Current', confidence: 1.0 },
  'amp': { canonical: 'Current', confidence: 0.9 },
  'ampere': { canonical: 'Current', confidence: 0.95 },
  'power': { canonical: 'Power', confidence: 1.0 },
  'frequency': { canonical: 'Frequency', confidence: 1.0 },
  'freq': { canonical: 'Frequency', confidence: 0.9 },
  'temp': { canonical: 'Temperature', confidence: 0.9 },
  'temperature': { canonical: 'Temperature', confidence: 1.0 },
  'resistance': { canonical: 'Resistance', confidence: 1.0 },
  'impedance': { canonical: 'Impedance', confidence: 1.0 },
  'capacity': { canonical: 'Capacity', confidence: 0.9 },
  'capacitance': { canonical: 'Capacitance', confidence: 0.95 },
  'inductance': { canonical: 'Inductance', confidence: 1.0 },
  'pf': { canonical: 'Power Factor', confidence: 0.9 },
  'power factor': { canonical: 'Power Factor', confidence: 1.0 },
  'rpm': { canonical: 'Rotational Speed', confidence: 0.95 },
  'cosφ': { canonical: 'Power Factor', confidence: 0.95 },
  'cos phi': { canonical: 'Power Factor', confidence: 0.9 },
};

@Injectable()
export class NormalizationService {
  private readonly logger = new Logger(NormalizationService.name);

  normalize(
    documentId: string,
    workspaceId: string,
    content: ParsedContent,
  ): NormalizedDocument {
    const normalizedUnits: NormalizedUnit[] = [];
    const standardizedTerms: StandardizedTerm[] = [];
    let cleanContent = content.text;

    const unitPattern = /(\d+(?:\.\d+)?)\s*(kV|V|A|kW|MW|kVA|MVA|Hz|mm2|mm²|mm|m|km|°C|°c|%|bar|psi|ft|inch|in)\b/gi;
    let unitMatch: RegExpExecArray | null;
    while ((unitMatch = unitPattern.exec(cleanContent)) !== null) {
      const raw = unitMatch[2]!.toLowerCase();
      const entry = UNIT_MAP[raw];
      if (entry) {
        normalizedUnits.push({
          original: unitMatch[0],
          normalized: `${unitMatch[1]} ${entry!.normalized}`,
          system: entry!.system,
          confidence: 0.9,
        });
      }
    }

    const termPattern = /\b(volt|voltage|current|amp|ampere|power|frequency|freq|temp|temperature|resistance|impedance|capacity|capacitance|inductance|pf|power factor|rpm|cosφ|cos phi)\b/gi;
    let termMatch: RegExpExecArray | null;
    while ((termMatch = termPattern.exec(cleanContent)) !== null) {
      const key = termMatch[1]!.toLowerCase();
      const entry = TERM_MAP[key];
      if (entry) {
        standardizedTerms.push({
          original: termMatch[1]!,
          canonical: entry.canonical,
          confidence: entry.confidence,
        });
      }
    }

    this.deduplicateTerms(normalizedUnits, standardizedTerms);

    cleanContent = this.applyNormalizations(cleanContent, normalizedUnits, standardizedTerms);

    this.logger.log(
      `Normalized document ${documentId}: ${normalizedUnits.length} units, ${standardizedTerms.length} terms`,
    );

    return {
      documentId,
      workspaceId,
      cleanContent,
      normalizedUnits,
      standardizedTerms,
      metadata: content.metadata,
    };
  }

  private deduplicateTerms(units: NormalizedUnit[], terms: StandardizedTerm[]): void {
    const seenUnits = new Set<string>();
    for (let i = units.length - 1; i >= 0; i--) {
      const unit = units[i]!;
      const key = unit.normalized;
      if (seenUnits.has(key)) {
        units.splice(i, 1);
      } else {
        seenUnits.add(key);
      }
    }

    const seenTerms = new Set<string>();
    for (let i = terms.length - 1; i >= 0; i--) {
      const term = terms[i]!;
      const key = term.canonical;
      if (seenTerms.has(key)) {
        terms.splice(i, 1);
      } else {
        seenTerms.add(key);
      }
    }
  }

  private applyNormalizations(
    text: string,
    units: NormalizedUnit[],
    terms: StandardizedTerm[],
  ): string {
    let result = text;
    for (const unit of units) {
      result = result.replace(unit.original, unit.normalized);
    }
    for (const term of terms) {
      const regex = new RegExp(`\\b${term.original}\\b`, 'gi');
      result = result.replace(regex, term.canonical);
    }
    return result;
  }
}
