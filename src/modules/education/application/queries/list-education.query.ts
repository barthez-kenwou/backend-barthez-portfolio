import type { EducationListResult } from '../../domain/entities/education.entity';
import type { EducationRepositoryPort } from '../../domain/repositories/education.repository';
import type { ListEducationDto } from '../dto/education.dto';

export type ListEducationQueryDeps = {
  educationRepository: EducationRepositoryPort;
};

/**
 * Paginated list of non-deleted Education.
 */
export class ListEducationQuery {
  constructor(private readonly deps: ListEducationQueryDeps) {}

  async execute(input: ListEducationDto): Promise<EducationListResult> {
    const page = Math.max(1, input.page);
    const limit = Math.min(100, Math.max(1, input.limit));
    return this.deps.educationRepository.list(page, limit);
  }
}
