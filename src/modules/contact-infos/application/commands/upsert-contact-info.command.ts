import type { AuditPort } from '@/shared/infrastructure/audit';

import type { ContactInfoEntity } from '../../domain/entities/contact-info.entity';
import type { ContactInfoRepositoryPort } from '../../domain/repositories/contact-info.repository';
import type { UpsertContactInfoDto } from '../dto/contact-info.dto';

export type UpsertContactInfoCommandDeps = {
  contactInfoRepository: ContactInfoRepositoryPort;
  audit?: AuditPort;
};

const DEFAULT_SINGLETON_KEY = 'default';

/**
 * Admin upsert of the singleton contact profile (create if missing).
 */
export class UpsertContactInfoCommand {
  constructor(private readonly deps: UpsertContactInfoCommandDeps) {}

  async execute(input: UpsertContactInfoDto): Promise<ContactInfoEntity> {
    const key = (input.singletonKey?.trim() || DEFAULT_SINGLETON_KEY).toLowerCase();

    const upserted = await this.deps.contactInfoRepository.upsertBySingletonKey(key, {
      singletonKey: key,
      name: input.name.trim(),
      handle: input.handle.trim(),
      titleFr: input.titleFr.trim(),
      titleEn: input.titleEn.trim(),
      subtitleFr: input.subtitleFr.trim(),
      subtitleEn: input.subtitleEn.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      whatsappLink: input.whatsappLink.trim(),
      location: input.location.trim(),
      website: input.website.trim(),
      repository: input.repository.trim(),
      github: input.github.trim(),
      linkedin: input.linkedin.trim(),
      facebook: input.facebook.trim(),
      photoUrl: input.photoUrl?.trim() || null,
      yearsExperience: input.yearsExperience ?? null,
      tags: input.tags ?? [],
    });

    await this.deps.audit?.record({
      actorId: input.actorId,
      action: 'contact_info.upsert',
      resource: 'contact_info',
      resourceId: upserted.id,
    });

    return upserted;
  }
}
