export const DOCUMENT_TYPES = {
  PDF: 'pdf',
  DOCX: 'docx',
  TXT: 'txt',
  IMAGE: 'image',
  DWG: 'dwg',
  XLSX: 'xlsx',
  MARKDOWN: 'markdown',
} as const;

export type DocumentType = typeof DOCUMENT_TYPES[keyof typeof DOCUMENT_TYPES];
