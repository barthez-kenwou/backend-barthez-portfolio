import type { AuditPort } from '@/shared/infrastructure/audit';

import { ContactInfoNotFoundError } from '../../domain/errors/contact-info.errors';
import type { ContactInfoRepositoryPort } from '../../domain/repositories/contact-info.repository';
import type { DeleteContactInfoDto } from '../dto/contact-info.dto';

export type DeleteContactInfoCommandDeps = {
  contactInfoRepository: ContactInfoRepositoryPort;
  audit?: AuditPort;
};

const DEFAULT_SINGLETON_KEY = 'default';

/**
 * Soft-deletes the singleton Contact Info (admin-only via route permissions).
 */
export class DeleteContactInfoCommand {
  constructor(private readonly deps: DeleteContactInfoCommandDeps) {}

  async execute(input: DeleteContactInfoDto): Promise<void> {
    const key = (input.singletonKey?.trim() || DEFAULT_SINGLETON_KEY).toLowerCase();
    const existing = await this.deps.contactInfoRepository.findBySingletonKey(key);
    if (!existing) {
      throw new ContactInfoNotFoundError();
    }

    await this.deps.contactInfoRepository.softDelete(existing.id);
    await this.deps.audit?.record({
      actorId: input.actorId,
      action: 'contact_info.delete',
      resource: 'contact_info',
      resourceId: existing.id,
    });
  }
}
