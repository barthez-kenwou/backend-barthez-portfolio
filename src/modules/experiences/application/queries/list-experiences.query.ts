import type { ExperienceListResult } from '../../domain/entities/experience.entity';
import type { ExperienceRepositoryPort } from '../../domain/repositories/experience.repository';
import type { ListExperiencesDto } from '../dto/experience.dto';

export type ListExperiencesQueryDeps = {
  experienceRepository: ExperienceRepositoryPort;
};

/**
 * Paginated list of non-deleted Experiences.
 */
export class ListExperiencesQuery {
  constructor(private readonly deps: ListExperiencesQueryDeps) {}

  async execute(input: ListExperiencesDto): Promise<ExperienceListResult> {
    const page = Math.max(1, input.page);
    const limit = Math.min(100, Math.max(1, input.limit));
    return this.deps.experienceRepository.list(page, limit);
  }
}
