import type { AuditPort } from '@/shared/infrastructure/audit';

import type { ExperienceEntity } from '../../domain/entities/experience.entity';
import {
  ExperienceForbiddenError,
  ExperienceNotFoundError,
} from '../../domain/errors/experience.errors';
import type { ExperienceRepositoryPort } from '../../domain/repositories/experience.repository';
import type { UpdateExperienceDto } from '../dto/experience.dto';

export type UpdateExperienceCommandDeps = {
  experienceRepository: ExperienceRepositoryPort;
  audit?: AuditPort;
};

/**
 * Updates a Experience. Owner or admin may mutate (admins bypass ownership).
 */
export class UpdateExperienceCommand {
  constructor(private readonly deps: UpdateExperienceCommandDeps) {}

  async execute(input: UpdateExperienceDto): Promise<ExperienceEntity> {
    const existing = await this.deps.experienceRepository.findById(input.id);
    if (!existing) {
      throw new ExperienceNotFoundError();
    }

    if (!input.isAdmin && existing.ownerId !== input.actorId) {
      throw new ExperienceForbiddenError();
    }

    const updated = await this.deps.experienceRepository.update(input.id, {
      ...(input.titleFr !== undefined ? { titleFr: input.titleFr.trim() } : {}),
      ...(input.titleEn !== undefined ? { titleEn: input.titleEn.trim() } : {}),
      ...(input.companyFr !== undefined ? { companyFr: input.companyFr.trim() } : {}),
      ...(input.companyEn !== undefined ? { companyEn: input.companyEn.trim() } : {}),
      ...(input.period !== undefined ? { period: input.period.trim() } : {}),
      ...(input.descriptionFr !== undefined
        ? { descriptionFr: input.descriptionFr.map((s) => s.trim()).filter(Boolean) }
        : {}),
      ...(input.descriptionEn !== undefined
        ? { descriptionEn: input.descriptionEn.map((s) => s.trim()).filter(Boolean) }
        : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
    });

    await this.deps.audit?.record({
      actorId: input.actorId,
      action: 'experience.update',
      resource: 'experience',
      resourceId: input.id,
    });

    return updated;
  }
}
