import type { ReferenceEntity } from '../../domain/entities/reference.entity';
import { ReferenceNotFoundError } from '../../domain/errors/reference.errors';
import type { ReferenceRepositoryPort } from '../../domain/repositories/reference.repository';
import type { GetReferenceDto } from '../dto/reference.dto';

export type GetReferenceQueryDeps = {
  referenceRepository: ReferenceRepositoryPort;
};

/**
 * Fetches a single non-deleted Reference by id.
 */
export class GetReferenceQuery {
  constructor(private readonly deps: GetReferenceQueryDeps) {}

  async execute(input: GetReferenceDto): Promise<ReferenceEntity> {
    const item = await this.deps.referenceRepository.findById(input.id);
    if (!item) {
      throw new ReferenceNotFoundError();
    }
    return item;
  }
}
