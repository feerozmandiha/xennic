export const I_SECRET_PROVIDER = 'ISecretProvider';

export interface ISecretProvider {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  list(): Promise<string[]>;
}
