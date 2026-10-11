import type { AuditPort } from '@/shared/infrastructure/audit';

import { PartnerForbiddenError, PartnerNotFoundError } from '../../domain/errors/partner.errors';
import type { PartnerRepositoryPort } from '../../domain/repositories/partner.repository';
import type { DeletePartnerDto } from '../dto/partner.dto';

export type DeletePartnerCommandDeps = {
  partnerRepository: PartnerRepositoryPort;
  audit?: AuditPort;
};

export class DeletePartnerCommand {
  constructor(private readonly deps: DeletePartnerCommandDeps) {}

  async execute(input: DeletePartnerDto): Promise<void> {
    const existing = await this.deps.partnerRepository.findById(input.id);
    if (!existing) {
      throw new PartnerNotFoundError();
    }

    if (!input.isAdmin && existing.ownerId !== input.actorId) {
      throw new PartnerForbiddenError();
    }

    await this.deps.partnerRepository.update(input.id, { deletedAt: new Date() });
    await this.deps.audit?.record({
      actorId: input.actorId,
      action: 'partner.delete',
      resource: 'partner',
      resourceId: input.id,
    });
  }
}
