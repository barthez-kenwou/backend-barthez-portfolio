import type { AuditPort } from '@/shared/infrastructure/audit';

import {
  EducationForbiddenError,
  EducationNotFoundError,
} from '../../domain/errors/education.errors';
import type { EducationRepositoryPort } from '../../domain/repositories/education.repository';
import type { DeleteEducationDto } from '../dto/education.dto';

export type DeleteEducationCommandDeps = {
  educationRepository: EducationRepositoryPort;
  audit?: AuditPort;
};

/**
 * Soft-deletes a Education. Owner or admin (`:any`) may delete.
 */
export class DeleteEducationCommand {
  constructor(private readonly deps: DeleteEducationCommandDeps) {}

  async execute(input: DeleteEducationDto): Promise<void> {
    const existing = await this.deps.educationRepository.findById(input.id);
    if (!existing) {
      throw new EducationNotFoundError();
    }

    if (!input.isAdmin && existing.ownerId !== input.actorId) {
      throw new EducationForbiddenError();
    }

    await this.deps.educationRepository.update(input.id, { deletedAt: new Date() });
    await this.deps.audit?.record({
      actorId: input.actorId,
      action: 'education.delete',
      resource: 'education',
      resourceId: input.id,
    });
  }
}
