import { StandardEntity } from '../entities/standard.entity.js';

export interface StandardSearchParams {
  query?: string;
  organization?: string;
  status?: string;
  offset?: number;
  limit?: number;
}

export interface StandardSearchResult {
  data: StandardEntity[];
  total: number;
}

export interface IStandardRepository {
  findById(id: string): Promise<StandardEntity | null>;
  findAll(params: StandardSearchParams): Promise<StandardSearchResult>;
  findByCode(code: string): Promise<StandardEntity | null>;
  save(entity: StandardEntity): Promise<void>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}
