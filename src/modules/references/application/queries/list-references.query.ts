import type { ReferenceListResult } from '../../domain/entities/reference.entity';
import type { ReferenceRepositoryPort } from '../../domain/repositories/reference.repository';
import type { ListReferencesDto } from '../dto/reference.dto';

export type ListReferencesQueryDeps = {
  referenceRepository: ReferenceRepositoryPort;
};

/**
 * Paginated list of non-deleted References.
 */
export class ListReferencesQuery {
  constructor(private readonly deps: ListReferencesQueryDeps) {}

  async execute(input: ListReferencesDto): Promise<ReferenceListResult> {
    const page = Math.max(1, input.page);
    const limit = Math.min(100, Math.max(1, input.limit));
    return this.deps.referenceRepository.list(page, limit);
  }
}
