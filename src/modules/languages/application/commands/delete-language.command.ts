import type { AuditPort } from '@/shared/infrastructure/audit';

import { LanguageForbiddenError, LanguageNotFoundError } from '../../domain/errors/language.errors';
import type { LanguageRepositoryPort } from '../../domain/repositories/language.repository';
import type { DeleteLanguageDto } from '../dto/language.dto';

export type DeleteLanguageCommandDeps = {
  languageRepository: LanguageRepositoryPort;
  audit?: AuditPort;
};

/**
 * Soft-deletes a Language. Owner or admin (`:any`) may delete.
 */
export class DeleteLanguageCommand {
  constructor(private readonly deps: DeleteLanguageCommandDeps) {}

  async execute(input: DeleteLanguageDto): Promise<void> {
    const existing = await this.deps.languageRepository.findById(input.id);
    if (!existing) {
      throw new LanguageNotFoundError();
    }

    if (!input.isAdmin && existing.ownerId !== input.actorId) {
      throw new LanguageForbiddenError();
    }

    await this.deps.languageRepository.update(input.id, { deletedAt: new Date() });
    await this.deps.audit?.record({
      actorId: input.actorId,
      action: 'language.delete',
      resource: 'language',
      resourceId: input.id,
    });
  }
}
