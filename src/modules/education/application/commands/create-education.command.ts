import type { AuditPort } from '@/shared/infrastructure/audit';

import type { EducationEntity } from '../../domain/entities/education.entity';
import type { EducationRepositoryPort } from '../../domain/repositories/education.repository';
import type { CreateEducationDto } from '../dto/education.dto';

export type CreateEducationCommandDeps = {
  educationRepository: EducationRepositoryPort;
  audit?: AuditPort;
};

/**
 * Creates a Education owned by the authenticated actor.
 */
export class CreateEducationCommand {
  constructor(private readonly deps: CreateEducationCommandDeps) {}

  async execute(input: CreateEducationDto): Promise<EducationEntity> {
    const created = await this.deps.educationRepository.create({
      degreeFr: input.degreeFr.trim(),
      degreeEn: input.degreeEn.trim(),
      school: input.school.trim(),
      period: input.period.trim(),
      link: input.link?.trim() || null,
      sortOrder: input.sortOrder ?? 0,
      ownerId: input.ownerId,
    });

    await this.deps.audit?.record({
      actorId: input.ownerId,
      action: 'education.create',
      resource: 'education',
      resourceId: created.id,
    });

    return created;
  }
}
