import type {
  CreateLanguageInput,
  LanguageEntity,
  LanguageListResult,
  UpdateLanguageInput,
} from '../entities/language.entity';

/**
 * Port for Language persistence required by use cases.
 * Infrastructure provides a Prisma implementation.
 */
export interface LanguageRepositoryPort {
  create(data: CreateLanguageInput): Promise<LanguageEntity>;
  findById(id: string): Promise<LanguageEntity | null>;
  list(page: number, limit: number): Promise<LanguageListResult>;
  update(id: string, data: UpdateLanguageInput): Promise<LanguageEntity>;
}
