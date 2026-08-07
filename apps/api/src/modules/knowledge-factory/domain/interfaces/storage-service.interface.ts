export interface StorageUploadInput {
  workspaceId: string;
  uploadedBy: string;
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}

export interface IStorageService {
  upload(data: StorageUploadInput): Promise<{ id: string }>;
  download(path: string): Promise<Buffer>;
  delete(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
}
