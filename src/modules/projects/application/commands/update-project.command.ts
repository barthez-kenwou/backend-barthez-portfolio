import type { AuditPort } from '@/shared/infrastructure/audit';

import type { ProjectEntity, UpdateProjectInput } from '../../domain/entities/project.entity';
import { ProjectForbiddenError, ProjectNotFoundError } from '../../domain/errors/project.errors';
import type { ProjectRepositoryPort } from '../../domain/repositories/project.repository';
import type { UpdateProjectDto } from '../dto/project.dto';

export type UpdateProjectCommandDeps = {
  projectRepository: ProjectRepositoryPort;
  audit?: AuditPort;
};

/**
 * Updates a Project. Owner or admin may mutate.
 */
export class UpdateProjectCommand {
  constructor(private readonly deps: UpdateProjectCommandDeps) {}

  async execute(input: UpdateProjectDto): Promise<ProjectEntity> {
    const existing = await this.deps.projectRepository.findById(input.id);
    if (!existing) {
      throw new ProjectNotFoundError();
    }

    if (!input.isAdmin && existing.ownerId !== input.actorId) {
      throw new ProjectForbiddenError();
    }

    const { id: _id, actorId: _actorId, isAdmin: _isAdmin, ...patch } = input;
    const data: UpdateProjectInput = { ...patch };

    const updated = await this.deps.projectRepository.update(input.id, data);

    await this.deps.audit?.record({
      actorId: input.actorId,
      action: 'project.update',
      resource: 'project',
      resourceId: input.id,
    });

    return updated;
  }
}
