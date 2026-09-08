import type { AuditPort } from '@/shared/infrastructure/audit';

import type {
  ContactResponseEntity,
  UpdateContactResponseInput,
} from '../../domain/entities/contact-response.entity';
import { ContactResponseNotFoundError } from '../../domain/errors/contact-response.errors';
import type { ContactResponseRepositoryPort } from '../../domain/repositories/contact-response.repository';
import type { UpdateContactResponseDto } from '../dto/contact-response.dto';

export type UpdateContactResponseCommandDeps = {
  contactResponseRepository: ContactResponseRepositoryPort;
  audit?: AuditPort;
};

/**
 * Admin update of a contact message (status, notes, fields).
 * Ownership is not checked — gated by route permissions.
 */
export class UpdateContactResponseCommand {
  constructor(private readonly deps: UpdateContactResponseCommandDeps) {}

  async execute(input: UpdateContactResponseDto): Promise<ContactResponseEntity> {
    const existing = await this.deps.contactResponseRepository.findById(input.id);
    if (!existing) {
      throw new ContactResponseNotFoundError();
    }

    const { id: _id, actorId: _actorId, ...patch } = input;
    const data: UpdateContactResponseInput = {
      ...(patch.name !== undefined ? { name: patch.name.trim() } : {}),
      ...(patch.email !== undefined ? { email: patch.email.trim().toLowerCase() } : {}),
      ...(patch.subject !== undefined ? { subject: patch.subject.trim() } : {}),
      ...(patch.message !== undefined ? { message: patch.message.trim() } : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      ...(patch.notes !== undefined ? { notes: patch.notes?.trim() || null } : {}),
    };

    const updated = await this.deps.contactResponseRepository.update(input.id, data);

    await this.deps.audit?.record({
      actorId: input.actorId,
      action: 'contact_response.update',
      resource: 'contact_response',
      resourceId: input.id,
    });

    return updated;
  }
}
