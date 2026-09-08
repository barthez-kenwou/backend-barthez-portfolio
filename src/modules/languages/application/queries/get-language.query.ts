import type { LanguageEntity } from '../../domain/entities/language.entity';
import { LanguageNotFoundError } from '../../domain/errors/language.errors';
import type { LanguageRepositoryPort } from '../../domain/repositories/language.repository';
import type { GetLanguageDto } from '../dto/language.dto';

export type GetLanguageQueryDeps = {
  languageRepository: LanguageRepositoryPort;
};

/**
 * Fetches a single non-deleted Language by id.
 */
export class GetLanguageQuery {
  constructor(private readonly deps: GetLanguageQueryDeps) {}

  async execute(input: GetLanguageDto): Promise<LanguageEntity> {
    const item = await this.deps.languageRepository.findById(input.id);
    if (!item) {
      throw new LanguageNotFoundError();
    }
    return item;
  }
}
