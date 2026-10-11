import type { PartnerListResult } from '../../domain/entities/partner.entity';
import type { PartnerRepositoryPort } from '../../domain/repositories/partner.repository';
import type { ListPartnersDto } from '../dto/partner.dto';

export type ListPartnersQueryDeps = {
  partnerRepository: PartnerRepositoryPort;
};

/**
 * Paginated list of non-deleted Partners.
 * Public default: published only. Admin passes includeUnpublished=true.
 */
export class ListPartnersQuery {
  constructor(private readonly deps: ListPartnersQueryDeps) {}

  async execute(input: ListPartnersDto): Promise<PartnerListResult> {
    const page = Math.max(1, input.page);
    const limit = Math.min(100, Math.max(1, input.limit));
    const isPublished = input.includeUnpublished ? input.isPublished : true;
    return this.deps.partnerRepository.list({ page, limit, isPublished });
  }
}
