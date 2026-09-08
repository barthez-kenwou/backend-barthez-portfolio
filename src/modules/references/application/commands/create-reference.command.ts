import type { AuditPort } from '@/shared/infrastructure/audit';

import type { ReferenceEntity } from '../../domain/entities/reference.entity';
import type { ReferenceRepositoryPort } from '../../domain/repositories/reference.repository';
import type { CreateReferenceDto } from '../dto/reference.dto';

export type CreateReferenceCommandDeps = {
  referenceRepository: ReferenceRepositoryPort;
  audit?: AuditPort;
};

/**
 * Creates a Reference owned by the authenticated actor.
 */
export class CreateReferenceCommand {
  constructor(private readonly deps: CreateReferenceCommandDeps) {}

  async execute(input: CreateReferenceDto): Promise<ReferenceEntity> {
    const created = await this.deps.referenceRepository.create({
      name: input.name.trim(),
      roleFr: input.roleFr.trim(),
      roleEn: input.roleEn.trim(),
      company: input.company.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      sortOrder: input.sortOrder ?? 0,
      ownerId: input.ownerId,
    });

    await this.deps.audit?.record({
      actorId: input.ownerId,
      action: 'reference.create',
      resource: 'reference',
      resourceId: created.id,
    });

    return created;
  }
}
