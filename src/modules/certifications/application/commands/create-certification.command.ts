import type { AuditPort } from '@/shared/infrastructure/audit';

import type { CertificationEntity } from '../../domain/entities/certification.entity';
import type { CertificationRepositoryPort } from '../../domain/repositories/certification.repository';
import type { CreateCertificationDto } from '../dto/certification.dto';

export type CreateCertificationCommandDeps = {
  certificationRepository: CertificationRepositoryPort;
  audit?: AuditPort;
};

/**
 * Creates a Certification owned by the authenticated actor.
 */
export class CreateCertificationCommand {
  constructor(private readonly deps: CreateCertificationCommandDeps) {}

  async execute(input: CreateCertificationDto): Promise<CertificationEntity> {
    const created = await this.deps.certificationRepository.create({
      name: input.name.trim(),
      issuer: input.issuer.trim(),
      year: input.year.trim(),
      link: input.link?.trim() || null,
      sortOrder: input.sortOrder ?? 0,
      ownerId: input.ownerId,
    });

    await this.deps.audit?.record({
      actorId: input.ownerId,
      action: 'certification.create',
      resource: 'certification',
      resourceId: created.id,
    });

    return created;
  }
}
