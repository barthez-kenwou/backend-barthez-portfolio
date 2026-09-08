import type { ServiceListResult } from '../../domain/entities/service.entity';
import type { ServiceRepositoryPort } from '../../domain/repositories/service.repository';
import type { ListServicesDto } from '../dto/service.dto';

export type ListServicesQueryDeps = {
  serviceRepository: ServiceRepositoryPort;
};

/**
 * Paginated list of non-deleted Services.
 */
export class ListServicesQuery {
  constructor(private readonly deps: ListServicesQueryDeps) {}

  async execute(input: ListServicesDto): Promise<ServiceListResult> {
    const page = Math.max(1, input.page);
    const limit = Math.min(100, Math.max(1, input.limit));
    return this.deps.serviceRepository.list(page, limit);
  }
}
