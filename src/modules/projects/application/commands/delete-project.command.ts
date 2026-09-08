import type { AuditPort } from '@/shared/infrastructure/audit';

import { ProjectForbiddenError, ProjectNotFoundError } from '../../domain/errors/project.errors';
import type { ProjectRepositoryPort } from '../../domain/repositories/project.repository';
import type { DeleteProjectDto } from '../dto/project.dto';

export type DeleteProjectCommandDeps = {
  projectRepository: ProjectRepositoryPort;
  audit?: AuditPort;
};

/**
 * Soft-deletes a Project. Owner or admin may delete.
 */
export class DeleteProjectCommand {
  constructor(private readonly deps: DeleteProjectCommandDeps) {}

  async execute(input: DeleteProjectDto): Promise<void> {
    const existing = await this.deps.projectRepository.findById(input.id);
    if (!existing) {
      throw new ProjectNotFoundError();
    }

    if (!input.isAdmin && existing.ownerId !== input.actorId) {
      throw new ProjectForbiddenError();
    }

    await this.deps.projectRepository.update(input.id, { deletedAt: new Date() });
    await this.deps.audit?.record({
      actorId: input.actorId,
      action: 'project.delete',
      resource: 'project',
      resourceId: input.id,
    });
  }
}
