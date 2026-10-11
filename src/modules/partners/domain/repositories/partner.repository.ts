import type {
  CreatePartnerInput,
  PartnerEntity,
  PartnerListFilters,
  PartnerListResult,
  UpdatePartnerInput,
} from '../entities/partner.entity';

export interface PartnerRepositoryPort {
  create(data: CreatePartnerInput): Promise<PartnerEntity>;
  findById(id: string): Promise<PartnerEntity | null>;
  list(filters: PartnerListFilters): Promise<PartnerListResult>;
  update(id: string, data: UpdatePartnerInput): Promise<PartnerEntity>;
}
