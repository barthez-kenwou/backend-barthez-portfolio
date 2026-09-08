import type {
  ContactResponseEntity,
  ContactResponseListFilters,
  ContactResponseListResult,
  CreateContactResponseInput,
  UpdateContactResponseInput,
} from '../entities/contact-response.entity';

/**
 * Port for Contact Response persistence.
 */
export interface ContactResponseRepositoryPort {
  create(data: CreateContactResponseInput): Promise<ContactResponseEntity>;
  findById(id: string): Promise<ContactResponseEntity | null>;
  list(filters: ContactResponseListFilters): Promise<ContactResponseListResult>;
  update(id: string, data: UpdateContactResponseInput): Promise<ContactResponseEntity>;
}
