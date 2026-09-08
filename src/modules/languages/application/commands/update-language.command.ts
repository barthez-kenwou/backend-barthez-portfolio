import type { AuditPort } from '@/shared/infrastructure/audit';

import type { LanguageEntity } from '../../domain/entities/language.entity';
import { LanguageForbiddenError, LanguageNotFoundError } from '../../domain/errors/language.errors';
import type { LanguageRepositoryPort } from '../../domain/repositories/language.repository';
import type { UpdateLanguageDto } from '../dto/language.dto';

export type UpdateLanguageCommandDeps = {
  languageRepository: LanguageRepositoryPort;
  audit?: AuditPort;
};

/**
 * Updates a Language. Owner or admin may mutate (admins bypass ownership).
 */
export class UpdateLanguageCommand {
  constructor(private readonly deps: UpdateLanguageCommandDeps) {}

  async execute(input: UpdateLanguageDto): Promise<LanguageEntity> {
    const existing = await this.deps.languageRepository.findById(input.id);
    if (!existing) {
      throw new LanguageNotFoundError();
    }

    if (!input.isAdmin && existing.ownerId !== input.actorId) {
      throw new LanguageForbiddenError();
    }

    const updated = await this.deps.languageRepository.update(input.id, {
      ...(input.language !== undefined ? { language: input.language.trim() } : {}),
      ...(input.proficiencyFr !== undefined ? { proficiencyFr: input.proficiencyFr.trim() } : {}),
      ...(input.proficiencyEn !== undefined ? { proficiencyEn: input.proficiencyEn.trim() } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
    });

    await this.deps.audit?.record({
      actorId: input.actorId,
      action: 'language.update',
      resource: 'language',
      resourceId: input.id,
    });

    return updated;
  }
}
