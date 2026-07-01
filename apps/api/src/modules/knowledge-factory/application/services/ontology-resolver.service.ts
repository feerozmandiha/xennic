import { Injectable, Logger } from '@nestjs/common';
import type { ExtractedEntity, ResolvedConcept } from '../../domain/pipeline-events.js';

interface OntologyEntry {
  patterns: RegExp[];
  conceptId: string;
  label: string;
  parentIds: string[];
  synonyms: string[];
}

@Injectable()
export class OntologyResolverService {
  private readonly logger = new Logger(OntologyResolverService.name);

  private readonly ontology: OntologyEntry[] = [
    {
      patterns: [/transformer/i, /power\s+transformer/i, /distribution\s+transformer/i],
      conceptId: 'concept:transformer',
      label: 'Transformer',
      parentIds: ['concept:electrical-equipment'],
      synonyms: ['ترانسفورماتور', 'ترانس'],
    },
    {
      patterns: [/circuit\s+breaker/i, /c.b/i, /breaker/i],
      conceptId: 'concept:circuit-breaker',
      label: 'Circuit Breaker',
      parentIds: ['concept:switching-device', 'concept:protection-device'],
      synonyms: ['کلید قدرت', 'بریکر'],
    },
    {
      patterns: [/cable/i, /power\s+cable/i, /conductor/i],
      conceptId: 'concept:cable',
      label: 'Cable',
      parentIds: ['concept:conductor'],
      synonyms: ['کابل', 'هادی'],
    },
    {
      patterns: [/motor/i, /electric\s+motor/i, /induction\s+motor/i],
      conceptId: 'concept:motor',
      label: 'Electric Motor',
      parentIds: ['concept:rotating-machine'],
      synonyms: ['موتور', 'الکتروموتور'],
    },
    {
      patterns: [/generator/i, /synchronous\s+generator/i, /alternator/i],
      conceptId: 'concept:generator',
      label: 'Generator',
      parentIds: ['concept:rotating-machine'],
      synonyms: ['ژنراتور', 'مولد'],
    },
    {
      patterns: [/relay/i, /protection\s+relay/i, /overcurrent\s+relay/i],
      conceptId: 'concept:protection-relay',
      label: 'Protection Relay',
      parentIds: ['concept:protection-device'],
      synonyms: ['رله', 'رله حفاظتی'],
    },
    {
      patterns: [/busbar/i, /bus\s+bar/i, /bus/i],
      conceptId: 'concept:busbar',
      label: 'Busbar',
      parentIds: ['concept:conductor'],
      synonyms: ['شین', 'باسبار'],
    },
    {
      patterns: [/switchgear/i, /metal[- ]clad/i, /mv\s+switchgear/i],
      conceptId: 'concept:switchgear',
      label: 'Switchgear',
      parentIds: ['concept:switching-device', 'concept:protection-device'],
      synonyms: ['تابلو برق', 'سوئیچ‌گیر'],
    },
  ];

  resolve(entities: ExtractedEntity[]): ResolvedConcept[] {
    const resolved: ResolvedConcept[] = [];
    const seen = new Set<string>();

    for (const entity of entities) {
      for (const entry of this.ontology) {
        for (const pattern of entry.patterns) {
          if (pattern.test(entity.value) && !seen.has(entry.conceptId)) {
            seen.add(entry.conceptId);
            resolved.push({
              conceptId: entry.conceptId,
              label: entry.label,
              confidence: entity.confidence * 0.9,
              parentIds: entry.parentIds,
              synonyms: entry.synonyms,
            });
            break;
          }
        }
      }
    }

    this.logger.log(`Resolved ${resolved.length} ontology concepts from ${entities.length} entities`);
    return resolved;
  }
}
