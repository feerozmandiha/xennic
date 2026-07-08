import { Injectable, Logger, Inject } from '@nestjs/common';
import type { ClassificationResult } from '../../domain/value-objects/classification-result.vo.js';
import type { IKnowledgeDocumentRepository } from '../../domain/interfaces/knowledge-document.repository.interface.js';

@Injectable()
export class DocumentClassifierService {
  private readonly logger = new Logger(DocumentClassifierService.name);

  constructor(
    @Inject('IKnowledgeDocumentRepository')
    private readonly documentRepository: IKnowledgeDocumentRepository,
  ) {}

  async classifyDocument(
    documentId: string,
    text: string,
  ): Promise<ClassificationResult> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) throw new Error(`Document ${documentId} not found`);

    const classification = await this.runClassification(text);

    await this.documentRepository.classifyDocument(documentId, classification as unknown as Record<string, unknown>);

    return classification;
  }

  private async runClassification(text: string): Promise<ClassificationResult> {
    const lower = text.toLowerCase();
    let domain = 'general';
    let standard = '';
    let equipmentType = '';
    let confidence = 0.5;
    let suggestedSlug = '';

    if (lower.includes('ieee') || lower.includes(' electrical ')) {
      domain = 'electrical-engineering';
      standard = 'IEEE';
      confidence = 0.85;
    } else if (lower.includes('iec') || lower.includes('international electrotechnical')) {
      domain = 'electrical-engineering';
      standard = 'IEC';
      confidence = 0.85;
    } else if (lower.includes('iso') || lower.includes('international organization')) {
      domain = 'quality-management';
      standard = 'ISO';
      confidence = 0.8;
    } else if (lower.includes('astm') || lower.includes('american society')) {
      domain = 'materials';
      standard = 'ASTM';
      confidence = 0.75;
    }

    if (lower.includes('transformer')) {
      equipmentType = 'transformer';
      suggestedSlug = 'transformer-specification';
    } else if (lower.includes('circuit breaker')) {
      equipmentType = 'circuit-breaker';
      suggestedSlug = 'circuit-breaker-specification';
    } else if (lower.includes('motor')) {
      equipmentType = 'motor';
      suggestedSlug = 'motor-specification';
    } else if (lower.includes('cable') || lower.includes('wiring')) {
      equipmentType = 'cable';
      suggestedSlug = 'cable-specification';
    }

    return {
      domain,
      standard,
      equipmentType,
      confidence,
      suggestedSlug,
    };
  }

  async suggestTaxonomy(text: string): Promise<{
    tags: string[];
    categories: string[];
    suggestedKnowledgeId?: string;
  }> {
    const classification = await this.runClassification(text);

    return {
      tags: [classification.domain, classification.standard, classification.equipmentType].filter((v): v is string => Boolean(v)),
      categories: [classification.domain],
      suggestedKnowledgeId: undefined,
    };
  }
}
