import type { AuditPort } from '@/shared/infrastructure/audit';

import type { CertificationEntity } from '../../domain/entities/certification.entity';
import {
  CertificationForbiddenError,
  CertificationNotFoundError,
} from '../../domain/errors/certification.errors';
import type { CertificationRepositoryPort } from '../../domain/repositories/certification.repository';
import type { UpdateCertificationDto } from '../dto/certification.dto';

export type UpdateCertificationCommandDeps = {
  certificationRepository: CertificationRepositoryPort;
  audit?: AuditPort;
};

/**
 * Updates a Certification. Owner or admin may mutate (admins bypass ownership).
 */
export class UpdateCertificationCommand {
  constructor(private readonly deps: UpdateCertificationCommandDeps) {}

  async execute(input: UpdateCertificationDto): Promise<CertificationEntity> {
    const existing = await this.deps.certificationRepository.findById(input.id);
    if (!existing) {
      throw new CertificationNotFoundError();
    }

    if (!input.isAdmin && existing.ownerId !== input.actorId) {
      throw new CertificationForbiddenError();
    }

    const updated = await this.deps.certificationRepository.update(input.id, {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.issuer !== undefined ? { issuer: input.issuer.trim() } : {}),
      ...(input.year !== undefined ? { year: input.year.trim() } : {}),
      ...(input.link !== undefined ? { link: input.link?.trim() || null } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
    });

    await this.deps.audit?.record({
      actorId: input.actorId,
      action: 'certification.update',
      resource: 'certification',
      resourceId: input.id,
    });

    return updated;
  }
}
