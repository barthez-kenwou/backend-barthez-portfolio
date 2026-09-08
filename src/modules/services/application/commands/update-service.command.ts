import type { AuditPort } from '@/shared/infrastructure/audit';

import type { ServiceEntity } from '../../domain/entities/service.entity';
import { ServiceForbiddenError, ServiceNotFoundError } from '../../domain/errors/service.errors';
import type { ServiceRepositoryPort } from '../../domain/repositories/service.repository';
import type { UpdateServiceDto } from '../dto/service.dto';

export type UpdateServiceCommandDeps = {
  serviceRepository: ServiceRepositoryPort;
  audit?: AuditPort;
};

/**
 * Updates a Service. Owner or admin may mutate (admins bypass ownership).
 */
export class UpdateServiceCommand {
  constructor(private readonly deps: UpdateServiceCommandDeps) {}

  async execute(input: UpdateServiceDto): Promise<ServiceEntity> {
    const existing = await this.deps.serviceRepository.findById(input.id);
    if (!existing) {
      throw new ServiceNotFoundError();
    }

    if (!input.isAdmin && existing.ownerId !== input.actorId) {
      throw new ServiceForbiddenError();
    }

    const updated = await this.deps.serviceRepository.update(input.id, {
      ...(input.iconKey !== undefined ? { iconKey: input.iconKey.trim() } : {}),
      ...(input.titleFr !== undefined ? { titleFr: input.titleFr.trim() } : {}),
      ...(input.titleEn !== undefined ? { titleEn: input.titleEn.trim() } : {}),
      ...(input.descFr !== undefined ? { descFr: input.descFr.trim() } : {}),
      ...(input.descEn !== undefined ? { descEn: input.descEn.trim() } : {}),
      ...(input.featuresFr !== undefined
        ? { featuresFr: input.featuresFr.map((s) => s.trim()).filter(Boolean) }
        : {}),
      ...(input.featuresEn !== undefined
        ? { featuresEn: input.featuresEn.map((s) => s.trim()).filter(Boolean) }
        : {}),
      ...(input.priceEur !== undefined ? { priceEur: input.priceEur } : {}),
      ...(input.hourly !== undefined ? { hourly: input.hourly } : {}),
      ...(input.priceFr !== undefined ? { priceFr: input.priceFr.trim() } : {}),
      ...(input.priceEn !== undefined ? { priceEn: input.priceEn.trim() } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.isPublished !== undefined ? { isPublished: input.isPublished } : {}),
    });

    await this.deps.audit?.record({
      actorId: input.actorId,
      action: 'service.update',
      resource: 'service',
      resourceId: input.id,
    });

    return updated;
  }
}
