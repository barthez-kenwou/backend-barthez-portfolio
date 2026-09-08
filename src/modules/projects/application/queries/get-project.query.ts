import type { ProjectEntity } from '../../domain/entities/project.entity';
import { ProjectNotFoundError } from '../../domain/errors/project.errors';
import type { ProjectRepositoryPort } from '../../domain/repositories/project.repository';
import type { GetProjectDto } from '../dto/project.dto';

export type GetProjectQueryDeps = {
  projectRepository: ProjectRepositoryPort;
};

/**
 * Fetches a single non-deleted Project by id.
 * Unpublished projects are hidden unless allowUnpublished is true.
 */
export class GetProjectQuery {
  constructor(private readonly deps: GetProjectQueryDeps) {}

  async execute(input: GetProjectDto): Promise<ProjectEntity> {
    const item = await this.deps.projectRepository.findById(input.id);
    if (!item) {
      throw new ProjectNotFoundError();
    }

    if (!item.isPublished && !input.allowUnpublished) {
      throw new ProjectNotFoundError();
    }

    return item;
  }
}
