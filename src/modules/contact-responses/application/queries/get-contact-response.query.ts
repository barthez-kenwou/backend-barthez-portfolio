import type { ContactResponseEntity } from '../../domain/entities/contact-response.entity';
import { ContactResponseNotFoundError } from '../../domain/errors/contact-response.errors';
import type { ContactResponseRepositoryPort } from '../../domain/repositories/contact-response.repository';
import type { GetContactResponseDto } from '../dto/contact-response.dto';

export type GetContactResponseQueryDeps = {
  contactResponseRepository: ContactResponseRepositoryPort;
};

/**
 * Fetches a Contact Response; optionally auto-marks `new` → `read`.
 */
export class GetContactResponseQuery {
  constructor(private readonly deps: GetContactResponseQueryDeps) {}

  async execute(input: GetContactResponseDto): Promise<ContactResponseEntity> {
    const item = await this.deps.contactResponseRepository.findById(input.id);
    if (!item) {
      throw new ContactResponseNotFoundError();
    }

    if (input.markReadIfNew && item.status === 'new') {
      return this.deps.contactResponseRepository.update(input.id, { status: 'read' });
    }

    return item;
  }
}
