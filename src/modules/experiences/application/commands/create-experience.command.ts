import type { AuditPort } from '@/shared/infrastructure/audit';

import type { ExperienceEntity } from '../../domain/entities/experience.entity';
import type { ExperienceRepositoryPort } from '../../domain/repositories/experience.repository';
import type { CreateExperienceDto } from '../dto/experience.dto';

export type CreateExperienceCommandDeps = {
  experienceRepository: ExperienceRepositoryPort;
  audit?: AuditPort;
};

/**
 * Creates a Experience owned by the authenticated actor.
 */
export class CreateExperienceCommand {
  constructor(private readonly deps: CreateExperienceCommandDeps) {}

  async execute(input: CreateExperienceDto): Promise<ExperienceEntity> {
    const created = await this.deps.experienceRepository.create({
      titleFr: input.titleFr.trim(),
      titleEn: input.titleEn.trim(),
      companyFr: input.companyFr.trim(),
      companyEn: input.companyEn.trim(),
      period: input.period.trim(),
      descriptionFr: input.descriptionFr.map((s) => s.trim()).filter(Boolean),
      descriptionEn: input.descriptionEn.map((s) => s.trim()).filter(Boolean),
      sortOrder: input.sortOrder ?? 0,
      ownerId: input.ownerId,
    });

    await this.deps.audit?.record({
      actorId: input.ownerId,
      action: 'experience.create',
      resource: 'experience',
      resourceId: created.id,
    });

    return created;
  }
}
