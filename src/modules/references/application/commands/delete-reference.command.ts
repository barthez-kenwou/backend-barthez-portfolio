import type { AuditPort } from '@/shared/infrastructure/audit';

import {
  ReferenceForbiddenError,
  ReferenceNotFoundError,
} from '../../domain/errors/reference.errors';
import type { ReferenceRepositoryPort } from '../../domain/repositories/reference.repository';
import type { DeleteReferenceDto } from '../dto/reference.dto';

export type DeleteReferenceCommandDeps = {
  referenceRepository: ReferenceRepositoryPort;
  audit?: AuditPort;
};

/**
 * Soft-deletes a Reference. Owner or admin (`:any`) may delete.
 */
export class DeleteReferenceCommand {
  constructor(private readonly deps: DeleteReferenceCommandDeps) {}

  async execute(input: DeleteReferenceDto): Promise<void> {
    const existing = await this.deps.referenceRepository.findById(input.id);
    if (!existing) {
      throw new ReferenceNotFoundError();
    }

    if (!input.isAdmin && existing.ownerId !== input.actorId) {
      throw new ReferenceForbiddenError();
    }

    await this.deps.referenceRepository.update(input.id, { deletedAt: new Date() });
    await this.deps.audit?.record({
      actorId: input.actorId,
      action: 'reference.delete',
      resource: 'reference',
      resourceId: input.id,
    });
  }
}
