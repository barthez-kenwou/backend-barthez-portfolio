import type { AuditPort } from '@/shared/infrastructure/audit';

import type { LanguageEntity } from '../../domain/entities/language.entity';
import type { LanguageRepositoryPort } from '../../domain/repositories/language.repository';
import type { CreateLanguageDto } from '../dto/language.dto';

export type CreateLanguageCommandDeps = {
  languageRepository: LanguageRepositoryPort;
  audit?: AuditPort;
};

/**
 * Creates a Language owned by the authenticated actor.
 */
export class CreateLanguageCommand {
  constructor(private readonly deps: CreateLanguageCommandDeps) {}

  async execute(input: CreateLanguageDto): Promise<LanguageEntity> {
    const created = await this.deps.languageRepository.create({
      language: input.language.trim(),
      proficiencyFr: input.proficiencyFr.trim(),
      proficiencyEn: input.proficiencyEn.trim(),
      sortOrder: input.sortOrder ?? 0,
      ownerId: input.ownerId,
    });

    await this.deps.audit?.record({
      actorId: input.ownerId,
      action: 'language.create',
      resource: 'language',
      resourceId: created.id,
    });

    return created;
  }
}
