import type { ProjectListResult } from '../../domain/entities/project.entity';
import type { ProjectRepositoryPort } from '../../domain/repositories/project.repository';
import type { ListProjectsDto } from '../dto/project.dto';

export type ListProjectsQueryDeps = {
  projectRepository: ProjectRepositoryPort;
};

/**
 * Paginated list of non-deleted Projects with optional filters.
 * Public callers always get isPublished=true unless includeUnpublished is set.
 */
export class ListProjectsQuery {
  constructor(private readonly deps: ListProjectsQueryDeps) {}

  async execute(input: ListProjectsDto): Promise<ProjectListResult> {
    const page = Math.max(1, input.page);
    const limit = Math.min(100, Math.max(1, input.limit));

    const isPublished = input.includeUnpublished ? input.isPublished : true;

    return this.deps.projectRepository.list({
      page,
      limit,
      isPublished,
      isFeatured: input.isFeatured,
      category: input.category,
    });
  }
}
