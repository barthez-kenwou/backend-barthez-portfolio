import type { AuditPort } from '@/shared/infrastructure/audit';

import type { ReferenceEntity } from '../../domain/entities/reference.entity';
import {
  ReferenceForbiddenError,
  ReferenceNotFoundError,
} from '../../domain/errors/reference.errors';
import type { ReferenceRepositoryPort } from '../../domain/repositories/reference.repository';
import type { UpdateReferenceDto } from '../dto/reference.dto';

export type UpdateReferenceCommandDeps = {
  referenceRepository: ReferenceRepositoryPort;
  audit?: AuditPort;
};

/**
 * Updates a Reference. Owner or admin may mutate (admins bypass ownership).
 */
export class UpdateReferenceCommand {
  constructor(private readonly deps: UpdateReferenceCommandDeps) {}

  async execute(input: UpdateReferenceDto): Promise<ReferenceEntity> {
    const existing = await this.deps.referenceRepository.findById(input.id);
    if (!existing) {
      throw new ReferenceNotFoundError();
    }

    if (!input.isAdmin && existing.ownerId !== input.actorId) {
      throw new ReferenceForbiddenError();
    }

    const updated = await this.deps.referenceRepository.update(input.id, {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.roleFr !== undefined ? { roleFr: input.roleFr.trim() } : {}),
      ...(input.roleEn !== undefined ? { roleEn: input.roleEn.trim() } : {}),
      ...(input.company !== undefined ? { company: input.company.trim() } : {}),
      ...(input.email !== undefined ? { email: input.email.trim() } : {}),
      ...(input.phone !== undefined ? { phone: input.phone.trim() } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
    });

    await this.deps.audit?.record({
      actorId: input.actorId,
      action: 'reference.update',
      resource: 'reference',
      resourceId: input.id,
    });

    return updated;
  }
}
