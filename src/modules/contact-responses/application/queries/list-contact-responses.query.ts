import type { ContactResponseListResult } from '../../domain/entities/contact-response.entity';
import type { ContactResponseRepositoryPort } from '../../domain/repositories/contact-response.repository';
import type { ListContactResponsesDto } from '../dto/contact-response.dto';

export type ListContactResponsesQueryDeps = {
  contactResponseRepository: ContactResponseRepositoryPort;
};

/**
 * Paginated admin list of non-deleted Contact Responses.
 */
export class ListContactResponsesQuery {
  constructor(private readonly deps: ListContactResponsesQueryDeps) {}

  async execute(input: ListContactResponsesDto): Promise<ContactResponseListResult> {
    const page = Math.max(1, input.page);
    const limit = Math.min(100, Math.max(1, input.limit));
    return this.deps.contactResponseRepository.list({
      page,
      limit,
      status: input.status,
    });
  }
}
