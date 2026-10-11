import type { PartnerEntity } from '../../domain/entities/partner.entity';
import { PartnerNotFoundError } from '../../domain/errors/partner.errors';
import type { PartnerRepositoryPort } from '../../domain/repositories/partner.repository';
import type { GetPartnerDto } from '../dto/partner.dto';

export type GetPartnerQueryDeps = {
  partnerRepository: PartnerRepositoryPort;
};

export class GetPartnerQuery {
  constructor(private readonly deps: GetPartnerQueryDeps) {}

  async execute(input: GetPartnerDto): Promise<PartnerEntity> {
    const item = await this.deps.partnerRepository.findById(input.id);
    if (!item) {
      throw new PartnerNotFoundError();
    }
    return item;
  }
}
