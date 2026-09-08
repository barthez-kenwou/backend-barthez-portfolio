import type { ContactInfoEntity } from '../../domain/entities/contact-info.entity';
import { ContactInfoNotFoundError } from '../../domain/errors/contact-info.errors';
import type { ContactInfoRepositoryPort } from '../../domain/repositories/contact-info.repository';
import type { GetContactInfoDto } from '../dto/contact-info.dto';

export type GetContactInfoQueryDeps = {
  contactInfoRepository: ContactInfoRepositoryPort;
};

const DEFAULT_SINGLETON_KEY = 'default';

/**
 * Fetches the non-deleted singleton Contact Info by key (default: "default").
 */
export class GetContactInfoQuery {
  constructor(private readonly deps: GetContactInfoQueryDeps) {}

  async execute(input: GetContactInfoDto = {}): Promise<ContactInfoEntity> {
    const key = (input.singletonKey?.trim() || DEFAULT_SINGLETON_KEY).toLowerCase();
    const item = await this.deps.contactInfoRepository.findBySingletonKey(key);
    if (!item) {
      throw new ContactInfoNotFoundError();
    }
    return item;
  }
}
