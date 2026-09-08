import type { AuditPort } from '@/shared/infrastructure/audit';

import type { ServiceEntity } from '../../domain/entities/service.entity';
import type { ServiceRepositoryPort } from '../../domain/repositories/service.repository';
import type { CreateServiceDto } from '../dto/service.dto';

export type CreateServiceCommandDeps = {
  serviceRepository: ServiceRepositoryPort;
  audit?: AuditPort;
};

/**
 * Creates a Service owned by the authenticated actor.
 */
export class CreateServiceCommand {
  constructor(private readonly deps: CreateServiceCommandDeps) {}

  async execute(input: CreateServiceDto): Promise<ServiceEntity> {
    const created = await this.deps.serviceRepository.create({
      iconKey: input.iconKey.trim(),
      titleFr: input.titleFr.trim(),
      titleEn: input.titleEn.trim(),
      descFr: input.descFr.trim(),
      descEn: input.descEn.trim(),
      featuresFr: input.featuresFr.map((s) => s.trim()).filter(Boolean),
      featuresEn: input.featuresEn.map((s) => s.trim()).filter(Boolean),
      priceEur: input.priceEur,
      hourly: input.hourly ?? false,
      priceFr: input.priceFr.trim(),
      priceEn: input.priceEn.trim(),
      sortOrder: input.sortOrder ?? 0,
      isPublished: input.isPublished ?? true,
      ownerId: input.ownerId,
    });

    await this.deps.audit?.record({
      actorId: input.ownerId,
      action: 'service.create',
      resource: 'service',
      resourceId: created.id,
    });

    return created;
  }
}
