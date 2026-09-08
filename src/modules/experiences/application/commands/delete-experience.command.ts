import type { AuditPort } from '@/shared/infrastructure/audit';

import {
  ExperienceForbiddenError,
  ExperienceNotFoundError,
} from '../../domain/errors/experience.errors';
import type { ExperienceRepositoryPort } from '../../domain/repositories/experience.repository';
import type { DeleteExperienceDto } from '../dto/experience.dto';

export type DeleteExperienceCommandDeps = {
  experienceRepository: ExperienceRepositoryPort;
  audit?: AuditPort;
};

/**
 * Soft-deletes a Experience. Owner or admin (`:any`) may delete.
 */
export class DeleteExperienceCommand {
  constructor(private readonly deps: DeleteExperienceCommandDeps) {}

  async execute(input: DeleteExperienceDto): Promise<void> {
    const existing = await this.deps.experienceRepository.findById(input.id);
    if (!existing) {
      throw new ExperienceNotFoundError();
    }

    if (!input.isAdmin && existing.ownerId !== input.actorId) {
      throw new ExperienceForbiddenError();
    }

    await this.deps.experienceRepository.update(input.id, { deletedAt: new Date() });
    await this.deps.audit?.record({
      actorId: input.actorId,
      action: 'experience.delete',
      resource: 'experience',
      resourceId: input.id,
    });
  }
}
