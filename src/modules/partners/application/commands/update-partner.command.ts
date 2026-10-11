import type { AuditPort } from '@/shared/infrastructure/audit';

import type { PartnerEntity } from '../../domain/entities/partner.entity';
import { PartnerForbiddenError, PartnerNotFoundError } from '../../domain/errors/partner.errors';
import type { PartnerRepositoryPort } from '../../domain/repositories/partner.repository';
import type { UpdatePartnerDto } from '../dto/partner.dto';

export type UpdatePartnerCommandDeps = {
  partnerRepository: PartnerRepositoryPort;
  audit?: AuditPort;
};

export class UpdatePartnerCommand {
  constructor(private readonly deps: UpdatePartnerCommandDeps) {}

  async execute(input: UpdatePartnerDto): Promise<PartnerEntity> {
    const existing = await this.deps.partnerRepository.findById(input.id);
    if (!existing) {
      throw new PartnerNotFoundError();
    }

    if (!input.isAdmin && existing.ownerId !== input.actorId) {
      throw new PartnerForbiddenError();
    }

    const trimOrNull = (value: string | null | undefined) => {
      if (value === undefined) return undefined;
      if (value === null) return null;
      const trimmed = value.trim();
      return trimmed.length ? trimmed : null;
    };

    const updated = await this.deps.partnerRepository.update(input.id, {
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.logoUrl !== undefined ? { logoUrl: input.logoUrl.trim() } : {}),
      ...(input.websiteUrl !== undefined ? { websiteUrl: trimOrNull(input.websiteUrl) } : {}),
      ...(input.descriptionFr !== undefined
        ? { descriptionFr: trimOrNull(input.descriptionFr) }
        : {}),
      ...(input.descriptionEn !== undefined
        ? { descriptionEn: trimOrNull(input.descriptionEn) }
        : {}),
      ...(input.relationFr !== undefined ? { relationFr: trimOrNull(input.relationFr) } : {}),
      ...(input.relationEn !== undefined ? { relationEn: trimOrNull(input.relationEn) } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.isPublished !== undefined ? { isPublished: input.isPublished } : {}),
    });

    await this.deps.audit?.record({
      actorId: input.actorId,
      action: 'partner.update',
      resource: 'partner',
      resourceId: input.id,
    });

    return updated;
  }
}
