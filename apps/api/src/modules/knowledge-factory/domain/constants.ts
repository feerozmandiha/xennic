export const ALLOWED_MIME_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'text/markdown': 'md',
  'text/plain': 'txt',
} as const;

export const EKO_STATUS = {
  PENDING: 'pending',
  PARSED: 'parsed',
  CLASSIFIED: 'classified',
  EXTRACTED: 'extracted',
  NORMALIZED: 'normalized',
  VALIDATED: 'validated',
  CHUNKED: 'chunked',
  EMBEDDED: 'embedded',
  INDEXED: 'indexed',
  PUBLISHED: 'published',
  FAILED: 'failed',
} as const;

export type EkoStatus = (typeof EKO_STATUS)[keyof typeof EKO_STATUS];

export const SOURCE_TYPES = {
  PDF: 'pdf',
  DOCX: 'docx',
  MD: 'md',
} as const;

export type SourceType = (typeof SOURCE_TYPES)[keyof typeof SOURCE_TYPES];

export const CLASSIFICATION_TYPES = {
  STANDARD: 'standard',
  ARTICLE: 'article',
  MANUAL: 'manual',
  SPECIFICATION: 'specification',
  REPORT: 'report',
  OTHER: 'other',
} as const;

export type ClassificationType = (typeof CLASSIFICATION_TYPES)[keyof typeof CLASSIFICATION_TYPES];
