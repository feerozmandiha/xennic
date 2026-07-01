import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { ParsedContent } from '../../infrastructure/parsers/parsed-content.type.js';
import type { ExtractedEntity, ExtractedRelationship, EntityType } from '../../domain/pipeline-events.js';

interface ExtractionPattern {
  type: EntityType;
  pattern: RegExp;
  confidence: number;
}

@Injectable()
export class ExtractionService {
  private readonly logger = new Logger(ExtractionService.name);

  private readonly patterns: ExtractionPattern[] = [
    { type: 'standard', pattern: /(?:IEC\s+\d{2,6}(?:-\d{1,2})?|IEEE\s+Std\s+\d{2,5}(?:-\d{4})?|EN\s+\d{4,6}|ISO\s+\d{4,6})/gi, confidence: 0.9 },
    { type: 'formula', pattern: /[A-Za-z]+\s*=\s*[A-Za-z0-9\s+\-*/^().,]+/g, confidence: 0.7 },
    { type: 'parameter', pattern: /(?:\b(?:rated|nominal|voltage|current|power|frequency|impedance|temperature|pressure|factor)\s+(?:at|of|is|for|shall\s+be|are)?\s*)?(\d+(?:\.\d+)?)\s*(kV|V|A|W|kW|MW|kVA|MVA|Hz|mm²|m²|mm|m|km|°C|%|bar|psi|dB(?:\(A\))?)\b/gi, confidence: 0.8 },
    { type: 'unit', pattern: /\b(kV|V|A|kW|MW|kVA|MVA|Hz|mm²|m²|mm|m|km|°C|%|bar|psi|kg|g|kN|N·m|Nm)\b/g, confidence: 0.95 },
    { type: 'equipment', pattern: /\b(transformer|circuit\s+breaker|switchgear|cable|motor|generator|relay|contactor|busbar|UPS|inverter|rectifier)\b/gi, confidence: 0.85 },
    { type: 'regulation', pattern: /(?:regulation\s+no\.?\s*\d+|standard\s+no\.?\s*\d+|clause\s+\d+(?:\.\d+)*)/gi, confidence: 0.75 },
  ];

  extract(content: ParsedContent): { entities: ExtractedEntity[]; relationships: ExtractedRelationship[] } {
    const entities: ExtractedEntity[] = [];
    const relationships: ExtractedRelationship[] = [];
    const text = content.text;

    for (const pattern of this.patterns) {
      let match: RegExpExecArray | null;
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags.replace('g', '') + 'g');
      while ((match = regex.exec(text)) !== null) {
        const entityValue = match[2] ? `${match[1]} ${match[2]}` : match[0].trim();
        const entity: ExtractedEntity = {
          id: randomUUID(),
          type: pattern.type,
          value: entityValue,
          confidence: pattern.confidence,
          position: { start: match.index, end: match.index + match[0].length! },
          metadata: { source: 'regex' },
        };
        entities.push(entity);
      }
    }

    this.deduplicate(entities);
    this.buildRelationships(entities, relationships);

    this.logger.log(`Extracted ${entities.length} entities and ${relationships.length} relationships`);
    return { entities, relationships };
  }

  private deduplicate(entities: ExtractedEntity[]): void {
    const seen = new Set<string>();
    for (let i = entities.length - 1; i >= 0; i--) {
      const entity = entities[i]!;
      const key = `${entity.type}:${entity.value.toLowerCase()}`;
      if (seen.has(key)) {
        entities.splice(i, 1);
      } else {
        seen.add(key);
      }
    }
  }

  private buildRelationships(entities: ExtractedEntity[], relationships: ExtractedRelationship[]): void {
    const eqEntities = entities.filter((e) => e.type === 'equipment');
    const paramEntities = entities.filter((e) => e.type === 'parameter');
    const formulaEntities = entities.filter((e) => e.type === 'formula');

    for (const eq of eqEntities) {
      for (const param of paramEntities) {
        if (eq.position && param.position && this.isNearby(eq.position, param.position, 500)) {
          relationships.push({
            id: randomUUID(),
            sourceId: eq.id,
            targetId: param.id,
            type: 'has_parameter',
            confidence: Math.min(eq.confidence, param.confidence) * 0.9,
          });
        }
      }
    }

    for (const formula of formulaEntities) {
      for (const param of paramEntities) {
        if (formula.position && param.position && this.isNearby(formula.position, param.position, 300)) {
          relationships.push({
            id: randomUUID(),
            sourceId: formula.id,
            targetId: param.id,
            type: 'references',
            confidence: Math.min(formula.confidence, param.confidence) * 0.85,
          });
        }
      }
    }
  }

  private isNearby(a: { start: number; end: number }, b: { start: number; end: number }, maxGap: number): boolean {
    const gap = Math.abs(a.start - b.start);
    return gap < maxGap;
  }
}
