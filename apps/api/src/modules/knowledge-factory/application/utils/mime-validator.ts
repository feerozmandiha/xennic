import { ALLOWED_MIME_TYPES } from '../../domain/constants.js';

export function isAllowedMimeType(mimeType: string): boolean {
  return mimeType in ALLOWED_MIME_TYPES;
}

export function getExtension(mimeType: string): string {
  return ALLOWED_MIME_TYPES[mimeType] ?? '';
}
