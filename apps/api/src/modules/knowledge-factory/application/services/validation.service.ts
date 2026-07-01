import { Injectable, Logger } from '@nestjs/common';
import type { ParsedContent } from '../../infrastructure/parsers/parsed-content.type.js';
import type { QualityScores } from '../../domain/pipeline-events.js';

export interface ValidationReport {
  passed: boolean;
  scores: QualityScores;
  errors: string[];
  warnings: string[];
}

@Injectable()
export class ValidationService {
  private readonly logger = new Logger(ValidationService.name);

  async validate(
    documentId: string,
    content: ParsedContent,
    classification: { sourceType: string; confidence: number },
  ): Promise<ValidationReport> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const contentScore = this.evaluateContentQuality(content);
    if (contentScore < 0.3) {
      errors.push('Insufficient content quality: text too short or low information density');
    } else if (contentScore < 0.6) {
      warnings.push('Content quality below threshold — review recommended');
    }

    const standardScore = this.evaluateStandardCompliance(content, classification);
    if (classification.sourceType === 'standard' && standardScore < 0.4) {
      errors.push('Standard document fails compliance validation');
    }

    const semanticScore = this.evaluateSemanticConsistency(content);

    const overallScore = this.computeOverall(
      contentScore,
      standardScore,
      semanticScore,
    );

    const passed = overallScore >= 0.5 && errors.length === 0;

    this.logger.log(
      `Validation for ${documentId}: ${passed ? 'PASSED' : 'FAILED'} ` +
      `(content=${contentScore.toFixed(2)}, standard=${standardScore.toFixed(2)}, ` +
      `semantic=${semanticScore.toFixed(2)}, overall=${overallScore.toFixed(2)})`,
    );

    return {
      passed,
      scores: { contentScore, standardScore, semanticScore, overallScore },
      errors,
      warnings,
    };
  }

  private evaluateContentQuality(content: ParsedContent): number {
    const text = content.text;
    const wordCount = text.split(/\s+/).length;
    if (wordCount < 10) return 0.2;

    const uniqueWords = new Set(text.toLowerCase().split(/\s+/)).size;
    const lexicalDiversity = uniqueWords / wordCount;

    const hasNumbers = /\d+/.test(text);
    const hasTechnicalTerms = /(?:rated|nominal|voltage|current|power|frequency|impedance|standard|regulation|clause)\b/i.test(text);
    const hasStructure = !!(content.metadata.headings?.length || content.metadata.pageCount);

    let score = 0.3;
    if (wordCount >= 50) score += 0.15;
    if (wordCount >= 200) score += 0.1;
    if (lexicalDiversity > 0.3) score += 0.15;
    if (hasNumbers) score += 0.1;
    if (hasTechnicalTerms) score += 0.15;
    if (hasStructure) score += 0.1;

    return Math.min(score, 1.0);
  }

  private evaluateStandardCompliance(
    content: ParsedContent,
    classification: { sourceType: string; confidence: number },
  ): number {
    if (classification.sourceType !== 'standard') return 1.0;

    const text = content.text;
    let score = 0.5;

    if (/scope|normative\s+references|terms\s+and\s+definitions/i.test(text)) score += 0.15;
    if (/clause|annex|appendix/i.test(text)) score += 0.1;
    if (/table\s+\d+|figure\s+\d+/i.test(text)) score += 0.1;
    if (content.metadata.pageCount && content.metadata.pageCount > 5) score += 0.1;

    score *= classification.confidence;
    return Math.min(score, 1.0);
  }

  private evaluateSemanticConsistency(content: ParsedContent): number {
    const text = content.text;
    const sentences = text.split(/[.!?]+/).filter(Boolean);
    if (sentences.length < 3) return 0.5;

    const avgLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
    if (avgLength < 3 || avgLength > 100) return 0.5;

    const firstWords = sentences.map((s) => s.trim().split(/\s+/)[0]?.toLowerCase()).filter(Boolean);
    const uniqueFirstWords = new Set(firstWords).size;
    const diversity = uniqueFirstWords / firstWords.length;

    return 0.6 + Math.min(diversity * 0.4, 0.4);
  }

  private computeOverall(
    contentScore: number,
    standardScore: number,
    semanticScore: number,
  ): number {
    if (standardScore < 1.0) {
      return contentScore * 0.5 + standardScore * 0.3 + semanticScore * 0.2;
    }
    return contentScore * 0.4 + standardScore * 0.4 + semanticScore * 0.2;
  }
}
