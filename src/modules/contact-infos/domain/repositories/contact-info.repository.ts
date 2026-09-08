import type {
  ContactInfoEntity,
  UpdateContactInfoInput,
  UpsertContactInfoInput,
} from '../entities/contact-info.entity';

/**
 * Port for Contact Info persistence — singleton keyed by `singletonKey`.
 */
export interface ContactInfoRepositoryPort {
  findBySingletonKey(key: string): Promise<ContactInfoEntity | null>;
  findById(id: string): Promise<ContactInfoEntity | null>;
  upsertBySingletonKey(key: string, data: UpsertContactInfoInput): Promise<ContactInfoEntity>;
  update(id: string, data: UpdateContactInfoInput): Promise<ContactInfoEntity>;
  softDelete(id: string): Promise<ContactInfoEntity>;
}
