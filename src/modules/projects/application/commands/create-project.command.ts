import type { AuditPort } from '@/shared/infrastructure/audit';

import type { ProjectEntity } from '../../domain/entities/project.entity';
import type { ProjectRepositoryPort } from '../../domain/repositories/project.repository';
import type { CreateProjectDto } from '../dto/project.dto';

export type CreateProjectCommandDeps = {
  projectRepository: ProjectRepositoryPort;
  audit?: AuditPort;
};

/**
 * Creates a Project owned by the authenticated actor.
 */
export class CreateProjectCommand {
  constructor(private readonly deps: CreateProjectCommandDeps) {}

  async execute(input: CreateProjectDto): Promise<ProjectEntity> {
    const { ownerId, ...fields } = input;
    const created = await this.deps.projectRepository.create({
      ...fields,
      ownerId,
      titleFr: input.titleFr.trim(),
      titleEn: input.titleEn.trim(),
      descriptionFr: input.descriptionFr.trim(),
      descriptionEn: input.descriptionEn.trim(),
      problemFr: input.problemFr.trim(),
      problemEn: input.problemEn.trim(),
      category: input.category.trim(),
      status: input.status.trim(),
      complexity: input.complexity.trim(),
      role: input.role.trim(),
      duration: input.duration.trim(),
      date: input.date.trim(),
      preview: input.preview.trim(),
    });

    await this.deps.audit?.record({
      actorId: ownerId,
      action: 'project.create',
      resource: 'project',
      resourceId: created.id,
    });

    return created;
  }
}
