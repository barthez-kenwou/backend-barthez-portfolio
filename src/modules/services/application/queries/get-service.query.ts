import type { ServiceEntity } from '../../domain/entities/service.entity';
import { ServiceNotFoundError } from '../../domain/errors/service.errors';
import type { ServiceRepositoryPort } from '../../domain/repositories/service.repository';
import type { GetServiceDto } from '../dto/service.dto';

export type GetServiceQueryDeps = {
  serviceRepository: ServiceRepositoryPort;
};

/**
 * Fetches a single non-deleted Service by id.
 */
export class GetServiceQuery {
  constructor(private readonly deps: GetServiceQueryDeps) {}

  async execute(input: GetServiceDto): Promise<ServiceEntity> {
    const item = await this.deps.serviceRepository.findById(input.id);
    if (!item) {
      throw new ServiceNotFoundError();
    }
    return item;
  }
}
