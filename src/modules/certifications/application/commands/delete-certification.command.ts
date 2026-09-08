import type { AuditPort } from '@/shared/infrastructure/audit';

import {
  CertificationForbiddenError,
  CertificationNotFoundError,
} from '../../domain/errors/certification.errors';
import type { CertificationRepositoryPort } from '../../domain/repositories/certification.repository';
import type { DeleteCertificationDto } from '../dto/certification.dto';

export type DeleteCertificationCommandDeps = {
  certificationRepository: CertificationRepositoryPort;
  audit?: AuditPort;
};

/**
 * Soft-deletes a Certification. Owner or admin (`:any`) may delete.
 */
export class DeleteCertificationCommand {
  constructor(private readonly deps: DeleteCertificationCommandDeps) {}

  async execute(input: DeleteCertificationDto): Promise<void> {
    const existing = await this.deps.certificationRepository.findById(input.id);
    if (!existing) {
      throw new CertificationNotFoundError();
    }

    if (!input.isAdmin && existing.ownerId !== input.actorId) {
      throw new CertificationForbiddenError();
    }

    await this.deps.certificationRepository.update(input.id, { deletedAt: new Date() });
    await this.deps.audit?.record({
      actorId: input.actorId,
      action: 'certification.delete',
      resource: 'certification',
      resourceId: input.id,
    });
  }
}
