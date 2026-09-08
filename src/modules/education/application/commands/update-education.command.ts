import type { AuditPort } from '@/shared/infrastructure/audit';

import type { EducationEntity } from '../../domain/entities/education.entity';
import {
  EducationForbiddenError,
  EducationNotFoundError,
} from '../../domain/errors/education.errors';
import type { EducationRepositoryPort } from '../../domain/repositories/education.repository';
import type { UpdateEducationDto } from '../dto/education.dto';

export type UpdateEducationCommandDeps = {
  educationRepository: EducationRepositoryPort;
  audit?: AuditPort;
};

/**
 * Updates a Education. Owner or admin may mutate (admins bypass ownership).
 */
export class UpdateEducationCommand {
  constructor(private readonly deps: UpdateEducationCommandDeps) {}

  async execute(input: UpdateEducationDto): Promise<EducationEntity> {
    const existing = await this.deps.educationRepository.findById(input.id);
    if (!existing) {
      throw new EducationNotFoundError();
    }

    if (!input.isAdmin && existing.ownerId !== input.actorId) {
      throw new EducationForbiddenError();
    }

    const updated = await this.deps.educationRepository.update(input.id, {
      ...(input.degreeFr !== undefined ? { degreeFr: input.degreeFr.trim() } : {}),
      ...(input.degreeEn !== undefined ? { degreeEn: input.degreeEn.trim() } : {}),
      ...(input.school !== undefined ? { school: input.school.trim() } : {}),
      ...(input.period !== undefined ? { period: input.period.trim() } : {}),
      ...(input.link !== undefined ? { link: input.link?.trim() || null } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
    });

    await this.deps.audit?.record({
      actorId: input.actorId,
      action: 'education.update',
      resource: 'education',
      resourceId: input.id,
    });

    return updated;
  }
}
