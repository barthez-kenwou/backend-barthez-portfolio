import type {
  CreateServiceInput,
  ServiceEntity,
  ServiceListFilters,
  ServiceListResult,
  UpdateServiceInput,
} from '../entities/service.entity';

/**
 * Port for Service persistence required by use cases.
 * Infrastructure provides a Prisma implementation.
 */
export interface ServiceRepositoryPort {
  create(data: CreateServiceInput): Promise<ServiceEntity>;
  findById(id: string): Promise<ServiceEntity | null>;
  list(filters: ServiceListFilters): Promise<ServiceListResult>;
  update(id: string, data: UpdateServiceInput): Promise<ServiceEntity>;
}
