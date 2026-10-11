import type { AuditPort } from '@/shared/infrastructure/audit';

import type { PartnerEntity } from '../../domain/entities/partner.entity';
import type { PartnerRepositoryPort } from '../../domain/repositories/partner.repository';
import type { CreatePartnerDto } from '../dto/partner.dto';

export type CreatePartnerCommandDeps = {
  partnerRepository: PartnerRepositoryPort;
  audit?: AuditPort;
};

export class CreatePartnerCommand {
  constructor(private readonly deps: CreatePartnerCommandDeps) {}

  async execute(input: CreatePartnerDto): Promise<PartnerEntity> {
    const created = await this.deps.partnerRepository.create({
      name: input.name.trim(),
      logoUrl: input.logoUrl.trim(),
      websiteUrl: input.websiteUrl?.trim() || null,
      descriptionFr: input.descriptionFr?.trim() || null,
      descriptionEn: input.descriptionEn?.trim() || null,
      relationFr: input.relationFr?.trim() || null,
      relationEn: input.relationEn?.trim() || null,
      sortOrder: input.sortOrder ?? 0,
      isPublished: input.isPublished ?? true,
      ownerId: input.ownerId,
    });

    await this.deps.audit?.record({
      actorId: input.ownerId,
      action: 'partner.create',
      resource: 'partner',
      resourceId: created.id,
    });

    return created;
  }
}
