export interface ClassificationResult {
  domain: string;
  standard?: string;
  equipmentType?: string;
  confidence: number;
  detectedLanguage?: string;
  suggestedSlug?: string;
}
