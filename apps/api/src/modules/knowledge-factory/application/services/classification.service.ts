import { Injectable } from '@nestjs/common';
import type { ParsedContent, ClassificationResult } from '../../infrastructure/parsers/parsed-content.type.js';
import { CLASSIFICATION_TYPES } from '../../domain/constants.js';

@Injectable()
export class ClassificationService {
  classify(content: ParsedContent, mimeType: string): ClassificationResult {
    const language = this.detectLanguage(content.text);
    const sourceType = this.detectSourceType(content, mimeType);
    const confidence = this.computeConfidence(sourceType, content);

    return { sourceType, confidence, language };
  }

  private detectLanguage(text: string): string {
    if (!text) return 'en';

    const sample = text.slice(0, 2000);
    const faChars = (sample.match(/[\u0600-\u06FF\uFB8A\u067E\u0686\u06AF]/g) || []).length;
    const enChars = (sample.match(/[a-zA-Z]/g) || []).length;

    if (faChars > enChars * 0.3) return 'fa';
    return 'en';
  }

  private detectSourceType(
    content: ParsedContent,
    mimeType: string,
  ): ClassificationResult['sourceType'] {
    const text = content.text.toLowerCase();
    const metaTitle = (content.metadata.title ?? '').toLowerCase();

    if (/standard|iec|ieee|ansi|bs |en \d|iso/i.test(text.slice(0, 500)) || metaTitle.includes('standard')) {
      return CLASSIFICATION_TYPES.STANDARD;
    }

    if (/specification|spec |technical.?data/i.test(text.slice(0, 500)) || metaTitle.includes('specification')) {
      return CLASSIFICATION_TYPES.SPECIFICATION;
    }

    if (/manual|guide|instruction|user.?guide/i.test(text.slice(0, 500)) || metaTitle.includes('manual')) {
      return CLASSIFICATION_TYPES.MANUAL;
    }

    if (/report|analysis|study/i.test(text.slice(0, 500)) || metaTitle.includes('report')) {
      return CLASSIFICATION_TYPES.REPORT;
    }

    if (mimeType === 'text/markdown' || mimeType === 'text/plain' || content.pages === 1) {
      return CLASSIFICATION_TYPES.ARTICLE;
    }

    return CLASSIFICATION_TYPES.OTHER;
  }

  private computeConfidence(
    sourceType: string,
    content: ParsedContent,
  ): number {
    const textLength = content.text.length;

    if (textLength < 100) return 0.3;
    if (textLength < 500) return 0.5;
    if (textLength < 2000) return 0.7;

    if (sourceType !== CLASSIFICATION_TYPES.OTHER) return 0.85;
    return 0.6;
  }
}
