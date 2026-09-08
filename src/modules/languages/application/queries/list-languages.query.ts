import type { LanguageListResult } from '../../domain/entities/language.entity';
import type { LanguageRepositoryPort } from '../../domain/repositories/language.repository';
import type { ListLanguagesDto } from '../dto/language.dto';

export type ListLanguagesQueryDeps = {
  languageRepository: LanguageRepositoryPort;
};

/**
 * Paginated list of non-deleted Languages.
 */
export class ListLanguagesQuery {
  constructor(private readonly deps: ListLanguagesQueryDeps) {}

  async execute(input: ListLanguagesDto): Promise<LanguageListResult> {
    const page = Math.max(1, input.page);
    const limit = Math.min(100, Math.max(1, input.limit));
    return this.deps.languageRepository.list(page, limit);
  }
}
