import type { AuditPort } from '@/shared/infrastructure/audit';

import { ServiceForbiddenError, ServiceNotFoundError } from '../../domain/errors/service.errors';
import type { ServiceRepositoryPort } from '../../domain/repositories/service.repository';
import type { DeleteServiceDto } from '../dto/service.dto';

export type DeleteServiceCommandDeps = {
  serviceRepository: ServiceRepositoryPort;
  audit?: AuditPort;
};

/**
 * Soft-deletes a Service. Owner or admin (`:any`) may delete.
 */
export class DeleteServiceCommand {
  constructor(private readonly deps: DeleteServiceCommandDeps) {}

  async execute(input: DeleteServiceDto): Promise<void> {
    const existing = await this.deps.serviceRepository.findById(input.id);
    if (!existing) {
      throw new ServiceNotFoundError();
    }

    if (!input.isAdmin && existing.ownerId !== input.actorId) {
      throw new ServiceForbiddenError();
    }

    await this.deps.serviceRepository.update(input.id, { deletedAt: new Date() });
    await this.deps.audit?.record({
      actorId: input.actorId,
      action: 'service.delete',
      resource: 'service',
      resourceId: input.id,
    });
  }
}
