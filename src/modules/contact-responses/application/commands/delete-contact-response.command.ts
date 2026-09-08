import type { AuditPort } from '@/shared/infrastructure/audit';

import { ContactResponseNotFoundError } from '../../domain/errors/contact-response.errors';
import type { ContactResponseRepositoryPort } from '../../domain/repositories/contact-response.repository';
import type { DeleteContactResponseDto } from '../dto/contact-response.dto';

export type DeleteContactResponseCommandDeps = {
  contactResponseRepository: ContactResponseRepositoryPort;
  audit?: AuditPort;
};

/**
 * Soft-deletes a Contact Response (admin-only via route permissions).
 */
export class DeleteContactResponseCommand {
  constructor(private readonly deps: DeleteContactResponseCommandDeps) {}

  async execute(input: DeleteContactResponseDto): Promise<void> {
    const existing = await this.deps.contactResponseRepository.findById(input.id);
    if (!existing) {
      throw new ContactResponseNotFoundError();
    }

    await this.deps.contactResponseRepository.update(input.id, { deletedAt: new Date() });
    await this.deps.audit?.record({
      actorId: input.actorId,
      action: 'contact_response.delete',
      resource: 'contact_response',
      resourceId: input.id,
    });
  }
}
